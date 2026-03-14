# Taltas Recruiter Portal

Production-ready Next.js 14 frontend for the Taltas recruiter platform.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3001](http://localhost:3001)

**Login:** `test@taltas.ai` / `TestPass123!`

## Architecture

- **Next.js 14** App Router with TypeScript
- **React Query v5** for server state management
- **Zustand** for client auth state
- **Tailwind CSS** + custom design system matching Taltas brand
- **77+ inline SVG icons** — zero emoji, zero external icon deps

## Pages

| Route | Description |
|-------|-------------|
| `/login` | Auth with animated network canvas, role picker, SSO |
| `/register` | Account creation with email validation, password strength |
| `/` | Dashboard — KPIs, pipeline stages, candidate table, integrations grid, open roles sidebar, explorer accordion |
| `/pipeline` | Pipeline funnel visualization, conversion metrics, time-in-stage bottleneck analysis, filterable candidate table |
| `/candidates` | Full candidate list — 4-filter search (name/stage/fit/source), sortable, deep match bars, score dots, tags |
| `/explorers` | Explorer agent fleet — KPI cards, performance table with conversations/A2A/interviews/rejection/offer rate/deep match |
| `/integrations` | 12 HR platforms — 3-column grid, connection status, configure/sync, error handling |
| `/reports` | 4 report cards (Pipeline Volume, Source Effectiveness, Explorer vs ATS, Monthly Hiring), export section |
| `/profile` | User profile details |

## Icon System

All iconography uses inline SVG components from `src/components/icons.tsx`. The `resolveIcon()` helper in `icon-resolver.tsx` maps string keys to components for data-driven rendering (integration tiles, explorer agents, etc). Zero emojis in the entire codebase.

## API Connection

All API calls go to `https://api.taltas.ai/api/v1` (configured in `.env.local`).
Port 3001 is whitelisted in backend CORS. JWT auth with automatic refresh.
