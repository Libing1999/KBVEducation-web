import { getSelectedUI, setSelectedUI, type UiVariant } from '@/theme/uiSelector';

const VARIANTS: readonly UiVariant[] = ['default', 'modern'];

/**
 * Dev-only floating control for switching the `selected-ui` localStorage
 * preference (Phase 1's "simple UI selection mechanism"). Reloads on change
 * so every provider/route re-resolves cleanly from the new value. Rendered
 * only when env.isDev — never shipped to production users.
 */
export function UiVariantSwitcher() {
  const current = getSelectedUI();

  const handleSelect = (ui: UiVariant) => {
    if (ui === current) return;
    setSelectedUI(ui);
    window.location.reload();
  };

  return (
    <div className="fixed bottom-3 right-3 z-50 flex items-center gap-1 rounded-full border border-slate-300 bg-white/95 p-1 text-xs shadow-card backdrop-blur">
      {VARIANTS.map((ui) => (
        <button
          key={ui}
          type="button"
          onClick={() => handleSelect(ui)}
          className={
            'rounded-full px-2.5 py-1 font-medium capitalize transition-colors ' +
            (ui === current ? 'bg-primary text-white' : 'text-slate-500 hover:text-slate-700')
          }
          title={`Switch to ${ui} UI (dev only)`}
        >
          {ui}
        </button>
      ))}
    </div>
  );
}
