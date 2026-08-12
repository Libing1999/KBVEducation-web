import type { ComponentType } from 'react';
import { useSelectedUI } from '@/theme/uiSelector';

/**
 * Generic per-route resolver: renders `Modern` when selected-ui=modern,
 * otherwise the exact unchanged Default component. Used for admin routes
 * that have been ported to Modern UI — every route not wrapped with this
 * keeps rendering its Default page even in modern mode, until ported.
 */
export function modernAware(Default: ComponentType, Modern: ComponentType): ComponentType {
  function ModernAwareRoute() {
    const ui = useSelectedUI();
    return ui === 'modern' ? <Modern /> : <Default />;
  }
  ModernAwareRoute.displayName = `ModernAware(${Default.displayName ?? Default.name ?? 'Component'})`;
  return ModernAwareRoute;
}
