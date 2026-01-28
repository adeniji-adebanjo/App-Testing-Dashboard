"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Mail, Shield, Sparkles } from "lucide-react";
import { isSupabaseEnabled } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const { signIn, demoLogin, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Email is required");
      return;
    }

    // Demo mode - just login with email
    if (!isSupabaseEnabled()) {
      demoLogin(email);
      router.push("/dashboard");
      return;
    }

    // Real auth mode
    if (!password) {
      setError("Password is required");
      return;
    }

    const { success, error: signInError } = await signIn(email, password);

    if (success) {
      router.push("/dashboard");
    } else {
      setError(signInError || "Failed to sign in");
    }
  };

  const handleDemoLogin = () => {
    demoLogin("qa-executive@example.com");
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">
            Test<span className="text-primary not-italic">Portal</span>
          </h1>
          <p className="text-gray-400 mt-2 text-sm">QA Executive Dashboard</p>
        </div>

        <Card className="border-none shadow-2xl bg-white/5 backdrop-blur-xl">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-xl text-white">
              Executive Access
            </CardTitle>
            <p className="text-gray-400 text-sm mt-1">
              Sign in to manage your testing portfolio
            </p>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-white/10 border-white/10 text-white placeholder:text-gray-500 focus:border-primary"
                  />
                </div>
              </div>

              {isSupabaseEnabled() && (
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-300">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 bg-white/10 border-white/10 text-white placeholder:text-gray-500 focus:border-primary"
                    />
                  </div>
                </div>
              )}

              {error && (
                <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full py-6 font-bold cursor-pointer"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            {!isSupabaseEnabled() && (
              <div className="mt-6 pt-6 border-t border-white/10">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDemoLogin}
                  className="w-full py-6 bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white cursor-pointer gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Quick Demo Access
                </Button>
                <p className="text-center text-gray-500 text-xs mt-3">
                  Demo mode - No Supabase Auth configured
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-gray-500 text-xs mt-6">
          Protected access for authorized QA personnel only
        </p>
      </div>
    </div>
  );
}
