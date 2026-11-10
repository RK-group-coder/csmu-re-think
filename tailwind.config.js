/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: '#F7F4EF',
          card: '#FCFBF9',
          muted: '#EFECE6',
          border: '#DFDBD2',
          dark: '#E5E0D5',
        },
        csmu: {
          DEFAULT: '#1B5E4A',
          dark: '#134436',
          light: '#E6F0EC',
          accent: '#2C7A62',
        },
        terracotta: {
          DEFAULT: '#C85A28',
          light: '#FBECE6',
          dark: '#9E4218',
        },
        ink: {
          DEFAULT: '#1E201D',
          muted: '#5A5D58',
          faint: '#8C8F89',
        }
      },
      fontFamily: {
        sans: ['"Noto Sans TC"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        serif: ['"Noto Serif TC"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'subtle': '0 1px 3px rgba(30, 32, 29, 0.05), 0 1px 2px rgba(30, 32, 29, 0.03)',
        'card': '0 4px 12px -2px rgba(30, 32, 29, 0.06), 0 2px 4px -2px rgba(30, 32, 29, 0.04)',
      }
    },
  },
  plugins: [],
}

