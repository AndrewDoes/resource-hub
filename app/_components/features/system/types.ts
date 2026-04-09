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

export interface ResourceConflict {
  id: string;
  type: 'overlap' | 'overload' | 'unavailable' | 'skill-mismatch';
  severity: 'critical' | 'high' | 'medium' | 'low';
  employeeId: string;
  employeeName: string;
  projectIds: string[];
  projectNames: string[];
  details: string;
  allocation: number;
  suggestions: SystemSuggestion[];
}

export interface SystemSuggestion {
  id: string;
  type: 'reassign' | 'reschedule' | 'hire' | 'split-workload' | 'reduce-scope';
  title: string;
  description: string;
  impact: string;
  alternatives?: {
    employeeId?: string;
    employeeName?: string;
    availability?: number;
    skills?: string[];
  }[];
}

export interface Project {
  id: string;
  name: string;
  status: ProjectStatus;
  startDate: string;
  endDate: string;
  requiredSkills: string[];
  assignedEmployees: string[];
  workload: number;
}

export interface Employee {
  id: string;
  name: string;
  skills: string[];
  availability: number;
  currentProjects: string[];
  status: 'active' | 'inactive' | 'on-leave';
}

export interface NotificationTrigger {
  event: string;
  recipients: string[];
  priority: 'high' | 'medium' | 'low';
  message: string;
  actionRequired: boolean;
}

export interface WorkflowStep {
  role: string;
  status: ProjectStatus[];
  description: string;
  color: string;
}
