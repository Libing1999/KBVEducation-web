import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from '@/components/ui/Button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Top-level error boundary. Catches render-time errors anywhere in the tree and
 * shows a recoverable fallback instead of a blank screen.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Hook a monitoring service (e.g. Sentry) here in a later phase.
    console.error('Uncaught render error:', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.assign('/');
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-secondary p-6 text-center">
          <h1 className="text-xl font-semibold text-slate-800">Something went wrong</h1>
          <p className="max-w-md text-sm text-slate-500">
            An unexpected error occurred. Try reloading the page. If the problem persists, contact
            support.
          </p>
          <Button onClick={this.handleReset}>Reload application</Button>
        </div>
      );
    }
    return this.props.children;
  }
}
