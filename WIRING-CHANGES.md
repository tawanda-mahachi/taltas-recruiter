# Taltas Recruiter — API Wiring Changes

## What Changed

Every UI page is now wired to the backend API via `data-provider.ts` hooks.
Each hook tries the API first, falls back to mock data if unavailable.
Every section header shows a **●&nbsp;API** (green) or **●&nbsp;MOCK** (amber) badge.

## Files Modified (14 files)

### Pages (11)
| Page | File | Hook(s) Added |
|------|-------|---------------|
| Dashboard | `app/(dashboard)/dashboard/page.tsx` | `useExplorers`, `useCandidates`, `useRoles`, `useIntegrations`, `useFleet`, `usePipeline` |
| Explorers | `app/(dashboard)/explorers/page.tsx` | `useExplorers` |
| Candidates | `app/(dashboard)/candidates/page.tsx` | `useCandidates` |
| Jobs | `app/(dashboard)/jobs/page.tsx` | `useRoles` |
| Pipeline | `app/(dashboard)/pipeline/page.tsx` | `usePipeline` |
| Integrations | `app/(dashboard)/integrations/page.tsx` | `useIntegrations` |
| Messages | `app/(dashboard)/messages/page.tsx` | `useMessages` |
| Notifications | `app/(dashboard)/notifications/page.tsx` | `useNotifications` |
| Settings | `app/(dashboard)/settings/page.tsx` | `useCreditSummary`, `ApiStatusPanel` |
| Reports | `app/(dashboard)/reports/page.tsx` | `useFleet`, `usePipeline` |
| Profile | `app/(dashboard)/profile/page.tsx` | `useProfile` |

### Modals (2)
| Modal | File | Mutation Hook |
|-------|-------|--------------|
| New Explorer | `components/modals/new-explorer-modal.tsx` | `useCreateExplorer` → `POST /agents` |
| Edit Explorer | `components/modals/edit-explorer-modal.tsx` | `useUpdateExplorer` → `PATCH /agents/:id` |

### Already Existed (not modified)
| File | Purpose |
|------|---------|
| `lib/data-provider.ts` | API-first hooks with mock fallback |
| `components/shared/api-status.tsx` | `DataSourceBadge` + `ApiStatusPanel` |
| `lib/api/agents.ts` | Agent CRUD API client |
| `lib/api/sessions.ts` | SNAP session API client |
| `lib/api/billing.ts` | Billing/credits API client |
| `lib/api/auth.ts` | Authentication API client |
| `lib/hooks/use-agents.ts` | React Query agent hooks |

## How It Works

```
Page Component
  ↓ imports useExplorers() from data-provider
  ↓
data-provider.ts
  ↓ tries: agentsApi.list({ type: 'explorer' })
  ↓ success → { data: [...api agents], fromApi: true }
  ↓ failure → { data: MOCK_EXPLORERS, fromApi: false }
  ↓
Page renders data + shows DataSourceBadge(fromApi)
  → green "API" badge if live
  → amber "MOCK" badge if fallback
```

## Testing

```bash
# Run the full test suite
chmod +x test-api-connections.sh
./test-api-connections.sh

# Or with custom API URL
TALTAS_API_URL=http://localhost:3000/api/v1 ./test-api-connections.sh

# Override credentials
TALTAS_EMAIL=my@email.com TALTAS_PASSWORD=mypass ./test-api-connections.sh
```

The test script exercises every endpoint wired to the UI:
1. Auth login + token refresh
2. Profile/principal
3. Agent CRUD (create → list → update → verify → lifecycle)
4. SNAP sessions
5. Billing credits + packs + periods
6. Candidates, Roles, Integrations, Pipeline stats
7. Notifications, Messages

## What You Should See

- **Dashboard**: API/MOCK badges on Pipeline, Integrations, Open Jobs, Explorer sections
- **Explorers tab**: Created agents from API appear in the performance table
- **Settings > API**: Full ApiStatusPanel showing endpoint health with latency
- **All pages**: Section headers show data source indicator
