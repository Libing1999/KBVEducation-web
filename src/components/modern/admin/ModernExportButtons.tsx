import { Download } from 'lucide-react';
import { Button } from '@/components/modern/ui/Button';
import { downloadFile } from '@/lib/download';

interface Props {
  label?: string;
  csvUrl: string;
  xlsxUrl: string;
  fileBaseName: string;
  disabled?: boolean;
}

/** Modern port of ExportButtons — same download logic, dark styling. */
export function ModernExportButtons({ label, csvUrl, xlsxUrl, fileBaseName, disabled }: Props) {
  return (
    <div className="flex items-center gap-2">
      {label && <span className="text-xs font-medium text-[rgba(238,242,249,.55)]">{label}</span>}
      <Button variant="outline" size="sm" disabled={disabled} onClick={() => downloadFile(csvUrl, `${fileBaseName}.csv`)}>
        <Download className="h-3.5 w-3.5" /> CSV
      </Button>
      <Button variant="outline" size="sm" disabled={disabled} onClick={() => downloadFile(xlsxUrl, `${fileBaseName}.xlsx`)}>
        <Download className="h-3.5 w-3.5" /> Excel
      </Button>
    </div>
  );
}
