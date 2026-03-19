import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: { '2xl': '1400px' },
    },
    extend: {
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        rajdhani: ['Rajdhani', 'sans-serif'],
      },
      colors: {
        background: '#0A0A0A',
        neon: {
          cyan: '#00F0FF',
          green: '#39FF14',
        },
        gray: {
          950: '#0A0A0A',
          900: '#111111',
          800: '#1a1a1a',
          700: '#2a2a2a',
          600: '#3a3a3a',
          500: '#6b6b6b',
          400: '#9b9b9b',
        },
      },
      boxShadow: {
        'neon-cyan': '0 0 30px #00F0FF',
        'neon-green': '0 0 30px #39FF14',
        'neon-cyan-sm': '0 0 15px rgba(0, 240, 255, 0.4)',
        'neon-green-sm': '0 0 15px rgba(57, 255, 20, 0.4)',
      },
      textShadow: {
        neon: '0 0 10px rgba(0, 240, 255, 0.5), 0 0 20px rgba(0, 240, 255, 0.3)',
        'neon-green': '0 0 10px rgba(57, 255, 20, 0.5), 0 0 20px rgba(57, 255, 20, 0.3)',
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
          '0%, 100%': { boxShadow: '0 0 10px rgba(0, 240, 255, 0.2)' },
          '50%': { boxShadow: '0 0 30px rgba(0, 240, 255, 0.4)' },
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config
