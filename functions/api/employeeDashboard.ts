// API utility for Employee Dashboard
import { BackendApiUrl } from "../BackendApiUrl";
import { updateAssignmentStatus } from "./humanResource";

export interface EmployeeDashboardAssignment {
  id: string;
  projectName: string;
  projectDescription: string;
  roleName: string;
  status: string;
  progressPercent: number;
  projectProgressPercent: number;
  allocationPercent: number;
  endDate: string;
}

export interface EmployeeDashboardData {
  pendingAssignmentsCount: number;
  activeProjectsCount: number;
  assignments: EmployeeDashboardAssignment[];
}

export async function fetchEmployeeDashboard(employeeId: string): Promise<EmployeeDashboardData> {
  const response = await fetch(BackendApiUrl.employeeDashboard(employeeId));

  if (!response.ok) {
    throw new Error(`Failed to load employee dashboard (${response.status})`);
  }

  const payload = await response.json();
  
  // The backend might return camelCase or PascalCase depending on JSON serializer settings
  // Normalizing to lowercase/standard names here if necessary.
  
  return {
    pendingAssignmentsCount: payload.pendingAssignmentsCount ?? payload.PendingAssignmentsCount ?? 0,
    activeProjectsCount: payload.activeProjectsCount ?? payload.ActiveProjectsCount ?? 0,
    assignments: (payload.assignments ?? payload.Assignments ?? []).map((a: any) => ({
      id: a.id ?? a.Id,
      projectName: a.projectName ?? a.ProjectName,
      projectDescription: a.projectDescription ?? a.ProjectDescription ?? '',
      roleName: a.roleName ?? a.RoleName,
      status: a.status ?? a.Status,
      progressPercent: a.progressPercent ?? a.ProgressPercent ?? 0,
      projectProgressPercent: a.projectProgressPercent ?? a.ProjectProgressPercent ?? 0,
      allocationPercent: a.allocationPercent ?? a.AllocationPercent ?? 0,
      endDate: a.endDate ?? a.EndDate ?? ''
    }))
  };
}

export async function acceptAssignment(assignmentId: string): Promise<boolean> {
  return updateAssignmentStatus(assignmentId, 'Accepted');
}

export async function rejectAssignment(assignmentId: string): Promise<boolean> {
  return updateAssignmentStatus(assignmentId, 'Rejected');
}
