import { create } from 'zustand';
import type { Principal } from '@/types/api';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: Principal | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  _hasHydrated: boolean;
  setHasHydrated: (val: boolean) => void;
  setTokens: (access: string, refresh: string) => void;
  setUser: (user: Principal) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  user: null,
  isAuthenticated: false,
  isLoading: false,
      _hasHydrated: false,
      setHasHydrated: (val) => set({ _hasHydrated: val }),
  setTokens: (accessToken, refreshToken) =>
    set({ accessToken, refreshToken, isAuthenticated: true }),
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: () =>
    set({ accessToken: null, refreshToken: null, user: null, isAuthenticated: false }),
}));
