/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        space: {
          darkest: '#03050B',
          darker: '#080D18',
          blue: '#101B36',
          cyan: '#48CFFF',
          purple: '#8D62FF',
          white: '#F5F8FF',
          muted: '#9BA9C0',
          accent: '#00F0FF',
          gold: '#FFD166',
        }
      },
      fontFamily: {
        heading: ['"Space Grotesk"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      backgroundImage: {
        'radial-glow': 'radial-gradient(circle at center, rgba(72, 207, 255, 0.15) 0%, transparent 70%)',
        'purple-glow': 'radial-gradient(circle at center, rgba(141, 98, 255, 0.18) 0%, transparent 65%)',
        'nebula-gradient': 'linear-gradient(135deg, rgba(141, 98, 255, 0.1) 0%, rgba(72, 207, 255, 0.1) 100%)',
      },
      animation: {
        'pulse-slow': 'pulse 6s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 8s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
