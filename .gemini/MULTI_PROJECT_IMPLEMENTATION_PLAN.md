# Multi-Project Testing Management Portal - Implementation Plan

## Overview

Transform the current single-project "Credit Bureau Testing App" into a **multi-project Testing Management Portal** that supports multiple project dashboards, each with its own testing checklist, objectives, environments, and metrics.

### Current State

- Single project: Credit Bureau Report Management Web App
- Hardcoded project information in components
- All data stored with single project context

### Target State

- **Project Hub**: Central landing page to select/create projects
- **Project Dashboards**: Individual testing dashboards per project
- **PRD Integration**: Ability to create test items based on PRD documents
- **First New Project**: Rosabon App / Wealth Management App (WMA)

---

## Phase 1: Foundation - Project Entity & Navigation (Priority: HIGH)

### 1.1 Create Project Types

**File**: `src/types/project.ts`

```typescript
export interface Project {
  id: string;
  name: string;
  shortCode: string; // e.g., "CBP", "WMA"
  description: string;
  techStack: string[];
  targetUsers: string[];
  documentVersion: string;
  status: "active" | "completed" | "on-hold";
  phase: "planning" | "in-progress" | "testing" | "completed";
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectConfig {
  modules: TestModule[];
  objectives: TestObjective[];
  environments: TestEnvironment[];
  qualityGates: TestObjective[];
}
```

### 1.2 Update Data Types

**File**: `src/types/test-case.ts`

- Add `projectId: string` to all relevant interfaces:
  - `TestCase`
  - `TestModule`
  - `Defect`
  - `SuccessMetric`
  - `SignOff`
  - `TestEnvironment`
  - `TestObjective`

### 1.3 Create Project Storage Functions

**File**: `src/lib/projectStorage.ts`

- `saveProject(project: Project)`
- `loadProjects(): Project[]`
- `getProject(projectId: string): Project`
- `deleteProject(projectId: string)`
- Extend cloud storage to be project-aware

### 1.4 Seed Data for Existing Project

**File**: `src/data/projects/credit-bureau.ts`

```typescript
export const creditBureauProject: Project = {
  id: "credit-bureau-portal",
  name: "Credit Bureau Report Management Web App",
  shortCode: "CBP",
  description: "Testing dashboard for Credit Bureau Report Management",
  techStack: ["Next.js", "TypeScript", "PostgreSQL/MongoDB", "Node.js/Django"],
  targetUsers: [
    "Credit Underwriters",
    "Analysts",
    "Operations Team",
    "Sales Team Leads",
  ],
  documentVersion: "1.0",
  status: "active",
  phase: "in-progress",
  createdAt: new Date(),
  updatedAt: new Date(),
};
```

### 1.5 Seed Data for New Project

**File**: `src/data/projects/wealth-management.ts`

```typescript
export const wealthManagementProject: Project = {
  id: "wealth-management-app",
  name: "Rosabon Wealth Management App",
  shortCode: "WMA",
  description: "Testing dashboard for Rosabon Wealth Management Application",
  techStack: ["React Native", "Node.js", "PostgreSQL"],
  targetUsers: ["Investors", "Financial Advisors", "Admin Staff"],
  documentVersion: "1.0",
  status: "active",
  phase: "planning",
  createdAt: new Date(),
  updatedAt: new Date(),
};
```

---

## Phase 2: Route Restructuring (Priority: HIGH)

### 2.1 New Route Structure

```
src/app/
├── page.tsx                          # Project Hub (list all projects)
├── projects/
│   ├── [projectId]/
│   │   ├── page.tsx                  # Project Overview Dashboard
│   │   ├── functional-testing/
│   │   │   └── page.tsx
│   │   ├── non-functional-testing/
│   │   │   └── page.tsx
│   │   ├── defects/
│   │   │   └── page.tsx
│   │   ├── metrics/
│   │   │   └── page.tsx
│   │   ├── reports/
│   │   │   └── page.tsx
│   │   └── settings/
│   │       └── page.tsx              # Project settings/PRD upload
├── new-project/
│   └── page.tsx                      # Create new project wizard
├── globals.css
└── layout.tsx
```

### 2.2 Create Project Hub (New Landing Page)

**File**: `src/app/page.tsx`

- Display all projects as cards
- Quick stats per project (test cases, pass rate, etc.)
- "Create New Project" button
- Search/filter projects
- Project status badges

### 2.3 Update Sidebar to be Project-Aware

**File**: `src/components/layout/Sidebar.tsx`

- Accept `projectId` prop
- Update navigation links to include project context
- Add project switcher dropdown
- Show current project name/badge

### 2.4 Update Layout Component

**File**: `src/components/layout/MainLayout.tsx`

- Pass project context to Sidebar
- Show breadcrumbs with project name
- Handle project-level header

---

## Phase 3: Component Updates (Priority: MEDIUM)

### 3.1 Update Testing Components

All components in `src/components/testing/` need to:

- Accept `projectId` as prop
- Filter/load data by project
- Save data with project context

**Components to update**:

- `ObjectivesCheckList.tsx`
- `TestEnvironmentSetup.tsx`
- `TestCaseTable.tsx`
- `TestCaseForm.tsx`
- `DefectTracker.tsx`
- `MetricsDashboard.tsx`
- `SignOffSection.tsx`
- `SessionManager.tsx`

### 3.2 Create Project Components

**New components**:

