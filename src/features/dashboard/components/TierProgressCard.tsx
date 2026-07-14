import { Award, ArrowUpCircle } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LoadingState } from '@/components/ui/Spinner';
import { useMyTier } from '@/features/dashboard/hooks/useDashboard';

export function TierProgressCard() {
  const { data: tier, isLoading, isError } = useMyTier();

  if (isLoading) return <LoadingState label="Loading tier progress…" />;
  if (isError || !tier) return null;

  const displayTier = tier.confirmedTier ?? tier.calculatedTier;

  return (
    <Card>
      <CardHeader
        title="Tier Progress"
        subtitle={tier.isOverride ? 'Set by an administrator' : undefined}
        action={
          <Badge tone="accent">
            <Award className="mr-1 h-3.5 w-3.5" /> {displayTier}
          </Badge>
        }
      />
      <CardBody className="space-y-4">
        {!tier.nextPossibleTier ? (
          <p className="flex items-center gap-2 text-sm text-slate-600">
            <ArrowUpCircle className="h-4 w-4 text-accent" /> You're at the top tier.
          </p>
        ) : tier.remainingRequirements.length === 0 ? (
          <p className="text-sm text-green-600">
            You already meet every requirement for <span className="font-semibold">{tier.nextPossibleTier}</span> — keep it up!
          </p>
        ) : (
          <>
            <p className="text-sm text-slate-600">
              Next tier: <span className="font-semibold text-slate-800">{tier.nextPossibleTier}</span>
            </p>
            <ul className="space-y-3">
              {tier.remainingRequirements.map((r) => {
                const pct = r.required > 0 ? Math.min(100, (r.current / r.required) * 100) : 100;
                return (
                  <li key={r.metric} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">{r.metric}</span>
                      <span className="font-medium text-slate-800">
                        {r.current.toFixed(1)} / {r.required.toFixed(1)}
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </CardBody>
    </Card>
  );
}
