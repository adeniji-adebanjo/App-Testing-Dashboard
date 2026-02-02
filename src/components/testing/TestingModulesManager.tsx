"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FunctionalModule,
  FunctionalModuleTemplate,
  DefaultTestScenario,
  TestModuleType,
  DEFAULT_FUNCTIONAL_SCENARIOS,
  DEFAULT_NON_FUNCTIONAL_SCENARIOS,
  DEFAULT_FUNCTIONAL_MODULES,
  DEFAULT_NON_FUNCTIONAL_MODULES,
} from "@/types/functional-module";
import {
  ArrowUp,
  ArrowDown,
  Plus,
  Trash2,
  Edit,
  Save,
  GripVertical,
  Settings2,
  FileText,
  ChevronDown,
  ChevronRight,
  Gauge,
  Lock,
  Search,
  Copy,
  Layout,
  Shield,
  User,
  Monitor,
  Database,
  Code,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TestingModulesManagerProps {
  projectId: string;
  moduleType: TestModuleType;
  modules: FunctionalModule[] | undefined;
  templates: FunctionalModuleTemplate[] | undefined;
  isLoading: boolean;
  onSaveModules: (modules: FunctionalModule[]) => Promise<void>;
  onSaveTemplates: (templates: FunctionalModuleTemplate[]) => Promise<void>;
  isSaving?: boolean;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export default function TestingModulesManager({
  projectId,
  moduleType,
  modules,
  templates,
  isLoading,
  onSaveModules,
  onSaveTemplates,
  isSaving = false,
}: TestingModulesManagerProps) {
  const [localModules, setLocalModules] = useState<FunctionalModule[]>([]);
  const [localTemplates, setLocalTemplates] = useState<
    FunctionalModuleTemplate[]
  >([]);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const [editingModule, setEditingModule] = useState<string | null>(null);
  const [editingScenario, setEditingScenario] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Get defaults based on module type
  const getDefaultModules = () => {
    const defaults =
      moduleType === "functional"
        ? DEFAULT_FUNCTIONAL_MODULES
        : DEFAULT_NON_FUNCTIONAL_MODULES;

    return defaults.map((m, idx) => ({
      name: m.name,
      slug: m.slug || m.name.toLowerCase().replace(/\s+/g, "-"),
      description: m.description,
      icon: m.icon,
      order: idx,
      isDefault: true,
    }));
  };

  const getDefaultScenarios = () => {
    return moduleType === "functional"
      ? DEFAULT_FUNCTIONAL_SCENARIOS
      : DEFAULT_NON_FUNCTIONAL_SCENARIOS;
  };

  // Initialize with defaults if no modules exist
  useEffect(() => {
    if (isLoading) return;

    if (modules && modules.length > 0) {
      setLocalModules(modules);
      setLocalTemplates(templates || []);
    } else {
      // Initialize with default modules
      const now = new Date();
      const defaultModulesRaw = getDefaultModules();
      const defaultScenarios = getDefaultScenarios();

      const defaultModules: FunctionalModule[] = defaultModulesRaw.map(
        (m, idx) => ({
          ...m,
          id: generateId(),
          projectId,
          moduleType,
          createdAt: now,
          updatedAt: now,
          order: idx,
        }),
      );

      const defaultTemplates: FunctionalModuleTemplate[] = defaultModules.map(
        (mod) => ({
          id: generateId(),
          moduleId: mod.id,
          projectId,
          testCaseIdPrefix: mod.slug.toUpperCase().slice(0, 4),
          defaultScenarios: (defaultScenarios[mod.slug] || []).map(
            (s, idx) => ({
              ...s,
              id: generateId(),
              order: idx,
            }),
          ),
          createdAt: now,
          updatedAt: now,
        }),
      );

      setLocalModules(defaultModules);
      setLocalTemplates(defaultTemplates);
      setHasChanges(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modules, templates, isLoading, projectId]);

  const handleSave = useCallback(async () => {
    await Promise.all([
      onSaveModules(localModules),
      onSaveTemplates(localTemplates),
    ]);
    setHasChanges(false);
  }, [localModules, localTemplates, onSaveModules, onSaveTemplates]);

  const addModule = () => {
    const now = new Date();
    const newModule: FunctionalModule = {
      id: generateId(),
      projectId,
      moduleType,
      name: "New Module",
      slug: `module-${localModules.length + 1}`,
      description: "",
      order: localModules.length,
      isDefault: false,
      createdAt: now,
      updatedAt: now,
    };

    const newTemplate: FunctionalModuleTemplate = {
      id: generateId(),
      moduleId: newModule.id,
      projectId,
      testCaseIdPrefix: `MOD${localModules.length + 1}`,
      defaultScenarios: [],
      createdAt: now,
      updatedAt: now,
    };

    setLocalModules([...localModules, newModule]);
    setLocalTemplates([...localTemplates, newTemplate]);
    setEditingModule(newModule.id);
    setExpandedModule(newModule.id);
    setHasChanges(true);
  };

  const deleteModule = (moduleId: string) => {
    setLocalModules(localModules.filter((m) => m.id !== moduleId));
    setLocalTemplates(localTemplates.filter((t) => t.moduleId !== moduleId));
    setHasChanges(true);
  };

  const updateModule = (
    moduleId: string,
    updates: Partial<FunctionalModule>,
  ) => {
    setLocalModules(
      localModules.map((m) =>
        m.id === moduleId ? { ...m, ...updates, updatedAt: new Date() } : m,
      ),
    );
    setHasChanges(true);
  };

  const getTemplateForModule = (moduleId: string) => {
    return localTemplates.find((t) => t.moduleId === moduleId);
  };

  const updateTemplate = (
    moduleId: string,
    updates: Partial<FunctionalModuleTemplate>,
  ) => {
    setLocalTemplates(
      localTemplates.map((t) =>
        t.moduleId === moduleId
          ? { ...t, ...updates, updatedAt: new Date() }
          : t,
      ),
    );
    setHasChanges(true);
  };

  const addScenario = (moduleId: string) => {
    const template = getTemplateForModule(moduleId);
    if (!template) return;

    const newScenario: DefaultTestScenario = {
      id: generateId(),
      testCaseId: `${template.testCaseIdPrefix}-${String(template.defaultScenarios.length + 1).padStart(3, "0")}`,
      scenario: "New test scenario",
      expectedResult: "Expected outcome",
      order: template.defaultScenarios.length,
    };

    updateTemplate(moduleId, {
      defaultScenarios: [...template.defaultScenarios, newScenario],
    });
    setEditingScenario(newScenario.id);
  };

  const deleteScenario = (moduleId: string, scenarioId: string) => {
    const template = getTemplateForModule(moduleId);
    if (!template) return;

    updateTemplate(moduleId, {
      defaultScenarios: template.defaultScenarios.filter(
        (s) => s.id !== scenarioId,
      ),
    });
  };

  const updateScenario = (
    moduleId: string,
    scenarioId: string,
    updates: Partial<DefaultTestScenario>,
  ) => {
    const template = getTemplateForModule(moduleId);
    if (!template) return;

    updateTemplate(moduleId, {
      defaultScenarios: template.defaultScenarios.map((s) =>
        s.id === scenarioId ? { ...s, ...updates } : s,
      ),
    });
  };

  const moveModule = (moduleId: string, direction: "up" | "down") => {
    const activeModule = localModules.find((m) => m.id === moduleId);
    if (!activeModule) return;

    const otherModules = localModules.filter((m) => m.id !== moduleId);
    const index = localModules.indexOf(activeModule);
    const newIndex = direction === "up" ? index - 1 : index + 1;

    if (newIndex < 0 || newIndex >= localModules.length) return;

    const newModules = [...localModules];
    newModules.splice(index, 1);
    newModules.splice(newIndex, 0, activeModule);

    // Update orders
    const updatedModules = newModules.map((m, idx) => ({
      ...m,
      order: idx,
      updatedAt: new Date(),
    }));

    setLocalModules(updatedModules);
    setHasChanges(true);
  };

  const moveScenario = (
    moduleId: string,
    scenarioId: string,
    direction: "up" | "down",
  ) => {
    const template = getTemplateForModule(moduleId);
    if (!template) return;

    const scenarios = [...template.defaultScenarios].sort(
      (a, b) => a.order - b.order,
    );
    const activeScenario = scenarios.find((s) => s.id === scenarioId);
    if (!activeScenario) return;

    const index = scenarios.indexOf(activeScenario);
    const newIndex = direction === "up" ? index - 1 : index + 1;

    if (newIndex < 0 || newIndex >= scenarios.length) return;

    scenarios.splice(index, 1);
    scenarios.splice(newIndex, 0, activeScenario);

    const updatedScenarios = scenarios.map((s, idx) => ({
      ...s,
      order: idx,
    }));

    updateTemplate(moduleId, { defaultScenarios: updatedScenarios });
  };

  const title =
    moduleType === "functional"
      ? "Functional Testing Modules"
      : "Non-Functional Testing Modules";

  const description =
    moduleType === "functional"
      ? "Customize the modules and default test scenarios for functional testing"
      : "Customize the modules and default test scenarios for performance, security, and other non-functional tests";

  const TitleIcon = moduleType === "functional" ? Settings2 : Gauge;

  const renderModuleIcon = (iconName: string | undefined) => {
    switch (iconName) {
      case "lock":
        return <Lock className="h-4 w-4" />;
      case "search":
        return <Search className="h-4 w-4" />;
      case "copy":
        return <Copy className="h-4 w-4" />;
      case "api":
        return <Database className="h-4 w-4" />;
      case "gauge":
        return <Gauge className="h-4 w-4" />;
      case "shield":
        return <Shield className="h-4 w-4" />;
      case "user":
        return <User className="h-4 w-4" />;
      case "monitor":
        return <Monitor className="h-4 w-4" />;
      case "database":
        return <Database className="h-4 w-4" />;
      case "code":
        return <Code className="h-4 w-4" />;
      default:
        return <Layout className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <TitleIcon className="h-5 w-5 text-primary" />
            {title}
          </h2>
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <Badge
              variant="outline"
              className="bg-amber-50 text-amber-700 border-amber-200"
            >
              Unsaved changes
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={addModule}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Module
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Modules List */}
      <div className="space-y-4">
        {localModules
          .sort((a, b) => a.order - b.order)
          .map((module) => {
            const template = getTemplateForModule(module.id);
            const isExpanded = expandedModule === module.id;
            const isEditing = editingModule === module.id;

            return (
              <Card
                key={module.id}
                className={cn(
                  "border transition-all duration-200",
                  isExpanded
                    ? "border-primary/30 shadow-md"
                    : "border-gray-200",
                )}
              >
                <CardHeader className="py-3 px-4 bg-gray-50/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() =>
                          setExpandedModule(isExpanded ? null : module.id)
                        }
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-gray-500" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-gray-500" />
                        )}
                      </button>
                      <GripVertical className="h-4 w-4 text-gray-300 cursor-grab" />

                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={module.name}
                            onChange={(e) =>
                              updateModule(module.id, { name: e.target.value })
                            }
                            className="px-2 py-1 text-sm font-semibold border rounded focus:ring-1 focus:ring-primary outline-none"
                            placeholder="Module name"
                            autoFocus
                          />
                          <input
                            type="text"
                            value={module.slug}
                            onChange={(e) =>
                              updateModule(module.id, {
                                slug: e.target.value
                                  .toLowerCase()
                                  .replace(/\s+/g, "-"),
                              })
                            }
                            className="px-2 py-1 text-xs border rounded focus:ring-1 focus:ring-primary outline-none w-24"
                            placeholder="slug"
                          />
                          <button
                            onClick={() => setEditingModule(null)}
                            className="p-1 hover:bg-gray-200 rounded text-green-600"
                          >
                            <Save className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-white border border-gray-100 rounded-lg shadow-sm text-primary">
                            {renderModuleIcon(module.icon)}
                          </div>
                          <CardTitle className="text-sm font-bold text-gray-900 tracking-tight">
                            {module.name}
                          </CardTitle>
                          <Badge
                            variant="outline"
                            className="text-[10px] bg-white text-gray-400 border-gray-100 font-medium"
                          >
                            {module.slug}
                          </Badge>
                          {module.isDefault && (
                            <Badge className="text-[9px] bg-primary/5 text-primary border-none font-bold uppercase tracking-wider px-1.5 py-0">
                              System
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center border border-gray-100 rounded-lg overflow-hidden bg-white">
                        <button
                          onClick={() => moveModule(module.id, "up")}
                          disabled={module.order === 0}
                          className="p-1 hover:bg-gray-50 disabled:opacity-30 transition-colors border-r border-gray-100"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => moveModule(module.id, "down")}
                          disabled={module.order === localModules.length - 1}
                          className="p-1 hover:bg-gray-50 disabled:opacity-30 transition-colors"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {template?.defaultScenarios.length || 0} scenarios
                      </Badge>
                      <button
                        onClick={() =>
                          setEditingModule(isEditing ? null : module.id)
                        }
                        className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                      >
                        <Edit className="h-3.5 w-3.5 text-gray-500" />
                      </button>
                      <button
                        onClick={() => deleteModule(module.id)}
                        className="p-1.5 hover:bg-red-100 rounded transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-red-500" />
                      </button>
                    </div>
                  </div>

                  {isEditing && (
                    <div className="mt-3 space-y-3">
                      <div>
                        <Label className="text-xs text-gray-500">
                          Description
                        </Label>
                        <input
                          type="text"
                          value={module.description || ""}
                          onChange={(e) =>
                            updateModule(module.id, {
                              description: e.target.value,
                            })
                          }
                          className="w-full px-2 py-1.5 text-sm border rounded focus:ring-1 focus:ring-primary outline-none mt-1"
                          placeholder="Module description..."
                        />
                      </div>
                      <div className="flex gap-4">
                        <div>
                          <Label className="text-xs text-gray-500">
                            Test ID Prefix
                          </Label>
                          <input
                            type="text"
                            value={template?.testCaseIdPrefix || ""}
                            onChange={(e) =>
                              updateTemplate(module.id, {
                                testCaseIdPrefix: e.target.value.toUpperCase(),
                              })
                            }
                            className="w-24 px-2 py-1.5 text-sm border rounded focus:ring-1 focus:ring-primary outline-none mt-1 uppercase"
                            placeholder="AUTH"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">Order</Label>
                          <input
                            type="number"
                            value={module.order}
                            onChange={(e) =>
                              updateModule(module.id, {
                                order: parseInt(e.target.value) || 0,
                              })
                            }
                            className="w-16 px-2 py-1.5 text-sm border rounded focus:ring-1 focus:ring-primary outline-none mt-1"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </CardHeader>

                {isExpanded && (
                  <CardContent className="pt-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Default Test Scenarios
                        </Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => addScenario(module.id)}
                          className="h-7 text-xs gap-1"
                        >
                          <Plus className="h-3 w-3" />
                          Add Scenario
                        </Button>
                      </div>

                      {template?.defaultScenarios.length === 0 ? (
                        <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed rounded-lg">
                          No default scenarios. Click &quot;Add Scenario&quot;
                          to create one.
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {template?.defaultScenarios
                            .sort((a, b) => a.order - b.order)
                            .map((scenario) => {
                              const isEditingThis =
                                editingScenario === scenario.id;

                              return (
                                <div
                                  key={scenario.id}
                                  className={cn(
                                    "p-3 border rounded-lg transition-all",
                                    isEditingThis
                                      ? "border-primary/30 bg-primary/5"
                                      : "border-gray-200 bg-white",
                                  )}
                                >
                                  {isEditingThis ? (
                                    <div className="space-y-3">
                                      <div className="flex items-center gap-2">
                                        <input
                                          type="text"
                                          value={scenario.testCaseId}
                                          onChange={(e) =>
                                            updateScenario(
                                              module.id,
                                              scenario.id,
                                              {
                                                testCaseId: e.target.value,
                                              },
                                            )
                                          }
                                          className="w-28 px-2 py-1 text-xs font-mono border rounded focus:ring-1 focus:ring-primary outline-none"
                                          placeholder="TEST-001"
                                        />
                                        <input
                                          type="text"
                                          value={scenario.scenario}
                                          onChange={(e) =>
                                            updateScenario(
                                              module.id,
                                              scenario.id,
                                              {
                                                scenario: e.target.value,
                                              },
                                            )
                                          }
                                          className="flex-1 px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-primary outline-none"
                                          placeholder="Test scenario description"
                                        />
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Label className="text-xs text-gray-500 w-20">
                                          Expected:
                                        </Label>
                                        <input
                                          type="text"
                                          value={scenario.expectedResult}
                                          onChange={(e) =>
                                            updateScenario(
                                              module.id,
                                              scenario.id,
                                              {
                                                expectedResult: e.target.value,
                                              },
                                            )
                                          }
                                          className="flex-1 px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-primary outline-none"
                                          placeholder="Expected result"
                                        />
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Label className="text-xs text-gray-500 w-20">
                                          Steps:
                                        </Label>
                                        <input
                                          type="text"
                                          value={scenario.steps || ""}
                                          onChange={(e) =>
                                            updateScenario(
                                              module.id,
                                              scenario.id,
                                              {
                                                steps: e.target.value,
                                              },
                                            )
                                          }
                                          className="flex-1 px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-primary outline-none"
                                          placeholder="Optional test steps"
                                        />
                                      </div>
                                      <div className="flex justify-end gap-2">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() =>
                                            setEditingScenario(null)
                                          }
                                          className="h-7 text-xs"
                                        >
                                          Done
                                        </Button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-3">
                                        <FileText className="h-4 w-4 text-gray-400" />
                                        <span className="text-xs font-mono text-gray-500">
                                          {scenario.testCaseId}
                                        </span>
                                        <span className="text-sm text-gray-900">
                                          {scenario.scenario}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <div className="flex items-center border border-gray-100 rounded md overflow-hidden bg-gray-50/50">
                                          <button
                                            onClick={() =>
                                              moveScenario(
                                                module.id,
                                                scenario.id,
                                                "up",
                                              )
                                            }
                                            className="p-1 hover:bg-white disabled:opacity-30 transition-colors border-r border-gray-100"
                                          >
                                            <ArrowUp className="h-2.5 w-2.5" />
                                          </button>
                                          <button
                                            onClick={() =>
                                              moveScenario(
                                                module.id,
                                                scenario.id,
                                                "down",
                                              )
                                            }
                                            className="p-1 hover:bg-white disabled:opacity-30 transition-colors"
                                          >
                                            <ArrowDown className="h-2.5 w-2.5" />
                                          </button>
                                        </div>
                                        <span className="text-xs text-gray-500 max-w-[200px] truncate">
                                          → {scenario.expectedResult}
                                        </span>
                                        <button
                                          onClick={() =>
                                            setEditingScenario(scenario.id)
                                          }
                                          className="p-1 hover:bg-gray-100 rounded"
                                        >
                                          <Edit className="h-3 w-3 text-gray-400" />
                                        </button>
                                        <button
                                          onClick={() =>
                                            deleteScenario(
                                              module.id,
                                              scenario.id,
                                            )
                                          }
                                          className="p-1 hover:bg-red-50 rounded"
                                        >
                                          <Trash2 className="h-3 w-3 text-red-400" />
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                        </div>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
      </div>

      {localModules.length === 0 && (
        <div className="text-center py-12 text-gray-400 border-2 border-dashed rounded-lg">
          <TitleIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">No modules configured</p>
          <p className="text-sm mt-1">
            Click &quot;Add Module&quot; to create your first testing module
          </p>
        </div>
      )}
    </div>
  );
}
