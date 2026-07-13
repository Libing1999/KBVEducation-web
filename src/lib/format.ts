/** Formatting helpers for dates, times, names, and percentages. */

const DATE_FMT = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

const DATETIME_FMT = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export function formatDate(value?: string | null): string {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '—' : DATE_FMT.format(d);
}

export function formatDateTime(value?: string | null): string {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '—' : DATETIME_FMT.format(d);
}

export function formatPercent(value: number, fractionDigits = 0): string {
  return `${value.toFixed(fractionDigits)}%`;
}

export function formatFileSize(bytes?: number | null): string {
  if (!bytes || bytes <= 0) return '—';
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(kb < 10 ? 1 : 0)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

export function initials(firstName?: string, lastName?: string): string {
  return `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase();
}

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Administrator',
  STUDENT: 'Student',
  PARENT: 'Parent',
};

export function roleLabel(role: string): string {
  return ROLE_LABELS[role] ?? role;
}
