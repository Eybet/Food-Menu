import { useCallback, useMemo, useRef, useState } from 'react';
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

  // Voile photo du plat actif, derrière toute la page — fondu enchaîné.
  const ambient = (
    <AnimatePresence mode="popLayout">
      {activeProduct?.image && (
        <motion.div
          key={activeProduct.id}
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${activeProduct.image})`,
            filter: 'blur(64px) saturate(1.2)',
            transform: 'scale(1.15)',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.08 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        />
      )}
    </AnimatePresence>
  );

  const sheet = <ProductSheet product={selected} onClose={() => setSelected(null)} />;

  // ── C — TABLETTE : rail fixe + scène, jamais de défilement ───────────────
  if (mode === 'tablet') {
    return (
      <div className="relative flex h-[100dvh] overflow-hidden">
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
      {ambient}

      <div
        className="relative mx-auto flex h-[100dvh]  flex-col justify-between overflow-hidden  backdrop-blur-[2px]"
        style={{
          boxShadow: '0 0 80px rgba(0,0,0,0.6)',
          borderInline: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-accent/10 blur-3xl"
        />

        <Header />
        <CategorySwiper
          categories={categories}
          activeId={activeId}
          onSelect={selectCategory}
        />

        <main className="relative flex min-h-0 flex-1 flex-col">{carousel('portrait')}</main>

        <footer
          className="app-footer shrink-0 px-6 pb-3 pt-1 text-center text-[11px] uppercase tracking-[0.22em] text-muted/60"
          style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}
        >
          Glissez pour parcourir · Appuyez pour les détails
        </footer>
      </div>

      {sheet}
    </div>
  );
};

export default App;
