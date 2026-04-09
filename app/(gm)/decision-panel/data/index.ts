import { ProjectData, ContractDecision } from './types';

export const mockProjects: ProjectData[] = [
  {
    id: 'p1',
    name: 'Website Redesign',
    startDate: '2026-04-15',
    endDate: '2026-07-15',
    progress: 45,
    status: 'at-risk',
    assignedResources: ['Sarah Chen', 'Mike Johnson', 'Alex Rivera', 'Emma Wilson', 'David Park', 'Lisa Brown'],
    requiredResources: 8,
    resourceUtilization: 110,
    riskLevel: 'high',
  },
  {
    id: 'p2',
    name: 'Mobile App Development',
    startDate: '2026-05-01',
    endDate: '2026-08-30',
    progress: 30,
    status: 'on-track',
    assignedResources: ['Emma Wilson', 'David Park', 'Lisa Brown', 'John Smith', 'Anna Lee', 'Tom Wilson', 'Kate Johnson', 'Mark Davis'],
    requiredResources: 8,
    resourceUtilization: 85,
    riskLevel: 'low',
  },
  {
    id: 'p3',
    name: 'Marketing Campaign Q3',
    startDate: '2026-06-01',
    endDate: '2026-09-15',
    progress: 15,
    status: 'delayed',
    assignedResources: ['Sarah Chen', 'David Park', 'Anna Lee', 'Kate Johnson'],
    requiredResources: 5,
    resourceUtilization: 125,
    riskLevel: 'high',
  },
];

export const mockContractDecisions: ContractDecision[] = [
  {
    id: 'contract-1',
    employeeName: 'David Lee',
    employeeAvatar: 'DL',
    contractEndDate: '2026-05-15',
    performance: 'excellent',
    currentWorkload: 'Backend Lead - 2 projects',
    status: 'pending',
  },
  {
    id: 'contract-2',
    employeeName: 'Emily Chen',
    employeeAvatar: 'EC',
    contractEndDate: '2026-06-01',
    performance: 'good',
    currentWorkload: 'Frontend Dev - 1 project',
    status: 'pending',
  },
];
