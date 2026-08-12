import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Upload, X, FileText } from 'lucide-react';
import { Modal } from '@/components/modern/ui/Modal';
import { Button } from '@/components/modern/ui/Button';
import { Input } from '@/components/modern/ui/Input';
import { Select } from '@/components/modern/ui/Select';
import { FormField } from '@/components/modern/ui/FormField';
import { usePracticeMutations } from '@/features/practice/hooks/usePractice';
import { useActiveSubjects } from '@/features/subjects/hooks/useActiveSubjects';
import { formatFileSize } from '@/lib/format';
import {
  CURRENT_STUDY_TYPES,
  PAST_PAPER_STUDY_TYPES,
  STUDY_TYPE_LABELS,
  type StudyType,
} from '@/features/practice/types/practice.types';

const ACCEPT = '.pdf,.doc,.docx,.png,.jpg,.jpeg';

function studyYears(): number[] {
  const current = new Date().getFullYear();
  return Array.from({ length: 10 }, (_, i) => current - i);
}

function isPastPaperType(studyType: string): boolean {
  return (PAST_PAPER_STUDY_TYPES as string[]).includes(studyType);
}

const schema = z
  .object({
    studyDate: z.string().min(1, 'Study date is required'),
    subject: z.string().min(1, 'Subject is required').max(200),
    durationMinutes: z.coerce.number().int('Whole minutes').positive('Must be greater than 0'),
    studyType: z.enum(CURRENT_STUDY_TYPES as [StudyType, ...StudyType[]]),
    year: z.string().optional(),
    notes: z.string().max(2000, 'Notes must be 2000 characters or fewer').optional().or(z.literal('')),
    transcript: z.string().max(5000, 'Transcript must be 5000 characters or fewer').optional().or(z.literal('')),
  })
  .superRefine((v, ctx) => {
    if (isPastPaperType(v.studyType) && (v.year === '' || v.year === undefined)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Year is required for this study type', path: ['year'] });
    }
  });
type FormValues = z.input<typeof schema>;

