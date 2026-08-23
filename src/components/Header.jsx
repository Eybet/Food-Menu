import { restaurant } from '../data/menu';

/**
 * variant 'bar'     — en-tête centré du téléphone debout (disposition A)
 * variant 'inline'  — nom seul, aligné à gauche, dans la barre du téléphone
 *                     couché (disposition B)
 * variant 'rail'    — bloc de tête du rail de tablette (disposition C)
 */
const Header = ({ variant = 'bar' }) => {
  if (variant === 'inline') {
    return (
      <h1 className="shrink-0 font-display text-[15px] uppercase tracking-[0.18em] text-text">
        {restaurant.name}
      </h1>
    );
  }

  if (variant === 'rail') {
    return (
      <div>
        <h1 className="font-display text-[22px] uppercase leading-tight tracking-[0.18em] text-text">
          {restaurant.name}
        </h1>
        <p className="mt-2 text-[10px] uppercase tracking-[0.28em] text-muted">
          {restaurant.tagline}
        </p>
      </div>
    );
  }

  return (
    <header
      /*
        Pas de `backdrop-filter` ici. L'en-tete 'bar' n'existe qu'en portrait,
        et le portrait ne defile plus (cf. App/index.css) : rien ne passe donc
        jamais derriere lui, le flou ne montrait rien et coutait un recalcul du
        fond a chaque fois qu'une carte bougeait dessous — l'en-tete etant
        empile au-dessus d'elles (z-40). Fond quasi opaque a la place.
        Les barres du mode couche et le rail de tablette gardent leur flou :
        la, du contenu defile vraiment derriere.
      */
      className="sticky top-0 z-40  shrink-0 border-b border-white/5 bg-bg/95 px-5"
      style={{ paddingBlock: 'var(--header-pad)' }}
    >
      <div className="flex flex-col items-center justify-center text-center">
        <h1 className="font-display text-[19px] uppercase tracking-[0.22em] text-text">
          {restaurant.name}
        </h1>
        <p className="header-tagline text-[10px] uppercase tracking-[0.28em] text-muted">
          {restaurant.tagline}
        </p>
      </div>
    </header>
  );
};

export default Header;
