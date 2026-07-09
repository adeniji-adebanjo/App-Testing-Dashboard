"use client";

import React, {
  createContext,
  useContext,
  useState,
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

function readStoredRole(email: string | undefined): Role | null {
  if (typeof window === "undefined") return null;
  return (window.localStorage.getItem(storageKey(email)) as Role) || null;
}

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const { user, isExecutive } = useAuth();
  // Executives default to Management; everyone else defaults to QA Engineer.
  const defaultRole: Role = isExecutive ? "management" : "qa";

  const [role, setRoleState] = useState<Role>(defaultRole);
  const [trackedEmail, setTrackedEmail] = useState<string | undefined>(
    undefined,
  );
  const [initialized, setInitialized] = useState(false);

  // Derive the role from persisted storage whenever the signed-in user changes.
  // This is React's endorsed "adjust state during render" pattern (no effect).
  if (!initialized || user?.email !== trackedEmail) {
    setInitialized(true);
    setTrackedEmail(user?.email);
    setRoleState(readStoredRole(user?.email) ?? defaultRole);
  }

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
