import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORAGE_KEYS } from '@/config/constants';
import type { AuthUser } from '@/features/auth/types/auth.types';

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;

  setAuth: (payload: { user: AuthUser; accessToken: string; refreshToken: string }) => void;
  setTokens: (tokens: { accessToken: string; refreshToken: string }) => void;
  setUser: (user: AuthUser) => void;
  logout: () => void;
}

/**
 * Global auth store. Persisted to localStorage so a page refresh keeps the
 * session. Deliberately has no dependency on the API layer to avoid import
 * cycles with the Axios client (which reads tokens via `getState()`).
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      setAuth: ({ user, accessToken, refreshToken }) =>
        set({ user, accessToken, refreshToken, isAuthenticated: true }),

      setTokens: ({ accessToken, refreshToken }) => set({ accessToken, refreshToken }),

      setUser: (user) => set({ user }),

      logout: () =>
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false }),
    }),
    {
      name: STORAGE_KEYS.AUTH,
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
