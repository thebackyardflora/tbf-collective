const colors = require('tailwindcss/colors');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx,jsx,js}', './node_modules/@mando-collabs/tailwind-ui/dist/**.*.js'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#78866B',
          50: '#D4D9D0',
          100: '#CAD0C4',
          200: '#B5BEAD',
          300: '#A1AC97',
          400: '#8C9A80',
          500: '#78866B',
          600: '#5C6752',
          700: '#404839',
          800: '#242820',
          900: '#080907',
        },
        danger: colors.red,
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/line-clamp'),
  ],
};
