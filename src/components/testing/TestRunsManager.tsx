"use client";

import { useMemo, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  useTestRuns,
  useUpdateTestRuns,
  useTestCases,
  useEnvironments,
} from "@/hooks/useTestData";
import { useAuth } from "@/context/AuthContext";
import { appendAuditEntry } from "@/lib/cloudStorage";
import {
  TestRun,
  TestRunResult,
  TestRunType,
  TEST_RUN_TYPES,
  computeRunStats,
} from "@/types/test-run";
import { TestStatus, EnvironmentType } from "@/types/test-case";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import RiskBadge from "@/components/testing/RiskBadge";
import { cn, getStatusColor, formatDate } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  PlayCircle,
  Plus,
  CheckCircle2,
  ArrowLeft,
  History,
  FlaskConical,
  Lock,
} from "lucide-react";

const ENV_OPTIONS: { value: EnvironmentType; label: string }[] = [
  { value: "dev", label: "Development" },
  { value: "staging", label: "Staging / UAT" },
  { value: "production", label: "Production" },
];

function nowIso() {
  return new Date().toISOString();
}

export default function TestRunsManager() {
  const { projectId } = useParams();
  const id = projectId as string;
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: runs, isLoading: runsLoading } = useTestRuns(id);
  const { data: testCases, isLoading: casesLoading } = useTestCases(id);
  const { data: environments } = useEnvironments(id);
  const updateRuns = useUpdateTestRuns(id);

  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState<{
    name: string;
    type: TestRunType;
    environment: EnvironmentType;
  }>({ name: "", type: "regression", environment: "staging" });

  const isLoading = runsLoading || casesLoading;
  const allRuns = useMemo(
    () =>
      [...(runs || [])].sort(
        (a, b) =>
          new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
      ),
    [runs],
  );
  const selectedRun = allRuns.find((r) => r.id === selectedRunId) || null;

  const actor = user?.email || "anonymous";

  const logAudit = useCallback(
    async (action: string, entityId: string, summary: string) => {
      await appendAuditEntry(
        {
          id: crypto.randomUUID(),
          projectId: id,
          actor,
          action,
          entity: "TestRun",
          entityId,
          summary,
          at: nowIso(),
        },
        id,
      );
      queryClient.invalidateQueries({ queryKey: ["auditLog", id] });
    },
    [actor, id, queryClient],
  );

  const persist = useCallback(
    (next: TestRun[]) => updateRuns.mutate(next),
    [updateRuns],
  );

  const handleCreateRun = useCallback(async () => {
    const cases = testCases || [];
    const results: TestRunResult[] = cases.map((tc) => ({
      caseKey: tc.id,
      testCaseId: tc.testCaseId,
      module: tc.module,
      scenario: tc.scenario,
      riskLevel: tc.riskLevel,
      status: "pending" as TestStatus,
    }));
    const stats = computeRunStats(results);
    const newRun: TestRun = {
      id: crypto.randomUUID(),
      projectId: id,
      name:
        form.name.trim() ||
        `${TEST_RUN_TYPES.find((t) => t.value === form.type)?.label} run`,
      type: form.type,
      environment: form.environment,
      status: "in-progress",
      startedAt: nowIso(),
      results,
      ...stats,
    };
    persist([newRun, ...(runs || [])]);
    await logAudit(
      "test-run.created",
      newRun.id,
      `Started ${newRun.type} run "${newRun.name}" on ${newRun.environment} with ${results.length} cases`,
    );
    setCreateOpen(false);
    setForm({ name: "", type: "regression", environment: "staging" });
    setSelectedRunId(newRun.id);
  }, [testCases, id, form, runs, persist, logAudit]);

  const updateResultStatus = useCallback(
    (runId: string, caseKey: string, status: TestStatus) => {
      const next = (runs || []).map((run) => {
        if (run.id !== runId || run.status === "completed") return run;
        const results = run.results.map((r) =>
          r.caseKey === caseKey ? { ...r, status } : r,
        );
        return { ...run, results, ...computeRunStats(results) };
      });
      persist(next);
    },
    [runs, persist],
  );

  const completeRun = useCallback(
    async (run: TestRun) => {
      const next = (runs || []).map((r) =>
        r.id === run.id
          ? { ...r, status: "completed" as const, completedAt: nowIso() }
          : r,
      );
      persist(next);
      await logAudit(
        "test-run.completed",
        run.id,
        `Completed "${run.name}" — ${run.passRate}% pass (${run.passed}/${run.total}), ${run.failed} failed`,
      );
    },
    [runs, persist, logAudit],
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  // ---- Run detail view ----
  if (selectedRun) {
    const grouped = selectedRun.results.reduce<Record<string, TestRunResult[]>>(
      (acc, r) => {
        (acc[r.module] = acc[r.module] || []).push(r);
        return acc;
      },
      {},
    );
    const isLocked = selectedRun.status === "completed";

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <button
              onClick={() => setSelectedRunId(null)}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-primary mb-1"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to runs
            </button>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              {selectedRun.name}
              <Badge variant="outline" className="text-[10px] uppercase">
                {selectedRun.type}
              </Badge>
              {isLocked && (
                <Badge className="bg-gray-100 text-gray-700 border-gray-200 text-[10px] gap-1">
                  <Lock className="h-2.5 w-2.5" /> Completed
                </Badge>
              )}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {selectedRun.environment} · started{" "}
              {formatDate(new Date(selectedRun.startedAt))}
              {selectedRun.completedAt &&
                ` · completed ${formatDate(new Date(selectedRun.completedAt))}`}
            </p>
          </div>
          {!isLocked && (
            <Button
              onClick={() => completeRun(selectedRun)}
              className="gap-2"
              disabled={selectedRun.pending > 0}
              title={
                selectedRun.pending > 0
                  ? "All cases must be executed before completing"
                  : "Complete and lock this run"
              }
            >
              <CheckCircle2 className="h-4 w-4" />
              Complete Run
            </Button>
          )}
        </div>

        {/* Summary bar */}
        <Card className="border-none shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-gray-700">
                Pass Rate: {selectedRun.passRate}%
              </span>
              <div className="flex gap-3 text-xs text-gray-500">
                <span className="text-green-600 font-bold">
                  {selectedRun.passed} pass
                </span>
                <span className="text-red-600 font-bold">
                  {selectedRun.failed} fail
                </span>
                <span className="text-amber-600 font-bold">
                  {selectedRun.pending} pending
                </span>
                <span className="text-gray-500 font-bold">
                  {selectedRun.blocked} blocked
                </span>
              </div>
            </div>
            <div className="flex h-3 rounded-full overflow-hidden bg-gray-100">
              {selectedRun.total > 0 && (
                <>
                  <div
                    className="bg-green-500"
                    style={{
                      width: `${(selectedRun.passed / selectedRun.total) * 100}%`,
                    }}
                  />
                  <div
                    className="bg-red-500"
                    style={{
                      width: `${(selectedRun.failed / selectedRun.total) * 100}%`,
                    }}
                  />
                  <div
                    className="bg-amber-500"
                    style={{
                      width: `${(selectedRun.pending / selectedRun.total) * 100}%`,
                    }}
                  />
                  <div
                    className="bg-gray-400"
                    style={{
                      width: `${(selectedRun.blocked / selectedRun.total) * 100}%`,
                    }}
                  />
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results grouped by module */}
        {Object.entries(grouped).map(([module, results]) => (
          <Card key={module} className="border border-gray-100 shadow-sm">
            <CardHeader className="py-3 px-4 bg-gray-50/50">
              <CardTitle className="text-sm font-bold text-gray-800">
                {module}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-gray-100">
              {results.map((r) => (
                <div
                  key={r.caseKey}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[11px] font-black text-gray-400 uppercase tracking-wider shrink-0">
                      {r.testCaseId}
                    </span>
                    <RiskBadge risk={r.riskLevel} showIcon={false} />
                    <span className="text-sm text-gray-800 truncate">
                      {r.scenario}
                    </span>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {(
                      ["pass", "fail", "pending", "blocked"] as TestStatus[]
                    ).map((status) => (
                      <button
                        key={status}
                        disabled={isLocked}
                        onClick={() =>
                          updateResultStatus(selectedRun.id, r.caseKey, status)
                        }
                        className={cn(
                          "px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all disabled:opacity-60 disabled:cursor-not-allowed",
                          r.status === status
                            ? getStatusColor(status) + " border"
                            : "bg-white text-gray-400 border border-gray-100 hover:bg-gray-50",
                        )}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // ---- Runs list view ----
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Test Run History
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Execute and track regression, smoke, full and UAT cycles over time
          </p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Run
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FlaskConical className="h-5 w-5 text-primary" />
                Start a Test Run
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label className="text-xs">Run Name</Label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Release 2.4 Regression"
                  className="w-full mt-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Type</Label>
                  <select
                    value={form.type}
                    onChange={(e) =>
                      setForm({ ...form, type: e.target.value as TestRunType })
                    }
                    className="w-full mt-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
                  >
                    {TEST_RUN_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-xs">Environment</Label>
                  <select
                    value={form.environment}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        environment: e.target.value as EnvironmentType,
                      })
                    }
                    className="w-full mt-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
                  >
                    {ENV_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <p className="text-xs text-gray-500">
                {(testCases || []).length} test cases will be snapshotted into
                this run.
                {environments && environments.length > 0
                  ? ` Project has ${environments.length} configured environment(s).`
                  : ""}
              </p>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setCreateOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateRun}
                  disabled={(testCases || []).length === 0}
                  className="gap-2"
                >
                  <PlayCircle className="h-4 w-4" />
                  Start Run
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {allRuns.length === 0 ? (
        <div className="text-center py-16 text-gray-400 border-2 border-dashed rounded-lg">
          <FlaskConical className="h-12 w-12 mx-auto mb-3 opacity-40" />
          <p className="text-base font-medium">No test runs yet</p>
          <p className="text-sm mt-1">
            Start a run to record a regression or smoke cycle.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {allRuns.map((run) => (
            <Card
              key={run.id}
              onClick={() => setSelectedRunId(run.id)}
              className="border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-900 truncate">
                        {run.name}
                      </h3>
                      <Badge variant="outline" className="text-[10px] uppercase">
                        {run.type}
                      </Badge>
                      <Badge
                        className={cn(
                          "text-[10px] gap-1 border",
                          run.status === "completed"
                            ? "bg-gray-100 text-gray-700 border-gray-200"
                            : "bg-blue-100 text-blue-700 border-blue-200",
                        )}
                      >
                        {run.status === "completed" ? (
                          <Lock className="h-2.5 w-2.5" />
                        ) : (
                          <PlayCircle className="h-2.5 w-2.5" />
                        )}
                        {run.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {run.environment} · {run.total} cases ·{" "}
                      {formatDate(new Date(run.startedAt))}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p
                      className={cn(
                        "text-2xl font-black",
                        run.passRate >= 80
                          ? "text-green-600"
                          : run.passRate >= 60
                            ? "text-amber-600"
                            : "text-red-600",
                      )}
                    >
                      {run.passRate}%
                    </p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">
                      {run.passed}/{run.total} pass
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
