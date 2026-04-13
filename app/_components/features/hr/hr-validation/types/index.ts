export interface GMDecision {
  id: string;
  type: 'extend-contract' | 'terminate-contract' | 'hire-resource';
  projectName: string;
  affectedEmployees: string[];
  deadline: string;
  submittedDate: string;
  status: 'pending' | 'executed' | 'clarification-requested' | 'gmapproved';
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
  status: string;
  workloadStatus: string;
  currentProjects: string[];
  assignedHours: number; // Daily working hours assigned
  workload: number;
  availability: number;
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
  status: 'pending' | 'gmapproved' | 'approved' | 'rejected';
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
  status: 'active' | 'inactive' | 'resigned';
  availability: number;
  workload: number;
  currentProjects: string[];
  projectHistory: string[];
  joinedDate: string;
}

export type TabType = 'all' | 'active' | 'available' | 'assigned' | 'overloaded';
