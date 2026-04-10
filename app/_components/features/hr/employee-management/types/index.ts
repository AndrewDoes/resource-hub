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
  assignedHours: number; // Daily working hours assigned
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
  status: 'active' | 'inactive' | 'resigned' | 'terminated';
  availability: number;
  workload: number;
  assignedHours: number;
  currentProjects: string[];
  projectHistory: string[];
  joinedDate: string;
  hireDate: string;
}

export type TabType = 'all' | 'active' | 'available' | 'assigned' | 'overloaded';
