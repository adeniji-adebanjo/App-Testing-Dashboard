import { timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Shared guards for server API routes (ingestion, webhooks, release gate, share).

// Constant-time string comparison so secrets can't be recovered via timing.
export function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

// Checks a shared-secret header against the configured token. Fails closed: an
// unset token disables the route rather than making it public. Returns an error
// response to send, or null when the request is authorized.
export function requireApiToken(
  request: NextRequest,
  expected: string | undefined,
  header = "x-api-token",
): NextResponse | null {
  if (!expected) {
    return NextResponse.json(
      { error: "Endpoint disabled: API token not configured on the server" },
      { status: 503 },
    );
  }
  if (!safeEqual(request.headers.get(header) ?? "", expected)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

// Verifies the caller's Supabase session from an `Authorization: Bearer <access
// token>` header. Returns the user id, or an error response to send. When
// Supabase isn't configured (local demo mode) requests are allowed outside
// production only, since there is no session to check.
export async function requireUser(
  request: NextRequest,
): Promise<{ userId: string } | { response: NextResponse }> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    if (process.env.NODE_ENV !== "production") return { userId: "demo-user" };
    return {
      response: NextResponse.json(
        { success: false, error: "Authentication is not configured" },
        { status: 503 },
      ),
    };
  }

  const token = request.headers
    .get("authorization")
    ?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (token) {
    const sb = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data } = await sb.auth.getUser(token);
    if (data.user) return { userId: data.user.id };
  }
  return {
    response: NextResponse.json(
      { success: false, error: "Sign in required" },
      { status: 401 },
    ),
  };
}

// Simple fixed-window rate limiter. In-memory, so limits are per server
// instance — enough to stop a single client looping on an expensive endpoint,
// not a substitute for a shared store (e.g. Redis) behind multiple instances.
const rateWindows = new Map<string, { start: number; count: number }>();

export function isRateLimited(
  key: string,
  limit: number,
  windowMs: number,
): boolean {
  const now = Date.now();
  const entry = rateWindows.get(key);
  if (!entry || now - entry.start >= windowMs) {
    rateWindows.set(key, { start: now, count: 1 });
    return false;
  }
  entry.count += 1;
  return entry.count > limit;
}
