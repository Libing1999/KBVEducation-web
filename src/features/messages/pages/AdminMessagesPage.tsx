import { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { DataTable, type Column } from '@/components/ui/Table';
import { useStudents } from '@/features/students/hooks/useStudents';
import { useCohorts } from '@/features/cohorts/hooks/useCohorts';
import { useAdminMessages, useSendMessage } from '@/features/messages/hooks/useMessages';
import type { CoachMessage, MessageTargetType } from '@/features/messages/types/message.types';
import { formatDateTime } from '@/lib/format';
import { cn } from '@/lib/utils';

/**
 * Staff compose/send for the one manual messaging channel — surfaces
 * read-only in the student Leaderboard's "Live Action" drawer and the
 * parent "Messages from Bhavya" card. No bespoke design was provided for
 * this screen (admin-only tooling); it follows the same Card/DataTable
 * pattern as the other admin CRUD pages in this app.
 */
export default function AdminMessagesPage() {
  const [targetType, setTargetType] = useState<MessageTargetType>('INDIVIDUAL');
  const [studentId, setStudentId] = useState('');
  const [cohortId, setCohortId] = useState('');
  const [tag, setTag] = useState('');
  const [body, setBody] = useState('');
  const [page, setPage] = useState(0);

  const { data: studentPage } = useStudents({ page: 0, size: 200 });
  const { data: cohortPage } = useCohorts({ page: 0, size: 100 });
  const { data: sentPage, isLoading } = useAdminMessages(page);
  const sendMessage = useSendMessage();

  const canSend =
    tag.trim().length > 0 &&
    body.trim().length > 0 &&
    (targetType === 'INDIVIDUAL' ? !!studentId : !!cohortId);

  const handleSend = () => {
    if (!canSend) return;
    sendMessage.mutate(
      {
        targetType,
        studentId: targetType === 'INDIVIDUAL' ? studentId : undefined,
        cohortId: targetType === 'COLLECTIVE' ? cohortId : undefined,
        tag: tag.trim(),
        body: body.trim(),
      },
      {
        onSuccess: () => {
          setTag('');
          setBody('');
        },
      },
    );
  };

  const columns: Column<CoachMessage>[] = [
    {
      key: 'target',
      header: 'To',
      render: (m) => (
        <div>
          <Badge tone={m.targetType === 'COLLECTIVE' ? 'accent' : 'neutral'}>
            {m.targetType === 'COLLECTIVE' ? 'Cohort' : 'Student'}
          </Badge>
          <p className="mt-1 text-sm font-medium text-slate-800">
            {m.targetType === 'COLLECTIVE' ? m.targetCohortName : m.targetStudentName}
          </p>
        </div>
      ),
    },
    { key: 'tag', header: 'Tag', render: (m) => <span className="text-sm text-slate-600">{m.tag}</span> },
    { key: 'body', header: 'Message', render: (m) => <span className="text-sm text-slate-800">{m.body}</span> },
    { key: 'sender', header: 'Sent by', render: (m) => <span className="text-sm text-slate-500">{m.senderName}</span> },
    { key: 'createdAt', header: 'When', align: 'right', render: (m) => <span className="text-sm text-slate-500">{formatDateTime(m.createdAt)}</span> },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Messages"
        subtitle="Send a hand-written note to one student or an entire cohort — shown in their Leaderboard Live Action drawer and the parent's Messages card."
      />

      <Card>
        <div className="space-y-4 p-5">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setTargetType('INDIVIDUAL')}
              className={cn(
                'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
                targetType === 'INDIVIDUAL' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
              )}
            >
              Individual student
            </button>
            <button
              type="button"
              onClick={() => setTargetType('COLLECTIVE')}
              className={cn(
                'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
                targetType === 'COLLECTIVE' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
              )}
            >
              Whole cohort
            </button>
          </div>

          {targetType === 'INDIVIDUAL' ? (
            <Select value={studentId} onChange={(e) => setStudentId(e.target.value)}>
              <option value="">Select a student…</option>
              {studentPage?.content.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.firstName} {s.lastName} {s.cohort ? `— ${s.cohort.name}` : ''}
                </option>
              ))}
            </Select>
          ) : (
            <Select value={cohortId} onChange={(e) => setCohortId(e.target.value)}>
              <option value="">Select a cohort…</option>
              {cohortPage?.content.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          )}

          <Input
            placeholder={targetType === 'COLLECTIVE' ? 'Tag, e.g. "Cohort win"' : 'Tag, e.g. "Shout-out"'}
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            maxLength={60}
          />

          <Textarea
            placeholder="Message text…"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={2000}
            rows={3}
          />

          <div className="flex justify-end">
            <Button onClick={handleSend} disabled={!canSend || sendMessage.isPending}>
              {sendMessage.isPending ? 'Sending…' : 'Send'}
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <div className="border-b border-slate-100 p-4">
          <h3 className="text-sm font-semibold text-slate-800">Recently sent</h3>
        </div>
        <DataTable
          columns={columns}
          data={sentPage?.content ?? []}
          rowKey={(m) => m.id}
          isLoading={isLoading}
          emptyMessage="No messages sent yet."
        />
        {sentPage && sentPage.totalPages > 1 && (
          <div className="flex justify-end gap-2 border-t border-slate-100 p-3">
            <Button variant="secondary" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={page + 1 >= sentPage.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
