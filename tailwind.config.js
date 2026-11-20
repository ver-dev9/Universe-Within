/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // v2 design system — "Universe Within" cosmic palette
        cosmos: {
          void: '#03040A',
          deep: '#080B16',
          blue: '#3478D4',
          violet: '#8A5BCA',
          cyan: '#69D9EF',
          gold: '#E7B86B',
          white: '#EEF2FA',
          muted: '#929CAF',
        },
        // v1 tokens, remapped onto the v2 palette so existing sections inherit it
        space: {
          darkest: '#03040A',
          darker: '#080B16',
          blue: '#101B36',
          cyan: '#69D9EF',
          purple: '#8A5BCA',
          white: '#EEF2FA',
          muted: '#929CAF',
          accent: '#69D9EF',
          gold: '#E7B86B',
        }
      },
      fontFamily: {
        display: ['"Instrument Serif"', 'Georgia', 'serif'],
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
