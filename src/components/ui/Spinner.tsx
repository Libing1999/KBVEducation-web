import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn('h-5 w-5 animate-spin text-primary', className)} />;
}

/** Full-area centered loading indicator for route/section suspense. */
export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-slate-500">
      <Spinner className="h-7 w-7" />
      <span className="text-sm">{label}</span>
    </div>
  );
}
