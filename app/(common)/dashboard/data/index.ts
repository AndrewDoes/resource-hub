import { BarChart3, Users, AlertTriangle, TrendingUp } from 'lucide-react';
import { TimelineProject, DashboardStat } from '../types';
import { ProjectStatus, GMAction, ResourceConflict, HRValidation, EmployeeAssignment } from "@/app/types";
import { Employee } from "@/app/_components/system/types";



// Mock data for role-specific dashboards
export const utilizationData = [
  { month: 'Jan', utilization: 65 },
  { month: 'Feb', utilization: 72 },
  { month: 'Mar', utilization: 68 },
  { month: 'Apr', utilization: 75 },
  { month: 'May', utilization: 78 },
  { month: 'Jun', utilization: 82 },
];

export const mockEmployees: Employee[] = [
  {
    id: 'emp-1',
    name: 'Sarah Chen',
    skills: ['Frontend', 'React', 'Design'],
    availability: 40,
    currentProjects: ['1', '4', '6'],
    status: 'active',
  },
  {
    id: 'emp-2',
    name: 'Mike Johnson',
    skills: ['Full Stack', 'Node.js', 'React'],
    availability: 0,
    currentProjects: ['1', '2'],
    status: 'active',
  },
  {
    id: 'emp-3',
    name: 'Alex Rivera',
    skills: ['Frontend', 'React', 'UI/UX'],
    availability: 60,
    currentProjects: ['1', '5'],
    status: 'active',
  },
  {
    id: 'emp-4',
    name: 'Emma Wilson',
    skills: ['Mobile', 'React Native', 'iOS'],
    availability: 45,
    currentProjects: ['2', '5'],
    status: 'active',
  },
  {
    id: 'emp-5',
    name: 'David Park',
    skills: ['Backend', 'Database', 'DevOps'],
    availability: 30,
    currentProjects: ['2', '4'],
    status: 'active',
  },
  {
    id: 'emp-6',
    name: 'Lisa Anderson',
    skills: ['Marketing', 'Content', 'SEO'],
    availability: 55,
    currentProjects: ['3'],
    status: 'active',
  },
  {
    id: 'emp-7',
    name: 'Tom Harris',
    skills: ['Marketing', 'Analytics', 'Ads'],
    availability: 45,
    currentProjects: ['3'],
    status: 'active',
  },
  {
    id: 'emp-8',
    name: 'Chris Martinez',
    skills: ['Security', 'Backend', 'Testing'],
    availability: 70,
    currentProjects: ['6'],
    status: 'active',
  },
];

export const mockProjects: TimelineProject[] = [
  {
    id: '1',
    name: 'Website Redesign',
    description: 'Complete overhaul of company website with new branding',
    startDate: '2026-04-01',
    endDate: '2026-05-15',
    progress: 65,
    status: 'in-progress',
    teamMembers: ['Sarah Chen', 'Mike Johnson', 'Alex Rivera'],
    phase: 'execution',
    hasConflict: false,
  },
  {
    id: '2',
    name: 'Mobile App Launch',
    description: 'iOS and Android app development and launch',
    startDate: '2026-04-10',
    endDate: '2026-06-30',
    progress: 35,
    status: 'in-progress',
    teamMembers: ['Mike Johnson', 'Emma Wilson', 'David Park'],
    phase: 'execution',
    hasConflict: true,
    conflictMessage: 'Mike Johnson is allocated to 2 overlapping projects (150% capacity)',
  },
  {
    id: '3',
    name: 'Q2 Marketing Campaign',
    description: 'Multi-channel marketing campaign for Q2 product launch',
    startDate: '2026-04-15',
    endDate: '2026-05-30',
    progress: 45,
    status: 'in-progress',
    teamMembers: ['Lisa Anderson', 'Tom Harris'],
    phase: 'execution',
    hasConflict: false,
  },
  {
    id: '4',
    name: 'Database Migration',
    description: 'Migrate legacy database to new cloud infrastructure',
    startDate: '2026-05-01',
    endDate: '2026-06-15',
    progress: 15,
    status: 'assigned',
    teamMembers: ['David Park', 'Sarah Chen'],
    phase: 'planning',
    hasConflict: false,
  },
  {
    id: '5',
    name: 'Customer Portal v2',
    description: 'Enhanced customer self-service portal',
    startDate: '2026-03-15',
    endDate: '2026-04-10',
    progress: 100,
    status: 'completed',
    teamMembers: ['Alex Rivera', 'Emma Wilson'],
    phase: 'delivery',
    hasConflict: false,
  },
  {
    id: '6',
    name: 'Security Audit',
    description: 'Comprehensive security review and penetration testing',
    startDate: '2026-05-20',
    endDate: '2026-06-30',
    progress: 0,
    status: 'assigned',
    teamMembers: ['Chris Martinez', 'Sarah Chen'],
    phase: 'planning',
    hasConflict: true,
    conflictMessage: 'Sarah Chen is allocated to 3 overlapping projects (120% capacity)',
  },
];

