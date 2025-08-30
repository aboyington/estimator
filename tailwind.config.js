/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./packages.js"],
  theme: {
    extend: {
      colors: {
        'udora': {
          50: '#f0f4f8',
          100: '#dae8f0',
          200: '#b8d1e0',
          300: '#8fb5cc',
          400: '#6a95b5',
          500: '#2a5298',
          600: '#1e3c72',
          700: '#1a3461',
          800: '#162b52',
          900: '#132545',
        },
        'brand': {
          primary: '#1e3c72',
          secondary: '#2a5298',
          light: '#f5f7fa',
        }
      },
      fontFamily: {
        'sans': ['Segoe UI', 'Tahoma', 'Geneva', 'Verdana', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 10px rgba(0, 0, 0, 0.1)',
        'modal': '0 10px 30px rgba(0, 0, 0, 0.2)',
      },
      borderRadius: {
        'card': '10px',
        'input': '5px',
        'badge': '15px',
      },
      animation: {
        'toast': 'toast 0.5s ease-in-out',
        'fade-in': 'fadeIn 0.5s ease-in-out',
      },
      keyframes: {
        toast: {
          '0%': { opacity: '0', transform: 'translateX(100%)' },
          '100%': { opacity: '1', transform: 'translateX(0)' }
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        }
      }
    }
  },
  plugins: []
}
