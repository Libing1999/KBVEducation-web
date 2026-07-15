import { Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { downloadFile } from '@/lib/download';

interface Props {
  label?: string;
  csvUrl: string;
  xlsxUrl: string;
  fileBaseName: string;
  disabled?: boolean;
}

/** A "CSV" / "Excel" button pair for one exportable dataset, reused across the leaderboard, analytics and per-student progress pages. */
export function ExportButtons({ label, csvUrl, xlsxUrl, fileBaseName, disabled }: Props) {
  return (
    <div className="flex items-center gap-2">
      {label && <span className="text-xs font-medium text-slate-500">{label}</span>}
      <Button
        variant="outline"
        size="sm"
        disabled={disabled}
        onClick={() => downloadFile(csvUrl, `${fileBaseName}.csv`)}
      >
        <Download className="h-3.5 w-3.5" /> CSV
      </Button>
      <Button
        variant="outline"
        size="sm"
        disabled={disabled}
        onClick={() => downloadFile(xlsxUrl, `${fileBaseName}.xlsx`)}
      >
        <Download className="h-3.5 w-3.5" /> Excel
      </Button>
    </div>
  );
}
