import { TimelineProject } from './types';
import { Project as IntelligenceProject, Employee } from '@/app/_components/system/SystemIntelligence';

/**
 * Convert TimelineProject to IntelligenceProject format for conflict detection
 */
export const convertToIntelligenceProjects = (
  projects: TimelineProject[], 
  employees: Employee[]
): IntelligenceProject[] => {
  return projects.map((p) => ({
    id: p.id,
    name: p.name,
    status: p.status as any,
    startDate: p.startDate,
    endDate: p.endDate,
    requiredSkills: [],
    assignedEmployees: employees
      .filter((emp) => emp.currentProjects.includes(p.id))
      .map((emp) => emp.id),
    workload: p.status === 'completed' ? 0 : p.status === 'in-progress' ? 50 : 30,
  }));
};

export const getPhaseColor = (phase?: string) => {
  switch (phase) {
    case 'planning':
      return 'bg-yellow-100 text-yellow-800';
    case 'execution':
      return 'bg-blue-100 text-blue-800';
    case 'review':
      return 'bg-purple-100 text-purple-800';
    case 'delivery':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};
