# Rosabon QA Framework — App Implementation Strategy

**Turning the App Testing Dashboard into the Rosabon QA CMS & Reporting Platform**

Prepared by: QA Engineering · Date: 09 July 2026 · Source framework: *Comprehensive QA & Testing Framework Strategy for Rosabon App (26 May 2026)*

---

## 1. Purpose

This document maps the existing **App Testing Dashboard** (a Next.js 16 + Supabase multi-project QA dashboard) onto the **Rosabon QA & Testing Framework Strategy**, identifies the gaps and parallels between the two, and lays out a phased plan to evolve the app into the single **Content Management System (CMS)** through which Rosabon authors, manages, governs and *publishes* all QA content and reports going forward.

The good news: the app is not a blank slate. It is already a risk-agnostic, multi-project QA dashboard with test cases, defects, metrics, sign-offs, cloud sync, PDF/Excel export and public share links — and a **"Rosabon Wealth Management App"** project is already seeded ([src/data/projects/wealth-management.ts](src/data/projects/wealth-management.ts)). The work is to make it **fintech-aware, risk-based, lifecycle-driven and report-centric** to match the framework.

---

## 2. Fit Assessment — Parallels (what already exists)

The framework and the current app already share a large surface. These are direct reuse points, not rebuilds.

| Framework concept (§ in strategy doc) | Already in the app | Where |
|---|---|---|
| Rosabon App as a testable product (§4–5) | Multi-project model; **Rosabon Wealth Management** project seeded | [types/project.ts](src/types/project.ts), [data/projects/wealth-management.ts](src/data/projects/wealth-management.ts) |
| Functional Testing Strategy (§10) | Functional testing modules + editable default scenarios | [types/functional-module.ts](src/types/functional-module.ts), [components/testing/FunctionalModulesManager.tsx](src/components/testing/FunctionalModulesManager.tsx) |
| Security / Performance / Usability / Compatibility (§13–15) | Non-functional modules with those exact defaults | `DEFAULT_NON_FUNCTIONAL_MODULES` in [types/functional-module.ts](src/types/functional-module.ts) |
| Test case design & execution (§9) | `TestCase` with scenario / steps / expected / actual / status (pass/fail/pending/blocked) | [types/test-case.ts](src/types/test-case.ts), [components/testing/TestCaseTable.tsx](src/components/testing/TestCaseTable.tsx) |
| Defect Management (§22) | `Defect` with severity (critical→low), status lifecycle (open→closed), assignee, resolution date | [types/test-case.ts](src/types/test-case.ts), [components/testing/DefectTracker.tsx](src/components/testing/DefectTracker.tsx) |
| QA Metrics & Reporting (§25) | Executive dashboard aggregating pass rate, defects, project health | [app/(dashboard)/executive/page.tsx](src/app/(dashboard)/executive/page.tsx), [lib/aggregateStats.ts](src/lib/aggregateStats.ts) |
| Success / KPI validation (§6, §25) | `SuccessMetric` (metric / target / actual / status) | [types/test-case.ts](src/types/test-case.ts), [components/testing/MetricsDashboard.tsx](src/components/testing/MetricsDashboard.tsx) |
| QA Objectives (§6) | `TestObjective` checklist per project | [components/testing/ObjectivesCheckList.tsx](src/components/testing/ObjectivesCheckList.tsx) |
| Environment Management (§21) | `TestEnvironment` (component / details / status) | [components/testing/TestEnvironmentSetup.tsx](src/components/testing/TestEnvironmentSetup.tsx) |
| UAT & Release Sign-off (§20, §24) | `SignOff` (role / name / signature / date) | [components/testing/SignOffSection.tsx](src/components/testing/SignOffSection.tsx) |
| QA Reports export (§25, §26) | PDF (jsPDF) + Excel (xlsx) export | [lib/export.ts](src/lib/export.ts), [components/export/ExportButtons.tsx](src/components/export/ExportButtons.tsx) |
| Stakeholder distribution / audit visibility (§26, §28) | Public share links + read-only public project view | [components/project/ShareableLink.tsx](src/components/project/ShareableLink.tsx), [app/public/](src/app/public/) |
| Documentation from requirements (§26) | AI PRD analysis endpoint | [app/api/analyze-prd/route.ts](src/app/api/analyze-prd/route.ts) |
| Compliance-grade persistence (§28) | Supabase cloud sync + localStorage fallback, per-project data | [lib/cloudStorage.ts](src/lib/cloudStorage.ts) |
| Governance access (§8) | Auth context + "Executive Access" login | [context/AuthContext.tsx](src/context/AuthContext.tsx), [app/login/](src/app/login/) |

