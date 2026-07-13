import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/form/FormField';
import { useHomeworkMutations } from '@/features/homework/hooks/useHomework';
import type { HomeworkResponse } from '@/features/homework/types/homework.types';

const FILE_TYPES = ['pdf', 'doc', 'docx', 'jpg', 'png', 'mp3', 'mp4', 'zip'];

const schema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  instructions: z.string().optional().or(z.literal('')),
  dueDate: z.string().optional().or(z.literal('')),
  allowedFileTypes: z.array(z.string()).optional(),
  maxFileSizeMb: z.coerce.number().int().positive('Must be greater than 0').optional().or(z.literal('')),
});
type FormValues = z.input<typeof schema>;

function toLocalInput(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

interface Props {
  open: boolean;
  onClose: () => void;
  lessonId: string;
  homework?: HomeworkResponse | null;
}

export function HomeworkFormModal({ open, onClose, lessonId, homework }: Props) {
  const isEdit = !!homework;
  const { upsert } = useHomeworkMutations(lessonId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: {
      title: homework?.title ?? '',
      instructions: homework?.instructions ?? '',
      dueDate: toLocalInput(homework?.dueDate),
      allowedFileTypes: homework?.allowedFileTypes ?? [],
      maxFileSizeMb: homework?.maxFileSizeMb ?? '',
    },
  });

  const submit = handleSubmit((v) => {
    upsert.mutate(
      {
        title: v.title,
        instructions: v.instructions?.toString().trim() ? v.instructions.toString().trim() : null,
        dueDate: v.dueDate ? new Date(v.dueDate.toString()).toISOString() : null,
        allowedFileTypes: v.allowedFileTypes && v.allowedFileTypes.length ? v.allowedFileTypes : null,
        maxFileSizeMb: v.maxFileSizeMb === '' || v.maxFileSizeMb == null ? null : Number(v.maxFileSizeMb),
      },
      { onSuccess: () => { reset(); onClose(); } },
    );
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Homework settings' : 'Configure homework'}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={upsert.isPending}>Cancel</Button>
          <Button onClick={submit} isLoading={upsert.isPending}>{isEdit ? 'Save changes' : 'Save homework'}</Button>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        <FormField label="Title" htmlFor="hw-title" error={errors.title?.message} required>
          <Input id="hw-title" aria-invalid={!!errors.title} {...register('title')} />
        </FormField>

        <FormField label="Instructions" htmlFor="hw-instructions" error={errors.instructions?.message}>
          <textarea
            id="hw-instructions"
            rows={3}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
            {...register('instructions')}
          />
        </FormField>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Due date" htmlFor="hw-due" error={errors.dueDate?.message}>
            <Input id="hw-due" type="datetime-local" {...register('dueDate')} />
          </FormField>
          <FormField label="Max file size (MB)" htmlFor="hw-size" error={errors.maxFileSizeMb?.message}>
            <Input id="hw-size" type="number" min={1} placeholder="Optional" {...register('maxFileSizeMb')} />
          </FormField>
        </div>

        <div className="space-y-1.5">
          <p className="text-sm font-medium text-slate-700">Allowed file types</p>
          <div className="flex flex-wrap gap-2">
            {FILE_TYPES.map((t) => (
              <label
                key={t}
                className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 has-[:checked]:border-primary has-[:checked]:bg-primary-50 has-[:checked]:text-primary"
              >
                <input type="checkbox" value={t} className="h-4 w-4 accent-primary" {...register('allowedFileTypes')} />
                .{t}
              </label>
            ))}
          </div>
          <p className="text-xs text-slate-400">Leave all unchecked to allow any file type.</p>
        </div>
      </form>
    </Modal>
  );
}
