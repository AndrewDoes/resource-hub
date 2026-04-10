'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Settings, MessageSquare, RefreshCw, GitBranch, BarChart3, Users, AlertTriangle, TrendingUp, X } from 'lucide-react';
import { useFeedbackToast } from '@/app/context/ToastContext';


// Components
import { GanttTimeline } from './GanttTimeline';
import { SmartFilters, FilterOptions } from '@/app/_components/common/SmartFilters';
import { DashboardStats } from './DashboardStats';
import { ProjectGrid } from './ProjectGrid';


// Types, Data, Utils
import { TimelineProject, DashboardStat } from '@/app/_components/features/common/dashboard/types';
import { mockProjects, mockEmployees } from '@/app/_components/features/common/dashboard/data';
import { convertToIntelligenceProjects } from '@/app/_components/features/common/dashboard/utils';
import { ResourcePlanningSystem, ResourceConflict, SystemSuggestion, SystemAlert, Employee } from '@/app/_components/system/SystemIntelligence';
import {
  createProjectManagerChangeRequest,
  fetchProjectManagerProjectTeam,
  fetchProjectManagerProjects,
  projectManagerFallbackProjects,
  type ProjectManagerProjectSummary,
  type ProjectManagerProjectTeamMember,
} from '@/functions/api/projectManager';

const defaultPmUserId = process.env.NEXT_PUBLIC_PM_USER_ID ?? '11111111-1111-1111-1111-111111111111';

const getProjectStatus = (project: ProjectManagerProjectSummary): TimelineProject['status'] => {
  const progress = Number.isFinite(project.progress) ? project.progress : 0;
  const today = new Date();
  const startDate = new Date(project.startDate);

  if (progress >= 100) {
    return 'completed';
  }

  if (startDate > today) {
    return 'assigned';
  }

  return 'in-progress';
};

const getProjectPhase = (project: ProjectManagerProjectSummary): TimelineProject['phase'] => {
  const status = getProjectStatus(project);

  if (status === 'assigned') {
    return 'planning';
  }

  if (status === 'completed') {
    return 'delivery';
  }

  return 'execution';
};

