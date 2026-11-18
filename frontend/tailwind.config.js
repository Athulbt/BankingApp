/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        // Primary brand blue
        brand: {
          50: '#eef4ff',
          100: '#dae6ff',
          200: '#bdd3ff',
          300: '#90b6fe',
          400: '#5c8ffb',
          500: '#3768f6',
          600: '#2149eb',
          700: '#1a37d0',
          800: '#1b30a8',
          900: '#1c2e84',
        },
        // Deep navy for the sidebar, hero panels and cards
        navy: {
          600: '#26406b',
          700: '#1a2f53',
          800: '#11223f',
          900: '#0b1830',
          950: '#060f20',
        },
      },
      boxShadow: {
        card: '0 1px 2px 0 rgb(16 24 40 / 0.04), 0 1px 3px 0 rgb(16 24 40 / 0.06)',
        lift: '0 12px 32px -12px rgb(16 24 40 / 0.18)',
      },
    },
  },
  plugins: [],
}
