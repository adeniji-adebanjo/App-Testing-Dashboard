"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface ProjectDescriptionProps {
  description?: string | null;
  /** Number of lines to show before the text is clamped. */
  clampLines?: 2 | 3 | 4;
  className?: string;
}

/**
 * Renders a project description at a predictable height: long text is clamped
 * to a few lines (so it can never stretch the surrounding layout) and can be
 * expanded in place when the user wants to read all of it.
 */
export default function ProjectDescription({
  description,
  clampLines = 3,
  className,
}: ProjectDescriptionProps) {
  const [expanded, setExpanded] = useState(false);
  const text = description?.trim();

  if (!text) return null;

  // Rough threshold: only offer the toggle when the text can realistically overflow.
  const isLong = text.length > clampLines * 90;

  const clampClass = {
    2: "line-clamp-2",
    3: "line-clamp-3",
    4: "line-clamp-4",
  }[clampLines];

  return (
    <div className={cn("max-w-3xl", className)}>
      <p
        className={cn(
          "text-gray-500 leading-relaxed break-words whitespace-pre-line",
          !expanded && clampClass,
        )}
      >
        {text}
      </p>
      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-1 text-[11px] font-bold uppercase tracking-wider text-primary hover:underline cursor-pointer"
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
    </div>
  );
}
