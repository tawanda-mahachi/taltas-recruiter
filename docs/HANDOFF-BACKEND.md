# Taltas Backend Connection Handoff — February 25, 2026

## Resume Instructions

Upload `taltas-recruiter.tar.gz` and say:

**"This is the Taltas recruiter portal. Extract the tar.gz and read this handoff doc at `docs/HANDOFF-BACKEND.md`. We're connecting the live backend — start with auth."**

---

## Current State

- **Recruiter Portal UI**: Complete (762-line info pages, 12 dashboard pages, auth, modals, footer)
- **All mock data**: Embedded per-page — needs replacing with API hooks
- **API layer**: Scaffolded but not connected (Axios client, React Query hooks, Zustand store)
- **Dev server**: localhost:3001
- **Test credentials**: test@taltas.ai / TestPass123!

## Backend API

- **Base URL**: `https://api.taltas.ai/api/v1`
- **Auth**: JWT access + refresh tokens
- **Key endpoints**:
  - POST `/auth/login` → `{ accessToken, refreshToken }`
  - POST `/auth/register`
  - POST `/auth/refresh`
  - GET `/principals/me`
  - GET/POST/PUT/DELETE `/agents`
  - GET `/sessions`
  - GET `/billing/current`

## Files to Review Before Starting

### API Layer (already scaffolded)
1. `src/lib/api/client.ts` — Axios instance + JWT refresh interceptor
2. `src/lib/api/auth.ts` — Login/register/refresh endpoints
3. `src/lib/api/agents.ts` — Agent CRUD
4. `src/lib/api/sessions.ts` — Sessions/conversations
5. `src/lib/api/billing.ts` — Billing/credits
6. `src/lib/api/index.ts` — Barrel export

### Hooks (React Query wrappers)
7. `src/lib/hooks/use-auth.ts` — useMe, useLogin, useRegister
8. `src/lib/hooks/use-agents.ts` — useAgents, useCreateAgent
9. `src/lib/hooks/use-sessions.ts` — useSessions, useSessionDetail
10. `src/lib/hooks/use-billing.ts` — useBilling, usePurchaseCredits

### State
11. `src/lib/stores/auth-store.ts` — JWT tokens, user object, logout
12. `src/lib/stores/platform-store.ts` — Sidebar, theme, workspace

### Pages to Wire Up
13. `src/app/(auth)/login/page.tsx` — Currently mock login
14. `src/app/(auth)/register/page.tsx` — Currently mock register
15. `src/app/(dashboard)/dashboard/page.tsx` — Mock KPIs, activity
16. `src/app/(dashboard)/explorers/page.tsx` — Mock agent grid
17. `src/app/(dashboard)/candidates/page.tsx` — Mock candidate list
18. `src/app/(dashboard)/pipeline/page.tsx` — Mock pipeline board
19. `src/app/(dashboard)/messages/page.tsx` — Mock conversations
20. `src/app/(dashboard)/reports/page.tsx` — Mock chart data
21. `src/lib/mock-data.ts` — Data shapes reference

## Implementation Order

1. **Auth flow** — Login/register against real API, store JWT, redirect
2. **Dashboard** — Replace mock KPIs with useMe + useBilling + useAgents
3. **Explorers** — useAgents() for grid, useCreateAgent for wizard
4. **Candidates** — useSessions() for list + detail modal
5. **Pipeline** — Session status-based pipeline view
6. **Messages** — useSessionDetail for conversation transcripts
7. **Reports** — Aggregate data from sessions/agents
8. **Remaining pages** — Jobs, integrations, notifications, profile, settings

## Key Patterns

- `globals.css` (1,322 lines) = single style source
- Mock data embedded per-page, not centralized
- Inline styles on footer (CSS caching prevention)
- `cn()` utility for class merging
- Dark theme is default
- Footer always dark blue (#0f172a)

## Tech Stack

Next.js 14 | React 18 | TypeScript | Tailwind | React Query | Zustand | Axios | Port 3001
