"use client";

import { useMemo, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  useRequirements,
  useUpdateRequirements,
  useTestCases,
  useUpdateTestCases,
} from "@/hooks/useTestData";
import { Requirement, RequirementSource } from "@/types/requirement";
import { RiskLevel, TestCase } from "@/types/test-case";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import RiskBadge from "@/components/testing/RiskBadge";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  Trash2,
  Link2,
  ChevronDown,
  ChevronRight,
  ListChecks,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";

function nowIso() {
  return new Date().toISOString();
}

const SOURCE_LABELS: Record<RequirementSource, string> = {
  manual: "Manual",
  prd: "PRD",
  ai: "AI",
};

export default function RequirementsManager() {
  const { projectId } = useParams();
  const id = projectId as string;

  const { data: requirements, isLoading: reqLoading } = useRequirements(id);
  const { data: testCases, isLoading: casesLoading } = useTestCases(id);
  const updateRequirements = useUpdateRequirements(id);
  const updateTestCases = useUpdateTestCases(id);

  const [expanded, setExpanded] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState<{
    refId: string;
    title: string;
    description: string;
    module: string;
    riskLevel: RiskLevel | "";
  }>({ refId: "", title: "", description: "", module: "", riskLevel: "" });

  const isLoading = reqLoading || casesLoading;
  const allReqs = useMemo(() => requirements || [], [requirements]);
  const allCases = useMemo(() => testCases || [], [testCases]);

  // Coverage per requirement.
  const coverageFor = useCallback(
    (reqId: string) => {
      const linked = allCases.filter((tc) =>
        tc.requirementIds?.includes(reqId),
      );
      const passed = linked.filter((tc) => tc.status === "pass").length;
      const passRate =
        linked.length > 0 ? Math.round((passed / linked.length) * 100) : 0;
      return { linked, passed, passRate };
    },
    [allCases],
  );

  const summary = useMemo(() => {
    const total = allReqs.length;
    const covered = allReqs.filter(
      (r) => coverageFor(r.id).linked.length > 0,
    ).length;
    const coverage = total > 0 ? Math.round((covered / total) * 100) : 0;
    return { total, covered, uncovered: total - covered, coverage };
  }, [allReqs, coverageFor]);

  const persistReqs = useCallback(
    (next: Requirement[]) => updateRequirements.mutate(next),
    [updateRequirements],
  );

  const handleCreate = useCallback(() => {
    if (!form.refId.trim() && !form.title.trim()) return;
    const req: Requirement = {
      id: crypto.randomUUID(),
      projectId: id,
      refId: form.refId.trim() || `REQ-${allReqs.length + 1}`,
      title: form.title.trim() || "Untitled requirement",
      description: form.description.trim() || undefined,
      source: "manual" as RequirementSource,
      module: form.module.trim() || undefined,
      riskLevel: form.riskLevel || undefined,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    persistReqs([req, ...allReqs]);
    setForm({ refId: "", title: "", description: "", module: "", riskLevel: "" });
    setCreateOpen(false);
  }, [form, id, allReqs, persistReqs]);

  const deleteReq = useCallback(
    (reqId: string) => {
      persistReqs(allReqs.filter((r) => r.id !== reqId));
      // Unlink from any test cases that referenced it
      const affected = allCases.filter((tc) =>
        tc.requirementIds?.includes(reqId),
      );
      if (affected.length > 0) {
        const next = allCases.map((tc) =>
          tc.requirementIds?.includes(reqId)
            ? {
                ...tc,
                requirementIds: tc.requirementIds.filter((x) => x !== reqId),
              }
            : tc,
        );
        updateTestCases.mutate(next);
      }
    },
    [allReqs, allCases, persistReqs, updateTestCases],
  );

  const toggleLink = useCallback(
    (reqId: string, targetCase: TestCase) => {
      const ids = new Set(targetCase.requirementIds || []);
      if (ids.has(reqId)) ids.delete(reqId);
      else ids.add(reqId);
      const next = allCases.map((tc) =>
        tc.id === targetCase.id ? { ...tc, requirementIds: [...ids] } : tc,
      );
      updateTestCases.mutate(next);
    },
    [allCases, updateTestCases],
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Traceability summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryTile
          label="Requirements"
          value={summary.total}
          icon={<ListChecks className="h-4 w-4" />}
          tone="primary"
        />
        <SummaryTile
          label="Covered"
          value={summary.covered}
          icon={<ShieldCheck className="h-4 w-4" />}
          tone="green"
        />
        <SummaryTile
          label="Uncovered"
          value={summary.uncovered}
          icon={<AlertTriangle className="h-4 w-4" />}
          tone={summary.uncovered > 0 ? "red" : "gray"}
        />
        <SummaryTile
          label="Coverage"
          value={`${summary.coverage}%`}
          icon={<Link2 className="h-4 w-4" />}
          tone={summary.coverage >= 80 ? "green" : "amber"}
        />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            Requirements Traceability Matrix
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Link requirements to test cases for coverage and audit readiness
          </p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Requirement
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Requirement</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Reference ID</Label>
                  <input
                    type="text"
                    value={form.refId}
                    onChange={(e) =>
                      setForm({ ...form, refId: e.target.value })
                    }
                    placeholder="REQ-WALLET-01"
                    className="w-full mt-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <Label className="text-xs">Module</Label>
                  <input
                    type="text"
                    value={form.module}
                    onChange={(e) =>
                      setForm({ ...form, module: e.target.value })
                    }
                    placeholder="Wallet System"
                    className="w-full mt-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs">Title</Label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Wallet funding updates balance atomically"
                  className="w-full mt-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <Label className="text-xs">Description</Label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  rows={2}
                  className="w-full mt-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <Label className="text-xs">Risk Level</Label>
                <select
                  value={form.riskLevel}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      riskLevel: e.target.value as RiskLevel | "",
                    })
                  }
                  className="w-full mt-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="">Unset</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setCreateOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate}>Add Requirement</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {allReqs.length === 0 ? (
        <div className="text-center py-16 text-gray-400 border-2 border-dashed rounded-lg">
          <ListChecks className="h-12 w-12 mx-auto mb-3 opacity-40" />
          <p className="text-base font-medium">No requirements yet</p>
          <p className="text-sm mt-1">
            Add requirements to build the traceability matrix.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {allReqs.map((req) => {
            const { linked, passRate } = coverageFor(req.id);
            const isExpanded = expanded === req.id;
            const isCovered = linked.length > 0;
            return (
              <Card
                key={req.id}
                className="border border-gray-100 shadow-sm overflow-hidden"
              >
                <CardContent className="p-0">
                  <div className="flex items-center justify-between gap-3 p-4">
                    <div className="flex items-start gap-3 min-w-0">
                      <button
                        onClick={() =>
                          setExpanded(isExpanded ? null : req.id)
                        }
                        className="p-1 hover:bg-gray-100 rounded mt-0.5"
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-gray-500" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-gray-500" />
                        )}
                      </button>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[11px] font-black text-gray-400 uppercase tracking-wider">
                            {req.refId}
                          </span>
                          <RiskBadge risk={req.riskLevel} showIcon={false} />
                          <Badge
                            variant="outline"
                            className="text-[9px] text-gray-400 border-gray-100"
                          >
                            {SOURCE_LABELS[req.source]}
                          </Badge>
                          {req.module && (
                            <Badge
                              variant="outline"
                              className="text-[9px] text-gray-500 border-gray-100"
                            >
                              {req.module}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm font-semibold text-gray-900 mt-1 truncate">
                          {req.title}
                        </p>
                        {req.description && (
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                            {req.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <Badge
                          className={cn(
                            "text-[10px] gap-1 border",
                            isCovered
                              ? "bg-green-100 text-green-800 border-green-200"
                              : "bg-red-100 text-red-800 border-red-200",
                          )}
                        >
                          <Link2 className="h-2.5 w-2.5" />
                          {linked.length}{" "}
                          {linked.length === 1 ? "case" : "cases"}
                        </Badge>
                        {isCovered && (
                          <p className="text-[10px] text-gray-400 mt-1">
                            {passRate}% pass
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => deleteReq(req.id)}
                        className="p-1.5 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-red-500" />
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-gray-100 bg-gray-50/40 p-4">
                      <Label className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-2 block">
                        Link Test Cases ({linked.length} of {allCases.length})
                      </Label>
                      {allCases.length === 0 ? (
                        <p className="text-xs text-gray-400">
                          No test cases in this project yet.
                        </p>
                      ) : (
                        <div className="max-h-64 overflow-y-auto space-y-1">
                          {allCases.map((tc) => {
                            const checked =
                              tc.requirementIds?.includes(req.id) || false;
                            return (
                              <label
                                key={tc.id}
                                className={cn(
                                  "flex items-center gap-2 p-2 rounded-md cursor-pointer text-sm transition-colors",
                                  checked
                                    ? "bg-primary/5 border border-primary/20"
                                    : "hover:bg-white border border-transparent",
                                )}
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => toggleLink(req.id, tc)}
                                  className="accent-primary"
                                />
                                <span className="text-[11px] font-black text-gray-400 uppercase tracking-wider shrink-0">
                                  {tc.testCaseId}
                                </span>
                                <span className="text-gray-500 text-xs shrink-0">
                                  {tc.module}
                                </span>
                                <span className="text-gray-800 truncate">
                                  {tc.scenario}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SummaryTile({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  tone: "primary" | "green" | "red" | "amber" | "gray";
}) {
  const toneClass = {
    primary: "bg-primary/10 text-primary",
    green: "bg-green-100 text-green-600",
    red: "bg-red-100 text-red-600",
    amber: "bg-amber-100 text-amber-600",
    gray: "bg-gray-100 text-gray-500",
  }[tone];
  return (
    <Card className="border-none shadow-sm">
      <CardContent className="p-4">
        <div className={cn("p-1.5 rounded-lg w-fit", toneClass)}>{icon}</div>
        <p className="text-2xl font-black text-gray-900 mt-2">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </CardContent>
    </Card>
  );
}
