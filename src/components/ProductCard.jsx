import { memo, useState } from 'react';
import { motion, useTransform } from 'framer-motion';
import { FAN } from '../hooks/useSwipe';
import PricePill from './PricePill';
import Numerals from './Numerals';

const badgeTone = (label) => {
  const l = label.toLowerCase();
  if (l.includes('épic')) return 'bg-danger/20 text-danger border-danger/30';
  if (l.includes('nouveau')) return 'bg-support/20 text-support border-support/40';
  return 'bg-white/10 text-text/80 border-white/15';
};

/**
 * Palier de profondeur — se déduit du seul `offset`, qui ne bouge qu'au
 * changement d'index. Porte le flou FIXE, le rang de pile et
 * `content-visibility` via une classe CSS statique : rien de tout cela n'est
 * recalculé pendant le geste.
 *
 * Les chaînes sont littérales et jamais interpolées : Tailwind élague
 * `@layer components` sur les classes qu'il retrouve telles quelles dans les
 * sources, et une classe fabriquée en `card-depth-${d}` disparaissait
 * silencieusement du CSS de production — le flou ne sortait qu'en dev.
 */
const DEPTH_CLASS = [
  'card-depth card-depth-0',
  'card-depth card-depth-1',
  'card-depth card-depth-2',
  'card-depth card-depth-3',
];

const depthClass = (offset) => DEPTH_CLASS[Math.min(Math.abs(offset), 3)];

