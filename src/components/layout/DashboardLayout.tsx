import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar, MobileSidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';

/**
 * Shell for all authenticated pages. The root is locked to the viewport
 * (h-screen + overflow-hidden) so the browser body never scrolls: the
 * sidebar and topbar stay fixed, and <main> is the app's single vertical
 * scroll container. The sidebar's nav additionally scrolls internally when
 * the menu outgrows the viewport (see Sidebar), keeping its bottom user
 * card pinned.
 */
export function DashboardLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-secondary">
      <Sidebar />
      <MobileSidebar open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenuClick={() => setMobileNavOpen(true)} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
