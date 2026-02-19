/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#ff6b81',
        'background-light': '#f8f5f6',
        'background-dark': '#230f12',
      },
      fontFamily: {
        display: ['Plus Jakarta Sans', 'Noto Sans KR', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '1rem',
        lg: '2rem',
        xl: '3rem',
        full: '9999px',
      },
    },
  },
  plugins: [],
};
