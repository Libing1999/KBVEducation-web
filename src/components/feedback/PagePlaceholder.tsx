import { Construction } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';

interface PagePlaceholderProps {
  title: string;
  description?: string;
  step?: string;
}

/**
 * Temporary stand-in for pages that are scaffolded but implemented in a later
 * build step. Keeps the routing/navigation fully wired in the meantime.
 */
export function PagePlaceholder({ title, description, step }: PagePlaceholderProps) {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-slate-800">{title}</h1>
      <Card>
        <CardBody className="flex flex-col items-center gap-3 py-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary">
            <Construction className="h-6 w-6" />
          </div>
          <p className="max-w-md text-sm text-slate-500">
            {description ?? 'This screen is scaffolded and will be implemented in an upcoming step.'}
          </p>
          {step && (
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              {step}
            </span>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