**Verdict:** roughly 60% of the framework's *nouns* already have a home in the data model. What is missing is the fintech-specific *rigor* (risk weighting, financial assertions, transaction integrity), the *lifecycle/time* dimension (test runs, regression cycles, releases), and the *report-product* layer that makes it a true CMS.

---

## 3. Gap Analysis (what must be built)

Ordered by framework priority (risk-based first). "Impact" = how central it is to the framework's intent.

| # | Gap | Framework driver | Impact | Effort |
|---|---|---|---|---|
| **G1** | **No risk classification.** Modules/test cases have no `riskLevel` or `businessImpact`. The framework is explicitly *risk-based* (§7 Risk Classification Matrix). | §7, §27 | **Critical** | S |
| **G2** | **No financial-assertion testing.** Test cases store free-text expected/actual only. Fintech needs numeric expected vs actual amount, currency, tolerance/rounding checks (§2.1, §16, §17). | §2.1, §16, §17, §18 | **Critical** | M |
| **G3** | **No test runs / execution cycles.** A `TestCase` holds only its *latest* status. There is no run history, no regression cycle, no "execution session" over time — so regression-before-every-release (§11) and trend metrics (§25) are impossible. | §9, §11, §25 | **Critical** | L |
| **G4** | **No release / build entity or release-readiness gate.** `SignOff` is generic and not tied to a release. The Mandatory Release Checklist (§24) cannot be enforced or recorded. | §24, §20 | **High** | M |
| **G5** | **Test-type taxonomy too thin.** Only functional vs non-functional. Framework treats **API, Regression, Security, Performance, Mobile** as first-class disciplines (§11–15). | §11–15 | **High** | S |
| **G6** | **No traceability matrix.** No requirement/user-story entity; test cases don't link to requirements. Audit readiness & coverage reporting (§28, §26) need this. PRD analysis output isn't persisted as requirements. | §26, §28 | **High** | M |
| **G7** | **Metrics are manual, not computed & not time-series.** `SuccessMetric` is hand-typed text. Framework wants computed **defect leakage, defect resolution time, crash frequency, release stability, production incidents** with trends (§25). | §25 | **High** | M |
| **G8** | **No evidence / audit trail.** Defects can't attach screenshots/logs (§22 requires them); no change-history log for compliance (§28). | §22, §28 | **Medium** | M |
| **G9** | **Environments untyped.** No Dev / Staging-UAT / Production classification (§21). | §21 | **Medium** | S |
| **G10** | **RBAC is single-tier.** Only "Executive Access." Framework defines QA Engineer / Developer / Product / Management roles with distinct responsibilities (§8). | §8 | **Medium** | M |
| **G11** | **No automation/CI ingestion.** No API to receive Playwright/Maestro/Postman/GitHub Actions results (§23). | §23 | **Low (later)** | L |
| **G12** | **No monitoring hooks.** Crash frequency / production incidents (Crashlytics, Sentry) aren't ingested (§15, §25). | §15, §25 | **Low (later)** | M |

Effort: S = small (days), M = medium (1–2 weeks), L = large (multi-week).

---

## 4. Target Data-Model Changes

The app persists JSON blobs per `data_type` per project in Supabase `test_data` ([lib/cloudStorage.ts](src/lib/cloudStorage.ts)), with localStorage fallback. That schema-light design means **most changes are additive TypeScript fields + new `data_type` keys — no destructive migration.** Existing records simply lack the new optional fields.

