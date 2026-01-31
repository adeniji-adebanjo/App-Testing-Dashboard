import {
  Project,
  CreateProjectInput,
  UpdateProjectInput,
  ProjectStats,
  ProjectTab,
} from "@/types/project";
import { supabase, getSessionId, isSupabaseEnabled } from "./supabase";
import { DEFAULT_PROJECTS } from "@/data/projects";
import { setSynced, setSyncError } from "@/hooks/useCloudSyncStatus";

const PROJECTS_STORAGE_KEY = "testing_portal_projects";

// Event system for sync completion notifications
type SyncCompletionCallback = (
  syncedProjects: { oldId: string; newId: string }[],
) => void;
const syncListeners: Set<SyncCompletionCallback> = new Set();

export const onSyncComplete = (
  callback: SyncCompletionCallback,
): (() => void) => {
  syncListeners.add(callback);
  return () => syncListeners.delete(callback);
};

const notifySyncComplete = (
  syncedProjects: { oldId: string; newId: string }[],
) => {
  syncListeners.forEach((callback) => {
    try {
      callback(syncedProjects);
    } catch (err) {
      console.error("Error in sync completion callback:", err);
    }
  });
};

// Helper to get authenticated user ID - prioritizes Supabase Auth user
const getAuthUserId = async (): Promise<string | null> => {
  if (!isSupabaseEnabled()) return null;

  try {
    // First, try to get the authenticated user from Supabase Auth
    const { data: authData } = await supabase!.auth.getUser();

    if (authData?.user) {
      return authData.user.id;
    }

    // Fallback to session-based user
    const sessionId = getSessionId();
    const { data: userData } = await supabase!
      .from("users")
      .select("id")
      .eq("session_id", sessionId)
      .single();

    return userData?.id || null;
  } catch (error) {
    console.warn("Error getting auth user ID:", error);
    return null;
  }
};

// Generate a unique project ID using UUID for consistency with Supabase
const generateProjectId = (): string => {
  // Use crypto.randomUUID() for browser environments (modern browsers)
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older environments
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// Local storage helpers
const saveProjectsToLocal = (projects: Project[]): void => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
  } catch (error) {
    console.error("Error saving projects to localStorage:", error);
  }
};

const loadProjectsFromLocal = (): Project[] => {
  if (typeof window === "undefined") return DEFAULT_PROJECTS;
  try {
    const stored = localStorage.getItem(PROJECTS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Project[];

      // Ensure dates are converted back to Date objects
      const sanitized = parsed.map((p) => ({
        ...p,
        createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
        updatedAt: p.updatedAt ? new Date(p.updatedAt) : new Date(),
      }));

      // Merge with default projects: use stored version if it exists, otherwise use hardcoded default
      const defaultIds = DEFAULT_PROJECTS.map((p) => p.id);

      // Projects that are NOT in DEFAULT_PROJECTS and are in storage
      const customProjects = sanitized.filter(
        (p) => !defaultIds.includes(p.id),
      );

      // For each default project, check if it's in storage.
      // If yes, use the storage version merged with default (to ensure new fields exist)
      const defaultProjectsMerged = DEFAULT_PROJECTS.map((dp) => {
        const storedVersion = sanitized.find((p) => p.id === dp.id);
        if (storedVersion) {
          return { ...dp, ...storedVersion };
        }
        return dp;
      });

      return [...defaultProjectsMerged, ...customProjects];
    }
    return DEFAULT_PROJECTS;
  } catch (error) {
    console.error("Error loading projects from localStorage:", error);
    return DEFAULT_PROJECTS;
  }
};

