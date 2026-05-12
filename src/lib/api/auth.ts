import api from './client';
import type { AuthTokens, LoginPayload, LoginResponse, RegisterPayload, Principal, MfaSetupData, MfaEnableResponse, MfaVerifyResponse, MfaSmsResponse } from '@/types/api';

export const authApi = {
  login: (data: LoginPayload) =>
    api.post<LoginResponse>('/auth/login', data).then((r) => r.data),

  register: (data: RegisterPayload) =>
    api.post('/auth/register', data).then((r) => r.data),

  refresh: (refreshToken: string) =>
    api.post<AuthTokens>('/auth/refresh', { refreshToken }).then((r) => r.data),

  logout: (refreshToken?: string) =>
    api.post('/auth/logout', { refreshToken }).then((r) => r.data),

  getMe: () =>
    api.get<Principal>('/principals/me').then((r) => r.data),

  // MFA: forced-setup flow (recruiter/admin first-time enrollment)
  mfaSetupPending: (mfaToken: string) =>
    api.post<MfaSetupData>('/auth/mfa/setup-pending', { mfaToken }).then((r) => r.data),

  mfaEnablePending: (mfaToken: string, code: string) =>
    api.post<MfaEnableResponse>('/auth/mfa/enable-pending', { mfaToken, code }).then((r) => r.data),

  // MFA: returning-user challenge flow
  mfaVerify: (mfaToken: string, code: string) =>
    api.post<MfaVerifyResponse>('/auth/mfa/verify', { mfaToken, code }).then((r) => r.data),

  // MFA: trigger SMS OTP (re-issues mfaToken)
  mfaSendSms: (mfaToken: string) =>
    api.post<MfaSmsResponse>('/auth/mfa/sms/send', { mfaToken }).then((r) => r.data),
};
