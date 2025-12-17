import {
  TestCase,
  Defect,
  SuccessMetric,
  TestObjective,
  TestEnvironment,
  SignOff,
} from "@/types/test-case";

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

// Generic storage functions
export const saveToStorage = <T>(key: string, data: T): void => {
  try {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(key, JSON.stringify(data));
      window.localStorage.setItem(
        STORAGE_KEYS.LAST_UPDATED,
        new Date().toISOString()
      );
    }
  } catch (error) {
    console.error("Error saving to storage:", error);
  }
};

export const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    if (typeof window !== "undefined") {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    }
    return defaultValue;
  } catch (error) {
    console.error("Error loading from storage:", error);
    return defaultValue;
  }
};

export const clearStorage = (): void => {
  try {
    if (typeof window !== "undefined") {
      Object.values(STORAGE_KEYS).forEach((key) => {
        window.localStorage.removeItem(key);
      });
    }
  } catch (error) {
    console.error("Error clearing storage:", error);
  }
};

// Specific storage functions
export const saveTestCases = (testCases: TestCase[]): void => {
  saveToStorage(STORAGE_KEYS.TEST_CASES, testCases);
};

export const loadTestCases = (): TestCase[] => {
  return loadFromStorage<TestCase[]>(STORAGE_KEYS.TEST_CASES, []);
};

export const saveDefects = (defects: Defect[]): void => {
  saveToStorage(STORAGE_KEYS.DEFECTS, defects);
};

export const loadDefects = (): Defect[] => {
  return loadFromStorage<Defect[]>(STORAGE_KEYS.DEFECTS, []);
};

export const saveMetrics = (metrics: SuccessMetric[]): void => {
  saveToStorage(STORAGE_KEYS.METRICS, metrics);
};

export const loadMetrics = (): SuccessMetric[] => {
  return loadFromStorage<SuccessMetric[]>(STORAGE_KEYS.METRICS, []);
};

export const saveObjectives = (objectives: TestObjective[]): void => {
  saveToStorage(STORAGE_KEYS.OBJECTIVES, objectives);
};

export const loadObjectives = (): TestObjective[] => {
  return loadFromStorage<TestObjective[]>(STORAGE_KEYS.OBJECTIVES, []);
};

export const saveQualityGates = (gates: TestObjective[]): void => {
  saveToStorage(STORAGE_KEYS.QUALITY_GATES, gates);
};

export const loadQualityGates = (): TestObjective[] => {
  return loadFromStorage<TestObjective[]>(STORAGE_KEYS.QUALITY_GATES, []);
};

export const saveEnvironments = (environments: TestEnvironment[]): void => {
  saveToStorage(STORAGE_KEYS.ENVIRONMENTS, environments);
};

export const loadEnvironments = (): TestEnvironment[] => {
  return loadFromStorage<TestEnvironment[]>(STORAGE_KEYS.ENVIRONMENTS, []);
};

export const saveSignOffs = (signOffs: SignOff[]): void => {
  saveToStorage(STORAGE_KEYS.SIGN_OFFS, signOffs);
};

export const loadSignOffs = (): SignOff[] => {
  return loadFromStorage<SignOff[]>(STORAGE_KEYS.SIGN_OFFS, []);
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

// Export all data
export const exportAllData = () => {
  return {
    testCases: loadTestCases(),
    defects: loadDefects(),
    metrics: loadMetrics(),
    objectives: loadObjectives(),
    qualityGates: loadQualityGates(),
    environments: loadEnvironments(),
    signOffs: loadSignOffs(),
    lastUpdated: getLastUpdated(),
  };
};

// Import all data
export const importAllData = (data: any): void => {
  if (data.testCases) saveTestCases(data.testCases);
  if (data.defects) saveDefects(data.defects);
  if (data.metrics) saveMetrics(data.metrics);
  if (data.objectives) saveObjectives(data.objectives);
  if (data.qualityGates) saveQualityGates(data.qualityGates);
  if (data.environments) saveEnvironments(data.environments);
  if (data.signOffs) saveSignOffs(data.signOffs);
};
