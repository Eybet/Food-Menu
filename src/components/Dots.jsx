import { memo } from 'react';
import { motion } from 'framer-motion';

const DotsBase = ({ count, index, onSelect, layoutId = 'dot-active' }) => {
  if (count <= 1) return null;
  return (
    <div className="dots flex items-center justify-center gap-2" role="tablist" aria-label="Plats">
      {Array.from({ length: count }).map((_, i) => {
        const active = i === index;
        return (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={active}
            aria-label={`Plat ${i + 1} sur ${count}`}
            onClick={() => onSelect(i)}
            className="relative grid h-11 w-5 place-items-center"
          >
            <span
              className={`block h-1.5 rounded-full transition-colors ${
                active ? 'w-5' : 'w-1.5 bg-white/20'
              }`}
            />
            {active && (
              <motion.span
                layoutId={layoutId}
                // `position` et non une animation de layout complete : ce
                // temoin fait toujours exactement h-1.5 w-5, seule sa place
                // change d'un point a l'autre. Animer aussi la taille ferait
                // mesurer et corriger une geometrie qui ne bouge jamais.
                layout="position"
                className="absolute h-1.5 w-5 rounded-full bg-accent"
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
};

const Dots = memo(DotsBase);

export default Dots;