function todayIso() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Modern port of PracticeFormModal — same form/mutation logic, dark palette. */
export function ModernPracticeFormModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { create } = usePracticeMutations();
  const { data: subjects, isLoading: subjectsLoading } = useActiveSubjects();
  const [files, setFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const years = studyYears();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      studyDate: todayIso(),
      subject: '',
      durationMinutes: 30,
      studyType: 'TOPIC_STUDY',
      year: '',
      notes: '',
      transcript: '',
    },
  });

  const studyType = watch('studyType');
  const showYear = isPastPaperType(studyType);

  // Clear any previously selected Year when Study Type no longer requires it.
  useEffect(() => {
    if (!showYear) setValue('year', '');
  }, [showYear, setValue]);

  const onPick = (e: ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files ? Array.from(e.target.files) : [];
    if (picked.length) setFiles((prev) => [...prev, ...picked]);
    if (inputRef.current) inputRef.current.value = '';
  };
  const removeAt = (i: number) => setFiles((prev) => prev.filter((_, idx) => idx !== i));

  const close = () => { reset(); setFiles([]); onClose(); };

  const submit = handleSubmit((v) => {
    create.mutate(
      {
        input: {
          studyDate: v.studyDate,
          subject: v.subject,
          durationMinutes: Number(v.durationMinutes),
          studyType: v.studyType,
          year: v.year === '' || v.year === undefined ? undefined : Number(v.year),
          notes: v.notes?.toString().trim() || undefined,
          transcript: v.transcript?.toString().trim() || undefined,
        },
        files,
      },
      { onSuccess: close },
    );
  });

  return (
    <Modal
      open={open}
      onClose={close}
      size="lg"
      title="Log a practice session"
      footer={
        <>
          <Button variant="outline" onClick={close} disabled={create.isPending}>Cancel</Button>
          <Button onClick={submit} isLoading={create.isPending}>Log session</Button>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Study date" htmlFor="mp-date" error={errors.studyDate?.message} required>
            <Input id="mp-date" type="date" {...register('studyDate')} />
          </FormField>
          <FormField label="Duration (minutes)" htmlFor="mp-duration" error={errors.durationMinutes?.message} required>
            <Input id="mp-duration" type="number" min={1} {...register('durationMinutes')} />
          </FormField>
        </div>

        <FormField label="Subject" htmlFor="mp-subject" error={errors.subject?.message} required>
          <Select id="mp-subject" disabled={subjectsLoading} {...register('subject')}>
            <option value="">{subjectsLoading ? 'Loading subjects…' : 'Select a subject'}</option>
            {(subjects ?? []).map((s) => (
              <option key={s.id} value={s.name}>{s.name}</option>
            ))}
          </Select>
        </FormField>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Study type" htmlFor="mp-type" error={errors.studyType?.message} required>
            <Select id="mp-type" {...register('studyType')}>
              {CURRENT_STUDY_TYPES.map((t) => (
                <option key={t} value={t}>{STUDY_TYPE_LABELS[t]}</option>
              ))}
            </Select>
          </FormField>
          {showYear && (
            <FormField label="Year" htmlFor="mp-year" error={errors.year?.message} required>
              <Select id="mp-year" {...register('year')}>
                <option value="">Select a year</option>
                {years.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </Select>
            </FormField>
          )}
        </div>

        <FormField label="Notes" htmlFor="mp-notes" error={errors.notes?.message}>
          <textarea
            id="mp-notes"
            rows={3}
            maxLength={2000}
            placeholder="Enter your practice notes..."
            className="w-full rounded-lg border border-[rgba(238,242,249,.15)] bg-[#0A1424] px-3 py-2 text-sm text-[#EEF2F9] placeholder:text-[rgba(238,242,249,.35)] focus:border-[#B0821C] focus:outline-none focus:ring-2 focus:ring-[#B0821C]/30"
            {...register('notes')}
          />
        </FormField>

        <FormField label="Transcript" htmlFor="mp-transcript" error={errors.transcript?.message}>
          <textarea
            id="mp-transcript"
            rows={3}
            maxLength={5000}
            placeholder="Enter transcript..."
            className="w-full rounded-lg border border-[rgba(238,242,249,.15)] bg-[#0A1424] px-3 py-2 text-sm text-[#EEF2F9] placeholder:text-[rgba(238,242,249,.35)] focus:border-[#B0821C] focus:outline-none focus:ring-2 focus:ring-[#B0821C]/30"
            {...register('transcript')}
          />
        </FormField>

        <div className="space-y-2">
          <p className="text-sm font-medium text-[rgba(238,242,249,.75)]">Attachments <span className="font-normal text-[rgba(238,242,249,.4)]">(optional)</span></p>
          <input ref={inputRef} type="file" accept={ACCEPT} multiple className="hidden" onChange={onPick} />
          <Button variant="secondary" size="sm" onClick={() => inputRef.current?.click()}>
            <Upload className="h-4 w-4" /> Add files
          </Button>
          {files.length > 0 && (
            <ul className="divide-y divide-[rgba(238,242,249,.08)] rounded-lg border border-[rgba(238,242,249,.1)]">
              {files.map((f, i) => (
                <li key={`${f.name}-${i}`} className="flex items-center gap-3 px-4 py-2">
                  <FileText className="h-4 w-4 shrink-0 text-[#DBB652]" />
                  <span className="min-w-0 flex-1 truncate text-sm text-[#EEF2F9]">{f.name}</span>
                  <span className="text-xs text-[rgba(238,242,249,.5)]">{formatFileSize(f.size)}</span>
                  <button type="button" onClick={() => removeAt(i)} className="text-[rgba(238,242,249,.4)] hover:text-[#EEF2F9]">
                    <X className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <p className="text-xs text-[rgba(238,242,249,.4)]">PDF, DOC, DOCX or images · up to 25 MB each.</p>
        </div>
      </form>
    </Modal>
  );
}
