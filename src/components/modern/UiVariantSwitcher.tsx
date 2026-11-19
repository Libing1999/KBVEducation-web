import { useEffect, useRef, useState } from 'react';
import { getSelectedUI, setSelectedUI, type UiVariant } from '@/theme/uiSelector';

const VARIANTS: readonly UiVariant[] = ['default', 'modern'];
const POSITION_KEY = 'kbv.ui-switcher-position';
const DRAG_THRESHOLD_PX = 5;

interface Position {
  x: number;
  y: number;
}

function loadPosition(): Position | null {
  try {
    const raw = window.localStorage.getItem(POSITION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.x === 'number' && typeof parsed?.y === 'number') return parsed;
  } catch {
    // ignore — falls back to the default bottom-left position
  }
  return null;
}

function clampToViewport(pos: Position, el: HTMLElement): Position {
  const rect = el.getBoundingClientRect();
  const maxX = window.innerWidth - rect.width;
  const maxY = window.innerHeight - rect.height;
  return { x: Math.min(Math.max(pos.x, 0), Math.max(0, maxX)), y: Math.min(Math.max(pos.y, 0), Math.max(0, maxY)) };
}

interface DragState {
  startX: number;
  startY: number;
  originX: number;
  originY: number;
  dragging: boolean;
  /** The variant whose button was actually pressed, if any — captured at pointerdown so pointerup
   * can dispatch the selection manually. Pointer capture (needed so a fast drag never outruns
   * this element and stops tracking) redirects the native click's target to the capturing
   * element, so the pressed button's own onClick can't be relied on for pointer-driven presses —
   * only for keyboard activation (Enter/Space), which never goes through pointer events at all
   * and is left alone here. */
  variant: UiVariant | null;
}

/**
 * Dev-only floating control for switching the `selected-ui` localStorage
 * preference (Phase 1's "simple UI selection mechanism"). Reloads on change
 * so every provider/route re-resolves cleanly from the new value. Rendered
 * only when env.isDev — never shipped to production users.
 *
 * Draggable: press-and-hold anywhere on the pill and drag it to reposition —
 * a real drag (moved past a small threshold) suppresses the selection that a
 * plain click would otherwise make, so dragging never accidentally flips
 * Default/Modern. The dragged position is persisted (survives the reload a
 * UI switch causes, and future visits) until browser data is cleared. With
 * nothing stored yet, it renders at its original default spot: bottom-left,
 * kept off bottom-right so it never overlaps this app's bottom-right-aligned
 * action buttons.
 */
export function UiVariantSwitcher() {
  const current = getSelectedUI();
  const elRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<Position | null>(() => loadPosition());
  const dragState = useRef<DragState | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleSelect = (ui: UiVariant) => {
    if (ui === current) return;
    setSelectedUI(ui);
    window.location.reload();
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    const el = elRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pressedButton = (e.target as HTMLElement).closest('button[data-variant]') as HTMLButtonElement | null;
    dragState.current = {
      startX: e.clientX,
      startY: e.clientY,
      originX: rect.left,
      originY: rect.top,
      dragging: false,
      variant: (pressedButton?.dataset.variant as UiVariant | undefined) ?? null,
    };
    // Captured unconditionally (not deferred until a drag is confirmed) so a fast drag can never
    // outrun this element mid-gesture and silently stop tracking — see the pointerup handler
    // below for how the resulting "click is redirected here, not the button" tradeoff is handled.
    el.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragState.current;
    const el = elRef.current;
    if (!drag || !el) return;
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    if (!drag.dragging && Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) return;
    drag.dragging = true;
    setIsDragging(true);
    setPosition(clampToViewport({ x: drag.originX + dx, y: drag.originY + dy }, el));
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragState.current;
    const el = elRef.current;
    if (drag && el) {
      if (drag.dragging) {
        const finalPos = clampToViewport({ x: el.getBoundingClientRect().left, y: el.getBoundingClientRect().top }, el);
        setPosition(finalPos);
        try {
          window.localStorage.setItem(POSITION_KEY, JSON.stringify(finalPos));
        } catch {
          // best-effort persistence only
        }
      } else if (drag.variant) {
        // A genuine press-release with no meaningful movement on a variant button — the
        // selection this pointer gesture was for (native click won't fire on the button itself,
        // since pointer capture redirected it to this container).
        handleSelect(drag.variant);
      }
      if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
    }
    dragState.current = null;
    setIsDragging(false);
  };

  // Re-clamp on viewport resize so a saved position never ends up off-screen.
  useEffect(() => {
    const onResize = () => {
      const el = elRef.current;
      if (!el || !position) return;
      setPosition((p) => (p ? clampToViewport(p, el) : p));
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [position]);

  const style: React.CSSProperties = position
    ? { position: 'fixed', left: position.x, top: position.y, bottom: 'auto', right: 'auto' }
    : {};

  return (
    <div
      ref={elRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      style={style}
      // Bottom-left (not bottom-right) default so this never overlaps the bottom-right-aligned
      // action buttons ("Save", "Submit", etc.) that most forms in this app use. Raised on narrow
      // viewports (max-[680px]) so it doesn't sit under the Modern Student shell's bottom-fixed
      // mobile tab bar (see kbvStudentShell.css's own @media(max-width:680px) breakpoint) — only
      // applies to the undragged default position; once dragged, the inline `style` above takes
      // over and the user's own placement is respected everywhere.
      className={
        'fixed bottom-3 left-3 max-[680px]:bottom-16 z-50 flex items-center gap-1 rounded-full border border-slate-300 bg-white/95 p-1 text-xs shadow-card backdrop-blur touch-none select-none ' +
        (isDragging ? 'cursor-grabbing' : 'cursor-grab')
      }
    >
      {VARIANTS.map((ui) => (
        <button
          key={ui}
          type="button"
          data-variant={ui}
          // Keyboard activation (Tab + Enter/Space) never goes through pointer events, so this
          // still fires normally for that case; pointer-driven presses are handled in
          // onPointerUp above instead (see DragState.variant's doc comment for why).
          onClick={() => handleSelect(ui)}
          className={
            'rounded-full px-2.5 py-1 font-medium capitalize transition-colors ' +
            (ui === current ? 'bg-primary text-white' : 'text-slate-500 hover:text-slate-700')
          }
          title={`Switch to ${ui} UI (dev only) — drag the pill to move it`}
        >
          {ui}
        </button>
      ))}
    </div>
  );
}
