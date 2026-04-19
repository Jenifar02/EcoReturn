/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        eco: {
          primary:   '#2e7d32',
          secondary: '#ffffff',
          accent:    '#f2f2f2',
          highlight: '#66bb6a',
          text:      '#333333',
          dark:      {
            bg:      '#0d1f0e',
            card:    '#1a2e1b',
            border:  '#2a4a2b',
            text:    '#e8f5e9',
            muted:   '#81c784',
          }
        }
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'eco': '16px',
        'eco-sm': '12px',
      },
      boxShadow: {
        'eco': '0 12px 30px rgba(0,0,0,0.08)',
        'eco-green': '0 10px 22px rgba(46,125,50,0.22)',
      }
    },
  },
  plugins: [],
}
