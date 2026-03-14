#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════
# Taltas Recruiter Platform — Full API Connection Test Suite
# Tests every endpoint wired to the recruiter UI
# ═══════════════════════════════════════════════════════════════════
set -euo pipefail

API_BASE="${TALTAS_API_URL:-https://api.taltas.ai/api/v1}"
EMAIL="${TALTAS_EMAIL:-test@taltas.ai}"
PASSWORD="${TALTAS_PASSWORD:-TestPass123!}"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[0;33m'; BLUE='\033[0;34m'; CYAN='\033[0;36m'; NC='\033[0m'; BOLD='\033[1m'
PASS=0; FAIL=0; SKIP=0; RESULTS=()

print_header() { echo -e "\n${BOLD}${CYAN}═══════════════════════════════════════════════════════════════${NC}"; echo -e "${BOLD}${CYAN}  $1${NC}"; echo -e "${BOLD}${CYAN}═══════════════════════════════════════════════════════════════${NC}"; }
print_section() { echo -e "\n${BOLD}${BLUE}─── $1 ───${NC}"; }
record() {
  local status=$1 page=$2 endpoint=$3 detail=$4
  if [ "$status" = "PASS" ]; then echo -e "  ${GREEN}✓ PASS${NC} ${page} → ${endpoint} ${detail}"; ((PASS++));
  elif [ "$status" = "FAIL" ]; then echo -e "  ${RED}✗ FAIL${NC} ${page} → ${endpoint} ${detail}"; ((FAIL++));
  else echo -e "  ${YELLOW}○ SKIP${NC} ${page} → ${endpoint} ${detail}"; ((SKIP++)); fi
  RESULTS+=("$status|$page|$endpoint|$detail")
}

test_endpoint() {
  local page=$1 method=$2 path=$3 body="${4:-}" expected_field="${5:-}" label="${6:-$path}"
  local url="${API_BASE}${path}"
  local http_code response
  if [ "$method" = "GET" ]; then
    response=$(curl -s -w "\n%{http_code}" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" "$url" 2>/dev/null || echo -e "\n000")
  elif [ "$method" = "POST" ]; then
    response=$(curl -s -w "\n%{http_code}" -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "$body" "$url" 2>/dev/null || echo -e "\n000")
  elif [ "$method" = "PATCH" ]; then
    response=$(curl -s -w "\n%{http_code}" -X PATCH -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "$body" "$url" 2>/dev/null || echo -e "\n000")
  fi
  http_code=$(echo "$response" | tail -1)
  local resp_body=$(echo "$response" | sed '$d')

  if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
    if [ -n "$expected_field" ]; then
      if echo "$resp_body" | grep -q "$expected_field"; then
        record "PASS" "$page" "$method $label" "(HTTP $http_code, found '$expected_field')"
      else
        record "FAIL" "$page" "$method $label" "(HTTP $http_code, missing '$expected_field')"
      fi
    else
      record "PASS" "$page" "$method $label" "(HTTP $http_code)"
    fi
  elif [ "$http_code" = "000" ]; then
    record "FAIL" "$page" "$method $label" "(Connection refused — is API running?)"
  else
    record "FAIL" "$page" "$method $label" "(HTTP $http_code)"
  fi
  echo "$resp_body"
}

# ═══════════════════════════════════════════════════════════════
print_header "TALTAS RECRUITER — API CONNECTION TEST SUITE"
echo -e "  API Base: ${BOLD}${API_BASE}${NC}"
echo -e "  Email:    ${EMAIL}"
echo -e "  Time:     $(date -u '+%Y-%m-%d %H:%M:%S UTC')"

# ─── 1. AUTH ──────────────────────────────────────────────────
print_section "1. AUTHENTICATION (Login Page)"
LOGIN_RESP=$(curl -s -w "\n%{http_code}" -X POST -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" \
  "${API_BASE}/auth/login" 2>/dev/null || echo -e "\n000")
LOGIN_CODE=$(echo "$LOGIN_RESP" | tail -1)
LOGIN_BODY=$(echo "$LOGIN_RESP" | sed '$d')

if [ "$LOGIN_CODE" -ge 200 ] && [ "$LOGIN_CODE" -lt 300 ]; then
  TOKEN=$(echo "$LOGIN_BODY" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
  REFRESH=$(echo "$LOGIN_BODY" | grep -o '"refreshToken":"[^"]*"' | cut -d'"' -f4)
  if [ -n "$TOKEN" ]; then
    record "PASS" "Login" "POST /auth/login" "(got accessToken + refreshToken)"
  else
    record "FAIL" "Login" "POST /auth/login" "(HTTP $LOGIN_CODE but no token in response)"
    echo -e "${RED}Cannot proceed without auth token. Exiting.${NC}"; exit 1
  fi
else
  record "FAIL" "Login" "POST /auth/login" "(HTTP $LOGIN_CODE)"
  echo -e "${RED}Login failed. Cannot proceed.${NC}"; exit 1
fi

# ─── 2. PROFILE (Profile Page, Dashboard KPIs) ───────────────
print_section "2. PROFILE / PRINCIPAL (Profile Page)"
PROFILE_BODY=$(test_endpoint "Profile" "GET" "/principals/me" "" "id")

# ─── 3. AGENTS / EXPLORERS (Dashboard, Explorers Page) ───────
print_section "3. AGENTS / EXPLORERS (Dashboard + Explorers Page)"
AGENTS_BODY=$(test_endpoint "Explorers" "GET" "/agents?type=explorer" "" "data")
FLEET_BODY=$(test_endpoint "Dashboard KPIs" "GET" "/agents/fleet-summary" "" "total")

# Create an explorer via API
print_section "3b. CREATE EXPLORER (New Explorer Modal)"
CREATE_BODY=$(test_endpoint "New Explorer" "POST" "/agents" \
  '{"type":"explorer","name":"TestBot-API","context":{"mode":"AUTO","role":"Test Engineer","icon":"bot","iconBg":"var(--green-bg)","conversations":0,"a2aSessions":0,"interviewsSet":0,"interactions":[]}}' \
  "id")
CREATED_ID=$(echo "$CREATE_BODY" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -n "$CREATED_ID" ]; then
  echo -e "  ${CYAN}Created agent ID: $CREATED_ID${NC}"

  # Verify it appears in list
  print_section "3c. VERIFY CREATED EXPLORER APPEARS IN LIST"
  VERIFY_BODY=$(test_endpoint "Explorers List" "GET" "/agents?type=explorer" "" "$CREATED_ID")

  # Update the explorer
  print_section "3d. UPDATE EXPLORER (Edit Explorer Modal)"
  UPDATE_BODY=$(test_endpoint "Edit Explorer" "PATCH" "/agents/$CREATED_ID" \
    '{"name":"TestBot-Updated","context":{"mode":"ASSIST","role":"Updated Role","icon":"target","iconBg":"var(--blue-bg)"}}' \
    "TestBot-Updated")

  # Verify update persisted
  print_section "3e. VERIFY UPDATE PERSISTED"
  GET_BODY=$(test_endpoint "Explorer Detail" "GET" "/agents/$CREATED_ID" "" "TestBot-Updated")

  # Pause / Resume / Retire lifecycle
  print_section "3f. AGENT LIFECYCLE"
  test_endpoint "Pause Agent" "POST" "/agents/$CREATED_ID/pause" "" "" "/agents/:id/pause" > /dev/null
  test_endpoint "Resume Agent" "POST" "/agents/$CREATED_ID/resume" "" "" "/agents/:id/resume" > /dev/null
  test_endpoint "Retire Agent" "POST" "/agents/$CREATED_ID/retire" "" "" "/agents/:id/retire" > /dev/null
else
  record "SKIP" "Explorer CRUD" "POST /agents" "(no ID returned, skipping update/verify)"
fi

# ─── 4. SNAP SESSIONS (Pipeline, Messages, Dashboard) ────────
print_section "4. SNAP SESSIONS (Pipeline + Messages Pages)"
SESSIONS_BODY=$(test_endpoint "Pipeline/Messages" "GET" "/snap-sessions" "" "data")

# ─── 5. BILLING / CREDITS (Billing Page, Settings) ───────────
print_section "5. BILLING & CREDITS (Billing + Settings Pages)"
CREDITS_BODY=$(test_endpoint "Billing" "GET" "/principals/me/credits" "" "creditBalance")
PACKS_BODY=$(test_endpoint "Credit Packs" "GET" "/billing/credits" "" "data")
PERIODS_BODY=$(test_endpoint "Billing Periods" "GET" "/billing/periods" "" "data")

# ─── 6. CANDIDATES (Candidates Page, Dashboard) ──────────────
print_section "6. CANDIDATES (Candidates + Dashboard Pages)"
CANDS_BODY=$(test_endpoint "Candidates" "GET" "/candidates" "" "")

# ─── 7. ROLES / JOBS (Jobs Page, Dashboard) ──────────────────
print_section "7. ROLES / JOBS (Jobs + Dashboard Pages)"
ROLES_BODY=$(test_endpoint "Jobs" "GET" "/roles" "" "")

# ─── 8. INTEGRATIONS (Integrations Page, Dashboard) ──────────
print_section "8. INTEGRATIONS (Integrations + Dashboard Pages)"
INT_BODY=$(test_endpoint "Integrations" "GET" "/integrations" "" "")

# ─── 9. PIPELINE STATS (Pipeline Page) ───────────────────────
print_section "9. PIPELINE STATS (Pipeline Page)"
PIPE_BODY=$(test_endpoint "Pipeline" "GET" "/pipeline/stats" "" "")

# ─── 10. NOTIFICATIONS (Notifications Page) ──────────────────
print_section "10. NOTIFICATIONS (Notifications Page)"
NOTIF_BODY=$(test_endpoint "Notifications" "GET" "/notifications" "" "")

# ─── 11. MESSAGES (Messages Page) ────────────────────────────
print_section "11. MESSAGES (Messages Page)"
MSG_BODY=$(test_endpoint "Messages" "GET" "/messages" "" "")

# ─── 12. AUTH REFRESH ────────────────────────────────────────
print_section "12. AUTH TOKEN REFRESH"
if [ -n "$REFRESH" ]; then
  REFRESH_RESP=$(curl -s -w "\n%{http_code}" -X POST -H "Content-Type: application/json" \
    -d "{\"refreshToken\":\"$REFRESH\"}" "${API_BASE}/auth/refresh" 2>/dev/null || echo -e "\n000")
  REFRESH_CODE=$(echo "$REFRESH_RESP" | tail -1)
  if [ "$REFRESH_CODE" -ge 200 ] && [ "$REFRESH_CODE" -lt 300 ]; then
    record "PASS" "Auth" "POST /auth/refresh" "(HTTP $REFRESH_CODE)"
  else
    record "FAIL" "Auth" "POST /auth/refresh" "(HTTP $REFRESH_CODE)"
  fi
fi

# ═══════════════════════════════════════════════════════════════
# SUMMARY
# ═══════════════════════════════════════════════════════════════
print_header "TEST RESULTS SUMMARY"
echo ""
echo -e "  ${GREEN}PASSED: $PASS${NC}"
echo -e "  ${RED}FAILED: $FAIL${NC}"
echo -e "  ${YELLOW}SKIPPED: $SKIP${NC}"
echo -e "  TOTAL:  $((PASS + FAIL + SKIP))"
echo ""

# Page-by-page wiring verification
print_section "PAGE → API WIRING MAP"
echo ""
printf "  ${BOLD}%-22s %-35s %-8s %s${NC}\n" "PAGE" "ENDPOINT" "STATUS" "NOTES"
printf "  %-22s %-35s %-8s %s\n" "──────────────────────" "───────────────────────────────────" "────────" "──────────────────"
for r in "${RESULTS[@]}"; do
  IFS='|' read -r st pg ep dt <<< "$r"
  color=$GREEN; [ "$st" = "FAIL" ] && color=$RED; [ "$st" = "SKIP" ] && color=$YELLOW
  printf "  %-22s %-35s ${color}%-8s${NC} %s\n" "$pg" "$ep" "$st" "$dt"
done

echo ""
print_section "UI PAGES WIRED TO API"
echo ""
echo -e "  ${BOLD}Page                    Data Hook                   Fallback${NC}"
echo -e "  ─────────────────────  ──────────────────────────  ────────"
echo -e "  Dashboard              useExplorers + useCandidates MOCK_*"
echo -e "                         + useRoles + useIntegrations"
echo -e "                         + useFleet + usePipeline"
echo -e "  Explorers              useExplorers()              EXPLORER_PERF"
echo -e "  Candidates             useCandidates()             MOCK_CANDIDATES"
echo -e "  Jobs                   useRoles()                  MOCK_ROLES"
echo -e "  Pipeline               usePipeline()               PIPELINE_FUNNEL"
echo -e "  Integrations           useIntegrations()           MOCK_INTEGRATIONS"
echo -e "  Messages               useMessages()               THREADS (hardcoded)"
echo -e "  Notifications          useNotifications()          NOTIFICATIONS"
echo -e "  Settings (API)         ApiStatusPanel              Health check"
echo -e "  Settings (Billing)     useCreditSummary()          Mock credits"
echo -e "  Reports                useFleet + usePipeline      Mock analytics"
echo -e "  Profile                useProfile()                Auth store"
echo -e ""
echo -e "  ${BOLD}Modal                   Mutation Hook               Fallback${NC}"
echo -e "  ─────────────────────  ──────────────────────────  ────────"
echo -e "  New Explorer           useCreateExplorer()         addExplorer (local)"
echo -e "  Edit Explorer          useUpdateExplorer()         Toast only"
echo -e ""
echo -e "  ${BOLD}Every section header shows:${NC} ${GREEN}● API${NC} or ${YELLOW}● MOCK${NC} badge"
echo ""

if [ $FAIL -eq 0 ]; then
  echo -e "  ${GREEN}${BOLD}ALL TESTS PASSED ✓${NC}"
else
  echo -e "  ${YELLOW}${BOLD}$FAIL endpoint(s) returned errors — UI will use mock data for those.${NC}"
  echo -e "  ${YELLOW}This is expected if some backend routes aren't implemented yet.${NC}"
fi
echo ""
echo -e "  ${CYAN}Core endpoints (auth, agents, billing) must pass for full functionality.${NC}"
echo -e "  ${CYAN}Other endpoints (candidates, roles, etc.) gracefully fall back to mock.${NC}"
echo ""
