const baseUrl = "/api/gateway";

export const BackendApiUrl = {
  projects: `${baseUrl}/api/projects`,
  projectManager: `${baseUrl}/api/project-manager`,
  projectManagerProjectsList: `${baseUrl}/api/project-manager/projects/list`,
  projectManagerProjectOverview: (projectId: string) => `${baseUrl}/api/project-manager/projects/${projectId}/overview`,
  projectManagerProjectTeam: (projectId: string) => `${baseUrl}/api/project-manager/projects/${projectId}/team`,
  projectManagerProjectActivity: (projectId: string) => `${baseUrl}/api/project-manager/projects/${projectId}/activity`,
  projectManagerProjectMilestones: (projectId: string) => `${baseUrl}/api/project-manager/projects/${projectId}/milestones`,
  projectManagerProjectTimelineTasks: (projectId: string) => `${baseUrl}/api/project-manager/projects/${projectId}/timeline-tasks`,
  generalManager: `${baseUrl}/api/general-manager`,
  generalManagerWorkforceSummary: `${baseUrl}/api/general-manager/workforce-summary`,
  generalManagerProjectPrediction: (projectId: string) => `${baseUrl}/api/general-manager/predictions/projects/${projectId}`,
  generalManagerContractDecisions: `${baseUrl}/api/general-manager/predictions/contract-decisions`,
  generalManagerDecisions: `${baseUrl}/api/general-manager/predictions/decisions`,
  employees: `${baseUrl}/api/employees`,
  employeesList: `${baseUrl}/api/employees/list`,
  assignments: `${baseUrl}/api/assignments`,
  lookups: `${baseUrl}/api/lookups`,
} as const;
