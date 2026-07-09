"use client";

import { useMemo, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  useReleases,
  useUpdateReleases,
  useTestRuns,
  useDefects,
} from "@/hooks/useTestData";
import { useAuth } from "@/context/AuthContext";
import { appendAuditEntry } from "@/lib/cloudStorage";
import {
  Release,
  ReleaseStatus,
  ReleaseSignOff,
  RELEASE_STATUS_LABELS,
  defaultChecklist,
  evaluateAutoChecklist,
  resolveChecklist,
  isReleaseReady,
} from "@/types/release";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatDate } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  Rocket,
  ArrowLeft,
  CheckCircle2,
  Circle,
  Lock,
  ShieldCheck,
  PenLine,
  Trash2,
  Zap,
} from "lucide-react";

function nowIso() {
  return new Date().toISOString();
}

const STATUS_STYLES: Record<ReleaseStatus, string> = {
  planned: "bg-gray-100 text-gray-700 border-gray-200",
  "in-testing": "bg-blue-100 text-blue-700 border-blue-200",
  "signed-off": "bg-emerald-100 text-emerald-700 border-emerald-200",
  released: "bg-green-100 text-green-700 border-green-200",
  "rolled-back": "bg-red-100 text-red-700 border-red-200",
};

const SIGNOFF_ROLES = [
  "QA Engineer",
  "Developer",
  "Product/Business",
  "Management",
];

