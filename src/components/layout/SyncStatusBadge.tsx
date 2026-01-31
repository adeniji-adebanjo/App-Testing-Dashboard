"use client";

import { useCloudSyncStatus } from "@/hooks/useCloudSyncStatus";
import { cn } from "@/lib/utils";
import { Cloud, CloudOff, RefreshCw, AlertCircle, Check } from "lucide-react";

export function SyncStatusBadge({ className }: { className?: string }) {
  const { status, lastSyncTime, getStatusText, getDotColor, error } =
    useCloudSyncStatus();

  return (
    <div
      className={cn(
        "flex flex-col items-end gap-1 px-3 py-1.5 rounded-lg bg-white/50 backdrop-blur-sm border border-gray-100",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        {status === "synced" && <Check size={12} className="text-green-500" />}
        {status === "syncing" && (
          <RefreshCw size={12} className="text-blue-500 animate-spin" />
        )}
        {status === "offline" && (
          <CloudOff size={12} className="text-gray-400" />
        )}
        {status === "error" && (
          <AlertCircle size={12} className="text-red-500" />
        )}
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
          Backend: {getStatusText()}
        </span>
        <div
          className={cn("w-2 h-2 rounded-full animate-pulse", getDotColor())}
        />
      </div>
      {lastSyncTime && status === "synced" && (
        <span className="text-[9px] text-gray-400 italic">
          Last saved: {lastSyncTime.toLocaleTimeString()}
        </span>
      )}
      {error && (
        <span className="text-[9px] text-red-400 font-medium truncate max-w-[150px]">
          {error}
        </span>
      )}
    </div>
  );
}
