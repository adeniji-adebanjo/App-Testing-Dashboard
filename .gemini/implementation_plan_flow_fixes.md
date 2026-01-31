# Implementation Plan: Flow-Breaks & Schema Fixes

**Created:** 2026-01-31
**Status:** In Progress
**Last Updated:** 2026-01-31T20:21

---

## Overview

This plan addresses schema inconsistencies, frontend/backend flow-breaks, and UX improvements identified in the testing dashboard application.

---

## Phase 1: SQL Schema Updates (Priority: HIGH)

### 1.1 Add `project_tabs` Table

**Status:** ✅ Complete

Create a dedicated relational table for project tabs instead of storing in JSONB blob.

```sql
CREATE TABLE IF NOT EXISTS public.project_tabs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  slug text NOT NULL,
  description text,
  icon text,
  "order" integer DEFAULT 0,
  is_default boolean DEFAULT false,
  ai_generated boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);
```

**Files modified:**

- `supabase/migrations/20260127_multi_project.sql` ✅

---

### 1.2 Add `icon` Column to Projects Table

**Status:** ✅ Complete

The frontend `Project` type includes `icon?: string` but SQL schema lacks this column.

```sql
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS icon text;
```

**Files modified:**

- `supabase/migrations/20260127_multi_project.sql` ✅

---

## Phase 2: Frontend Type/Schema Sync (Priority: HIGH)

### 2.1 Add "Archived" Status to Settings Dropdown

**Status:** ✅ Complete

The `ProjectStatus` type includes `"archived"` but the settings page dropdown only shows 3 options.

**Files modified:**

- `src/app/(dashboard)/projects/[projectId]/settings/page.tsx` ✅

---

### 2.2 Generate UUIDs Client-Side for New Projects

**Status:** ✅ Complete

Replace slug-based ID generation with proper UUIDs to match Supabase pattern.

**New approach:**

```typescript
const generateProjectId = (): string => {
  return crypto.randomUUID();
};
```

**Files modified:**

- `src/lib/projectStorage.ts` ✅

---

## Phase 3: UX Improvements (Priority: MEDIUM)

### 3.1 Add Short Code Character Counter

**Status:** ✅ Complete

Show remaining characters for the 5-character limit on short codes.

**Files modified:**

- `src/app/(dashboard)/projects/[projectId]/settings/page.tsx` ✅
- `src/app/(dashboard)/new-project/page.tsx` ✅

---

### 3.2 Remove Duplicate Delete Button

**Status:** ✅ Complete

Remove the "Delete Project" button from the header since it's already in the Danger Zone.

**Files modified:**

- `src/app/(dashboard)/projects/[projectId]/settings/page.tsx` ✅

---

### 3.3 Add Error Toast on Project Creation Failure

**Status:** ✅ Complete

Currently errors are only logged to console. Show user-facing inline error message.

**Files modified:**

- `src/app/(dashboard)/new-project/page.tsx` ✅

---

### 3.4 Add Auto-Save to Tab Manager (Optional)

**Status:** ⏳ Deferred

Add debounced auto-save for tab configuration changes. (Low priority, can be implemented later)

**Files to modify:**

- `src/components/project/ProjectTabsManager.tsx`

---

## Phase 4: Data Persistence Updates (Priority: MEDIUM)

### 4.1 Update projectStorage to Sync `icon` Field

**Status:** ✅ Complete

Ensure icon is included in project create/update operations.

**Files modified:**

- `src/lib/projectStorage.ts` (insert, update, and sync operations) ✅

---

## Execution Order

| Step | Task                                            | Phase | Priority | Status |
| ---- | ----------------------------------------------- | ----- | -------- | ------ |
| 1    | Update SQL migration (tabs table + icon column) | 1     | HIGH     | ✅     |
| 2    | Update projectStorage.ts UUID generation        | 2     | HIGH     | ✅     |
| 3    | Update projectStorage.ts to persist icon        | 4     | HIGH     | ✅     |
| 4    | Add "Archived" to settings dropdown             | 2     | MEDIUM   | ✅     |
| 5    | Add short code character counter                | 3     | LOW      | ✅     |
| 6    | Remove duplicate delete button                  | 3     | LOW      | ✅     |
| 7    | Add error message on creation failure           | 3     | LOW      | ✅     |
| 8    | Add auto-save to tab manager                    | 3     | LOW      | ⏳     |

---

## Notes

- **Ignored Issues:**
  - RLS policy permissiveness (Issue #6) - Intentional for single-user auth model
  - Global query without user filter (Issue #7) - Related to #6, intentional

- **Deferred:**
  - Full normalization of test_data JSONB to separate tables (major refactor)
  - Add `is_public` flag for public project pages
  - Auto-save for tab manager (low priority)

---

## Progress Tracking

- [x] Phase 1 Complete
- [x] Phase 2 Complete
- [x] Phase 3 Complete (except optional auto-save)
- [x] Phase 4 Complete
