export type ProjectStatus =
  | 'draft'
  | 'submitted'
  | 'under-review'
  | 'approved'
  | 'rejected'
  | 'assigned'
  | 'in-progress'
  | 'on-hold'
  | 'completed'
  | 'cancelled'
  | 'on-track'
  | 'at-risk'
  | 'delayed';

export type UserRole = 'marketing' | 'pm' | 'gm' | 'hr' | 'employee';

export interface User {
  name: string;
  role: UserRole;
  avatar: string;
  email: string;
}

export interface GMAction {
  id: string;
  type: string;
  title: string;
  submittedBy: string;
  priority: string;
  daysWaiting: number;
}

export interface ResourceConflict {
  employee: string;
  allocation: number;
  projects: number;
  status: string;
}

export interface HRValidation {
  id: string;
  employee: string;
  project: string;
  hasConflict: boolean;
  daysWaiting: number;
}

export interface EmployeeAssignment {
  id: string;
  project: string;
  role: string;
  status: ProjectStatus;
  allocation: number;
  progress?: number;
}

export interface Employee {
  id: string;
  name: string;
  avatar: string;
  role: string;
  email: string;
  phone: string;
  location: string;
  department: string;
  skills: string[];
  status: 'active' | 'inactive' | 'resigned';
  availability: number;
  workload: number;
  currentProjects: string[];
  projectHistory: string[];
  joinedDate: string;
}

export interface ResourceSummary {
  id: string;
  name: string;
  avatar: string;
  role: string;
  department: string;
  skills: string[];
  utilization?: number;
  availability: number;
  workload: number;
  assignedHours: number;
  hoursPerDay?: number;
  currentProjects: string[];
  status: 'active' | 'inactive' | 'resigned' | 'available' | 'busy' | 'overloaded' | 'moderate';
}

export interface Project {
  id: string;
  name: string;
  status: ProjectStatus;
  progress: number;
  startDate: string;
  endDate: string;
  client?: string;
  pm?: string;
  team?: string[];
  assignedResources: string[];
  resourceUtilization: number;
  riskLevel: 'low' | 'medium' | 'high';
  priority: 'low' | 'medium' | 'high';
}

export interface Notification {
  id: string;
  type: 'assignment' | 'approval' | 'alert' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  navigationTarget: string;
  highlightProject?: string;
}

export interface GMDecision {
  id: string;
  type: 'extend-contract' | 'terminate-contract' | 'hire-resource';
  projectName: string;
  affectedEmployees: string[];
  deadline: string;
  submittedDate: string;
  status: 'pending' | 'executed' | 'clarification-requested';
  details: string;
}

export interface ContractAction {
  id: string;
  employeeName: string;
  employeeAvatar: string;
  currentContractEnd: string;
  assignedProject: string;
  action: 'extend' | 'terminate';
  gmDecisionId: string;
  status: 'pending' | 'executed';
}

export interface HiringRequest {
  id: string;
  role: string;
  quantity: number;
  skillRequirements: string[];
  projectName: string;
  gmDecisionId: string;
  status: 'pending' | 'in-progress' | 'completed';
}

export interface EmployeeStatus {
  id: string;
  name: string;
  avatar: string;
  status: 'available' | 'assigned' | 'blocked';
  currentProjects: string[];
  assignedHours: number;
}

export interface AssignmentRequest {
  id: string;
  projectName: string;
  employeeName: string;
  employeeAvatar: string;
  role: string;
  startDate: string;
  endDate: string;
  allocation: number;
  requestedBy: string;
  status: 'pending' | 'approved' | 'rejected';
  conflictWarning?: string;
}