### 4.1 Add risk to modules & test cases (G1)

```ts
// types/test-case.ts
export type RiskLevel = "critical" | "high" | "medium" | "low";

export interface TestCase {
  // ...existing
  riskLevel?: RiskLevel;        // inherited from module, overridable
  businessImpact?: string;      // e.g. "Direct financial movement"
  testType?: TestDiscipline;    // G5
  requirementIds?: string[];    // G6 traceability
}

// types/functional-module.ts
export interface TestingModule {
  // ...existing
  riskLevel?: RiskLevel;        // default risk for the module
  businessImpact?: string;
}
```

Seed the Rosabon risk matrix (§7) directly as module defaults: Wallet Transactions → Critical, Authentication → Critical, Investment Returns → Critical, Loan Calculations → Critical, API Integrations → High, Transaction History → High, Notifications → Medium, Profile → Medium, UI Styling → Low.

### 4.2 Financial assertion fields (G2)

```ts
export interface FinancialAssertion {
  expectedAmount?: number;
  actualAmount?: number;
  currency?: string;            // default "NGN"
  tolerance?: number;           // acceptable rounding delta
  calcType?: "interest" | "roi" | "maturity" | "balance" | "fee" | "penalty";
  passed?: boolean;             // computed: |expected-actual| <= tolerance
}
// attach optional `financial?: FinancialAssertion` to TestCase
```

Drives the Wallet (§16) and Wealth/Investment (§17–18) frameworks, and makes "balances must remain accurate / every transaction traceable" (§16) testable and reportable.

### 4.3 Test discipline taxonomy (G5)

```ts
export type TestDiscipline =
  | "functional" | "regression" | "api"
  | "security" | "performance" | "mobile" | "uat";
```
Add as a filterable dimension on modules/test cases; keeps the existing functional/non-functional tabs but lets a case be tagged (e.g. a Wallet case that is both `functional` and `regression`).

### 4.4 Test runs / regression cycles (G3) — new entity

```ts
export interface TestRun {
  id: string;
  projectId: string;
  name: string;                 // "Release 2.4 Regression", "Sprint 12 Smoke"
  type: "smoke" | "regression" | "full" | "uat";
  environment: EnvironmentType; // dev | staging | production
  startedAt: Date; completedAt?: Date;
  results: TestRunResult[];      // status per testCaseId at run time
  passRate: number;              // computed snapshot
}
export interface TestRunResult {
  testCaseId: string;
  status: TestStatus;            // pass | fail | pending | blocked
  actualResult?: string;
  defectIds?: string[];
  executedBy?: string;
}
```
This is the single most important addition: it introduces **time**, enabling regression history, trend charts, defect leakage and release stability.

### 4.5 Release & release-readiness (G4) — new entity

```ts
export interface Release {
  id: string; projectId: string;
  version: string;               // "2.4.0"
  targetDate: Date; status: "planned" | "in-testing" | "signed-off" | "released" | "rolled-back";
  checklist: ReleaseChecklistItem[];   // seeded from §24 Mandatory Release Checklist
  signOffs: SignOff[];           // reuse existing SignOff, now scoped to a release
  linkedRunIds: string[];        // regression/smoke runs that gate this release
}
export interface ReleaseChecklistItem { label: string; done: boolean; evidenceUrl?: string; }
```
Seed checklist from §24: smoke passed · critical defects resolved · regression complete · wallet txns validated · investment calcs verified · API responses validated · UAT sign-off · release approval.

### 4.6 Requirements & traceability (G6)

```ts
export interface Requirement {
  id: string; projectId: string;
  refId: string;                 // "REQ-WALLET-01"
  title: string; source: "prd" | "manual" | "ai";
  module?: string; riskLevel?: RiskLevel;
}
```
Persist `analyze-prd` output here so [app/api/analyze-prd/route.ts](src/app/api/analyze-prd/route.ts) feeds the traceability matrix instead of being throwaway.

