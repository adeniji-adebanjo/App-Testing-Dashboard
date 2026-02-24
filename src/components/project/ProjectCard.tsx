"use client";

import { ProjectWithStats } from "@/types/project";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Monitor,
  Smartphone,
  CreditCard,
  Wallet,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const iconMap = {
  "credit-card": CreditCard,
  wallet: Wallet,
  monitor: Monitor,
  smartphone: Smartphone,
  settings: Settings,
};

interface ProjectCardProps {
  project: ProjectWithStats;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const Icon = iconMap[project.icon as keyof typeof iconMap] || Monitor;

  const statusColors = {
    active: "bg-green-500/10 text-green-500 border-green-500/20",
    completed: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    "on-hold": "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    archived: "bg-gray-500/10 text-gray-500 border-gray-500/20",
  };

  const phaseLabels = {
    planning: "Planning",
    development: "Development",
    testing: "Testing",
    uat: "UAT",
    completed: "Completed",
  };

  return (
    <Link href={`/projects/${project.id}`} className="block group">
      <Card className="h-full overflow-hidden border-gray-200 transition-all duration-300 hover:shadow-xl hover:border-primary/50 bg-white/50 backdrop-blur-sm">
        <div
          className="h-2 w-full"
          style={{ backgroundColor: project.color }}
        />
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start mb-2">
            <div className="flex gap-2">
              <div
                className="p-2 rounded-lg"
                style={{
                  backgroundColor: `${project.color}15`,
                  color: project.color,
                }}
              >
                <Icon size={20} />
              </div>
              <Badge
                variant="outline"
                className="text-[9px] uppercase font-black px-1.5 py-0 border-none bg-gray-100 text-gray-500 h-5 flex items-center gap-1 self-center"
              >
                {project.projectType === "mobile" ? (
                  <Smartphone size={10} strokeWidth={3} />
                ) : (
                  <Monitor size={10} strokeWidth={3} />
                )}
                {project.projectType === "mobile" ? "Mobile" : "Web"}
              </Badge>
            </div>
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] uppercase font-bold px-2 py-0",
                statusColors[project.status],
              )}
            >
              {project.status}
            </Badge>
          </div>
          <CardTitle className="text-xl group-hover:text-primary transition-colors flex items-center justify-between">
            {project.name}
            <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
          </CardTitle>
          <CardDescription className="line-clamp-2 min-h-[40px]">
            {project.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progress Section */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-gray-500">Test Completion</span>
              <span className="text-gray-900">{project.stats.passRate}%</span>
            </div>
            <Progress
              value={project.stats.passRate}
              className="h-1.5"
              style={
                {
                  "--progress-foreground": project.color,
                } as React.CSSProperties
              }
            />
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-gray-50 border border-gray-100">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 leading-none">
                  Passed
                </span>
                <span className="text-sm font-bold">
                  {project.stats.passed}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-gray-50 border border-gray-100">
              <AlertCircle className="h-3.5 w-3.5 text-red-500" />
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 leading-none">
                  Failed
                </span>
                <span className="text-sm font-bold">
                  {project.stats.failed}
                </span>
              </div>
            </div>
          </div>

          {/* Tech Stack Previews */}
          <div className="flex flex-wrap gap-1 mt-2">
            {project.techStack.slice(0, 3).map((tech) => (
              <Badge
                key={tech}
                variant="secondary"
                className="text-[10px] font-normal py-0 px-1.5 bg-gray-100 text-gray-600 border-none"
              >
                {tech}
              </Badge>
            ))}
            {project.techStack.length > 3 && (
              <span className="text-[10px] text-gray-400">
                +{project.techStack.length - 3}
              </span>
            )}
          </div>
        </CardContent>
        <CardFooter className="pb-4 flex flex-col gap-2 border-t border-gray-50 mt-auto pt-4">
          <div className="flex justify-between items-center w-full text-xs text-gray-400">
            <div className="flex items-center gap-1">
              <Clock size={12} />
              <span>Phase: {phaseLabels[project.phase]}</span>
            </div>
            <span className="font-mono">{project.shortCode}</span>
          </div>
          <div className="text-[10px] text-gray-300 flex items-center gap-1 px-1">
            <div className="w-1 h-1 rounded-full bg-gray-300" />
            Last mutated: {new Date(
              project.updatedAt,
            ).toLocaleDateString()} at{" "}
            {new Date(project.updatedAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const shareUrl = `${window.location.origin}/share/${project.id}`;
              navigator.clipboard.writeText(shareUrl);
              alert("Private share link copied to clipboard!");
            }}
            className="mt-2 w-full flex items-center justify-center gap-2 py-2 px-3 bg-gray-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-black transition-colors"
          >
            <ArrowRight size={12} className="-rotate-45" />
            Share Private Link
          </button>
        </CardFooter>
      </Card>
    </Link>
  );
}
