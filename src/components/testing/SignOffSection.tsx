"use client";

import { useState, useMemo } from "react";
import { SignOff } from "@/types/test-case";
import { useSignOffs, useUpdateSignOffs } from "@/hooks/useTestData";
import { useProject } from "@/context/ProjectContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ShieldCheck, UserCheck, Calendar, Lock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function SignOffSection() {
  const { currentProject } = useProject();
  const projectId = currentProject?.id || "";

  const { data: savedSignOffs, isLoading } = useSignOffs(projectId);
  const updateMutation = useUpdateSignOffs(projectId);

  const [signerName, setSignerName] = useState("");
  const [signerRole, setSignerRole] = useState("");

  const signOffs = useMemo(() => savedSignOffs || [], [savedSignOffs]);

  const handleSignOff = () => {
    if (!signerName || !signerRole) {
      alert("Please provide name and role for sign-off");
      return;
    }

    const newSignOff: SignOff = {
      id: Date.now().toString(),
      projectId,
      name: signerName,
      role: signerRole,
      date: new Date(),
      signature: "digital-signature-" + Date.now(),
    };

    updateMutation.mutate([...signOffs, newSignOff]);
    setSignerName("");
    setSignerRole("");
  };

  if (isLoading) {
    return <Skeleton className="h-[200px] w-full rounded-2xl" />;
  }

  const isCompleted = signOffs.length > 0;

  return (
    <Card
      className={cn(
        "border-none shadow-sm overflow-hidden transition-all duration-500",
        isCompleted ? "bg-green-50/30 border border-green-100" : "bg-white/50",
      )}
    >
      <CardHeader className="bg-gray-50/50 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck
              className={cn(
                "h-5 w-5",
                isCompleted ? "text-green-600" : "text-gray-400",
              )}
            />
            <CardTitle className="text-lg">Project Sign-Off</CardTitle>
          </div>
          {isCompleted && (
            <Badge
              variant="outline"
              className="bg-green-100 text-green-700 border-none px-2 font-bold uppercase text-[10px]"
            >
              Active Seal
            </Badge>
          )}
        </div>
        <CardDescription>
          Final approval seal by project stakeholders
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {signOffs.length > 0 ? (
          <div className="space-y-4">
            {signOffs.map((sign) => (
              <div
                key={sign.id}
                className="flex items-start gap-4 p-4 rounded-xl bg-white border border-green-100 shadow-sm relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 p-2 opacity-5 translate-x-2 -translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform">
                  <Lock size={48} />
                </div>
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                  <UserCheck size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-black text-gray-900">
                    {sign.name}
                  </p>
                  <p className="text-xs font-medium text-gray-500">
                    {sign.role}
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                    <Calendar size={12} />
                    {sign.date
                      ? `${new Date(sign.date).toLocaleDateString()} at ${new Date(sign.date).toLocaleTimeString()}`
                      : "Date not recorded"}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge className="bg-green-600 text-white border-none text-[10px] font-bold">
                    APPROVED
                  </Badge>
                  <span className="text-[8px] font-mono text-gray-300">
                    SECURE_HASH: {sign.id?.slice(-8) || "N/A"}
                  </span>
                </div>
              </div>
            ))}
            {!isCompleted && (
              <p className="text-xs text-center text-gray-400 italic">
                Add stakeholders to finalize project phase.
              </p>
            )}
            <div className="pt-4 border-t border-gray-100 mt-4">
              <p className="text-[10px] text-gray-400 font-bold uppercase text-center">
                Digitally Verified Testing Seal
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6 max-w-md mx-auto py-4">
            <div className="flex flex-col gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-gray-400 ml-1">
                  Stakeholder Name
                </label>
                <Input
                  placeholder="e.g. John Doe (CIO)"
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  className="bg-white/50 border-gray-100 focus:bg-white transition-all shadow-xs"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-gray-400 ml-1">
                  Title / Role
                </label>
                <Input
                  placeholder="e.g. Project Sponsor"
                  value={signerRole}
                  onChange={(e) => setSignerRole(e.target.value)}
                  className="bg-white/50 border-gray-100 focus:bg-white transition-all shadow-xs"
                />
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
              <Checkbox id="terms" className="mt-1" />
              <label
                htmlFor="terms"
                className="text-[10px] text-gray-500 leading-normal"
              >
                I verify that all testing objectives have been met and the
                reported defects are either resolved or accepted as known issues
                for this project phase.
              </label>
            </div>

            <Button
              onClick={handleSignOff}
              className="w-full bg-gray-900 hover:bg-black text-white py-6 rounded-xl shadow-lg shadow-gray-200 transition-all font-bold"
            >
              Finalize Sign-Off
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Badge({ children, className, variant }: any) {
  return (
    <div
      className={cn(
        "px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center",
        className,
      )}
    >
      {children}
    </div>
  );
}
