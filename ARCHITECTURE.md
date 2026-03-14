# Taltas Recruiter Portal — Full Architecture

**Version:** 3.0 · **Last Updated:** February 25, 2026
**Status:** Recruiter Portal MVP — UI complete, backend API integration ready

---

## 1. Executive Summary

Taltas is an AI-powered recruitment intelligence platform. The **Recruiter Portal** is the first of three planned frontend platforms (Recruiter → Candidate → Admin), all sharing the same backend API at `https://api.taltas.ai/api/v1`.

The recruiter portal is a Next.js 14 application with 51 source files, ~7,990 lines of code, featuring a complete dashboard UI with mock data, full API integration layer (ready for backend connection), authentication with JWT refresh flow, 20 fully-built public/info pages ported 1:1 from the marketing HTML source, and a dark blue footer with exact font matching.

---

## 2. Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 14.2.x |
| UI Library | React | 18.3.x |
| Language | TypeScript | 5.5.x |
| Styling | Tailwind CSS + globals.css | 3.4.x |
| State (server) | TanStack React Query | 5.50.x |
| State (client) | Zustand | 4.5.x |
| HTTP Client | Axios (with interceptors) | 1.7.x |
| Real-time | socket.io-client | 4.7.x |
| Forms | react-hook-form + zod | 7.52 / 3.23 |
| Icons | Lucide React + custom SVGs | 0.400.x |
| Charts | Hand-drawn SVG (reports) | — |
| Date | date-fns | 3.6.x |
| Dev port | localhost:3001 | — |

---

## 3. Project Structure

```
taltas-recruiter/
├── package.json
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── postcss.config.js
├── ARCHITECTURE.md             # This file
├── public/
│   └── taltas-icon.svg
├── docs/
│   ├── taltas-SESSION-HANDOFF.md
│   ├── HANDOFF-BACKEND.md      # Backend wiring guide
│   ├── taltas-FULL-ARCHITECTURE.html
│   └── taltas-FULL-ARCHITECTURE.pdf
└── src/
    ├── middleware.ts                # Auth route protection (13 lines)
    ├── types/
    │   └── api.ts                  # All TypeScript interfaces (154 lines)
    ├── lib/
    │   ├── api/
    │   │   ├── client.ts           # Axios + JWT refresh interceptor (76 lines)
    │   │   ├── auth.ts             # Login/register/refresh (19 lines)
    │   │   ├── agents.ts           # Agent CRUD (28 lines)
    │   │   ├── sessions.ts         # Session/conversation (19 lines)
    │   │   ├── billing.ts          # Billing/credits (16 lines)
    │   │   └── index.ts            # Barrel export (5 lines)
    │   ├── hooks/
    │   │   ├── use-auth.ts         # useMe, useLogin, useRegister (69 lines)
    │   │   ├── use-agents.ts       # useAgents, useCreateAgent (67 lines)
    │   │   ├── use-sessions.ts     # useSessions, useSessionDetail (51 lines)
    │   │   └── use-billing.ts      # useBilling, usePurchaseCredits (37 lines)
    │   ├── stores/
    │   │   ├── auth-store.ts       # JWT tokens, user, logout (28 lines)
    │   │   └── platform-store.ts   # Sidebar, theme, workspace (27 lines)
    │   ├── mock-data.ts            # Typed mock data (117 lines)
    │   └── utils.ts                # cn() helper (61 lines)
    ├── components/
    │   ├── auth/
    │   │   ├── auth-guard.tsx      # Protected route wrapper (26 lines)
    │   │   ├── network-canvas.tsx  # Animated login background (81 lines)
    │   │   └── password-strength.tsx (36 lines)
    │   ├── modals/
    │   │   ├── candidate-modal.tsx         # 4-tab detail modal (373 lines)
    │   │   ├── explorer-detail-modal.tsx   # Stats + activity (139 lines)
    │   │   ├── new-explorer-modal.tsx      # Wizard flow (179 lines)
    │   │   ├── edit-explorer-modal.tsx     # Quick edit (138 lines)
    │   │   └── new-role-modal.tsx          # New job role (140 lines)
    │   ├── shared/
    │   │   ├── site-footer.tsx     # Dark blue footer, full + compact (291 lines)
    │   │   └── agent-blob.tsx      # Animated agent indicator (15 lines)
    │   ├── shell/
    │   │   └── topbar.tsx          # Dashboard nav bar (94 lines)
    │   ├── ui/
    │   │   ├── modal.tsx           # Portal-based modal (23 lines)
    │   │   └── toast.tsx           # Toast notifications (41 lines)
    │   ├── icons.tsx               # Custom SVG icons (353 lines)
    │   └── icon-resolver.tsx       # Dynamic icon lookup (61 lines)
    └── app/
        ├── layout.tsx              # Root layout (26 lines)
        ├── providers.tsx           # QueryClientProvider (35 lines)
        ├── globals.css             # All styles (1,325 lines)
        ├── page.tsx                # Landing page (261 lines)
        ├── info/[slug]/page.tsx    # All 20 public pages (762 lines)
        ├── (auth)/
        │   ├── layout.tsx          # Auth layout (14 lines)
        │   ├── login/page.tsx      # Login (180 lines)
        │   └── register/page.tsx   # Register (203 lines)
        └── (dashboard)/
            ├── layout.tsx          # Dashboard shell + AuthGuard (39 lines)
            ├── dashboard/page.tsx  # Main dashboard (262 lines)
            ├── explorers/page.tsx  # Agent management (125 lines)
            ├── candidates/page.tsx # Candidate list (146 lines)
            ├── pipeline/page.tsx   # Pipeline board (171 lines)
            ├── messages/page.tsx   # Messaging (269 lines)
            ├── reports/page.tsx    # Analytics charts (519 lines)
            ├── jobs/page.tsx       # Job listings (191 lines)
            ├── integrations/page.tsx # Connectors (213 lines)
            ├── notifications/page.tsx # Alerts (108 lines)
            ├── profile/page.tsx    # User settings (184 lines)
            └── settings/page.tsx   # Workspace config (180 lines)
```

