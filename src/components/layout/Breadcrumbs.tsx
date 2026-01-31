"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { useProject } from "@/context/ProjectContext";
import { cn } from "@/lib/utils";

export default function Breadcrumbs() {
  const pathname = usePathname();
  const { currentProject } = useProject();

  const segments = pathname.split("/").filter(Boolean);

  // Custom mapping for IDs to Names
  const getSegmentName = (segment: string, index: number) => {
    if (segment === "dashboard") return "Project Hub";
    if (index === 1 && currentProject && segment === currentProject.id) {
      return currentProject.shortCode;
    }

    // Capitalize and replace hyphens
    return segment
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const breadcrumbItems = segments
    .map((segment, index) => ({
      name: getSegmentName(segment, index),
      href: `/${segments.slice(0, index + 1).join("/")}`,
      id: segment,
    }))
    .filter((item) => item.id !== "projects");

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
      <Link
        href="/dashboard"
        className="flex items-center hover:text-primary transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>

      {breadcrumbItems.map((item, index) => {
        const isLast = index === breadcrumbItems.length - 1;

        return (
          <div key={item.href} className="flex items-center space-x-2">
            <ChevronRight className="h-4 w-4 text-gray-300" />
            <Link
              href={item.href}
              className={cn(
                "hover:text-primary transition-colors",
                isLast ? "text-gray-900 font-semibold pointer-events-none" : "",
              )}
            >
              {item.name}
            </Link>
          </div>
        );
      })}
    </nav>
  );
}
