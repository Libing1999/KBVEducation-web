import { useEffect, useState } from 'react';
import { useCountUp } from '@/components/modern/useCountUp';

interface MedallionRingProps {
  value: number;
  max?: number;
  size?: number;
}

/** The "medallion" score ring — number-as-hero on navy, one luminous gold hairline. */
export function MedallionRing({ value, max = 100, size = 320 }: MedallionRingProps) {
  const strokeWidth = 6;
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, value / max));
  const targetOffset = circumference * (1 - pct);
  const displayed = useCountUp(Math.round(value));
  const [offset, setOffset] = useState(circumference);

  useEffect(() => {
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setOffset(targetOffset);
      return;
    }
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setOffset(targetOffset));
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [targetOffset]);

  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <defs>
          <linearGradient id="kbv-ring-gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#E9C766" />
            <stop offset=".5" stopColor="#F7E2A0" />
            <stop offset="1" stopColor="#FFF4CE" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(238,242,249,.08)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#kbv-ring-gold)"
          strokeWidth={strokeWidth + 1}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: 'stroke-dashoffset 1.4s cubic-bezier(.16,1,.3,1)',
            filter: 'drop-shadow(0 0 7px rgba(244,216,136,.45))',
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className="font-garamond font-semibold text-[#F4EEDD]"
          style={{ fontSize: 'clamp(94px,17vh,154px)', lineHeight: 0.82 }}
        >
          {displayed}
        </span>
      </div>
    </div>
  );
}
