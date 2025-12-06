/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'pulse-soft': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'sunrise-spin': 'spin 2s linear infinite',
        'candle-pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'cinema-zoom': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'radar-pulse': 'pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'wiggle': 'wiggle 0.3s ease-in-out infinite',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-1deg)' },
          '50%': { transform: 'rotate(1deg)' },
        },
      },
    },
  },
  plugins: [],
}
