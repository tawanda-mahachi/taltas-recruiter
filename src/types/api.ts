// ── Enums (mirrors Prisma schema) ──
export type PrincipalType = 'candidate' | 'recruiter' | 'admin';
export type BillingPlan = 'free' | 'pro' | 'elite' | 'starter' | 'team' | 'enterprise';
export type ComputeMode = 'managed' | 'byok' | 'passthrough';
export type AgentType = 'application' | 'monitor' | 'market' | 'network' | 'explorer';
export type AgentStatus = 'active' | 'idle' | 'paused' | 'archived' | 'error';
export type SnapStatus = 'discovery' | 'probing' | 'constraints' | 'convergence' | 'human_gate' | 'complete';
export type MatchResult = 'match' | 'near_miss' | 'no_match' | 'pending';
export type RecruiterRole = 'hiring_manager' | 'senior_recruiter' | 'recruiter' | 'coordinator';
export type QueuePriority = 'high' | 'standard';
export type ModelTier = 'fast' | 'balanced' | 'deep';
export type CreditPackStatus = 'active' | 'exhausted' | 'expired';
export type BillingPeriodStatus = 'open' | 'paid' | 'overdue';

// ── Auth ──
export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  principalType: PrincipalType;
  recruiterRole?: RecruiterRole;
  companyName?: string;
  profile?: Record<string, any>;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// MFA response types (added for forced-setup + challenge flows)
export interface MfaChallengeResponse {
  mfaRequired: true;
  mfaSetupRequired?: boolean;
  mfaToken: string;
  hasPhone: boolean;
}

export type LoginResponse = AuthTokens | MfaChallengeResponse;

export interface MfaSetupData {
  secret: string;
  otpauthUrl: string;
  qrDataUrl: string;
}

export interface MfaEnableResponse extends AuthTokens {
  principalId: string;
  principalType: string;
  backupCodes: string[];
}

export interface MfaVerifyResponse extends AuthTokens {
  principalId: string;
  principalType: string;
}

export interface MfaSmsResponse {
  mfaToken: string;
  sent: boolean;
}

// Type guard: distinguish MFA challenge from successful login
export function isMfaChallenge(r: LoginResponse): r is MfaChallengeResponse {
  return (r as MfaChallengeResponse).mfaRequired === true;
}

// ── Principal ──
export interface Principal {
  id: string;
  userId: string;
  type: PrincipalType;
  companyId: string | null;
  recruiterRole: RecruiterRole | null;
  profile: Record<string, any>;
  constraints: Record<string, any>;
  goals: Record<string, any>;
  billingPlan: BillingPlan;
  computeMode: ComputeMode;
  creditBalance: number;
  currentSpend: string;
  themePreference: string;
  createdAt: string;
  updatedAt: string;
  user?: { email: string; lastLoginAt: string | null; loginCount: number };
}

export interface CreditSummary {
  creditBalance: number;
  activePacks: number;
  totalUsedThisPeriod: number;
}

// ── Agent ──
export interface Agent {
  id: string;
  principalId: string;
  type: AgentType;
  status: AgentStatus;
  name: string;
  description: string | null;
  queuePriority: QueuePriority;
  lastHeartbeat: string | null;
  scanFrequencySec: number;
  concurrentSessions: number;
  errorCount: number;
  lastError: string | null;
  lastErrorAt: string | null;
  blobVariant: number;
  context: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface FleetSummary {
  byType: Record<AgentType, number>;
  byStatus: Record<AgentStatus, number>;
  total: number;
}

export interface CreateAgentPayload {
  type: AgentType;
  name: string;
  description?: string;
  queuePriority?: QueuePriority;
  context?: Record<string, any>;
}

// ── SNAP Session ──
export interface SnapSession {
  id: string;
  explorerAgentId: string;
  careerAgentId: string;
  explorerPrincipalId: string;
  careerPrincipalId: string;
  status: SnapStatus;
  stepCount: number;
  matchResult: MatchResult;
  explorerScore: number | null;
  careerScore: number | null;
  context: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  messages?: SnapMessage[];
}

export interface SnapMessage {
  id: string;
  role: string;
  content: string;
  step: number;
  createdAt: string;
}

export interface InitiateSnapPayload {
  explorerAgentId: string;
  careerAgentId: string;
}

// ── Billing ──
export interface CreditPack {
  id: string;
  principalId: string;
  initialCredits: number;
  remainingCredits: number;
  status: CreditPackStatus;
  expiresAt: string | null;
  createdAt: string;
}

export interface BillingPeriod {
  id: string;
  principalId: string;
  startDate: string;
  endDate: string;
  status: BillingPeriodStatus;
  totalCharge: string;
  createdAt: string;
}

// ── Paginated Response ──
export interface PaginatedResponse<T> {
  data: T[];
  cursor: string | null;
  hasMore: boolean;
}
