import type { ReactNode } from 'react';
import { GRAIN_TEXTURE_URI } from '@/theme/grainTexture';

/**
 * Full-bleed, dark two-panel shell for the Modern UI's unauthenticated
 * screens — direct port of the design system's editorial sign-in layout
 * (dimensional navy brand field + calm opaque form panel, dark only).
 * Isolated from the Default UI's <AuthLayout /> — no shared markup, no
 * shared CSS vars, so Default UI pages are unaffected by anything here.
 */
export function ModernAuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen grid-cols-1 bg-[#0A1428] font-modern min-[821px]:grid-cols-[1.08fr_0.92fr]">
      <div
        className="relative flex min-h-[34vh] items-center justify-center overflow-hidden p-[clamp(28px,8vw,48px)] min-[821px]:min-h-0 min-[821px]:p-[clamp(28px,5vw,64px)]"
        style={{
          background:
            'radial-gradient(130% 90% at 50% -12%, rgba(74,104,166,.32), transparent 58%), linear-gradient(180deg,#0E1B36,#0A1428 52%,#070E1C)',
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-50 mix-blend-overlay"
          style={{ backgroundSize: '170px 170px', backgroundImage: `url("${GRAIN_TEXTURE_URI}")` }}
        />
        <div className="relative text-center">
          <p className="pl-[0.22em] font-garamond text-[clamp(46px,6.5vw,78px)] font-semibold leading-none tracking-[0.22em] text-[#F4EEDD]">
            KBV
          </p>
          <div className="mx-auto my-[clamp(16px,2.4vw,22px)] h-px w-16 bg-[#B0821C] opacity-85" />
          <p className="pl-[0.42em] text-[11px] font-medium uppercase tracking-[0.42em] text-[rgba(238,242,249,.72)]">
            Education
          </p>
        </div>
      </div>

      <div
        className="relative z-[2] flex items-center justify-center p-[clamp(30px,5vw,56px)]"
        style={{
          background: 'linear-gradient(180deg,#0C1526,#0A1220)',
          boxShadow: '-26px 0 60px rgba(0,0,0,.34)',
        }}
      >
        <div className="w-full max-w-[344px]">{children}</div>
      </div>
    </div>
  );
}
