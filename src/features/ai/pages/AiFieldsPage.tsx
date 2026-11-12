import { useState } from 'react';
import { Pencil, Plus, RotateCcw } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Switch } from '@/components/ui/Switch';
import { Modal } from '@/components/ui/Modal';
import { FormField } from '@/components/form/FormField';
import { LoadingState } from '@/components/ui/Spinner';
import { useAiFieldMutations, useAiFields, useAiSettings } from '@/features/ai/hooks/useAi';
import {
  AI_FIELD_TYPE_LABELS,
  GRAPHED_FIELD_TYPES,
  type AiField,
  type AiFieldJobType,
  type AiFieldType,
} from '@/features/ai/types/ai.types';

const JOB_LABELS: Record<AiFieldJobType, string> = {
  PRACTICE_REVIEW: 'Practice sessions',
  REFLECTION_REVIEW: 'Reflections',
};

const MAX_REANALYSE = 300;

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

/**
 * The fields the AI returns for each practice session and reflection (memo 17.10.2026, 2.1).
 * Built-in fields are fixed. The admin can add their own: numbers, ratings and yes/no get a
 * graph on the Analytics screen; short text and lists get a table.
 */
export default function AiFieldsPage() {
  const { data, isLoading } = useAiFields();
  const { data: settings } = useAiSettings();
  const [editing, setEditing] = useState<AiField | 'new-practice' | 'new-reflection' | null>(null);
  const [rerunFor, setRerunFor] = useState<AiFieldJobType | null>(null);

  return (
    <div className="space-y-5">
      <PageHeader
        title="AI fields"
        subtitle="What the AI fills in for every practice session and reflection. Add your own fields: the AI returns them from the next run, and they appear on the Analytics screen."
      />
      {settings && !settings.aiEnabled && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          The AI is switched off in AI Settings. You can still add fields; they are used once it is on.
        </p>
      )}
      {isLoading || !data ? (
        <LoadingState />
      ) : (
        <>
          <FieldGroup
            jobType="PRACTICE_REVIEW"
            fields={data.practice}
            onAdd={() => setEditing('new-practice')}
            onEdit={setEditing}
            onRerun={() => setRerunFor('PRACTICE_REVIEW')}
          />
          <FieldGroup
            jobType="REFLECTION_REVIEW"
            fields={data.reflection}
            onAdd={() => setEditing('new-reflection')}
            onEdit={setEditing}
            onRerun={() => setRerunFor('REFLECTION_REVIEW')}
          />
        </>
      )}
      {editing && <FieldDialog target={editing} onClose={() => setEditing(null)} />}
      {rerunFor && <ReanalyseDialog jobType={rerunFor} onClose={() => setRerunFor(null)} />}
    </div>
  );
}

function FieldGroup({
  jobType,
  fields,
  onAdd,
  onEdit,
  onRerun,
}: {
  jobType: AiFieldJobType;
  fields: AiField[];
  onAdd: () => void;
  onEdit: (f: AiField) => void;
  onRerun: () => void;
}) {
  const builtIn = fields.filter((f) => f.builtIn);
  const custom = fields.filter((f) => !f.builtIn);
  return (
    <Card>
      <CardHeader
        title={JOB_LABELS[jobType]}
        subtitle={`${builtIn.length} built-in, ${custom.length} of your own`}
        action={
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="outline" size="sm" onClick={onRerun} title="Analyse older items again to fill in your fields">
              <RotateCcw className="h-4 w-4" /> Analyse older items again
            </Button>
            <Button size="sm" onClick={onAdd}>
              <Plus className="h-4 w-4" /> Add field
            </Button>
          </div>
        }
      />
      <CardBody className="space-y-5">
        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Your fields</h4>
          {custom.length === 0 ? (
            <p className="text-sm text-slate-500">None yet. Add one to have the AI look for something extra.</p>
          ) : (
            <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200">
              {custom.map((f) => (
                <FieldRow key={f.key} field={f} onEdit={() => onEdit(f)} />
              ))}
            </ul>
          )}
        </div>
        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Built in (cannot be changed)</h4>
          <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-slate-50/60">
            {builtIn.map((f) => (
              <FieldRow key={f.key} field={f} />
            ))}
          </ul>
        </div>
      </CardBody>
    </Card>
  );
}

function FieldRow({ field, onEdit }: { field: AiField; onEdit?: () => void }) {
  return (
    <li className="flex items-start justify-between gap-4 px-4 py-3">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className={field.active ? 'font-medium text-slate-800' : 'font-medium text-slate-400 line-through'}>
            {field.label}
          </span>
          <Badge tone="info">{AI_FIELD_TYPE_LABELS[field.type]}</Badge>
          {!field.builtIn && (
            <Badge tone="neutral">{GRAPHED_FIELD_TYPES.includes(field.type) ? 'Graph' : 'Table'}</Badge>
          )}
          {!field.active && <Badge tone="warning">Switched off</Badge>}
        </div>
        {field.description && <p className="mt-1 text-sm text-slate-600">{field.description}</p>}
        <p className="mt-0.5 font-mono text-xs text-slate-400">{field.key}</p>
      </div>
      {onEdit && (
        <Button variant="ghost" size="sm" onClick={onEdit} title="Edit or switch off">
          <Pencil className="h-4 w-4" />
        </Button>
      )}
    </li>
  );
}

