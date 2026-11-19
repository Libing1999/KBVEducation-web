import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Eye, FilePlus2, FileText, Pencil, RotateCcw, Trash2, Upload } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { LoadingState, Spinner } from '@/components/ui/Spinner';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import {
  useReferencePack,
  useReferencePackMutations,
  useReferencePackVersion,
  useReferencePackVersions,
} from '@/features/ai/hooks/useAi';
import { formatDateTime, formatFileSize } from '@/lib/format';
import { paths } from '@/routes/paths';

const textareaClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm text-slate-800 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30';

/**
 * The reference pack (memo 12.10.2026, 5): the Markdown checklists, guidelines and topic lists
 * the AI uses for every session and reflection. Every change makes a new version; older
 * versions are kept and can be made active again. Changes apply from the next run.
 */
export default function ReferencePackPage() {
  const { data: active, isLoading } = useReferencePack();
  const { data: versions = [] } = useReferencePackVersions();
  const { upload, save, remove, activate } = useReferencePackMutations();

  const fileInput = useRef<HTMLInputElement>(null);
  const [note, setNote] = useState('');
  const [editing, setEditing] = useState<{ fileName: string; content: string; isNew: boolean } | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [viewingVersion, setViewingVersion] = useState<string | null>(null);

  if (isLoading) return <LoadingState label="Loading reference pack…" />;

  const totalBytes = active?.files?.reduce((sum, f) => sum + f.sizeBytes, 0) ?? 0;

  return (
    <div className="space-y-5">
      <Link to={paths.admin.aiSettings} className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-600">
        <ArrowLeft className="h-4 w-4" /> Back to AI settings
      </Link>
      <PageHeader
        title="Reference pack"
        subtitle="Your rules for the AI. The whole pack is sent with every request; changes apply from the next run."
      />

      <Card>
        <CardHeader
          title={active ? `Active: version ${active.versionNo}` : 'No reference pack yet'}
          subtitle={active ? `${active.fileCount} file(s), ${formatFileSize(totalBytes)}${active.note ? ` · ${active.note}` : ''}` : 'Upload your Markdown (.md) files to get started.'}
          action={
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => setEditing({ fileName: '', content: '', isNew: true })}>
                <FilePlus2 className="h-4 w-4" /> New file
              </Button>
              <Button size="sm" onClick={() => fileInput.current?.click()} isLoading={upload.isPending}>
                <Upload className="h-4 w-4" /> Upload .md files
              </Button>
              <input
                ref={fileInput}
                type="file"
                accept=".md,.markdown,.txt,text/markdown,text/plain"
                multiple
                className="hidden"
                onChange={(e) => {
                  const files = Array.from(e.target.files ?? []);
                  if (files.length > 0) upload.mutate({ files, note: note || undefined }, { onSuccess: () => setNote('') });
                  e.target.value = '';
                }}
              />
            </div>
          }
        />
        <CardBody className="space-y-3">
          <Input
            placeholder="Optional note for your next change, e.g. “Clearer low-effort examples”"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={500}
          />
          {active?.files && active.files.length > 0 ? (
            <ul className="divide-y divide-slate-100 rounded-lg border border-slate-100">
              {active.files.map((f) => (
                <li key={f.id} className="flex items-center gap-3 px-4 py-3">
                  <FileText className="h-4 w-4 shrink-0 text-primary" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-800">{f.fileName}</p>
                    <p className="text-xs text-slate-500">{formatFileSize(f.sizeBytes)}</p>
                  </div>
                  <Button variant="ghost" size="sm" title="Edit" onClick={() => setEditing({ fileName: f.fileName, content: f.content, isNew: false })}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" title="Delete" onClick={() => setDeleting(f.fileName)}>
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-6 text-center text-sm text-slate-500">No files yet.</p>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="All versions" subtitle="Every version is kept. Make any of them active again to go back." />
        <CardBody className="p-0">
          {versions.length === 0 ? (
            <p className="px-5 py-6 text-center text-sm text-slate-500">No versions yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {versions.map((v) => (
                <li key={v.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-800">
                      Version {v.versionNo} {v.active && <Badge tone="success">Active</Badge>}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatDateTime(v.createdAt)} · {v.fileCount} file(s){v.note ? ` · ${v.note}` : ''}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setViewingVersion(v.id)}>
                    <Eye className="h-4 w-4" /> View
                  </Button>
                  {!v.active && (
                    <Button variant="outline" size="sm" onClick={() => activate.mutate(v.id)} isLoading={activate.isPending && activate.variables === v.id}>
                      <RotateCcw className="h-4 w-4" /> Make active
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.isNew ? 'New file' : `Edit ${editing?.fileName}`}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setEditing(null)} disabled={save.isPending}>Cancel</Button>
            <Button
              isLoading={save.isPending}
              disabled={!editing?.fileName.trim()}
              onClick={() =>
                editing &&
                save.mutate(
                  { fileName: editing.fileName.trim(), content: editing.content, note: note || undefined },
                  { onSuccess: () => { setEditing(null); setNote(''); } },
                )
              }
            >
              Save as new version
            </Button>
          </>
        }
      >
        {editing && (
          <div className="space-y-3">
            {editing.isNew && (
              <Input
                placeholder="File name, e.g. 03-flags-guide.md"
                value={editing.fileName}
                onChange={(e) => setEditing({ ...editing, fileName: e.target.value })}
              />
            )}
            <textarea
              rows={18}
              className={textareaClass}
              value={editing.content}
              onChange={(e) => setEditing({ ...editing, content: e.target.value })}
            />
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title="Delete file"
        message={`Delete "${deleting}" from the pack? A new version is made; the old one is kept and can be made active again.`}
        confirmLabel="Delete"
        danger
        isLoading={remove.isPending}
        onConfirm={() => deleting && remove.mutate(deleting, { onSuccess: () => setDeleting(null) })}
        onClose={() => setDeleting(null)}
      />

      <VersionModal id={viewingVersion} onClose={() => setViewingVersion(null)} />
    </div>
  );
}

function VersionModal({ id, onClose }: { id: string | null; onClose: () => void }) {
  const { data, isLoading } = useReferencePackVersion(id);
  return (
    <Modal open={!!id} onClose={onClose} title={data ? `Version ${data.versionNo}` : 'Version'} size="lg">
      {isLoading || !data ? (
        <div className="flex justify-center py-6"><Spinner /></div>
      ) : (
        <div className="space-y-4">
          {data.files?.length ? data.files.map((f) => (
            <div key={f.id}>
              <p className="text-sm font-semibold text-slate-800">{f.fileName}</p>
              <pre className="mt-1 max-h-64 overflow-auto whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-xs text-slate-700">{f.content}</pre>
            </div>
          )) : <p className="text-sm text-slate-500">This version has no files.</p>}
        </div>
      )}
    </Modal>
  );
}
