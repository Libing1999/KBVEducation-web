/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // KBV brand palette — semantic tokens.
        // primary = deep blue, secondary = light background, accent = gold.
        primary: {
          DEFAULT: '#1B3A6B',
          50: '#EAF0F8',
          100: '#D0DEEF',
          200: '#A3BEDE',
          300: '#6E97C7',
          400: '#3F6FA8',
          500: '#1B3A6B',
          600: '#173257',
          700: '#122845',
          800: '#0D1E34',
          900: '#081322',
        },
        accent: {
          DEFAULT: '#C4972A',
          50: '#FBF5E7',
          100: '#F5E7C2',
          200: '#EBD088',
          300: '#DDB44F',
          400: '#C4972A',
          500: '#A87F1F',
          600: '#87661A',
          700: '#654C13',
          800: '#43330D',
          900: '#221906',
        },
        secondary: {
          DEFAULT: '#F2F6FA',
          50: '#F8FAFC',
          100: '#F2F6FA',
          200: '#E4ECF4',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '14px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(16, 24, 40, 0.06), 0 1px 2px rgba(16, 24, 40, 0.04)',
        'card-hover': '0 6px 20px rgba(16, 24, 40, 0.08)',
      },
    },
  },
  plugins: [],
};
