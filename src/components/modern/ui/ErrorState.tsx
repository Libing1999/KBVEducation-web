import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/modern/ui/Button';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

/** Modern UI's ErrorState — same prop contract as the Default UI's, dark palette. */
export function ErrorState({ message = 'Failed to load data.', onRetry }: ErrorStateProps) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#8B2E2E]/15 text-[#e08a8a]">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <p className="max-w-sm text-sm text-[rgba(238,242,249,.55)]">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
