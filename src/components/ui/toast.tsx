"use client";

import * as React from "react";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

type ToastVariant = "success" | "error" | "warning" | "info";

interface ToastOptions {
  title?: string;
  description: string;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastItem extends Required<Omit<ToastOptions, "title">> {
  id: number;
  title?: string;
}

interface ToastContextValue {
  toast: (options: ToastOptions) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

const variantStyles: Record<
  ToastVariant,
  { icon: React.ReactNode; accent: string }
> = {
  success: {
    icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
    accent: "border-l-emerald-500",
  },
  error: {
    icon: <XCircle className="h-5 w-5 text-red-500" />,
    accent: "border-l-red-500",
  },
  warning: {
    icon: <AlertTriangle className="h-5 w-5 text-amber-500" />,
    accent: "border-l-amber-500",
  },
  info: {
    icon: <Info className="h-5 w-5 text-blue-500" />,
    accent: "border-l-blue-500",
  },
};

let idCounter = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  const dismiss = React.useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = React.useCallback(
    ({ title, description, variant = "info", duration = 4000 }: ToastOptions) => {
      const id = ++idCounter;
      setToasts((prev) => [
        ...prev,
        { id, title, description, variant, duration },
      ]);
      if (duration > 0) {
        setTimeout(() => dismiss(id), duration);
      }
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2">
        {toasts.map((t) => {
          const { icon, accent } = variantStyles[t.variant];
          return (
            <div
              key={t.id}
              role="status"
              aria-live="polite"
              className={cn(
                "pointer-events-auto flex items-start gap-3 rounded-lg border border-l-4 bg-background p-4 shadow-lg",
                "data-[state=open]:animate-in data-[state=open]:slide-in-from-right-full data-[state=open]:fade-in-0",
                accent,
              )}
              data-state="open"
            >
              <span className="mt-0.5 shrink-0">{icon}</span>
              <div className="flex-1 min-w-0">
                {t.title && (
                  <p className="text-sm font-semibold leading-none tracking-tight">
                    {t.title}
                  </p>
                )}
                <p
                  className={cn(
                    "text-sm text-muted-foreground",
                    t.title && "mt-1",
                  )}
                >
                  {t.description}
                </p>
              </div>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss"
                className="shrink-0 rounded-sm text-muted-foreground opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}
