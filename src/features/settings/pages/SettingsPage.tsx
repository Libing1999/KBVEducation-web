import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Switch } from '@/components/ui/Switch';
import { FormField } from '@/components/form/FormField';
import { LoadingState } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/feedback/ErrorState';
import { useSystemSettings, useUpdateSystemSettings } from '@/features/settings/hooks/useSettings';

const hexColor = z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a 6-digit hex color, e.g. #1B3A6B');

const schema = z.object({
  applicationName: z.string().min(1, 'Required').max(150),
  institutionName: z.string().min(1, 'Required').max(150),
  logoPath: z.string().optional().or(z.literal('')),
  primaryColorHex: hexColor,
  secondaryColorHex: hexColor,
  accentColorHex: hexColor,
  timezone: z.string().min(1, 'Required'),
  dateFormat: z.string().min(1, 'Required'),
  maxFileSizeMb: z.coerce.number().int().min(1),
  allowedFileTypes: z.string().min(1, 'Required'),
  maxLoginAttempts: z.coerce.number().int().min(1),
  passwordMinLength: z.coerce.number().int().min(6),
  passwordRequireUppercase: z.boolean(),
  passwordRequireLowercase: z.boolean(),
  passwordRequireDigit: z.boolean(),
  passwordRequireSpecial: z.boolean(),
  sessionTimeoutMinutes: z.coerce.number().int().min(5),
  maintenanceMode: z.boolean(),
  certificateEnabled: z.boolean(),
  exportEnabled: z.boolean(),
});
type FormValues = z.infer<typeof schema>;

export default function SettingsPage() {
  const { data: settings, isLoading, isError, refetch } = useSystemSettings();
  const mutation = useUpdateSystemSettings();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: settings ? { ...settings, logoPath: settings.logoPath ?? '' } : undefined,
  });

  const submit = handleSubmit((v) => {
    mutation.mutate({ ...v, logoPath: v.logoPath || undefined });
  });

  if (isLoading) return <LoadingState label="Loading settings…" />;
  if (isError || !settings) {
    return <ErrorState message="Failed to load system settings." onRetry={() => refetch()} />;
  }

  return (
    <div className="space-y-5">
      <PageHeader title="System Settings" subtitle="Branding, locale, uploads, security policy, and feature toggles." />

      <form onSubmit={submit} className="space-y-5" noValidate>
        <Card>
          <CardHeader title="Branding" />
          <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Application Name" htmlFor="st-app-name" error={errors.applicationName?.message} required>
              <Input id="st-app-name" aria-invalid={!!errors.applicationName} {...register('applicationName')} />
            </FormField>
            <FormField label="Institution Name" htmlFor="st-inst-name" error={errors.institutionName?.message} required>
              <Input id="st-inst-name" aria-invalid={!!errors.institutionName} {...register('institutionName')} />
            </FormField>
            <FormField label="Logo URL" htmlFor="st-logo" error={errors.logoPath?.message} className="sm:col-span-2">
              <Input id="st-logo" placeholder="https://…" {...register('logoPath')} />
            </FormField>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Colors" subtitle="Applied to the sidebar, primary buttons, and branding immediately." />
          <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {(['primaryColorHex', 'secondaryColorHex', 'accentColorHex'] as const).map((field) => (
              <FormField
                key={field}
                label={field === 'primaryColorHex' ? 'Primary' : field === 'secondaryColorHex' ? 'Secondary' : 'Accent'}
                htmlFor={`st-${field}`}
                error={errors[field]?.message}
                required
              >
                <div className="flex items-center gap-2">
                  <input type="color" className="h-10 w-10 shrink-0 cursor-pointer rounded-lg border border-slate-300" {...register(field)} />
                  <Input id={`st-${field}`} aria-invalid={!!errors[field]} {...register(field)} />
                </div>
              </FormField>
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Locale" />
          <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Timezone" htmlFor="st-timezone" error={errors.timezone?.message} required>
              <Input id="st-timezone" placeholder="UTC" {...register('timezone')} />
            </FormField>
            <FormField label="Date Format" htmlFor="st-date-format" error={errors.dateFormat?.message} required>
              <Input id="st-date-format" placeholder="yyyy-MM-dd" {...register('dateFormat')} />
            </FormField>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Uploads" />
          <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Max File Size (MB)" htmlFor="st-max-file" error={errors.maxFileSizeMb?.message} required>
              <Input id="st-max-file" type="number" min={1} {...register('maxFileSizeMb')} />
            </FormField>
            <FormField label="Allowed File Types" htmlFor="st-allowed-types" error={errors.allowedFileTypes?.message} required>
              <Input id="st-allowed-types" placeholder="pdf,doc,docx,jpg" {...register('allowedFileTypes')} />
            </FormField>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Security" />
          <CardBody className="space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Max Login Attempts" htmlFor="st-max-attempts" error={errors.maxLoginAttempts?.message} required>
                <Input id="st-max-attempts" type="number" min={1} {...register('maxLoginAttempts')} />
              </FormField>
              <FormField label="Session Timeout (minutes)" htmlFor="st-session-timeout" error={errors.sessionTimeoutMinutes?.message} required>
                <Input id="st-session-timeout" type="number" min={5} {...register('sessionTimeoutMinutes')} />
              </FormField>
              <FormField label="Password Min Length" htmlFor="st-pw-len" error={errors.passwordMinLength?.message} required>
                <Input id="st-pw-len" type="number" min={6} {...register('passwordMinLength')} />
              </FormField>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {([
                ['passwordRequireUppercase', 'Require uppercase letter'],
                ['passwordRequireLowercase', 'Require lowercase letter'],
                ['passwordRequireDigit', 'Require digit'],
                ['passwordRequireSpecial', 'Require special character'],
              ] as const).map(([field, label]) => (
                <div key={field} className="flex items-center justify-between gap-4 rounded-lg border border-slate-100 p-3">
                  <label htmlFor={`st-${field}`} className="text-sm font-medium text-slate-700">{label}</label>
                  <Switch id={`st-${field}`} {...register(field)} />
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Feature Toggles" />
          <CardBody className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <div>
                <label htmlFor="st-maintenance" className="text-sm font-medium text-slate-700">Maintenance Mode</label>
                <p className="text-xs text-slate-500">When on, only SUPER_ADMIN can use the app.</p>
              </div>
              <Switch id="st-maintenance" {...register('maintenanceMode')} />
            </div>
            <div className="flex items-center justify-between gap-4">
              <div>
                <label htmlFor="st-certs" className="text-sm font-medium text-slate-700">Certificates Enabled</label>
              </div>
              <Switch id="st-certs" {...register('certificateEnabled')} />
            </div>
            <div className="flex items-center justify-between gap-4">
              <div>
                <label htmlFor="st-export" className="text-sm font-medium text-slate-700">Export Enabled</label>
              </div>
              <Switch id="st-export" {...register('exportEnabled')} />
            </div>
          </CardBody>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" isLoading={mutation.isPending}>Save Changes</Button>
        </div>
      </form>
    </div>
  );
}
