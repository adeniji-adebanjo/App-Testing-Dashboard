"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  ClipboardList,
  Activity,
  Bug,
  BarChart3,
  FileText,
  X,
  LayoutGrid,
  ChevronRight,
  Settings,
} from "lucide-react";
import ProjectSwitcher from "@/components/project/ProjectSwitcher";
import { useProject } from "@/context/ProjectContext";

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const { projectId } = useParams();
  const { currentProject } = useProject();

  const getNavItems = () => {
    if (!projectId) {
      return [{ name: "Project Hub", href: "/", icon: LayoutGrid }];
    }

    const base = `/projects/${projectId}`;
    return [
      { name: "Overview", href: base, icon: Home },
      {
        name: "Functional Testing",
        href: `${base}/functional-testing`,
        icon: ClipboardList,
      },
      {
        name: "Non-Functional Testing",
        href: `${base}/non-functional-testing`,
        icon: Activity,
      },
      { name: "Defect Tracking", href: `${base}/defects`, icon: Bug },
      { name: "Success Metrics", href: `${base}/metrics`, icon: BarChart3 },
      { name: "Reports & Export", href: `${base}/reports`, icon: FileText },
      { name: "Settings", href: `${base}/settings`, icon: Settings },
    ];
  };

  const navigation = getNavItems();

  return (
    <div className="flex h-screen w-64 flex-col bg-gray-900 text-white shadow-2xl">
      <div className="flex h-16 items-center justify-between border-b border-gray-800 px-6">
        <h1 className="text-xl font-black tracking-tighter text-white uppercase italic">
          <Link href="/">
            Test<span className="text-primary not-italic">Portal</span>
          </Link>
        </h1>
        {onClose && (
          <button
            onClick={onClose}
            className="rounded-md p-1 hover:bg-gray-800 lg:hidden text-gray-400"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="px-4 py-6">
        <ProjectSwitcher />
      </div>

      <div className="px-4 mb-2">
        <div className="h-px bg-gray-800 w-full" />
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-4">
        <p className="text-[10px] font-bold uppercase text-gray-500 px-2 mb-2 tracking-wider">
          {projectId ? "Project Navigation" : "Main Menu"}
        </p>
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={cn(
                "group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary/20 text-white border border-primary/30 shadow-[0_0_15px_rgba(var(--primary),0.1)] scale-[1.02]"
                  : "text-gray-400 hover:bg-gray-800/50 hover:text-white",
              )}
            >
              <div className="flex items-center">
                <item.icon
                  className={cn(
                    "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                    isActive
                      ? "text-white"
                      : "text-gray-500 group-hover:text-gray-300",
                  )}
                />
                <span className="truncate">{item.name}</span>
              </div>
              {isActive && <ChevronRight size={14} className="opacity-50" />}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-gray-800 p-6 bg-gray-900/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-linear-to-br from-primary to-blue-600 flex items-center justify-center text-[10px] font-bold">
            AA
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold truncate">Adebanjo Adeniji</span>
            <span className="text-[10px] text-gray-500 truncate">
              Senior QA Engineer
            </span>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-800 flex justify-between items-center text-[10px] text-gray-500">
          <span>v2.0.0</span>
          <div className="flex items-center gap-1 text-green-500">
            <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
            <span>Cloud Synced</span>
          </div>
        </div>
      </div>
    </div>
  );
}