function FieldDialog({
  target,
  onClose,
}: {
  target: AiField | 'new-practice' | 'new-reflection';
  onClose: () => void;
}) {
  const isNew = typeof target === 'string';
  const jobType: AiFieldJobType = isNew
    ? target === 'new-practice'
      ? 'PRACTICE_REVIEW'
      : 'REFLECTION_REVIEW'
    : target.jobType;
  const [label, setLabel] = useState(isNew ? '' : target.label);
  const [description, setDescription] = useState(isNew ? '' : target.description);
  const [fieldType, setFieldType] = useState<AiFieldType>(isNew ? 'RATING' : target.type);
  const [active, setActive] = useState(isNew ? true : target.active);
  const { add, update } = useAiFieldMutations();
  const pending = add.isPending || update.isPending;
  const valid = label.trim().length > 0 && description.trim().length > 0;

  const save = () => {
    const done = { onSuccess: onClose };
    if (isNew) {
      add.mutate({ jobType, label: label.trim(), description: description.trim(), fieldType }, done);
    } else {
      update.mutate({ id: target.id as string, label: label.trim(), description: description.trim(), active }, done);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={isNew ? `New field for ${JOB_LABELS[jobType].toLowerCase()}` : `Edit "${target.label}"`}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={!valid} isLoading={pending}>{isNew ? 'Add field' : 'Save'}</Button>
        </>
      }
    >
      <div className="space-y-4">
        <FormField label="Name" htmlFor="field-label" required>
          <Input
            id="field-label"
            value={label}
            maxLength={120}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. Used notes from an earlier lesson"
          />
        </FormField>
        <FormField label="What the AI should look for" htmlFor="field-desc" required>
          <Textarea
            id="field-desc"
            rows={4}
            value={description}
            maxLength={1000}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Yes if the student mentions going back to notes or examples from an earlier lesson."
          />
        </FormField>
        <FormField label="Type" htmlFor="field-type">
          <Select
            id="field-type"
            value={fieldType}
            disabled={!isNew}
            onChange={(e) => setFieldType(e.target.value as AiFieldType)}
          >
            {(Object.keys(AI_FIELD_TYPE_LABELS) as AiFieldType[]).map((t) => (
              <option key={t} value={t}>{AI_FIELD_TYPE_LABELS[t]}</option>
            ))}
          </Select>
        </FormField>
        <p className="text-xs text-slate-500">
          {isNew
            ? GRAPHED_FIELD_TYPES.includes(fieldType)
              ? 'This field gets a graph on the Analytics screen.'
              : 'This field gets a table on the Analytics screen.'
            : 'The type cannot change after a field is added, so old answers stay comparable.'}
        </p>
        {!isNew && (
          <label className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 px-4 py-3">
            <span>
              <span className="block text-sm font-medium text-slate-800">Field is on</span>
              <span className="block text-xs text-slate-500">Switched off: the AI stops filling it in. Past answers stay.</span>
            </span>
            <Switch checked={active} onChange={(e) => setActive(e.target.checked)} />
          </label>
        )}
      </div>
    </Modal>
  );
}

function ReanalyseDialog({ jobType, onClose }: { jobType: AiFieldJobType; onClose: () => void }) {
  const [from, setFrom] = useState(isoDaysAgo(7));
  const [to, setTo] = useState(isoDaysAgo(1));
  const { reanalyse } = useAiFieldMutations();
  const valid = from && to && from <= to;

  return (
    <Modal
      open
      onClose={onClose}
      title={`Analyse ${JOB_LABELS[jobType].toLowerCase()} again`}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            onClick={() => reanalyse.mutate({ jobType, from, to }, { onSuccess: onClose })}
            disabled={!valid}
            isLoading={reanalyse.isPending}
          >
            Start
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-slate-600">
          Every item in these dates is analysed again with today&apos;s fields, so your new fields get filled in. These
          run straight away as normal calls, which cost about twice the night-time batch price. Up to {MAX_REANALYSE}{' '}
          items at a time.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="From" htmlFor="re-from">
            <Input id="re-from" type="date" value={from} max={to} onChange={(e) => setFrom(e.target.value)} />
          </FormField>
          <FormField label="To" htmlFor="re-to">
            <Input id="re-to" type="date" value={to} min={from} onChange={(e) => setTo(e.target.value)} />
          </FormField>
        </div>
        <p className="text-xs text-slate-500">
          The new result replaces the current one for each item. Sessions you already approved or rejected stay as
          they are.
        </p>
      </div>
    </Modal>
  );
}
