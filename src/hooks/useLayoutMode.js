import { useEffect, useState } from 'react';

/**
 * Trois dispositions, une seule montée à la fois :
 *  A « portrait »  — téléphone debout  (< 768px, pas de paysage court)
 *  B « landscape » — téléphone couché  (paysage, hauteur ≤ 500px)
 *  C « tablet »    — tablette          (≥ 768px de large)
 *
 * Les mêmes seuils sont déclarés en CSS dans index.css (variables --card-h &
 * consorts) : si vous changez une valeur ici, changez-la là-bas aussi.
 */
const QUERIES = {
  // B et C se chevauchent en largeur (un téléphone couché fait > 768px) :
  // la hauteur les départage, et B est testé en premier.
  landscape: '(orientation: landscape) and (max-height: 500px)',
  tablet: '(min-width: 768px) and (min-height: 501px)',
};

const read = () => {
  if (typeof window === 'undefined' || !window.matchMedia) return 'portrait';
  if (window.matchMedia(QUERIES.landscape).matches) return 'landscape';
  if (window.matchMedia(QUERIES.tablet).matches) return 'tablet';
  return 'portrait';
};

const useLayoutMode = () => {
  const [mode, setMode] = useState(read);

  useEffect(() => {
    const lists = Object.values(QUERIES).map((q) => window.matchMedia(q));
    const update = () => setMode(read());
    lists.forEach((l) => l.addEventListener('change', update));
    window.addEventListener('orientationchange', update);
    return () => {
      lists.forEach((l) => l.removeEventListener('change', update));
      window.removeEventListener('orientationchange', update);
    };
  }, []);

  return mode;
};

export { QUERIES };
export default useLayoutMode;
