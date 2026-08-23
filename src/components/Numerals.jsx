import { memo, Fragment } from 'react';

/** Repère les nombres (« 700 g », « 70 % », « 12 h ») dans un texte libre. */
const NUMBER = /(\d+(?:[.,]\d+)?)/g;

/**
 * Rend le texte en passant les seuls chiffres en Space Grotesk tabulaire,
 * pour que les quantités des descriptions s'accordent avec les prix.
 */
const NumeralsBase = ({ children }) => {
  if (typeof children !== 'string') return children ?? null;

  // split() avec groupe capturant : les nombres tombent aux index impairs.
  return children.split(NUMBER).map((part, i) =>
    i % 2 === 1 ? (
      <span key={i} className="font-num  tabular-nums tracking-[0.01em]">
        {part}
      </span>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
};

const Numerals = memo(NumeralsBase);

export default Numerals;
