import { useCallback, useEffect, useRef } from 'react';
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

  // Recentre l'entree active, y compris quand le changement vient du carrousel
  // (swipe au-dela de la derniere carte).
  //
  // On ne passe JAMAIS par scrollIntoView, qui fait defiler tous les ancetres
  // scrollables — document compris. La derniere pastille ne pouvant pas etre
  // centree dans la rangee, le navigateur satisfaisait `inline:center` en
  // decalant la page : d'ou le vide a droite et l'en-tete qui sortait du
  // cadre. On pilote donc uniquement le scroll de la rangee, borne a ses
  // limites reelles : premiere et derniere pastille se posent contre leur bord.
  const centreActivePill = useCallback(
    (behavior = 'smooth') => {
      const row = rowRef.current;
      const pill = pillRefs.current[activeIndex];
      if (!row || !pill) return;

      if (rail) {
        const target = pill.offsetTop - (row.clientHeight - pill.offsetHeight) / 2;
        const max = row.scrollHeight - row.clientHeight;
        row.scrollTo({ top: Math.max(0, Math.min(target, max)), behavior });
      } else {
        const target = pill.offsetLeft - (row.clientWidth - pill.offsetWidth) / 2;
        const max = row.scrollWidth - row.clientWidth;
        row.scrollTo({ left: Math.max(0, Math.min(target, max)), behavior });
      }
    },
    [activeIndex, rail],
  );

  // Changement de categorie -> on recentre. Dans un rAF : lance pendant le
  // rendu, le defilement viserait une position que le layout n'a pas encore
  // figee (largeur des pastilles, scale 1.06) et la pastille resterait
  // tronquee.
  useEffect(() => {
    const id = requestAnimationFrame(() => centreActivePill());
    return () => cancelAnimationFrame(id);
  }, [centreActivePill]);

  /**
   * Rappel de la pastille active.
   *
   * Recentrer au seul changement d'index ne suffisait pas : des que le client
   * faisait defiler la rangee a la main, plus rien ne ramenait jamais la
   * pastille active, qui finissait hors champ — on lisait « Grillades ·
   * Desserts · Boissons » sans aucun repere alors que le carrousel montrait
   * des pizzas.
   *
   * On attend donc la fin du defilement propre a la rangee (450 ms apres le
   * dernier evenement, pour ne jamais contrarier le doigt en plein geste) et,
   * si la pastille n'est plus entierement visible, on la ramene au centre avec
   * le meme scrollTo borne.
   */
  const settleRef = useRef(0);

  useEffect(() => {
    const row = rowRef.current;
    if (!row) return undefined;

    const onRowScroll = () => {
      clearTimeout(settleRef.current);
      settleRef.current = setTimeout(() => {
        const view = rowRef.current;
        const pill = pillRefs.current[activeIndex];
        if (!view || !pill) return;
        const fullyVisible = rail
          ? pill.offsetTop - view.scrollTop >= 0 &&
            pill.offsetTop - view.scrollTop + pill.offsetHeight <= view.clientHeight
          : pill.offsetLeft - view.scrollLeft >= 0 &&
            pill.offsetLeft - view.scrollLeft + pill.offsetWidth <= view.clientWidth;
        if (!fullyVisible) centreActivePill();
      }, 450);
    };

    row.addEventListener('scroll', onRowScroll, { passive: true });
    return () => {
      clearTimeout(settleRef.current);
      row.removeEventListener('scroll', onRowScroll);
    };
  }, [activeIndex, rail, centreActivePill]);

  // Rotation ou redimensionnement : la rangee change de largeur, la pastille
  // active peut se retrouver hors cadre sans qu'aucun scroll n'ait eu lieu.
  useEffect(() => {
    const recentre = () => centreActivePill('auto');
    window.addEventListener('resize', recentre);
    window.addEventListener('orientationchange', recentre);
    return () => {
      window.removeEventListener('resize', recentre);
      window.removeEventListener('orientationchange', recentre);
    };
  }, [centreActivePill]);

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
                active ? 'text-accent-fg' : 'text-muted'
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
              active ? 'text-accent-fg' : 'text-muted'
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
