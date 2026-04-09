'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Settings, MessageSquare, RefreshCw, GitBranch, BarChart3, Users, AlertTriangle, TrendingUp } from 'lucide-react';
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

        const intelligenceProjects = convertToIntelligenceProjects(liveProjects, inferredEmployees);
        const conflicts = ResourcePlanningSystem.detectConflicts(intelligenceProjects, inferredEmployees);
        const conflictsWithSuggestions = conflicts.map((conflict) => ({
          ...conflict,
          suggestions: ResourcePlanningSystem.generateRecommendations(
            conflict,
            inferredEmployees,
            intelligenceProjects
          ),
        }));

        const conflictProjectIds = new Set(conflictsWithSuggestions.flatMap((conflict) => conflict.projectIds));
        const projectsWithConflicts = liveProjects.map((project) => {
          if (!conflictProjectIds.has(project.id)) {
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

        const intelligenceProjects = convertToIntelligenceProjects(mockProjects, mockEmployees);
        const fallbackConflicts = ResourcePlanningSystem.detectConflicts(intelligenceProjects, mockEmployees);
        const fallbackConflictsWithSuggestions = fallbackConflicts.map((conflict) => ({
          ...conflict,
          suggestions: ResourcePlanningSystem.generateRecommendations(
            conflict,
            mockEmployees,
            intelligenceProjects
          ),
        }));

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

  const handleApplySuggestion = (suggestion: SystemSuggestion) => {
    addToast({
      type: 'success',
      title: 'Suggestion Applied',
      message: `${suggestion.title} has been applied. Changes are pending GM approval.`,
    });
  };

  const handleRequestChange = () => {
    addToast({
      type: 'info',
      title: 'Change Request Sent',
      message: 'Your resource change request has been sent to the General Manager for review.',
    });
  };

  const handleSendFeedback = () => {
    addToast({
      type: 'info',
      title: 'Feedback Sent',
      message: 'Your feedback has been sent to the General Manager.',
    });
  };

  const handleRefreshConflicts = () => {
    const intelligenceProjects = convertToIntelligenceProjects(allProjects, employees);
    const conflicts = ResourcePlanningSystem.detectConflicts(intelligenceProjects, employees);

    const conflictsWithSuggestions = conflicts.map((conflict) => ({
      ...conflict,
      suggestions: ResourcePlanningSystem.generateRecommendations(
        conflict,
        employees,
        intelligenceProjects
      ),
    }));

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
          <Link
            href="/workflow"
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors"
          >
            <GitBranch className="w-4 h-4" />
            View System Flow
          </Link>
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
            <p className="text-sm text-gray-600">
              AI-powered conflict detection with smart recommendations
            </p>
          </div>
          {detectedConflicts.map((conflict) => (
            <SystemAlert
              key={conflict.id}
              conflict={conflict}
              onViewDetails={() => {
                addToast({
                  type: 'info',
                  title: 'Conflict Details',
                  message: `Viewing detailed analysis for ${conflict.employeeName}`,
                });
              }}
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
    </div>
  );
}
