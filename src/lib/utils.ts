import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge conditional class names, resolving Tailwind conflicts. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Drop undefined/null/empty-string entries so they aren't sent as query params. */
export function buildParams(query: object): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(query).filter(([, v]) => v !== undefined && v !== null && v !== ''),
  );
}

/** Extract a human-readable message from an unknown/Axios error. */
export function getErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (typeof error === 'object' && error !== null) {
    const maybe = error as {
      response?: { data?: { message?: string } };
      message?: string;
    };
    return maybe.response?.data?.message ?? maybe.message ?? fallback;
  }
  return fallback;
}
