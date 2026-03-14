# Taltas Session Handoff — February 24, 2026

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
- Landing/marketing page
- 25+ public/info pages (about, careers, contact, changelog, blog, insights, privacy, terms, etc.)
- Authentication (login, register, JWT refresh)
- API integration layer (Axios + React Query hooks)
- Modal system (candidate detail, explorer detail, new explorer wizard, new role)
- Reports with SVG charts (radar, pareto, funnel)
- Dark blue footer (#0f172a) on all pages
- SVG icons throughout (no emojis)
- Dark theme as default

---

## What's NOT Built Yet

1. Live backend connection (currently uses mock data)
2. Candidate Portal (2nd frontend, port 3002)
3. Admin Portal (3rd frontend, port 3003)
4. Socket.io real-time updates
5. Pipeline drag-and-drop
6. Search & filtering
7. File uploads (JD → S3)
8. Email notifications

---

## Items to Verify in Current Build

- [ ] Footer pages: navigate to each /info/[slug] from footer links
- [ ] Pareto chart: check bar spacing doesn't clip labels
- [ ] Radar chart: check apex values readable at all sizes
- [ ] Login page: has no footer currently (may need one)
- [ ] Dashboard layout: has no footer line currently

---

## Key Technical Decisions

- **globals.css (1,406 lines)** contains ALL styles — CSS variables, components, landing page, footer
- **Mock data** is embedded in each page (not centralized) for standalone demo capability
- **SVG charts** are hand-drawn (no Recharts) for exact design control
- **Single dynamic route** `/info/[slug]` handles all 25+ public pages
- **Inline styles** used for footer component to prevent CSS caching issues
- **Footer is always dark blue** (#0f172a) regardless of theme setting

---

## Three Frontends (Same Backend)

| Platform | Status | Port |
|----------|--------|------|
| Recruiter | ✅ UI Complete | 3001 |
| Candidate | ❌ Not started | 3002 |
| Admin | ❌ Not started | 3003 |

---

## Boston Tech Labs Context

Taltas is a portfolio company of Boston Tech Labs (BTL), a venture studio.
The project owner is Tawanda, CEO of BTL.
Frontend preference: Next.js + Tailwind + shadcn/ui
