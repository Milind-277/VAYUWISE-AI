/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        aqi: {
          good: '#10b981',        // 0-50 Green
          satisfactory: '#84cc16',// 51-100 Light Green
          moderate: '#eab308',    // 101-200 Yellow
          poor: '#f97316',        // 201-300 Orange
          veryPoor: '#ef4444',    // 301-400 Red
          severe: '#7f1d1d',      // 401-500 Maroon / Dark Red
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
