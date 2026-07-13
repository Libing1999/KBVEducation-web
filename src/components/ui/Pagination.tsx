import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface PaginationProps {
  page: number; // 0-based
  totalPages: number;
  totalElements: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, totalElements, onPageChange }: PaginationProps) {
  if (totalElements === 0) return null;

  return (
    <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
      <p className="text-sm text-slate-500">
        Page <span className="font-medium text-slate-700">{page + 1}</span> of{' '}
        <span className="font-medium text-slate-700">{Math.max(totalPages, 1)}</span> ·{' '}
        {totalElements} {totalElements === 1 ? 'item' : 'items'}
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 0}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="h-4 w-4" /> Prev
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages - 1}
          onClick={() => onPageChange(page + 1)}
        >
          Next <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
