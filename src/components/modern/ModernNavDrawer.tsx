import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { SidebarContent } from '@/components/layout/Sidebar';

/**
 * Modern UI's navigation affordance — a slide-over drawer so students/parents
 * can still reach every other page (Practice, Reflections, Lessons, …) from
 * the full-bleed Modern Dashboard, which has no persistent sidebar. Reuses
 * <SidebarContent> as-is: same nav items, same role filtering, same active-
 * route highlighting, same profile/logout menu as the Default UI — only the
 * surrounding drawer chrome is new.
 */
export function ModernNavDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    return () => {
      previouslyFocused.current?.focus();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div className="kbv-modern-nav absolute inset-y-0 left-0 w-72 shadow-2xl">
        <SidebarContent onNavigate={onClose} />
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close navigation"
        className="absolute left-72 top-4 ml-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur hover:bg-white/20"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
