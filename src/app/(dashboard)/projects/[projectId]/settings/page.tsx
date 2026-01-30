"use client";

import { useState, useEffect } from "react";
import { useProject } from "@/context/ProjectContext";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Settings,
  Save,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Upload,
  FileText,
  Palette,
  Users,
  Code,
  Shield,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Project } from "@/types/project";
import { PRDUploader } from "@/components/project/PRDUploader";
import { ProjectTabsManager } from "@/components/project/ProjectTabsManager";

const PROJECT_COLORS = [
  "#6366F1", // Indigo
  "#8B5CF6", // Violet
  "#EC4899", // Pink
  "#EF4444", // Red
  "#F97316", // Orange
  "#EAB308", // Yellow
  "#22C55E", // Green
  "#14B8A6", // Teal
  "#06B6D4", // Cyan
  "#3B82F6", // Blue
];

export default function ProjectSettingsPage() {
  const { currentProject, updateProject, deleteProject } = useProject();
  const { projectId } = useParams();
  const router = useRouter();

  const [formData, setFormData] = useState<Partial<Project>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [techStackInput, setTechStackInput] = useState("");
  const [targetUsersInput, setTargetUsersInput] = useState("");

  useEffect(() => {
    if (currentProject) {
      setFormData({
        name: currentProject.name,
        shortCode: currentProject.shortCode,
        description: currentProject.description,
        phase: currentProject.phase,
        status: currentProject.status,
        documentVersion: currentProject.documentVersion,
        color: currentProject.color,
        techStack: currentProject.techStack,
        targetUsers: currentProject.targetUsers,
      });
    }
  }, [currentProject]);

  const handleSave = async () => {
    if (!currentProject) return;
    setIsSaving(true);
    try {
      await updateProject(currentProject.id, formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to save project:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!currentProject) return;
    try {
      await deleteProject(currentProject.id);
      router.push("/");
    } catch (error) {
      console.error("Failed to delete project:", error);
    }
  };

  const addTechStack = () => {
    if (techStackInput.trim()) {
      setFormData({
        ...formData,
        techStack: [...(formData.techStack || []), techStackInput.trim()],
      });
      setTechStackInput("");
    }
  };

  const removeTechStack = (index: number) => {
    setFormData({
      ...formData,
      techStack: formData.techStack?.filter((_, i) => i !== index),
    });
  };

  const addTargetUser = () => {
    if (targetUsersInput.trim()) {
      setFormData({
        ...formData,
        targetUsers: [...(formData.targetUsers || []), targetUsersInput.trim()],
      });
      setTargetUsersInput("");
    }
  };

  const removeTargetUser = (index: number) => {
    setFormData({
      ...formData,
      targetUsers: formData.targetUsers?.filter((_, i) => i !== index),
    });
  };

  if (!currentProject) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2 text-primary font-bold tracking-tighter text-sm italic">
            <Settings size={14} />
            PROJECT SETTINGS
          </div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900">
            Configure {currentProject.name}
          </h1>
          <p className="mt-2 text-gray-500">
            Manage project metadata, team settings, and configurations
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setShowDeleteConfirm(true)}
            className="gap-2 text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
          >
            <Trash2 size={16} />
            Delete Project
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="gap-2 bg-primary shadow-lg shadow-primary/20"
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : saveSuccess ? (
              <CheckCircle2 size={16} />
            ) : (
              <Save size={16} />
            )}
            {saveSuccess ? "Saved!" : "Save Changes"}
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm overflow-hidden">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText size={18} className="text-primary" />
                Basic Information
              </CardTitle>
              <CardDescription>
                Core project details and identifiers
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">
                    Project Name
                  </label>
                  <Input
                    value={formData.name || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Enter project name"
                    className="bg-white/50 border-gray-200 focus:bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">
                    Short Code
                  </label>
                  <Input
                    value={formData.shortCode || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        shortCode: e.target.value.toUpperCase(),
                      })
                    }
                    placeholder="e.g. CBP, WMA"
                    maxLength={5}
                    className="bg-white/50 border-gray-200 focus:bg-white font-mono uppercase"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">
                  Description
                </label>
                <Textarea
                  value={formData.description || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Describe the project and its objectives"
                  rows={3}
                  className="bg-white/50 border-gray-200 focus:bg-white resize-none"
                />
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">
                    Status
                  </label>
                  <Select
                    value={formData.status || "active"}
                    onValueChange={(
                      value: "active" | "completed" | "on-hold",
                    ) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger className="bg-white/50 border-gray-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="on-hold">On Hold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">
                    Phase
                  </label>
                  <Select
                    value={formData.phase || "planning"}
                    onValueChange={(
                      value:
                        | "planning"
                        | "development"
                        | "testing"
                        | "uat"
                        | "completed",
                    ) => setFormData({ ...formData, phase: value })}
                  >
                    <SelectTrigger className="bg-white/50 border-gray-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planning">Planning</SelectItem>
                      <SelectItem value="development">Development</SelectItem>
                      <SelectItem value="testing">Testing</SelectItem>
                      <SelectItem value="uat">UAT</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">
                    Doc Version
                  </label>
                  <Input
                    value={formData.documentVersion || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        documentVersion: e.target.value,
                      })
                    }
                    placeholder="1.0"
                    className="bg-white/50 border-gray-200 focus:bg-white"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tech Stack */}
          <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm overflow-hidden">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100">
              <CardTitle className="text-lg flex items-center gap-2">
                <Code size={18} className="text-primary" />
                Technology Stack
              </CardTitle>
              <CardDescription>
                Technologies and frameworks used in this project
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="flex gap-2">
                <Input
                  value={techStackInput}
                  onChange={(e) => setTechStackInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addTechStack()}
                  placeholder="Add technology (e.g. React, Node.js)"
                  className="bg-white/50 border-gray-200 focus:bg-white"
                />
                <Button onClick={addTechStack} variant="outline">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.techStack?.map((tech, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="bg-primary/5 text-primary border-none px-3 py-1.5 font-medium cursor-pointer hover:bg-red-50 hover:text-red-600 transition-colors"
                    onClick={() => removeTechStack(index)}
                  >
                    {tech} ×
                  </Badge>
                ))}
                {(!formData.techStack || formData.techStack.length === 0) && (
                  <p className="text-sm text-gray-400 italic">
                    No technologies added yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Target Users */}
          <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm overflow-hidden">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users size={18} className="text-primary" />
                Target Users
              </CardTitle>
              <CardDescription>
                User roles and personas this project serves
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="flex gap-2">
                <Input
                  value={targetUsersInput}
                  onChange={(e) => setTargetUsersInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addTargetUser()}
                  placeholder="Add user type (e.g. Admin, Analyst)"
                  className="bg-white/50 border-gray-200 focus:bg-white"
                />
                <Button onClick={addTargetUser} variant="outline">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.targetUsers?.map((user, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="bg-blue-50 text-blue-700 border-blue-100 px-3 py-1.5 font-medium cursor-pointer hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-colors"
                    onClick={() => removeTargetUser(index)}
                  >
                    {user} ×
                  </Badge>
                ))}
                {(!formData.targetUsers ||
                  formData.targetUsers.length === 0) && (
                  <p className="text-sm text-gray-400 italic">
                    No target users defined yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Settings */}
        <div className="space-y-6">
          {/* Color Theme */}
          <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm overflow-hidden">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100">
              <CardTitle className="text-lg flex items-center gap-2">
                <Palette size={18} className="text-primary" />
                Project Color
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-5 gap-3">
                {PROJECT_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setFormData({ ...formData, color })}
                    className={cn(
                      "w-10 h-10 rounded-xl transition-all hover:scale-110",
                      formData.color === color
                        ? "ring-2 ring-offset-2 ring-gray-400 scale-110"
                        : "",
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <div className="mt-4 flex items-center gap-3">
                <div
                  className="w-full h-12 rounded-xl shadow-inner flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: formData.color || "#6366F1" }}
                >
                  {formData.shortCode || "PRJ"}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* PRD Upload */}
          <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm overflow-hidden">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100">
              <CardTitle className="text-lg flex items-center gap-2">
                <Upload size={18} className="text-primary" />
                PRD Document
              </CardTitle>
              <CardDescription>
                Upload PRD to auto-generate test cases
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <PRDUploader projectId={currentProject.id} />
            </CardContent>
          </Card>

          {/* Testing Tabs Configuration */}
          <ProjectTabsManager
            key={currentProject.id}
            projectId={currentProject.id}
          />

          {/* Danger Zone */}
          <Card className="border border-red-100 shadow-sm bg-red-50/30 overflow-hidden">
            <CardHeader className="bg-red-50/50 border-b border-red-100">
              <CardTitle className="text-lg flex items-center gap-2 text-red-700">
                <Shield size={18} />
                Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-sm text-red-600 mb-4">
                Deleting a project will permanently remove all associated test
                cases, defects, and metrics. This action cannot be undone.
              </p>
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full gap-2 text-red-600 hover:bg-red-100 hover:text-red-700 border-red-200"
              >
                <Trash2 size={16} />
                Delete This Project
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
          <Card className="w-full max-w-md mx-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <AlertTriangle size={24} className="text-red-600" />
              </div>
              <CardTitle className="text-xl">Delete Project?</CardTitle>
              <CardDescription>
                You are about to delete{" "}
                <span className="font-bold text-gray-700">
                  {currentProject.name}
                </span>
                . All data will be permanently lost.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                Delete Forever
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