- `ProjectCard.tsx` - Individual project card for hub
- `ProjectForm.tsx` - Create/edit project form
- `ProjectSwitcher.tsx` - Dropdown to switch projects
- `ProjectHeader.tsx` - Header showing current project info
- `PRDUploader.tsx` - Upload PRD to auto-generate test items

---

## Phase 4: Project Context Provider (Priority: MEDIUM)

### 4.1 Create Project Context

**File**: `src/context/ProjectContext.tsx`

```typescript
interface ProjectContextType {
  currentProject: Project | null;
  projects: Project[];
  setCurrentProject: (project: Project) => void;
  refreshProjects: () => Promise<void>;
}
```

### 4.2 Update App Layout

Wrap application with `ProjectProvider`

---

## Phase 5: Database Schema Updates (Priority: MEDIUM)

### 5.1 Supabase Schema Changes

```sql
-- Create projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  short_code TEXT NOT NULL UNIQUE,
  description TEXT,
  tech_stack TEXT[],
  target_users TEXT[],
  document_version TEXT DEFAULT '1.0',
  status TEXT DEFAULT 'active',
  phase TEXT DEFAULT 'planning',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add project_id to test_data table
ALTER TABLE test_data ADD COLUMN project_id UUID REFERENCES projects(id);

-- Add project_id to users table (optional - for project-based access)
ALTER TABLE users ADD COLUMN default_project_id UUID REFERENCES projects(id);
```

---

## Phase 6: PRD Integration (Priority: LOW)

### 6.1 PRD Parser Service

**File**: `src/lib/prdParser.ts`

- Parse uploaded PRD document (PDF/DOCX/MD)
- Extract test scenarios and requirements
- Generate initial test case templates

### 6.2 PRD Upload Component

**File**: `src/components/project/PRDUploader.tsx`

- File upload interface
- Preview extracted test items
- Confirm and create test cases

---

## Implementation Order

### Sprint 1 (Week 1-2): Foundation ✅ COMPLETED

1. ✅ Create `Project` types - `src/types/project.ts`
2. ✅ Create seed data for both projects:
   - `src/data/projects/credit-bureau.ts`
   - `src/data/projects/wealth-management.ts`
   - `src/data/projects/index.ts`
3. ✅ Update data types with `projectId` - `src/types/test-case.ts`
4. ✅ Create project storage functions - `src/lib/projectStorage.ts`
5. ✅ Create Project Context - `src/context/ProjectContext.tsx`
6. ✅ Update root layout with ProjectProvider - `src/app/layout.tsx`

### Sprint 2 (Week 2-3): Routes & Navigation ✅ COMPLETED

1. ✅ Create Project Hub page (update `src/app/page.tsx`)
2. ✅ Create project routes (`src/app/projects/[projectId]/...`)
3. ✅ Update Sidebar for multi-project support
4. ✅ Create project switching logic
5. ✅ Create ProjectCard component

### Sprint 3 (Week 3-4): Component Migration ✅ COMPLETED

1. ✅ Update all testing components with projectId prop
2. ✅ Create ProjectHeader component
3. ✅ Test data isolation between projects
4. ✅ Migrate existing data to use projectId

### Sprint 4 (Week 4-5): Polish & PRD ✅ COMPLETED

1. ✅ Project Settings page (`/projects/[projectId]/settings`) - Full settings management with color picker, tech stack, users
2. ✅ New Project Wizard (`/new-project`) - 4-step wizard with preview
3. ✅ Sidebar updated with Settings navigation link
4. ✅ ProjectContext extended with createProject, updateProject, deleteProject
5. ✅ Database schema updates (Supabase) - Created migration file with relational project structure
6. ✅ PRD AI-powered parsing integration - PRDUploader component with analysis logic
7. ✅ UI/UX polish - Animations, glassmorphism, modern design
8. ✅ Build verification - All routes compile successfully

---

## Migration Strategy

### For Existing Data

1. Create "Credit Bureau Portal" project entry
2. Associate all existing test data with this project ID
3. Update storage keys to include project context

### Backward Compatibility

- Existing URLs can redirect to `/projects/credit-bureau-portal/...`
- Existing localStorage data migrated on first load

---

## Files to Create

| File                                         | Purpose                  |
| -------------------------------------------- | ------------------------ |
| `src/types/project.ts`                       | Project type definitions |
| `src/lib/projectStorage.ts`                  | Project CRUD operations  |
| `src/context/ProjectContext.tsx`             | Project state management |
| `src/data/projects/credit-bureau.ts`         | CBP seed data            |
| `src/data/projects/wealth-management.ts`     | WMA seed data            |
| `src/app/page.tsx`                           | Project Hub (update)     |
| `src/app/projects/[projectId]/page.tsx`      | Project Dashboard        |
| `src/app/new-project/page.tsx`               | Create project wizard    |
| `src/components/project/ProjectCard.tsx`     | Project card component   |
| `src/components/project/ProjectForm.tsx`     | Create/edit form         |
| `src/components/project/ProjectSwitcher.tsx` | Project dropdown         |
| `src/components/project/ProjectHeader.tsx`   | Project header           |

---

## Next Steps

To get started, we should:

1. **Create the Project type** and storage functions
2. **Create seed data** for Credit Bureau and WMA projects
3. **Build the Project Hub** as the new landing page
4. **Update the route structure** to `/projects/[projectId]/...`
5. **Update the Sidebar** to be project-aware

Would you like me to start implementing Phase 1?
