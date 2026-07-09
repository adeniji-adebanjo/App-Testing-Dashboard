// Rosabon QA Framework §8 - Quality Assurance Governance Structure.
// Client-side role/permission model that governs who can perform high-impact QA
// actions. NOTE: this is UI-level governance for workflow clarity; server-side
// enforcement (Supabase RLS) is the security-hardening follow-up.

export type Role =
  | "management"
  | "qa"
  | "product"
  | "developer"
  | "viewer";

export type Permission =
  | "test:author" // create/edit test cases & modules
  | "run:execute" // create/complete test runs
  | "defect:manage" // log/resolve defects
  | "requirement:manage" // author requirements & traceability
  | "release:plan" // create releases, attest manual checklist items
  | "release:signoff" // sign off / approve / mark released
  | "report:publish"; // publish versioned report snapshots

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  management: [
    "test:author",
    "run:execute",
    "defect:manage",
    "requirement:manage",
    "release:plan",
    "release:signoff",
    "report:publish",
  ],
  qa: [
    "test:author",
    "run:execute",
    "defect:manage",
    "requirement:manage",
    "release:plan",
    "report:publish",
  ],
  product: ["requirement:manage", "run:execute", "report:publish"],
  developer: ["defect:manage"],
  viewer: [],
};

export const ROLE_META: Record<
  Role,
  { label: string; description: string }
> = {
  management: {
    label: "Management",
    description: "Release approvals, sign-off and risk acceptance",
  },
  qa: {
    label: "QA Engineer",
    description: "Authoring, execution, defects and reporting",
  },
  product: {
    label: "Product / Business",
    description: "Requirements, UAT and business validation",
  },
  developer: {
    label: "Developer",
    description: "Defect resolution and technical support",
  },
  viewer: {
    label: "Viewer",
    description: "Read-only access to all QA content",
  },
};

export const ALL_ROLES: Role[] = [
  "management",
  "qa",
  "product",
  "developer",
  "viewer",
];

export function hasPermission(
  role: Role | undefined,
  permission: Permission,
): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role].includes(permission);
}
