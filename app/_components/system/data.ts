import { ProjectStatus, NotificationTrigger, WorkflowStep } from './types';

export const statusTransitions: Record<
  ProjectStatus,
  { next: ProjectStatus[]; triggeredBy: string; automatic: boolean }
> = {
  draft: {
    next: ['submitted'],
    triggeredBy: 'Marketing submits proposal',
    automatic: false,
  },
  submitted: {
    next: ['under-review'],
    triggeredBy: 'System validates and forwards to GM',
    automatic: true,
  },
  'under-review': {
    next: ['approved', 'rejected'],
    triggeredBy: 'GM makes decision',
    automatic: false,
  },
  approved: {
    next: ['assigned'],
    triggeredBy: 'PM assigns resources',
    automatic: false,
  },
  rejected: {
    next: ['draft'],
    triggeredBy: 'Marketing revises proposal',
    automatic: false,
  },
  assigned: {
    next: ['in-progress', 'on-hold'],
    triggeredBy: 'HR validates and Employee starts work',
    automatic: false,
  },
  'in-progress': {
    next: ['completed', 'on-hold', 'cancelled'],
    triggeredBy: 'Project completion or PM decision',
    automatic: false,
  },
  'on-hold': {
    next: ['in-progress', 'cancelled'],
    triggeredBy: 'PM resumes or cancels',
    automatic: false,
  },
  completed: {
    next: [],
    triggeredBy: 'Final status',
    automatic: false,
  },
  cancelled: {
    next: [],
    triggeredBy: 'Final status',
    automatic: false,
  },
  'on-track': {
    next: ['at-risk', 'delayed', 'completed'],
    triggeredBy: 'Timeline update',
    automatic: false,
  },
  'at-risk': {
    next: ['on-track', 'delayed', 'on-hold'],
    triggeredBy: 'Resource conflict or delay',
    automatic: false,
  },
  'delayed': {
    next: ['on-track', 'at-risk', 'on-hold'],
    triggeredBy: 'Schedule update',
    automatic: false,
  },
};

export const notificationTriggers: Record<string, NotificationTrigger> = {
  'project-submitted': {
    event: 'Project submitted for approval',
    recipients: ['gm', 'system'],
    priority: 'high',
    message: 'New project proposal requires your approval',
    actionRequired: true,
  },
  'project-approved': {
    event: 'Project approved by GM',
    recipients: ['pm', 'marketing'],
    priority: 'high',
    message: 'Project approved - ready for resource assignment',
    actionRequired: true,
  },
  'project-rejected': {
    event: 'Project rejected by GM',
    recipients: ['marketing'],
    priority: 'high',
    message: 'Project rejected - review feedback and revise',
    actionRequired: true,
  },
  'resource-assigned': {
    event: 'Resources assigned to project',
    recipients: ['hr', 'employee', 'system'],
    priority: 'medium',
    message: 'New resource assignment pending validation',
    actionRequired: true,
  },
  'conflict-detected': {
    event: 'Resource conflict detected',
    recipients: ['gm', 'pm', 'system'],
    priority: 'high',
    message: 'Resource conflict requires immediate attention',
    actionRequired: true,
  },
  'hr-update': {
    event: 'HR updates employee data',
    recipients: ['system', 'pm'],
    priority: 'medium',
    message: 'Employee data updated - availability recalculated',
    actionRequired: false,
  },
  'timeline-change-request': {
    event: 'PM requests timeline adjustment',
    recipients: ['gm'],
    priority: 'medium',
    message: 'Timeline adjustment request from PM',
    actionRequired: true,
  },
  'feedback-from-pm': {
    event: 'PM sends feedback to GM',
    recipients: ['gm'],
    priority: 'medium',
    message: 'PM feedback on project approval',
    actionRequired: true,
  },
};

export const workflowSteps: WorkflowStep[] = [
  {
    role: 'Marketing',
    status: ['draft', 'submitted'],
    description: 'Create and submit project proposal',
    color: 'from-purple-500 to-pink-500',
  },
  {
    role: 'General Manager',
    status: ['submitted', 'approved', 'rejected'],
    description: 'Review and approve/reject proposal',
    color: 'from-blue-500 to-green-500',
  },
  {
    role: 'Project Manager',
    status: ['approved', 'assigned'],
    description: 'Review project and provide feedback',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    role: 'HR',
    status: ['assigned'],
    description: 'Validate and approve resource assignments',
    color: 'from-green-500 to-teal-500',
  },
  {
    role: 'Employee',
    status: ['assigned', 'in-progress', 'completed'],
    description: 'Accept assignment and execute work',
    color: 'from-orange-500 to-yellow-500',
  },
];
