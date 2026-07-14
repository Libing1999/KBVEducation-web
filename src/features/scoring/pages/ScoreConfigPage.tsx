import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Switch } from '@/components/ui/Switch';
import { FormField } from '@/components/form/FormField';
import { LoadingState } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/feedback/ErrorState';
import { useScoreConfig, useScoreConfigMutation } from '@/features/scoring/hooks/useScoreConfig';

const schema = z
  .object({
    practiceWeight: z.coerce.number().min(0, 'Must be 0 or more').max(100, 'Must be 100 or less'),
    reflectionWeight: z.coerce.number().min(0, 'Must be 0 or more').max(100, 'Must be 100 or less'),
    homeworkWeight: z.coerce.number().min(0, 'Must be 0 or more').max(100, 'Must be 100 or less'),
    quizWeight: z.coerce.number().min(0, 'Must be 0 or more').max(100, 'Must be 100 or less'),
    practiceWindowStart: z.string().optional().or(z.literal('')),
    reflectionWindowStart: z.string().optional().or(z.literal('')),
    reflectionWindowEnd: z.string().optional().or(z.literal('')),
    totalReflectionDays: z.coerce.number().int('Must be a whole number').min(0, 'Must be 0 or more'),
    totalHomeworkCount: z.coerce.number().int('Must be a whole number').min(0, 'Must be 0 or more'),
    leaderboardEnabled: z.boolean(),
    leaderboardSortBy: z.enum(['COMPOSITE', 'PRACTICE', 'QUIZ', 'REFLECTION', 'HOMEWORK']),
    dashboardWidgetsEnabled: z.boolean(),
  })
  .refine(
    (d) => Math.abs(d.practiceWeight + d.reflectionWeight + d.homeworkWeight + d.quizWeight - 100) < 0.01,
    { message: 'Weights must total 100%', path: ['quizWeight'] },
  );
type FormValues = z.infer<typeof schema>;