### 4.7 Evidence, audit log, typed environments (G8, G9)

- Add `attachments?: {name; url; type}[]` to `Defect` and `TestRunResult` (Supabase Storage bucket).
- Add an append-only `audit_log` data_type: `{ actor, action, entity, entityId, before, after, at }` written on every save.
- Extend `TestEnvironment` with `type: "dev" | "staging" | "production"`.

### 4.8 New cloud storage keys

Extend `STORAGE_KEYS` and add save/load pairs in [lib/cloudStorage.ts](src/lib/cloudStorage.ts) for: `TEST_RUNS`, `RELEASES`, `REQUIREMENTS`, `AUDIT_LOG`. Same `saveToCloud`/`loadFromCloud` pattern — no new tables strictly required, though a dedicated `test_runs` / `releases` table is recommended once volume grows.

---

## 5. Reporting & CMS Layer

"Used going forward for reporting as a CMS interface" is the core outcome. Today the app *exports* the current state; the CMS goal is to **author, version, govern and publish reports** as first-class content.

### 5.1 The five framework report types (§25)
Build a **Report Builder** (`/projects/[projectId]/reports` — extend the existing [reports/page.tsx](src/app/(dashboard)/projects/[projectId]/reports/page.tsx)) that generates each named report from live data:

1. **Test Execution Report** — from `TestRun` results (pass/fail/blocked by module & risk).
2. **Defect Report** — from `Defect` (by severity, status, ageing, resolution time).
3. **Regression Report** — diff between two `TestRun`s of type regression.
4. **Release Readiness Report** — `Release` checklist + gating run status + sign-offs.
5. **Risk Assessment Report** — coverage & pass rate weighted by `riskLevel` (surfaces untested Critical modules).

Each report: previewable in-app → export PDF/Excel (reuse [lib/export.ts](src/lib/export.ts)) → **publish** to a versioned, shareable public URL (reuse [ShareableLink.tsx](src/components/project/ShareableLink.tsx) + [app/public/](src/app/public/)).

### 5.2 CMS characteristics to add
- **Versioned, published reports** — snapshot a report at a point in time (immutable), list historical versions (audit readiness §28).
- **Risk-weighted executive view** — extend [aggregateStats.ts](src/lib/aggregateStats.ts) / [executive/page.tsx](src/app/(dashboard)/executive/page.tsx) so global KPIs weight by risk and flag "Critical module, <100% coverage."
- **Computed metric tiles** (G7): pass rate ✓, defect leakage (prod defects ÷ total), mean defect resolution time (from `resolutionDate − createdAt`, already stored), release stability (rollback rate), crash frequency (once G12 lands). Use the **dataviz** design system for any new charts.
- **Role-based publishing** (G10): QA Engineer authors; Management approves/signs; Product runs UAT; public/stakeholder gets read-only published reports.

---

## 6. Phased Implementation Roadmap

Aligned to the framework's own roadmap (§30) and immediate action plan (§31).

### Phase 1 — Discovery & Foundation (Framework §30 P1–P2) · ~1–2 wks
- Seed a canonical **Rosabon App** project (or extend the existing WMA project) with the framework's modules: Wallet, Wealth Management, RWIN, REAP, RTN, Loan (upcoming), Authentication, API, Notifications, Profile.
- **G1 risk classification** — add `riskLevel`/`businessImpact`, seed the §7 matrix. (Highest ROI, smallest effort.)
- **G5 discipline taxonomy** and **G9 typed environments** (Dev/Staging/Prod).
- Deliverable: every module carries a risk level; risk visible in tables and the executive view.

### Phase 2 — Structured Testing Operations (Framework §30 P3) · ~2–4 wks
- **G3 Test Runs / regression cycles** — the pivotal addition; unlocks history & trends.
- **G2 financial assertions** — wire into Wallet & Investment modules; add computed pass/fail on tolerance.
- **G6 requirements + traceability**; persist `analyze-prd` output.
- **G8 evidence attachments + audit log.**
- Deliverable: a full regression run can be executed, recorded, and compared release-over-release; financial calcs validated numerically.

