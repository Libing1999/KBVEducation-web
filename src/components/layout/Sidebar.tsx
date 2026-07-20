import { useEffect, useMemo, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
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
  Library,
  ClipboardList,
  BadgeCheck,
  Wrench,
  Mail,
  ChevronDown,
  type LucideIcon,
} from 'lucide-react';
import { useAuthStore } from '@/features/auth/store/authStore';
import { SidebarUserProfile } from '@/components/layout/SidebarUserProfile';
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

interface NavLeaf {
  label: string;
  to: string;
  icon: LucideIcon;
}

interface NavGroup {
  id: string;
  label: string;
  icon: LucideIcon;
  items: NavLeaf[];
}

/** Non-admin flat nav (unchanged from the original list) — Dashboard/Profile
 * are rendered separately for SUPER_ADMIN, so their roles here exclude it. */
const navItems: NavItem[] = [
  { label: 'Dashboard', to: paths.dashboard, icon: LayoutDashboard, roles: ['STUDENT', 'PARENT'] },
  { label: 'My Lessons', to: paths.myLessons, icon: BookOpen, roles: ['STUDENT', 'PARENT'] },
  { label: 'Reflections', to: paths.reflections, icon: PenLine, roles: ['STUDENT'] },
  { label: 'Practice', to: paths.practice, icon: BookOpenCheck, roles: ['STUDENT'] },
  { label: 'Leaderboard', to: paths.leaderboard, icon: Trophy, roles: ['STUDENT'] },
  { label: 'Activity', to: paths.activity, icon: Activity, roles: ['STUDENT', 'PARENT'] },
  { label: 'Calendar', to: paths.calendar, icon: CalendarDays, roles: ['STUDENT', 'PARENT'] },
  { label: 'Certificates', to: paths.certificates, icon: ScrollText, roles: ['STUDENT', 'PARENT'] },
  { label: 'Profile', to: paths.profile, icon: UserCircle, roles: ['STUDENT', 'PARENT'] },
];

/** Grouped, collapsible admin navigation. Same routes/permissions as before —
 * only the structure changed (flat list -> accordion groups). */
const adminGroups: NavGroup[] = [
  {
    id: 'user-management',
    label: 'User Management',
    icon: Users,
    items: [
      { label: 'Users', to: paths.admin.users, icon: Users },
      { label: 'Students', to: paths.admin.students, icon: GraduationCap },
      { label: 'Parents', to: paths.admin.parents, icon: UserRound },
    ],
  },
  {
    id: 'academic-management',
    label: 'Academic Management',
    icon: Library,
    items: [
      { label: 'Cohorts', to: paths.admin.cohorts, icon: Layers },
      { label: 'Lessons', to: paths.admin.lessons, icon: BookOpen },
      { label: 'Reflections', to: paths.admin.reflections, icon: PenLine },
      { label: 'Practice Review', to: paths.admin.practice, icon: BookOpenCheck },
    ],
  },
  {
    id: 'assessment',
    label: 'Assessment',
    icon: ClipboardList,
    items: [
      { label: 'Score Config', to: paths.admin.scoreConfig, icon: SlidersHorizontal },
      { label: 'Tier Rules', to: paths.admin.tierRules, icon: Award },
      { label: 'Leaderboard', to: paths.admin.leaderboard, icon: Trophy },
      { label: 'Analytics', to: paths.admin.analytics, icon: BarChart3 },
    ],
  },
  {
    id: 'certificates',
    label: 'Certificates',
    icon: BadgeCheck,
    items: [
      { label: 'Certificate Templates', to: paths.admin.certificateTemplates, icon: FileBadge },
      { label: 'Certificates', to: paths.admin.certificates, icon: ScrollText },
    ],
  },
  {
    id: 'system-management',
    label: 'System Management',
    icon: Wrench,
    items: [
      { label: 'Settings', to: paths.admin.settings, icon: Settings },
      { label: 'Email Settings', to: paths.admin.emailSettings, icon: Mail },
      { label: 'Data Export', to: paths.admin.dataExport, icon: FileDown },
      { label: 'Audit Log', to: paths.admin.auditLog, icon: History },
      { label: 'Audit Trail', to: paths.admin.auditTrail, icon: ShieldCheck },
      { label: 'Application Logs', to: paths.admin.applicationLogs, icon: AlertTriangle },
      { label: 'Backups', to: paths.admin.backups, icon: DatabaseBackup },
    ],
  },
  {
    id: 'my-account',
    label: 'My Account',
    icon: UserCircle,
    items: [{ label: 'Profile', to: paths.profile, icon: UserCircle }],
  },
];

const EXPANDED_GROUP_STORAGE_KEY = 'kbv.admin-sidebar.expanded-group';

/** Mirrors react-router NavLink's default (non-`end`) active-match rule. */
function isPathActive(pathname: string, to: string): boolean {
  return pathname === to || pathname.startsWith(`${to}/`);
}

function findGroupForPath(pathname: string): string | null {
  const group = adminGroups.find((g) => g.items.some((item) => isPathActive(pathname, item.to)));
  return group?.id ?? null;
}

