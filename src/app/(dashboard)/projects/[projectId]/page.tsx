"use client";

import { useProject } from "@/context/ProjectContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  TrendingUp,
  Target,
  FlaskConical,
  Bug,
  Layout,
  Sparkles,
} from "lucide-react";
import ObjectivesCheckList from "@/components/testing/ObjectivesCheckList";
import TestEnvironmentSetup from "@/components/testing/TestEnvironmentSetup";
import SignOffSection from "@/components/testing/SignOffSection";
import { PRDUploader } from "@/components/project/PRDUploader";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function ProjectPage() {
  const { currentProject, currentProjectStats } = useProject();
  const { projectId } = useParams();

  if (!currentProject) return null;

  const stats = [
    {
      title: "Total Test Cases",
      value: currentProjectStats?.totalTestCases || 0,
      icon: FlaskConical,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Tests Passed",
      value: currentProjectStats?.passed || 0,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Tests Failed",
      value: currentProjectStats?.failed || 0,
      icon: AlertCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      title: "Open Defects",
      value: currentProjectStats?.defectsOpen || 0,
      icon: Bug,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  return (
    <div className="space-y-8 pb-10 animate-in slide-in-from-bottom-2 duration-500">
      {/* Project Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="w-full">
          <div className="flex items-center gap-2 mb-3 text-primary font-bold tracking-tighter text-[10px] sm:text-sm italic">
            PROJECT OVERVIEW
            <div className="h-px w-6 sm:w-8 bg-primary/20" />
          </div>
          <h2 className="text-3xl font-black tracking-tight text-gray-900 sm:text-5xl leading-tight">
            {currentProject.name}
          </h2>
          <p className="mt-3 text-gray-500 max-w-3xl leading-relaxed text-base sm:text-lg">
            {currentProject.description}
          </p>
        </div>
        <div
          className="w-full md:w-auto px-5 py-3 sm:px-6 sm:py-3 rounded-2xl text-white font-black flex items-center justify-center gap-2 shadow-2xl shadow-primary/20"
          style={{ backgroundColor: currentProject.color }}
        >
          <Target size={18} className="sm:w-5 sm:h-5" />
          <span className="text-lg sm:text-xl shrink-0">
            {currentProjectStats?.passRate}% Progress
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card
            key={stat.title}
            className="border-none shadow-sm bg-white/60 backdrop-blur-sm overflow-hidden group hover:shadow-xl transition-all border border-gray-100/50"
          >
            <CardContent className="p-4 sm:p-6 relative">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 truncate">
                    {stat.title}
                  </p>
                  <p className="text-2xl sm:text-3xl font-black text-gray-900">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={cn(
                    "rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-inner transition-transform group-hover:scale-110 group-hover:rotate-3 duration-500 w-fit",
                    stat.bgColor,
                  )}
                >
                  <stat.icon
                    className={cn("w-5 h-5 sm:w-6 sm:h-6", stat.color)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          {/* Main Info */}
          <Card className="border-none shadow-sm overflow-hidden bg-white/40 backdrop-blur-md">
            <CardHeader className="border-b border-gray-100/50 bg-gray-50/30 py-4 px-4 sm:px-6">
              <div className="flex items-center gap-2">
                <Layout className="h-5 w-5 text-primary" />
                <CardTitle className="text-base sm:text-lg">
                  Project Highlights
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6 sm:pt-8 px-4 sm:px-6 pb-6 sm:pb-8">
              <div className="grid gap-8 sm:gap-10 sm:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <p className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                      Target Audience
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {currentProject.targetUsers.map((user) => (
                        <Badge
                          key={user}
                          variant="secondary"
                          className="bg-primary/5 text-primary hover:bg-primary/10 border-none px-2.5 py-1 sm:px-3 sm:py-1.5 font-bold text-[10px] sm:text-xs"
                        >
                          {user}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="pt-4">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                      Document Specs
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col">
                        <span className="text-2xl font-black text-gray-900">
                          {currentProject.documentVersion}
                        </span>
                        <span className="text-[10px] text-gray-400 font-bold">
                          VERSION
                        </span>
                      </div>
                      <div className="h-8 w-px bg-gray-100" />
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-700">
                          {new Date(
                            currentProject.createdAt,
                          ).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase">
                          Published
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                      Infrastructure Stack
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {currentProject.techStack.map((tech) => (
                        <Badge
                          key={tech}
                          variant="outline"
                          className="text-[10px] font-mono border-gray-200 bg-white/50 px-2 py-1 text-gray-600"
                        >
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="pt-4">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                      Environment Type
                    </p>
                    <Badge className="bg-orange-50 text-orange-600 border border-orange-100 rounded-lg px-3 py-1.5 font-black text-xs uppercase italic">
                      Enterprise Grade
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Testing Objectives */}
          <ObjectivesCheckList key={projectId as string} />
        </div>

        <div className="space-y-8">
          {/* Test Environment */}
          <TestEnvironmentSetup key={projectId as string} />

          {/* Quick Actions */}
          <Card className="bg-linear-to-br from-gray-900 to-gray-800 text-white border-none shadow-2xl shadow-gray-300 overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-700">
              <Target size={160} />
            </div>
            <CardHeader className="relative z-10">
              <CardTitle className="text-2xl font-black">
                Ready to Test?
              </CardTitle>
              <CardDescription className="text-gray-400 font-medium">
                Log results for feature modules or security benchmarks.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 relative z-10 pt-4">
              <Link
                href={`/projects/${projectId}/functional-testing`}
                className="block"
              >
                <Button
                  className="w-full py-6 rounded-xl font-black text-sm shadow-xl cursor-pointer shadow-black/20 hover:scale-[1.02] transition-all"
                  style={{ backgroundColor: currentProject.color }}
                >
                  START FUNCTIONAL TESTING
                </Button>
              </Link>
              <Link href={`/projects/${projectId}/reports`} className="block">
                <Button
                  variant="outline"
                  className="w-full py-6 rounded-xl font-black text-sm bg-white/5 cursor-pointer  hover:scale-[1] hover:text-black transition-all border border-white/10"
                >
                  GENERATE AUDIT REPORT
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Sign Off */}
          <SignOffSection key={projectId as string} />

          {/* PRD Analysis */}
          <Card className="border-none shadow-sm bg-white/60 backdrop-blur-sm overflow-hidden">
            <CardHeader className="border-b border-gray-100/50 bg-gray-50/30 py-4">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Sparkles size={16} className="text-primary" />
                AI PRD Analysis
              </CardTitle>
              <CardDescription className="text-xs">
                Generate test cases from documents
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <PRDUploader projectId={currentProject.id} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