### Phase 3 — Release Governance & Reporting CMS (Framework §24, §25) · ~2–3 wks
- **G4 Release entity + Mandatory Release Checklist gating** tied to sign-offs.
- **Report Builder** with the five report types + versioned publishing (§5 above).
- **G7 computed & time-series metrics**; risk-weighted executive dashboard.
- **G10 RBAC** roles (QA / Dev / Product / Management).
- Deliverable: no release marked "signed-off" until its checklist + gating runs pass; stakeholders consume published, versioned reports via CMS links.

### Phase 4 — Automation & Optimization (Framework §23, §30 P4) · ongoing
- **G11 ingestion API** — a Next.js route accepting Playwright/Maestro/Postman/GitHub Actions results into `TestRun`s.
- **G12 monitoring hooks** — Sentry/Crashlytics webhooks → crash frequency & production-incident metrics.
- CI/CD gate: pipeline calls the release-readiness API before deploy.

---

## 7. Immediate Actions (this sprint)

1. **Seed the Rosabon module + risk matrix** — pure data, no schema change; lands the risk-based model (§7) immediately. Edit [data/projects/](src/data/projects/) and the `DEFAULT_*_MODULES` seeds.
2. **Add `riskLevel` / `businessImpact` fields** (G1) to `TestingModule` and `TestCase`, surface a risk badge in [TestCaseTable.tsx](src/components/testing/TestCaseTable.tsx) and the executive cards.
3. **Add the Release-Readiness checklist** (§24) as a static checklist component on the reports page — even before the full `Release` entity, it operationalizes the release gate.
4. **Rename/skin** for Rosabon (the app self-brands as "TestPortal", built for "credit bureau") so it reads as the Rosabon QA CMS.

These four are low-risk, high-signal, and demonstrate the framework taking hold before the larger Phase 2–3 entities land.

---

## 8. Risks & Notes on the Approach

- **Storage model scales additively but is blob-based.** New optional fields are safe; but `TestRun`/`Release`/`AUDIT_LOG` grow unbounded inside single JSON blobs. Recommend promoting these to dedicated Supabase tables (with RLS) rather than `test_data` rows once Phase 2 begins — better for querying trends and for compliance/audit retention (§28).
- **RBAC before external sharing widens.** Public share links are currently unauthenticated; before publishing financial reports as CMS content, gate publishing behind roles (G10) and confirm no sensitive customer data leaks into public snapshots.
- **Financial accuracy is the crown jewel (§2.1).** G2 (numeric assertions) should not be deferred — it is what distinguishes a fintech QA CMS from a generic test tracker.
- **Keep the existing multi-project design.** Do not hard-code to Rosabon; the framework benefits from Rosabon-as-a-project so Wallet/Wealth/Loan can be separate projects or modules and the executive view aggregates across them.

---

## 9. Summary

| | |
|---|---|
| **Already fits** | Multi-project QA model, functional/non-functional modules, test cases, defects (severity+lifecycle), sign-offs, metrics, executive dashboard, PDF/Excel export, public sharing, cloud sync — a Rosabon project is already seeded. |
| **Must build (critical)** | Risk classification (G1), financial assertions (G2), test runs/regression cycles (G3), release-readiness gating (G4). |
| **Must build (high)** | Discipline taxonomy (G5), traceability (G6), computed/time-series metrics (G7). |
| **CMS outcome** | Report Builder producing the five framework reports as versioned, role-governed, publishable content — the app becomes Rosabon's QA reporting CMS, not just a tracker. |
| **Sequencing** | Seed risk model now → runs & financial assertions → release governance & report CMS → automation/monitoring ingestion. |

The current application is a strong, ~60%-aligned foundation. The transformation is **evolutionary, not a rewrite**: additive data-model fields, four new entities (TestRun, Release, Requirement, AuditLog), and a reporting/CMS layer built on the export and public-sharing plumbing that already exists.
