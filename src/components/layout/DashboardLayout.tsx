import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar, MobileSidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';

/** Shell for all authenticated pages: persistent sidebar + topbar + content. */
export function DashboardLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-secondary">
      <Sidebar />
      <MobileSidebar open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenuClick={() => setMobileNavOpen(true)} />
        <main className="flex-1 overflow-x-hidden p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
