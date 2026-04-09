import { ProjectStatus, GMAction, ResourceConflict, HRValidation, EmployeeAssignment } from "../types";

// Mock data for role-specific dashboards
export const utilizationData = [
  { month: 'Jan', utilization: 65 },
  { month: 'Feb', utilization: 72 },
  { month: 'Mar', utilization: 68 },
  { month: 'Apr', utilization: 75 },
  { month: 'May', utilization: 78 },
  { month: 'Jun', utilization: 82 },
];

// Marketing Dashboard Data
export const marketingProjects = [
  { id: '1', name: 'Q3 Campaign Launch', status: 'draft' as ProjectStatus, lastModified: '2 hours ago' },
  { id: '2', name: 'Website Redesign', status: 'submitted' as ProjectStatus, lastModified: '1 day ago' },
  { id: '3', name: 'Brand Refresh', status: 'rejected' as ProjectStatus, lastModified: '3 days ago', feedback: 'Budget constraints - please revise' },
];

// GM Dashboard Data
export const gmPendingActions: GMAction[] = [
  { id: '1', type: 'approval', title: 'Mobile App Development', submittedBy: 'Sarah Martinez', priority: 'high', daysWaiting: 2 },
  { id: '2', type: 'contract', title: 'David Lee Contract Extension', submittedBy: 'System', priority: 'medium', daysWaiting: 5 },
  { id: '3', type: 'conflict', title: 'Resource Overload: Emily Chen', submittedBy: 'HR', priority: 'high', daysWaiting: 1 },
];

export const gmResourceConflicts: ResourceConflict[] = [
  { employee: 'Emily Chen', allocation: 145, projects: 3, status: 'critical' },
  { employee: 'David Lee', allocation: 110, projects: 2, status: 'warning' },
];

// PM Dashboard Data
export const pmActiveProjects = [
  { id: '1', name: 'Website Redesign', progress: 65, status: 'in-progress' as ProjectStatus, teamSize: 8, deadline: '2026-07-15' },
  { id: '2', name: 'Mobile App', progress: 30, status: 'in-progress' as ProjectStatus, teamSize: 6, deadline: '2026-08-30' },
];

// HR Dashboard Data
export const hrPendingValidations: HRValidation[] = [
  { id: '1', employee: 'David Lee', project: 'Website Redesign', hasConflict: false, daysWaiting: 1 },
  { id: '2', employee: 'Sarah Kim', project: 'Mobile App', hasConflict: false, daysWaiting: 3 },
  { id: '3', employee: 'David Lee', project: 'Marketing Campaign', hasConflict: true, daysWaiting: 1 },
];

// Employee Dashboard Data
export const employeeAssignments: EmployeeAssignment[] = [
  { id: '1', project: 'Website Redesign', role: 'Frontend Developer', status: 'submitted' as ProjectStatus, allocation: 100 },
  { id: '2', project: 'Mobile App', role: 'Developer', status: 'in-progress' as ProjectStatus, progress: 65, allocation: 50 },
];
