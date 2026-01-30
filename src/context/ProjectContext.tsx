"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { Project, ProjectStats, ProjectWithStats } from "@/types/project";
import {
  loadProjects,
  getProject,
  getProjectStats,
  initializeProjects,
  createProject as createProjectStorage,
  updateProject as updateProjectStorage,
  deleteProject as deleteProjectStorage,
  onSyncComplete,
} from "@/lib/projectStorage";
import { CreateProjectInput, UpdateProjectInput } from "@/types/project";

interface ProjectContextType {
  // State
  projects: Project[];
  currentProject: Project | null;
  currentProjectStats: ProjectStats | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setCurrentProject: (project: Project | null) => void;
  setCurrentProjectById: (projectId: string) => Promise<boolean>;
  refreshProjects: () => Promise<void>;
  refreshCurrentProjectStats: () => Promise<void>;
  getProjectWithStats: (projectId: string) => Promise<ProjectWithStats | null>;
  createProject: (input: CreateProjectInput) => Promise<Project>;
  updateProject: (
    projectId: string,
    input: UpdateProjectInput,
  ) => Promise<Project>;
  deleteProject: (projectId: string) => Promise<boolean>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

interface ProjectProviderProps {
  children: ReactNode;
  initialProjectId?: string;
}

export function ProjectProvider({
  children,
  initialProjectId,
}: ProjectProviderProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [currentProjectStats, setCurrentProjectStats] =
    useState<ProjectStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize and load projects - returns projects for internal use only
  const loadProjectsInternal = useCallback(async (): Promise<Project[]> => {
    setIsLoading(true);
    setError(null);
    try {
      await initializeProjects();
      const loadedProjects = await loadProjects();
      setProjects(loadedProjects);
      return loadedProjects;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load projects";
      setError(message);
      console.error("Error loading projects:", err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Public refresh function that matches the interface
  const refreshProjects = useCallback(async (): Promise<void> => {
    await loadProjectsInternal();
  }, [loadProjectsInternal]);

  // Load stats for current project
  const refreshCurrentProjectStats = useCallback(async () => {
    if (!currentProject) {
      setCurrentProjectStats(null);
      return;
    }

    try {
      const stats = await getProjectStats(currentProject.id);
      setCurrentProjectStats(stats);
    } catch (err) {
      console.error("Error loading project stats:", err);
    }
  }, [currentProject]);

  // Set current project by ID
  const setCurrentProjectById = useCallback(
    async (projectId: string): Promise<boolean> => {
      try {
        const project = await getProject(projectId);
        if (project) {
          setCurrentProject(project);
          // Save to localStorage for persistence
          if (typeof window !== "undefined") {
            localStorage.setItem("current_project_id", projectId);
          }
          return true;
        }
        return false;
      } catch (err) {
        console.error("Error setting current project:", err);
        return false;
      }
    },
    [],
  );

  // Get project with stats
  const getProjectWithStats = useCallback(
    async (projectId: string): Promise<ProjectWithStats | null> => {
      try {
        const project = await getProject(projectId);
        if (!project) return null;

        const stats = await getProjectStats(projectId);
        return { ...project, stats };
      } catch (err) {
        console.error("Error getting project with stats:", err);
        return null;
      }
    },
    [],
  );

  // Initial load
  useEffect(() => {
    const init = async () => {
      const loadedProjects = await loadProjectsInternal();

      // Try to restore current project from localStorage or use initial
      let projectIdToLoad = initialProjectId;

      if (!projectIdToLoad && typeof window !== "undefined") {
        projectIdToLoad =
          localStorage.getItem("current_project_id") || undefined;
      }

      if (projectIdToLoad) {
        const project = loadedProjects.find((p) => p.id === projectIdToLoad);
        if (project) {
          setCurrentProject(project);
        }
      }
    };

    init();
  }, [initialProjectId, loadProjectsInternal]);

  // Listen for cloud sync completion and refresh data
  useEffect(() => {
    const unsubscribe = onSyncComplete((syncedProjects) => {
      console.log(
        "Cloud sync completed, refreshing projects...",
        syncedProjects,
      );

      // Refresh all projects
      loadProjectsInternal().then((loadedProjects) => {
        // If current project ID was changed, update the reference
        if (currentProject) {
          const mapping = syncedProjects.find(
            (m) => m.oldId === currentProject.id,
          );
          if (mapping) {
            const updatedProject = loadedProjects.find(
              (p) => p.id === mapping.newId,
            );
            if (updatedProject) {
              setCurrentProject(updatedProject);
              // Update localStorage with new ID
              if (typeof window !== "undefined") {
                localStorage.setItem("current_project_id", mapping.newId);
              }
            }
          }
        }
      });
    });

    return unsubscribe;
  }, [currentProject, loadProjectsInternal]);

  // Update stats when current project changes
  useEffect(() => {
    refreshCurrentProjectStats();
  }, [currentProject, refreshCurrentProjectStats]);

  // Create a new project
  const createProject = useCallback(
    async (input: CreateProjectInput): Promise<Project> => {
      const newProject = await createProjectStorage(input);
      await loadProjectsInternal();
      return newProject;
    },
    [loadProjectsInternal],
  );

  // Update an existing project
  const updateProject = useCallback(
    async (projectId: string, input: UpdateProjectInput): Promise<Project> => {
      const updatedProject = await updateProjectStorage(projectId, input);
      await loadProjectsInternal();
      // Update current project if it's the one being updated
      if (currentProject?.id === projectId) {
        setCurrentProject(updatedProject);
      }
      return updatedProject;
    },
    [loadProjectsInternal, currentProject],
  );

  // Delete a project
  const deleteProject = useCallback(
    async (projectId: string): Promise<boolean> => {
      const result = await deleteProjectStorage(projectId);
      if (result) {
        await loadProjectsInternal();
        // Clear current project if it's the one being deleted
        if (currentProject?.id === projectId) {
          setCurrentProject(null);
          if (typeof window !== "undefined") {
            localStorage.removeItem("current_project_id");
          }
        }
      }
      return result;
    },
    [loadProjectsInternal, currentProject],
  );

  const value: ProjectContextType = {
    projects,
    currentProject,
    currentProjectStats,
    isLoading,
    error,
    setCurrentProject,
    setCurrentProjectById,
    refreshProjects,
    refreshCurrentProjectStats,
    getProjectWithStats,
    createProject,
    updateProject,
    deleteProject,
  };

  return (
    <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
  );
}

// Custom hook to use the project context
export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
}

// Hook to get a specific project
export function useProjectById(projectId: string | undefined) {
  const { projects, isLoading } = useProject();

  const project = projectId
    ? projects.find((p) => p.id === projectId) || null
    : null;

  return { project, isLoading };
}
