/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      /**
       * ── Jetons de couleur — source unique de vérité ────────────────────
       * Palette dérivée via la skill ui-ux-pro-max (`--domain color`), dont
       * les entrées « thème sombre » convergent toutes sur un accent cyan
       * (#0891B2) épaulé d'un violet, sur fond ardoise. Le cyan est le seul
       * accent qui ne se noie pas dans la photographie culinaire : le plat
       * est rouge/orange/brun, l'interface est cyan — aucune confusion
       * possible entre « nourriture » et « commande ».
       *
       * Aucun hex en dur dans les composants : tout passe par ces jetons.
       * Ratios vérifiés (WCAG) : corps ≥ 4.5:1, éléments d'UI ≥ 3:1.
       */
      colors: {
        bg: '#0B0E12', //          fond de scène
        surface: '#12161C', //     carte, rail
        'surface-2': '#1A2029', // creux, réserve d'image
        text: '#ECF1F5', //        17.0:1 sur bg
        muted: '#94A3B8', //       7.5:1 sur bg  → classe `text-muted`
        accent: '#22B8CF', //      8.1:1 sur bg  — accent unique
        'accent-fg': '#04141A', // 7.9:1 sur accent — texte posé sur l'accent
        'accent-deep': '#0891B2', // même famille, pour dégradés et halos
        support: '#A78BFA', //     7.1:1 sur bg  — couleur d'appui unique
        border: 'rgba(255,255,255,0.08)',
        danger: '#F87171', //      6.6:1 sur surface — état « épicé » / rupture
      },
      fontFamily: {
        // Neufreit n'existe qu'en ExtraBold → poids 800 imposé par .font-display,
        // ne jamais empiler font-bold/font-black par-dessus (gras synthétique).
        display: ['Neufreit', 'Outfit', 'system-ui', 'sans-serif'],
        num: ['"Space Grotesk"', 'ui-monospace', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        // Ombre portée neutre et resserrée : la carte se pose dans la scène
        // et projette une ombre, plutôt que d'avoir l'air éclairée par
        // l'arrière. Statique — jamais animée ni transitionnée.
        card: '0 18px 40px rgba(0,0,0,0.55), 0 4px 12px rgba(0,0,0,0.4)',
        pill: '0 6px 18px -6px rgba(34,184,207,0.55)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
};
