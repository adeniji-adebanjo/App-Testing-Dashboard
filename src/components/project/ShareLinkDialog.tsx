"use client";

import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Share2,
  Copy,
  Check,
  ExternalLink,
  Link2,
  Lock,
  AlertCircle,
  Loader2,
  RefreshCw,
  Ban,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { copyToClipboard } from "@/lib/clipboard";
import { useConfirm } from "@/components/ui/confirm-dialog";
import {
  buildShareUrl,
  getShareToken,
  revokeShareToken,
  rotateShareToken,
} from "@/lib/shareLinks";

interface ShareLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectName: string;
  shortCode?: string;
  /** Project accent colour, used to tint the dialog header. */
  color?: string;
}

export default function ShareLinkDialog({
  open,
  onOpenChange,
  projectId,
  projectName,
  shortCode,
  color = "#6366F1",
}: ShareLinkDialogProps) {
  const confirm = useConfirm();
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const url = token ? buildShareUrl(projectId, token) : "";

  // Load the current share token whenever the dialog is (re)opened.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setCopied(false);
    setFailed(false);
    setError(null);
    setLoading(true);
    getShareToken(projectId)
      .then((t) => !cancelled && setToken(t))
      .catch((e) => !cancelled && setError(errorMessage(e)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [open, projectId]);

  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try {
      await action();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const handleCreate = () =>
    run(async () => setToken(await rotateShareToken(projectId)));

  const handleReset = async () => {
    const ok = await confirm({
      title: "Reset share link?",
      description:
        "A new link will be generated and the current link will stop working for everyone who has it.",
      confirmText: "Reset link",
      variant: "destructive",
    });
    if (ok) {
      await run(async () => {
        setToken(await rotateShareToken(projectId));
        setCopied(false);
      });
    }
  };

  const handleDisable = async () => {
    const ok = await confirm({
      title: "Disable share link?",
      description:
        "The link will stop working for everyone who has it. You can create a new one later.",
      confirmText: "Disable link",
      variant: "destructive",
    });
    if (ok) {
      await run(async () => {
        await revokeShareToken(projectId);
        setToken(null);
      });
    }
  };

  const handleCopy = async () => {
    const ok = await copyToClipboard(url);
    setCopied(ok);
    setFailed(!ok);
    if (ok) {
      setTimeout(() => setCopied(false), 2500);
    } else {
      // Select the text so the user can copy it manually.
      inputRef.current?.select();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md overflow-hidden p-0 gap-0 border-none shadow-2xl rounded-2xl">
        {/* Accent bar in the project colour */}
        <div className="h-1.5 w-full" style={{ backgroundColor: color }} />

        {/* pr-12 keeps the title clear of the dialog's built-in close button */}
        <DialogHeader className="pl-6 pr-12 pt-6 pb-4 space-y-3 text-left">
          <div className="flex items-center gap-3">
            <div
              className="p-2.5 rounded-xl shrink-0"
              style={{ backgroundColor: `${color}15`, color }}
            >
              <Share2 size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-base font-black tracking-tight truncate">
                Share {projectName}
              </DialogTitle>
              <DialogDescription className="text-xs mt-0.5">
                Anyone with this link can view a read-only snapshot
                {shortCode ? ` of ${shortCode}` : ""}.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center gap-2 h-20 text-xs text-gray-500">
              <Loader2 size={14} className="animate-spin" />
              Loading share settings…
            </div>
          ) : !token ? (
            <div className="space-y-3">
              <p className="text-xs text-gray-500">
                Sharing is off for this project. Create a private link to give
                read-only access to people without an account.
              </p>
              <Button
                type="button"
                onClick={handleCreate}
                disabled={busy}
                className="w-full h-10 gap-2 text-xs font-black uppercase tracking-wider bg-gray-900 hover:bg-black text-white cursor-pointer"
              >
                {busy ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Link2 size={14} />
                )}
                Create private link
              </Button>
            </div>
          ) : (
            <>
              {/* Link row */}
              <div className="space-y-2">
                <label
                  htmlFor="share-link-url"
                  className="text-[10px] font-black uppercase tracking-widest text-gray-400"
                >
                  Private link
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1 min-w-0">
                    <Link2
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    />
                    <input
                      id="share-link-url"
                      ref={inputRef}
                      value={url}
                      readOnly
                      onFocus={(e) => e.currentTarget.select()}
                      onClick={(e) => e.currentTarget.select()}
                      className="w-full h-10 pl-9 pr-3 rounded-lg bg-gray-50 border border-gray-200 text-xs font-mono text-gray-600 truncate focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 cursor-text"
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={handleCopy}
                    className={cn(
                      "h-10 px-4 gap-2 text-xs font-black uppercase tracking-wider shrink-0 transition-all cursor-pointer",
                      copied
                        ? "bg-emerald-500 hover:bg-emerald-500 text-white"
                        : "bg-gray-900 hover:bg-black text-white",
                    )}
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? "Copied" : "Copy"}
                  </Button>
                </div>

                {failed && (
                  <p className="flex items-center gap-1.5 text-[11px] text-amber-600 font-medium">
                    <AlertCircle size={12} className="shrink-0" />
                    Couldn&apos;t copy automatically — the link is selected,
                    press Ctrl+C.
                  </p>
                )}
              </div>

              {/* Secondary actions */}
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  window.open(url, "_blank", "noopener,noreferrer")
                }
                className="w-full h-10 gap-2 text-xs font-bold border-gray-200 hover:bg-gray-50 cursor-pointer"
              >
                <ExternalLink size={14} />
                Open link preview
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  disabled={busy}
                  className="h-9 gap-2 text-xs font-bold border-gray-200 cursor-pointer"
                >
                  <RefreshCw size={13} />
                  Reset link
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDisable}
                  disabled={busy}
                  className="h-9 gap-2 text-xs font-bold border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 cursor-pointer"
                >
                  <Ban size={13} />
                  Disable link
                </Button>
              </div>
            </>
          )}

          {error && (
            <p
              role="alert"
              className="flex items-center gap-1.5 text-[11px] text-red-600 font-medium"
            >
              <AlertCircle size={12} className="shrink-0" />
              {error}
            </p>
          )}

          {/* Footnote */}
          <div className="flex items-start gap-2 rounded-xl bg-gray-50 border border-gray-100 p-3">
            <Lock size={13} className="mt-0.5 shrink-0 text-gray-400" />
            <p className="text-[11px] leading-relaxed text-gray-500">
              Recipients get a read-only view of test results, defects and
              objectives. No editing controls are exposed, and you can disable
              the link at any time.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function errorMessage(e: unknown): string {
  return e instanceof Error ? e.message : "Something went wrong";
}