function NavLeafLink({ item, indent, onNavigate }: { item: NavLeaf; indent?: boolean; onNavigate?: () => void }) {
  return (
    <NavLink
      to={item.to}
      end={item.to === paths.dashboard}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          'group relative flex items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors',
          indent ? 'py-2' : 'py-2.5',
          isActive ? 'bg-white/10 text-white' : 'text-primary-100 hover:bg-white/10 hover:text-white',
        )
      }
    >
      {({ isActive }) => (
        <>
          {isActive && <span className="absolute inset-y-1 left-0 w-1 rounded-full bg-accent" aria-hidden />}
          <item.icon className={cn('h-5 w-5 shrink-0', isActive ? 'text-accent-300' : 'text-primary-200')} />
          <span className="truncate">{item.label}</span>
        </>
      )}
    </NavLink>
  );
}

function NavGroupSection({
  group,
  isExpanded,
  isActive,
  onToggle,
  onNavigate,
}: {
  group: NavGroup;
  isExpanded: boolean;
  isActive: boolean;
  onToggle: () => void;
  onNavigate?: () => void;
}) {
  const GroupIcon = group.icon;
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isExpanded}
        className={cn(
          'group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors',
          isActive ? 'bg-white/10 text-white' : 'text-primary-100 hover:bg-white/10 hover:text-white',
        )}
      >
        {isActive && <span className="absolute inset-y-1.5 left-0 w-1 rounded-full bg-accent" aria-hidden />}
        <GroupIcon className={cn('h-5 w-5 shrink-0', isActive ? 'text-accent-300' : 'text-primary-200')} />
        <span className="flex-1 truncate text-left">{group.label}</span>
        <ChevronDown
          className={cn(
            'h-4 w-4 shrink-0 transition-transform duration-200',
            isExpanded ? 'rotate-180' : 'rotate-0',
          )}
          aria-hidden
        />
      </button>

      <div
        className="grid transition-[grid-template-rows] duration-[250ms] ease-in-out"
        style={{ gridTemplateRows: isExpanded ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <div className="ml-4 mt-1 space-y-1 border-l border-white/10 py-1 pl-3">
            {group.items.map((item) => (
              <NavLeafLink key={item.to} item={item} indent onNavigate={onNavigate} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Brand header + nav; shared by the desktop sidebar and the mobile drawer. */
export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const role = useAuthStore((s) => s.user?.role);
  const location = useLocation();
  const { data: publicSettings } = usePublicSettings();
  const appName = publicSettings?.applicationName ?? 'KBV Education';
  const logoUrl = publicSettings?.logoPath?.startsWith('http') ? publicSettings.logoPath : null;

  const routeGroupId = useMemo(() => findGroupForPath(location.pathname), [location.pathname]);

  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(EXPANDED_GROUP_STORAGE_KEY);
  });

  // Auto-expand (and switch to) the group matching the current route.
  useEffect(() => {
    if (routeGroupId) {
      setExpandedGroupId(routeGroupId);
    }
  }, [routeGroupId]);

  // Persist across refreshes.
  useEffect(() => {
    if (expandedGroupId) {
      window.localStorage.setItem(EXPANDED_GROUP_STORAGE_KEY, expandedGroupId);
    } else {
      window.localStorage.removeItem(EXPANDED_GROUP_STORAGE_KEY);
    }
  }, [expandedGroupId]);

  const toggleGroup = (id: string) => {
    setExpandedGroupId((prev) => (prev === id ? null : id));
  };

  const items = navItems.filter((item) => role && item.roles.includes(role));

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

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {role === 'SUPER_ADMIN' ? (
          <>
            <NavLeafLink
              item={{ label: 'Dashboard', to: paths.dashboard, icon: LayoutDashboard }}
              onNavigate={onNavigate}
            />
            {adminGroups.map((group) => (
              <NavGroupSection
                key={group.id}
                group={group}
                isExpanded={expandedGroupId === group.id}
                isActive={group.items.some((item) => isPathActive(location.pathname, item.to))}
                onToggle={() => toggleGroup(group.id)}
                onNavigate={onNavigate}
              />
            ))}
          </>
        ) : (
          items.map((item) => <NavLeafLink key={item.to} item={item} onNavigate={onNavigate} />)
        )}
      </nav>

      <SidebarUserProfile onNavigate={onNavigate} />
    </div>
  );
}

/** Persistent sidebar for md+ screens. The layout root is viewport-locked
 * (DashboardLayout), so h-full pins this to the full viewport height; the
 * nav inside scrolls independently and the bottom user card never moves. */
export function Sidebar() {
  return (
    <aside className="hidden h-full w-64 shrink-0 md:flex">
      <SidebarContent />
    </aside>
  );
}

/** Slide-over drawer variant for small screens. On close, focus returns to
 * whatever opened it (the topbar menu button), same pattern as Modal. */
export function MobileSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
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
    <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-slate-900/50" onClick={onClose} aria-hidden />
      <div className="absolute inset-y-0 left-0 w-64 shadow-xl">
        <SidebarContent onNavigate={onClose} />
      </div>
    </div>
  );
}