export default function ReleaseManager() {
  const { projectId } = useParams();
  const id = projectId as string;
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: releases, isLoading: relLoading } = useReleases(id);
  const { data: runs } = useTestRuns(id);
  const { data: defects } = useDefects(id);
  const updateReleases = useUpdateReleases(id);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ version: "", targetDate: "" });
  const [signOff, setSignOff] = useState({ role: SIGNOFF_ROLES[0], name: "" });

  const actor = user?.email || "anonymous";
  const allReleases = useMemo(
    () =>
      [...(releases || [])].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [releases],
  );
  const selected = allReleases.find((r) => r.id === selectedId) || null;

  const autoFlags = useMemo(
    () => evaluateAutoChecklist(runs || [], defects || []),
    [runs, defects],
  );

  const logAudit = useCallback(
    async (action: string, entityId: string, summary: string) => {
      await appendAuditEntry(
        {
          id: crypto.randomUUID(),
          projectId: id,
          actor,
          action,
          entity: "Release",
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
    (next: Release[]) => updateReleases.mutate(next),
    [updateReleases],
  );

  const handleCreate = useCallback(async () => {
    if (!form.version.trim()) return;
    const rel: Release = {
      id: crypto.randomUUID(),
      projectId: id,
      version: form.version.trim(),
      targetDate: form.targetDate || undefined,
      status: "planned",
      checklist: defaultChecklist(),
      signOffs: [],
      linkedRunIds: [],
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    persist([rel, ...(releases || [])]);
    await logAudit(
      "release.created",
      rel.id,
      `Created release ${rel.version}`,
    );
    setForm({ version: "", targetDate: "" });
    setCreateOpen(false);
    setSelectedId(rel.id);
  }, [form, id, releases, persist, logAudit]);

  const updateRelease = useCallback(
    (relId: string, patch: Partial<Release>) => {
      persist(
        (releases || []).map((r) =>
          r.id === relId ? { ...r, ...patch, updatedAt: nowIso() } : r,
        ),
      );
    },
    [releases, persist],
  );

  const toggleManualItem = useCallback(
    (rel: Release, key: string) => {
      const checklist = rel.checklist.map((i) =>
        i.key === key && !i.auto ? { ...i, done: !i.done } : i,
      );
      updateRelease(rel.id, { checklist });
    },
    [updateRelease],
  );

  const addSignOff = useCallback(
    (rel: Release) => {
      if (!signOff.name.trim()) return;
      const so: ReleaseSignOff = {
        id: crypto.randomUUID(),
        role: signOff.role,
        name: signOff.name.trim(),
        date: nowIso(),
      };
      updateRelease(rel.id, { signOffs: [...rel.signOffs, so] });
      setSignOff({ role: SIGNOFF_ROLES[0], name: "" });
    },
    [signOff, updateRelease],
  );

  const removeSignOff = useCallback(
    (rel: Release, soId: string) => {
      updateRelease(rel.id, {
        signOffs: rel.signOffs.filter((s) => s.id !== soId),
      });
    },
    [updateRelease],
  );

  const changeStatus = useCallback(
    async (rel: Release, status: ReleaseStatus, frozen?: Release) => {
      const base = frozen || rel;
      persist(
        (releases || []).map((r) =>
          r.id === rel.id
            ? { ...base, status, updatedAt: nowIso() }
            : r,
        ),
      );
      await logAudit(
        `release.${status}`,
        rel.id,
        `Release ${rel.version} → ${RELEASE_STATUS_LABELS[status]}`,
      );
    },
    [releases, persist, logAudit],
  );

  if (relLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  // ---- Detail view ----
  if (selected) {
    const resolved = resolveChecklist(selected.checklist, autoFlags);
    const ready = isReleaseReady(resolved);
    const doneCount = resolved.filter((i) => i.done).length;

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <button
              onClick={() => setSelectedId(null)}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-primary mb-1"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to releases
            </button>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Rocket className="h-5 w-5 text-primary" />
              Release {selected.version}
              <Badge className={cn("text-[10px] border", STATUS_STYLES[selected.status])}>
                {RELEASE_STATUS_LABELS[selected.status]}
              </Badge>
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {selected.targetDate
                ? `Target ${formatDate(new Date(selected.targetDate))} · `
                : ""}
              created {formatDate(new Date(selected.createdAt))}
            </p>
          </div>
          <div className="flex gap-2">
            {selected.status !== "released" &&
              selected.status !== "rolled-back" && (
                <Button
                  onClick={() =>
                    changeStatus(selected, "signed-off", {
                      ...selected,
                      checklist: resolved,
                    })
                  }
                  disabled={!ready || selected.status === "signed-off"}
                  className="gap-2"
                  title={
                    ready
                      ? "All checklist items pass"
                      : "Complete every checklist item to sign off"
                  }
                >
                  <ShieldCheck className="h-4 w-4" />
                  Sign Off Release
                </Button>
              )}
            {selected.status === "signed-off" && (
              <Button
                onClick={() => changeStatus(selected, "released")}
                className="gap-2"
              >
                <Rocket className="h-4 w-4" />
                Mark Released
              </Button>
            )}
            {(selected.status === "signed-off" ||
              selected.status === "released") && (
              <Button
                variant="outline"
                onClick={() => changeStatus(selected, "rolled-back")}
                className="gap-2 text-red-600 border-red-200"
              >
                Roll Back
              </Button>
            )}
          </div>
        </div>

        {/* Readiness banner */}
        <Card
          className={cn(
            "border-none shadow-sm",
            ready ? "bg-emerald-50" : "bg-amber-50",
          )}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {ready ? (
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
              ) : (
                <Lock className="h-5 w-5 text-amber-600" />
              )}
              <span
                className={cn(
                  "text-sm font-bold",
                  ready ? "text-emerald-800" : "text-amber-800",
                )}
              >
                {ready
                  ? "Release ready — all checks pass"
                  : "Not ready for sign-off"}
              </span>
            </div>
            <span className="text-sm font-black text-gray-700">
              {doneCount}/{resolved.length}
            </span>
          </CardContent>
        </Card>

        {/* Mandatory checklist */}
        <Card className="border border-gray-100 shadow-sm">
          <CardHeader className="py-3 px-4 bg-gray-50/50">
            <CardTitle className="text-sm font-bold text-gray-800">
              Mandatory Release Checklist (§24)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-gray-100">
            {resolved.map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between gap-2 p-3"
              >
                <div className="flex items-center gap-3">
                  {item.auto ? (
                    item.done ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    ) : (
                      <Circle className="h-5 w-5 text-gray-300" />
                    )
                  ) : (
                    <button
                      onClick={() => toggleManualItem(selected, item.key)}
                      disabled={
                        selected.status === "released" ||
                        selected.status === "rolled-back"
                      }
                      className="disabled:opacity-50"
                    >
                      {item.done ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      ) : (
                        <Circle className="h-5 w-5 text-gray-300 hover:text-gray-400" />
                      )}
                    </button>
                  )}
                  <span
                    className={cn(
                      "text-sm",
                      item.done ? "text-gray-800" : "text-gray-500",
                    )}
                  >
                    {item.label}
                  </span>
                </div>
                {item.auto && (
                  <Badge
                    variant="outline"
                    className="text-[9px] gap-1 text-blue-600 border-blue-100"
                  >
                    <Zap className="h-2.5 w-2.5" /> Auto
                  </Badge>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Sign-offs */}
        <Card className="border border-gray-100 shadow-sm">
          <CardHeader className="py-3 px-4 bg-gray-50/50">
            <CardTitle className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <PenLine className="h-4 w-4" /> Sign-offs (§20)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {selected.signOffs.length === 0 ? (
              <p className="text-xs text-gray-400">No sign-offs yet.</p>
            ) : (
              <div className="space-y-2">
                {selected.signOffs.map((so) => (
                  <div
                    key={so.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-gray-50"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      <span className="text-sm font-semibold text-gray-800">
                        {so.name}
                      </span>
                      <Badge variant="outline" className="text-[9px]">
                        {so.role}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      {so.date && (
                        <span className="text-[10px] text-gray-400">
                          {formatDate(new Date(so.date))}
                        </span>
                      )}
                      <button
                        onClick={() => removeSignOff(selected, so.id)}
                        className="p-1 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="h-3 w-3 text-red-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <select
                value={signOff.role}
                onChange={(e) =>
                  setSignOff({ ...signOff, role: e.target.value })
                }
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
              >
                {SIGNOFF_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={signOff.name}
                onChange={(e) =>
                  setSignOff({ ...signOff, name: e.target.value })
                }
                placeholder="Signatory name"
                className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
              />
              <Button variant="outline" onClick={() => addSignOff(selected)}>
                Add Sign-off
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ---- List view ----
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Rocket className="h-5 w-5 text-primary" />
            Releases
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Gate production releases on the mandatory checklist and sign-offs
          </p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Release
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Plan a Release</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label className="text-xs">Version</Label>
                <input
                  type="text"
                  value={form.version}
                  onChange={(e) =>
                    setForm({ ...form, version: e.target.value })
                  }
                  placeholder="2.4.0"
                  className="w-full mt-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <Label className="text-xs">Target Date</Label>
                <input
                  type="date"
                  value={form.targetDate}
                  onChange={(e) =>
                    setForm({ ...form, targetDate: e.target.value })
                  }
                  className="w-full mt-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setCreateOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={!form.version.trim()}>
                  Create Release
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {allReleases.length === 0 ? (
        <div className="text-center py-16 text-gray-400 border-2 border-dashed rounded-lg">
          <Rocket className="h-12 w-12 mx-auto mb-3 opacity-40" />
          <p className="text-base font-medium">No releases planned</p>
          <p className="text-sm mt-1">
            Create a release to track its readiness checklist.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {allReleases.map((rel) => {
            const resolved = resolveChecklist(rel.checklist, autoFlags);
            const ready = isReleaseReady(resolved);
            const doneCount = resolved.filter((i) => i.done).length;
            return (
              <Card
                key={rel.id}
                onClick={() => setSelectedId(rel.id)}
                className="border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer"
              >
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-900">
                        Release {rel.version}
                      </h3>
                      <Badge
                        className={cn(
                          "text-[10px] border",
                          STATUS_STYLES[rel.status],
                        )}
                      >
                        {RELEASE_STATUS_LABELS[rel.status]}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {rel.signOffs.length} sign-off(s)
                      {rel.targetDate
                        ? ` · target ${formatDate(new Date(rel.targetDate))}`
                        : ""}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p
                      className={cn(
                        "text-lg font-black",
                        ready ? "text-emerald-600" : "text-amber-600",
                      )}
                    >
                      {doneCount}/{resolved.length}
                    </p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">
                      checklist
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
