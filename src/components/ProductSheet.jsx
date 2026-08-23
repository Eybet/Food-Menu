import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import useLockBodyScroll from '../hooks/useLockBodyScroll';
import PricePill from './PricePill';
import Numerals from './Numerals';

const SHEET_SPRING = { type: 'spring', stiffness: 300, damping: 32 };
/** Seuils de fermeture par glissement vers le bas. */
const DISMISS_DISTANCE = 120;
const DISMISS_VELOCITY = 500;

const ProductSheet = ({ product, onClose }) => {
  const reduceMotion = useReducedMotion();
  useLockBodyScroll(Boolean(product));

  return (
    <AnimatePresence>
      {product && (
        <>
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-40 bg-black/65"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.div
            key="sheet"
            role="dialog"
            aria-modal="true"
            aria-label={product.name}
            className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[88dvh] w-full max-w-[480px] flex-col overflow-hidden rounded-t-4xl bg-surface ring-1 ring-white/10 will-change-transform"
            initial={reduceMotion ? { opacity: 0 } : { y: '100%' }}
            animate={reduceMotion ? { opacity: 1 } : { y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { y: '100%' }}
            transition={reduceMotion ? { duration: 0.15 } : SHEET_SPRING}
            drag={reduceMotion ? false : 'y'}
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.y > DISMISS_DISTANCE || info.velocity.y > DISMISS_VELOCITY) {
                onClose();
              }
            }}
          >
            <div className="flex shrink-0 justify-center py-3">
              <span className="h-1.5 w-11 rounded-full bg-white/20" />
            </div>

            <div
              // seule zone où le texte reste sélectionnable (copier un plat)
              // Le corps prend la hauteur restante de la feuille (flex-1) au
              // lieu d'un max-height en dur : le pied colle est donc toujours
              // dans le cadre, quelle que soit la longueur des ingredients.
              className="selectable min-h-0 flex-1 overflow-y-auto overscroll-contain px-5"
            >
              <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl bg-surface-2">
                <img
                  src={product.image}
                  alt={product.name}
                  width={800}
                  height={600}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                  draggable={false}
                />
              </div>

              <div className="mt-5 flex items-start justify-between gap-4">
                <h2 className="font-display text-2xl leading-tight text-text">
                  {product.name}
                </h2>
                <PricePill
                  value={product.price}
                  sold={product.available === false}
                  className="mt-1 shrink-0"
                />
              </div>

              {product.badges?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {product.badges.map((b) => (
                    <span
                      key={b}
                      className="rounded-full border border-white/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted"
                    >
                      {b}
                    </span>
                  ))}
                </div>
              )}

              <p className="mt-4 text-[15px] leading-relaxed text-text/85">
                <Numerals>{product.description}</Numerals>
              </p>

              {product.ingredients && (
                <div className="mt-6">
                  <h3 className="text-[11px] uppercase tracking-[0.22em] text-muted">
                    Ingrédients
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-text/75">
                    <Numerals>{product.ingredients}</Numerals>
                  </p>
                </div>
              )}

              {product.allergens && (
                <div className="mt-5">
                  <h3 className="text-[11px] uppercase tracking-[0.22em] text-muted">
                    Allergènes
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-danger/90">
                    {product.allergens}
                  </p>
                </div>
              )}

            </div>

            {/* Pied colle A L'INTERIEUR de la feuille : la mention restait
                sinon sous la barre d'outils de Safari, voire entierement sous
                la ligne de flottaison sur une fiche a longue liste. */}
            <div
              className="shrink-0  bg-surface px-5 pt-5"
              style={{ paddingBottom: 'calc(24px + env(safe-area-inset-bottom))' }}
            >
              <p className="rounded-2xl border border-white/8 bg-surface-2 px-4 py-3.5 text-center text-sm text-muted">
                Commandez ce plat auprès de votre serveur.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ProductSheet;
