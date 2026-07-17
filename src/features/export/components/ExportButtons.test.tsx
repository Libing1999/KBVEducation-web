import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExportButtons } from './ExportButtons';

vi.mock('@/lib/download', () => ({
  downloadFile: vi.fn(),
}));

import { downloadFile } from '@/lib/download';

describe('ExportButtons', () => {
  it('downloads the CSV url with a .csv filename when the CSV button is clicked', async () => {
    render(
      <ExportButtons csvUrl="/admin/export/leaderboard?format=csv" xlsxUrl="/admin/export/leaderboard?format=xlsx"
        fileBaseName="leaderboard" />,
    );
    await userEvent.click(screen.getByRole('button', { name: /csv/i }));
    expect(downloadFile).toHaveBeenCalledWith('/admin/export/leaderboard?format=csv', 'leaderboard.csv');
  });

  it('downloads the Excel url with a .xlsx filename when the Excel button is clicked', async () => {
    render(
      <ExportButtons csvUrl="/admin/export/leaderboard?format=csv" xlsxUrl="/admin/export/leaderboard?format=xlsx"
        fileBaseName="leaderboard" />,
    );
    await userEvent.click(screen.getByRole('button', { name: /excel/i }));
    expect(downloadFile).toHaveBeenCalledWith('/admin/export/leaderboard?format=xlsx', 'leaderboard.xlsx');
  });

  it('disables both buttons when disabled is set', () => {
    render(
      <ExportButtons csvUrl="/x" xlsxUrl="/y" fileBaseName="x" disabled />,
    );
    expect(screen.getByRole('button', { name: /csv/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /excel/i })).toBeDisabled();
  });

  it('renders the optional label', () => {
    render(<ExportButtons csvUrl="/x" xlsxUrl="/y" fileBaseName="x" label="Export:" />);
    expect(screen.getByText('Export:')).toBeInTheDocument();
  });
});
