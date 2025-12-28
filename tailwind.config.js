/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./App.tsx",
    "./index.tsx",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./services/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        sans: ['"Lato"', 'sans-serif'],
      },
      colors: {
        gold: {
          50: '#FEFCE8',
          100: '#FEF9C3',
          400: '#D4AF37',
          500: '#C5A028',
          600: '#B08D26',
        }
      }
    },
  },
  plugins: [],
}

