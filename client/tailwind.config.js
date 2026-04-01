/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        display: ['Space Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        bg: 'rgb(var(--bg) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        card: 'rgb(var(--card) / <alpha-value>)',
        'card-hover': 'rgb(var(--card-hover) / <alpha-value>)',
        border: 'rgb(var(--border) / <alpha-value>)',
        accent: 'rgb(var(--accent) / <alpha-value>)',
        'accent-glow': 'rgb(var(--accent) / 0.15)',
        green: 'rgb(var(--green) / <alpha-value>)',
        'green-glow': 'rgb(var(--green) / 0.2)',
        amber: 'rgb(var(--amber) / <alpha-value>)',
        'amber-glow': 'rgb(var(--amber) / 0.15)',
        red: 'rgb(var(--red) / <alpha-value>)',
        purple: 'rgb(var(--purple) / <alpha-value>)',
        'purple-glow': 'rgb(var(--purple) / 0.15)',
        text: 'rgb(var(--text) / <alpha-value>)',
        'text-muted': 'rgb(var(--text-muted) / <alpha-value>)',
        'text-dim': 'rgb(var(--text-dim) / <alpha-value>)',
      },
      boxShadow: {
        'level-1': '0 1px 3px rgba(0,0,0,0.4)',
        'level-2': '0 4px 16px rgba(0,0,0,0.5)',
        'level-3': '0 8px 32px rgba(0,0,0,0.6)',
        'glow-accent': '0 0 20px rgba(0,212,255,0.13), 0 0 40px rgba(0,212,255,0.06)',
        'glow-green': '0 0 20px rgba(16,185,129,0.13), 0 0 40px rgba(16,185,129,0.06)',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        }
      },
      animation: {
        marquee: 'marquee 25s linear infinite',
      }
    },
  },
  plugins: [],
}
