import { Project, Employee, ResourceConflict, SystemSuggestion } from './types';

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
