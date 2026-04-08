'use client';
import { AlertTriangle, CheckCircle, Info, Lightbulb, Users, Calendar } from 'lucide-react';

export interface ResourceConflict {
  id: string;
  type: 'overlap' | 'overload' | 'unavailable' | 'skill-mismatch';
  severity: 'critical' | 'high' | 'medium' | 'low';
  employeeId: string;
  employeeName: string;
  projectIds: string[];
  projectNames: string[];
  details: string;
  allocation: number;
  suggestions: SystemSuggestion[];
}

export interface SystemSuggestion {
  id: string;
  type: 'reassign' | 'reschedule' | 'hire' | 'split-workload' | 'reduce-scope';
  title: string;
  description: string;
  impact: string;
  alternatives?: {
    employeeId?: string;
    employeeName?: string;
    availability?: number;
    skills?: string[];
  }[];
}

export interface Project {
  id: string;
  name: string;
  status: ProjectStatus;
  startDate: string;
  endDate: string;
  requiredSkills: string[];
  assignedEmployees: string[];
  workload: number;
}

export interface Employee {
  id: string;
  name: string;
  skills: string[];
  availability: number;
  currentProjects: string[];
  status: 'active' | 'inactive' | 'on-leave';
}

export type ProjectStatus =
  | 'draft'
  | 'submitted'
  | 'under-review'
  | 'approved'
  | 'rejected'
  | 'assigned'
  | 'in-progress'
  | 'on-hold'
  | 'completed'
  | 'cancelled';

// System Intelligence Engine
export class ResourcePlanningSystem {
  // Detect resource conflicts
  static detectConflicts(
    projects: Project[],
    employees: Employee[]
  ): ResourceConflict[] {
    const conflicts: ResourceConflict[] = [];

    employees.forEach((employee) => {
      // Check for overload
      const totalAllocation = this.calculateEmployeeWorkload(employee, projects);

      if (totalAllocation > 100) {
        const conflict = this.createOverloadConflict(employee, projects, totalAllocation);
        conflicts.push(conflict);
      }

      // Check for overlapping project timelines
      const overlappingProjects = this.findOverlappingProjects(employee, projects);
      if (overlappingProjects.length > 1) {
        const conflict = this.createOverlapConflict(employee, overlappingProjects);
        conflicts.push(conflict);
      }

      // Check for unavailability
      if (employee.status !== 'active' && employee.currentProjects.length > 0) {
        const conflict = this.createUnavailabilityConflict(employee, projects);
        conflicts.push(conflict);
      }
    });

    return conflicts;
  }

  // Calculate total workload for an employee
  static calculateEmployeeWorkload(employee: Employee, projects: Project[]): number {
    return projects
      .filter((p) => p.assignedEmployees.includes(employee.id))
      .reduce((total, project) => total + project.workload, 0);
  }

  // Find projects with overlapping timelines
  static findOverlappingProjects(employee: Employee, projects: Project[]): Project[] {
    const employeeProjects = projects.filter((p) =>
      p.assignedEmployees.includes(employee.id)
    );

    return employeeProjects.filter((project) => {
      const projectStart = new Date(project.startDate);
      const projectEnd = new Date(project.endDate);

      return employeeProjects.some((other) => {
        if (other.id === project.id) return false;

        const otherStart = new Date(other.startDate);
        const otherEnd = new Date(other.endDate);

        return (
          (projectStart >= otherStart && projectStart <= otherEnd) ||
          (projectEnd >= otherStart && projectEnd <= otherEnd) ||
          (projectStart <= otherStart && projectEnd >= otherEnd)
        );
      });
    });
  }

  // Generate smart recommendations
  static generateRecommendations(
    conflict: ResourceConflict,
    allEmployees: Employee[],
    projects: Project[]
  ): SystemSuggestion[] {
    const suggestions: SystemSuggestion[] = [];

    if (conflict.type === 'overload') {
      // Suggest reassignment
      const alternativeEmployees = this.findAlternativeEmployees(
        conflict.projectIds[0],
        allEmployees,
        projects
      );

      if (alternativeEmployees.length > 0) {
        suggestions.push({
          id: `reassign-${conflict.id}`,
          type: 'reassign',
          title: 'Reassign to Available Employee',
          description: `Transfer some workload to available team members`,
          impact: 'Resolves overload without timeline delay',
          alternatives: alternativeEmployees.map((emp) => ({
            employeeId: emp.id,
            employeeName: emp.name,
            availability: emp.availability,
            skills: emp.skills,
          })),
        });
      }

      // Suggest timeline adjustment
      suggestions.push({
        id: `reschedule-${conflict.id}`,
        type: 'reschedule',
        title: 'Adjust Project Timeline',
        description: 'Extend deadline to reduce workload pressure',
        impact: 'Delays completion by 1-2 weeks',
      });

      // Suggest hiring if critical
      if (conflict.severity === 'critical') {
        suggestions.push({
          id: `hire-${conflict.id}`,
          type: 'hire',
          title: 'Hire Additional Resource',
          description: 'Bring in contractor or new hire for this project',
          impact: 'Solves capacity issue permanently',
        });
      }
    }

    if (conflict.type === 'overlap') {
      suggestions.push({
        id: `split-${conflict.id}`,
        type: 'split-workload',
        title: 'Split Workload',
        description: 'Divide responsibilities across multiple team members',
        impact: 'Balances workload, may require coordination overhead',
      });
    }

    return suggestions;
  }

