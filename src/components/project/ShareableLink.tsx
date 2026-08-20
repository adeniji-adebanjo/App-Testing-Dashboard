"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Share2, Copy, Check, ExternalLink, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { copyToClipboard } from "@/lib/clipboard";

interface ShareableLinkProps {
  projectId: string;
  projectName: string;
}

export function ShareableLink({ projectId, projectName }: ShareableLinkProps) {
  const [copied, setCopied] = useState(false);

  // Generate the public URL
  const publicUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/public/projects/${projectId}`
      : `/public/projects/${projectId}`;

  const handleCopy = async () => {
    if (await copyToClipboard(publicUrl)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleOpen = () => {
    window.open(publicUrl, "_blank");
  };

  return (
    <Card className="border-none shadow-sm bg-blue-50/50 border border-blue-100">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <Share2 size={16} className="text-blue-600" />
          Share Public Summary
        </CardTitle>
        <CardDescription className="text-xs">
          Share a read-only summary with stakeholders
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Link2
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <Input
              value={publicUrl}
              readOnly
              className="pl-9 pr-3 text-xs bg-white border-blue-200 text-gray-600 truncate"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className={cn(
              "px-3 transition-all cursor-pointer",
              copied
                ? "bg-green-50 border-green-200 text-green-600"
                : "border-blue-200 hover:bg-blue-50",
            )}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpen}
            className="flex-1 text-xs gap-1.5 border-blue-200 hover:bg-blue-50 cursor-pointer"
          >
            <ExternalLink size={12} />
            Preview Public View
          </Button>
        </div>

        <p className="text-[10px] text-blue-600/70 leading-relaxed">
          This link shows a read-only summary with pass rates, test counts, and
          defect statistics. No editing controls or sensitive data are exposed.
        </p>
      </CardContent>
    </Card>
  );
}
