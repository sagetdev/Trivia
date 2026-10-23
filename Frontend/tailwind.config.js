/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './app/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#F5F3FF',
          100: '#EDE9FE',
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
        },
        ink: '#19172A',
        muted: '#77758A',
        canvas: '#F8F7FC',
        line: '#E9E7F0',
        success: '#16865B',
        danger: '#D94B63',
      },
      fontFamily: {
        sans: ['Inter'],
      },
    },
  },
  plugins: [],
};
