import { Link } from 'react-router-dom';
import { Trophy, ArrowRight } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { LoadingState } from '@/components/ui/Spinner';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useMyLeaderboard } from '@/features/leaderboard/hooks/useLeaderboard';
import { paths } from '@/routes/paths';

/** Renders nothing if the leaderboard is disabled or the student has no cohort - not an error state worth surfacing here. */
export function LeaderboardPositionCard() {
  const userId = useAuthStore((s) => s.user?.id);
  const { data, isLoading, isError } = useMyLeaderboard();

  if (isLoading) return <LoadingState label="Loading leaderboard position…" />;
  if (isError || !data || data.length === 0) return null;

  const mine = data.find((e) => e.studentId === userId);
  if (!mine) return null;

  return (
    <Card>
      <CardHeader
        title="Leaderboard Position"
        action={
          <Link to={paths.leaderboard} className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-600">
            View full leaderboard <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        }
      />
      <CardBody className="flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent-50 text-accent-600">
          <Trophy className="h-6 w-6" />
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-800">#{mine.rank}</p>
          <p className="text-sm text-slate-500">out of {data.length} in your cohort</p>
        </div>
      </CardBody>
    </Card>
  );
}
