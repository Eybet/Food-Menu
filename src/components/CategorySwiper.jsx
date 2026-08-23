import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

/**
 * Sélecteur de catégories.
 *  variant 'row'  — rangée horizontale (dispositions A et B)
 *  variant 'rail' — liste verticale du rail de tablette (disposition C)
 */
const CategorySwiper = ({ categories, activeId, onSelect, variant = 'row' }) => {
  const rowRef = useRef(null);
  const pillRefs = useRef([]);
  const rail = variant === 'rail';
  const activeIndex = categories.findIndex((c) => c.id === activeId);

  // Recentre l'entrée active, y compris quand le changement vient du carrousel
  // (swipe au-delà de la dernière carte). Dans un rAF : lancé pendant le rendu,
  // le défilement viserait une position que le layout n'a pas encore figée
  // (largeur des pastilles, scale 1.06) et la pastille resterait tronquée.
  //
  // Surtout : on ne passe JAMAIS par scrollIntoView, qui fait défiler tous les
  // ancêtres scrollables — document compris. La dernière pastille ne pouvant
  // pas être centrée dans la rangée, le navigateur satisfaisait `inline:center`
  // en décalant la page : d'où le vide à droite et l'en-tête qui sortait du
  // cadre. On pilote donc uniquement le scroll de la rangée, borné à ses
  // limites réelles : première et dernière pastille se posent contre leur bord.
  useEffect(() => {
    const row = rowRef.current;
    const pill = pillRefs.current[activeIndex];
    if (!row || !pill) return;

    const id = requestAnimationFrame(() => {
      if (rail) {
        const target = pill.offsetTop - (row.clientHeight - pill.offsetHeight) / 2;
        const max = row.scrollHeight - row.clientHeight;
        row.scrollTo({ top: Math.max(0, Math.min(target, max)), behavior: 'smooth' });
      } else {
        const target = pill.offsetLeft - (row.clientWidth - pill.offsetWidth) / 2;
        const max = row.scrollWidth - row.clientWidth;
        row.scrollTo({ left: Math.max(0, Math.min(target, max)), behavior: 'smooth' });
      }
    });
    return () => cancelAnimationFrame(id);
  }, [activeIndex, rail]);

  if (rail) {
    return (
      <nav
        ref={rowRef}
        className="no-scrollbar flex flex-col gap-1 overflow-y-auto"
        aria-label="Catégories"
      >
        {categories.map((c, i) => {
          const active = c.id === activeId;
          return (
            <button
              key={c.id}
              ref={(el) => {
                pillRefs.current[i] = el;
              }}
              type="button"
              onClick={() => onSelect(c.id)}
              aria-current={active ? 'true' : undefined}
              className={`category-pill relative flex h-12 items-center gap-3 rounded-xl px-3 font-display text-[15px] ${
                active ? 'text-bg' : 'text-muted'
              }`}
            >
              {active && (
                <motion.span
                  layoutId="category-pill"
                  className="absolute inset-0 rounded-xl bg-accent shadow-pill"
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}
              <span className="relative text-lg" aria-hidden>
                {c.icon}
              </span>
              <span className="relative whitespace-nowrap">{c.name}</span>
            </button>
          );
        })}
      </nav>
    );
  }

  return (
    <nav
      ref={rowRef}
      className="category-row no-scrollbar z-30 flex shrink-0 gap-2 overflow-x-auto px-5 [scroll-snap-type:x_mandatory]"
      style={{ marginBlock: 'var(--row-margin)' }}
      aria-label="Catégories"
    >
      {categories.map((c, i) => {
        const active = c.id === activeId;
        return (
          <button
            key={c.id}
            ref={(el) => {
              pillRefs.current[i] = el;
            }}
            type="button"
            onClick={() => onSelect(c.id)}
            aria-current={active ? 'true' : undefined}
            className={`category-pill relative shrink-0 rounded-full px-4 py-2.5 font-display text-sm [scroll-snap-align:center] ${
              active ? 'text-bg' : 'text-muted'
            }`}
            style={{
              minHeight: 44,
              transform: active ? 'scale(1.06)' : 'scale(1)',
              transition: 'transform 200ms',
            }}
          >
            {active && (
              <motion.span
                layoutId="category-pill"
                className="absolute inset-0 rounded-full bg-accent shadow-pill"
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              />
            )}
            <span className="relative flex items-center gap-1.5 whitespace-nowrap">
              <span aria-hidden>{c.icon}</span>
              {c.name}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

export default CategorySwiper;
