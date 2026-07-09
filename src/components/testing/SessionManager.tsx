"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getSessionId, setSessionId } from "@/lib/supabase";
import { Copy, Save } from "lucide-react";
import { useConfirm } from "@/components/ui/confirm-dialog";

export default function SessionManager() {
  const confirm = useConfirm();
  const [currentSessionId] = useState(() => {
    if (typeof window !== "undefined") {
      return getSessionId();
    }
    return "";
  });
  const [inputSessionId, setInputSessionId] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(currentSessionId);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSave = async () => {
    if (!inputSessionId.trim()) return;

    const confirmed = await confirm({
      title: "Switch session?",
      description:
        "Switching sessions will reload the page. Any unsaved changes may be lost.",
      confirmText: "Switch session",
    });

    if (confirmed) {
      setSessionId(inputSessionId.trim());
      window.location.reload();
    }
  };

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="text-lg">Session Management</CardTitle>
        <CardDescription>
          Sync your progress across devices by using the same Session ID.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Your Current Session ID</label>
          <div className="flex gap-2">
            <code
              className="flex-1 rounded bg-white p-2 text-sm border font-mono"
              suppressHydrationWarning
            >
              {currentSessionId}
            </code>
            <Button size="icon" variant="outline" onClick={handleCopy}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          {isCopied && (
            <p className="text-xs text-green-600">Copied to clipboard!</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Load Existing Session</label>
          <div className="flex gap-2">
            <Input
              placeholder="Paste Session ID here..."
              value={inputSessionId}
              onChange={(e) => setInputSessionId(e.target.value)}
              className="bg-white"
            />
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Load
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Paste an ID from another browser to resume your work there.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
