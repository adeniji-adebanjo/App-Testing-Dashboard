"use client";

import { useProject } from "@/context/ProjectContext";
import {
  Check,
  ChevronsUpDown,
  LayoutGrid,
  PlusCircle,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter, useParams } from "next/navigation";

export default function ProjectSwitcher({ className }: { className?: string }) {
  const { projects, currentProject } = useProject();
  const router = useRouter();
  const { projectId } = useParams();

  const handleValueChange = (value: string) => {
    if (value === "hub") {
      router.push("/");
    } else if (value === "new") {
      router.push("/new-project");
    } else {
      router.push(`/projects/${value}`);
    }
  };

  return (
    <div className={cn("space-y-1", className)}>
      <p className="text-[10px] font-bold uppercase text-gray-400 px-2 mb-1 tracking-wider">
        Current Project
      </p>
      <Select
        value={(projectId as string) || "hub"}
        onValueChange={handleValueChange}
      >
        <SelectTrigger className="w-full bg-gray-800 border-gray-700 text-white hover:bg-gray-700 transition-colors h-12">
          <SelectValue placeholder="Select Project" />
        </SelectTrigger>
        <SelectContent className="bg-gray-800 border-gray-700 text-white">
          <SelectItem
            value="hub"
            className="focus:bg-gray-700 focus:text-white"
          >
            <div className="flex items-center gap-2">
              <LayoutGrid size={16} className="text-primary" />
              <span>Project Hub</span>
            </div>
          </SelectItem>

          <div className="h-px bg-gray-700 my-1" />

          {projects.map((project) => (
            <SelectItem
              key={project.id}
              value={project.id}
              className="focus:bg-gray-700 focus:text-white"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: project.color }}
                />
                <span className="truncate max-w-[140px]">{project.name}</span>
              </div>
            </SelectItem>
          ))}

          <div className="h-px bg-gray-700 my-1" />

          <SelectItem
            value="new"
            className="focus:bg-gray-700 focus:text-white text-primary"
          >
            <div className="flex items-center gap-2">
              <PlusCircle size={16} />
              <span>New Project</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
