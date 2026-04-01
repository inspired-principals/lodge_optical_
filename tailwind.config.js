/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' }
        }
      },
      boxShadow: {
        'xs': '0 1px 2px rgba(0,0,0,0.05)',
        'sm': '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)',
        'md': '0 4px 6px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)',
        'lg': '0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)',
        'xl': '0 20px 25px rgba(0,0,0,0.15), 0 10px 10px rgba(0,0,0,0.05)',
        'glow-blue': '0 0 20px rgba(37, 99, 235, 0.4)',
        'glow-blue-lg': '0 0 40px rgba(37, 99, 235, 0.5)',
      },
      borderRadius: {
        'sm': '0.375rem',     /* 6px */
        'md': '0.5rem',       /* 8px */
        'lg': '0.75rem',      /* 12px */
        'xl': '1rem',         /* 16px */
        '2xl': '1.5rem',      /* 24px */
        '3xl': '2rem',        /* 32px */
        'full': '9999px',
      }
    },
  },
  plugins: [],
}
