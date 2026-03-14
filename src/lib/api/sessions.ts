import api from './client';
import type { SnapSession, InitiateSnapPayload, MatchResult, PaginatedResponse, SnapStatus } from '@/types/api';

export const sessionsApi = {
  list: (params?: { status?: SnapStatus; cursor?: string; limit?: number }) =>
    api.get<PaginatedResponse<SnapSession>>('/snap-sessions', { params }).then((r) => r.data),

  getById: (id: string) =>
    api.get<SnapSession>(`/snap-sessions/${id}`).then((r) => r.data),

  initiate: (data: InitiateSnapPayload) =>
    api.post<SnapSession>('/snap-sessions/initiate', data).then((r) => r.data),

  advance: (id: string) =>
    api.post<SnapSession>(`/snap-sessions/${id}/advance`).then((r) => r.data),

  complete: (id: string, matchResult: MatchResult, explorerScore?: number, careerScore?: number) =>
    api.post<SnapSession>(`/snap-sessions/${id}/complete`, { matchResult, explorerScore, careerScore }).then((r) => r.data),
};
