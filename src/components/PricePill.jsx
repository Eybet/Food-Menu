import { memo } from 'react';
import { formatAmount, restaurant } from '../data/menu';

/**
 * Pastille de prix dorée. `shine` n'est activé que sur la carte active
 * (l'animation est de toute façon neutralisée en prefers-reduced-motion).
 */
const PricePillBase = ({ value, shine = false, sold = false, className = '' }) => {
  return (
    <span
      className={`price-pill ${shine && !sold ? 'price-pill--shine' : ''} ${
        sold ? 'price-pill--sold' : ''
      } ${className}`}
    >
      <span className="price-pill__amount">{formatAmount(value)}</span>
      <span className="price-pill__currency">{restaurant.currency}</span>
    </span>
  );
};

const PricePill = memo(PricePillBase);

export default PricePill;
