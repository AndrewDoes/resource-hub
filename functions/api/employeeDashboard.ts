import { BackendApiUrl } from "../BackendApiUrl";
import { updateAssignmentStatus } from "./humanResource";
import { authorizedFetch } from "./authorizedFetch";

export interface EmployeeDashboardTeamMember {
  fullName: string;
  roleName: string;
  jobTitle: string;
}

export interface EmployeeDashboardMilestone {
  milestoneId: string;
  title: string;
  description: string;
  dueDate: string;
  isCompleted: boolean;
  sortOrder: number;
}

export interface EmployeeDashboardTask {
  taskId: string;
  taskName: string;
  description: string;
  priority: string;
  status: string;
  workloadHours: number;
  dueDate: string;
  assignedDate: string;
}

export interface EmployeeDashboardAssignment {
  id: string;
  projectName: string;
  projectDescription: string;
  projectManagerName: string;
  roleName: string;
  status: string;
  progressPercent: number;
  projectProgressPercent: number;
  allocationPercent: number;
  startDate: string;
  endDate: string;
  teamMembers: EmployeeDashboardTeamMember[];
  milestones: EmployeeDashboardMilestone[];
  tasks: EmployeeDashboardTask[];
}

export interface EmployeeDashboardData {
  pendingAssignmentsCount: number;
  activeProjectsCount: number;
  assignments: EmployeeDashboardAssignment[];
}

export async function fetchEmployeeDashboard(employeeId: string): Promise<EmployeeDashboardData> {
  const response = await authorizedFetch(BackendApiUrl.employeeDashboard(employeeId));

  if (!response.ok) {
    throw new Error(`Failed to load employee dashboard (${response.status})`);
  }

  const payload = await response.json();

  return {
    pendingAssignmentsCount: payload.pendingAssignmentsCount ?? payload.PendingAssignmentsCount ?? 0,
    activeProjectsCount: payload.activeProjectsCount ?? payload.ActiveProjectsCount ?? 0,
    assignments: (payload.assignments ?? payload.Assignments ?? []).map((a: any) => ({
      id: a.id ?? a.Id,
      projectName: a.projectName ?? a.ProjectName,
      projectDescription: a.projectDescription ?? a.ProjectDescription ?? '',
      projectManagerName: a.projectManagerName ?? a.ProjectManagerName ?? 'Not Assigned',
      roleName: a.roleName ?? a.RoleName,
      status: a.status ?? a.Status,
      progressPercent: a.progressPercent ?? a.ProgressPercent ?? 0,
      projectProgressPercent: a.projectProgressPercent ?? a.ProjectProgressPercent ?? 0,
      allocationPercent: a.allocationPercent ?? a.AllocationPercent ?? 0,
      startDate: a.startDate ?? a.StartDate ?? '',
      endDate: a.endDate ?? a.EndDate ?? '',
      teamMembers: (a.teamMembers ?? a.TeamMembers ?? []).map((tm: any) => ({
        fullName: tm.fullName ?? tm.FullName,
        roleName: tm.roleName ?? tm.RoleName,
        jobTitle: tm.jobTitle ?? tm.JobTitle
      })),
      milestones: (a.milestones ?? a.Milestones ?? []).map((m: any) => ({
        milestoneId: m.milestoneId ?? m.MilestoneId,
        title: m.title ?? m.Title,
        description: m.description ?? m.Description ?? '',
        dueDate: m.dueDate ?? m.DueDate,
        isCompleted: m.isCompleted ?? m.IsCompleted ?? false,
        sortOrder: m.sortOrder ?? m.SortOrder ?? 0
      })),
      tasks: (a.tasks ?? a.Tasks ?? []).map((t: any) => ({
        taskId: t.taskId ?? t.TaskId,
        taskName: t.taskName ?? t.TaskName,
        description: t.description ?? t.Description ?? '',
        priority: t.priority ?? t.Priority,
        status: t.status ?? t.Status,
        workloadHours: t.workloadHours ?? t.WorkloadHours ?? 0,
        dueDate: t.dueDate ?? t.DueDate,
        assignedDate: t.assignedDate ?? t.AssignedDate
      }))
    }))
  };
}

export async function acceptAssignment(assignmentId: string): Promise<boolean> {
  return updateAssignmentStatus(assignmentId, 'Accepted');
}

export async function rejectAssignment(assignmentId: string): Promise<boolean> {
  return updateAssignmentStatus(assignmentId, 'Rejected');
}
