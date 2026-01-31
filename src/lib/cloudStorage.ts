import {
  TestCase,
  Defect,
  SuccessMetric,
  TestObjective,
  TestEnvironment,
  SignOff,
} from "@/types/test-case";
import { ProjectTab } from "@/types/project";
import { supabase, getSessionId, isSupabaseEnabled } from "./supabase";
import {
  setSyncing,
  setSynced,
  setSyncError,
  setOffline,
} from "@/hooks/useCloudSyncStatus";

// Fallback to localStorage if Supabase is not available
import {
  saveToStorage as localSave,
  loadFromStorage as localLoad,
} from "./storage";

const STORAGE_KEYS = {
  TEST_CASES: "credit_bureau_test_cases",
  DEFECTS: "credit_bureau_defects",
  METRICS: "credit_bureau_metrics",
  OBJECTIVES: "credit_bureau_objectives",
  QUALITY_GATES: "credit_bureau_quality_gates",
  ENVIRONMENTS: "credit_bureau_environments",
  SIGN_OFFS: "credit_bureau_sign_offs",
  PROJECT_TABS: "credit_bureau_project_tabs",
  LAST_UPDATED: "credit_bureau_last_updated",
};

// Get user ID - prioritize authenticated Supabase user over session-based user
const getUserId = async (): Promise<string | null> => {
  if (!isSupabaseEnabled()) return null;

  try {
    // First, try to get the authenticated user from Supabase Auth
    const { data: authData } = await supabase!.auth.getUser();

    if (authData?.user) {
      // User is authenticated via Supabase Auth
      const authUserId = authData.user.id;

      // Check if this auth user has a record in our users table
      const { data: existingAuthUser, error: authUserError } = await supabase!
        .from("users")
        .select("id")
        .eq("id", authUserId)
        .single();

      if (existingAuthUser) {
        // Update last active
        await supabase!
          .from("users")
          .update({ last_active: new Date().toISOString() })
          .eq("id", existingAuthUser.id);
        return existingAuthUser.id;
      }

      // If no record exists, check if there's a session-based record we can migrate
      const sessionId = getSessionId();
      const { data: sessionUser } = await supabase!
        .from("users")
        .select("id")
        .eq("session_id", sessionId)
        .single();

      if (sessionUser) {
        // Migrate session data to auth user by updating the user ID
        // First, update test_data to point to auth user
        await supabase!
          .from("test_data")
          .update({ user_id: authUserId })
          .eq("user_id", sessionUser.id);

        // Delete the old session-based user record
        await supabase!.from("users").delete().eq("id", sessionUser.id);
      }

      // Create/ensure user record with auth user ID
      const { data: newAuthUser, error: createAuthError } = await supabase!
        .from("users")
        .upsert([
          {
            id: authUserId,
            session_id: `auth_${authUserId}`,
            last_active: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (createAuthError && createAuthError.code !== "23505") {
        // Ignore unique violation
        console.warn(
          "Error creating auth user record:",
          createAuthError.message,
        );
        // Still return the auth user ID as it's valid
      }

      return authUserId;
    }

    // Fallback to session-based user for unauthenticated access
    const sessionId = getSessionId();

    // Check if user exists
    const { data: existingUser, error: fetchError } = await supabase!
      .from("users")
      .select("id")
      .eq("session_id", sessionId)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      // PGRST116 = no rows returned, which is expected for new users
      console.warn(
        "Error fetching user, falling back to localStorage:",
        fetchError.message,
      );
      return null;
    }

    if (existingUser) {
      // Update last active
      await supabase!
        .from("users")
        .update({ last_active: new Date().toISOString() })
        .eq("id", existingUser.id);

      return existingUser.id;
    }

    // Create new user
    const { data: newUser, error: createError } = await supabase!
      .from("users")
      .insert([{ session_id: sessionId }])
      .select()
      .single();

    if (createError) {
      console.warn(
        "Error creating user, falling back to localStorage:",
        createError.message,
      );
      return null;
    }

    return newUser.id;
  } catch (error) {
    // Network error or other unexpected error - fall back to localStorage
    console.warn("Supabase connection failed, using localStorage:", error);
    return null;
  }
};

// Helper to get project-specific key
const getProjectKey = (key: string, projectId?: string) => {
  return projectId ? `${projectId}_${key}` : key;
};

// Save to cloud
export const saveToCloud = async <T>(
  key: string,
  data: T,
  projectId?: string,
): Promise<boolean> => {
  const storageKey = getProjectKey(key, projectId);

  // Always save to localStorage as backup
  localSave(storageKey, data);

  if (!isSupabaseEnabled()) {
    setOffline();
    return true; // Fallback success
  }

  setSyncing();

  try {
    const userId = await getUserId();
    if (!userId) {
      setSyncError("Authentication failed");
      return false;
    }

    // Prepare payload
    interface TestDataPayload {
      user_id: string;
      data_type: string;
      data: unknown;
      updated_at: string;
      project_id?: string;
    }

    const payload: TestDataPayload = {
      user_id: userId,
      data_type: storageKey,
      data: data as unknown,
      updated_at: new Date().toISOString(),
    };

    // If we have a projectId and it looks like a valid UUID, link it
    if (
      projectId &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        projectId,
      )
    ) {
      payload.project_id = projectId;
    }

    // Check if record exists
    const { data: existing } = await supabase!
      .from("test_data")
      .select("id")
      .eq("user_id", userId)
      .eq("data_type", storageKey)
      .single();

    if (existing) {
      // Update existing
      const { error } = await supabase!
        .from("test_data")
        .update(payload)
        .eq("id", existing.id);

      if (error) throw error;
    } else {
      // Insert new
      const { error } = await supabase!.from("test_data").insert([payload]);

      if (error) throw error;
    }

    setSynced();
    return true;
  } catch (error) {
    console.error("Error saving to cloud:", error);
    setSyncError(error instanceof Error ? error.message : "Cloud save failed");
    return false;
  }
};

// Load from cloud
export const loadFromCloud = async <T>(
  key: string,
  defaultValue: T,
  projectId?: string,
): Promise<T> => {
  const storageKey = getProjectKey(key, projectId);

  if (!isSupabaseEnabled()) {
    return localLoad(storageKey, defaultValue);
  }

  setSyncing();

  try {
    const userId = await getUserId();

    // 1. If we have a projectId, we should prioritize the MOST RECENT data globally
    // for this project, regardless of the user who saved it. This enables
    // persistence across devices (where user/session IDs might differ).
    if (projectId) {
      const { data: globalData, error: globalError } = await supabase!
        .from("test_data")
        .select("data, user_id, updated_at")
        .eq("data_type", storageKey)
        .order("updated_at", { ascending: false })
        .limit(1)
        .single();

      if (globalData && !globalError) {
        // If we found data, save it locally and return it
        localSave(storageKey, globalData.data);
        setSynced();
        return globalData.data as T;
      }
    }

    // 2. Fallback to current user's specific record if not found globally or no projectId
    if (userId) {
      const { data, error } = await supabase!
        .from("test_data")
        .select("data")
        .eq("user_id", userId)
        .eq("data_type", storageKey)
        .single();

      if (data && !error) {
        localSave(storageKey, data.data);
        setSynced();
        return data.data as T;
      }
    }

    setSynced();
    return localLoad(storageKey, defaultValue);
  } catch (error) {
    console.error("Error loading from cloud:", error);
    setSyncError(error instanceof Error ? error.message : "Cloud load failed");
    return localLoad(storageKey, defaultValue);
  }
};

// Sync all data from cloud
export const syncFromCloud = async (): Promise<boolean> => {
  if (!isSupabaseEnabled()) {
    setOffline();
    return false;
  }

  setSyncing();

  try {
    const userId = await getUserId();
    if (!userId) {
      setSyncError("Authentication failed");
      return false;
    }

    const { data, error } = await supabase!
      .from("test_data")
      .select("data_type, data")
      .eq("user_id", userId);

    if (error || !data) {
      setSyncError(error?.message || "No data returned");
      return false;
    }

    // Save all to localStorage
    data.forEach((item) => {
      localSave(item.data_type, item.data);
    });

    setSynced();
    return true;
  } catch (error) {
    console.error("Error syncing from cloud:", error);
    setSyncError(error instanceof Error ? error.message : "Sync failed");
    return false;
  }
};

// Export specific save functions
export const saveTestCases = async (
  testCases: TestCase[],
  projectId?: string,
): Promise<boolean> => {
  return saveToCloud(STORAGE_KEYS.TEST_CASES, testCases, projectId);
};

export const loadTestCases = async (
  projectId?: string,
): Promise<TestCase[]> => {
  return loadFromCloud<TestCase[]>(STORAGE_KEYS.TEST_CASES, [], projectId);
};

export const saveDefects = async (
  defects: Defect[],
  projectId?: string,
): Promise<boolean> => {
  return saveToCloud(STORAGE_KEYS.DEFECTS, defects, projectId);
};

export const loadDefects = async (projectId?: string): Promise<Defect[]> => {
  return loadFromCloud<Defect[]>(STORAGE_KEYS.DEFECTS, [], projectId);
};

export const saveMetrics = async (
  metrics: SuccessMetric[],
  projectId?: string,
): Promise<boolean> => {
  return saveToCloud(STORAGE_KEYS.METRICS, metrics, projectId);
};

export const loadMetrics = async (
  projectId?: string,
): Promise<SuccessMetric[]> => {
  return loadFromCloud<SuccessMetric[]>(STORAGE_KEYS.METRICS, [], projectId);
};

export const saveObjectives = async (
  objectives: TestObjective[],
  projectId?: string,
): Promise<boolean> => {
  return saveToCloud(STORAGE_KEYS.OBJECTIVES, objectives, projectId);
};

export const loadObjectives = async (
  projectId?: string,
): Promise<TestObjective[]> => {
  return loadFromCloud<TestObjective[]>(STORAGE_KEYS.OBJECTIVES, [], projectId);
};

export const saveQualityGates = async (
  gates: TestObjective[],
  projectId?: string,
): Promise<boolean> => {
  return saveToCloud(STORAGE_KEYS.QUALITY_GATES, gates, projectId);
};

export const loadQualityGates = async (
  projectId?: string,
): Promise<TestObjective[]> => {
  return loadFromCloud<TestObjective[]>(
    STORAGE_KEYS.QUALITY_GATES,
    [],
    projectId,
  );
};

export const saveEnvironments = async (
  environments: TestEnvironment[],
  projectId?: string,
): Promise<boolean> => {
  return saveToCloud(STORAGE_KEYS.ENVIRONMENTS, environments, projectId);
};

export const loadEnvironments = async (
  projectId?: string,
): Promise<TestEnvironment[]> => {
  return loadFromCloud<TestEnvironment[]>(
    STORAGE_KEYS.ENVIRONMENTS,
    [],
    projectId,
  );
};

export const saveSignOffs = async (
  signOffs: SignOff[],
  projectId?: string,
): Promise<boolean> => {
  return saveToCloud(STORAGE_KEYS.SIGN_OFFS, signOffs, projectId);
};

export const loadSignOffs = async (projectId?: string): Promise<SignOff[]> => {
  return loadFromCloud<SignOff[]>(STORAGE_KEYS.SIGN_OFFS, [], projectId);
};

// ProjectTab is imported from @/types/project and used here
// Components can import ProjectTab directly from @/types/project

export const saveProjectTabs = async (
  tabs: ProjectTab[],
  projectId?: string,
): Promise<boolean> => {
  return saveToCloud(STORAGE_KEYS.PROJECT_TABS, tabs, projectId);
};

export const loadProjectTabs = async (
  projectId?: string,
): Promise<ProjectTab[]> => {
  return loadFromCloud<ProjectTab[]>(STORAGE_KEYS.PROJECT_TABS, [], projectId);
};

export const getLastUpdated = (): string | null => {
  try {
    if (typeof window !== "undefined") {
      return window.localStorage.getItem(STORAGE_KEYS.LAST_UPDATED);
    }
    return null;
  } catch (error) {
    console.error("Error getting last updated:", error);
    return null;
  }
};
