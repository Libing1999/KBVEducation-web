import { useState } from 'react';
import { Users, UserRound, Layers, CheckCircle2, LogIn } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAdminDashboard, useAdminDashboardTrends } from '@/features/dashboard/hooks/useDashboard';
import { ModernDashboardBar } from '@/components/modern/ModernDashboardBar';
import { useCountUp } from '@/components/modern/useCountUp';
import { GRAIN_TEXTURE_URI } from '@/theme/grainTexture';
import {
  ModernActivityChart,
  ModernCohortChart,
  ModernSystemSummary,
  ModernDailyActivity,
  ModernTopStudents,
  ModernRecentUsers,
  ModernRecentCohorts,
} from '@/components/modern/ModernAdminSections';

function KpiTile({ icon: Icon, label, value, changePct }: { icon: LucideIcon; label: string; value: number; changePct?: number | null }) {
  const displayed = useCountUp(value, 1200);
  const hasChange = changePct != null;
  const isFlat = hasChange && Math.round(changePct) === 0;
  const isPositive = hasChange && changePct > 0;
  return (
    <div className="rounded-2xl border border-[rgba(238,242,249,.12)] bg-white/[.03] px-6 py-7 text-center">
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/[.06] text-[#DBB652]">
        <Icon className="h-5 w-5" />
      </div>
      <p className="font-garamond text-4xl font-semibold text-[#F6F9FE]">{displayed}</p>
      <p className="mt-1.5 text-[11px] uppercase tracking-[0.18em] text-[rgba(238,242,249,.6)]">{label}</p>
      {hasChange && (
        <p className={isFlat ? 'mt-1 text-xs text-[rgba(238,242,249,.4)]' : isPositive ? 'mt-1 text-xs text-[#8fd6ae]' : 'mt-1 text-xs text-[#e08a8a]'}>
          {isFlat ? '—' : `${isPositive ? '↑' : '↓'} ${Math.abs(Math.round(changePct))}%`}
        </p>
      )}
    </div>
  );
}

/**
 * Admin dashboard in the Modern design tokens — no reference design was
 * provided for this role yet, so this rebuilds every section of the Default
 * UI's AdminDashboard (KPI trends, activity chart, system summary, daily
 * activity, top students, recent users/cohorts) with Modern-themed cards,
 * using the exact same hooks/data rather than reusing the light Default
 * components, so the whole dashboard follows one consistent dark/gold theme.
 */
export function ModernAdminDashboard() {
  const [days] = useState(30);
  const { data, isLoading, isError, refetch } = useAdminDashboard();
  const { data: trends } = useAdminDashboardTrends(days);

  return (
    <div className="relative min-h-screen bg-[#080E1C] pb-16 font-modern text-[#EEF2F9]">
      <div
        className="fixed inset-0 -z-20"
        style={{
          background:
            'radial-gradient(56% 44% at 50% 26%, rgba(38,64,112,.34), transparent 66%), linear-gradient(180deg,#0C1830,#0A1428 46%,#070E1C)',
        }}
      />
      <div
        className="fixed inset-0 -z-10 opacity-[.55] mix-blend-overlay"
        style={{ backgroundSize: '170px 170px', backgroundImage: `url("${GRAIN_TEXTURE_URI}")` }}
        aria-hidden
      />

      <ModernDashboardBar />

      <div className="px-6 pt-[clamp(96px,16vh,140px)]">
        <p className="mb-2 text-center text-[11px] font-medium uppercase tracking-[0.34em] text-[rgba(238,242,249,.6)]">
          Platform overview
        </p>
        <h1 className="mb-10 text-center font-garamond text-3xl font-medium">Admin standing</h1>

        {isLoading ? (
          <p className="text-center text-[rgba(238,242,249,.6)]">Loading…</p>
        ) : isError || !data ? (
          <div className="flex flex-col items-center gap-4 text-[rgba(238,242,249,.72)]">
            <p>Failed to load the dashboard.</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="rounded-lg border border-[rgba(238,242,249,.2)] px-4 py-2 text-sm hover:bg-white/5"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            <div className="mx-auto grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <KpiTile icon={Users} label="Students" value={data.totalStudents} changePct={trends?.studentsChangePct} />
              <KpiTile icon={UserRound} label="Parents" value={data.totalParents} changePct={trends?.parentsChangePct} />
              <KpiTile icon={Layers} label="Cohorts" value={data.totalCohorts} changePct={trends?.cohortsChangePct} />
              <KpiTile icon={CheckCircle2} label="Active Cohorts" value={data.activeCohorts} changePct={trends?.activeCohortsChangePct} />
              <KpiTile icon={LogIn} label="Today's Logins" value={data.todaysLogins} changePct={trends?.loginsChangePct} />
            </div>

            {/* Full dashboard — every section the Default UI's AdminDashboard
                shows, rebuilt with Modern-themed cards using the same data. */}
            <div className="mx-auto mt-[clamp(56px,9vh,96px)] max-w-6xl space-y-4">
              <p className="mb-2 text-center text-[10.5px] font-medium uppercase tracking-[0.28em] text-[rgba(238,242,249,.5)]">
                Full dashboard
              </p>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <ModernActivityChart data={trends?.activityTrend ?? []} />
                </div>
                <ModernSystemSummary lockedAccounts={data.lockedAccounts} systemHealthy={data.systemHealthy} />
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <ModernDailyActivity />
                <ModernCohortChart breakdown={trends?.cohortStatus ?? { active: 0, inactive: 0, upcoming: 0 }} />
                <ModernTopStudents students={trends?.topStudents ?? []} />
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <ModernRecentUsers users={data.recentUsers} />
                <ModernRecentCohorts cohorts={data.recentCohorts} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ModernAdminDashboard;
