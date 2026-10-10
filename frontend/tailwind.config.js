/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './App.tsx',
    './index.tsx',
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './context/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      colors: {
        'brand-dark': '#0e1013',
        'brand-ink': '#1a1d23',
        'brand-accent': '#c59d5f',
        'brand-accent-dark': '#b08d55',
        'brand-bg': '#faf9f7',
        'brand-card': '#ffffff',
        'brand-cream': '#f4efe8',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'ken-burns': {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(1.08)' },
        },
      },
      animation: {
        marquee: 'marquee 28s linear infinite',
        'ken-burns': 'ken-burns 7s ease-out forwards',
      },
      boxShadow: {
        soft: '0 4px 24px -6px rgb(14 16 19 / 0.08)',
        lift: '0 16px 40px -12px rgb(14 16 19 / 0.18)',
      },
    },
  },
  plugins: [],
};
