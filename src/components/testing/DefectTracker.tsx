"use client";

import { useState, useEffect } from "react";
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
import { getStatusColor } from "@/lib/utils";
import { saveDefects, loadDefects } from "@/lib/storage";
import { Plus, Edit, Trash2 } from "lucide-react";

export default function DefectTracker() {
  const [defects, setDefects] = useState<Defect[]>([]);
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

  useEffect(() => {
    setDefects(loadDefects());
  }, []);

  useEffect(() => {
    if (defects.length > 0) {
      saveDefects(defects);
    }
  }, [defects]);

  const handleSubmit = () => {
    if (!formData.bugId || !formData.module || !formData.description) {
      alert("Please fill in all required fields");
      return;
    }

    if (editingDefect) {
      setDefects(
        defects.map((d) =>
          d.id === editingDefect.id ? { ...editingDefect, ...formData } : d
        )
      );
    } else {
      const newDefect: Defect = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date(),
      };
      setDefects([...defects, newDefect]);
    }

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
      stepsToReproduce: defect.stepsToReproduce,
      status: defect.status,
      assignedTo: defect.assignedTo,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this defect?")) {
      setDefects(defects.filter((d) => d.id !== id));
    }
  };

  const stats = {
    total: defects.length,
    critical: defects.filter((d) => d.severity === "critical").length,
    high: defects.filter((d) => d.severity === "high").length,
    open: defects.filter((d) => d.status === "open").length,
    resolved: defects.filter((d) => d.status === "resolved").length,
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total Defects</p>
          <p className="mt-2 text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Critical</p>
          <p className="mt-2 text-2xl font-bold text-red-600">
            {stats.critical}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">High Priority</p>
          <p className="mt-2 text-2xl font-bold text-orange-600">
            {stats.high}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Open</p>
          <p className="mt-2 text-2xl font-bold text-yellow-600">
            {stats.open}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Resolved</p>
          <p className="mt-2 text-2xl font-bold text-green-600">
            {stats.resolved}
          </p>
        </div>
      </div>

      {/* Add Defect Button */}
      <div className="flex justify-end">
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Defect
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingDefect ? "Edit Defect" : "Add New Defect"}
              </DialogTitle>
              <DialogDescription>
                Fill in the details of the defect
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bugId">Bug ID *</Label>
                  <Input
                    id="bugId"
                    value={formData.bugId}
                    onChange={(e) =>
                      setFormData({ ...formData, bugId: e.target.value })
                    }
                    placeholder="BUG-001"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="severity">Severity *</Label>
                  <Select
                    value={formData.severity}
                    onValueChange={(value: Defect["severity"]) =>
                      setFormData({ ...formData, severity: value })
                    }
                  >
                    <SelectTrigger>
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
                <Label htmlFor="module">Module *</Label>
                <Input
                  id="module"
                  value={formData.module}
                  onChange={(e) =>
                    setFormData({ ...formData, module: e.target.value })
                  }
                  placeholder="Authentication"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Describe the defect..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="steps">Steps to Reproduce</Label>
                <Textarea
                  id="steps"
                  value={formData.stepsToReproduce}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      stepsToReproduce: e.target.value,
                    })
                  }
                  placeholder="1. Navigate to...&#10;2. Click on...&#10;3. Observe..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
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
                  <Label htmlFor="assignedTo">Assigned To</Label>
                  <Input
                    id="assignedTo"
                    value={formData.assignedTo}
                    onChange={(e) =>
                      setFormData({ ...formData, assignedTo: e.target.value })
                    }
                    placeholder="Developer name"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                {editingDefect ? "Update" : "Add"} Defect
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Defects Table */}
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full">
          <thead className="border-b bg-muted">
            <tr>
              <th className="p-3 text-left text-sm font-semibold">Bug ID</th>
              <th className="p-3 text-left text-sm font-semibold">Severity</th>
              <th className="p-3 text-left text-sm font-semibold">Module</th>
              <th className="p-3 text-left text-sm font-semibold">
                Description
              </th>
              <th className="p-3 text-left text-sm font-semibold">Status</th>
              <th className="p-3 text-left text-sm font-semibold">
                Assigned To
              </th>
              <th className="p-3 text-left text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {defects.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="p-8 text-center text-muted-foreground"
                >
                  No defects logged yet. Click "Add Defect" to create one.
                </td>
              </tr>
            ) : (
              defects.map((defect) => (
                <tr key={defect.id} className="border-b hover:bg-muted/50">
                  <td className="p-3 text-sm font-medium">{defect.bugId}</td>
                  <td className="p-3">
                    <Badge className={getStatusColor(defect.severity)}>
                      {defect.severity.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="p-3 text-sm">{defect.module}</td>
                  <td className="p-3 text-sm max-w-xs truncate">
                    {defect.description}
                  </td>
                  <td className="p-3">
                    <Badge className={getStatusColor(defect.status)}>
                      {defect.status.replace("-", " ").toUpperCase()}
                    </Badge>
                  </td>
                  <td className="p-3 text-sm">{defect.assignedTo || "-"}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(defect)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(defect.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
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
