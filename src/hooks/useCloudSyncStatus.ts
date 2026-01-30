"use client";

import { useState, useEffect, useCallback } from "react";
import { isSupabaseEnabled } from "@/lib/supabase";

export type SyncStatus = "synced" | "syncing" | "offline" | "error";

interface CloudSyncState {
  status: SyncStatus;
  lastSyncTime: Date | null;
  error: string | null;
}

// Global state for sync status (shared across components)
let globalSyncState: CloudSyncState = {
  status: isSupabaseEnabled() ? "synced" : "offline",
  lastSyncTime: null,
  error: null,
};

const listeners: Set<() => void> = new Set();

const notifyListeners = () => {
  listeners.forEach((listener) => listener());
};

// Functions to update sync status from storage operations
export const setSyncing = () => {
  globalSyncState = { ...globalSyncState, status: "syncing", error: null };
  notifyListeners();
};

export const setSynced = () => {
  globalSyncState = {
    ...globalSyncState,
    status: "synced",
    lastSyncTime: new Date(),
    error: null,
  };
  notifyListeners();
};

export const setSyncError = (error: string) => {
  globalSyncState = { ...globalSyncState, status: "error", error };
  notifyListeners();
};

export const setOffline = () => {
  globalSyncState = { ...globalSyncState, status: "offline", error: null };
  notifyListeners();
};

// Hook to use sync status in components
export function useCloudSyncStatus() {
  const [state, setState] = useState<CloudSyncState>(globalSyncState);

  useEffect(() => {
    // Check if Supabase is enabled
    if (!isSupabaseEnabled()) {
      setState({ status: "offline", lastSyncTime: null, error: null });
      return;
    }

    const updateState = () => {
      setState({ ...globalSyncState });
    };

    listeners.add(updateState);
    return () => {
      listeners.delete(updateState);
    };
  }, []);

  const getStatusText = useCallback((): string => {
    switch (state.status) {
      case "synced":
        return "Cloud Synced";
      case "syncing":
        return "Syncing...";
      case "offline":
        return "Local Only";
      case "error":
        return "Sync Error";
      default:
        return "Unknown";
    }
  }, [state.status]);

  const getStatusColor = useCallback((): string => {
    switch (state.status) {
      case "synced":
        return "text-green-500";
      case "syncing":
        return "text-blue-500";
      case "offline":
        return "text-gray-500";
      case "error":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  }, [state.status]);

  const getDotColor = useCallback((): string => {
    switch (state.status) {
      case "synced":
        return "bg-green-500";
      case "syncing":
        return "bg-blue-500";
      case "offline":
        return "bg-gray-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  }, [state.status]);

  return {
    ...state,
    getStatusText,
    getStatusColor,
    getDotColor,
    isOnline: state.status !== "offline",
    isSyncing: state.status === "syncing",
  };
}
