import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, BookOpenCheck, Paperclip, ArrowRight } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingState } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/feedback/ErrorState';
import { PracticeFormModal } from '@/features/practice/components/PracticeFormModal';
import { usePracticeList } from '@/features/practice/hooks/usePractice';
import { practiceStatusTone } from '@/features/practice/statusTone';
import { STUDY_TYPE_LABELS, PRACTICE_STATUS_LABELS } from '@/features/practice/types/practice.types';
import { formatDate } from '@/lib/format';
import { paths } from '@/routes/paths';

export default function PracticePage() {
  const { data, isLoading, isError, refetch } = usePracticeList();
  const [modalOpen, setModalOpen] = useState(false);

  if (isLoading) return <LoadingState label="Loading your practice log…" />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;

  const sessions = data ?? [];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Practice Log</h1>
          <p className="text-sm text-slate-500">Record your study sessions. An admin reviews each one.</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4" /> Log session
        </Button>
      </div>

      {sessions.length === 0 ? (
        <Card>
          <CardBody className="flex flex-col items-center gap-3 py-14 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary">
              <BookOpenCheck className="h-6 w-6" />
            </div>
            <p className="text-sm text-slate-500">No practice logged yet.</p>
            <Button size="sm" onClick={() => setModalOpen(true)}><Plus className="h-4 w-4" /> Log your first session</Button>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {sessions.map((s) => (
            <Link key={s.id} to={paths.practiceDetail(s.id)} className="group block focus:outline-none">
              <Card className="transition-shadow group-hover:shadow-md group-focus-visible:ring-2 group-focus-visible:ring-accent/40">
                <CardBody className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-medium text-slate-800 group-hover:text-primary">{s.subject}</p>
                      {s.files.length > 0 && <Paperclip className="h-3.5 w-3.5 text-slate-400" />}
                    </div>
                    <p className="text-xs text-slate-500">
                      {formatDate(s.studyDate)} · {s.durationMinutes} min · {STUDY_TYPE_LABELS[s.studyType]}
                    </p>
                  </div>
                  <Badge tone={practiceStatusTone(s.status)}>{PRACTICE_STATUS_LABELS[s.status]}</Badge>
                  <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-primary" />
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <PracticeFormModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
