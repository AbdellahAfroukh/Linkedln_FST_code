/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        academic: {
          primary: '#1e40af', // blue-800
          secondary: '#0f766e', // teal-700
          accent: '#7c3aed', // violet-600
          dark: '#1e293b', // slate-800
          light: '#f8fafc', // slate-50
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
