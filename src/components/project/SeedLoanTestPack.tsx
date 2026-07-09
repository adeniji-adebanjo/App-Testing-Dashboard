"use client";

import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Landmark, Check, Loader2 } from "lucide-react";
import { useTestCases, useUpdateTestCases } from "@/hooks/useTestData";
import { TestCase } from "@/types/test-case";
import { ROSABON_LOAN_TEST_CASES } from "@/data/loans/rosabonLoanTestPack";

const key = (t: { testCaseId: string; module: string }) =>
  `${t.testCaseId}::${t.module}`;

export default function SeedLoanTestPack({ projectId }: { projectId: string }) {
  const { data: existing } = useTestCases(projectId);
  const { mutate, isPending } = useUpdateTestCases(projectId);
  const [seededCount, setSeededCount] = useState<number | null>(null);

  const alreadyPresent = useMemo(() => {
    const present = new Set((existing || []).map(key));
    return ROSABON_LOAN_TEST_CASES.filter((t) => present.has(key(t))).length;
  }, [existing]);

  const remaining = ROSABON_LOAN_TEST_CASES.length - alreadyPresent;

  const seed = () => {
    const current = existing || [];
    const present = new Set(current.map(key));
    const additions: TestCase[] = ROSABON_LOAN_TEST_CASES.filter(
      (t) => !present.has(key(t)),
    ).map((t) => ({ ...t, projectId }));
    // Non-destructive: append only the cases not already present
    mutate([...current, ...additions], {
      onSuccess: () => setSeededCount(additions.length),
    });
  };

  return (
    <Card className="border-none shadow-sm bg-white/60 backdrop-blur-sm overflow-hidden">
      <CardHeader className="border-b border-gray-100/50 bg-gray-50/30 py-4">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <Landmark size={16} className="text-primary" />
          Loan Test Pack
        </CardTitle>
        <CardDescription className="text-xs">
          Rosabon Loans QA pack — {ROSABON_LOAN_TEST_CASES.length} cases from the
          Loans PRD (risk-classified)
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4 space-y-3">
        <p className="text-[11px] text-gray-500">
          {alreadyPresent > 0
            ? `${alreadyPresent} of ${ROSABON_LOAN_TEST_CASES.length} already in this project.`
            : "Adds the full loan test suite to this project. Existing cases are kept (merge, no overwrite)."}
        </p>
        <Button
          onClick={seed}
          disabled={isPending || remaining === 0}
          className="w-full gap-2"
        >
          {isPending ? (
            <Loader2 size={14} className="animate-spin" />
          ) : seededCount !== null ? (
            <Check size={14} />
          ) : (
            <Landmark size={14} />
          )}
          {isPending
            ? "Seeding…"
            : seededCount !== null
              ? `Seeded ${seededCount} case${seededCount === 1 ? "" : "s"}`
              : remaining === 0
                ? "All 175 cases loaded"
                : `Seed ${remaining} Loan Test Cases`}
        </Button>
      </CardContent>
    </Card>
  );
}
