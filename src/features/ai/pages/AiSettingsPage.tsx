import { useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, FileText, Loader2, Play, Save, XCircle } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Switch } from '@/components/ui/Switch';
import { LoadingState } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/feedback/ErrorState';
import { useAiModels, useAiSettings, useAiSettingsMutations, useAiStatus } from '@/features/ai/hooks/useAi';
import { ModelSelect } from '@/features/ai/components/ModelSelect';
import { FALLBACK_MODELS } from '@/features/ai/models';
import { PROVIDER_LABELS, type AiSettings, type UpdateAiSettingsInput } from '@/features/ai/types/ai.types';
import { formatDate } from '@/lib/format';
import { paths } from '@/routes/paths';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'] as const;

/** The editable part of the settings (everything except read-only status fields). */
function toInput(s: AiSettings): UpdateAiSettingsInput {
  return {
    aiEnabled: s.aiEnabled,
    practiceProvider: s.practiceProvider,
    reflectionProvider: s.reflectionProvider,
    claudeModel: s.claudeModel,
    geminiModel: s.geminiModel,
    geminiTranscribeModel: s.geminiTranscribeModel,
    claudeEffort: s.claudeEffort,
    callMode: s.callMode,
    backupEnabled: s.backupEnabled,
    nightlyRunTime: s.nightlyRunTime,
    runTimezone: s.runTimezone,
    autoApproveEnabled: s.autoApproveEnabled,
    autoApproveMinRating: s.autoApproveMinRating,
    autoApproveRequireNoFlags: s.autoApproveRequireNoFlags,
    spotCheckPercent: s.spotCheckPercent,
    greenMinRating: s.greenMinRating,
    amberMinRating: s.amberMinRating,
    needsMeDaysWithoutSession: s.needsMeDaysWithoutSession,
    weeklyReviewDay: s.weeklyReviewDay,
    monthlySpendLimitUsd: s.monthlySpendLimitUsd ?? null,
  };
}

