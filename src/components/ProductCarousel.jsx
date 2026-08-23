import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  forwardRef,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ProductCard from './ProductCard';
import ProductInfo from './ProductInfo';
import Dots from './Dots';
import useSwipe, { FAN } from '../hooks/useSwipe';

const ProductCarousel = forwardRef((
  {
    category,
    onOpen,
    onNextCategory,
    onPrevCategory,
    entryFrom,
    onActiveChange,
    variant = 'portrait', // 'portrait' | 'split' (téléphone couché) | 'tablet'
  },
  ref,
) => {
  const split = variant === 'split';
  // Réglages du fan propres à chaque disposition (voir FAN dans useSwipe.js).
  const xRatio = variant === 'tablet' ? FAN.X_RATIO_WIDE : FAN.X_RATIO;
  const blurScale = variant === 'tablet' ? 0.5 : 1;
  const products = useMemo(() => category?.products ?? [], [category]);

  // Remonte le plat actif (utilisé pour le voile photo derrière la colonne).
  const notify = useCallback(
    (i) => {
      if (onActiveChange) onActiveChange(products[i] ?? null);
    },
    [onActiveChange, products],
  );

  const { index, setIndex, reset, dragProgress, onPan, onPanEnd, reduceMotion } =
    useSwipe(products.length, {
      onOverflowNext: onNextCategory,
      onOverflowPrev: onPrevCategory,
      onIndexChange: notify,
    });

  useImperativeHandle(ref, () => ({ reset }), [reset]);

  // La carte est dimensionnée en dvh par le CSS : on la mesure pour que les
  // décalages du fan restent une fraction de la carte, à toutes les tailles.
  const stackRef = useRef(null);
  const [cardSize, setCardSize] = useState({ w: 260, h: 360 });

  useEffect(() => {
    const el = stackRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) setCardSize({ w: width, h: height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Changement de catégorie : on entre sur la 1re ou la dernière carte selon le sens.
  useEffect(() => {
    const start = entryFrom === 'end' ? Math.max(products.length - 1, 0) : 0;
    reset(start);
    notify(start);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category?.id]);

  if (products.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-10 text-center">
        <span className="text-4xl" aria-hidden>🍽️</span>
        <p className="mt-4 font-display text-lg text-text">Rien par ici, pour l’instant</p>
        <p className="mt-1 text-sm text-muted">
          Cette catégorie sera bientôt garnie. Demandez au serveur les suggestions du jour.
        </p>
      </div>
    );
  }

  const tablet = variant === 'tablet';

  const fan = (
    // conteneur : rien ne peut déborder horizontalement
    <motion.div
      className={`carousel relative w-full select-none overflow-hidden touch-pan-y ${
        split || tablet ? 'h-full' : 'flex-1'
      }`}
      onPan={onPan}
      onPanEnd={onPanEnd}
      onDragStart={(e) => e.preventDefault()}
      style={{ perspective: 1200 }}
    >
      {/* couche de cartes centrée — origine commune à toutes les cartes */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div ref={stackRef} className="card-stack relative">
          {products.map((product, i) => {
            const offset = i - index;
            if (Math.abs(offset) > FAN.VISIBLE) return null;
            return (
              <ProductCard
                key={product.id}
                product={product}
                offset={offset}
                dragProgress={dragProgress}
                isActive={offset === 0}
                onOpen={onOpen}
                reduceMotion={reduceMotion}
                entranceDelay={reduceMotion ? 0 : Math.abs(offset) * 0.05}
                cardSize={cardSize}
                xRatio={xRatio}
                blurScale={blurScale}
                showText={!split}
              />
            );
          })}
        </div>
      </div>
    </motion.div>
  );

  return (
    <section
      className={`flex min-h-0 flex-col ${tablet ? '' : 'flex-1'}`}
      aria-roledescription="carrousel"
      aria-label={`Plats — ${category.name}`}
    >
      {split ? (
        // Téléphone couché : le texte sort de la carte et se pose à côté,
        // il ne peut donc jamais être rogné par la photo.
        <div className="flex items-center gap-4">
          {/* hauteur explicite : les cartes sont en position absolue, sans elle
              la colonne s'effondrerait à 0 dans un conteneur centré */}
          <div
            className="shrink-0 basis-[46%]"
            style={{ height: 'calc(var(--card-h) + 24px)' }}
          >
            {fan}
          </div>
          <div className="min-w-0 flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={products[index]?.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
              >
                <ProductInfo
                  product={products[index]}
                  onOpen={onOpen}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      ) : tablet ? (
        // scène de tablette : hauteur calée sur la carte pour que les points
        // restent collés sous l'éventail et non plaqués en bas de l'écran
        <div style={{ height: 'calc(var(--card-h) + 90px)' }}>{fan}</div>
      ) : (
        fan
      )}

      {/* points : toujours dans le flux, jamais rognés par le conteneur du fan */}
      <div
        className="shrink-0"
        style={{
          marginTop: 'var(--dots-margin)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        <Dots count={products.length} index={index} onSelect={setIndex} />
      </div>
    </section>
  );
});

ProductCarousel.displayName = 'ProductCarousel';

export default ProductCarousel;
