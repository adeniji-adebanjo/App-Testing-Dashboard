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
    if (index === 0 && segment === "projects") return "Projects";
    if (index === 1 && currentProject && segment === currentProject.id) {
      return currentProject.shortCode;
    }

    // Capitalize and replace hyphens
    return segment
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
      <Link
        href="/"
        className="flex items-center hover:text-primary transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>

      {segments.map((segment, index) => {
        const href = `/${segments.slice(0, index + 1).join("/")}`;
        const isLast = index === segments.length - 1;
        const name = getSegmentName(segment, index);

        return (
          <div key={href} className="flex items-center space-x-2">
            <ChevronRight className="h-4 w-4 text-gray-300" />
            <Link
              href={href}
              className={cn(
                "hover:text-primary transition-colors",
                isLast ? "text-gray-900 font-semibold pointer-events-none" : "",
              )}
            >
              {name}
            </Link>
          </div>
        );
      })}
    </nav>
  );
}
