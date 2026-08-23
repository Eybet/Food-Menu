import { useLayoutEffect } from 'react';

/** Verrouille le scroll du body (et compense la barre de défilement desktop). */
const useLockBodyScroll = (locked) => {
  useLayoutEffect(() => {
    if (!locked) return undefined;
    const { body } = document;
    const prevOverflow = body.style.overflow;
    const prevPadding = body.style.paddingRight;
    const gap = window.innerWidth - document.documentElement.clientWidth;

    body.style.overflow = 'hidden';
    if (gap > 0) body.style.paddingRight = `${gap}px`;

    return () => {
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPadding;
    };
  }, [locked]);
};

export default useLockBodyScroll;
