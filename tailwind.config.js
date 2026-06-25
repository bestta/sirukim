/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        admin: {
          light: '#f3f4f6',
          DEFAULT: '#6b7280',
          dark: '#374151',
          accent: '#4b5563',
        },
        dinas: {
          light: '#ffedd5',
          DEFAULT: '#f97316',
          dark: '#c2410c',
          accent: '#ea580c',
        },
        uprs: {
          light: '#f3e8ff',
          DEFAULT: '#a855f7',
          dark: '#7e22ce',
          accent: '#9333ea',
        },
        penghuni: {
          light: '#fee2e2',
          DEFAULT: '#ef4444',
          dark: '#b91c1c',
          accent: '#dc2626',
        },
        pimpinan: {
          light: '#dcfce7',
          DEFAULT: '#22c55e',
          dark: '#15803d',
          accent: '#16a34a',
        },
        brand: {
          light: '#fff4e8',
          DEFAULT: '#fa801d',
          dark: '#e86f0f',
          accent: '#c95a08',
        }
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.08)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      backdropBlur: {
        'xs': '2px',
      }
    },
  },
  plugins: [],
}
