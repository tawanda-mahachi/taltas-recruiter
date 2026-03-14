import api from './client';
import type { AuthTokens, LoginPayload, RegisterPayload, Principal } from '@/types/api';

export const authApi = {
  login: (data: LoginPayload) =>
    api.post<AuthTokens>('/auth/login', data).then((r) => r.data),

  register: (data: RegisterPayload) =>
    api.post('/auth/register', data).then((r) => r.data),

  refresh: (refreshToken: string) =>
    api.post<AuthTokens>('/auth/refresh', { refreshToken }).then((r) => r.data),

  logout: (refreshToken?: string) =>
    api.post('/auth/logout', { refreshToken }).then((r) => r.data),

  getMe: () =>
    api.get<Principal>('/principals/me').then((r) => r.data),
};
