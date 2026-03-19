'use client';
/**
 * Taltas Unified Data Provider — API-first with mock fallback.
 *
 * WIRING RULES:
 * 1. Every hook calls the live API first.
 * 2. Mocks are ONLY used when the API is unreachable (network error, no response).
 * 3. If the API returns an empty array/object, that IS the data (new account).
 * 4. `fromApi: true` means the server responded (even if data is empty).
 * 5. `fromApi: false` means we fell back to mocks.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { agentsApi } from '@/lib/api/agents';
import { billingApi } from '@/lib/api/billing';
import { sessionsApi } from '@/lib/api/sessions';
import { authApi } from '@/lib/api/auth';
import api from '@/lib/api/client';
import {
  MOCK_CANDIDATES, MOCK_ROLES, MOCK_INTEGRATIONS, MOCK_EXPLORERS,
  PIPELINE_STAGES, PIPELINE_FUNNEL, BOTTLENECKS,
  type MockCandidate, type MockRole, type MockIntegration, type MockExplorer
} from '@/lib/mock-data';
import type {
  Agent, FleetSummary, SnapSession, CreditSummary, CreditPack,
  BillingPeriod, Principal, PaginatedResponse, AgentType, AgentStatus, CreateAgentPayload,
  SnapStatus, MatchResult
} from '@/types/api';
import { useState, useRef, useEffect, useCallback } from 'react';

// ── Wrapper return type ──
export type DataResult<T> = { data: T; fromApi: boolean };

// ═══════════════════════════════════════════════
// API HEALTH CHECK
// ═══════════════════════════════════════════════

export interface ApiEndpointStatus {
  key: string;
  label: string;
  endpoint: string;
  status: 'connected' | 'offline' | 'checking';
  latencyMs?: number;
}

export interface ApiHealth {
  endpoints: ApiEndpointStatus[];
  overall: 'connected' | 'partial' | 'offline' | 'checking';
}

export function useApiHealth(): ApiHealth {
  const [health, setHealth] = useState<ApiHealth>({
    endpoints: [
      { key: 'auth', label: 'Auth / Profile', endpoint: 'GET /auth/me', status: 'checking' },
      { key: 'agents', label: 'Agents / Fleet', endpoint: 'GET /agents/fleet-summary', status: 'checking' },
      { key: 'sessions', label: 'SNAP Sessions', endpoint: 'GET /snap-sessions', status: 'checking' },
      { key: 'billing', label: 'Billing / Credits', endpoint: 'GET /principals/me/credits', status: 'checking' },
      { key: 'dashboard', label: 'Dashboard', endpoint: 'GET /dashboard/summary', status: 'checking' },
      { key: 'candidates', label: 'Candidates', endpoint: 'GET /candidates', status: 'checking' },
    ],
    overall: 'checking',
  });
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    const checks = [
      { key: 'auth', fn: () => authApi.getMe() },
      { key: 'agents', fn: () => agentsApi.fleetSummary() },
      { key: 'sessions', fn: () => sessionsApi.list({ limit: 1 } as any) },
      { key: 'billing', fn: () => billingApi.getCredits() },
      { key: 'dashboard', fn: () => api.get('/dashboard/summary') },
      { key: 'candidates', fn: () => api.get('/candidates') },
    ];

    Promise.allSettled(
      checks.map(async (c) => {
        const t0 = Date.now();
        try { await c.fn(); return { key: c.key, ok: true, ms: Date.now() - t0 }; }
        catch { return { key: c.key, ok: false, ms: Date.now() - t0 }; }
      })
    ).then(results => {
      const eps = health.endpoints.map((ep) => {
        const r = results.find((_, i) => checks[i].key === ep.key);
        const val = r?.status === 'fulfilled' ? r.value : { ok: false, ms: 0 };
        return { ...ep, status: (val as any).ok ? 'connected' as const : 'offline' as const, latencyMs: (val as any).ms };
      });
      const connected = eps.filter(e => e.status === 'connected').length;
      const overall = connected === eps.length ? 'connected' : connected > 0 ? 'partial' : 'offline';
      setHealth({ endpoints: eps, overall: overall as any });
    });
  }, []);

  return health;
}

// ═══════════════════════════════════════════════
// PROFILE / PRINCIPAL
// ═══════════════════════════════════════════════

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async (): Promise<DataResult<Principal | null>> => {
      try {
        const data = await authApi.getMe();
        return { data, fromApi: true };
      } catch {
        return { data: null, fromApi: false };
      }
    },
    staleTime: 60_000,
  });
}

// ═══════════════════════════════════════════════
// DASHBOARD SUMMARY (aggregated KPIs)
// ═══════════════════════════════════════════════

export interface DashboardSummary {
  totalCandidates: number;
  activeSessions: number;
  completedSessions: number;
  matches: number;
  matchRate: number;
  newThisWeek: number;
  agents: { total: number; active: number; error: number };
  roles: { total: number; open: number };
  conversations: number;
  credits: number;
  plan: string;
  unreadNotifications: number;
  recentActivity: Array<{
    type: string;
    candidateName: string;
    agentName: string;
    matchResult: string;
    completedAt: string;
  }>;
}

const MOCK_DASHBOARD: DashboardSummary = {
  totalCandidates: 156,
  activeSessions: 23,
  completedSessions: 89,
  matches: 14,
  matchRate: 16,
  newThisWeek: 12,
  agents: { total: 4, active: 3, error: 0 },
  roles: { total: 6, open: 5 },
  conversations: 67,
  credits: 8420,
  plan: 'pro',
  unreadNotifications: 4,
  recentActivity: [],
};

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async (): Promise<DataResult<DashboardSummary>> => {
      try {
        const { data } = await api.get('/dashboard/summary');
        return { data, fromApi: true };
      } catch {
        return { data: MOCK_DASHBOARD, fromApi: false };
      }
    },
    staleTime: 30_000,
  });
}

// ═══════════════════════════════════════════════
// FLEET SUMMARY
// ═══════════════════════════════════════════════

const MOCK_FLEET: FleetSummary = {
  byType: { explorer: 4, application: 0, monitor: 0, market: 0, network: 0 },
  byStatus: { active: 3, idle: 1, paused: 0, archived: 0, error: 0 },
  total: 4,
};

export function useFleet() {
  return useQuery({
    queryKey: ['fleet'],
    queryFn: async (): Promise<DataResult<FleetSummary>> => {
      try {
        const data = await agentsApi.fleetSummary();
        return { data, fromApi: true };
      } catch {
        return { data: MOCK_FLEET, fromApi: false };
      }
    },
    staleTime: 30_000,
  });
}

// ═══════════════════════════════════════════════
// EXPLORERS (Agent type=explorer)
// ═══════════════════════════════════════════════

function agentToExplorer(a: Agent): MockExplorer {
  return {
    id: a.id, name: a.name,
    mode: (a.context?.mode || 'AUTO') as MockExplorer['mode'],
    role: a.context?.role || '', ats: a.context?.ats || 'Taltas',
    icon: a.context?.icon || 'bot', iconBg: a.context?.iconBg || 'var(--green-bg)',
    conversations: a.context?.conversations || 0,
    a2aSessions: a.context?.a2aSessions || 0,
    interviewsSet: a.context?.interviewsSet || 0,
    blobVariant: a.blobVariant || 0,
    interactions: a.context?.interactions || [],
  };
}

export function useExplorers() {
  return useQuery({
    queryKey: ['explorers'],
    queryFn: async (): Promise<DataResult<MockExplorer[]>> => {
      try {
        const res = await agentsApi.list({ type: 'explorer' });
        const apiData = (res.data || []).map(agentToExplorer);
        return { data: apiData, fromApi: true };
      } catch {
        return { data: MOCK_EXPLORERS, fromApi: false };
      }
    },
    staleTime: 15_000,
  });
}

export function useCreateExplorer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAgentPayload) => agentsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['explorers'] });
      qc.invalidateQueries({ queryKey: ['fleet'] });
      qc.invalidateQueries({ queryKey: ['agents'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateExplorer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateAgentPayload> }) =>
      agentsApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['explorers'] });
      qc.invalidateQueries({ queryKey: ['agents'] });
    },
  });
}

// ═══════════════════════════════════════════════
// AGENTS (full list for fleet views)
// ═══════════════════════════════════════════════

export function useAgentsList(params?: { type?: AgentType; status?: AgentStatus }) {
  return useQuery({
    queryKey: ['agents', params],
    queryFn: async (): Promise<DataResult<Agent[]>> => {
      try {
        const res = await agentsApi.list(params);
        return { data: res.data || [], fromApi: true };
      } catch {
        return { data: [], fromApi: false };
      }
    },
    staleTime: 30_000,
  });
}

// ═══════════════════════════════════════════════
// SNAP SESSIONS
// ═══════════════════════════════════════════════

const MOCK_SESSIONS: SnapSession[] = [
  { id: 's1', explorerAgentId: 'jbot0', careerAgentId: 'ca1', explorerPrincipalId: 'p1', careerPrincipalId: 'p2', status: 'complete', stepCount: 12, matchResult: 'match', explorerScore: 92, careerScore: 88, context: { candidateName: 'Sara Kim', role: 'Staff ML Engineer' }, createdAt: new Date(Date.now() - 3600000).toISOString(), updatedAt: new Date(Date.now() - 1800000).toISOString(), completedAt: new Date(Date.now() - 1800000).toISOString() },
  { id: 's2', explorerAgentId: 'jbot1', careerAgentId: 'ca2', explorerPrincipalId: 'p1', careerPrincipalId: 'p3', status: 'convergence', stepCount: 8, matchResult: 'pending', explorerScore: 85, careerScore: null, context: { candidateName: 'Marcus Peterson', role: 'Principal Engineer' }, createdAt: new Date(Date.now() - 7200000).toISOString(), updatedAt: new Date(Date.now() - 3600000).toISOString(), completedAt: null },
  { id: 's3', explorerAgentId: 'jbot0', careerAgentId: 'ca3', explorerPrincipalId: 'p1', careerPrincipalId: 'p4', status: 'probing', stepCount: 4, matchResult: 'pending', explorerScore: null, careerScore: null, context: { candidateName: 'Aiko Jansson', role: 'Staff ML Engineer' }, createdAt: new Date(Date.now() - 14400000).toISOString(), updatedAt: new Date(Date.now() - 7200000).toISOString(), completedAt: null },
];

export function useSnapSessions(params?: { status?: SnapStatus }) {
  return useQuery({
    queryKey: ['sessions', params],
    queryFn: async (): Promise<DataResult<SnapSession[]>> => {
      try {
        const res = await sessionsApi.list(params as any);
        return { data: res.data || [], fromApi: true };
      } catch {
        return { data: MOCK_SESSIONS, fromApi: false };
      }
    },
    staleTime: 15_000,
  });
}

// ═══════════════════════════════════════════════
// BILLING & CREDITS
// ═══════════════════════════════════════════════

const MOCK_CREDITS: CreditSummary = { creditBalance: 8420, activePacks: 2, totalUsedThisPeriod: 340 };

export function useCreditSummary() {
  return useQuery({
    queryKey: ['credits'],
    queryFn: async (): Promise<DataResult<CreditSummary>> => {
      try {
        const data = await billingApi.getCredits();
        return { data, fromApi: true };
      } catch {
        return { data: MOCK_CREDITS, fromApi: false };
      }
    },
    staleTime: 30_000,
  });
}

const MOCK_PACKS: CreditPack[] = [
  { id: 'pk1', principalId: 'p1', initialCredits: 5000, remainingCredits: 3200, status: 'active', expiresAt: new Date(Date.now() + 86400000 * 30).toISOString(), createdAt: new Date(Date.now() - 86400000 * 15).toISOString() },
  { id: 'pk2', principalId: 'p1', initialCredits: 10000, remainingCredits: 5220, status: 'active', expiresAt: new Date(Date.now() + 86400000 * 60).toISOString(), createdAt: new Date(Date.now() - 86400000 * 5).toISOString() },
];

export function useCreditPacks() {
  return useQuery({
    queryKey: ['credit-packs'],
    queryFn: async (): Promise<DataResult<CreditPack[]>> => {
      try {
        const res = await billingApi.getCreditPacks();
        return { data: res.data || [], fromApi: true };
      } catch {
        return { data: MOCK_PACKS, fromApi: false };
      }
    },
    staleTime: 60_000,
  });
}

const MOCK_PERIODS: BillingPeriod[] = [
  { id: 'bp1', principalId: 'p1', startDate: new Date(Date.now() - 86400000 * 30).toISOString(), endDate: new Date().toISOString(), status: 'open', totalCharge: '340.00', createdAt: new Date(Date.now() - 86400000 * 30).toISOString() },
  { id: 'bp2', principalId: 'p1', startDate: new Date(Date.now() - 86400000 * 60).toISOString(), endDate: new Date(Date.now() - 86400000 * 30).toISOString(), status: 'paid', totalCharge: '1240.00', createdAt: new Date(Date.now() - 86400000 * 60).toISOString() },
];

export function useBillingPeriods() {
  return useQuery({
    queryKey: ['billing-periods'],
    queryFn: async (): Promise<DataResult<BillingPeriod[]>> => {
      try {
        const res = await billingApi.getBillingPeriods();
        return { data: res.data || [], fromApi: true };
      } catch {
        return { data: MOCK_PERIODS, fromApi: false };
      }
    },
    staleTime: 60_000,
  });
}

export function usePurchaseCredits() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (packSize: number) => billingApi.purchaseCredits(packSize),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['credits'] });
      qc.invalidateQueries({ queryKey: ['credit-packs'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

// ═══════════════════════════════════════════════
// CANDIDATES — GET /candidates
// ═══════════════════════════════════════════════

export function useCandidates(filters?: { stage?: string; fitLabel?: string; search?: string }) {
  return useQuery({
    queryKey: ['candidates', filters],
    queryFn: async (): Promise<DataResult<MockCandidate[]>> => {
      try {
        const { data: res } = await api.get('/candidates', { params: filters });
        // Backend returns { data: [...], nextCursor, hasMore }
        const candidates = res?.data || res || [];
        return { data: Array.isArray(candidates) ? candidates : [], fromApi: true };
      } catch {
        let result = [...MOCK_CANDIDATES];
        if (filters?.stage) result = result.filter(c => c.stage === filters.stage);
        if (filters?.fitLabel) result = result.filter(c => c.fitLabel === filters.fitLabel);
        if (filters?.search) {
          const q = filters.search.toLowerCase();
          result = result.filter(c => c.name.toLowerCase().includes(q) || c.title.toLowerCase().includes(q) || c.company.toLowerCase().includes(q));
        }
        return { data: result, fromApi: false };
      }
    },
    staleTime: 30_000,
  });
}

export function useCandidateDetail(id: string | null) {
  return useQuery({
    queryKey: ['candidate-detail', id],
    queryFn: async () => {
      if (!id) return null;
      const { data } = await api.get(`/candidates/${id}`);
      return data;
    },
    enabled: !!id,
    staleTime: 30_000,
  });
}

// ═══════════════════════════════════════════════
// ROLES / JOBS — GET /roles
// ═══════════════════════════════════════════════

export function useRoles() {
  return useQuery({
    queryKey: ['roles'],
    queryFn: async (): Promise<DataResult<MockRole[]>> => {
      try {
        const { data: res } = await api.get('/roles');
        const roles = res?.data || res || [];
        return { data: Array.isArray(roles) ? roles : [], fromApi: true };
      } catch {
        return { data: MOCK_ROLES, fromApi: false };
      }
    },
    staleTime: 60_000,
  });
}

export function useCreateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      title: string; department?: string; location?: string;
      description?: string; requirements?: any; salaryMin?: number;
      salaryMax?: number; urgency?: string;
    }) => {
      const { data: res } = await api.post('/roles', data);
      return res;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['roles'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { data: res } = await api.patch(`/roles/${id}`, data);
      return res;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['roles'] });
    },
  });
}

// ═══════════════════════════════════════════════
// INTEGRATIONS — GET /integrations
// ═══════════════════════════════════════════════

export function useIntegrations() {
  return useQuery({
    queryKey: ['integrations'],
    queryFn: async (): Promise<DataResult<MockIntegration[]>> => {
      try {
        const { data } = await api.get('/integrations');
        const integrations = Array.isArray(data) ? data : [];
        return { data: integrations, fromApi: true };
      } catch {
        return { data: MOCK_INTEGRATIONS, fromApi: false };
      }
    },
    staleTime: 60_000,
  });
}

export function useConnectIntegration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { provider: string; displayName: string; config?: any }) => {
      const { data: res } = await api.post('/integrations/connect', data);
      return res;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['integrations'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDisconnectIntegration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data: res } = await api.delete(`/integrations/${id}`);
      return res;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['integrations'] });
    },
  });
}

export function useTestIntegration() {
  return useMutation({
    mutationFn: async (id: string) => {
      const { data: res } = await api.post(`/integrations/${id}/test`);
      return res;
    },
  });
}

// ═══════════════════════════════════════════════
// PIPELINE — GET /pipeline/stats
// ═══════════════════════════════════════════════

const MOCK_SOURCE_DATA = [
  { source: 'Taltas Network', applied: 89, screened: 71, interviewed: 28, offered: 9, convRate: '10.1%', color: 'var(--blue)' },
  { source: 'LinkedIn Jobs', applied: 67, screened: 41, interviewed: 15, offered: 4, convRate: '6.0%', color: 'var(--purple)' },
  { source: 'Indeed', applied: 54, screened: 29, interviewed: 8, offered: 2, convRate: '3.7%', color: 'var(--green)' },
  { source: 'Referral', applied: 28, screened: 24, interviewed: 16, offered: 5, convRate: '17.9%', color: 'var(--gold)' },
  { source: 'Wellfound', applied: 19, screened: 12, interviewed: 4, offered: 1, convRate: '5.3%', color: 'var(--orange)' },
];

const MOCK_WEEKLY_TREND = [
  { week: 'W1', applied: 42, screened: 31, offered: 2 },
  { week: 'W2', applied: 56, screened: 44, offered: 3 },
  { week: 'W3', applied: 51, screened: 38, offered: 4 },
  { week: 'W4', applied: 63, screened: 49, offered: 3 },
];

const MOCK_ROLE_VELOCITY = [
  { role: 'Staff ML Engineer', avgDays: 16, target: 18, status: 'on-track', candidates: 47 },
  { role: 'Principal Eng.', avgDays: 22, target: 18, status: 'slow', candidates: 31 },
  { role: 'DevRel Engineer', avgDays: 14, target: 18, status: 'fast', candidates: 19 },
  { role: 'Staff AI Systems', avgDays: 19, target: 18, status: 'slow', candidates: 28 },
  { role: 'Senior Data Eng.', avgDays: 11, target: 18, status: 'fast', candidates: 14 },
];

export type PipelineData = {
  stages: typeof PIPELINE_STAGES;
  funnel: typeof PIPELINE_FUNNEL;
  bottlenecks: typeof BOTTLENECKS;
  sourceData: typeof MOCK_SOURCE_DATA;
  weeklyTrend: typeof MOCK_WEEKLY_TREND;
  roleVelocity: typeof MOCK_ROLE_VELOCITY;
};

const MOCK_PIPELINE: PipelineData = {
  stages: PIPELINE_STAGES, funnel: PIPELINE_FUNNEL, bottlenecks: BOTTLENECKS,
  sourceData: MOCK_SOURCE_DATA, weeklyTrend: MOCK_WEEKLY_TREND, roleVelocity: MOCK_ROLE_VELOCITY,
};

export function usePipeline() {
  return useQuery({
    queryKey: ['pipeline'],
    queryFn: async (): Promise<DataResult<PipelineData>> => {
      try {
        const { data } = await api.get('/pipeline/stats');
        return { data: data as PipelineData, fromApi: true };
      } catch {
        return { data: MOCK_PIPELINE, fromApi: false };
      }
    },
    staleTime: 30_000,
  });
}

// ═══════════════════════════════════════════════
// NOTIFICATIONS — GET /notifications
// ═══════════════════════════════════════════════

export interface TaltasNotification {
  id: string; type: 'agent' | 'pipeline' | 'system' | 'team';
  title: string; body: string; read: boolean; time: string; action?: string;
  createdAt?: string; readAt?: string | null; metadata?: any;
}

const MOCK_NOTIFICATIONS: TaltasNotification[] = [
  { id: 'n1', type: 'pipeline', title: 'New Deep Match', body: 'Sara Kim scored 96% fit for Staff ML Engineer role.', read: false, time: '2h ago' },
  { id: 'n2', type: 'agent', title: 'Explorer Completed Session', body: 'StaffML-Agent finished A2A session with Marcus Peterson.', read: false, time: '4h ago' },
  { id: 'n3', type: 'system', title: 'Credits Running Low', body: 'Your credit balance is below 1,000. Consider purchasing more.', read: true, time: '1d ago' },
  { id: 'n4', type: 'team', title: 'New Team Member', body: 'Julia Chen accepted your workspace invitation.', read: true, time: '2d ago' },
];

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async (): Promise<DataResult<TaltasNotification[]>> => {
      try {
        const { data } = await api.get('/notifications');
        const notifications = Array.isArray(data) ? data : [];
        return { data: notifications, fromApi: true };
      } catch {
        return { data: MOCK_NOTIFICATIONS, fromApi: false };
      }
    },
    staleTime: 15_000,
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.patch(`/notifications/${id}/read`);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/notifications/read-all');
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: ['unread-count'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/notifications/unread-count');
        return data?.unread || 0;
      } catch {
        return 0;
      }
    },
    staleTime: 15_000,
    refetchInterval: 30_000,
  });
}

// ═══════════════════════════════════════════════
// MESSAGES — GET /messages
// ═══════════════════════════════════════════════

export interface MessageThread {
  id: string;
  type: 'conversation' | 'snap';
  candidateName: string;
  candidateAvatar: string;
  agentName: string;
  status: string;
  messageCount: number;
  lastMessage: string;
  preview?: string;
  score?: number;
  sentiment?: number | null;
  matchResult?: string;
  explorerScore?: any;
}

export function useMessages() {
  return useQuery({
    queryKey: ['messages'],
    queryFn: async (): Promise<DataResult<MessageThread[]>> => {
      try {
        const { data } = await api.get('/messages');
        const threads = Array.isArray(data) ? data : [];
        return { data: threads, fromApi: true };
      } catch {
        return { data: [], fromApi: false };
      }
    },
    staleTime: 15_000,
  });
}

export interface SessionMessage {
  id: string;
  role: string;
  content: string;
  snapStep: string;
  createdAt: string;
}

export function useSessionMessages(sessionId: string | null) {
  return useQuery({
    queryKey: ['session-messages', sessionId],
    queryFn: async (): Promise<SessionMessage[]> => {
      if (!sessionId) return [];
      const { data } = await api.get(`/messages/${sessionId}`);
      return Array.isArray(data) ? data : [];
    },
    enabled: !!sessionId,
    staleTime: 10_000,
  });
}