export default function ScoreConfigPage() {
  const { data: config, isLoading, isError, refetch } = useScoreConfig();
  const mutation = useScoreConfigMutation();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: config
      ? {
          practiceWeight: config.practiceWeight,
          reflectionWeight: config.reflectionWeight,
          homeworkWeight: config.homeworkWeight,
          quizWeight: config.quizWeight,
          practiceWindowStart: config.practiceWindowStart ?? '',
          reflectionWindowStart: config.reflectionWindowStart ?? '',
          reflectionWindowEnd: config.reflectionWindowEnd ?? '',
          totalReflectionDays: config.totalReflectionDays,
          totalHomeworkCount: config.totalHomeworkCount,
          leaderboardEnabled: config.leaderboardEnabled,
          leaderboardSortBy: config.leaderboardSortBy,
          dashboardWidgetsEnabled: config.dashboardWidgetsEnabled,
        }
      : undefined,
  });

  const weights = useWatch({ control, name: ['practiceWeight', 'reflectionWeight', 'homeworkWeight', 'quizWeight'] });
  const total = weights.map((v) => Number(v) || 0).reduce((a, b) => a + b, 0);
  const totalValid = Math.abs(total - 100) < 0.01;

  const submit = handleSubmit((v) => {
    mutation.mutate({
      ...v,
      practiceWindowStart: v.practiceWindowStart || null,
      reflectionWindowStart: v.reflectionWindowStart || null,
      reflectionWindowEnd: v.reflectionWindowEnd || null,
    });
  });

  if (isLoading) return <LoadingState label="Loading score configuration…" />;
  if (isError || !config) {
    return <ErrorState message="Failed to load score configuration." onRetry={() => refetch()} />;
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Score Configuration"
        subtitle="Configure the weights, windows, and toggles that drive every student's composite score."
      />

      <form onSubmit={submit} className="space-y-5" noValidate>
        <Card>
          <CardHeader
            title="Score Weights"
            subtitle="Must total exactly 100%."
            action={
              <Badge tone={totalValid ? 'success' : 'danger'}>{total.toFixed(2)}% of 100%</Badge>
            }
          />
          <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <FormField label="Practice Weight" htmlFor="sc-practice-weight" error={errors.practiceWeight?.message} required>
              <Input
                id="sc-practice-weight"
                type="number"
                step="0.01"
                min={0}
                max={100}
                aria-invalid={!!errors.practiceWeight}
                {...register('practiceWeight')}
              />
            </FormField>
            <FormField label="Reflection Weight" htmlFor="sc-reflection-weight" error={errors.reflectionWeight?.message} required>
              <Input
                id="sc-reflection-weight"
                type="number"
                step="0.01"
                min={0}
                max={100}
                aria-invalid={!!errors.reflectionWeight}
                {...register('reflectionWeight')}
              />
            </FormField>
            <FormField label="Homework Weight" htmlFor="sc-homework-weight" error={errors.homeworkWeight?.message} required>
              <Input
                id="sc-homework-weight"
                type="number"
                step="0.01"
                min={0}
                max={100}
                aria-invalid={!!errors.homeworkWeight}
                {...register('homeworkWeight')}
              />
            </FormField>
            <FormField label="Quiz Weight" htmlFor="sc-quiz-weight" error={errors.quizWeight?.message} required>
              <Input
                id="sc-quiz-weight"
                type="number"
                step="0.01"
                min={0}
                max={100}
                aria-invalid={!!errors.quizWeight}
                {...register('quizWeight')}
              />
            </FormField>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Windows & Targets" subtitle="Practice/reflection tracking windows and fixed targets." />
          <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FormField label="Practice Window Start" htmlFor="sc-practice-start" error={errors.practiceWindowStart?.message}>
              <Input id="sc-practice-start" type="date" {...register('practiceWindowStart')} />
            </FormField>
            <FormField label="Reflection Window Start" htmlFor="sc-reflection-start" error={errors.reflectionWindowStart?.message}>
              <Input id="sc-reflection-start" type="date" {...register('reflectionWindowStart')} />
            </FormField>
            <FormField label="Reflection Window End" htmlFor="sc-reflection-end" error={errors.reflectionWindowEnd?.message}>
              <Input id="sc-reflection-end" type="date" {...register('reflectionWindowEnd')} />
            </FormField>
            <FormField label="Total Reflection Days" htmlFor="sc-total-reflection" error={errors.totalReflectionDays?.message}>
              <Input id="sc-total-reflection" type="number" min={0} {...register('totalReflectionDays')} />
            </FormField>
            <FormField label="Total Homework Count" htmlFor="sc-total-homework" error={errors.totalHomeworkCount?.message}>
              <Input id="sc-total-homework" type="number" min={0} {...register('totalHomeworkCount')} />
            </FormField>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Leaderboard & Dashboard" />
          <CardBody className="space-y-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <label htmlFor="sc-leaderboard-enabled" className="text-sm font-medium text-slate-700">
                  Enable Leaderboard
                </label>
                <p className="text-xs text-slate-500">Students can view their cohort's rankings.</p>
              </div>
              <Switch id="sc-leaderboard-enabled" {...register('leaderboardEnabled')} />
            </div>

            <FormField label="Leaderboard Sort" htmlFor="sc-leaderboard-sort" error={errors.leaderboardSortBy?.message}>
              <Select id="sc-leaderboard-sort" {...register('leaderboardSortBy')}>
                <option value="COMPOSITE">Composite Score</option>
                <option value="PRACTICE">Practice %</option>
                <option value="REFLECTION">Reflection %</option>
                <option value="HOMEWORK">Homework %</option>
                <option value="QUIZ">Quiz %</option>
              </Select>
            </FormField>

            <div className="flex items-center justify-between gap-4">
              <div>
                <label htmlFor="sc-widgets-enabled" className="text-sm font-medium text-slate-700">
                  Enable Dashboard Widgets
                </label>
                <p className="text-xs text-slate-500">Show score/tier widgets on student and parent dashboards.</p>
              </div>
              <Switch id="sc-widgets-enabled" {...register('dashboardWidgetsEnabled')} />
            </div>
          </CardBody>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" isLoading={mutation.isPending} disabled={!totalValid}>
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
