"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { loadProjects } from "@/lib/projectStorage";
import { Project } from "@/types/project";
import { cn } from "@/lib/utils";
import {
  LayoutGrid,
  ChevronRight,
  BarChart3,
  Globe,
  Menu,
  X,
} from "lucide-react";

export default function PublicProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { projectId } = useParams();

  useEffect(() => {
    const fetchProjects = async () => {
      const allProjects = await loadProjects();
      setProjects(allProjects.filter((p) => p.status === "active"));
    };
    fetchProjects();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-900/50 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 sm:w-72 flex flex-col bg-white border-r border-gray-100 shadow-sm transition-transform duration-300 md:relative md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        <div className="p-5 sm:p-6 border-b border-gray-50 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
              <Globe size={18} />
            </div>
            <h1 className="font-black tracking-tighter text-gray-900 uppercase italic text-[13px] sm:text-sm">
              Test<span className="text-primary not-italic">Portal</span>
            </h1>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 text-gray-400 hover:text-gray-900 md:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-6 sm:space-y-8">
          <div>
            <p className="text-[9px] sm:text-[10px] font-black uppercase text-gray-400 px-3 mb-3 sm:mb-4 tracking-[0.2em]">
              Navigation
            </p>
            <Link
              href="/"
              className="flex items-center gap-3 px-3 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-all"
            >
              <LayoutGrid size={16} className="sm:w-[18px] sm:h-[18px]" />
              Public Landing
            </Link>
          </div>

          <div>
            <p className="text-[9px] sm:text-[10px] font-black uppercase text-gray-400 px-3 mb-3 sm:mb-4 tracking-[0.2em]">
              Active Projects
            </p>
            <div className="space-y-1">
              {projects.map((project) => {
                const isActive = projectId === project.id;
                return (
                  <Link
                    key={project.id}
                    href={`/public/projects/${project.id}`}
                    className={cn(
                      "group flex items-center justify-between px-3 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all",
                      isActive
                        ? "bg-primary/5 text-primary"
                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-900",
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full shrink-0"
                        style={{ backgroundColor: project.color }}
                      />
                      <span className="truncate">{project.name}</span>
                    </div>
                    {isActive && (
                      <ChevronRight
                        size={14}
                        className="opacity-50 shrink-0 ml-2"
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>

        <div className="p-5 sm:p-6 bg-gray-50/50 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center shrink-0">
              <BarChart3 className="w-4 h-4 text-green-600" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">
                Access Mode
              </span>
              <span className="text-[11px] sm:text-xs font-black text-gray-700">
                Read-Only View
              </span>
            </div>
          </div>
          <Link
            href="/login"
            className="block text-center py-2.5 px-4 bg-gray-900 text-white rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-black transition-colors"
          >
            Executive Login
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 bg-linear-to-br from-gray-50 to-gray-100 flex flex-col">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 sticky top-0 z-30 shadow-sm">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <Globe size={18} />
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-gray-500 hover:bg-gray-50 rounded-xl transition-colors border border-gray-50"
          >
            <Menu size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </main>
    </div>
  );
}
