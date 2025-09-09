/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'brand-primary': {
          DEFAULT: '#4A4BB6',
          50: '#f0f0ff',
          100: '#e0e1ff',
          200: '#c7c9ff',
          300: '#a5a8ff',
          400: '#8084ff',
          500: '#4A4BB6',
          600: '#3d3e9a',
          700: '#32337d',
          800: '#282965',
          900: '#252654',
          'hover': '#3d3e9a',
          'focus': '#32337d',
          'light': '#f0f0ff',
        },
        'brand-background': {
          DEFAULT: '#FAF9FE',
        },
        'brand-lesson-plan': {
          DEFAULT: '#F9F8F7',
        },
        'brand-border-light': {
          DEFAULT: '#E0E0E0',
        }
      }
    },
    animation: {
      'spin': 'spin 2s linear infinite',
    },
    extend: {
      // Add line-clamp utilities
      lineClamp: {
        1: '1',
        2: '2',
        3: '3',
        4: '4',
        5: '5',
        6: '6',
      }
    }
  },
  plugins: [
    require('@tailwindcss/line-clamp')
  ],
};