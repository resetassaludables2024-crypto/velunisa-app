import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          charcoal: '#4F5353',
          cream:    '#ECDBCE',
          tan:      '#DBBBA4',
          white:    '#FFFFFF',
          red:      '#E63946',
          dark:     '#0C1B2C',
          muted:    '#888888',
          bg:       '#FBFBFB',
        },
      },
      fontFamily: {
        serif: ['var(--font-playfair)', 'Georgia', 'serif'],
        sans:  ['var(--font-opensans)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        pill: '50px',
      },
      maxWidth: {
        container: '1510px',
      },
      screens: {
        tablet:  '768px',
        laptop:  '1124px',
        desktop: '1510px',
      },
      transitionDuration: {
        hover: '400ms',
        ui:    '200ms',
      },
      backgroundImage: {
        'hero-overlay': 'linear-gradient(to right, rgba(12,27,44,0.7) 0%, rgba(12,27,44,0.2) 60%, transparent 100%)',
      },
      keyframes: {
        'slide-in-right': {
          from: { transform: 'translateX(100%)' },
          to:   { transform: 'translateX(0)' },
        },
        'slide-out-right': {
          from: { transform: 'translateX(0)' },
          to:   { transform: 'translateX(100%)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        'shimmer': {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'slide-in-right':  'slide-in-right 0.3s ease forwards',
        'slide-out-right': 'slide-out-right 0.3s ease forwards',
        'fade-in':         'fade-in 0.4s ease forwards',
        'shimmer':         'shimmer 1.5s infinite linear',
      },
    },
  },
  plugins: [],
}

export default config
