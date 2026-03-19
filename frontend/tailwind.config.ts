import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: { '2xl': '1400px' },
    },
    extend: {
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        rajdhani: ['Rajdhani', 'sans-serif'],
      },
      colors: {
        gray: {
          950: '#0a0a0f',
          900: '#111118',
          800: '#1a1a24',
          700: '#2a2a38',
          600: '#3a3a4a',
          500: '#6b6b80',
          400: '#9b9bb0',
        },
        cyan: {
          400: '#00d9ff',
          500: '#00c4e6',
          600: '#00a8c4',
        },
        green: {
          400: '#00ff88',
          500: '#00e67a',
          600: '#00cc6b',
        },
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 5px rgba(0, 217, 255, 0.2)' },
          '50%': { boxShadow: '0 0 20px rgba(0, 217, 255, 0.4)' },
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config
