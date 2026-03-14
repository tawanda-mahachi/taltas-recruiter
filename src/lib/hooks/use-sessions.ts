import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { sessionsApi } from '@/lib/api/sessions';
import type { SnapStatus, InitiateSnapPayload, MatchResult } from '@/types/api';

export function useSessions(params?: { status?: SnapStatus }) {
  return useQuery({
    queryKey: ['sessions', params],
    queryFn: () => sessionsApi.list(params),
    staleTime: 15_000,
  });
}

export function useSession(id: string) {
  return useQuery({
    queryKey: ['sessions', id],
    queryFn: () => sessionsApi.getById(id),
    enabled: !!id,
    refetchInterval: 10_000,
  });
}

export function useInitiateSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: InitiateSnapPayload) => sessionsApi.initiate(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sessions'] }),
  });
}

export function useAdvanceSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => sessionsApi.advance(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ['sessions'] });
      qc.invalidateQueries({ queryKey: ['sessions', id] });
    },
  });
}

export function useCompleteSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, matchResult, explorerScore, careerScore }: { id: string; matchResult: MatchResult; explorerScore?: number; careerScore?: number }) =>
      sessionsApi.complete(id, matchResult, explorerScore, careerScore),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['sessions'] });
      qc.invalidateQueries({ queryKey: ['sessions', id] });
    },
  });
}
