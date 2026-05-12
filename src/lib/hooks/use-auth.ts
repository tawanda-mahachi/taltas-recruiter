import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/lib/stores/auth-store';
import { isMfaChallenge } from '@/types/api';
import type { LoginPayload, LoginResponse, RegisterPayload } from '@/types/api';

export function useMe() {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: ['me'],
    queryFn: authApi.getMe,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

export function useLogin() {
  const { setTokens, setUser, setLoading } = useAuthStore();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: LoginPayload): Promise<LoginResponse> => {
      setLoading(true);
      try {
        const result = await authApi.login(payload);
        if (!isMfaChallenge(result)) {
          // Non-MFA path: persist tokens + principal immediately
          setTokens(result.accessToken, result.refreshToken);
          const me = await authApi.getMe();
          setUser(me);
          qc.setQueryData(['me'], me);
        }
        return result;
      } finally {
        setLoading(false);
      }
    },
  });
}

export function useFinalizeAuth() {
  const { setTokens, setUser } = useAuthStore();
  const qc = useQueryClient();

  return async (accessToken: string, refreshToken: string) => {
    setTokens(accessToken, refreshToken);
    const me = await authApi.getMe();
    setUser(me);
    qc.setQueryData(['me'], me);
  };
}

export function useRegister() {
  const loginMutation = useLogin();

  return useMutation({
    mutationFn: async (payload: RegisterPayload) => {
      await authApi.register(payload);
      await loginMutation.mutateAsync({ email: payload.email, password: payload.password });
    },
  });
}

export function useLogout() {
  const { refreshToken, logout } = useAuthStore();
  const router = useRouter();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      try { await authApi.logout(refreshToken ?? undefined); } catch { /* ignore */ }
    },
    onSettled: () => {
      logout();
      qc.clear();
      router.push('/');
    },
  });
}
