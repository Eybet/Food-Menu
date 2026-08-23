import { memo } from 'react';
import PricePill from './PricePill';
import Numerals from './Numerals';

/**
 * Bloc d'information du plat, hors de la carte (disposition B, téléphone
 * couché). La description n'est pas tronquée : jusqu'à 4 lignes.
 */
const ProductInfoBase = ({ product, onOpen }) => {
  if (!product) return null;
  const sold = product.available === false;

  return (
    <div className="min-w-0">
      {(sold || product.badges?.length > 0) && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {sold && (
            <span className="rounded-full border border-white/20 bg-black/60 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted">
              Épuisé
            </span>
          )}
          {(product.badges || []).map((b) => (
            <span
              key={b}
              className="rounded-full border border-white/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted"
            >
              {b}
            </span>
          ))}
        </div>
      )}

      <h2 className="font-display text-[26px] leading-tight text-text">
        {product.name}
      </h2>

      <p className="card-desc mt-2 line-clamp-4 text-[14px] leading-relaxed">
        <Numerals>{product.description}</Numerals>
      </p>

      <div className="mt-4 flex items-center gap-3">
        <PricePill value={product.price} shine sold={sold} />
        {!sold && (
          <button
            type="button"
            onClick={() => onOpen(product)}
            className="text-[10px] uppercase tracking-[0.08em] text-muted/80"
            style={{ minHeight: 44 }}
          >
            Appuyer pour voir
          </button>
        )}
      </div>
    </div>
  );
};

const ProductInfo = memo(ProductInfoBase);

export default ProductInfo;
