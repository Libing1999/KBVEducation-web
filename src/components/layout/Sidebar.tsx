import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  UserRound,
  Layers,
  BookOpen,
  UserCircle,
  PenLine,
  BookOpenCheck,
  Activity,
  CalendarDays,
  SlidersHorizontal,
  Award,
  History,
  Trophy,
  BarChart3,
  FileBadge,
  ScrollText,
  FileDown,
  ShieldCheck,
  Settings,
  DatabaseBackup,
  AlertTriangle,
  type LucideIcon,
} from 'lucide-react';
import { useAuthStore } from '@/features/auth/store/authStore';
import { usePublicSettings } from '@/features/settings/hooks/useSettings';
import type { Role } from '@/features/auth/types/auth.types';
import { paths } from '@/routes/paths';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  roles: Role[];
}

const navItems: NavItem[] = [
  { label: 'Dashboard', to: paths.dashboard, icon: LayoutDashboard, roles: ['SUPER_ADMIN', 'STUDENT', 'PARENT'] },
  { label: 'Users', to: paths.admin.users, icon: Users, roles: ['SUPER_ADMIN'] },
  { label: 'Students', to: paths.admin.students, icon: GraduationCap, roles: ['SUPER_ADMIN'] },
  { label: 'Parents', to: paths.admin.parents, icon: UserRound, roles: ['SUPER_ADMIN'] },
  { label: 'Cohorts', to: paths.admin.cohorts, icon: Layers, roles: ['SUPER_ADMIN'] },
  { label: 'Lessons', to: paths.admin.lessons, icon: BookOpen, roles: ['SUPER_ADMIN'] },
  { label: 'Reflections', to: paths.admin.reflections, icon: PenLine, roles: ['SUPER_ADMIN'] },
  { label: 'Practice Review', to: paths.admin.practice, icon: BookOpenCheck, roles: ['SUPER_ADMIN'] },
  { label: 'Score Config', to: paths.admin.scoreConfig, icon: SlidersHorizontal, roles: ['SUPER_ADMIN'] },
  { label: 'Tier Rules', to: paths.admin.tierRules, icon: Award, roles: ['SUPER_ADMIN'] },
  { label: 'Audit Log', to: paths.admin.auditLog, icon: History, roles: ['SUPER_ADMIN'] },
  { label: 'Leaderboard', to: paths.admin.leaderboard, icon: Trophy, roles: ['SUPER_ADMIN'] },
  { label: 'Analytics', to: paths.admin.analytics, icon: BarChart3, roles: ['SUPER_ADMIN'] },
  { label: 'Certificate Templates', to: paths.admin.certificateTemplates, icon: FileBadge, roles: ['SUPER_ADMIN'] },
  { label: 'Certificates', to: paths.admin.certificates, icon: ScrollText, roles: ['SUPER_ADMIN'] },
  { label: 'Data Export', to: paths.admin.dataExport, icon: FileDown, roles: ['SUPER_ADMIN'] },
  { label: 'Audit Trail', to: paths.admin.auditTrail, icon: ShieldCheck, roles: ['SUPER_ADMIN'] },
  { label: 'Settings', to: paths.admin.settings, icon: Settings, roles: ['SUPER_ADMIN'] },
  { label: 'Backups', to: paths.admin.backups, icon: DatabaseBackup, roles: ['SUPER_ADMIN'] },
  { label: 'Application Logs', to: paths.admin.applicationLogs, icon: AlertTriangle, roles: ['SUPER_ADMIN'] },
  { label: 'My Lessons', to: paths.myLessons, icon: BookOpen, roles: ['STUDENT', 'PARENT'] },
  { label: 'Reflections', to: paths.reflections, icon: PenLine, roles: ['STUDENT'] },
  { label: 'Practice', to: paths.practice, icon: BookOpenCheck, roles: ['STUDENT'] },
  { label: 'Leaderboard', to: paths.leaderboard, icon: Trophy, roles: ['STUDENT'] },
  { label: 'Activity', to: paths.activity, icon: Activity, roles: ['STUDENT', 'PARENT'] },
  { label: 'Calendar', to: paths.calendar, icon: CalendarDays, roles: ['STUDENT', 'PARENT'] },
  { label: 'Certificates', to: paths.certificates, icon: ScrollText, roles: ['STUDENT', 'PARENT'] },
  { label: 'Profile', to: paths.profile, icon: UserCircle, roles: ['SUPER_ADMIN', 'STUDENT', 'PARENT'] },
];

/** Brand header + nav; shared by the desktop sidebar and the mobile drawer. */
export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const role = useAuthStore((s) => s.user?.role);
  const items = navItems.filter((item) => role && item.roles.includes(role));
  const { data: publicSettings } = usePublicSettings();
  const appName = publicSettings?.applicationName ?? 'KBV Education';
  const logoUrl = publicSettings?.logoPath?.startsWith('http') ? publicSettings.logoPath : null;

  return (
    <div className="flex h-full w-full flex-col bg-[var(--color-primary)] text-primary-100">
      <div className="flex h-16 items-center gap-3 border-b border-white/10 px-6">
        {logoUrl ? (
          <img src={logoUrl} alt={appName} className="h-9 w-9 rounded-lg object-contain" />
        ) : (
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-white">
            <GraduationCap className="h-5 w-5" />
          </div>
        )}
        <span className="truncate text-base font-bold text-white">{appName}</span>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {items.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === paths.dashboard}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive ? 'bg-white/10 text-white' : 'text-primary-100 hover:bg-white/10 hover:text-white',
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute inset-y-1.5 left-0 w-1 rounded-full bg-accent" aria-hidden />
                )}
                <Icon className={cn('h-5 w-5', isActive ? 'text-accent-300' : 'text-primary-200')} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/10 p-4 text-xs text-primary-200">KBV Education · Phase 1</div>
    </div>
  );
}

/** Persistent sidebar for md+ screens. */
export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 md:flex">
      <SidebarContent />
    </aside>
  );
}

/** Slide-over drawer variant for small screens. */
export function MobileSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-slate-900/50" onClick={onClose} aria-hidden />
      <div className="absolute inset-y-0 left-0 w-64 shadow-xl">
        <SidebarContent onNavigate={onClose} />
      </div>
    </div>
  );
}
