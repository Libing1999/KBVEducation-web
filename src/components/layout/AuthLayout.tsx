import { Outlet } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import { env } from '@/config/env';

/** Centered, branded layout for unauthenticated pages (login, forgot password). */
export function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white">
            <GraduationCap className="h-6 w-6" />
          </div>
          <h1 className="text-lg font-semibold text-primary">{env.appName}</h1>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card sm:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
