import { TestCase } from "@/types/test-case";
import { FunctionalModule, TestModuleType } from "@/types/functional-module";

// Categories whose names match these keywords are treated as non-functional
// (Non-Functional Testing page); everything else is functional. Single source
// of truth shared by the PRD import and the testing pages.
export const NON_FUNCTIONAL_PATTERN =
  /security|performance|load|stress|compatib|usability|accessib|mobile|reliab|scalab|penetration/i;

export function isNonFunctionalName(name: string): boolean {
  return NON_FUNCTIONAL_PATTERN.test(name);
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Derive display-only modules of a given type from the `module` names present on
// existing test cases that aren't already covered by a configured module. This
// surfaces previously-imported test cases on the Functional / Non-Functional
// pages WITHOUT mutating any stored data (nothing is created or removed).
export function deriveModulesFromTestCases(
  testCases: TestCase[] | undefined,
  configured: FunctionalModule[],
  moduleType: TestModuleType,
  projectId: string,
): FunctionalModule[] {
  if (!testCases || testCases.length === 0) return [];
  const present = new Set(configured.map((m) => m.name.toLowerCase()));
  const wantNonFunctional = moduleType === "non-functional";
  const derived: FunctionalModule[] = [];
  const seen = new Set<string>();

  testCases.forEach((tc) => {
    const name = (tc.module || "").trim();
    if (!name) return;
    const key = name.toLowerCase();
    if (present.has(key) || seen.has(key)) return;
    // Only surface modules that belong to this page's discipline
    if (isNonFunctionalName(name) !== wantNonFunctional) return;
    seen.add(key);
    derived.push({
      id: `derived-${moduleType}-${slugify(name) || seen.size}`,
      projectId,
      moduleType,
      name,
      slug: slugify(name) || `module-${seen.size}`,
      order: configured.length + derived.length,
      isDefault: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });

  return derived;
}