// Initialize projects (ensure defaults exist and migrate if needed)
export const initializeProjects = async (): Promise<Project[]> => {
  const localProjects = loadProjectsFromLocal();
  saveProjectsToLocal(localProjects);

  if (isSupabaseEnabled()) {
    try {
      // 1. Check for legacy projects in test_data blob
      const { data: legacyData } = await supabase!
        .from("test_data")
        .select("id, data")
        .eq("data_type", PROJECTS_STORAGE_KEY)
        .single();

      // 2. Load projects from the new dedicated table
      const { data: currentProjects } = await supabase!
        .from("projects")
        .select("*");

      // 3. Migration logic: If legacy data exists but new table is empty, migrate
      if (legacyData && (!currentProjects || currentProjects.length === 0)) {
        console.log("Migrating project data to new relational structure...");
        const projectsToMigrate = legacyData.data as Project[];

        // Find user UUID for references - use authenticated user
        const userId = await getAuthUserId();

        if (userId) {
          for (const p of projectsToMigrate) {
            // We'll skip ID for now to let Postgres generate a UUID,
            // or we could map our slug ID to a slug column.
            // For now, we'll store the slug in a way that doesn't break UUID constraint if possible,
            // but the migration script used UUID.
            // I'll update the code to handle real UUIDs for new projects.
            try {
              await supabase!.from("projects").insert({
                user_id: userId,
                name: p.name,
                short_code: p.shortCode,
                description: p.description,
                tech_stack: p.techStack,
                target_users: p.targetUsers,
                document_version: p.documentVersion,
                status: p.status,
                phase: p.phase,
                color: p.color,
              });
            } catch (err) {
              console.warn("Migration failed for project:", p.name, err);
            }
          }
          // Optionally delete legacy blob after migration
          // await supabase!.from("test_data").delete().eq("id", legacyData.id);
        }
      }
    } catch (error) {
      console.warn("Could not initialize/migrate projects in cloud:", error);
    }
  }

  return loadProjects();
};

let isSyncing = false;

// Load all projects
export const loadProjects = async (): Promise<Project[]> => {
  // Try to load from Supabase 'projects' table
  if (isSupabaseEnabled()) {
    try {
      const { data, error } = await supabase!.from("projects").select("*");

      if (data && !error && data.length > 0) {
        // Map DB fields to Project type
        const cloudProjects = data.map((p) => ({
          ...p,
          shortCode: p.short_code,
          projectType: p.project_type || "web",
          techStack: p.tech_stack,
          targetUsers: p.target_users,
          documentVersion: p.document_version,
          createdAt: new Date(p.created_at),
          updatedAt: new Date(p.updated_at),
        })) as Project[];

        // Merge with local projects to prevent data loss of unsynced projects
        const localProjects = loadProjectsFromLocal();
        const cloudProjectIds = new Set(cloudProjects.map((p) => p.id));
        const cloudProjectNames = new Set(
          cloudProjects.map((p) => p.name.toLowerCase()),
        );
        const cloudProjectCodes = new Set(
          cloudProjects.map((p) => p.shortCode.toLowerCase()),
        );

        const localOnlyProjects = localProjects.filter((p) => {
          // If ID already exists in cloud, it's definitely not local-only
          if (cloudProjectIds.has(p.id)) return false;

          // If a project with the same name or code already exists,
          // we should link it instead of creating a new one (duplicate prevention)
          const nameExists = cloudProjectNames.has(p.name.toLowerCase());
          const codeExists = cloudProjectCodes.has(p.shortCode.toLowerCase());

          if (nameExists || codeExists) {
            console.log(
              `Found existing cloud project for ${p.name}, updating local ID...`,
            );
            // Find the matching cloud project to get its ID
            const match = cloudProjects.find(
              (cp) =>
                cp.name.toLowerCase() === p.name.toLowerCase() ||
                cp.shortCode.toLowerCase() === p.shortCode.toLowerCase(),
            );

            if (match) {
              // This part is subtle - we want to update the local ID immediately
              // but we need to return false so it doesn't get synced as a NEW project
              setTimeout(() => migrateLocalIdToCloudId(p.id, match.id), 0);
            }
            return false;
          }

          return true;
        });

        // Auto-sync local projects to cloud if valid
        if (localOnlyProjects.length > 0 && !isSyncing) {
          isSyncing = true;
          syncLocalProjectsToCloud(localOnlyProjects).finally(() => {
            isSyncing = false;
            console.log("Synced local projects to cloud");
          });
        }

        const mergedProjects = [...cloudProjects, ...localOnlyProjects];

        saveProjectsToLocal(mergedProjects);
        return mergedProjects;
      }
    } catch (error) {
      console.warn(
        "Could not load projects from cloud table, using local:",
        error,
      );
    }
  }

  return loadProjectsFromLocal();
};

