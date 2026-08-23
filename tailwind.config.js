/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0B0B0D',
        surface: '#141417',
        'surface-2': '#1C1C21',
        text: '#F5F2EC',
        muted: '#9A958C',
        accent: '#D9A441',
        'accent-soft': '#3A2E17',
        danger: '#C4553F',
      },
      fontFamily: {
        // Neufreit n'existe qu'en ExtraBold → poids 800 imposé par .font-display,
        // ne jamais empiler font-bold/font-black par-dessus (gras synthétique).
        display: ['Neufreit', 'Outfit', 'system-ui', 'sans-serif'],
        num: ['"Space Grotesk"', 'ui-monospace', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        card: '0 30px 60px -20px rgba(0,0,0,0.75), 0 8px 24px -8px rgba(0,0,0,0.5)',
        pill: '0 6px 18px -6px rgba(217,164,65,0.55)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
};
