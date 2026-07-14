import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingState } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/feedback/ErrorState';
import { useTierRules, useTierRulesMutation } from '@/features/scoring/hooks/useTierRules';

const nullableNumber = (min: number, max: number) =>
  z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? null : Number(v)),
    z.number().min(min).max(max).nullable(),
  );

const rowSchema = z.object({
  id: z.string(),
  tierName: z.string(),
  tierRank: z.number(),
  minComposite: z.coerce.number().min(0, 'Must be 0–100').max(100, 'Must be 0–100'),
  maxComposite: nullableNumber(0, 100),
  minPracticePercentage: z.coerce.number().min(0, 'Must be 0–100').max(100, 'Must be 0–100'),
  minFullPapers: z.coerce.number().int('Must be a whole number').min(0, 'Must be 0 or more'),
});

const schema = z.object({ rules: z.array(rowSchema) }).superRefine((data, ctx) => {
  // Mirrors the backend's validateNoOverlap: sort by minComposite ascending, each row's
  // max must exist and sit below the next row's min (only the top band may be unbounded).
  const sorted = [...data.rules].sort((a, b) => a.minComposite - b.minComposite);
  for (let i = 0; i < sorted.length - 1; i++) {
    const current = sorted[i];
    const next = sorted[i + 1];
    if (current.maxComposite == null || current.maxComposite >= next.minComposite) {
      const idx = data.rules.findIndex((r) => r.id === current.id);
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Tier thresholds cannot overlap',
        path: ['rules', idx, 'maxComposite'],
      });
    }
  }
});
type FormValues = z.infer<typeof schema>;

export default function TierRulesPage() {
  const { data: tierRules, isLoading, isError, refetch } = useTierRules();
  const mutation = useTierRulesMutation();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: tierRules ? { rules: [...tierRules].sort((a, b) => a.tierRank - b.tierRank) } : undefined,
  });
  const { fields } = useFieldArray({ control, name: 'rules' });

  const hasOverlapError = Array.isArray(errors.rules) && errors.rules.some((r) => r?.maxComposite);

  const submit = handleSubmit((v) => {
    mutation.mutate(v.rules);
  });

  if (isLoading) return <LoadingState label="Loading tier rules…" />;
  if (isError || !tierRules) {
    return <ErrorState message="Failed to load tier rules." onRetry={() => refetch()} />;
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Graduation Tier Rules"
        subtitle="Configure the composite score, practice %, and full-papers thresholds for each tier."
      />

      <form onSubmit={submit} className="space-y-4" noValidate>
        <Card>
          {hasOverlapError && (
            <p className="border-b border-red-100 bg-red-50 px-4 py-2 text-xs text-red-600">
              Tier thresholds cannot overlap — check the highlighted "Max Composite" fields below.
            </p>
          )}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-secondary">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Tier</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Min Composite</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Max Composite</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Min Practice %</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Min Full Papers</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {fields.map((field, index) => (
                  <tr key={field.id}>
                    <td className="px-4 py-3 font-medium text-slate-800">{field.tierName}</td>
                    <td className="px-4 py-3">
                      <Input
                        type="number"
                        step="0.01"
                        aria-invalid={!!errors.rules?.[index]?.minComposite}
                        {...register(`rules.${index}.minComposite`)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="No limit"
                        aria-invalid={!!errors.rules?.[index]?.maxComposite}
                        {...register(`rules.${index}.maxComposite`)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Input
                        type="number"
                        step="0.01"
                        aria-invalid={!!errors.rules?.[index]?.minPracticePercentage}
                        {...register(`rules.${index}.minPracticePercentage`)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Input
                        type="number"
                        aria-invalid={!!errors.rules?.[index]?.minFullPapers}
                        {...register(`rules.${index}.minFullPapers`)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" isLoading={mutation.isPending}>
            Save All
          </Button>
        </div>
      </form>
    </div>
  );
}