---

## 4. Route Map

### Public Routes
| Route | Description |
|-------|-------------|
| `/` | Landing page with hero, features, pricing |
| `/info/about` | About with stats, team, values |
| `/info/careers` | Job listings + perks |
| `/info/contact` | Contact form + info cards |
| `/info/changelog` | Tagged update feed |
| `/info/blog` | Featured + sidebar layout |
| `/info/insights` | Reports grid |
| `/info/helpcenter` | Search bar + 6-section grid + contact strip |
| `/info/apiref` | Sidebar nav + endpoint docs + JSON examples |
| `/info/status` | Green dot + 6 incident history entries |
| `/info/community` | 3-col: channels, posts, join card |
| `/info/partners` | 3 scrolling logo carousels + CTA |
| `/info/security` | 3×2 security card grid |
| `/info/investors` | Investor chips + stat block |
| `/info/casestudies` | Featured + 2 case studies with stats |
| `/info/presskit` | Boilerplate, downloads, coverage |
| `/info/papers` | 3 research papers with abstracts |
| `/info/privacy` | Privacy policy (full text) |
| `/info/terms` | Terms of service (full text) |
| `/info/cookie` | Cookie policy (full text) |
| `/info/gdpr` | GDPR compliance (full text) |

### Auth Routes
| Route | Description |
|-------|-------------|
| `/login` | Login with network canvas animation |
| `/register` | Registration with password strength |

### Dashboard Routes (Protected)
| Route | Description |
|-------|-------------|
| `/dashboard` | Stats, activity, pipeline overview |
| `/explorers` | Agent grid with create/edit/detail modals |
| `/candidates` | Candidate list with detail modal |
| `/pipeline` | Kanban pipeline board |
| `/messages` | Conversations + compose + transcript |
| `/reports` | Funnel, radar, pareto, export |
| `/jobs` | Job management |
| `/integrations` | ATS/HRIS connections |
| `/notifications` | Alert center |
| `/profile` | User settings |
| `/settings` | Workspace config (dark theme default) |

