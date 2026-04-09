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
  confidence: number;
  reasoning: string;
}

export interface ContractDecision {
  id: string;
  employeeName: string;
  employeeAvatar: string;
  contractEndDate: string;
  performance: 'excellent' | 'good' | 'average';
  currentWorkload: string;
  status: 'pending' | 'extended' | 'not-extended';
}
