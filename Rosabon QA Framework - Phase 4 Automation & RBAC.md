# Rosabon QA Framework — Phase 4 (Automation & Hardening) + RBAC

This covers the governance (G10 RBAC) and automation-tier (§23 CI/CD, §15/§25 monitoring) features added on top of Phases 1–3.

---

## 1. Governance Roles (G10 · §8)

Client-side role/permission model in [src/types/role.ts](src/types/role.ts), provided via [RoleContext](src/context/RoleContext.tsx).

| Role | Key permissions |
|---|---|
| **Management** | Everything, incl. `release:signoff` (sign off / approve / mark released) |
| **QA Engineer** | `test:author`, `run:execute`, `defect:manage`, `requirement:manage`, `release:plan`, `report:publish` |
| **Product / Business** | `requirement:manage`, `run:execute` (UAT), `report:publish` |
| **Developer** | `defect:manage` |
| **Viewer** | Read-only |

- The signed-in user picks their role in the **sidebar → Governance Role** switcher; it persists per user in `localStorage`.
- Gated actions today: **release sign-off / approval / roll-back / manual checklist** (`release:signoff` + `release:plan`), **New Release**, and **report publishing** (`report:publish`).
- `useRole().can("permission")` gates any action; add more gates as needed.

> **Security note:** this is **UI-level governance** for workflow clarity. It is not a security boundary. Server-side enforcement (Supabase Row-Level Security keyed to a `role` claim) is the recommended hardening step before exposing this to untrusted users.

---

## 2. Automation API (§23)

Server routes read/write the same per-project JSON blobs the app uses, via [src/lib/serverStore.ts](src/lib/serverStore.ts).

### Environment variables
```env
# Required for server routes to reach Supabase (service role bypasses RLS for trusted server writes)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key      # falls back to NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url

# Shared secret required for ingestion + readiness gate
INGEST_API_TOKEN=your_long_random_token

# Optional: separate token for the monitoring webhook (falls back to INGEST_API_TOKEN)
MONITORING_WEBHOOK_TOKEN=your_webhook_token
```

### 2.1 Ingest a CI test run — `POST /api/ingest/test-run` (G11)
Records automated results (Playwright / Maestro / Postman / GitHub Actions) as a **completed** TestRun, feeding the same history, trends and release gate as manual runs.

```bash
curl -X POST https://<host>/api/ingest/test-run \
  -H "x-api-token: $INGEST_API_TOKEN" \
  -H "content-type: application/json" \
  -d '{
    "projectId": "rosabon-app",
    "name": "CI #482 regression",
    "type": "regression",              # smoke | regression | full | uat
    "environment": "staging",          # dev | staging | production
    "results": [
      { "testCaseId": "WALT-001", "module": "Wallet System", "scenario": "Fund wallet", "status": "pass" },
      { "testCaseId": "WALT-002", "status": "fail" }
    ]
  }'
# → { "success": true, "runId": "...", "passRate": 50, "total": 2, "passed": 1, "failed": 1 }
```

### 2.2 Release-readiness gate — `GET /api/release-readiness` (§24)
Call before deploy; block the pipeline when `ready` is `false`.

```bash
curl -H "x-api-token: $INGEST_API_TOKEN" \
  "https://<host>/api/release-readiness?projectId=rosabon-app&version=2.4.0"
# → { "ready": false, "done": 6, "total": 8, "blockers": ["API responses validated", ...], ... }
```
`version` is optional (defaults to the latest release). Example CI gate:
```bash
READY=$(curl -s -H "x-api-token: $INGEST_API_TOKEN" \
  "$HOST/api/release-readiness?projectId=$PID" | jq -r .ready)
[ "$READY" = "true" ] || { echo "Release not ready"; exit 1; }
```

### 2.3 Monitoring webhook — `POST /api/webhooks/monitoring` (G12 · §15)
Records crash/incident events from Sentry / Firebase Crashlytics; surfaces as **crash frequency** and **production incidents** in the Defect Report.

```bash
curl -X POST https://<host>/api/webhooks/monitoring \
  -H "x-api-token: $MONITORING_WEBHOOK_TOKEN" \
  -H "content-type: application/json" \
  -d '{ "projectId": "rosabon-app", "source": "sentry", "type": "crash", "title": "NPE in WalletService", "level": "error", "count": 12 }'
# → { "success": true, "eventId": "..." }
```

---

## 3. Verification status

- Type-check (`tsc --noEmit`) and `next build`: **green**; all three routes compile and register.
- End-to-end behaviour of the routes depends on a configured Supabase project + env vars above, so exercise them against a real deployment. Without `SUPABASE_SERVICE_ROLE_KEY`, server writes rely on the anon key and may be blocked by RLS — set the service-role key for reliable ingestion.

---

## 4. Still open (future hardening)
- **Server-enforced RBAC** (Supabase RLS) — make the role a real security boundary.
- **File/evidence attachments** on defects & run results (needs a Supabase Storage bucket) — §22 evidence, G8.
- **Auto-seed** the Rosabon module catalogs on first open (currently exported in [src/data/projects/rosabon.ts](src/data/projects/rosabon.ts)).
- **PDF report export** (jsPDF is already a dependency) to complement the current text/print export.