---

## 5. Authentication

```
Login → POST /auth/login → { accessToken, refreshToken }
     → Store in Zustand auth-store
     → Axios interceptor attaches Bearer token
     → On 401: POST /auth/refresh → retry queue
     → On refresh fail: logout → /login
```

**Test Credentials:** test@taltas.ai / TestPass123!

---

## 6. API Integration

**Base URL:** `https://api.taltas.ai/api/v1`

### Key Endpoints
| Method | Endpoint | Hook |
|--------|----------|------|
| POST | /auth/login | useLogin() |
| POST | /auth/register | useRegister() |
| POST | /auth/refresh | (auto via interceptor) |
| GET | /principals/me | useMe() |
| GET/POST/PUT/DELETE | /agents | useAgents() |
| GET | /sessions | useSessions() |
| GET | /billing/current | useBilling() |

### Integration Status
- API client scaffolded with Axios + JWT refresh interceptor
- React Query hooks defined for all major endpoints
- Currently running on embedded mock data per-page
- **Next step:** Wire hooks to replace mock data (see docs/HANDOFF-BACKEND.md)

---

## 7. Styling

### CSS Variables
```css
--font-sans: 'Inter', system-ui, sans-serif;
--font-mono: 'Roboto Mono', 'Courier New', monospace;
--font-serif: 'Roboto Slab', Georgia, serif;
```

### Key Colors
- Primary accent: #4f46e5 (indigo)
- Secondary accent: #6366f1
- Primary blue: #2563eb
- Dark footer: #0f172a
- Public page bg: #fafbfd
- Text bright: #0f172a
- Text muted: #94a3b8

