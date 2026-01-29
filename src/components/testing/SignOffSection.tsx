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
      <CardHeader className="bg-gray-50/50 border-b border-gray-100 py-4 px-4 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck
              className={cn(
                "h-5 w-5",
                isCompleted ? "text-green-600" : "text-gray-400",
              )}
            />
            <CardTitle className="text-base sm:text-lg font-black">
              Project Sign-Off
            </CardTitle>
          </div>
        </div>
        <CardDescription className="text-[11px] sm:text-xs font-medium">
          Final approval seal by project stakeholders
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 px-4 sm:px-6">
        {signOffs.length > 0 ? (
          <div className="space-y-3">
            {signOffs.map((sign) => (
              <div
                key={sign.id}
                className="flex items-start gap-3 p-3 sm:p-4 rounded-xl bg-white border border-green-100 shadow-sm relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 p-2 opacity-5 translate-x-2 -translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform">
                  <Lock size={40} />
                </div>
                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                  <UserCheck size={16} className="sm:w-5 sm:h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] sm:text-sm font-black text-gray-900 truncate">
                    {sign.name}
                  </p>
                  <p className="text-[11px] sm:text-xs font-medium text-gray-500 truncate">
                    {sign.role}
                  </p>
                  <div className="mt-1 flex items-center gap-1.5 text-[9px] sm:text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                    <Calendar size={10} />
                    {sign.date
                      ? `${new Date(sign.date).toLocaleDateString()}`
                      : "Date N/A"}
                  </div>
                </div>
                <div className="flex flex-col items-end shrink-0 gap-1.5">
                  <Badge className="bg-green-600 text-white border-none text-[8px] sm:text-[10px] font-black px-1.5 py-0.5">
                    APPROVED
                  </Badge>
                </div>
              </div>
            ))}
            <div className="pt-4 border-t border-gray-100 mt-4">
              <p className="text-[9px] sm:text-[10px] text-gray-400 font-bold uppercase text-center tracking-widest">
                Digitally Verified Testing Seal
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-5 max-w-md mx-auto py-2">
            <div className="flex flex-col gap-4">
              <div className="space-y-1.5">
                <label className="text-[9px] sm:text-[10px] font-black uppercase text-gray-400 ml-1 tracking-wider">
                  Stakeholder Name
                </label>
                <Input
                  placeholder="e.g. John Doe (CIO)"
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  className="h-10 sm:h-11 bg-white/50 border-gray-100 focus:bg-white transition-all shadow-xs text-[13px]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] sm:text-[10px] font-black uppercase text-gray-400 ml-1 tracking-wider">
                  Title / Role
                </label>
                <Input
                  placeholder="e.g. Project Sponsor"
                  value={signerRole}
                  onChange={(e) => setSignerRole(e.target.value)}
                  className="h-10 sm:h-11 bg-white/50 border-gray-100 focus:bg-white transition-all shadow-xs text-[13px]"
                />
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
              <Checkbox id="terms" className="mt-0.5 h-3.5 w-3.5" />
              <label
                htmlFor="terms"
                className="text-[10px] text-gray-500 leading-tight font-medium"
              >
                I verify that all testing objectives have been met and the
                reported defects are either resolved or accepted.
              </label>
            </div>

            <Button
              onClick={handleSignOff}
              className="w-full bg-gray-900 hover:bg-black text-white py-5 sm:py-6 rounded-xl shadow-lg shadow-gray-200 transition-all font-black text-xs sm:text-sm uppercase tracking-widest"
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
