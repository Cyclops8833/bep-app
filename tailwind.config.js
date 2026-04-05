/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bep: {
          lacquer:      '#7C2D12',
          turmeric:     '#B45309',
          amber:        '#D97706',
          cream:        '#FEF3C7',
          rice:         '#FAFAF9',
          charcoal:     '#1C1917',
          stone:        '#78716C',
          pebble:       '#E7E5E4',
          surface:      '#FFFFFF',
          profit:       '#059669',
          'profit-bg':  '#D1FAE5',
          loss:         '#DC2626',
          'loss-bg':    '#FEE2E2',
          warning:      '#D97706',
          'warning-bg': '#FEF3C7',
        },
      },
      fontFamily: {
        ui:    ['"Be Vietnam Pro"', 'Inter', 'sans-serif'],
        brand: ['Georgia', '"Times New Roman"', 'serif'],
        mono:  ['"JetBrains Mono"', '"Courier New"', 'monospace'],
      },
    },
  },
  plugins: [],
}
