import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useMotionValue, useSpring, useReducedMotion } from 'framer-motion';

/**
 * ─── CONSTANTES DE GESTE (tout se règle ici) ────────────────────────────
 * Ce sont les seuls chiffres à toucher pour changer le « feeling » du swipe.
 */
const SWIPE = {
  /** distance en px au-delà de laquelle on change de carte au relâchement */
  DISTANCE_THRESHOLD: 60,
  /** vitesse en px/s : un flick rapide et court doit suffire */
  VELOCITY_THRESHOLD: 420,
  /** largeur d'un « cran » : distance de doigt qui vaut exactement 1 carte */
  STEP: 150,
  /** résistance élastique en bout de catégorie (delta divisé par ce facteur) */
  RUBBER_BAND: 3,
  /** ressort de repos du chariot */
  SPRING: { type: 'spring', stiffness: 320, damping: 34, mass: 0.9 },
};

/** Transformations du fan. Modifier ici pour resserrer/écarter l'éventail. */
const FAN = {
  ROTATE: 4, // deg par cran
  X_RATIO: 0.1, // × largeur de carte, par cran (≈26px sur une carte de 260)
  X_RATIO_WIDE: 0.16, // tablette : plus de place, on écarte l'éventail
  Y_RATIO: 0.028, // × hauteur de carte, par cran (≈10px sur une carte de 360)
  SCALE: 0.07, // perte d'échelle par cran
  OPACITY: 0.34, // perte d'opacité par cran
  BLUR: 2.5, // px de flou par cran
  BLUR_MAX: 6,
  SCRIM: 0.22, // voile sombre par cran sur les cartes non actives
  TEXT_FADE: 1.6, // au-delà de |progress| = 1.6, le texte disparaît
  VISIBLE: 3, // |offset| max monté dans le DOM
  ORIGIN: '50% 130%', // pivot sous la carte → c'est ce qui crée l'éventail
};

/**
 * Gère l'index actif + la position continue du doigt.
 *
 * `dragProgress` est une motion value exprimée en « cartes » (0.4 = le doigt a
 * parcouru 40 % d'un cran). Les cartes s'en servent pour suivre le doigt en
 * temps réel, sans re-render React.
 *
 * @param {number} count      nombre de cartes de la catégorie courante
 * @param {object} handlers   { onOverflowNext, onOverflowPrev } → catégories
 */
const useSwipe = (count, { onOverflowNext, onOverflowPrev, onIndexChange } = {}) => {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);

  // Position continue du chariot, en unités de « carte ».
  const raw = useMotionValue(0);
  const dragProgress = useSpring(raw,
    reduceMotion ? { duration: 0 } : SWIPE.SPRING);

  // Refs pour ne jamais désynchroniser index et animation lors de flicks rapides.
  const indexRef = useRef(0);
  const countRef = useRef(count);
  useEffect(() => {
    indexRef.current = index;
    countRef.current = count;
  }, [index, count]);

  // Changement de catégorie → on remet le chariot à zéro proprement.
  const reset = useCallback((nextIndex = 0) => {
    raw.jump ? raw.jump(0) : raw.set(0);
    dragProgress.jump ? dragProgress.jump(0) : dragProgress.set(0);
    setIndex(nextIndex);
  }, [raw, dragProgress]);

  const goTo = useCallback((next) => {
    const max = Math.max(countRef.current - 1, 0);
    const clamped = Math.min(Math.max(next, 0), max);
    // On met le ref à jour immédiatement : deux flicks rapprochés ne doivent
    // jamais repartir d'un index périmé (l'effet de sync arriverait trop tard).
    indexRef.current = clamped;
    setIndex(clamped);
    if (onIndexChange) onIndexChange(clamped);
    raw.set(0);
  }, [raw, onIndexChange]);

  const onPan = useCallback((_, info) => {
    const max = countRef.current - 1;
    const i = indexRef.current;
    let delta = info.offset.x;
    // Bout de liste : résistance élastique (sauf si un rollover est possible).
    const atStart = i === 0 && delta > 0;
    const atEnd = i === max && delta < 0;
    if ((atStart && !onOverflowPrev) || (atEnd && !onOverflowNext)) {
      delta /= SWIPE.RUBBER_BAND;
    } else if (atStart || atEnd) {
      delta /= 1.6; // rollover possible : résistance plus douce
    }
    raw.set(delta / SWIPE.STEP);
  }, [raw, onOverflowNext, onOverflowPrev]);

  const onPanEnd = useCallback((_, info) => {
    const max = countRef.current - 1;
    const i = indexRef.current;
    const { offset, velocity } = info;

    const wantsNext =
      offset.x < -SWIPE.DISTANCE_THRESHOLD || velocity.x < -SWIPE.VELOCITY_THRESHOLD;
    const wantsPrev =
      offset.x > SWIPE.DISTANCE_THRESHOLD || velocity.x > SWIPE.VELOCITY_THRESHOLD;

    if (wantsNext) {
      if (i < max) goTo(i + 1);
      else if (onOverflowNext) onOverflowNext();
    } else if (wantsPrev) {
      if (i > 0) goTo(i - 1);
      else if (onOverflowPrev) onOverflowPrev();
    }
    raw.set(0); // le ressort ramène le chariot, l'index a déjà bougé
  }, [raw, goTo, onOverflowNext, onOverflowPrev]);

  // Clavier : flèches gauche/droite.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight') goTo(indexRef.current + 1);
      else if (e.key === 'ArrowLeft') goTo(indexRef.current - 1);
      else return;
      e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goTo]);

  // Garde-fou : si la catégorie rétrécit, on borne l'index au rendu (pas d'effet
  // en cascade). L'état réel se recale au prochain geste via `goTo`.
  const safeIndex = Math.min(index, Math.max(count - 1, 0));

  return useMemo(
    () => ({
      index: safeIndex,
      setIndex: goTo,
      reset,
      dragProgress,
      onPan,
      onPanEnd,
      reduceMotion,
    }),
    [safeIndex, goTo, reset, dragProgress, onPan, onPanEnd, reduceMotion],
  );
};

export { SWIPE, FAN };
export default useSwipe;
