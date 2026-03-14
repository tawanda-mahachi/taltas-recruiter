import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { agentsApi } from '@/lib/api/agents';
import type { AgentType, AgentStatus, CreateAgentPayload } from '@/types/api';

export function useAgents(params?: { type?: AgentType; status?: AgentStatus }) {
  return useQuery({
    queryKey: ['agents', params],
    queryFn: () => agentsApi.list(params),
    staleTime: 30_000,
  });
}

export function useFleetSummary() {
  return useQuery({
    queryKey: ['agents', 'fleet-summary'],
    queryFn: agentsApi.fleetSummary,
    staleTime: 30_000,
  });
}

export function useAgent(id: string) {
  return useQuery({
    queryKey: ['agents', id],
    queryFn: () => agentsApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateAgent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAgentPayload) => agentsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['agents'] });
    },
  });
}

export function useUpdateAgent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateAgentPayload> }) =>
      agentsApi.update(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['agents'] });
      qc.invalidateQueries({ queryKey: ['agents', id] });
    },
  });
}

export function useAgentLifecycle() {
  const qc = useQueryClient();
  return {
    pause: useMutation({
      mutationFn: agentsApi.pause,
      onSuccess: () => qc.invalidateQueries({ queryKey: ['agents'] }),
    }),
    resume: useMutation({
      mutationFn: agentsApi.resume,
      onSuccess: () => qc.invalidateQueries({ queryKey: ['agents'] }),
    }),
    retire: useMutation({
      mutationFn: agentsApi.retire,
      onSuccess: () => qc.invalidateQueries({ queryKey: ['agents'] }),
    }),
  };
}
