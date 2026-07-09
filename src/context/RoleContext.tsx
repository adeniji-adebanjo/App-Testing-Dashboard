"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useAuth } from "@/context/AuthContext";
import { Role, Permission, hasPermission } from "@/types/role";

interface RoleContextType {
  role: Role;
  setRole: (role: Role) => void;
  can: (permission: Permission) => boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

const STORAGE_PREFIX = "qa_role_";

function storageKey(email: string | undefined): string {
  return `${STORAGE_PREFIX}${email || "anonymous"}`;
}

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const { user, isExecutive } = useAuth();
  // Executives default to Management; everyone else defaults to QA Engineer.
  const [role, setRoleState] = useState<Role>(isExecutive ? "management" : "qa");

  // Load persisted role for the current user when auth resolves.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(storageKey(user?.email));
    if (stored) {
      setRoleState(stored as Role);
    } else {
      setRoleState(isExecutive ? "management" : "qa");
    }
  }, [user?.email, isExecutive]);

  const setRole = useCallback(
    (next: Role) => {
      setRoleState(next);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(storageKey(user?.email), next);
      }
    },
    [user?.email],
  );

  const can = useCallback(
    (permission: Permission) => hasPermission(role, permission),
    [role],
  );

  return (
    <RoleContext.Provider value={{ role, setRole, can }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (ctx === undefined) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return ctx;
}
