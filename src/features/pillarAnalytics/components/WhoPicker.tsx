import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, X } from 'lucide-react';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { useCohorts } from '@/features/cohorts/hooks/useCohorts';
import { useStudents } from '@/features/students/hooks/useStudents';

export type WhoMode = 'class' | 'cohort' | 'students';

export interface Who {
  mode: WhoMode;
  cohortId?: string;
  studentIds: string[];
}

/**
 * "Who" (memo 17.10.2026, 2.5): the whole class, one cohort, or picked students
 * (one picked student = single-student view).
 */
export function WhoPicker({
  value,
  names,
  onChange,
}: {
  value: Who;
  /** Names of already-picked students (from the last response), so chips show names straight away. */
  names: Record<string, string>;
  onChange: (w: Who) => void;
}) {
  const { data: cohorts } = useCohorts({ size: 100, sort: 'startDate', direction: 'desc' });

  return (
    <div className="flex flex-wrap items-end gap-3">
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-slate-600">Who</span>
        <Select
          className="w-44"
          value={value.mode}
          onChange={(e) => onChange({ mode: e.target.value as WhoMode, studentIds: [], cohortId: undefined })}
        >
          <option value="class">Whole class</option>
          <option value="cohort">One cohort</option>
          <option value="students">Picked students</option>
        </Select>
      </label>
      {value.mode === 'cohort' && (
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-600">Cohort</span>
          <Select
            className="w-56"
            value={value.cohortId ?? ''}
            onChange={(e) => onChange({ ...value, cohortId: e.target.value || undefined })}
          >
            <option value="">Choose a cohort…</option>
            {cohorts?.content.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
        </label>
      )}
      {value.mode === 'students' && <StudentMultiSelect value={value.studentIds} names={names} onChange={(ids) => onChange({ ...value, studentIds: ids })} />}
    </div>
  );
}

function StudentMultiSelect({
  value,
  names,
  onChange,
}: {
  value: string[];
  names: Record<string, string>;
  onChange: (ids: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [known, setKnown] = useState<Record<string, string>>({});
  const ref = useRef<HTMLDivElement>(null);
  const { data, isLoading } = useStudents({ search: search || undefined, size: 100, sort: 'firstName', direction: 'asc' });

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  const nameOf = (id: string) => known[id] ?? names[id] ?? 'Student';
  const toggle = (id: string, name: string) => {
    setKnown((k) => ({ ...k, [id]: name }));
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);
  };

  return (
    <div className="relative" ref={ref}>
      <span className="mb-1 block text-xs font-medium text-slate-600">
        Students {value.length === 1 && <span className="text-primary">(single-student view)</span>}
      </span>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-10 min-w-64 max-w-xl items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 text-left text-sm"
        aria-expanded={open}
      >
        <span className="flex flex-1 flex-wrap gap-1 overflow-hidden">
          {value.length === 0 && <span className="text-slate-400">Choose students…</span>}
          {value.slice(0, 3).map((id) => (
            <span key={id} className="inline-flex items-center gap-1 rounded bg-primary-50 px-1.5 py-0.5 text-xs text-primary-700">
              {nameOf(id)}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(value.filter((v) => v !== id));
                }}
                aria-label={`Remove ${nameOf(id)}`}
              />
            </span>
          ))}
          {value.length > 3 && <span className="text-xs text-slate-500">+{value.length - 3} more</span>}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
      </button>
      {open && (
        <div className="absolute z-30 mt-1 w-80 rounded-lg border border-slate-200 bg-white p-2 shadow-lg">
          <Input autoFocus placeholder="Search by name or email" value={search} onChange={(e) => setSearch(e.target.value)} />
          <ul className="mt-2 max-h-72 overflow-y-auto">
            {isLoading && <li className="px-2 py-2 text-sm text-slate-500">Loading…</li>}
            {data?.content.map((s) => {
              const name = `${s.firstName} ${s.lastName}`.trim();
              const on = value.includes(s.id);
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => toggle(s.id, name)}
                    className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm hover:bg-slate-50"
                  >
                    <span className={`flex h-4 w-4 items-center justify-center rounded border ${on ? 'border-primary bg-primary text-white' : 'border-slate-300'}`}>
                      {on && <Check className="h-3 w-3" />}
                    </span>
                    <span className="flex-1 truncate text-slate-800">{name}</span>
                    <span className="truncate text-xs text-slate-400">{s.cohort?.name ?? ''}</span>
                  </button>
                </li>
              );
            })}
            {data && data.content.length === 0 && <li className="px-2 py-2 text-sm text-slate-500">No students found.</li>}
          </ul>
          {value.length > 0 && (
            <button type="button" onClick={() => onChange([])} className="mt-1 w-full rounded px-2 py-1 text-left text-xs text-slate-500 hover:bg-slate-50">
              Clear all
            </button>
          )}
        </div>
      )}
    </div>
  );
}
