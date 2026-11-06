// src/lib/auth.ts
import { supabase, isSupabaseEnabled } from "./supabase";

export interface AuthUser {
  id: string;
  email: string;
  isExecutive: boolean;
}

// Get the executive email from environment
const EXECUTIVE_EMAIL = process.env.NEXT_PUBLIC_EXECUTIVE_EMAIL || "";

/**
 * Sign in with email and password
 */
export const signIn = async (
  email: string,
  password: string,
): Promise<{ user: AuthUser | null; error: string | null }> => {
  if (!isSupabaseEnabled()) {
    // Demo mode - allow any login
    return {
      user: {
        id: "demo-user",
        email,
        isExecutive: true,
      },
      error: null,
    };
  }

  try {
    const { data, error } = await supabase!.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { user: null, error: error.message };
    }

    if (data.user) {
      return {
        user: {
          id: data.user.id,
          email: data.user.email || "",
          isExecutive:
            data.user.email?.toLowerCase() === EXECUTIVE_EMAIL.toLowerCase(),
        },
        error: null,
      };
    }

    return { user: null, error: "Unknown error occurred" };
  } catch {
    return { user: null, error: "Failed to sign in" };
  }
};

/**
 * Sign out the current user
 */
export const signOut = async (): Promise<void> => {
  if (!isSupabaseEnabled()) {
    // Clear demo session
    if (typeof window !== "undefined") {
      localStorage.removeItem("demo_auth_user");
    }
    return;
  }

  await supabase!.auth.signOut();
};

/**
 * Get the current authenticated user
 */
export const getCurrentUser = async (): Promise<AuthUser | null> => {
  // Check for demo mode
  if (!isSupabaseEnabled()) {
    if (typeof window !== "undefined") {
      const demoUser = localStorage.getItem("demo_auth_user");
      if (demoUser) {
        return JSON.parse(demoUser);
      }
    }
    return null;
  }

  try {
    const {
      data: { user },
    } = await supabase!.auth.getUser();

    if (user) {
      return {
        id: user.id,
        email: user.email || "",
        isExecutive:
          user.email?.toLowerCase() === EXECUTIVE_EMAIL.toLowerCase(),
      };
    }

    return null;
  } catch {
    return null;
  }
};

/**
 * Subscribe to auth state changes
 */
export const onAuthStateChange = (
  callback: (user: AuthUser | null) => void,
) => {
  if (!isSupabaseEnabled()) {
    // For demo mode, just return a no-op unsubscribe
    return { unsubscribe: () => {} };
  }

  const {
    data: { subscription },
  } = supabase!.auth.onAuthStateChange((event, session) => {
    if (session?.user) {
      callback({
        id: session.user.id,
        email: session.user.email || "",
        isExecutive:
          session.user.email?.toLowerCase() === EXECUTIVE_EMAIL.toLowerCase(),
      });
    } else {
      callback(null);
    }
  });

  return { unsubscribe: () => subscription.unsubscribe() };
};

/**
 * Demo mode sign in (for development without Supabase Auth)
 */
export const demoSignIn = (email: string): AuthUser => {
  const user: AuthUser = {
    id: "demo-user",
    email,
    isExecutive: true,
  };

  if (typeof window !== "undefined") {
    localStorage.setItem("demo_auth_user", JSON.stringify(user));
  }

  return user;
};

/**
 * Authorization header carrying the current Supabase access token, for calls
 * to API routes that verify the session server-side (see lib/apiAuth.ts).
 */
export const getAuthHeaders = async (): Promise<Record<string, string>> => {
  if (!isSupabaseEnabled()) return {};
  const { data } = await supabase!.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
};
