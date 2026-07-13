import { Badge } from '@/components/ui/Badge';
import type { UserStatus } from '@/features/users/types/user.types';
import type { CohortStatus } from '@/features/cohorts/types/cohort.types';

export function UserStatusBadge({ status }: { status: UserStatus }) {
  return <Badge tone={status === 'ACTIVE' ? 'success' : 'neutral'}>{status}</Badge>;
}

const cohortTone: Record<CohortStatus, 'success' | 'info' | 'neutral' | 'warning'> = {
  ACTIVE: 'success',
  UPCOMING: 'info',
  COMPLETED: 'neutral',
  ARCHIVED: 'warning',
};

export function CohortStatusBadge({ status }: { status: CohortStatus }) {
  return <Badge tone={cohortTone[status]}>{status}</Badge>;
}
