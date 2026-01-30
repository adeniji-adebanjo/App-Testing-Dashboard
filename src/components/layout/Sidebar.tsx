"use client";

import Link from "next/link";
import { usePathname, useParams, useRouter } from "next/navigation";
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
  Shield,
  LogOut,
  LogIn,
  Database,
  Globe,
  Lock,
  Zap,
  Users,
  LucideIcon,
} from "lucide-react";
import ProjectSwitcher from "@/components/project/ProjectSwitcher";
import { useAuth } from "@/context/AuthContext";
import { useProjectTabs } from "@/hooks/useTestData";
import { useCloudSyncStatus } from "@/hooks/useCloudSyncStatus";

// Map icon strings to Lucide components
const ICON_MAP: Record<string, LucideIcon> = {
  "clipboard-list": ClipboardList,
  activity: Activity,
  database: Database,
  globe: Globe,
  lock: Lock,
  shield: Shield,
  zap: Zap,
  users: Users,
};

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const { projectId } = useParams();
  const { user, isAuthenticated, signOut } = useAuth();
  const router = useRouter();

  // Fetch dynamic tabs
  const { data: projectTabs } = useProjectTabs(projectId as string);

  const getNavItems = () => {
    if (!projectId) {
      const items = [
        { name: "Project Hub", href: "/dashboard", icon: LayoutGrid },
      ];
      // Add Executive Dashboard for authenticated users
      if (isAuthenticated) {
        items.push({
          name: "Executive Dashboard",
          href: "/executive",
          icon: Shield,
        });
      }
      return items;
    }

    const base = `/projects/${projectId}`;

    // Core navigation items
    const navItems = [{ name: "Overview", href: base, icon: Home }];

    // Add dynamic tabs or fallback to default if loading/empty (but only if we expect them)
    if (projectTabs && projectTabs.length > 0) {
      const sortedTabs = [...projectTabs].sort((a, b) => a.order - b.order);

      sortedTabs.forEach((tab) => {
        navItems.push({
          name: tab.name,
          href: `${base}/${tab.slug}`,
          icon: ICON_MAP[tab.icon || "clipboard-list"] || ClipboardList,
        });
      });
    } else {
      // Fallback: Default tabs if no custom tabs (e.g., initial load or not yet saved)
      navItems.push(
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
      );
    }

    // Remaining standard items
    navItems.push(
      { name: "Defect Tracking", href: `${base}/defects`, icon: Bug },
      { name: "Success Metrics", href: `${base}/metrics`, icon: BarChart3 },
      { name: "Reports & Export", href: `${base}/reports`, icon: FileText },
      { name: "Settings", href: `${base}/settings`, icon: Settings },
    );

    return navItems;
  };

  const navigation = getNavItems();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const { getStatusText, getStatusColor, getDotColor } = useCloudSyncStatus();

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
                    "mr-3 h-5 w-5 shrink-0 transition-colors",
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
        {isAuthenticated ? (
          <>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-linear-to-br from-primary to-blue-600 flex items-center justify-center text-[10px] font-bold">
                {user?.email?.slice(0, 2).toUpperCase() || "QA"}
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-xs font-bold truncate">
                  {user?.email || "QA Executive"}
                </span>
                <span className="text-[10px] text-gray-500 truncate flex items-center gap-1">
                  <Shield size={10} className="text-primary" />
                  Executive Access
                </span>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="mt-4 w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
            >
              <LogOut size={14} />
              Sign Out
            </button>
          </>
        ) : (
          <Link
            href="/login"
            className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium bg-primary/20 text-white hover:bg-primary/30 transition-colors cursor-pointer"
          >
            <LogIn size={16} />
            Executive Login
          </Link>
        )}
        <div className="mt-4 pt-4 border-t border-gray-800 flex justify-between items-center text-[10px] text-gray-500">
          <span>v2.0.0</span>
          <div className={cn("flex items-center gap-1", getStatusColor())}>
            <div
              className={cn(
                "w-1 h-1 rounded-full animate-pulse",
                getDotColor(),
              )}
            />
            <span>{getStatusText()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
