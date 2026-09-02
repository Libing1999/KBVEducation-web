import { createPortal } from 'react-dom';
import { Navigate } from 'react-router-dom';
import ModernLogPage from '@/pages/modern/student/ModernLogPage';
import { ModernStudentShell } from '@/layouts/modern/ModernStudentShell';
import { useSelectedUI } from '@/theme/uiSelector';
import { paths } from '@/routes/paths';

/**
 * /log is a Modern-only concept (combines the Default UI's separate
 * Reflections/Practice pages into one today-only view) — Default UI has no
 * nav link to it, so it just redirects to Reflections rather than needing a
 * parallel Default implementation of a screen the customer didn't ask for
 * outside the Modern redesign.
 */
export function LogRoute() {
  const ui = useSelectedUI();
  if (ui !== 'modern') {
    return <Navigate to={paths.reflections} replace />;
  }
  return createPortal(
    <div className="fixed inset-0 z-40 overflow-y-auto">
      <ModernStudentShell active="log">
        <ModernLogPage />
      </ModernStudentShell>
    </div>,
    document.body,
  );
}
