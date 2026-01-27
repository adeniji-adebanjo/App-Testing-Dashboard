"use client";

import { useState, useEffect, useMemo } from "react";
import { Defect } from "@/types/test-case";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { cn, getStatusColor } from "@/lib/utils";
import { useDefects, useUpdateDefects } from "@/hooks/useTestData";
import { useProject } from "@/context/ProjectContext";
import { Plus, Edit, Trash2, Bug } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function DefectTracker() {
  const { currentProject } = useProject();
  const projectId = currentProject?.id || "";

  const { data: savedDefects, isLoading } = useDefects(projectId);
  const updateMutation = useUpdateDefects(projectId);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDefect, setEditingDefect] = useState<Defect | null>(null);
  const [formData, setFormData] = useState({
    bugId: "",
    severity: "medium" as Defect["severity"],
    module: "",
    description: "",
    stepsToReproduce: "",
    status: "open" as Defect["status"],
    assignedTo: "",
  });

  const defects = useMemo(() => savedDefects || [], [savedDefects]);

  const handleSubmit = () => {
    if (!formData.bugId || !formData.module || !formData.description) {
      alert("Please fill in all required fields");
      return;
    }

    let updatedDefects: Defect[];
    if (editingDefect) {
      updatedDefects = defects.map((d) =>
        d.id === editingDefect.id
          ? { ...editingDefect, ...formData, projectId }
          : d,
      );
    } else {
      const newDefect: Defect = {
        id: Date.now().toString(),
        projectId,
        ...formData,
        createdAt: new Date(),
      };
      updatedDefects = [...defects, newDefect];
    }

    updateMutation.mutate(updatedDefects);
    resetForm();
    setIsDialogOpen(false);
  };

  const resetForm = () => {
    setFormData({
      bugId: "",
      severity: "medium",
      module: "",
      description: "",
      stepsToReproduce: "",
      status: "open",
      assignedTo: "",
    });
    setEditingDefect(null);
  };

  const handleEdit = (defect: Defect) => {
    setEditingDefect(defect);
    setFormData({
      bugId: defect.bugId,
      severity: defect.severity,
      module: defect.module,
      description: defect.description,
      stepsToReproduce: defect.stepsToReproduce || "",
      status: defect.status,
      assignedTo: defect.assignedTo || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this defect?")) {
      updateMutation.mutate(defects.filter((d) => d.id !== id));
    }
  };

  const stats = {
    total: defects.length,
    critical: defects.filter((d) => d.severity === "critical").length,
    high: defects.filter((d) => d.severity === "high").length,
    open: defects.filter((d) => d.status === "open").length,
    resolved: defects.filter((d) => d.status === "resolved").length,
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-5">
        <div className="rounded-xl border border-gray-100 bg-white/50 p-4 shadow-sm">
          <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
            Total
          </p>
          <p className="mt-1 text-2xl font-black text-gray-900">
            {stats.total}
          </p>
        </div>
        <div className="rounded-xl border border-red-100 bg-red-50/30 p-4 shadow-sm">
          <p className="text-[10px] uppercase font-bold text-red-400 tracking-wider">
            Critical
          </p>
          <p className="mt-1 text-2xl font-black text-red-600">
            {stats.critical}
          </p>
        </div>
        <div className="rounded-xl border border-orange-100 bg-orange-50/30 p-4 shadow-sm">
          <p className="text-[10px] uppercase font-bold text-orange-400 tracking-wider">
            High
          </p>
          <p className="mt-1 text-2xl font-black text-orange-600">
            {stats.high}
          </p>
        </div>
        <div className="rounded-xl border border-amber-100 bg-amber-50/30 p-4 shadow-sm">
          <p className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
            Open
          </p>
          <p className="mt-1 text-2xl font-black text-amber-600">
            {stats.open}
          </p>
        </div>
        <div className="rounded-xl border border-green-100 bg-green-50/30 p-4 shadow-sm">
          <p className="text-[10px] uppercase font-bold text-green-400 tracking-wider">
            Resolved
          </p>
          <p className="mt-1 text-2xl font-black text-green-600">
            {stats.resolved}
          </p>
        </div>
      </div>

      {/* Add Defect Button */}
      <div className="flex justify-between items-center bg-gray-50/50 p-4 rounded-xl border border-gray-100">
        <div className="flex items-center gap-2">
          <Bug className="h-5 w-5 text-gray-400" />
          <h3 className="font-bold text-gray-700">Project Defect Log</h3>
        </div>
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button className="gap-2 shadow-lg shadow-primary/20">
              <Plus size={16} />
              Report Defect
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl bg-white/95 backdrop-blur-xl border-gray-100">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                {editingDefect ? "Update Defect Report" : "New Defect Report"}
              </DialogTitle>
              <DialogDescription>
                Provide detailed information to help developers reproduce and
                fix the bug.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="bugId"
                    className="text-xs font-bold uppercase text-gray-500"
                  >
                    Bug ID *
                  </Label>
                  <Input
                    id="bugId"
                    value={formData.bugId}
                    onChange={(e) =>
                      setFormData({ ...formData, bugId: e.target.value })
                    }
                    placeholder="e.g. BUG-WMA-001"
                    className="border-gray-200 focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="severity"
                    className="text-xs font-bold uppercase text-gray-500"
                  >
                    Severity *
                  </Label>
                  <Select
                    value={formData.severity}
                    onValueChange={(value: Defect["severity"]) =>
                      setFormData({ ...formData, severity: value })
                    }
                  >
                    <SelectTrigger className="border-gray-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="module"
                  className="text-xs font-bold uppercase text-gray-500"
                >
                  Module *
                </Label>
                <Input
                  id="module"
                  value={formData.module}
                  onChange={(e) =>
                    setFormData({ ...formData, module: e.target.value })
                  }
                  placeholder="e.g. Dashboard / Transactions"
                  className="border-gray-200"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="description"
                  className="text-xs font-bold uppercase text-gray-500"
                >
                  Description *
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="What happened and what was expected?"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="steps"
                  className="text-xs font-bold uppercase text-gray-500"
                >
                  Steps to Reproduce
                </Label>
                <Textarea
                  id="steps"
                  value={formData.stepsToReproduce}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      stepsToReproduce: e.target.value,
                    })
                  }
                  placeholder="1. Login as user...&#10;2. Click on payment...&#10;3. App crashes"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="status"
                    className="text-xs font-bold uppercase text-gray-500"
                  >
                    Current Status
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: Defect["status"]) =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="assignedTo"
                    className="text-xs font-bold uppercase text-gray-500"
                  >
                    Assigned To
                  </Label>
                  <Input
                    id="assignedTo"
                    value={formData.assignedTo}
                    onChange={(e) =>
                      setFormData({ ...formData, assignedTo: e.target.value })
                    }
                    placeholder="Name of developer"
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="bg-gray-50 -m-6 mt-4 p-6 rounded-b-lg">
              <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} className="px-8">
                {editingDefect ? "Update Record" : "Log Defect"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Defects Table */}
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50/80 border-b border-gray-100">
            <tr>
              <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                Bug ID
              </th>
              <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                Priority
              </th>
              <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                Module
              </th>
              <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider w-1/3">
                Description
              </th>
              <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {defects.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="p-12 text-center text-gray-400 italic"
                >
                  No defects reported for this project yet.
                </td>
              </tr>
            ) : (
              defects.map((defect) => (
                <tr
                  key={defect.id}
                  className="group hover:bg-gray-50/50 transition-colors"
                >
                  <td className="p-4 text-sm font-black text-primary">
                    {defect.bugId}
                  </td>
                  <td className="p-4">
                    <Badge
                      className={cn(
                        "border-none px-2",
                        getStatusColor(defect.severity),
                      )}
                    >
                      {defect.severity.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="p-4 text-sm font-medium text-gray-600">
                    {defect.module}
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-gray-900 font-medium line-clamp-1 group-hover:line-clamp-none transition-all duration-300">
                      {defect.description}
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge
                      className={cn(
                        "border-none px-2",
                        getStatusColor(defect.status),
                      )}
                    >
                      {defect.status.replace("-", " ").toUpperCase()}
                    </Badge>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 hover:bg-white hover:text-primary hover:shadow-sm"
                        onClick={() => handleEdit(defect)}
                      >
                        <Edit size={14} />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                        onClick={() => handleDelete(defect.id)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
