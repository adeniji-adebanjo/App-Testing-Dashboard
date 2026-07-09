"use client";

import ReleaseManager from "@/components/testing/ReleaseManager";

export default function ProjectReleasesPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="space-y-1 sm:space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
          Release Readiness
        </h1>
        <p className="text-sm sm:text-base text-gray-500">
          Gate production releases on the mandatory checklist, gating runs and
          sign-offs (§24, §20)
        </p>
      </div>

      <ReleaseManager />
    </div>
  );
}
