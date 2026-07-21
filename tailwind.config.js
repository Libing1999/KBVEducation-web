/** Reference a CSS var as a Tailwind color, with opacity-modifier support. */
const v = (name) => `rgb(var(${name}) / <alpha-value>)`;

/** Full 50–900 ramp (+ DEFAULT = 500) mapped to CSS vars. */
const ramp = (base) => ({
  DEFAULT: v(base),
  50: v(`${base}-50`),
  100: v(`${base}-100`),
  200: v(`${base}-200`),
  300: v(`${base}-300`),
  400: v(`${base}-400`),
  500: v(`${base}-500`),
  600: v(`${base}-600`),
  700: v(`${base}-700`),
  800: v(`${base}-800`),
  900: v(`${base}-900`),
});

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // KBV brand palette — semantic tokens.
        // primary = deep blue, secondary = light background, accent = gold.
        //
        // Each token resolves to a CSS custom property in RGB-channel form so
        // the whole ramp is themeable at runtime (admin Theme Settings) while
        // Tailwind's opacity modifiers (e.g. `ring-accent/30`) keep working.
        // The channel defaults live in src/index.css :root and are re-stamped
        // by ThemeProvider; they mirror the original hex ramp exactly, so an
        // unchanged theme is pixel-identical to the previous static build.
        primary: ramp('--color-primary'),
        accent: ramp('--color-accent'),
        secondary: {
          DEFAULT: v('--color-secondary'),
          50: v('--color-secondary-50'),
          100: v('--color-secondary-100'),
          200: v('--color-secondary-200'),
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
