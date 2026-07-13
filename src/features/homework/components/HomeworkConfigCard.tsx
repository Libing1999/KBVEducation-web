import { useState } from 'react';
import { Plus, Pencil, Trash2, ClipboardList, CalendarClock } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { useLessonHomework, useHomeworkMutations } from '@/features/homework/hooks/useHomework';
import { HomeworkFormModal } from '@/features/homework/components/HomeworkFormModal';
import { formatDateTime } from '@/lib/format';

export function HomeworkConfigCard({ lessonId }: { lessonId: string }) {
  const { data: homework, isLoading } = useLessonHomework(lessonId);
  const { remove } = useHomeworkMutations(lessonId);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (isLoading) {
    return (
      <Card>
        <CardHeader title="Homework" />
        <CardBody className="flex justify-center py-10"><Spinner /></CardBody>
      </Card>
    );
  }

  if (!homework) {
    return (
      <>
        <Card>
          <CardHeader title="Homework" subtitle="No homework configured for this lesson" />
          <CardBody className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-50 text-primary">
              <ClipboardList className="h-5 w-5" />
            </div>
            <p className="text-sm text-slate-500">Set an assignment for students to submit.</p>
            <Button size="sm" onClick={() => setFormOpen(true)}>
              <Plus className="h-4 w-4" /> Configure homework
            </Button>
          </CardBody>
        </Card>
        <HomeworkFormModal open={formOpen} onClose={() => setFormOpen(false)} lessonId={lessonId} />
      </>
    );
  }

  return (
    <Card>
      <CardHeader
        title="Homework"
        subtitle={homework.title}
        action={
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" title="Edit" onClick={() => setFormOpen(true)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" title="Delete" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        }
      />
      <CardBody className="space-y-3">
        {homework.instructions && (
          <p className="whitespace-pre-line text-sm text-slate-700">{homework.instructions}</p>
        )}

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <CalendarClock className="h-3.5 w-3.5" />
            {homework.dueDate ? `Due ${formatDateTime(homework.dueDate)}` : 'No due date'}
          </span>
          {homework.maxFileSizeMb != null && <span>· Max {homework.maxFileSizeMb} MB</span>}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {homework.allowedFileTypes && homework.allowedFileTypes.length ? (
            homework.allowedFileTypes.map((t) => (
              <Badge key={t} tone="neutral">.{t}</Badge>
            ))
          ) : (
            <span className="text-xs text-slate-400">Any file type allowed</span>
          )}
        </div>
      </CardBody>

      <HomeworkFormModal open={formOpen} onClose={() => setFormOpen(false)} lessonId={lessonId} homework={homework} />

      <ConfirmDialog
        open={deleteOpen}
        title="Delete homework"
        message="Delete this homework configuration? This can’t be undone."
        confirmLabel="Delete"
        danger
        isLoading={remove.isPending}
        onConfirm={() => remove.mutate(homework.id, { onSuccess: () => setDeleteOpen(false) })}
        onClose={() => setDeleteOpen(false)}
      />
    </Card>
  );
}
