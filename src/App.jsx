import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Header from './components/Header';
import CategorySwiper from './components/CategorySwiper';
import ProductCarousel from './components/ProductCarousel';
import ProductSheet from './components/ProductSheet';
import useLayoutMode from './hooks/useLayoutMode';
import { restaurant } from './data/menu';

const App = () => {
  const { categories } = restaurant;
  const mode = useLayoutMode(); // 'portrait' | 'landscape' | 'tablet'
  const [activeId, setActiveId] = useState(categories[0].id);
  const [entryFrom, setEntryFrom] = useState('start');
  const [selected, setSelected] = useState(null);
  const [activeProduct, setActiveProduct] = useState(categories[0].products[0] ?? null);
  const carouselRef = useRef(null);

  /**
   * Portrait : la page ne defile pas, donc Safari ne peut plus deployer ni
   * replier sa barre d'outils — c'est ce va-et-vient qui changeait `dvh` et
   * faisait sauter toute la colonne de 10 a 25 px en plein geste.
   * On pose une classe (et non un style inline) : le verrou de la fiche
   * produit sauvegarde/restaure `body.style.overflow` et ecraserait un inline.
   */
  useEffect(() => {
    const portrait = mode === 'portrait';
    const root = document.documentElement;
    root.classList.toggle('is-portrait', portrait);
    document.body.classList.toggle('is-portrait', portrait);
    return () => {
      root.classList.remove('is-portrait');
      document.body.classList.remove('is-portrait');
    };
  }, [mode]);

  const activeIndex = categories.findIndex((c) => c.id === activeId);
  const category = useMemo(() => categories[activeIndex], [categories, activeIndex]);

  const selectCategory = useCallback((id) => {
    setEntryFrom('start');
    setActiveId(id);
  }, []);

  // Débordement du carrousel → catégorie suivante / précédente (avec bouclage).
  const nextCategory = useCallback(() => {
    setEntryFrom('start');
    setActiveId(categories[(activeIndex + 1) % categories.length].id);
  }, [categories, activeIndex]);

  const prevCategory = useCallback(() => {
    setEntryFrom('end');
    setActiveId(categories[(activeIndex - 1 + categories.length) % categories.length].id);
  }, [categories, activeIndex]);

  const carousel = (variant) => (
    <ProductCarousel
      ref={carouselRef}
      variant={variant}
      category={category}
      entryFrom={entryFrom}
      onOpen={setSelected}
      onNextCategory={nextCategory}
      onPrevCategory={prevCategory}
      onActiveChange={setActiveProduct}
    />
  );

  /**
   * Voile photo du plat actif, derrière toute la page — fondu enchaîné.
   *
   * Le flou est STATIQUE : seule l'opacité est animée, jamais le `filter`.
   * La couche est en outre rendue au quart de la surface puis agrandie ×4 :
   * un `blur(16px)` sur un quart d'écran donne le même résultat qu'un
   * `blur(64px)` plein écran pour un seizième des pixels à tramer — ce qui
   * rend le fondu gratuit au moment précis où la carte, elle, s'anime.
   */
  // Couches de scene : degrade + grain, chacune sur sa propre couche
  // compositee et jamais repeinte (cf. index.css, 5.1/5.2).
  const scene = (
    <>
      <div aria-hidden className="scene-bg" />
      <div aria-hidden className="scene-grain" />
    </>
  );

  const ambient = (
    // Le cadre borne la couche agrandie : elle ne peut créer aucun
    // débordement, donc aucune barre de défilement parasite.
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <AnimatePresence mode="popLayout">
        {activeProduct?.image && (
          <motion.div
            key={activeProduct.id}
            className="absolute left-0 top-0 h-1/4 w-1/4 origin-top-left bg-cover bg-center"
            style={{
              backgroundImage: `url(${activeProduct.image})`,
              filter: 'blur(16px) saturate(1.15)',
              transform: 'scale(4) translateZ(0)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          />
        )}
      </AnimatePresence>
    </div>
  );

  const sheet = <ProductSheet product={selected} onClose={() => setSelected(null)} />;

  // ── C — TABLETTE : rail fixe + scène, jamais de défilement ───────────────
  if (mode === 'tablet') {
    return (
      <div className="relative flex h-[100dvh] overflow-hidden">
        {scene}
      {ambient}

        <aside
          className="relative z-10 flex h-full w-[300px] shrink-0 flex-col bg-surface/70 px-6 py-8 backdrop-blur-xl"
          style={{ borderRight: '1px solid rgba(255,255,255,0.07)' }}
        >
          <Header variant="rail" />

          <div className="my-6 h-px bg-white/8" />

          <div className="min-h-0 flex-1">
            <CategorySwiper
              variant="rail"
              categories={categories}
              activeId={activeId}
              onSelect={selectCategory}
            />
          </div>

          <p className="pt-6 text-[10px] uppercase tracking-[0.22em] text-muted/60">
            Scannez · Menu numérique
          </p>
        </aside>

        <main className="relative z-10 grid min-w-0 flex-1 place-items-center overflow-hidden">
          <div className="w-full">{carousel('tablet')}</div>
        </main>

        {sheet}
      </div>
    );
  }

  // ── B — TÉLÉPHONE COUCHÉ : pleine largeur, scène en deux colonnes ─────────
  if (mode === 'landscape') {
    return (
      <div
        className="relative min-h-[100dvh] overflow-y-auto"
        style={{ overflowX: 'hidden' }}
      >
        {scene}
      {ambient}

        <div
          className="relative z-10 flex min-h-[100dvh] flex-col"
          style={{ paddingInline: 'clamp(16px, 4vw, 32px)' }}
        >
          {/* Rangée 1 — barre compacte : marque + catégories sur une ligne */}
          <div className="sticky top-0 z-40 -mx-[clamp(16px,4vw,32px)] flex h-[56px] shrink-0 items-center gap-4 border-b border-white/5 bg-bg/70 px-[clamp(16px,4vw,32px)] backdrop-blur-xl">
            <Header variant="inline" />
            <div className="min-w-0 flex-1">
              <CategorySwiper
                categories={categories}
                activeId={activeId}
                onSelect={selectCategory}
              />
            </div>
          </div>

          {/* Rangées 2 et 3 — scène partagée puis points */}
          <main className="flex flex-col py-3">{carousel('split')}</main>

          {/* une chiquenaude de rab : la page dépasse l'écran d'environ 15dvh */}
          <div aria-hidden style={{ height: '14dvh' }} />
        </div>

        {sheet}
      </div>
    );
  }

  // ── A — TÉLÉPHONE DEBOUT : structure inchangée, jamais de défilement ──────
  return (
    <div className="relative  h-[100dvh]  overflow-hidden">
      {scene}
      {ambient}

      {/* Pas de `backdrop-filter` sur la colonne : il enveloppait toute la
          scene, donc TOUT le carrousel. Un backdrop-filter est recalcule des
          que quoi que ce soit bouge derriere ou dedans — pendant un geste,
          c'est a chaque image, sur la surface entiere. Ce qu'il floutait ici
          n'est qu'un degrade lisse plus un grain a 0,035 d'opacite : le rendu
          est indiscernable sans lui. */}
      <div
        className="relative mx-auto flex h-[100dvh]  flex-col justify-between overflow-hidden"
        style={{
          boxShadow: '0 0 80px rgba(0,0,0,0.6)',
          borderInline: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 rounded-full bg-accent/10 blur-3xl"
          // tout element porteur d'un `filter` doit porter une transformation
          // 3D sur LE MEME element, sinon Safari le rastérise sur le CPU.
          style={{ transform: 'translateX(-50%) translateZ(0)' }}
        />

        <Header />
        <CategorySwiper
          categories={categories}
          activeId={activeId}
          onSelect={selectCategory}
        />

        <main className="relative flex min-h-0 flex-1 flex-col">{carousel('portrait')}</main>

        <footer
          className="app-footer shrink-0 px-6 pb-3 pt-1 text-center text-[clamp(9px,2.6vw,11px)] uppercase tracking-[0.12em] text-muted/60"
          style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}
        >
          {/* Raccourci : la version longue etait tronquee a droite des 320px.
              `text-wrap: balance` garantit deux lignes centrees equilibrees
              plutot qu'un mot orphelin si la police de secours est plus large. */}
          <span className="[text-wrap:balance]">Glissez · Appuyez pour les détails</span>
        </footer>
      </div>

      {sheet}
    </div>
  );
};

export default App;
