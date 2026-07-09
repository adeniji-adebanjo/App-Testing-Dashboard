# Automation → Dashboard ingest

This folder is the bridge between an external test **runner** (Playwright web
E2E, Appium/mobile, …) and the Testing Dashboard. Automation results land as
`TestRun` cycles on a project and render through the existing Test Runs UI — no
schema changes required.

```
Runner  →  reporter (this folder)  →  POST /api/projects/:projectId/test-runs/ingest  →  TestRun in Supabase  →  UI
   tags spec with @CASE-ID              maps status → dashboard, one HTTP call            service-role write
```

The join key is `TestCase.testCaseId` (e.g. `WALT-001`). A manual case becomes
automated the moment a spec is tagged with its id.

## Server setup (this repo)

Add to `.env.local` (this repo's `.env*` files are gitignored):

| Var | Purpose |
| --- | --- |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only write key. **Never** exposed to the browser. Supabase → Project Settings → API → `service_role`. |
| `INGEST_TOKEN` | Shared secret the runner sends in the `x-ingest-token` header. Generate any long random string. |
| `INGEST_USER_ID` | *Optional.* Fallback `users.id` to attach the first run to if the project has no data yet. Usually unneeded — the route borrows a `user_id` from the project's existing rows. |

`NEXT_PUBLIC_SUPABASE_URL` is already set.

## The endpoint

`POST /api/projects/:projectId/test-runs/ingest`

Headers: `content-type: application/json`, `x-ingest-token: <INGEST_TOKEN>`

Body (`IngestPayload`, see [src/lib/ingest.ts](../src/lib/ingest.ts)):

```jsonc
{
  "name": "Release 2.4 Regression (CI #412)", // optional
  "type": "regression",                        // smoke | regression | full | uat
  "environment": "staging",                    // dev | staging | production
  "results": [
    { "testCaseId": "WALT-001", "status": "pass",  "module": "Wallet", "scenario": "Interest accrues" },
    { "testCaseId": "WALT-002", "status": "fail",  "notes": "Expected 105.00, got 104.98" }
  ]
}
```

`status` accepts dashboard values (`pass`/`fail`/`pending`/`blocked`) **or** raw
runner outcomes (`passed`/`failed`/`timedOut`/`skipped`/`interrupted`) — both are
normalized server-side. Response: `201` with `{ runId, total, passed, failed, pending, blocked, passRate }`.

### Smoke test

```bash
curl -X POST "http://localhost:3000/api/projects/<projectId>/test-runs/ingest" \
  -H "content-type: application/json" \
  -H "x-ingest-token: $INGEST_TOKEN" \
  -d '{"name":"manual smoke","type":"smoke","results":[{"testCaseId":"WALT-001","status":"pass"}]}'
```

Then open the project's Test Runs tab — the cycle appears at the top.

## Playwright (web E2E)

`dashboard-reporter.ts` is a **copy-paste reference for your system-under-test
repo** (the fintech web app), not for this dashboard. Drop it in and register it:

```ts
// playwright.config.ts (in the SUT repo)
reporter: [
  ["list"],
  ["./dashboard-reporter.ts", {
    ingestUrl: process.env.DASHBOARD_INGEST_URL,   // full URL incl. /api/projects/<id>/test-runs/ingest
    token: process.env.DASHBOARD_INGEST_TOKEN,
    runName: `CI #${process.env.GITHUB_RUN_NUMBER ?? "local"}`,
    runType: "regression",
    environment: "staging",
  }],
],
```

Tag each spec with the dashboard case id:

```ts
test("wallet interest accrues correctly", { tag: "@WALT-001" }, async ({ page }) => { ... });
```

Untagged specs are simply not reported (and logged as a count). The reporter
maps `passed→pass`, `failed`/`timedOut→fail`, `skipped→pending`,
`interrupted→blocked`, and posts one run when the suite finishes.

## Mobile (Appium / mobile runners)

Nothing about the dashboard side changes. Tag mobile cases the same way (they
carry `testType: "mobile"` in the dashboard), and have your mobile runner's
reporter build the **same** `IngestPayload` and POST to the **same** endpoint:

- **Appium + WebdriverIO** — write a small WDIO reporter (the WDIO reporter API
  exposes per-test pass/fail just like Playwright's) that accumulates
  `{ testCaseId, status }` rows and posts them in `onComplete`. Mirror
  `dashboard-reporter.ts`.
- **Any other mobile tool** — as long as it can emit `testCaseId` + `status` per
  test and make one HTTP call at the end, it plugs in unchanged.

Because the ingest contract is tool-agnostic, the dashboard never learns (or
cares) which runner produced a given `TestRun`.

## CI

Set `DASHBOARD_INGEST_URL` and `DASHBOARD_INGEST_TOKEN` as CI secrets in the SUT
repo, run the suite, and the reporter uploads on completion. A failed upload is
logged but never fails the test job.

## Hardening (before production)

- Rotate `INGEST_TOKEN`; consider per-project tokens.
- Rate-limit / size-limit the route.
- The runs blob grows unbounded — add pruning/retention if cycles are frequent.