// Helper function to update a local ID to match a newly found cloud ID
const migrateLocalIdToCloudId = async (oldId: string, newId: string) => {
  console.log(`Migrating local storage from ${oldId} to ${newId}`);
  const localProjects = loadProjectsFromLocal();
  const index = localProjects.findIndex((p) => p.id === oldId);
  if (index !== -1) {
    localProjects[index].id = newId;
    saveProjectsToLocal(localProjects);

    // Notify about ID change
    notifySyncComplete([{ oldId, newId }]);
  }
};

// Helper to sync local projects and notify on completion
const syncLocalProjectsToCloud = async (projects: Project[]) => {
  const syncedIdMappings: { oldId: string; newId: string }[] = [];

  try {
    const userId = await getAuthUserId();
    if (!userId) return;

    // Load legacy data from local storage to sync it
    const {
      loadTestCases,
      loadDefects,
      loadMetrics,
      loadObjectives,
      loadQualityGates,
      loadEnvironments,
      loadSignOffs,
    } = await import("./storage");

    // Save to cloud using cloudStorage
    const {
      saveTestCases,
      saveDefects,
      saveMetrics,
      saveObjectives,
      saveQualityGates,
      saveEnvironments,
      saveSignOffs,
      saveProjectTabs: saveProjectTabsToCloud,
    } = await import("./cloudStorage");

    // Import cloud storage helpers dynamically if needed,
    // but better to import at top if possible.
    // Since cloudStorage depends on projectStorage, we might have circular deps.
    // We'll use localStorage keys directly for project tabs to avoid this.
    const loadProjectTabs = () => {
      try {
        const item = localStorage.getItem("credit_bureau_project_tabs");
        return item ? JSON.parse(item) : [];
      } catch {
        return [];
      }
    };

    // Load all dependent data once
    const allTestCases = loadTestCases();
    const allDefects = loadDefects();
    const allMetrics = loadMetrics();
    const allObjectives = loadObjectives();
    const allGates = loadQualityGates();
    const allEnvironments = loadEnvironments();
    const allSignOffs = loadSignOffs();
    const allTabs = loadProjectTabs();

    let specificDataChanged = false;
    let localProjectsChanged = false;
    const currentLocalProjects = loadProjectsFromLocal();

    for (const project of projects) {
      console.log(`Syncing project ${project.name} to cloud...`);

      const { data: savedProject, error } = await supabase!
        .from("projects")
        .insert({
          user_id: userId,
          name: project.name,
          short_code: project.shortCode,
          project_type: project.projectType || "web",
          description: project.description,
          tech_stack: project.techStack,
          target_users: project.targetUsers,
          document_version: project.documentVersion,
          status: project.status,
          phase: project.phase,
          color: project.color,
          icon: project.icon,
        })
        .select()
        .single();

      if (!error && savedProject) {
        const oldId = project.id;
        const newId = savedProject.id;

        console.log(`Migrating data from ${oldId} to ${newId}`);

        // Track the ID mapping for notification
        syncedIdMappings.push({ oldId, newId });

        // 1. Update project ID in local storage
        const pIndex = currentLocalProjects.findIndex((p) => p.id === oldId);
        if (pIndex !== -1) {
          currentLocalProjects[pIndex] = {
            ...currentLocalProjects[pIndex],
            id: newId,
          };
          localProjectsChanged = true;
        }

        // 2. Update dependent data
        // Test Cases
        allTestCases.forEach((tc) => {
          if (tc.projectId === oldId) {
            tc.projectId = newId;
            specificDataChanged = true;
          }
        });

        // Defects
        allDefects.forEach((d) => {
          if (d.projectId === oldId) {
            d.projectId = newId;
            specificDataChanged = true;
          }
        });

        // Metrics
        allMetrics.forEach((m) => {
          if (m.projectId === oldId) {
            m.projectId = newId;
            specificDataChanged = true;
          }
        });

        // Objectives
        allObjectives.forEach((o) => {
          if (o.projectId === oldId) {
            o.projectId = newId;
            specificDataChanged = true;
          }
        });

        // Quality Gates
        allGates.forEach((g) => {
          if (g.projectId === oldId) {
            g.projectId = newId;
            specificDataChanged = true;
          }
        });

        // Environments
        allEnvironments.forEach((e) => {
          if (e.projectId === oldId) {
            e.projectId = newId;
            specificDataChanged = true;
          }
        });

        // Sign Offs
        allSignOffs.forEach((s) => {
          if (s.projectId === oldId) {
            s.projectId = newId;
            specificDataChanged = true;
          }
        });

        // Tabs
        allTabs.forEach((t: ProjectTab) => {
          if (t.projectId === oldId) {
            t.projectId = newId;
            specificDataChanged = true;
          }
        });
      }
    }

    // Save all changes
    if (localProjectsChanged) {
      saveProjectsToLocal(currentLocalProjects);
    }

    if (specificDataChanged) {
      saveTestCases(allTestCases);
      saveDefects(allDefects);
      saveMetrics(allMetrics);
      saveObjectives(allObjectives);
      saveQualityGates(allGates);
      saveEnvironments(allEnvironments);
      saveSignOffs(allSignOffs);
      saveProjectTabsToCloud(allTabs);
    }

    // Notify listeners about completed sync with ID mappings
    if (syncedIdMappings.length > 0) {
      console.log("Notifying listeners of synced projects:", syncedIdMappings);
      notifySyncComplete(syncedIdMappings);
    }
  } catch (err) {
    console.error("Error syncing local projects:", err);
  }
};

