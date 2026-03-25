/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#FF8C00',
        accent: '#FF6B81',
        'background-light': '#FFFAF5',
        'background-dark': '#1A0F05',
        'card-light': '#FFFFFF',
        'card-dark': '#2D1E14',
      },
      fontFamily: {
        display: ['Plus Jakarta Sans', 'Noto Sans KR', 'sans-serif'],
      },
      letterSpacing: {
        tighter: '-0.03em',
      },
      boxShadow: {
        'card': '0 2px 20px rgba(255,140,0,0.08)',
        'card-hover': '0 8px 30px rgba(255,140,0,0.15)',
        'nav': '0 -4px 30px rgba(0,0,0,0.06)',
      },
      keyframes: {
        'slide-up': {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        'slide-up': 'slide-up 0.3s ease-out',
      },
    },
  },
  plugins: [],
};
