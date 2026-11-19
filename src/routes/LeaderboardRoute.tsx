import { createPortal } from 'react-dom';
import LeaderboardPage from '@/features/leaderboard/pages/LeaderboardPage';
import ModernLeaderboardPage from '@/pages/modern/student/ModernLeaderboardPage';
import { ModernStudentShell } from '@/layouts/modern/ModernStudentShell';
import { useSelectedUI } from '@/theme/uiSelector';

/**
 * Resolves /leaderboard to the Default or Modern UI, mirroring DashboardRoute.
 * Modern UI escapes the hamburger ModernAppShell entirely (no side nav) and
 * renders inside the shared 3-tab ModernStudentShell instead, via the same
 * document.body portal technique the Dashboard route uses.
 */
export function LeaderboardRoute() {
  const ui = useSelectedUI();
  if (ui !== 'modern') {
    return <LeaderboardPage />;
  }
  return createPortal(
    <div className="fixed inset-0 z-40 overflow-y-auto">
      <ModernStudentShell active="leaderboard">
        <ModernLeaderboardPage />
      </ModernStudentShell>
    </div>,
    document.body,
  );
}
