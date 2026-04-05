# CLAUDE.md — taltas-recruiter

## Project
Taltas Recruiter Portal — Next.js 14 (App Router).  
Live at: https://recruiters.taltas.ai  
Amplify App ID: `d28fl7o7vyp4ws`

## Deploy
```powershell
cd C:\Projects\taltas-recruiter
git add -A
git commit -m "message"
git push
# Amplify auto-deploys on push
```
Check build: `aws amplify list-jobs --app-id d28fl7o7vyp4ws --branch-name main --region us-east-1 --query "jobSummaries[0].{status:status}"`

## Stack
- Next.js 14 (App Router), React 18, TypeScript (strict)
- Tailwind CSS + shadcn/ui
- TanStack React Query, Zustand, React Hook Form + Zod
- Axios, Socket.IO Client
- ECharts (charts — NOT Recharts, never Recharts)

## Layout
Sidebar nav, 220px fixed, white bg, `border-right: 1px solid var(--border)`.  
Active item: `border-left: 2px solid var(--blue)`.

## Sidebar Items
Dashboard · Pipeline · Live Jobs · Job Bank · Candidates · Explorers · Integrations · Messages · Reports

## Design System — STRICT
```css
--blue:    #2563eb   /* ALL blue instances — not #0033FF, not any other value */
--dark:    #0A0A0A
--mid:     #6B6B6B
--muted:   #AAAAAA
--border:  #E8E8E5
--blight:  #F4F4F2
--white:   #FFFFFF
--navy:    #0B1D35   /* footer only */
font: 'Helvetica Neue', Helvetica, Arial, sans-serif — weights 300/400/500 ONLY
```

### Visual Rules — NEVER VIOLATE
- **Zero border-radius** on panels, cards, modals, buttons, inputs, tags, badges, filter pills
- **Zero box-shadow** — flat 0.5px–1px borders only
- Hover: border-color change only, never shadow
- Active nav: `border-left: 2px solid #2563eb`
- Nav labels: 12.5px, weight 400
- Status badges: 10px uppercase, 0 radius, token colors
- Table row height: 40px
- Modal: 0 radius, padding 32px, header label 14px, title 20px, footer right-aligned
- Logo: blue `#2563eb` compass SVG + blue wordmark, Helvetica Neue 300

## Page Status & Delta Required

| Page | Status | Delta Needed |
|---|---|---|
| Login / Register | ✅ Built | Globe meridians → #2563eb; card flat, 0 radius; inputs 0 radius |
| Dashboard | ✅ Built | Shadows → flat; ECharts replacing Recharts |
| Pipeline | ✅ Built | Stage chips → token colors, 0 radius; row hover → border only |
| Live Jobs / Job Bank | ✅ Built | Filter pills → 0 radius; badges → 10px uppercase, 0 radius |
| Candidates page | ✅ Built | Row font → Helvetica Neue; borders → 0.5px |
| Candidate modal | ✅ Built | Modal 0 radius; skills bars → #2563eb; Fit Dimensions → ECharts; bubbles → token |
| Explorers page | ✅ Built | Cards → flat, 0 shadow |
| New Explorer modal | ✅ Built (4-step) | Step cards 0 radius; font weight; selection cards flat; step indicator → line |
| New Role modal | ✅ Built (5-step) | **Full rebuild** — all inputs, buttons, section headers to new system |
| Integrations | ✅ Built | Cards flat; connected badge → teal token; icons standardized |
| Messages | ✅ Built | Bubbles → 2px max; A2A badge → token; context input → 0.5px border |
| Reports | ✅ Built | **Full ECharts rebuild** — Pareto, radar, bar; fix radar left-label clipping |

## New Role Modal — 5-Step Rebuild Spec
All steps: Helvetica Neue 300/400, 0 radius on everything, flat 0.5px borders.
- Step 0: Role basics (title, department, location, type)
- Step 1: Compensation (range, equity, benefits)
- Step 2: Requirements (skills, experience, education)
- Step 3: Screening questions
- Step 4: Confirm → `POST /roles`

## New Explorer Modal — 4-Step Delta Spec
Steps (existing, design update only):
- Step 0: Basics (name, role, mode AUTO/ASSIST/DRAFT, icon, personality, A2A)
- Step 1: Screening config (questions, evaluation criteria)
- Step 2: Settings (max conversations, auto-advance)
- Step 3: Confirm → Deploy Explorer → `POST /agents`

## Key Principles
- Blue is `#2563eb` everywhere — verify in globals.css `--blue` var
- Never use `#0033FF`
- Charts: ECharts only
- No border-radius anywhere
- No box-shadow anywhere
