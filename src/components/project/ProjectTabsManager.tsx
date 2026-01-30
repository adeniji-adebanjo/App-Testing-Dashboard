"use client";

import { useState } from "react";
import {
  Plus,
  Trash2,
  GripVertical,
  Sparkles,
  Save,
  Edit2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useProjectTabs, useUpdateProjectTabs } from "@/hooks/useTestData";
import { ProjectTab } from "@/lib/cloudStorage";

interface ProjectTabsManagerProps {
  projectId: string;
}

// Default tabs that every project starts with
const DEFAULT_TABS: Omit<
  ProjectTab,
  "id" | "projectId" | "createdAt" | "updatedAt"
>[] = [
  {
    name: "Functional Testing",
    slug: "functional-testing",
    description: "Test core business functionality and user workflows",
    icon: "clipboard-list",
    order: 0,
    isDefault: true,
    aiGenerated: false,
  },
  {
    name: "Non-Functional Testing",
    slug: "non-functional-testing",
    description: "Test performance, security, and reliability requirements",
    icon: "activity",
    order: 1,
    isDefault: true,
    aiGenerated: false,
  },
];

interface ProjectTabsEditorProps {
  projectId: string;
  initialTabs: ProjectTab[];
}

function ProjectTabsEditor({ projectId, initialTabs }: ProjectTabsEditorProps) {
  const { mutate: updateTabs, isPending: isSaving } =
    useUpdateProjectTabs(projectId);

  const [tabs, setTabs] = useState<ProjectTab[]>(initialTabs);
  const [newTabName, setNewTabName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const handleAddTab = () => {
    if (!newTabName.trim()) return;

    const slug = newTabName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const newTab: ProjectTab = {
      id: `tab-${Date.now()}`,
      projectId,
      name: newTabName.trim(),
      slug,
      description: "",
      icon: "clipboard-list",
      order: tabs.length,
      isDefault: false,
      aiGenerated: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setTabs([...tabs, newTab]);
    setNewTabName("");
  };

  const handleRemoveTab = (tabId: string) => {
    const tabToRemove = tabs.find((t) => t.id === tabId);
    if (tabToRemove?.isDefault) {
      alert("Cannot remove default tabs");
      return;
    }
    setTabs(tabs.filter((t) => t.id !== tabId));
  };

  const handleEditTab = (tabId: string, newName: string) => {
    setTabs(
      tabs.map((t) =>
        t.id === tabId
          ? {
              ...t,
              name: newName,
              slug: newName
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)/g, ""),
              updatedAt: new Date(),
            }
          : t,
      ),
    );
    setEditingId(null);
    setEditValue("");
  };

  const handleSave = () => {
    updateTabs(tabs);
  };

  const startEditing = (tab: ProjectTab) => {
    setEditingId(tab.id);
    setEditValue(tab.name);
  };

  return (
    <Card className="border-none shadow-sm bg-white/60 backdrop-blur-sm overflow-hidden">
      <CardHeader className="border-b border-gray-100/50 bg-gray-50/30 py-4">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <Sparkles size={16} className="text-primary" />
          Testing Tabs
        </CardTitle>
        <CardDescription className="text-xs">
          Customize the testing categories for this project. AI-generated tabs
          will be marked with a badge.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* Tab List */}
        <div className="space-y-2">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100 group hover:border-primary/20 transition-colors"
            >
              <GripVertical size={16} className="text-gray-300 cursor-grab" />

              {editingId === tab.id ? (
                <Input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={() => handleEditTab(tab.id, editValue)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleEditTab(tab.id, editValue);
                    if (e.key === "Escape") {
                      setEditingId(null);
                      setEditValue("");
                    }
                  }}
                  className="flex-1 h-8 text-sm"
                  autoFocus
                />
              ) : (
                <span className="flex-1 text-sm font-medium">{tab.name}</span>
              )}

              <div className="flex items-center gap-2">
                {tab.isDefault && (
                  <Badge variant="secondary" className="text-[10px]">
                    Default
                  </Badge>
                )}
                {tab.aiGenerated && (
                  <Badge
                    variant="outline"
                    className="text-[10px] border-primary/20 text-primary"
                  >
                    <Sparkles size={10} className="mr-1" />
                    AI
                  </Badge>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => startEditing(tab)}
                >
                  <Edit2 size={14} className="text-gray-400" />
                </Button>

                {!tab.isDefault && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-600"
                    onClick={() => handleRemoveTab(tab.id)}
                  >
                    <Trash2 size={14} />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Add New Tab */}
        <div className="flex gap-2">
          <Input
            placeholder="New tab name..."
            value={newTabName}
            onChange={(e) => setNewTabName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddTab();
            }}
            className="flex-1"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddTab}
            disabled={!newTabName.trim()}
            className="cursor-pointer"
          >
            <Plus size={16} className="mr-1" />
            Add
          </Button>
        </div>

        {/* Save Button */}
        <div className="pt-2 border-t border-gray-100">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full cursor-pointer"
          >
            {isSaving ? (
              "Saving..."
            ) : (
              <>
                <Save size={16} className="mr-2" />
                Save Tab Configuration
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function ProjectTabsManager({ projectId }: ProjectTabsManagerProps) {
  const { data: savedTabs, isLoading } = useProjectTabs(projectId);

  if (isLoading) {
    return (
      <Card className="border-none shadow-sm bg-white/60 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-1/3" />
            <div className="h-10 bg-gray-200 rounded" />
            <div className="h-10 bg-gray-200 rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Determine initial tabs: use saved tabs if available, otherwise use defaults
  const effectiveTabs =
    savedTabs && savedTabs.length > 0
      ? savedTabs
      : DEFAULT_TABS.map((tab, index) => ({
          ...tab,
          id: `default-tab-${index}`,
          projectId,
          createdAt: new Date(),
          updatedAt: new Date(),
        }));

  return (
    <ProjectTabsEditor projectId={projectId} initialTabs={effectiveTabs} />
  );
}
