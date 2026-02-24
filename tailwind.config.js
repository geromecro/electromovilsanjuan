/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        void: '#000000',
        yellow: {
          brand: '#FBC92D',
          dark: '#D4A820',
          light: '#FDD96A',
        },
        dark: '#111111',
        graphite: '#1A1A1A',
        surface: '#0D0D0D',
        ivory: '#F5F3EE',
        muted: '#888888',
      },
      fontFamily: {
        sans: ['"Montserrat"', 'sans-serif'],
        heading: ['"Montserrat"', 'sans-serif'],
        drama: ['"Montserrat"', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
    },
  },
  plugins: [],
}
