import api from './client';
import type { Agent, CreateAgentPayload, FleetSummary, PaginatedResponse, AgentType, AgentStatus } from '@/types/api';

export const agentsApi = {
  list: (params?: { type?: AgentType; status?: AgentStatus; cursor?: string; limit?: number }) =>
    api.get<PaginatedResponse<Agent>>('/agents', { params }).then((r) => r.data),

  fleetSummary: () =>
    api.get<FleetSummary>('/agents/fleet-summary').then((r) => r.data),

  getById: (id: string) =>
    api.get<Agent>(`/agents/${id}`).then((r) => r.data),

  create: (data: CreateAgentPayload) =>
    api.post<Agent>('/agents', data).then((r) => r.data),

  update: (id: string, data: Partial<CreateAgentPayload>) =>
    api.patch<Agent>(`/agents/${id}`, data).then((r) => r.data),

  pause: (id: string) =>
    api.post<Agent>(`/agents/${id}/pause`).then((r) => r.data),

  resume: (id: string) =>
    api.post<Agent>(`/agents/${id}/resume`).then((r) => r.data),

  retire: (id: string) =>
    api.post<Agent>(`/agents/${id}/retire`).then((r) => r.data),
};