// Get a single project by ID
export const getProject = async (
  projectId: string,
): Promise<Project | null> => {
  const projects = await loadProjects();
  return projects.find((p) => p.id === projectId) || null;
};

// Create a new project
export const createProject = async (
  input: CreateProjectInput,
): Promise<Project> => {
  const projects = await loadProjects();

  // Check for duplicate short code
  if (
    projects.some(
      (p) => p.shortCode.toLowerCase() === input.shortCode.toLowerCase(),
    )
  ) {
    throw new Error(
      `Project with short code "${input.shortCode}" already exists`,
    );
  }

  const newProject: Project = {
    id: generateProjectId(), // Now uses UUID for consistency with Supabase
    name: input.name,
    shortCode: input.shortCode.toUpperCase(),
    description: input.description,
    projectType: input.projectType || "web",
    techStack: input.techStack,
    targetUsers: input.targetUsers,
    documentVersion: input.documentVersion || "1.0",
    status: "active",
    phase: "planning",
    color: input.color || "#6366F1",
    icon: input.icon,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Save to Local
  const updatedProjects = [...projects, newProject];
  saveProjectsToLocal(updatedProjects);

  // Sync to Cloud
  if (isSupabaseEnabled()) {
    try {
      const userId = await getAuthUserId();

      if (userId) {
        const { data: savedProject, error } = await supabase!
          .from("projects")
          .insert({
            id: newProject.id, // Use client-generated UUID
            user_id: userId,
            name: newProject.name,
            short_code: newProject.shortCode,
            description: newProject.description,
            project_type: newProject.projectType,
            tech_stack: newProject.techStack,
            target_users: newProject.targetUsers,
            document_version: newProject.documentVersion,
            status: newProject.status,
            phase: newProject.phase,
            color: newProject.color,
            icon: newProject.icon,
          })
          .select()
          .single();

        if (!error && savedProject) {
          // If successful, we could update the local ID with the actual UUID from DB
          // to ensure perfect relational mapping for test data.
          newProject.id = savedProject.id;
          saveProjectsToLocal([...projects, newProject]);
        }
      }
    } catch (error) {
      console.warn("Could not sync new project to cloud:", error);
    }
  }

  return newProject;
};

// Update an existing project
export const updateProject = async (
  projectId: string,
  input: UpdateProjectInput,
): Promise<Project> => {
  const projects = await loadProjects();
  const index = projects.findIndex((p) => p.id === projectId);

  if (index === -1) {
    throw new Error(`Project with ID "${projectId}" not found`);
  }

  const updatedProject: Project = {
    ...projects[index],
    ...input,
    shortCode: input.shortCode?.toUpperCase() || projects[index].shortCode,
    updatedAt: new Date(),
  };

  projects[index] = updatedProject;
  saveProjectsToLocal(projects);
  // Sync to Cloud
  if (isSupabaseEnabled()) {
    try {
      // If projectId is a UUID, use it directly.
      // If it looks like a slug (e.g. 'credit-bureau-portal'), we need to find the UUID.
      let targetId = projectId;
      const isUuid =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          projectId,
        );

      if (!isUuid) {
        // Try to find matching project by shortCode or name in cloud to get the real ID
        const { data: matches } = await supabase!
          .from("projects")
          .select("id")
          .or(
            `short_code.eq.${updatedProject.shortCode},name.eq.${updatedProject.name}`,
          )
          .limit(1);

        if (matches && matches.length > 0) {
          targetId = matches[0].id;
        }
      }

      const { error } = await supabase!
        .from("projects")
        .update({
          name: updatedProject.name,
          short_code: updatedProject.shortCode,
          description: updatedProject.description,
          project_type: updatedProject.projectType,
          tech_stack: updatedProject.techStack,
          target_users: updatedProject.targetUsers,
          document_version: updatedProject.documentVersion,
          status: updatedProject.status,
          phase: updatedProject.phase,
          color: updatedProject.color,
          icon: updatedProject.icon,
        })
        .eq("id", targetId);

      if (error) throw error;
      setSynced();
    } catch (error) {
      console.warn("Could not sync update to cloud:", error);
      setSyncError(
        error instanceof Error ? error.message : "Cloud update failed",
      );
    }
  }

  return updatedProject;
};

