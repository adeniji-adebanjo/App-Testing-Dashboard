"use client";

import { useState } from "react";
import {
  Upload,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ChevronRight,
  FileCode,
  Check,
  Target,
  ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TestCase, TestObjective } from "@/types/test-case";
import {
  useUpdateTestCases,
  useUpdateObjectives,
  useUpdateProjectTabs,
} from "@/hooks/useTestData";
import { ProjectTab } from "@/lib/cloudStorage";

interface PRDUploaderProps {
  projectId: string;
  onComplete?: () => void;
}

// Type for AI-generated objectives (different from TestObjective which only has id, description, completed)
interface GeneratedObjective {
  id?: string;
  projectId?: string;
  title?: string;
  description?: string;
  targetValue?: number;
  currentValue?: number;
  unit?: string;
  category?: string;
}

// Type for AI-generated tabs
interface GeneratedTab {
  id?: string;
  projectId?: string;
  name?: string;
  slug?: string;
  description?: string;
  icon?: string;
  order?: number;
  isDefault?: boolean;
  aiGenerated?: boolean;
}

interface ParsedResult {
  tabs: GeneratedTab[];
  testCases: Partial<TestCase>[];
  objectives: GeneratedObjective[];
  analysis: string;
}

export function PRDUploader({ projectId, onComplete }: PRDUploaderProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ParsedResult | null>(null);
  const [importTestCases, setImportTestCases] = useState(true);
  const [importObjectives, setImportObjectives] = useState(true);
  const [importTabs, setImportTabs] = useState(true);

  const { mutate: updateTestCases, isPending: isSavingTests } =
    useUpdateTestCases(projectId);
  const { mutate: updateObjectives, isPending: isSavingObjectives } =
    useUpdateObjectives(projectId);
  const { mutate: updateProjectTabs, isPending: isSavingTabs } =
    useUpdateProjectTabs(projectId);

  const isSaving = isSavingTests || isSavingObjectives || isSavingTabs;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const analyzeWithAI = async () => {
    if (!file) return;

    setIsAnalyzing(true);

    try {
      // Read file content
      const content = await readFileContent(file);

      // Call the AI analysis API
      const response = await fetch("/api/analyze-prd", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          projectId,
          fileName: file.name,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze PRD");
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setResult({
        tabs: data.tabs || [],
        testCases: data.testCases || [],
        objectives: data.objectives || [],
        analysis: data.analysis + (data.usedMock ? " (Demo Mode)" : ""),
      });
    } catch (error) {
      console.error("PRD analysis failed:", error);
      setResult({
        tabs: [],
        testCases: [],
        objectives: [],
        analysis: `Analysis failed: ${error instanceof Error ? error.message : "Unknown error"}. Please try again.`,
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Helper to read file content as text
  const readFileContent = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const content = e.target?.result;
        if (typeof content === "string") {
          resolve(content);
        } else {
          resolve(content?.toString() || "");
        }
      };

      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsText(file);
    });
  };

  const handleImport = async () => {
    if (!result) return;

    try {
      if (importTestCases && result.testCases.length > 0) {
        updateTestCases(result.testCases as TestCase[]);
      }

      if (importObjectives && result.objectives.length > 0) {
        // Convert GeneratedObjective to TestObjective format
        const testObjectives: TestObjective[] = result.objectives.map(
          (obj) => ({
            id:
              obj.id ||
              `obj-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            projectId: projectId,
            description: obj.title
              ? `${obj.title}: ${obj.description || ""} (Target: ${obj.targetValue || 100}${obj.unit || "%"})`
              : obj.description || "",
            completed: false,
          }),
        );
        updateObjectives(testObjectives);
      }

      if (importTabs && result.tabs && result.tabs.length > 0) {
        const tabs: ProjectTab[] = result.tabs.map((t) => ({
          id:
            t.id ||
            `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          projectId,
          name: t.name || "Custom Tab",
          slug: t.slug || "custom-tab",
          description: t.description,
          icon: t.icon,
          order: t.order || 0,
          isDefault: !!t.isDefault,
          aiGenerated: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        }));
        updateProjectTabs(tabs);
      }

      // Reset state after import
      setTimeout(() => {
        setResult(null);
        setFile(null);
        onComplete?.();
      }, 500);
    } catch (error) {
      console.error("Import failed:", error);
    }
  };

  const handleReset = () => {
    setResult(null);
    setFile(null);
  };

  return (
    <div className="space-y-6">
      {!result ? (
        <div
          className={cn(
            "border-2 border-dashed rounded-2xl p-10 transition-all duration-300 flex flex-col items-center justify-center gap-4 text-center",
            file
              ? "border-primary bg-primary/5"
              : "border-gray-200 hover:border-primary/50",
          )}
        >
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary animate-in fade-in zoom-in duration-500">
            {isAnalyzing ? (
              <Loader2 size={32} className="animate-spin" />
            ) : file ? (
              <FileCode size={32} />
            ) : (
              <Upload size={32} />
            )}
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-900">
              {isAnalyzing
                ? "AI Analyzing PRD..."
                : file
                  ? file.name
                  : "Upload PRD Document"}
            </h3>
            <p className="text-sm text-gray-500 max-w-xs mx-auto mt-1">
              {isAnalyzing
                ? "Extracting test cases and objectives..."
                : "Drop your TXT or Markdown PRD to auto-generate test cases and objectives."}
            </p>
          </div>

          {!isAnalyzing && (
            <div className="flex flex-col gap-3 w-full max-w-xs">
              {!file ? (
                <>
                  <input
                    type="file"
                    id="prd-upload"
                    className="hidden"
                    accept=".md,.txt"
                    onChange={handleFileChange}
                  />
                  <Button
                    variant="outline"
                    onClick={() =>
                      document.getElementById("prd-upload")?.click()
                    }
                    className="w-full rounded-xl cursor-pointer"
                  >
                    Select File
                  </Button>
                </>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => setFile(null)}
                    disabled={isAnalyzing}
                    className="flex-1 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={analyzeWithAI}
                    className="flex-1 rounded-xl bg-primary shadow-lg shadow-primary/20 gap-2 cursor-pointer"
                  >
                    <Sparkles size={16} />
                    Analyze with AI
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Analysis Complete Card */}
          <Card className="border-none shadow-sm bg-green-50/50 overflow-hidden">
            <CardContent className="p-4 flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                <CheckCircle2 size={18} />
              </div>
              <div>
                <h4 className="font-bold text-green-900">Analysis Complete</h4>
                <p className="text-xs text-green-700 mt-0.5">
                  {result.analysis}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Tabs Section */}
          {result.tabs && result.tabs.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-purple-600" />
                  <p className="text-xs font-bold text-gray-700">
                    Suggested Tabs ({result.tabs.length})
                  </p>
                </div>
                <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={importTabs}
                    onChange={(e) => setImportTabs(e.target.checked)}
                    className="rounded"
                  />
                  Import
                </label>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.tabs.map((tab, idx) => (
                  <Badge
                    key={idx}
                    variant="outline"
                    className="bg-purple-50 text-purple-700 border-purple-200"
                  >
                    {tab.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Test Cases Section */}
          {result.testCases.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ClipboardList size={14} className="text-blue-600" />
                  <p className="text-xs font-bold text-gray-700">
                    Test Cases ({result.testCases.length})
                  </p>
                </div>
                <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={importTestCases}
                    onChange={(e) => setImportTestCases(e.target.checked)}
                    className="rounded"
                  />
                  Import
                </label>
              </div>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {result.testCases.slice(0, 5).map((tc, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg border border-gray-100 bg-white shadow-sm"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1 min-w-0">
                        <h5 className="text-sm font-bold text-gray-900 flex items-center gap-2 truncate">
                          <Badge
                            variant="outline"
                            className="text-[10px] shrink-0"
                          >
                            {tc.testCaseId}
                          </Badge>
                          <span className="truncate">{tc.scenario}</span>
                        </h5>
                        <p className="text-[10px] text-gray-500 italic">
                          {tc.module} • {tc.steps?.split("\n").length} steps
                        </p>
                      </div>
                      <ChevronRight
                        size={14}
                        className="text-gray-300 shrink-0"
                      />
                    </div>
                  </div>
                ))}
                {result.testCases.length > 5 && (
                  <p className="text-xs text-gray-400 text-center py-2">
                    +{result.testCases.length - 5} more test cases
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Objectives Section */}
          {result.objectives.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target size={14} className="text-purple-600" />
                  <p className="text-xs font-bold text-gray-700">
                    Objectives ({result.objectives.length})
                  </p>
                </div>
                <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={importObjectives}
                    onChange={(e) => setImportObjectives(e.target.checked)}
                    className="rounded"
                  />
                  Import
                </label>
              </div>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {result.objectives.map((obj, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg border border-gray-100 bg-white shadow-sm"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1 min-w-0">
                        <h5 className="text-sm font-bold text-gray-900 truncate">
                          {obj.title}
                        </h5>
                        <p className="text-[10px] text-gray-500 italic line-clamp-1">
                          {obj.description}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-[10px] shrink-0">
                        {obj.targetValue}
                        {obj.unit}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={handleReset}
              className="flex-1 rounded-xl cursor-pointer"
            >
              Back
            </Button>
            <Button
              onClick={handleImport}
              disabled={isSaving || (!importTestCases && !importObjectives)}
              className="flex-1 rounded-xl bg-primary shadow-lg shadow-primary/20 gap-2 cursor-pointer"
            >
              {isSaving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Check size={16} />
              )}
              Import Selected
            </Button>
          </div>
        </div>
      )}

      <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 flex gap-3">
        <AlertCircle size={18} className="text-amber-600 shrink-0" />
        <div className="space-y-1">
          <p className="text-xs font-bold text-amber-900">AI-Powered Feature</p>
          <p className="text-[10px] text-amber-700 leading-relaxed">
            Accuracy depends on document quality. Review generated items before
            finalizing. Supports .txt and .md files.
          </p>
        </div>
      </div>
    </div>
  );
}
