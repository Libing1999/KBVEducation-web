import { useRef, useState, type ChangeEvent } from 'react';
import { Upload, Download, Trash2, FileText, Loader2 } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { useLessonFiles, useLessonFileMutations } from '@/features/lessons/hooks/useLessonFiles';
import { lessonsApi } from '@/features/lessons/api/lessonsApi';
import { downloadFile } from '@/lib/download';
import { formatDate, formatFileSize } from '@/lib/format';
import type { LessonFile } from '@/features/lessons/types/lesson.types';

const ACCEPT = '.pdf,.doc,.docx,.mp3,.mp4';

export function LessonFilesManager({ lessonId }: { lessonId: string }) {
  const { data: files, isLoading } = useLessonFiles(lessonId);
  const { upload, remove } = useLessonFileMutations(lessonId);
  const inputRef = useRef<HTMLInputElement>(null);
  const [toDelete, setToDelete] = useState<LessonFile | null>(null);

  const onPick = (e: ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files ? Array.from(e.target.files) : [];
    if (picked.length) upload.mutate(picked);
    if (inputRef.current) inputRef.current.value = '';
  };

  const doDownload = (file: LessonFile) =>
    downloadFile(lessonsApi.fileDownloadUrl(lessonId, file.id), file.fileName);

  return (
    <Card>
      <CardHeader
        title="Files"
        subtitle="PDF, DOC, DOCX, MP3, MP4"
        action={
          <>
            <input ref={inputRef} type="file" accept={ACCEPT} multiple className="hidden" onChange={onPick} />
            <Button size="sm" onClick={() => inputRef.current?.click()} isLoading={upload.isPending}>
              {!upload.isPending && <Upload className="h-4 w-4" />} Upload
            </Button>
          </>
        }
      />
      <CardBody className="p-0">
        {isLoading ? (
          <div className="flex justify-center py-10"><Spinner /></div>
        ) : (files?.length ?? 0) === 0 ? (
          <p className="py-10 text-center text-sm text-slate-500">No files uploaded yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {files!.map((f) => (
              <li key={f.id} className="flex items-center gap-3 px-5 py-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-800">{f.fileName}</p>
                  <p className="text-xs text-slate-500">
                    {(f.fileType ?? '').toUpperCase()} · {formatFileSize(f.fileSize)} · {formatDate(f.uploadedDate)}
                  </p>
                </div>
                <Button variant="ghost" size="sm" title="Download" onClick={() => doDownload(f)}>
                  <Download className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" title="Delete" onClick={() => setToDelete(f)}>
                  {remove.isPending && remove.variables === f.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 text-red-500" />
                  )}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardBody>

      <ConfirmDialog
        open={!!toDelete}
        title="Delete file"
        message={`Delete "${toDelete?.fileName}"? This can’t be undone.`}
        confirmLabel="Delete"
        danger
        isLoading={remove.isPending}
        onConfirm={() => toDelete && remove.mutate(toDelete.id, { onSuccess: () => setToDelete(null) })}
        onClose={() => setToDelete(null)}
      />
    </Card>
  );
}