  // Find alternative employees with matching skills
  private static findAlternativeEmployees(
    projectId: string,
    allEmployees: Employee[],
    projects: Project[]
  ): Employee[] {
    const project = projects.find((p) => p.id === projectId);
    if (!project) return [];

    return allEmployees
      .filter((emp) => {
        // Must be active and have availability
        if (emp.status !== 'active' || emp.availability < 30) return false;

        // Must have required skills
        const hasRequiredSkills = project.requiredSkills.some((skill) =>
          emp.skills.includes(skill)
        );

        return hasRequiredSkills;
      })
      .sort((a, b) => b.availability - a.availability)
      .slice(0, 3);
  }

  // Create conflict objects
  private static createOverloadConflict(
    employee: Employee,
    projects: Project[],
    allocation: number
  ): ResourceConflict {
    const employeeProjects = projects.filter((p) =>
      p.assignedEmployees.includes(employee.id)
    );

    return {
      id: `overload-${employee.id}`,
      type: 'overload',
      severity: allocation > 150 ? 'critical' : allocation > 120 ? 'high' : 'medium',
      employeeId: employee.id,
      employeeName: employee.name,
      projectIds: employeeProjects.map((p) => p.id),
      projectNames: employeeProjects.map((p) => p.name),
      details: `${employee.name} is allocated at ${allocation}% capacity across ${employeeProjects.length} projects`,
      allocation,
      suggestions: [],
    };
  }

  private static createOverlapConflict(
    employee: Employee,
    overlappingProjects: Project[]
  ): ResourceConflict {
    return {
      id: `overlap-${employee.id}`,
      type: 'overlap',
      severity: overlappingProjects.length > 2 ? 'high' : 'medium',
      employeeId: employee.id,
      employeeName: employee.name,
      projectIds: overlappingProjects.map((p) => p.id),
      projectNames: overlappingProjects.map((p) => p.name),
      details: `${employee.name} has ${overlappingProjects.length} projects with overlapping timelines`,
      allocation: this.calculateEmployeeWorkload(employee, overlappingProjects),
      suggestions: [],
    };
  }

  private static createUnavailabilityConflict(
    employee: Employee,
    projects: Project[]
  ): ResourceConflict {
    const employeeProjects = projects.filter((p) =>
      p.assignedEmployees.includes(employee.id)
    );

    return {
      id: `unavailable-${employee.id}`,
      type: 'unavailable',
      severity: 'critical',
      employeeId: employee.id,
      employeeName: employee.name,
      projectIds: employeeProjects.map((p) => p.id),
      projectNames: employeeProjects.map((p) => p.name),
      details: `${employee.name} is marked as ${employee.status} but assigned to ${employeeProjects.length} active project(s)`,
      allocation: 0,
      suggestions: [],
    };
  }
}

// Status transition rules
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
};

// Notification trigger system
export interface NotificationTrigger {
  event: string;
  recipients: string[];
  priority: 'high' | 'medium' | 'low';
  message: string;
  actionRequired: boolean;
}

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

// UI Components for System Intelligence Display
interface SystemAlertProps {
  conflict: ResourceConflict;
  onViewDetails: () => void;
  onApplySuggestion: (suggestion: SystemSuggestion) => void;
}

export function SystemAlert({ conflict, onViewDetails, onApplySuggestion }: SystemAlertProps) {
  const getIcon = () => {
    switch (conflict.severity) {
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'high':
        return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      default:
        return <Info className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getColorClasses = () => {
    switch (conflict.severity) {
      case 'critical':
        return 'bg-red-50 border-red-200 text-red-900';
      case 'high':
        return 'bg-orange-50 border-orange-200 text-orange-900';
      default:
        return 'bg-yellow-50 border-yellow-200 text-yellow-900';
    }
  };

  return (
    <div className={`border-2 rounded-xl p-4 ${getColorClasses()}`}>
      <div className="flex items-start gap-3">
        {getIcon()}
        <div className="flex-1">
          <h3 className="font-semibold mb-1">{conflict.details}</h3>
          <div className="text-sm opacity-90 mb-3">
            Projects affected: {conflict.projectNames.join(', ')}
          </div>

          {conflict.suggestions.length > 0 && (
            <div className="space-y-2 mt-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Lightbulb className="w-4 h-4" />
                System Recommendations:
              </div>
              {conflict.suggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className="bg-white/80 backdrop-blur rounded-lg p-3 border border-current/20"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{suggestion.title}</p>
                      <p className="text-xs opacity-80 mt-1">{suggestion.description}</p>
                      <p className="text-xs opacity-70 mt-1">Impact: {suggestion.impact}</p>

                      {suggestion.alternatives && suggestion.alternatives.length > 0 && (
                        <div className="mt-2 space-y-1">
                          <p className="text-xs font-medium">Alternative Resources:</p>
                          {suggestion.alternatives.map((alt, idx) => (
                            <div
                              key={idx}
                              className="text-xs bg-white/50 rounded px-2 py-1 flex items-center gap-2"
                            >
                              <Users className="w-3 h-3" />
                              <span className="font-medium">{alt.employeeName}</span>
                              <span className="opacity-70">
                                {alt.availability}% available
                              </span>
                              <span className="opacity-70">
                                Skills: {alt.skills?.join(', ')}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => onApplySuggestion(suggestion)}
                      className="ml-3 px-3 py-1.5 bg-white/90 hover:bg-white rounded-lg text-xs font-medium transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={onViewDetails}
            className="mt-3 text-xs font-medium underline hover:no-underline"
          >
            View Full Details
          </button>
        </div>
      </div>
    </div>
  );
}
