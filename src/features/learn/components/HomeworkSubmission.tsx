import { useRef, useState, type ChangeEvent } from 'react';
import { Upload, Download, FileText, X, CheckCircle2, Send } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import toast from 'react-hot-toast';
import { useMyHomeworkSubmission, useSubmitHomework } from '@/features/learn/hooks/useLearn';
import { learnApi } from '@/features/learn/api/learnApi';
import { downloadFile } from '@/lib/download';
import { formatDateTime, formatFileSize } from '@/lib/format';
import type { StudentFile, StudentLessonDetailResponse } from '@/features/learn/types/learn.types';

interface Props {
  lesson: StudentLessonDetailResponse;
  isStudent: boolean;
}

export function HomeworkSubmission({ lesson, isStudent }: Props) {
  const submitted = lesson.homeworkSubmitted;
  const { data: submission, isLoading } = useMyHomeworkSubmission(lesson.id, submitted);
  const submit = useSubmitHomework(lesson.id);
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [note, setNote] = useState('');

  const allowed = (lesson.homeworkAllowedFileTypes ?? []).map((t) => t.toLowerCase());
  const maxMb = lesson.homeworkMaxFileSizeMb ?? null;
  const accept = allowed.length ? allowed.map((t) => `.${t}`).join(',') : undefined;

  const validate = (file: File): string | null => {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    if (allowed.length && !allowed.includes(ext)) {
      return `${file.name}: .${ext} is not an allowed file type.`;
    }
    if (maxMb && file.size > maxMb * 1024 * 1024) {
      return `${file.name}: exceeds the ${maxMb} MB limit.`;
    }
    return null;
  };

  const onPick = (e: ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files ? Array.from(e.target.files) : [];
    const accepted: File[] = [];
    for (const f of picked) {
      const err = validate(f);
      if (err) toast.error(err);
      else accepted.push(f);
    }
    if (accepted.length) setFiles((prev) => [...prev, ...accepted]);
    if (inputRef.current) inputRef.current.value = '';
  };

  const removeAt = (i: number) => setFiles((prev) => prev.filter((_, idx) => idx !== i));

  const doDownload = (f: StudentFile) =>
    downloadFile(learnApi.submissionFileDownloadUrl(f.id), f.fileName);

  // ---- Submitted view (student's own, or parent read-through) ----
  if (submitted) {
    return (
      <div className="space-y-3">
        <Badge tone="success"><CheckCircle2 className="mr-1 h-3 w-3" /> Submitted</Badge>
        {isLoading ? (
          <div className="flex justify-center py-4"><Spinner /></div>
        ) : submission ? (
          <div className="space-y-3">
            <p className="text-xs text-slate-500">Submitted {formatDateTime(submission.submittedAt)}</p>
            {submission.note && (
              <p className="whitespace-pre-line rounded-lg bg-secondary px-3 py-2 text-sm text-slate-700">{submission.note}</p>
            )}
            <ul className="divide-y divide-slate-100 rounded-lg border border-slate-100">
              {submission.files.map((f) => (
                <li key={f.id} className="flex items-center gap-3 px-4 py-2.5">
                  <FileText className="h-4 w-4 shrink-0 text-primary" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-slate-800">{f.fileName}</p>
                    <p className="text-xs text-slate-500">{formatFileSize(f.fileSize)}</p>
                  </div>
                  <Button variant="ghost" size="sm" title="Download" onClick={() => doDownload(f)}>
                    <Download className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    );
  }

  // ---- Parent, nothing submitted yet ----
  if (!isStudent) {
    return <p className="rounded-lg bg-secondary px-3 py-2 text-xs text-slate-500">Not submitted yet.</p>;
  }

  // ---- Student upload form ----
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 text-xs text-slate-500">
        {allowed.length ? allowed.map((t) => <Badge key={t} tone="neutral">.{t}</Badge>) : <span>Any file type</span>}
        {maxMb ? <span className="self-center">· Max {maxMb} MB</span> : null}
      </div>

      <input ref={inputRef} type="file" accept={accept} multiple className="hidden" onChange={onPick} />
      <Button variant="secondary" size="sm" onClick={() => inputRef.current?.click()}>
        <Upload className="h-4 w-4" /> Choose files
      </Button>

      {files.length > 0 && (
        <ul className="divide-y divide-slate-100 rounded-lg border border-slate-100">
          {files.map((f, i) => (
            <li key={`${f.name}-${i}`} className="flex items-center gap-3 px-4 py-2.5">
              <FileText className="h-4 w-4 shrink-0 text-primary" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-slate-800">{f.name}</p>
                <p className="text-xs text-slate-500">{formatFileSize(f.size)}</p>
              </div>
              <Button variant="ghost" size="sm" title="Remove" onClick={() => removeAt(i)}>
                <X className="h-4 w-4 text-slate-400" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <textarea
        rows={2}
        placeholder="Add a note (optional)…"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
      />

      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-slate-400">You can submit once.</p>
        <Button
          size="sm"
          disabled={files.length === 0}
          isLoading={submit.isPending}
          onClick={() => submit.mutate({ files, note })}
        >
          {!submit.isPending && <Send className="h-4 w-4" />} Submit homework
        </Button>
      </div>
    </div>
  );
}