const ProductCardBase = ({
  product,
  offset,
  dragProgress,
  isActive,
  onOpen,
  reduceMotion,
  entranceDelay,
  cardSize,
  xRatio = FAN.X_RATIO,
  blurScale = 1,
  showText = true,
}) => {
  const [loaded, setLoaded] = useState(false);

  // progress continu : suit le doigt en temps réel, sans re-render.
  const progress = useTransform(dragProgress, (d) => offset - d);
  const rotate = useTransform(progress, (p) => p * FAN.ROTATE);
  // Décalages proportionnels à la carte : le fan rétrécit avec elle.
  const x = useTransform(progress, (p) => p * cardSize.w * xRatio);
  const y = useTransform(progress, (p) => Math.abs(p) * cardSize.h * FAN.Y_RATIO);
  const scale = useTransform(progress, (p) => 1 - Math.abs(p) * FAN.SCALE);
  const opacity = useTransform(progress, (p) =>
    Math.max(1 - Math.abs(p) * FAN.OPACITY, 0),
  );
  // z-index : statique, dérivé de l'offset. Animé en motion value il était
  // réécrit à chaque image alors que ce n'est pas une propriété compositable —
  // chaque écriture forçait un nouveau tri de pile.
  const zIndex = 100 - Math.min(Math.abs(offset), 3) * 10;
  // Voile sombre : enfonce les cartes arrière dans la profondeur.
  const scrim = useTransform(progress, (p) =>
    Math.min(Math.abs(p) * FAN.SCRIM, 0.66),
  );
  // Le texte s'efface avant la carte : au fond, seule la photo doit se lire.
  const textOpacity = useTransform(
    progress,
    [0, 1, FAN.TEXT_FADE],
    [1, 0.55, 0],
  );

  const sold = product.available === false;

  return (
    <motion.article
      // inset-0 dans une pile 260×360 déjà centrée → toutes les cartes
      // partagent exactement la même origine, aucun décalage depuis la gauche.
      className={`absolute inset-0 ${depthClass(offset)}`}
      data-blur-scale={blurScale}
      style={{
        rotate: reduceMotion ? 0 : rotate,
        x: reduceMotion ? 0 : x,
        y: reduceMotion ? 0 : y,
        scale,
        opacity,
        zIndex,
        transformOrigin: FAN.ORIGIN,
        pointerEvents: isActive ? 'auto' : 'none',
      }}
      aria-hidden={!isActive}
    >
      {/*
        Entrée (dépliage depuis la pile) + flottement lent de la carte active.
        Sur un wrapper séparé pour ne pas entrer en conflit avec les motion
        values du fan appliquées ci-dessus.
      */}
      <motion.div
        className="h-full w-full "
        initial={reduceMotion ? false : { scale: 0.72, opacity: 0, y: 48 }}
        animate={{
          scale: 1,
          opacity: 1,
          y: isActive && !reduceMotion ? [0, -4, 0, 4, 0] : 0,
        }}
        transition={{
          scale: { type: 'spring', stiffness: 260, damping: 26, delay: entranceDelay },
          opacity: { duration: 0.35, delay: entranceDelay },
          y:
            isActive && !reduceMotion
              ? { duration: 4, ease: 'easeInOut', repeat: Infinity, delay: entranceDelay }
              : { type: 'spring', stiffness: 260, damping: 26, delay: entranceDelay },
        }}
      >
        <button
          type="button"
          onClick={() => isActive && !sold && onOpen(product)}
          disabled={!isActive || sold}
          tabIndex={isActive && !sold ? 0 : -1}
          onDragStart={(e) => e.preventDefault()}
          className={`card group relative block h-full w-full overflow-hidden rounded-3xl bg-surface text-left shadow-card ring-1 ring-white/10 ${
            sold ? 'cursor-default' : 'cursor-pointer'
          }`}
        >
          {/* conteneur à ratio fixe → aucun décalage au chargement */}
          <div className="absolute inset-0 bg-surface-2 ">
            {!loaded && (
              <div className="absolute inset-0 animate-shimmer bg-[linear-gradient(100deg,transparent_20%,rgba(255,255,255,0.06)_40%,transparent_60%)] bg-[length:200%_100%]" />
            )}
            <img
              src={product.image}
              alt={product.name}
              width={520}
              height={720}
              loading="lazy"
              decoding="async"
              draggable={false}
              onLoad={() => setLoaded(true)}
              className={`h-full w-full object-cover transition-opacity duration-500 ${
                loaded ? 'opacity-100' : 'opacity-0'
              } ${sold ? 'grayscale' : ''}`}
            />
          </div>

          {/* scrim de lisibilité */}
          <div className="card-scrim absolute inset-0 " />

          {/* badges — repris par ProductInfo en disposition B */}
          <div
            className="absolute left-4 top-4 flex flex-wrap gap-1.5"
            style={{ display: showText ? undefined : 'none' }}
          >
            {sold && (
              <span className="rounded-full border border-white/20 bg-black/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted">
                Épuisé
              </span>
            )}
            {(product.badges || []).map((b) => (
              <span
                key={b}
                className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest ${badgeTone(b)}`}
              >
                {b}
              </span>
            ))}
          </div>

          {/* texte — s'efface indépendamment de la carte avec la profondeur.
              En disposition B il est rendu à côté de la carte (ProductInfo). */}
          <motion.div
            hidden={!showText}
            className="absolute inset-x-0 bottom-0 p-4"
            style={{ opacity: isActive ? 1 : textOpacity }}
          >
            <h3 className="card-title truncate font-display text-[20px] leading-tight text-text">
              {product.name}
            </h3>
            <p className="card-desc mt-1 line-clamp-2 text-[13px] leading-snug">
              <Numerals>{product.description}</Numerals>
            </p>
            <div className="mt-3 flex items-center justify-between gap-2">
              <span
                className="card-cta truncate text-[10px] uppercase tracking-[0.08em] text-muted/80"
                // sur une carte étroite (téléphone couché), le prix suffit
                style={{ display: cardSize.w < 210 ? 'none' : undefined }}
              >
                {isActive && !sold ? 'Appuyer pour voir' : ' '}
              </span>
              <PricePill
                value={product.price}
                shine={isActive}
                sold={sold}
                className="shrink-0"
              />
            </div>
          </motion.div>

          {/* voile de profondeur — au-dessus du contenu, jamais sur l'active */}
          {!isActive && (
            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-black"
              style={{ opacity: scrim }}
            />
          )}
        </button>
      </motion.div>
    </motion.article>
  );
};

/**
 * Mémoïsé : un drag ne re-render aucune carte — tout passe par les motion
 * values. `dragProgress` est une motion value stable (identité constante), on
 * la compare donc par référence ; l'identité d'une carte ne change pas en
 * cours de geste. Seuls `offset`/`isActive` (qui ne bougent qu'au changement
 * d'index) et la géométrie peuvent provoquer un rendu.
 */
const areEqual = (a, b) =>
  a.product === b.product &&
  a.offset === b.offset &&
  a.isActive === b.isActive &&
  a.showText === b.showText &&
  a.reduceMotion === b.reduceMotion &&
  a.xRatio === b.xRatio &&
  a.blurScale === b.blurScale &&
  a.cardSize.w === b.cardSize.w &&
  a.cardSize.h === b.cardSize.h &&
  a.dragProgress === b.dragProgress &&
  a.onOpen === b.onOpen;

const ProductCard = memo(ProductCardBase, areEqual);

export default ProductCard;
