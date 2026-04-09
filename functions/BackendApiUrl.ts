const baseUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL ?? "http://localhost:5002";

export const BackendApiUrl = {
  projects: `${baseUrl}/api/projects`,
  projectManager: `${baseUrl}/api/project-manager`,
  projectManagerProjectsList: `${baseUrl}/api/project-manager/projects/list`,
  generalManager: `${baseUrl}/api/general-manager`,
  generalManagerWorkforceSummary: `${baseUrl}/api/general-manager/workforce-summary`,
  employees: `${baseUrl}/api/employees`,
  assignments: `${baseUrl}/api/assignments`,
  lookups: `${baseUrl}/api/lookups`,
} as const;
