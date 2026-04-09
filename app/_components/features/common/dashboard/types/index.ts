import { LucideIcon } from 'lucide-react';
import { ProjectStatus } from "@/app/types";


export interface TimelineProject {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  progress: number;
  status: ProjectStatus;
  teamMembers: string[];
  description: string;
  hasConflict?: boolean;
  conflictMessage?: string;
  phase?: 'planning' | 'execution' | 'review' | 'delivery';
}

export interface DashboardStat {
  label: string;
  value: string;
  change: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
}
