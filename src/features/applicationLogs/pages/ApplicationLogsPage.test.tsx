import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ApplicationLogsPage from './ApplicationLogsPage';
import type { ApplicationLogEntry, ApplicationLogQuery } from '@/features/applicationLogs/types/applicationLog.types';
import type { PageResponse } from '@/types/pagination';

vi.mock('@/features/applicationLogs/api/applicationLogApi', () => ({
  applicationLogApi: { list: vi.fn() },
}));

import { applicationLogApi } from '@/features/applicationLogs/api/applicationLogApi';

const ENTRIES: ApplicationLogEntry[] = [
  {
    id: '1',
    severity: 'ERROR',
    source: 'NullPointerException',
    message: 'Something broke',
    endpoint: '/api/admin/export/dataset/STUDENTS',
    httpMethod: 'GET',
    ipAddress: '127.0.0.1',
    createdAt: '2026-07-17T06:00:00Z',
  },
  {
    id: '2',
    severity: 'WARNING',
    source: 'AccessDeniedException',
    message: 'Access Denied',
    endpoint: '/api/admin/users',
    httpMethod: 'GET',
    ipAddress: '127.0.0.1',
    createdAt: '2026-07-17T06:01:00Z',
  },
];

function page(content: ApplicationLogEntry[]): PageResponse<ApplicationLogEntry> {
  return {
    content, page: 0, size: 20, totalElements: content.length, totalPages: 1, first: true, last: true, empty: content.length === 0,
  };
}

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <ApplicationLogsPage />
    </QueryClientProvider>,
  );
}

describe('ApplicationLogsPage', () => {
  it('renders log entries from the API', async () => {
    vi.mocked(applicationLogApi.list).mockResolvedValue(page(ENTRIES));

    renderPage();

    await waitFor(() => expect(screen.getByText('NullPointerException')).toBeInTheDocument());
    expect(screen.getByText('AccessDeniedException')).toBeInTheDocument();
    expect(screen.getByText('ERROR')).toBeInTheDocument();
    expect(screen.getByText('WARNING')).toBeInTheDocument();
  });

  it('shows an empty state when there are no log entries', async () => {
    vi.mocked(applicationLogApi.list).mockResolvedValue(page([]));

    renderPage();

    await waitFor(() =>
      expect(screen.getByText('No application log entries found.')).toBeInTheDocument(),
    );
  });

  it('re-queries with the selected severity filter', async () => {
    vi.mocked(applicationLogApi.list).mockResolvedValue(page(ENTRIES));
    renderPage();
    await waitFor(() => expect(applicationLogApi.list).toHaveBeenCalled());

    await userEvent.selectOptions(screen.getByRole('combobox'), 'ERROR');

    await waitFor(() => {
      const lastCall = vi.mocked(applicationLogApi.list).mock.calls.at(-1)?.[0] as ApplicationLogQuery;
      expect(lastCall.severity).toBe('ERROR');
    });
  });
});
