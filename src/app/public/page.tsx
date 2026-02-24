"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";

export default function PublicProjectsIndexPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
      <Card className="max-w-md w-full border-none shadow-2xl bg-white/80 backdrop-blur-md">
        <CardContent className="p-12 text-center">
          <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-6 text-primary shadow-inner">
            <Shield size={40} strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter mb-4">
            Private Access Only
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed mb-8 font-medium">
            This QA Portal requires a direct project link for access. Individual
            project reports are shared privately by the QA team.
          </p>
          <div className="space-y-3">
            <Button
              asChild
              className="w-full py-6 font-black uppercase tracking-widest text-[11px] shadow-lg shadow-primary/20"
            >
              <Link href="/login">Executive Login</Link>
            </Button>
            <p className="text-[9px] text-gray-400 uppercase font-bold tracking-[0.2em] pt-4">
              Powered by Adebanjo Adeniji
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
