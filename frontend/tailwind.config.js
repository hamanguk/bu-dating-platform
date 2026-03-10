/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#FF6B81',
        accent: '#FF9278',
        'background-light': '#FFF7F8',
        'background-dark': '#1A0B0D',
        'card-light': '#FFFFFF',
        'card-dark': '#2D161A',
      },
      fontFamily: {
        display: ['Plus Jakarta Sans', 'Noto Sans KR', 'sans-serif'],
      },
      letterSpacing: {
        tighter: '-0.03em',
      },
      boxShadow: {
        'card': '0 2px 20px rgba(255,107,129,0.08)',
        'card-hover': '0 8px 30px rgba(255,107,129,0.15)',
        'nav': '0 -4px 30px rgba(0,0,0,0.06)',
      },
    },
  },
  plugins: [],
};
