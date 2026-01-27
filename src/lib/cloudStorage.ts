import {
  TestCase,
  Defect,
  SuccessMetric,
  TestObjective,
  TestEnvironment,
  SignOff,
} from "@/types/test-case";
import { supabase, getSessionId, isSupabaseEnabled } from "./supabase";

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
  LAST_UPDATED: "credit_bureau_last_updated",
};

// Get or create user ID
const getUserId = async (): Promise<string | null> => {
  if (!isSupabaseEnabled()) return null;

  try {
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
    return true; // Fallback success
  }

  try {
    const userId = await getUserId();
    if (!userId) return false;

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
        .update({ data: data as unknown })
        .eq("id", existing.id);

      if (error) throw error;
    } else {
      // Insert new
      const { error } = await supabase!.from("test_data").insert([
        {
          user_id: userId,
          data_type: storageKey,
          data: data as unknown,
        },
      ]);

      if (error) throw error;
    }

    return true;
  } catch (error) {
    console.error("Error saving to cloud:", error);
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

  try {
    const userId = await getUserId();
    if (!userId) return localLoad(storageKey, defaultValue);

    const { data, error } = await supabase!
      .from("test_data")
      .select("data")
      .eq("user_id", userId)
      .eq("data_type", storageKey)
      .single();

    if (error || !data) {
      return localLoad(storageKey, defaultValue);
    }

    // Also save to localStorage for offline access
    localSave(storageKey, data.data);
    return data.data as T;
  } catch (error) {
    console.error("Error loading from cloud:", error);
    return localLoad(storageKey, defaultValue);
  }
};

// Sync all data from cloud
export const syncFromCloud = async (): Promise<boolean> => {
  if (!isSupabaseEnabled()) return false;

  try {
    const userId = await getUserId();
    if (!userId) return false;

    const { data, error } = await supabase!
      .from("test_data")
      .select("data_type, data")
      .eq("user_id", userId);

    if (error || !data) return false;

    // Save all to localStorage
    data.forEach((item) => {
      localSave(item.data_type, item.data);
    });

    return true;
  } catch (error) {
    console.error("Error syncing from cloud:", error);
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
