"use client";

import { ProjectWithStats } from "@/types/project";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
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

interface ProjectListItemProps {
  project: ProjectWithStats;
}

export default function ProjectListItem({ project }: ProjectListItemProps) {
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
      <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl hover:shadow-lg hover:border-primary/50 transition-all duration-300">
        <div
          className="p-3 rounded-xl shrink-0"
          style={{
            backgroundColor: `${project.color}15`,
            color: project.color,
          }}
        >
          <Icon size={24} />
        </div>

        <div className="flex-1 min-w-0 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors truncate">
              {project.name}
            </h3>
            <div className="flex gap-2 items-center mx-auto sm:mx-0">
              <Badge
                variant="outline"
                className="text-[9px] uppercase font-black px-1.5 py-0 border-none bg-gray-100 text-gray-400 flex items-center gap-1"
              >
                {project.projectType === "mobile" ? (
                  <Smartphone size={10} strokeWidth={3} />
                ) : (
                  <Monitor size={10} strokeWidth={3} />
                )}
                {project.projectType === "mobile" ? "Mobile" : "Web"}
              </Badge>
              <Badge
                variant="outline"
                className={cn(
                  "text-[9px] uppercase font-black px-2 py-0",
                  statusColors[project.status],
                )}
              >
                {project.status}
              </Badge>
            </div>
            <span className="text-xs font-mono text-gray-400 hidden sm:inline">
              {project.shortCode}
            </span>
          </div>
          <p className="text-sm text-gray-500 line-clamp-1">
            {project.description}
          </p>
        </div>

        <div className="hidden lg:flex flex-col gap-1 w-48 mx-4">
          <div className="flex justify-between text-[10px] font-bold uppercase text-gray-400">
            <span>Pass Rate</span>
            <span>{project.stats.passRate}%</span>
          </div>
          <Progress
            value={project.stats.passRate}
            className="h-1.5"
            style={
              { "--progress-foreground": project.color } as React.CSSProperties
            }
          />
        </div>

        <div className="hidden md:flex items-center gap-4 shrink-0 px-4 border-l border-gray-100">
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold uppercase text-gray-400">
              Passed
            </span>
            <span className="text-sm font-black text-green-600">
              {project.stats.passed}
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold uppercase text-gray-400">
              Failed
            </span>
            <span className="text-sm font-black text-red-600">
              {project.stats.failed}
            </span>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-2">
          <div className="hidden sm:flex flex-col items-end gap-1">
            <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase bg-gray-50 px-2 py-1 rounded-md">
              <Clock size={12} />
              {phaseLabels[project.phase]}
            </div>
            <span className="text-[9px] text-gray-300 font-medium px-1">
              Mutated: {new Date(project.updatedAt).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const shareUrl = `${window.location.origin}/share/${project.id}`;
                navigator.clipboard.writeText(shareUrl);
                alert("Private share link copied to clipboard!");
              }}
              className="h-8 w-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-900 hover:text-white transition-all cursor-pointer"
              title="Copy Private Share Link"
            >
              <ArrowRight size={16} className="-rotate-45" />
            </button>
            <div className="h-8 w-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-primary/10 group-hover:text-primary transition-all">
              <ArrowRight size={16} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