// Delete a project
export const deleteProject = async (projectId: string): Promise<boolean> => {
  const projects = await loadProjects();

  const defaultIds = DEFAULT_PROJECTS.map((p) => p.id);
  if (defaultIds.includes(projectId)) {
    throw new Error("Cannot delete default projects");
  }

  const filteredProjects = projects.filter((p) => p.id !== projectId);
  saveProjectsToLocal(filteredProjects);

  // Sync to Cloud
  if (isSupabaseEnabled()) {
    try {
      await supabase!.from("projects").delete().eq("id", projectId);
    } catch (error) {
      console.warn("Could not sync delete to cloud:", error);
    }
  }

  return true;
};

// Get project statistics
export const getProjectStats = async (
  projectId: string,
): Promise<ProjectStats> => {
  // Import here to avoid circular dependency
  const { loadFromStorage } = await import("./storage");

  // Load test cases for this project
  const allTestCases = loadFromStorage<
    Array<{ projectId?: string; status: string }>
  >("credit_bureau_test_cases", []);
  const projectTestCases = allTestCases.filter(
    (tc) => tc.projectId === projectId || !tc.projectId,
  );

  // Load defects for this project
  const allDefects = loadFromStorage<
    Array<{ projectId?: string; status: string }>
  >("credit_bureau_defects", []);
  const projectDefects = allDefects.filter(
    (d) => d.projectId === projectId || !d.projectId,
  );

  const passed = projectTestCases.filter((tc) => tc.status === "pass").length;
  const failed = projectTestCases.filter((tc) => tc.status === "fail").length;
  const pending = projectTestCases.filter(
    (tc) => tc.status === "pending",
  ).length;
  const blocked = projectTestCases.filter(
    (tc) => tc.status === "blocked",
  ).length;
  const total = projectTestCases.length;

  const defectsOpen = projectDefects.filter(
    (d) => d.status === "open" || d.status === "in-progress",
  ).length;
  const defectsClosed = projectDefects.filter(
    (d) => d.status === "resolved" || d.status === "closed",
  ).length;

  return {
    totalTestCases: total,
    passed,
    failed,
    pending,
    blocked,
    defectsOpen,
    defectsClosed,
    passRate: total > 0 ? Math.round((passed / total) * 100) : 0,
  };
};
