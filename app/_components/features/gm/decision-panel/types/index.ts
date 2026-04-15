export interface ProjectData {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  progress: number;
  status: 'on-track' | 'at-risk' | 'delayed';
  assignedResources: string[];
  requiredResources: number;
  resourceUtilization: number;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface AIRecommendation {
  id: string;
  type: 'add-resource' | 'adjust-timeline' | 'reallocate';
  title: string;
  description: string;
  impact: {
    time?: string;
    cost?: string;
    risk?: string;
    workload?: string;
  };
  reasoning: string;
  metadata?: {
    employeeId?: string;
    employeeName?: string;
    roleName?: string;
    requiredSkills?: string[];
    allocationPercent?: number;
    candidateOptions?: Array<{
      employeeId: string;
      fullName: string;
      availabilityPercent: number;
    }>;
  };
}

export interface ContractDecision {
  id: string;
  employeeName: string;
  employeeAvatar: string;
  contractEndDate: string;
  jobTitle: string;
  availabilityPercent: number;
  workloadPercent: number;
  activeAssignmentCount: number;
  decisionType: string;
  decisionStatus: string;
}
