export interface ResourceSummary {
  id: string;
  name: string;
  avatar: string;
  role: string;
  department: string;
  skills: string[];
  availability: number;
  workload: number;
  assignedHours: number;
  currentProjects: string[];
  status: 'available' | 'moderate' | 'busy' | 'overloaded';
}
