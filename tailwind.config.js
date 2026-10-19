/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#080d17',
          sidebar: '#0a101d',
          card: '#0f1828',
          cardHover: '#131f33',
          cardBorder: '#1c293d',
          subtleBorder: 'rgba(255, 255, 255, 0.07)',
        },
        brand: {
          emerald: '#10b981',
          teal: '#14b8a6',
          cyan: '#06b6d4',
          indigo: '#6366f1',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
