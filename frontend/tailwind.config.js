/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#1d4ed8', light: '#3b82f6', dark: '#1e3a8a', 50: '#eff6ff' },
      },
      animation: { 'fade-in': 'fadeIn 0.3s ease-out', 'slide-up': 'slideUp 0.3s ease-out' },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { transform: 'translateY(8px)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } },
      },
    },
  },
  plugins: [],
};
