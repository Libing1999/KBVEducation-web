import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { FormField } from '@/components/form/FormField';
import { useCreateCertificateTemplate, useUpdateCertificateTemplate } from '@/features/certificates/hooks/useCertificates';
import type { CertificateTemplate } from '@/features/certificates/types/certificates.types';

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(150),
  certificateType: z.enum(['TIER_1', 'TIER_2', 'TIER_3', 'COMPLETION']),
  bodyTemplate: z.string().min(1, 'Citation text is required'),
  primaryColorHex: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a 6-digit hex color, e.g. #1B3A6B'),
  institutionNameOverride: z.string().max(150).optional().or(z.literal('')),
  logoPathOverride: z.string().optional().or(z.literal('')),
});
type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  template?: CertificateTemplate | null;
}

export function CertificateTemplateFormModal({ open, onClose, template }: Props) {
  const isEdit = !!template;
  const create = useCreateCertificateTemplate();
  const update = useUpdateCertificateTemplate();

  const {
    register,
    control,
    setValue,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: template
      ? {
          name: template.name,
          certificateType: template.certificateType,
          bodyTemplate: template.bodyTemplate,
          primaryColorHex: template.primaryColorHex,
          institutionNameOverride: template.institutionNameOverride ?? '',
          logoPathOverride: template.logoPathOverride ?? '',
        }
      : {
          name: '',
          certificateType: 'TIER_1',
          bodyTemplate:
            'In recognition of outstanding commitment and achievement, this certificate is proudly awarded to {{studentName}} for reaching {{tierName}} in the {{cohortName}} program.',
          primaryColorHex: '#1B3A6B',
          institutionNameOverride: '',
          logoPathOverride: '',
        },
  });

  const submit = handleSubmit((v) => {
    const payload = {
      name: v.name,
      certificateType: v.certificateType,
      bodyTemplate: v.bodyTemplate,
      primaryColorHex: v.primaryColorHex,
      institutionNameOverride: v.institutionNameOverride || undefined,
      logoPathOverride: v.logoPathOverride || undefined,
    };
    if (isEdit) {
      update.mutate({ id: template!.id, payload }, { onSuccess: () => { reset(); onClose(); } });
    } else {
      create.mutate(payload, { onSuccess: () => { reset(); onClose(); } });
    }
  });

  const isPending = create.isPending || update.isPending;
  const colorValue = useWatch({ control, name: 'primaryColorHex' });
  const swatchValue = /^#[0-9A-Fa-f]{6}$/.test(colorValue) ? colorValue : '#1B3A6B';

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Certificate Template' : 'Create Certificate Template'}
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isPending}>Cancel</Button>
          <Button onClick={submit} isLoading={isPending}>{isEdit ? 'Save changes' : 'Create template'}</Button>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Template Name" htmlFor="ct-name" error={errors.name?.message} required>
            <Input id="ct-name" aria-invalid={!!errors.name} {...register('name')} />
          </FormField>
          <FormField label="Certificate Type" htmlFor="ct-type" error={errors.certificateType?.message} required>
            <Select id="ct-type" {...register('certificateType')}>
              <option value="TIER_1">Tier 1</option>
              <option value="TIER_2">Tier 2</option>
              <option value="TIER_3">Tier 3</option>
              <option value="COMPLETION">Certificate of Completion</option>
            </Select>
          </FormField>
        </div>

        <FormField
          label="Citation Text"
          htmlFor="ct-body"
          error={errors.bodyTemplate?.message}
          required
          className="space-y-1"
        >
          <Textarea id="ct-body" rows={5} aria-invalid={!!errors.bodyTemplate} {...register('bodyTemplate')} />
          <p className="text-xs text-slate-500">
            Available placeholders: <code>{'{{studentName}}'}</code> <code>{'{{tierName}}'}</code>{' '}
            <code>{'{{cohortName}}'}</code> <code>{'{{issueDate}}'}</code> <code>{'{{certificateNumber}}'}</code>.
            The student's name is always shown prominently regardless.
          </p>
        </FormField>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Accent Color" htmlFor="ct-color" error={errors.primaryColorHex?.message} required>
            <div className="flex items-center gap-2">
              <input
                type="color"
                aria-label="Pick accent color"
                className="h-10 w-10 shrink-0 cursor-pointer rounded-lg border border-slate-300"
                value={swatchValue}
                onChange={(e) => setValue('primaryColorHex', e.target.value, { shouldValidate: true })}
              />
              <Input id="ct-color" aria-invalid={!!errors.primaryColorHex} {...register('primaryColorHex')} />
            </div>
          </FormField>
          <FormField label="Institution Name Override" htmlFor="ct-institution" error={errors.institutionNameOverride?.message}>
            <Input id="ct-institution" placeholder="Defaults to KBV Education" {...register('institutionNameOverride')} />
          </FormField>
        </div>

        <FormField label="Logo Path Override" htmlFor="ct-logo" error={errors.logoPathOverride?.message}>
          <Input id="ct-logo" placeholder="Optional absolute path to a logo image" {...register('logoPathOverride')} />
        </FormField>
      </form>
    </Modal>
  );
}
