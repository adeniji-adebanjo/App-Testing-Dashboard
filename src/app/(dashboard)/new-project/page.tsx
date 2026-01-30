"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useProject } from "@/context/ProjectContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  ChevronRight,
  ChevronLeft,
  Sparkles,
  FileText,
  Users,
  Code,
  Palette,
  CheckCircle2,
  Rocket,
  Globe,
  Smartphone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Project } from "@/types/project";

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

const STEPS = [
  { id: 1, title: "Basics", icon: FileText },
  { id: 2, title: "Tech Stack", icon: Code },
  { id: 3, title: "Users", icon: Users },
  { id: 4, title: "Customize", icon: Palette },
];

export default function NewProjectPage() {
  const router = useRouter();
  const { createProject } = useProject();
  const [currentStep, setCurrentStep] = useState(1);
  const [isCreating, setIsCreating] = useState(false);

  const [formData, setFormData] = useState<Partial<Project>>({
    name: "",
    shortCode: "",
    description: "",
    projectType: "web",
    status: "active",
    phase: "planning",
    documentVersion: "1.0",
    color: "#6366F1",
    techStack: [],
    targetUsers: [],
  });

  const [techStackInput, setTechStackInput] = useState("");
  const [targetUsersInput, setTargetUsersInput] = useState("");

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
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

  const handleCreate = async () => {
    if (!formData.name || !formData.shortCode) return;

    setIsCreating(true);
    try {
      const newProject = await createProject({
        name: formData.name,
        shortCode: formData.shortCode.toUpperCase(),
        description: formData.description || "",
        projectType: formData.projectType || "web",
        documentVersion: formData.documentVersion || "1.0",
        color: formData.color || "#6366F1",
        techStack: formData.techStack || [],
        targetUsers: formData.targetUsers || [],
      });
      router.push(`/projects/${newProject.id}`);
    } catch (error) {
      console.error("Failed to create project:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.name && formData.shortCode;
      default:
        return true;
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8 animate-in slide-in-from-bottom-4 duration-500">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-bold mb-4">
            <Sparkles size={14} />
            New Project Wizard
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">
            Create a New Project
          </h1>
          <p className="text-gray-500 mt-2">
            Set up your testing dashboard in just a few steps
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8 animate-in slide-in-from-bottom-4 duration-500 delay-100">
          <div className="flex items-center gap-2 bg-white rounded-2xl p-2 shadow-sm border border-gray-100">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() =>
                    step.id < currentStep && setCurrentStep(step.id)
                  }
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl transition-all",
                    currentStep === step.id
                      ? "bg-primary text-white shadow-lg shadow-primary/20"
                      : currentStep > step.id
                        ? "bg-green-100 text-green-700 cursor-pointer hover:bg-green-200"
                        : "text-gray-400",
                  )}
                >
                  {currentStep > step.id ? (
                    <CheckCircle2 size={16} />
                  ) : (
                    <step.icon size={16} />
                  )}
                  <span className="text-sm font-bold hidden sm:inline">
                    {step.title}
                  </span>
                </button>
                {index < STEPS.length - 1 && (
                  <ChevronRight
                    size={16}
                    className="text-gray-300 mx-1 hidden sm:block"
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <Card className="border-none shadow-xl bg-white/80 backdrop-blur-sm animate-in slide-in-from-bottom-4 duration-500 delay-200">
          <CardContent className="p-8">
            {/* Step 1: Basics */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
                    <FileText size={32} className="text-primary" />
                  </div>
                  <h2 className="text-2xl font-black text-gray-900">
                    Basic Information
                  </h2>
                  <p className="text-gray-500 mt-1">
                    Let&apos;s start with the essentials
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">
                      Project Name *
                    </label>
                    <Input
                      value={formData.name || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="e.g. Rosabon Wealth Management App"
                      className="h-12 text-lg bg-gray-50/50 border-gray-200 focus:bg-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">
                      Project Type *
                    </label>
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, projectType: "web" })
                        }
                        className={cn(
                          "flex-1 p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 cursor-pointer",
                          formData.projectType === "web"
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-gray-100 bg-gray-50/50 text-gray-500 hover:border-gray-200",
                        )}
                      >
                        <Globe size={24} />
                        <span className="font-bold">Web App</span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, projectType: "mobile" })
                        }
                        className={cn(
                          "flex-1 p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 cursor-pointer",
                          formData.projectType === "mobile"
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-gray-100 bg-gray-50/50 text-gray-500 hover:border-gray-200",
                        )}
                      >
                        <Smartphone size={24} />
                        <span className="font-bold">Mobile App</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">
                        Short Code *
                      </label>
                      <Input
                        value={formData.shortCode || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            shortCode: e.target.value.toUpperCase(),
                          })
                        }
                        placeholder="e.g. WMA"
                        maxLength={5}
                        className="h-12 text-lg font-mono bg-gray-50/50 border-gray-200 focus:bg-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">
                        Document Version
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
                        className="h-12 text-lg bg-gray-50/50 border-gray-200 focus:bg-white"
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
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      placeholder="Brief description of the project..."
                      rows={3}
                      className="bg-gray-50/50 border-gray-200 focus:bg-white resize-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Tech Stack */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
                    <Code size={32} className="text-primary" />
                  </div>
                  <h2 className="text-2xl font-black text-gray-900">
                    Technology Stack
                  </h2>
                  <p className="text-gray-500 mt-1">
                    What technologies power this project?
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      value={techStackInput}
                      onChange={(e) => setTechStackInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addTechStack()}
                      placeholder="Type technology and press Enter..."
                      className="h-12 bg-gray-50/50 border-gray-200 focus:bg-white"
                    />
                    <Button onClick={addTechStack} className="h-12 px-6">
                      Add
                    </Button>
                  </div>

                  <div className="min-h-[120px] p-4 rounded-2xl bg-gray-50/50 border border-gray-100">
                    {formData.techStack && formData.techStack.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {formData.techStack.map((tech, index) => (
                          <Badge
                            key={index}
                            className="bg-primary/10 text-primary border-none px-4 py-2 text-sm font-medium cursor-pointer hover:bg-red-100 hover:text-red-600 transition-all"
                            onClick={() => removeTechStack(index)}
                          >
                            {tech} ×
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        <p className="text-sm italic">
                          Add technologies like React, Node.js, PostgreSQL...
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <p className="w-full text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-2">
                      Quick Add:
                    </p>
                    {[
                      "React",
                      "Next.js",
                      "Node.js",
                      "TypeScript",
                      "PostgreSQL",
                      "MongoDB",
                    ].map(
                      (tech) =>
                        !formData.techStack?.includes(tech) && (
                          <Button
                            key={tech}
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setFormData({
                                ...formData,
                                techStack: [
                                  ...(formData.techStack || []),
                                  tech,
                                ],
                              })
                            }
                          >
                            + {tech}
                          </Button>
                        ),
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Target Users */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
                    <Users size={32} className="text-primary" />
                  </div>
                  <h2 className="text-2xl font-black text-gray-900">
                    Target Users
                  </h2>
                  <p className="text-gray-500 mt-1">
                    Who will be using this application?
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      value={targetUsersInput}
                      onChange={(e) => setTargetUsersInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addTargetUser()}
                      placeholder="Type user role and press Enter..."
                      className="h-12 bg-gray-50/50 border-gray-200 focus:bg-white"
                    />
                    <Button onClick={addTargetUser} className="h-12 px-6">
                      Add
                    </Button>
                  </div>

                  <div className="min-h-[120px] p-4 rounded-2xl bg-gray-50/50 border border-gray-100">
                    {formData.targetUsers && formData.targetUsers.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {formData.targetUsers.map((user, index) => (
                          <Badge
                            key={index}
                            className="bg-blue-100 text-blue-700 border-none px-4 py-2 text-sm font-medium cursor-pointer hover:bg-red-100 hover:text-red-600 transition-all"
                            onClick={() => removeTargetUser(index)}
                          >
                            {user} ×
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        <p className="text-sm italic">
                          Add user types like Admin, Analyst, Customer...
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <p className="w-full text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-2">
                      Quick Add:
                    </p>
                    {[
                      "Admin",
                      "User",
                      "Analyst",
                      "Manager",
                      "Developer",
                      "Support",
                    ].map(
                      (user) =>
                        !formData.targetUsers?.includes(user) && (
                          <Button
                            key={user}
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setFormData({
                                ...formData,
                                targetUsers: [
                                  ...(formData.targetUsers || []),
                                  user,
                                ],
                              })
                            }
                          >
                            + {user}
                          </Button>
                        ),
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Customize */}
            {currentStep === 4 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
                    <Palette size={32} className="text-primary" />
                  </div>
                  <h2 className="text-2xl font-black text-gray-900">
                    Customize Your Project
                  </h2>
                  <p className="text-gray-500 mt-1">
                    Choose a color and review your settings
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">
                      Project Color
                    </label>
                    <div className="flex flex-wrap gap-3 justify-center">
                      {PROJECT_COLORS.map((color) => (
                        <button
                          key={color}
                          onClick={() => setFormData({ ...formData, color })}
                          className={cn(
                            "w-12 h-12 rounded-xl transition-all hover:scale-110 shadow-lg",
                            formData.color === color
                              ? "ring-4 ring-offset-2 ring-gray-300 scale-110"
                              : "",
                          )}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Preview */}
                  <div
                    className="p-6 rounded-2xl text-white shadow-xl"
                    style={{ backgroundColor: formData.color }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-black">
                        {formData.shortCode || "PRJ"}
                      </div>
                      <div>
                        <h3 className="text-xl font-black">
                          {formData.name || "Project Name"}
                        </h3>
                        <p className="text-white/70 text-sm mt-1">
                          {formData.description || "Your project description"}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/20 flex gap-4 text-sm">
                      <div>
                        <span className="text-white/50">Tech:</span>{" "}
                        {formData.techStack?.slice(0, 3).join(", ") ||
                          "Not set"}
                      </div>
                      <div>
                        <span className="text-white/50">Users:</span>{" "}
                        {formData.targetUsers?.slice(0, 2).join(", ") ||
                          "Not set"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
              <Button
                variant="ghost"
                onClick={handleBack}
                disabled={currentStep === 1}
                className="gap-2"
              >
                <ChevronLeft size={16} />
                Back
              </Button>

              {currentStep < 4 ? (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="gap-2 bg-primary shadow-lg shadow-primary/20"
                >
                  Continue
                  <ChevronRight size={16} />
                </Button>
              ) : (
                <Button
                  onClick={handleCreate}
                  disabled={isCreating || !canProceed()}
                  className="gap-2 bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/20"
                >
                  {isCreating ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Rocket size={16} />
                  )}
                  {isCreating ? "Creating..." : "Create Project"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Back to Hub Link */}
        <div className="text-center mt-6">
          <Button
            variant="ghost"
            onClick={() => router.push("/")}
            className="text-gray-500 hover:text-gray-700"
          >
            ← Back to Project Hub
          </Button>
        </div>
      </div>
    </div>
  );
}
