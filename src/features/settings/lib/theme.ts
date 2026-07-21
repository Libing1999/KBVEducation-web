/**
 * Runtime theming palette logic.
 *
 * The Tailwind `primary`/`secondary`/`accent` tokens (their whole shade ramp)
 * resolve to CSS custom properties in RGB-channel form — `rgb(var(--color-x) /
 * <alpha-value>)` — so every existing utility class (`bg-primary-50`,
 * `text-accent-600`, `ring-accent/30`, …) becomes runtime-themeable with no
 * per-component change. This module turns the three admin-picked base colors
 * into the full set of channel values to stamp onto :root.
 *
 * Default preservation: when a base color equals the seeded brand default, we
 * emit the EXACT hand-tuned ramp (mirrored from tailwind.config.js), so an
 * unchanged theme renders pixel-identical to the old static build. Only a
 * genuinely customised color is derived algorithmically.
 */

export const DEFAULT_THEME = {
  primary: '#1B3A6B',
  secondary: '#F2F6FA',
  accent: '#C4972A',
} as const;

/** Exact brand ramps — MUST mirror tailwind.config.js / index.css. */
const DEFAULT_PRIMARY_RAMP: Record<number, string> = {
  50: '#EAF0F8', 100: '#D0DEEF', 200: '#A3BEDE', 300: '#6E97C7', 400: '#3F6FA8',
  500: '#1B3A6B', 600: '#173257', 700: '#122845', 800: '#0D1E34', 900: '#081322',
};
const DEFAULT_ACCENT_RAMP: Record<number, string> = {
  50: '#FBF5E7', 100: '#F5E7C2', 200: '#EBD088', 300: '#DDB44F', 400: '#C4972A',
  500: '#A87F1F', 600: '#87661A', 700: '#654C13', 800: '#43330D', 900: '#221906',
};
const DEFAULT_SECONDARY_RAMP: Record<number, string> = {
  50: '#F8FAFC', 100: '#F2F6FA', 200: '#E4ECF4',
};

const FULL_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const;
const SECONDARY_STEPS = [50, 100, 200] as const;

/** Per-step mix toward white (< 500) or black (> 500) for derived ramps. */
const FULL_MIX: Record<number, { toward: 'white' | 'black'; amount: number }> = {
  50: { toward: 'white', amount: 0.92 },
  100: { toward: 'white', amount: 0.82 },
  200: { toward: 'white', amount: 0.62 },
  300: { toward: 'white', amount: 0.38 },
  400: { toward: 'white', amount: 0.16 },
  600: { toward: 'black', amount: 0.15 },
  700: { toward: 'black', amount: 0.3 },
  800: { toward: 'black', amount: 0.46 },
  900: { toward: 'black', amount: 0.62 },
};
const SECONDARY_MIX: Record<number, { toward: 'white' | 'black'; amount: number }> = {
  50: { toward: 'white', amount: 0.35 },
  100: { toward: 'white', amount: 0 },
  200: { toward: 'black', amount: 0.06 },
};

type Rgb = [number, number, number];

function hexToRgb(hex: string): Rgb {
  const h = hex.replace('#', '').trim();
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ];
}

function channels(hex: string): string {
  const [r, g, b] = hexToRgb(hex);
  return `${r} ${g} ${b}`;
}

function mix([r, g, b]: Rgb, toward: 'white' | 'black', amount: number): string {
  const t = toward === 'white' ? 255 : 0;
  const c = (v: number) => Math.round(v + (t - v) * amount);
  return `${c(r)} ${c(g)} ${c(b)}`;
}

function eq(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

const HEX_RE = /^#[0-9A-Fa-f]{6}$/;
function safe(hex: string | null | undefined, fallback: string): string {
  return hex && HEX_RE.test(hex.trim()) ? hex.trim() : fallback;
}

/**
 * Build `varName -> channelString` for one color family. Uses the exact brand
 * ramp when `base` is the default; otherwise derives every step from `base`.
 */
function rampVars(
  name: 'primary' | 'accent' | 'secondary',
  base: string,
  defaultBase: string,
  defaultRamp: Record<number, string>,
  steps: readonly number[],
  mixMap: Record<number, { toward: 'white' | 'black'; amount: number }>,
): Record<string, string> {
  const out: Record<string, string> = {};
  out[`--color-${name}`] = channels(base);

  const isDefault = eq(base, defaultBase);
  const rgb = hexToRgb(base);
  for (const step of steps) {
    if (isDefault) {
      out[`--color-${name}-${step}`] = channels(defaultRamp[step]);
    } else if (step === 500) {
      out[`--color-${name}-500`] = channels(base);
    } else {
      const m = mixMap[step];
      out[`--color-${name}-${step}`] = m.amount === 0 ? channels(base) : mix(rgb, m.toward, m.amount);
    }
  }
  return out;
}

export interface ThemeColors {
  primary?: string | null;
  secondary?: string | null;
  accent?: string | null;
}

/** Compute every CSS custom property (name -> "R G B") for a theme. */
export function computeThemeVars(colors: ThemeColors): Record<string, string> {
  const primary = safe(colors.primary, DEFAULT_THEME.primary);
  const secondary = safe(colors.secondary, DEFAULT_THEME.secondary);
  const accent = safe(colors.accent, DEFAULT_THEME.accent);

  return {
    ...rampVars('primary', primary, DEFAULT_THEME.primary, DEFAULT_PRIMARY_RAMP, FULL_STEPS, FULL_MIX),
    ...rampVars('accent', accent, DEFAULT_THEME.accent, DEFAULT_ACCENT_RAMP, FULL_STEPS, FULL_MIX),
    ...rampVars('secondary', secondary, DEFAULT_THEME.secondary, DEFAULT_SECONDARY_RAMP, SECONDARY_STEPS, SECONDARY_MIX),
  };
}

/** Stamp a theme onto the document root. Repaints instantly; no React re-render. */
export function applyTheme(colors: ThemeColors, root: HTMLElement = document.documentElement): void {
  const vars = computeThemeVars(colors);
  for (const [name, value] of Object.entries(vars)) {
    root.style.setProperty(name, value);
  }
}
