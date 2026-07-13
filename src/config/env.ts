/**
 * Typed, centralized access to environment configuration. Import from here
 * rather than reading `import.meta.env` throughout the codebase.
 */
export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? '/api',
  appName: import.meta.env.VITE_APP_NAME ?? 'KBV Education',
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
} as const;
