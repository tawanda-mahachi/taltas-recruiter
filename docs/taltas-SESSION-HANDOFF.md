# Taltas Session Handoff — February 25, 2026

## How to Resume

Upload these files to the new Claude session:
1. `taltas-recruiter.tar.gz` — Full project source code
2. `taltas-FULL-ARCHITECTURE.pdf` — Architecture reference (PDF)
3. `taltas-FULL-ARCHITECTURE.html` — Architecture reference (HTML)

Then say: **"This is the Taltas recruiter portal project. Extract the tar.gz and read ARCHITECTURE.md for full context. Then [describe what you need]."**

---

## Project Summary

**Taltas** = AI-powered recruiting platform with autonomous agents (SNAP protocol)
**Recruiter Portal** = Next.js 14 + React 18 + Tailwind + TypeScript
**Backend API** = https://api.taltas.ai/api/v1 (EKS, RDS, Redis, TLS)
**Dev server** = localhost:3001
**Test login** = test@taltas.ai / TestPass123!

---

## What's Built

- 12 dashboard pages (dashboard, explorers, candidates, pipeline, messages, reports, jobs, integrations, notifications, profile, settings)
- Landing/marketing page with hero, features, integrations, pricing sections
- 20 fully-built public/info pages ported 1:1 from HTML source (help center, API reference, status, community, contact, partners, security, investors, case studies, press kit, research papers, about, careers, changelog, blog, insights + 4 legal pages)
- Authentication pages (login with network canvas animation, register with password strength)
- API integration layer scaffolded (Axios client + JWT refresh interceptor + React Query hooks + Zustand store)
- Modal system (candidate detail 4-tab, explorer detail, new explorer wizard, edit explorer, new role)
- Reports with hand-drawn SVG charts (radar, pareto, funnel)
- Dark blue footer (#0f172a) with full 5-column layout (landing/info) and compact variant (auth/dashboard)
- Footer fonts match HTML source exactly: Georgia serif logo, Space Mono headings, system sans links
- PubNav on info pages matches landing page nav fonts exactly: var(--font-serif) 30px logo, var(--font-mono) 11px links
- SVG icons throughout, dark theme as default

---

## What's NOT Built Yet (Priority Order)

1. **Live backend connection** (currently uses mock data) ← NEXT PRIORITY
2. Candidate Portal (2nd frontend, port 3002)
3. Admin Portal (3rd frontend, port 3003)
4. Socket.io real-time updates
5. Pipeline drag-and-drop
6. Search & filtering
7. File uploads (JD → S3)
8. Email notifications

---

## Backend Connection Plan

The API layer is fully scaffolded — just needs wiring:

### Implementation Order
1. **Auth flow** — Login/register against real API, store JWT, redirect
2. **Dashboard** — Replace mock KPIs with useMe + useBilling + useAgents
3. **Explorers** — useAgents() for grid, useCreateAgent for wizard
4. **Candidates** — useSessions() for list + detail modal
5. **Pipeline** — Session status-based pipeline view
6. **Messages** — useSessionDetail for conversation transcripts
7. **Reports** — Aggregate data from sessions/agents
8. **Remaining** — Jobs, integrations, notifications, profile, settings

### Files to Review Before Starting
- `src/lib/api/client.ts` (76 lines) — Axios + JWT refresh interceptor
- `src/lib/api/auth.ts`, `agents.ts`, `sessions.ts`, `billing.ts` — Endpoint definitions
- `src/lib/hooks/use-auth.ts`, `use-agents.ts`, `use-sessions.ts`, `use-billing.ts` — React Query hooks
- `src/lib/stores/auth-store.ts` — JWT token management
- `src/lib/mock-data.ts` (117 lines) — Data shapes reference

---

## Key Technical Decisions

- **globals.css (1,325 lines)** contains ALL styles — CSS variables, components, landing page, footer, partner scroll animation
- **Mock data** is embedded in each page (not centralized) for standalone demo capability
- **SVG charts** are hand-drawn (no Recharts) for exact design control
- **Single dynamic route** `/info/[slug]` handles all 20 public pages (762 lines)
- **Inline styles** used for footer component (291 lines) to prevent CSS caching issues
- **Footer is always dark blue** (#0f172a) regardless of theme setting
- **PubNav fonts** on info pages match landing page nav: serif logo, mono links, mono CTA button

---

## Verified Items (Feb 25, 2026)

- [x] All 20 footer page links route correctly to /info/[slug]
- [x] Help Center: search bar, 6-section grid, article links, contact strip
- [x] API Reference: sidebar nav, auth section, endpoint docs, JSON response examples
- [x] Status: green dot, 6 incident history entries
- [x] Community: 3-col layout with channels, posts, join card, contributors
- [x] Contact: form + 4 info cards
- [x] Partners: 3 scrolling logo carousels + partner CTA
- [x] Security: 3x2 card grid
- [x] Investors: chip grid + stat block + contact
- [x] Case Studies: featured + 2 additional with stats
- [x] Press Kit: boilerplate, downloads, coverage
- [x] Legal pages: Privacy, Terms, Cookie, GDPR — full text
- [x] Footer fonts match HTML source exactly
- [x] PubNav fonts match landing page nav
- [x] Pareto chart: bar spacing correct
- [x] Radar chart: apex values readable
- [x] TypeScript compiles clean (0 errors in info pages)

---

## Three Frontends (Same Backend)

| Platform | Status | Port |
|----------|--------|------|
| Recruiter | ✅ UI Complete (51 files, ~7,990 LOC) | 3001 |
| Candidate | ❌ Not started | 3002 |
| Admin | ❌ Not started | 3003 |

---

## Boston Tech Labs Context

Taltas is a portfolio company of Boston Tech Labs (BTL), a venture studio.
The project owner is Tawanda, CEO of BTL.
Frontend preference: Next.js + Tailwind + shadcn/ui