const computeStats = (projects: TimelineProject[], conflictCount: number): DashboardStat[] => {
  const activeProjects = projects.filter((project) => project.status !== 'completed').length;
  const uniqueTeamMembers = new Set(projects.flatMap((project) => project.teamMembers));
  const averageProgress = projects.length === 0
    ? 0
    : Math.round(projects.reduce((total, project) => total + project.progress, 0) / projects.length);

  return [
    {
      label: 'Active Projects',
      value: String(activeProjects),
      change: `${projects.length} total projects`,
      icon: BarChart3,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Total Team Members',
      value: String(uniqueTeamMembers.size),
      change: 'Across current projects',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'Conflicts Detected',
      value: String(conflictCount),
      change: conflictCount > 0 ? 'Needs attention' : 'All clear',
      icon: AlertTriangle,
      color: conflictCount > 0 ? 'text-red-600' : 'text-emerald-600',
      bgColor: conflictCount > 0 ? 'bg-red-50' : 'bg-emerald-50',
    },
    {
      label: 'Avg Progress',
      value: `${averageProgress}%`,
      change: 'Across all projects',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
  ];
};

const buildDetectedConflicts = (projects: TimelineProject[], employees: Employee[]) => {
  const activeProjects = projects.filter((project) => project.status !== 'completed');
  const activeProjectIds = new Set(activeProjects.map((project) => project.id));
  const activeEmployees = employees.map((employee) => ({
    ...employee,
    currentProjects: employee.currentProjects.filter((projectId) => activeProjectIds.has(projectId)),
  }));

  const intelligenceProjects = convertToIntelligenceProjects(activeProjects, activeEmployees);
  const conflicts = ResourcePlanningSystem.detectConflicts(intelligenceProjects, activeEmployees);

  return conflicts.map((conflict) => ({
    ...conflict,
    suggestions: ResourcePlanningSystem.generateRecommendations(
      conflict,
      activeEmployees,
      intelligenceProjects
    ),
  }));
};


export function PMDashboard() {
  const { addToast } = useFeedbackToast();
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    status: 'all',
    dateRange: 'all',
    sortBy: 'startDate',
    sortOrder: 'asc',
  });

  const [allProjects, setAllProjects] = useState<TimelineProject[]>(mockProjects);
  const [filteredProjects, setFilteredProjects] = useState<TimelineProject[]>(mockProjects);
  const [stats, setStats] = useState<DashboardStat[]>(computeStats(mockProjects, 0));
  const [detectedConflicts, setDetectedConflicts] = useState<ResourceConflict[]>([]);
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [selectedConflict, setSelectedConflict] = useState<ResourceConflict | null>(null);
  const [showChangeRequestModal, setShowChangeRequestModal] = useState(false);
  const [isSubmittingChangeRequest, setIsSubmittingChangeRequest] = useState(false);
  const [changeRequestForm, setChangeRequestForm] = useState({
    projectId: '',
    roleName: '',
    requiredSkills: '',
    allocationPercent: 50,
    startDate: '',
    endDate: '',
    additionalNeeds: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      try {
        const summaries = await fetchProjectManagerProjects(defaultPmUserId);
        const sourceSummaries = summaries.length > 0 ? summaries : projectManagerFallbackProjects;

        const teamResponses = await Promise.all(
          sourceSummaries.map(async (project) => {
            try {
              const team = await fetchProjectManagerProjectTeam(defaultPmUserId, project.id);
              return { projectId: project.id, team };
            } catch {
              return { projectId: project.id, team: [] as ProjectManagerProjectTeamMember[] };
            }
          })
        );

        if (!isMounted) {
          return;
        }

        const projectTeamMap = new Map(teamResponses.map((item) => [item.projectId, item.team]));

        const liveProjects: TimelineProject[] = sourceSummaries.map((project) => {
          const team = projectTeamMap.get(project.id) ?? [];
          return {
            id: project.id,
            name: project.name,
            description: project.description,
            startDate: project.startDate,
            endDate: project.endDate,
            progress: Math.max(0, Math.min(100, Math.round(project.progress))),
            status: getProjectStatus(project),
            teamMembers: team.map((member) => member.fullName),
            phase: getProjectPhase(project),
          };
        });

        const employeeMap = new Map<string, Employee>();
        projectTeamMap.forEach((teamMembers, projectId) => {
          teamMembers.forEach((member) => {
            const key = member.employeeId;
            const existing = employeeMap.get(key);

            if (existing) {
              if (!existing.currentProjects.includes(projectId)) {
                existing.currentProjects.push(projectId);
              }
              existing.availability = Math.max(0, existing.availability - Math.round(member.allocationPercent / 2));
              return;
            }

            employeeMap.set(key, {
              id: key,
              name: member.fullName,
              skills: [member.jobTitle],
              availability: Math.max(0, 100 - Math.round(member.allocationPercent)),
              currentProjects: [projectId],
              status: 'active',
            });
          });
        });

        const inferredEmployees = employeeMap.size > 0 ? Array.from(employeeMap.values()) : mockEmployees;

        const conflictsWithSuggestions = buildDetectedConflicts(liveProjects, inferredEmployees);

        const conflictProjectIds = new Set(conflictsWithSuggestions.flatMap((conflict) => conflict.projectIds));
        const projectsWithConflicts = liveProjects.map((project) => {
          if (project.status === 'completed' || !conflictProjectIds.has(project.id)) {
            return project;
          }

          const relatedConflicts = conflictsWithSuggestions.filter((conflict) => conflict.projectIds.includes(project.id));
          return {
            ...project,
            hasConflict: true,
            conflictMessage: relatedConflicts[0]?.details,
          };
        });

        setEmployees(inferredEmployees);
        setAllProjects(projectsWithConflicts);
        setFilteredProjects(projectsWithConflicts);
        setDetectedConflicts(conflictsWithSuggestions);
        setStats(computeStats(projectsWithConflicts, conflictsWithSuggestions.length));
        setError(null);
      } catch (loadError) {
        if (!isMounted) {
          return;
        }

        const fallbackConflictsWithSuggestions = buildDetectedConflicts(mockProjects, mockEmployees);

        setEmployees(mockEmployees);
        setAllProjects(mockProjects);
        setFilteredProjects(mockProjects);
        setDetectedConflicts(fallbackConflictsWithSuggestions);
        setStats(computeStats(mockProjects, fallbackConflictsWithSuggestions.length));
        setError(loadError instanceof Error ? loadError.message : 'Failed to load PM dashboard');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);

    let filtered = [...allProjects];

    // Search filter
    if (newFilters.search) {
      const searchLower = newFilters.search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower) ||
          p.teamMembers.some((m) => m.toLowerCase().includes(searchLower))
      );
    }

    // Status filter
    if (newFilters.status !== 'all') {
      filtered = filtered.filter((p) => p.status === newFilters.status);
    }

    // Date range filter
    if (newFilters.dateRange !== 'all') {
      const today = new Date();
      const filterDate = new Date(today);

      switch (newFilters.dateRange) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          filtered = filtered.filter(
            (p) =>
              new Date(p.startDate) <= filterDate &&
              new Date(p.endDate) >= filterDate
          );
          break;
        case 'week':
          filterDate.setDate(today.getDate() + 7);
          filtered = filtered.filter((p) => new Date(p.endDate) <= filterDate);
          break;
        case 'month':
          filterDate.setMonth(today.getMonth() + 1);
          filtered = filtered.filter((p) => new Date(p.endDate) <= filterDate);
          break;
      }
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue: any = a[newFilters.sortBy as keyof TimelineProject];
      let bValue: any = b[newFilters.sortBy as keyof TimelineProject];

      if (newFilters.sortBy === 'startDate' || newFilters.sortBy === 'endDate') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (newFilters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredProjects(filtered);
  };

  const handleProjectClick = (projectId: string) => {
    console.log('Project clicked:', projectId);
  };

  const handleApplySuggestion = (conflict: ResourceConflict, suggestion: SystemSuggestion) => {
    if (suggestion.type !== 'split-workload') {
      addToast({
        type: 'success',
        title: 'Suggestion Applied',
        message: `${suggestion.title} has been applied. Changes are pending GM approval.`,
      });
      return;
    }

    const affectedEmployee = employees.find((employee) => employee.id === conflict.employeeId);
    if (!affectedEmployee) {
      addToast({
        type: 'error',
        title: 'Unable To Split',
        message: 'The affected employee could not be found.',
      });
      return;
    }

    const targetProjectId = conflict.projectIds.find((projectId) => affectedEmployee.currentProjects.includes(projectId));
    if (!targetProjectId) {
      addToast({
        type: 'error',
        title: 'Unable To Split',
        message: 'No transferable project was found for this conflict.',
      });
      return;
    }

    const skilledCoworkers = employees
      .filter((employee) => employee.id !== affectedEmployee.id)
      .filter((employee) => employee.status === 'active')
      .filter((employee) => employee.availability > 10)
      .filter((employee) => employee.skills.some((skill) => affectedEmployee.skills.includes(skill)))
      .sort((a, b) => b.availability - a.availability);

    const receivingCoworker = skilledCoworkers[0];

    if (!receivingCoworker) {
      addToast({
        type: 'error',
        title: 'No Skilled Coworker Found',
        message: 'No active coworker with matching skills has enough availability to split this workload.',
      });
      return;
    }

    const updatedEmployees = employees.map((employee) => {
      if (employee.id === affectedEmployee.id) {
        return {
          ...employee,
          currentProjects: employee.currentProjects.filter((projectId) => projectId !== targetProjectId),
          availability: Math.min(100, employee.availability + 20),
        };
      }

      if (employee.id === receivingCoworker.id) {
        return {
          ...employee,
          currentProjects: employee.currentProjects.includes(targetProjectId)
            ? employee.currentProjects
            : [...employee.currentProjects, targetProjectId],
          availability: Math.max(0, employee.availability - 20),
        };
      }

      return employee;
    });

    const updatedProjects = allProjects.map((project) => {
      if (project.id !== targetProjectId) {
        return project;
      }

      return {
        ...project,
        teamMembers: project.teamMembers
          .filter((member) => member !== affectedEmployee.name)
          .concat(project.teamMembers.includes(receivingCoworker.name) ? [] : [receivingCoworker.name]),
      };
    });

    const refreshedConflicts = buildDetectedConflicts(updatedProjects, updatedEmployees);
    const conflictProjectIds = new Set(refreshedConflicts.flatMap((item) => item.projectIds));
    const refreshedProjects = updatedProjects.map((project) => {
      if (!conflictProjectIds.has(project.id)) {
        return {
          ...project,
          hasConflict: false,
          conflictMessage: undefined,
        };
      }

      const relatedConflict = refreshedConflicts.find((item) => item.projectIds.includes(project.id));
      return {
        ...project,
        hasConflict: true,
        conflictMessage: relatedConflict?.details,
      };
    });

    setEmployees(updatedEmployees);
    setAllProjects(refreshedProjects);
    setFilteredProjects(refreshedProjects);
    setDetectedConflicts(refreshedConflicts);
    setStats(computeStats(refreshedProjects, refreshedConflicts.length));

    addToast({
      type: 'success',
      title: 'Workload Split Applied',
      message: `${affectedEmployee.name}'s workload was split to ${receivingCoworker.name} based on matching skills.`,
    });
  };

  const handleRequestChange = () => {
    const initialProject = allProjects[0];

    if (!initialProject) {
      addToast({
        type: 'error',
        title: 'No Project Available',
        message: 'No project is available to submit a change request.',
      });
      return;
    }

    setChangeRequestForm((prev) => ({
      ...prev,
      projectId: prev.projectId || initialProject.id,
      startDate: prev.startDate || initialProject.startDate.slice(0, 10),
      endDate: prev.endDate || initialProject.endDate.slice(0, 10),
    }));
    setShowChangeRequestModal(true);
  };

  const handleSubmitChangeRequest = async () => {
    if (!changeRequestForm.projectId) {
      addToast({
        type: 'error',
        title: 'Project Required',
        message: 'Select a project before sending the request.',
      });
      return;
    }

    if (!changeRequestForm.roleName.trim()) {
      addToast({
        type: 'error',
        title: 'Role Required',
        message: 'Please provide the role/personnel needed.',
      });
      return;
    }

    const requiredSkills = changeRequestForm.requiredSkills
      .split(',')
      .map((skill) => skill.trim())
      .filter((skill) => skill.length > 0);

    setIsSubmittingChangeRequest(true);

    try {
      await createProjectManagerChangeRequest({
        projectId: changeRequestForm.projectId,
        assignedByUserId: defaultPmUserId,
        roleName: changeRequestForm.roleName.trim(),
        startDate: changeRequestForm.startDate,
        endDate: changeRequestForm.endDate,
        allocationPercent: changeRequestForm.allocationPercent,
        requiredSkills,
        additionalNeeds: changeRequestForm.additionalNeeds.trim(),
      });

      setShowChangeRequestModal(false);
      setChangeRequestForm((prev) => ({
        ...prev,
        roleName: '',
        requiredSkills: '',
        additionalNeeds: '',
      }));

      addToast({
        type: 'success',
        title: 'Request Sent To GM',
        message: 'Backend created the change request. GM can now review and approve/reject it.',
      });
    } catch (submitError) {
      addToast({
        type: 'error',
        title: 'Request Failed',
        message: submitError instanceof Error ? submitError.message : 'Unable to send change request.',
      });
    } finally {
      setIsSubmittingChangeRequest(false);
    }
  };

  const handleSendFeedback = () => {
    addToast({
      type: 'info',
      title: 'Feedback Sent',
      message: 'Your feedback has been sent to the General Manager.',
    });
  };

  const handleRefreshConflicts = () => {
    const conflictsWithSuggestions = buildDetectedConflicts(allProjects, employees);

    setDetectedConflicts(conflictsWithSuggestions);
    setStats(computeStats(allProjects, conflictsWithSuggestions.length));
    addToast({
      type: 'success',
      title: 'Conflicts Refreshed',
      message: `System detected ${conflictsWithSuggestions.length} resource conflict(s).`,
    });
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Project Timeline</h1>
          <p className="text-gray-600">
            Monitor project progress, resource allocation, and detect scheduling conflicts
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefreshConflicts}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Conflicts
          </button>
          <button
            onClick={handleRequestChange}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
          >
            <Settings className="w-4 h-4" />
            Request Change
          </button>
          <button
            onClick={handleSendFeedback}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            Send Feedback to GM
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Showing local fallback data because PM dashboard backend requests failed: {error}
        </div>
      )}

      {isLoading && (
        <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-500 shadow-sm">
          Loading PM dashboard from backend...
        </div>
      )}

      {/* Stats Cards */}
      <DashboardStats stats={stats} />

      {/* System Intelligence Alerts */}
      {detectedConflicts.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              System Detected Conflicts ({detectedConflicts.length})
            </h2>
          </div>
          {detectedConflicts.map((conflict) => (
            <SystemAlert
              key={conflict.id}
              conflict={conflict}
              onViewDetails={(selected) => setSelectedConflict(selected)}
              onApplySuggestion={handleApplySuggestion}
            />
          ))}
        </div>
      )}

      {/* Filters */}
      <SmartFilters
        onFilterChange={handleFilterChange}
        statusOptions={['all', 'assigned', 'in-progress', 'completed']}
        showDateRange={true}
        showSort={true}
        placeholder="Search projects, team members..."
      />

      {/* Timeline */}
      <GanttTimeline
        projects={filteredProjects}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onProjectClick={handleProjectClick}
      />

      {/* Project Overview Cards */}
      <ProjectGrid 
        projects={filteredProjects.slice(0, 4)} 
        onProjectClick={handleProjectClick} 
      />

      {/* Empty State */}
      {filteredProjects.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
          <div className="flex flex-col items-center justify-center">
            <GitBranch className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Projects Found</h3>
            <p className="text-gray-600">
              {filters.search || filters.status !== 'all'
                ? 'Try adjusting your filters to see more projects'
                : 'You have no assigned projects at this time'}
            </p>
          </div>
        </div>
      )}

      {showChangeRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-xl border border-gray-200 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Request Project Change</h3>
                <p className="text-xs text-gray-500 mt-1">Send personnel and skill requirements to GM</p>
              </div>
              <button
                onClick={() => setShowChangeRequestModal(false)}
                className="rounded-md p-1 text-gray-500 hover:bg-gray-100"
                aria-label="Close change request modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
              <label className="space-y-1 md:col-span-2">
                <span className="text-xs font-medium text-gray-600">Project</span>
                <select
                  value={changeRequestForm.projectId}
                  onChange={(event) => {
                    const selected = allProjects.find((project) => project.id === event.target.value);
                    setChangeRequestForm((prev) => ({
                      ...prev,
                      projectId: event.target.value,
                      startDate: selected?.startDate.slice(0, 10) ?? prev.startDate,
                      endDate: selected?.endDate.slice(0, 10) ?? prev.endDate,
                    }));
                  }}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                >
                  {allProjects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-1">
                <span className="text-xs font-medium text-gray-600">Needed Role</span>
                <input
                  value={changeRequestForm.roleName}
                  onChange={(event) => setChangeRequestForm((prev) => ({ ...prev, roleName: event.target.value }))}
                  placeholder="QA Engineer"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </label>

              <label className="space-y-1">
                <span className="text-xs font-medium text-gray-600">Allocation %</span>
                <input
                  type="number"
                  min={10}
                  max={100}
                  value={changeRequestForm.allocationPercent}
                  onChange={(event) =>
                    setChangeRequestForm((prev) => ({
                      ...prev,
                      allocationPercent: Math.max(10, Math.min(100, Number(event.target.value) || 10)),
                    }))
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </label>

              <label className="space-y-1 md:col-span-2">
                <span className="text-xs font-medium text-gray-600">Required Skills (comma separated)</span>
                <input
                  value={changeRequestForm.requiredSkills}
                  onChange={(event) => setChangeRequestForm((prev) => ({ ...prev, requiredSkills: event.target.value }))}
                  placeholder="React, Node.js, QA Automation"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </label>

              <label className="space-y-1">
                <span className="text-xs font-medium text-gray-600">Start Date</span>
                <input
                  type="date"
                  value={changeRequestForm.startDate}
                  onChange={(event) => setChangeRequestForm((prev) => ({ ...prev, startDate: event.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </label>

              <label className="space-y-1">
                <span className="text-xs font-medium text-gray-600">End Date</span>
                <input
                  type="date"
                  value={changeRequestForm.endDate}
                  onChange={(event) => setChangeRequestForm((prev) => ({ ...prev, endDate: event.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </label>

              <label className="space-y-1 md:col-span-2">
                <span className="text-xs font-medium text-gray-600">Other Needs</span>
                <textarea
                  rows={3}
                  value={changeRequestForm.additionalNeeds}
                  onChange={(event) => setChangeRequestForm((prev) => ({ ...prev, additionalNeeds: event.target.value }))}
                  placeholder="Urgency, tool requirements, contract preference"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-gray-200 px-5 py-4">
              <button
                onClick={() => setShowChangeRequestModal(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => void handleSubmitChangeRequest()}
                disabled={isSubmittingChangeRequest}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmittingChangeRequest ? 'Sending...' : 'Send To GM'}
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedConflict && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-4xl rounded-xl border border-gray-200 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Conflict Details</h3>
                <p className="text-xs text-gray-500 mt-1">{selectedConflict.employeeName} workload breakdown</p>
              </div>
              <button
                onClick={() => setSelectedConflict(null)}
                className="rounded-md p-1 text-gray-500 hover:bg-gray-100"
                aria-label="Close conflict details"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5">
              <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <p className="text-xs text-gray-500">Employee</p>
                  <p className="text-sm font-semibold text-gray-900">{selectedConflict.employeeName}</p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <p className="text-xs text-gray-500">Current Allocation</p>
                  <p className="text-sm font-semibold text-gray-900">{selectedConflict.allocation}%</p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <p className="text-xs text-gray-500">Severity</p>
                  <p className="text-sm font-semibold text-gray-900 capitalize">{selectedConflict.severity}</p>
                </div>
              </div>

              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Project</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Conflicting Task</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Workload %</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Conflict Timeframe</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {selectedConflict.projectIds.map((projectId) => {
                      const project = allProjects.find((item) => item.id === projectId);
                      const peers = selectedConflict.projectIds
                        .filter((id) => id !== projectId)
                        .map((id) => allProjects.find((item) => item.id === id))
                        .filter((item): item is TimelineProject => Boolean(item));

                      const overlapWindows = project
                        ? peers
                            .map((peer) => {
                              const overlapStart = new Date(
                                Math.max(
                                  new Date(project.startDate).getTime(),
                                  new Date(peer.startDate).getTime()
                                )
                              );
                              const overlapEnd = new Date(
                                Math.min(
                                  new Date(project.endDate).getTime(),
                                  new Date(peer.endDate).getTime()
                                )
                              );

                              if (overlapStart.getTime() > overlapEnd.getTime()) {
                                return null;
                              }

                              return `${overlapStart.toLocaleDateString()} - ${overlapEnd.toLocaleDateString()}`;
                            })
                            .filter((window): window is string => Boolean(window))
                        : [];

                      const conflictTask = project
                        ? selectedConflict.type === 'overlap' && peers.length > 0
                          ? `${project.phase ?? 'execution'} tasks overlapping with ${peers.map((peer) => peer.name).join(', ')}`
                          : selectedConflict.type === 'overload'
                            ? `Concurrent ${project.phase ?? 'execution'} tasks exceed available capacity`
                            : `Assigned ${project.phase ?? 'execution'} tasks`
                        : 'Assigned project tasks';

                      const conflictTimeframe = project
                        ? overlapWindows.length > 0
                          ? overlapWindows.join(' | ')
                          : `${new Date(project.startDate).toLocaleDateString()} - ${new Date(project.endDate).toLocaleDateString()}`
                        : '-';

                      return (
                        <tr key={projectId}>
                          <td className="px-4 py-2 text-sm text-gray-900">{project?.name ?? projectId}</td>
                          <td className="px-4 py-2 text-sm text-gray-700">{conflictTask}</td>
                          <td className="px-4 py-2 text-sm text-gray-700">
                            {project ? (project.status === 'assigned' ? 30 : project.status === 'in-progress' ? 50 : 0) : '-'}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-700">{conflictTimeframe}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
