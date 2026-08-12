import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, BookOpenCheck, Paperclip, ArrowRight } from 'lucide-react';
import { Card, CardBody } from '@/components/modern/ui/Card';
import { Button } from '@/components/modern/ui/Button';
import { Badge } from '@/components/modern/ui/Badge';
import { LoadingState } from '@/components/modern/ui/Spinner';
import { ErrorState } from '@/components/modern/ui/ErrorState';
import { ModernPracticeFormModal } from '@/components/modern/student/ModernPracticeFormModal';
import { usePracticeList } from '@/features/practice/hooks/usePractice';
import { practiceStatusTone } from '@/features/practice/statusTone';
import { STUDY_TYPE_LABELS, PRACTICE_STATUS_LABELS } from '@/features/practice/types/practice.types';
import { formatDate } from '@/lib/format';
import { paths } from '@/routes/paths';

/** Modern port of PracticePage — same hooks/logic, dark styling. */
export default function ModernPracticePage() {
  const { data, isLoading, isError, refetch } = usePracticeList();
  const [modalOpen, setModalOpen] = useState(false);

  if (isLoading) return <LoadingState label="Loading your practice log…" />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;

  const sessions = data ?? [];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-garamond text-xl font-medium text-[#F6F9FE]">Practice Log</h1>
          <p className="text-sm text-[rgba(238,242,249,.55)]">Record your study sessions. An admin reviews each one.</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4" /> Log session
        </Button>
      </div>

      {sessions.length === 0 ? (
        <Card>
          <CardBody className="flex flex-col items-center gap-3 py-14 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/[.06] text-[#DBB652]">
              <BookOpenCheck className="h-6 w-6" />
            </div>
            <p className="text-sm text-[rgba(238,242,249,.55)]">No practice logged yet.</p>
            <Button size="sm" onClick={() => setModalOpen(true)}><Plus className="h-4 w-4" /> Log your first session</Button>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {sessions.map((s) => (
            <Link key={s.id} to={paths.practiceDetail(s.id)} className="group block focus:outline-none">
              <Card className="transition-shadow group-hover:shadow-md group-focus-visible:ring-2 group-focus-visible:ring-[#B0821C]/40">
                <CardBody className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-medium text-[#EEF2F9] group-hover:text-[#DBB652]">{s.subject}</p>
                      {s.files.length > 0 && <Paperclip className="h-3.5 w-3.5 text-[rgba(238,242,249,.4)]" />}
                    </div>
                    <p className="text-xs text-[rgba(238,242,249,.5)]">
                      {formatDate(s.studyDate)} · {s.durationMinutes} min · {STUDY_TYPE_LABELS[s.studyType]}
                    </p>
                  </div>
                  <Badge tone={practiceStatusTone(s.status)}>{PRACTICE_STATUS_LABELS[s.status]}</Badge>
                  <ArrowRight className="h-4 w-4 text-[rgba(238,242,249,.3)] group-hover:text-[#DBB652]" />
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <ModernPracticeFormModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
