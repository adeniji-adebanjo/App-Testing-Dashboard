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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { copyToClipboard } from "@/lib/clipboard";

interface ShareLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url: string;
  projectName: string;
  shortCode?: string;
  /** Project accent colour, used to tint the dialog header. */
  color?: string;
}

export default function ShareLinkDialog({
  open,
  onOpenChange,
  url,
  projectName,
  shortCode,
  color = "#6366F1",
}: ShareLinkDialogProps) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset the transient copy state whenever the dialog is reopened.
  useEffect(() => {
    if (open) {
      setCopied(false);
      setFailed(false);
    }
  }, [open]);

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
          {/* Link row */}
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
              Private link
            </span>
            <div className="flex gap-2">
              <div className="relative flex-1 min-w-0">
                <Link2
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
                <input
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
                Couldn&apos;t copy automatically — the link is selected, press
                Ctrl+C.
              </p>
            )}
          </div>

          {/* Secondary action */}
          <Button
            type="button"
            variant="outline"
            onClick={() => window.open(url, "_blank", "noopener,noreferrer")}
            className="w-full h-10 gap-2 text-xs font-bold border-gray-200 hover:bg-gray-50 cursor-pointer"
          >
            <ExternalLink size={14} />
            Open link preview
          </Button>

          {/* Footnote */}
          <div className="flex items-start gap-2 rounded-xl bg-gray-50 border border-gray-100 p-3">
            <Lock size={13} className="mt-0.5 shrink-0 text-gray-400" />
            <p className="text-[11px] leading-relaxed text-gray-500">
              Recipients see pass rates, test counts and defect statistics only.
              No editing controls or sensitive data are exposed.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