/** The AI section of the admin settings (memos 12.10.2026, 6 and 17.10.2026, 1.3). */
export default function AiSettingsPage() {
  const { data: settings, isLoading, isError, refetch } = useAiSettings();
  const { data: status } = useAiStatus();
  const { data: models } = useAiModels();
  const { update, runNow } = useAiSettingsMutations();
  const [form, setForm] = useState<UpdateAiSettingsInput | null>(null);

  useEffect(() => {
    if (settings) setForm(toInput(settings));
  }, [settings]);

  if (isLoading) return <LoadingState label="Loading AI settings…" />;
  if (isError || !settings || !form) return <ErrorState onRetry={() => refetch()} />;

  const set = <K extends keyof UpdateAiSettingsInput>(key: K, value: UpdateAiSettingsInput[K]) =>
    setForm((f) => (f ? { ...f, [key]: value } : f));
  const num = (v: string) => (v === '' ? 0 : Number(v));

  return (
    <div className="space-y-5">
      <PageHeader
        title="AI settings"
        subtitle="Claude does the reading; Gemini is the backup and turns voice notes into text. Only you see what the AI writes."
        action={
          <div className="flex flex-wrap gap-2">
            <Link to={paths.admin.referencePack}>
              <Button variant="outline"><FileText className="h-4 w-4" /> Reference pack</Button>
            </Link>
            <Button
              variant="secondary"
              onClick={() => runNow.mutate()}
              isLoading={runNow.isPending}
              disabled={!settings.aiEnabled || status?.running}
              title={settings.aiEnabled ? 'Run tonight’s analysis now' : 'Switch the AI on first'}
            >
              <Play className="h-4 w-4" /> Run now
            </Button>
          </div>
        }
      />

      <Card>
        <CardHeader title="Status" />
        <CardBody className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <KeyStatus label="Claude" ok={settings.claudeConfigured} />
          <KeyStatus label="Gemini" ok={settings.geminiConfigured} />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Last run</p>
            <p className="mt-1 text-slate-700">
              {status?.running ? (
                <span className="inline-flex items-center gap-1.5"><Loader2 className="h-4 w-4 animate-spin" /> Running…</span>
              ) : settings.lastRunDate ? formatDate(settings.lastRunDate) : 'Never'}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Waiting for the AI</p>
            <p className="mt-1 text-slate-700">
              {status ? `${status.jobsWaiting} job(s), ${status.openBatches} batch(es)` : '—'}
            </p>
          </div>
          {status && status.usageThisMonth.length > 0 && (
            <div className="sm:col-span-2 lg:col-span-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">This month</p>
              <ul className="mt-1 space-y-0.5 text-slate-700">
                {status.usageThisMonth.map((u) => (
                  <li key={u.provider}>
                    {PROVIDER_LABELS[u.provider]}: {u.results} result(s), {u.inputTokens.toLocaleString()} input and{' '}
                    {u.outputTokens.toLocaleString()} output tokens ({u.cacheReadTokens.toLocaleString()} from cache)
                  </li>
                ))}
              </ul>
              {status.jobsNotAnalysedThisMonth > 0 && (
                <p className="mt-1 text-amber-700">{status.jobsNotAnalysedThisMonth} item(s) not analysed this month.</p>
              )}
            </div>
          )}
          <p className="text-xs text-slate-500 sm:col-span-2 lg:col-span-4">
            Keys are kept only in the server’s settings (ANTHROPIC_API_KEY, GEMINI_API_KEY) and are never shown here.
            An AI without a key is skipped, including as a backup.
          </p>
        </CardBody>
      </Card>

      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          update.mutate(form);
        }}
      >
        <Card>
          <CardHeader title="General" />
          <CardBody className="space-y-4">
            <Row label="AI on" hint={settings.analyseFrom ? `Analysing submissions from ${formatDate(settings.analyseFrom)} onwards.` : 'When you switch it on, only new submissions are analysed.'}>
              <Switch checked={form.aiEnabled} onChange={(e) => set('aiEnabled', e.target.checked)} />
            </Row>
            <Row label="AI for practice sessions">
              <Select className="w-40" value={form.practiceProvider} onChange={(e) => set('practiceProvider', e.target.value as UpdateAiSettingsInput['practiceProvider'])}>
                <option value="CLAUDE">Claude</option>
                <option value="GEMINI">Gemini</option>
              </Select>
            </Row>
            <Row label="AI for reflections">
              <Select className="w-40" value={form.reflectionProvider} onChange={(e) => set('reflectionProvider', e.target.value as UpdateAiSettingsInput['reflectionProvider'])}>
                <option value="CLAUDE">Claude</option>
                <option value="GEMINI">Gemini</option>
              </Select>
            </Row>
            <Row label="Backup" hint="If the chosen AI fails, send the same job to the other one.">
              <Switch checked={form.backupEnabled} onChange={(e) => set('backupEnabled', e.target.checked)} />
            </Row>
            <Row label="Calls" hint="Batch: half price, results within hours. Normal: immediate, full price. Applies to both AIs.">
              <Select className="w-40" value={form.callMode} onChange={(e) => set('callMode', e.target.value as UpdateAiSettingsInput['callMode'])}>
                <option value="BATCH">Batch</option>
                <option value="NORMAL">Normal</option>
              </Select>
            </Row>
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Models"
            subtitle={
              models && (!models.claudeLive || !models.geminiLive)
                ? 'Lists come from Claude and Gemini. An AI without a key shows the memo’s models; choose “Other…” to type any name.'
                : 'Lists come straight from Claude and Gemini, so new models appear here without a new app release.'
            }
          />
          <CardBody className="space-y-4">
            <Row label="Claude model">
              <ModelSelect className="w-80" value={form.claudeModel} options={models?.claude ?? FALLBACK_MODELS.claude} onChange={(v) => set('claudeModel', v)} />
            </Row>
            <Row label="Claude effort" hint="How much Claude thinks before it answers.">
              <Select className="w-40" value={form.claudeEffort} onChange={(e) => set('claudeEffort', e.target.value as UpdateAiSettingsInput['claudeEffort'])}>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </Select>
            </Row>
            <Row label="Gemini model">
              <ModelSelect className="w-80" value={form.geminiModel} options={models?.gemini ?? FALLBACK_MODELS.gemini} onChange={(v) => set('geminiModel', v)} />
            </Row>
            <Row label="Gemini voice-note model" hint="Always a normal call, so voice notes are ready for the same night’s run.">
              <ModelSelect
                className="w-80"
                value={form.geminiTranscribeModel}
                options={models?.gemini ?? FALLBACK_MODELS.gemini}
                onChange={(v) => set('geminiTranscribeModel', v)}
              />
            </Row>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Nightly run" />
          <CardBody className="space-y-4">
            <Row label="Run time">
              <Input
                type="time"
                className="w-40"
                value={form.nightlyRunTime.slice(0, 5)}
                onChange={(e) => set('nightlyRunTime', `${e.target.value}:00`)}
              />
            </Row>
            <Row label="Time zone">
              <Input className="w-64" value={form.runTimezone} onChange={(e) => set('runTimezone', e.target.value)} />
            </Row>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Auto-approve" subtitle="Off by default. The AI can never reject a session." />
          <CardBody className="space-y-4">
            <Row label="Auto-approve">
              <Switch checked={form.autoApproveEnabled} onChange={(e) => set('autoApproveEnabled', e.target.checked)} />
            </Row>
            <Row label="Approve from trust rating">
              <Input type="number" min={1} max={10} className="w-24" value={form.autoApproveMinRating} onChange={(e) => set('autoApproveMinRating', num(e.target.value))} />
            </Row>
            <Row label="Only when there are no flags">
              <Switch checked={form.autoApproveRequireNoFlags} onChange={(e) => set('autoApproveRequireNoFlags', e.target.checked)} />
            </Row>
            <Row label="Spot check (%)" hint="Share of auto-approved sessions that also go to your review queue.">
              <Input type="number" min={0} max={100} className="w-24" value={form.spotCheckPercent} onChange={(e) => set('spotCheckPercent', num(e.target.value))} />
            </Row>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Dashboard and colours" />
          <CardBody className="space-y-4">
            <Row label="Green from rating">
              <Input type="number" min={2} max={10} className="w-24" value={form.greenMinRating} onChange={(e) => set('greenMinRating', num(e.target.value))} />
            </Row>
            <Row label="Amber from rating" hint="Below this is red.">
              <Input type="number" min={1} max={9} className="w-24" value={form.amberMinRating} onChange={(e) => set('amberMinRating', num(e.target.value))} />
            </Row>
            <Row label="Days without a session before “Needs me”">
              <Input type="number" min={1} max={30} className="w-24" value={form.needsMeDaysWithoutSession} onChange={(e) => set('needsMeDaysWithoutSession', num(e.target.value))} />
            </Row>
            <Row label="Weekly review day">
              <Select className="w-40" value={form.weeklyReviewDay} onChange={(e) => set('weeklyReviewDay', e.target.value as UpdateAiSettingsInput['weeklyReviewDay'])}>
                {DAYS.map((d) => <option key={d} value={d}>{d.charAt(0) + d.slice(1).toLowerCase()}</option>)}
              </Select>
            </Row>
            <Row label="Monthly spending limit (USD)" hint="Saved for reference. Today the Claude workspace limit is what stops spending.">
              <Input
                type="number"
                min={0}
                step="0.01"
                className="w-32"
                value={form.monthlySpendLimitUsd ?? ''}
                onChange={(e) => set('monthlySpendLimitUsd', e.target.value === '' ? null : Number(e.target.value))}
              />
            </Row>
          </CardBody>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" isLoading={update.isPending}><Save className="h-4 w-4" /> Save AI settings</Button>
        </div>
      </form>
    </div>
  );
}

function Row({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-50 pb-3 last:border-0 last:pb-0">
      <div>
        <p className="text-sm font-medium text-slate-700">{label}</p>
        {hint && <p className="text-xs text-slate-500">{hint}</p>}
      </div>
      {children}
    </div>
  );
}

function KeyStatus({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className={`mt-1 inline-flex items-center gap-1.5 ${ok ? 'text-green-700' : 'text-slate-500'}`}>
        {ok ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
        {ok ? 'Set up' : 'Not set up (no key)'}
      </p>
    </div>
  );
}
