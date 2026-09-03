import type { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster, type DefaultToastOptions } from 'react-hot-toast';
import { queryClient } from '@/lib/queryClient';
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary';
import { ThemeProvider } from '@/features/settings/components/ThemeProvider';
import { UiVariantSwitcher } from '@/components/modern/UiVariantSwitcher';
import { useSelectedUI } from '@/theme/uiSelector';
import { env } from '@/config/env';

const DEFAULT_TOAST_OPTIONS: DefaultToastOptions = {
  duration: 4000,
  style: { fontSize: '0.875rem' },
};

/** Dark/gold palette matching the rest of Modern UI (Card, Modal, Badge tones). */
const MODERN_TOAST_OPTIONS: DefaultToastOptions = {
  duration: 4000,
  style: {
    fontSize: '0.875rem',
    fontFamily: '"General Sans", system-ui, sans-serif',
    background: '#0C1526',
    color: '#EEF2F9',
    border: '1px solid rgba(238,242,249,.12)',
    borderRadius: '0.75rem',
    boxShadow: '0 8px 24px rgba(0,0,0,.4)',
  },
  success: { iconTheme: { primary: '#8fd6ae', secondary: '#0C1526' } },
  error: { iconTheme: { primary: '#e08a8a', secondary: '#0C1526' } },
};

/** Wires global providers: error boundary, React Query, theming, toast notifications. */
export function AppProviders({ children }: { children: ReactNode }) {
  const ui = useSelectedUI();

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>{children}</ThemeProvider>
        <Toaster
          position="top-right"
          toastOptions={ui === 'modern' ? MODERN_TOAST_OPTIONS : DEFAULT_TOAST_OPTIONS}
        />
        {/* buttonPosition explicitly set: its default collides with the Modern UI's
            bottom-right theme-orb control (found blocking real clicks there — same class of
            bug as UiVariantSwitcher below, which had the same collision with a Save button). */}
        {env.isDev && <ReactQueryDevtools initialIsOpen={false} buttonPosition="top-left" />}
        <UiVariantSwitcher />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