export const statsData: DashboardStat[] = [
  {
    label: 'Active Projects',
    value: '8',
    change: '+2 this week',
    icon: BarChart3,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    label: 'Total Team Members',
    value: '24',
    change: '6 teams',
    icon: Users,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  {
    label: 'Conflicts Detected',
    value: '3',
    change: 'Needs attention',
    icon: AlertTriangle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
  },
  {
    label: 'Avg Progress',
    value: '67%',
    change: '+12% vs last month',
    icon: TrendingUp,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
];

// Marketing Dashboard Data
export const marketingProjects = [
  { id: '1', name: 'Q3 Campaign Launch', status: 'draft' as ProjectStatus, lastModified: '2 hours ago' },
  { id: '2', name: 'Website Redesign', status: 'submitted' as ProjectStatus, lastModified: '1 day ago' },
  { id: '3', name: 'Brand Refresh', status: 'rejected' as ProjectStatus, lastModified: '3 days ago', feedback: 'Budget constraints - please revise' },
];

// GM Dashboard Data
export const gmPendingActions: GMAction[] = [
  { id: '1', type: 'approval', title: 'Mobile App Development', submittedBy: 'Sarah Martinez', priority: 'high', daysWaiting: 2 },
  { id: '2', type: 'contract', title: 'David Lee Contract Extension', submittedBy: 'System', priority: 'medium', daysWaiting: 5 },
  { id: '3', type: 'conflict', title: 'Resource Overload: Emily Chen', submittedBy: 'HR', priority: 'high', daysWaiting: 1 },
];

export const gmResourceConflicts: ResourceConflict[] = [
  { employee: 'Emily Chen', allocation: 145, projects: 3, status: 'critical' },
  { employee: 'David Lee', allocation: 110, projects: 2, status: 'warning' },
];

// PM Dashboard Data
export const pmActiveProjects = [
  { id: '1', name: 'Website Redesign', progress: 65, status: 'in-progress' as ProjectStatus, teamSize: 8, deadline: '2026-07-15' },
  { id: '2', name: 'Mobile App', progress: 30, status: 'in-progress' as ProjectStatus, teamSize: 6, deadline: '2026-08-30' },
];

// HR Dashboard Data
export const hrPendingValidations: HRValidation[] = [
  { id: '1', employee: 'David Lee', project: 'Website Redesign', hasConflict: false, daysWaiting: 1 },
  { id: '2', employee: 'Sarah Kim', project: 'Mobile App', hasConflict: false, daysWaiting: 3 },
  { id: '3', employee: 'David Lee', project: 'Marketing Campaign', hasConflict: true, daysWaiting: 1 },
];

// Employee Dashboard Data
export const employeeAssignments: EmployeeAssignment[] = [
  { id: '1', project: 'Website Redesign', role: 'Frontend Developer', status: 'submitted' as ProjectStatus, allocation: 100 },
  { id: '2', project: 'Mobile App', role: 'Developer', status: 'in-progress' as ProjectStatus, progress: 65, allocation: 50 },
];
