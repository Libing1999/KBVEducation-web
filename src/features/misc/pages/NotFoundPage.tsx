import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { paths } from '@/routes/paths';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-secondary p-6 text-center">
      <p className="text-6xl font-bold text-primary">404</p>
      <h1 className="text-xl font-semibold text-slate-800">Page not found</h1>
      <p className="max-w-sm text-sm text-slate-500">
        The page you are looking for doesn’t exist or has been moved.
      </p>
      <Link to={paths.dashboard}>
        <Button>Back to dashboard</Button>
      </Link>
    </div>
  );
}