### Footer (site-footer.tsx — 291 lines)
- Always dark blue (#0f172a) on every page
- **Full variant** (landing + info pages): 5-column grid (brand + 4 link columns) + bottom legal bar
  - Logo: Georgia serif, 22px, white
  - Tagline: system sans, 13px, #94a3b8
  - Column headings: Space Mono, 10px uppercase, .14em letter-spacing
  - Column links: system sans, 13px, #64748b → #e2e8f0 on hover
  - Social buttons: LinkedIn + X/Twitter SVGs
  - Copyright: Space Mono, 10px, #cbd5e1
  - Legal links: Space Mono, 10px, #cbd5e1 → #94a3b8 on hover
- **Compact variant** (auth + dashboard): bottom bar only with copyright + legal links

### PubNav (info pages)
- Matches landing page nav fonts exactly:
  - Logo: var(--font-serif), 30px, weight 400, #0f172a, accent #4f46e5
  - Nav links: var(--font-mono), 11px, uppercase, .08em letter-spacing, #94a3b8
  - CTA button: var(--font-mono), 11px, uppercase, border rgba(0,0,0,.14)

---

## 8. Key Features

### Public Pages (info/[slug]/page.tsx — 762 lines)
- 16 custom-layout pages with full content from HTML source
- 4 standard legal pages (templated with heading/body sections)
- All share PubNav + SiteFooter
- Search functionality on Help Center page
- Scrolling partner logo carousels with CSS animation
- Community page with post feed, channels, join card, contributor sidebar

### Reports Charts (SVG)
- **Radar**: 300×290 SVG, 6-axis, Explorer (blue) vs ATS (gray), apex values visible
- **Pareto**: 440px wide, 14px bar padding, -40° rotated labels, 80% line
- **Funnel**: Conversion visualization with stage percentages

### Modal System
- Portal-based with click-outside + ESC close
- CandidateModal: 4 tabs (Overview, Conversation, Fit, Timeline) — 373 lines
- ExplorerDetailModal: Stats + activity + pause/resume — 139 lines
- NewExplorerModal: Wizard flow — 179 lines
- EditExplorerModal: Quick edit — 138 lines
- NewRoleModal: Job role creation — 140 lines

---

## 9. Backend Reference

### Infrastructure
- EKS (Kubernetes) on AWS
- RDS (PostgreSQL)
- Redis for caching
- TLS 1.3 end-to-end
- CI/CD via GitHub Actions

### SNAP Protocol
Agent interaction protocol: Screening → Negotiation → Assessment → Placement

---

## 10. What's Next

### Priority Order
1. **Connect to live backend** (replace mock data) ← IMMEDIATE NEXT
2. Candidate Portal (second frontend)
3. Admin Portal (third frontend)
4. Socket.io real-time features
5. Pipeline drag-and-drop
6. Search & filtering
7. File uploads (JD to S3)
8. Email notifications

### Backend Wiring Order (see docs/HANDOFF-BACKEND.md)
1. Auth flow (login/register → JWT → redirect)
2. Dashboard (useMe + useBilling + useAgents)
3. Explorers (useAgents grid + useCreateAgent wizard)
4. Candidates (useSessions list + detail modal)
5. Pipeline (session status-based view)
6. Messages (useSessionDetail transcripts)
7. Reports (aggregate session/agent data)
8. Remaining pages

---

## 11. Recent Changes

### February 25, 2026 (v3.0)
- Rebuilt info/[slug]/page.tsx from scratch: 762 lines, 20 fully-ported pages from HTML source
- Help Center: search bar, 6-section grid with articles, contact strip
- API Reference: sidebar nav, auth docs, endpoint specs, JSON response examples
- Status: operational indicator, 6 incident history entries
- Community: 3-col layout — channels, post feed, join card, contributors, stats
- Contact: full form (name, email, topic select, message) + 4 info cards
- Partners: 3 scrolling logo carousels (HR Platforms, ATS, Staffing) + CTA
- Security: 3×2 card grid (Encryption, SOC 2, Access Controls, Vuln Disclosure, Infra, Pen Testing)
- Investors: chip grid + stat block ($22M / Series A / 2023)
- Case Studies: featured Meridian Pay + NovaCare + Loom-Up with stats
- Press Kit: boilerplate, press contact, 5 downloadable assets, 3 coverage entries
- Research Papers: 3 papers with authors, abstracts, PDF/arXiv links
- Legal pages: Privacy, Terms, Cookie, GDPR — full text ported from HTML source
- PubNav fonts now match landing page nav exactly (serif logo, mono links)
- Added @keyframes partnerScroll to globals.css
- TypeScript compiles clean (0 errors)
- Created HANDOFF-BACKEND.md for backend wiring guide

### February 24, 2026 (v2.0)
- 19 UI/UX fixes across dashboard, reports, settings, explorers, modals, footer
- Footer component completely rewritten with exact HTML source fonts/content
- Dark blue (#0f172a) footer with full 5-col + compact variants
- Rebuilt all footer/info pages with full HTML mockup content
- Contact page: emoji → SVG icons (mail, handshake, newspaper, map-pin)
- Pareto chart: widened 380→440px, padding 10→14px, labels lowered
- Radar chart: apex values added (10px Explorer, 9px ATS), SVG enlarged 300×290
- Dashboard fonts: var(--font-mono) = Roboto Mono
- Landing page footer fonts: Space Mono for headings

---

## 12. Three Frontends (Same Backend)

| Platform | Status | Port | LOC |
|----------|--------|------|-----|
| Recruiter | ✅ UI Complete | 3001 | ~7,990 |
| Candidate | ❌ Not started | 3002 | — |
| Admin | ❌ Not started | 3003 | — |

---

## 13. Boston Tech Labs Context

Taltas is a portfolio company of Boston Tech Labs (BTL), a venture studio.
The project owner is Tawanda, CEO of BTL.
Frontend preference: Next.js + Tailwind + shadcn/ui
