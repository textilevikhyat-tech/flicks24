/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'flicks-primary': '#FF5A5F',
        'flicks-secondary': '#00C4FF',
        'flicks-dark': '#0A0A0A',
        'flicks-surface': '#1A1A1A',
      },
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'like-burst': 'likeBurst 0.5s ease-out forwards',
      },
      keyframes: {
        likeBurst: {
          '0%': { transform: 'scale(0)', opacity: '1' },
          '100%': { transform: 'scale(2)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}
