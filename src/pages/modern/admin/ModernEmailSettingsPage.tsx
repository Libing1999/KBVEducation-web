import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail } from 'lucide-react';
import { PageHeader } from '@/components/modern/ui/PageHeader';
import { Card, CardHeader, CardBody } from '@/components/modern/ui/Card';
import { Button } from '@/components/modern/ui/Button';
import { Input } from '@/components/modern/ui/Input';
import { PasswordInput } from '@/components/modern/ui/PasswordInput';
import { Switch } from '@/components/modern/ui/Switch';
import { FormField } from '@/components/modern/ui/FormField';
import { LoadingState } from '@/components/modern/ui/Spinner';
import { ErrorState } from '@/components/modern/ui/ErrorState';
import {
  useEmailSettings,
  useSendTestEmail,
  useUpdateEmailSettings,
} from '@/features/settings/hooks/useEmailSettings';

const schema = z.object({
  smtpHost: z.string().max(255).optional().or(z.literal('')),
  smtpPort: z.coerce.number().int().min(1).max(65535),
  smtpUsername: z.string().max(255).optional().or(z.literal('')),
  smtpPassword: z.string().max(500).optional().or(z.literal('')),
  senderName: z.string().max(150).optional().or(z.literal('')),
  senderEmail: z.string().email('Must be a valid email').optional().or(z.literal('')),
  useTls: z.boolean(),
  useSsl: z.boolean(),
});
type FormValues = z.infer<typeof schema>;

/** Modern port of EmailSettingsPage — same schema/mutations, dark styling. */
export default function ModernEmailSettingsPage() {
  const { data: settings, isLoading, isError, refetch } = useEmailSettings();
  const mutation = useUpdateEmailSettings();
  const sendTest = useSendTestEmail();
  const [testRecipient, setTestRecipient] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: settings
      ? {
          smtpHost: settings.smtpHost ?? '',
          smtpPort: settings.smtpPort ?? 587,
          smtpUsername: settings.smtpUsername ?? '',
          smtpPassword: '',
          senderName: settings.senderName ?? '',
          senderEmail: settings.senderEmail ?? '',
          useTls: settings.useTls,
          useSsl: settings.useSsl,
        }
      : undefined,
  });

  const submit = handleSubmit((v) => {
    mutation.mutate({ ...v, smtpPassword: v.smtpPassword || undefined });
  });

  if (isLoading) return <LoadingState label="Loading email settings…" />;
  if (isError || !settings) {
    return <ErrorState message="Failed to load email settings." onRetry={() => refetch()} />;
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Email Settings"
        subtitle="SMTP configuration used for cohort assignment notifications and future email events."
      />

      <form onSubmit={submit} className="space-y-5" noValidate>
        <Card>
          <CardHeader
            title="SMTP Server"
            subtitle={
              settings.configured
                ? 'A host is configured — outbound email is active.'
                : 'No host configured yet — emails will be skipped and logged as such.'
            }
          />
          <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="SMTP Host" htmlFor="mes-host" error={errors.smtpHost?.message} className="sm:col-span-2">
              <Input id="mes-host" placeholder="smtp.gmail.com" {...register('smtpHost')} />
            </FormField>
            <FormField label="SMTP Port" htmlFor="mes-port" error={errors.smtpPort?.message} required>
              <Input id="mes-port" type="number" min={1} max={65535} {...register('smtpPort')} />
            </FormField>
            <FormField label="Sender Email" htmlFor="mes-sender-email" error={errors.senderEmail?.message}>
              <Input id="mes-sender-email" type="email" placeholder="noreply@kbv.edu" {...register('senderEmail')} />
            </FormField>
            <FormField label="Sender Name" htmlFor="mes-sender-name" error={errors.senderName?.message}>
              <Input id="mes-sender-name" placeholder="KBV Education" {...register('senderName')} />
            </FormField>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Authentication" subtitle="Leave the password blank to keep the one already stored." />
          <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="SMTP Username" htmlFor="mes-username" error={errors.smtpUsername?.message}>
              <Input id="mes-username" autoComplete="off" {...register('smtpUsername')} />
            </FormField>
            <FormField label="SMTP Password" htmlFor="mes-password" error={errors.smtpPassword?.message}>
              <PasswordInput
                id="mes-password"
                autoComplete="new-password"
                placeholder={settings.passwordSet ? 'Stored — leave blank to keep' : 'Not set'}
                {...register('smtpPassword')}
              />
            </FormField>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Encryption" />
          <CardBody className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex items-center justify-between gap-4 rounded-lg border border-[rgba(238,242,249,.1)] p-3">
              <label htmlFor="mes-tls" className="text-sm font-medium text-[rgba(238,242,249,.75)]">Use STARTTLS</label>
              <Switch id="mes-tls" {...register('useTls')} />
            </div>
            <div className="flex items-center justify-between gap-4 rounded-lg border border-[rgba(238,242,249,.1)] p-3">
              <label htmlFor="mes-ssl" className="text-sm font-medium text-[rgba(238,242,249,.75)]">Use SSL</label>
              <Switch id="mes-ssl" {...register('useSsl')} />
            </div>
          </CardBody>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" isLoading={mutation.isPending}>Save Changes</Button>
        </div>
      </form>

      <Card>
        <CardHeader
          title="Send a Test Email"
          subtitle="Uses the settings currently saved above — save your changes first if you just edited them."
        />
        <CardBody className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <FormField label="Recipient" htmlFor="mes-test-recipient" className="flex-1">
            <Input
              id="mes-test-recipient"
              type="email"
              placeholder="you@example.com"
              value={testRecipient}
              onChange={(e) => setTestRecipient(e.target.value)}
            />
          </FormField>
          <Button
            type="button"
            variant="outline"
            isLoading={sendTest.isPending}
            disabled={!testRecipient}
            onClick={() => sendTest.mutate(testRecipient)}
          >
            <Mail className="h-4 w-4" /> Send Test Email
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}
