"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  ClipboardList,
  Activity,
  Bug,
  BarChart3,
  FileText,
} from "lucide-react";

const navigation = [
  { name: "Overview", href: "/", icon: Home },
  {
    name: "Functional Testing",
    href: "/functional-testing",
    icon: ClipboardList,
  },
  {
    name: "Non-Functional Testing",
    href: "/non-functional-testing",
    icon: Activity,
  },
  { name: "Defect Tracking", href: "/defects", icon: Bug },
  { name: "Success Metrics", href: "/metrics", icon: BarChart3 },
  { name: "Reports & Export", href: "/reports", icon: FileText },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-64 flex-col bg-gray-900 text-white">
      <div className="flex h-16 items-center justify-center border-b border-gray-800">
        <h1 className="text-xl font-bold">Testing Dashboard</h1>
      </div>
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-gray-800 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              )}
            >
              <item.icon
                className={cn(
                  "mr-3 h-5 w-5 flex-shrink-0",
                  isActive
                    ? "text-white"
                    : "text-gray-400 group-hover:text-white"
                )}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-gray-800 p-4">
        <p className="text-xs text-gray-400">Credit Bureau Testing v1.0</p>
      </div>
    </div>
  );
}
