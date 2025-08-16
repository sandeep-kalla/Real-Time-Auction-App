/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        // Purple palette from the image
        primary: {
          50: '#f3f1ff',
          100: '#e9e5ff',
          200: '#d6cfff',
          300: '#b8a9ff',
          400: '#9575ff',
          500: '#7a1cac', // Main purple from palette
          600: '#6b0f96',
          700: '#5a0d7a',
          800: '#4a0a63',
          900: '#3d084f',
          950: '#2e073f', // Darkest purple from palette
        },
        accent: {
          50: '#f8f5ff',
          100: '#f0e9ff',
          200: '#e4d4ff',
          300: '#d2b4ff',
          400: '#bd89ff',
          500: '#ad49e1', // Medium purple from palette
          600: '#9333ea',
          700: '#7c2d92',
          800: '#6b2477',
          900: '#581e61',
        },
        dark: {
          900: '#0f0f0f',
          800: '#1a1a1a',
          700: '#262626',
          600: '#404040',
          500: '#525252',
          400: '#737373',
          300: '#a3a3a3',
          200: '#d4d4d4',
          100: '#f5f5f5',
        },
        surface: {
          900: '#111111',
          800: '#1e1e1e',
          700: '#2a2a2a',
          600: '#363636',
          500: '#404040',
        },
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #2e073f 0%, #7a1cac 50%, #ad49e1 100%)',
        'gradient-accent': 'linear-gradient(135deg, #7a1cac 0%, #ad49e1 100%)',
        'gradient-dark': 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%)',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(122, 28, 172, 0.3)',
        'glow-lg': '0 0 40px rgba(122, 28, 172, 0.4)',
        'purple': '0 4px 14px 0 rgba(122, 28, 172, 0.25)',
        'dark': '0 4px 14px 0 rgba(0, 0, 0, 0.5)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite alternate',
        'bounce-gentle': 'bounceGentle 1s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseGlow: {
          '0%': { boxShadow: '0 0 20px rgba(122, 28, 172, 0.3)' },
          '100%': { boxShadow: '0 0 40px rgba(122, 28, 172, 0.6)' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/line-clamp'),
  ],
}