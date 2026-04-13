'use client';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  AlertTriangle,
  Calendar,
  Users,
  Filter,
} from 'lucide-react';
import { AIDecisionPanel } from '@/app/_components/features/gm/decision-panel/components/AIDecisionPanel';
import type { ProjectData } from '@/app/_components/features/gm/decision-panel/types';
import {
  fetchProjectManagerProjectTeam,
  fetchProjectManagerProjects,
  type ProjectManagerProjectSummary,
} from '@/functions/api/projectManager';

const defaultPmUserId = process.env.NEXT_PUBLIC_PM_USER_ID ?? '11111111-1111-1111-1111-111111111111';

interface GanttProject {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  progress: number;
  status: 'on-track' | 'at-risk' | 'delayed';
  assignedResources: string[];
  resourceUtilization: number;
  riskLevel: 'low' | 'medium' | 'high';
}

const statusFromProject = (summary: ProjectManagerProjectSummary): GanttProject['status'] => {
  if (summary.status === 'delayed') {
    return 'delayed';
  }

  if (summary.status === 'at-risk') {
    return 'at-risk';
  }

  return 'on-track';
};

const riskFromStatus = (status: GanttProject['status']): GanttProject['riskLevel'] => {
  if (status === 'delayed') {
    return 'high';
  }

  if (status === 'at-risk') {
    return 'medium';
  }

  return 'low';
};

const mapSummaryToGanttProject = (
  summary: ProjectManagerProjectSummary,
  teamMembers: string[] = []
): GanttProject => ({
  id: summary.id,
  name: summary.name,
  startDate: summary.startDate,
  endDate: summary.endDate,
  progress: summary.progress,
  status: statusFromProject(summary),
  assignedResources: teamMembers,
  resourceUtilization: Math.min(150, Math.round(summary.progress + teamMembers.length * 8)),
  riskLevel: riskFromStatus(statusFromProject(summary)),
});

const toDayStart = (value: string): Date => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
};

const toMonthStart = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

const addMonths = (date: Date, months: number): Date => {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
};

const getMonthKey = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};

const monthKeyToDate = (monthKey: string): Date => {
  const [yearPart, monthPart] = monthKey.split('-').map((part) => Number(part));
  return new Date(yearPart, Math.max(0, monthPart - 1), 1);
};

const formatMonthLabel = (date: Date): string => {
  return date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
};

// Convert GanttProject to ProjectData format for SmartDecisionPanel
const convertToProjectData = (project: GanttProject): ProjectData => ({
  id: project.id,
  name: project.name,
  startDate: project.startDate,
  endDate: project.endDate,
  progress: project.progress,
  status: project.status,
  assignedResources: project.assignedResources,
  requiredResources: project.assignedResources.length + (project.resourceUtilization > 100 ? 2 : 0),
  resourceUtilization: project.resourceUtilization,
  riskLevel: project.riskLevel,
});

export function Planning() {
  const searchParams = useSearchParams();
  const highlightProject = searchParams.get('highlight');

  const [hasMounted, setHasMounted] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [projects, setProjects] = useState<GanttProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<GanttProject | null>(null);
  const [timelineStartMonth, setTimelineStartMonth] = useState<string | null>(null);
  const [timelineEndMonth, setTimelineEndMonth] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadProjects = async () => {
      const projectResult = await fetchProjectManagerProjects(defaultPmUserId)
        .then((result) => ({ status: 'fulfilled' as const, value: result }))
        .catch((reason) => ({ status: 'rejected' as const, reason }));

      if (!isMounted) {
        return;
      }

      if (projectResult.status === 'fulfilled' && projectResult.value.length > 0) {
        const teamResponses = await Promise.all(
          projectResult.value.map(async (project) => {
            try {
              const team = await fetchProjectManagerProjectTeam(defaultPmUserId, project.id);
              return { projectId: project.id, teamMembers: team.map((member) => member.fullName) };
            } catch {
              return { projectId: project.id, teamMembers: [] as string[] };
            }
          })
        );

        if (!isMounted) {
          return;
        }

        const teamMap = new Map(teamResponses.map((entry) => [entry.projectId, entry.teamMembers]));
        const liveProjects = projectResult.value.map((summary) =>
          mapSummaryToGanttProject(summary, teamMap.get(summary.id) ?? [])
        );

        setProjects(liveProjects);
        setSelectedProject(liveProjects[0] ?? null);
        setError(null);
      } else {
        setProjects([]);
        setSelectedProject(null);
        setError('No GM planning projects were returned by the backend.');
      }

      setIsLoading(false);
    };

    void loadProjects();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredProjects =
    statusFilter === 'all'
      ? projects
      : projects.filter((p) => p.status === statusFilter);

  const availableMonths = useMemo(() => {
    if (filteredProjects.length === 0) {
      return [] as Date[];
    }

    const startDates = filteredProjects.map((project) => toDayStart(project.startDate).getTime());
    const endDates = filteredProjects.map((project) => toDayStart(project.endDate).getTime());

    const minStart = new Date(Math.min(...startDates));
    const maxEnd = new Date(Math.max(...endDates));
    const columns: Date[] = [];

    let cursor = toMonthStart(minStart);
    const limit = toMonthStart(maxEnd);

    while (cursor.getTime() <= limit.getTime()) {
      columns.push(new Date(cursor));
      cursor = addMonths(cursor, 1);
    }

    return columns;
  }, [filteredProjects]);

  useEffect(() => {
    if (availableMonths.length === 0) {
      setTimelineStartMonth(null);
      setTimelineEndMonth(null);
      return;
    }

    const monthKeys = availableMonths.map((month) => getMonthKey(month));

    setTimelineStartMonth((current) => (current && monthKeys.includes(current) ? current : monthKeys[0]));
    setTimelineEndMonth((current) => (current && monthKeys.includes(current) ? current : monthKeys[monthKeys.length - 1]));
  }, [availableMonths]);

  const handleTimelineStartMonthChange = (value: string) => {
    setTimelineStartMonth(value);

    if (timelineEndMonth && value > timelineEndMonth) {
      setTimelineEndMonth(value);
    }
  };

  const handleTimelineEndMonthChange = (value: string) => {
    setTimelineEndMonth(value);

    if (timelineStartMonth && value < timelineStartMonth) {
      setTimelineStartMonth(value);
    }
  };

  const timelineColumns = useMemo(() => {
    if (availableMonths.length === 0) {
      return [] as Date[];
    }

    const startKey = timelineStartMonth ?? getMonthKey(availableMonths[0]);
    const endKey = timelineEndMonth ?? getMonthKey(availableMonths[availableMonths.length - 1]);

    const startDate = monthKeyToDate(startKey);
    const endDate = monthKeyToDate(endKey);

    return availableMonths.filter((month) => {
      const key = getMonthKey(month);
      return key >= getMonthKey(startDate) && key <= getMonthKey(endDate);
    });
  }, [availableMonths, timelineStartMonth, timelineEndMonth]);

  const timelineRange = useMemo(() => {
    if (timelineColumns.length === 0) {
      return null;
    }

    const rangeStart = timelineColumns[0].getTime();
    const lastColumn = timelineColumns[timelineColumns.length - 1];
    const rangeEnd = new Date(lastColumn.getFullYear(), lastColumn.getMonth() + 1, 1).getTime();

    return {
      start: rangeStart,
      end: rangeEnd,
      total: Math.max(1, rangeEnd - rangeStart),
    };
  }, [timelineColumns]);

  useEffect(() => {
    if (!selectedProject && filteredProjects.length > 0) {
      setSelectedProject(filteredProjects[0]);
    }
  }, [filteredProjects, selectedProject]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track':
        return 'bg-green-500';
      case 'at-risk':
        return 'bg-yellow-500';
      case 'delayed':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const handleProjectClick = (project: GanttProject) => {
    setSelectedProject(project);
  };

  const getProjectBarStyle = (project: GanttProject) => {
    if (!timelineRange) {
      return { left: '0%', width: '100%' };
    }

    const projectStart = toDayStart(project.startDate).getTime();
    const projectEndExclusive = toDayStart(project.endDate).getTime() + 24 * 60 * 60 * 1000;
    const clampedStart = Math.max(projectStart, timelineRange.start);
    const clampedEnd = Math.min(projectEndExclusive, timelineRange.end);

    const leftPercent = ((clampedStart - timelineRange.start) / timelineRange.total) * 100;
    const widthPercent = Math.max(1, ((Math.max(clampedEnd, clampedStart + 1) - clampedStart) / timelineRange.total) * 100);

    return {
      left: `${leftPercent}%`,
      width: `${widthPercent}%`,
    };
  };

  const formatTimelineColumn = (date: Date) => {
    return formatMonthLabel(date);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Project Planning</h1>
          <p className="text-sm text-gray-500 mt-1">
            GM Dashboard - Timeline visualization and resource allocation
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {error}
        </div>
      )}

      {isLoading && (
        <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-500 shadow-sm">
          Loading GM planning projects from backend...
        </div>
      )}

      {/* Filters and Controls */}
      <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="on-track">On Track</option>
              <option value="at-risk">At Risk</option>
              <option value="delayed">Delayed</option>
            </select>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Monthly range:</span>
            </div>

            <select
              value={timelineStartMonth ?? ''}
              onChange={(e) => handleTimelineStartMonthChange(e.target.value)}
              className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={hasMounted && availableMonths.length === 0}
            >
              {availableMonths.map((month) => {
                const key = getMonthKey(month);

                return (
                  <option key={key} value={key}>
                    From {formatMonthLabel(month)}
                  </option>
                );
              })}
            </select>

            <select
              value={timelineEndMonth ?? ''}
              onChange={(e) => handleTimelineEndMonthChange(e.target.value)}
              className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={hasMounted && availableMonths.length === 0}
            >
              {availableMonths.map((month) => {
                const key = getMonthKey(month);

                return (
                  <option key={key} value={key}>
                    To {formatMonthLabel(month)}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gantt Chart */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Project Timeline</h3>

            {/* Timeline Header */}
            <div className="mb-4 pl-48">
              <div
                className="grid gap-2 text-xs text-gray-500 mb-2"
                style={{ gridTemplateColumns: `repeat(${Math.max(1, timelineColumns.length)}, minmax(0, 1fr))` }}
              >
                {timelineColumns.map((column) => (
                  <span key={column.toISOString()} className="truncate">
                    {formatTimelineColumn(column)}
                  </span>
                ))}
              </div>
              <div className="h-px bg-gray-200"></div>
            </div>

            {/* Gantt Bars */}
            <div className="space-y-4">
              {filteredProjects.map((project) => {
                const isHighlighted = highlightProject === project.id;

                return (
                  <div
                    key={project.id}
                    className={`transition-all ${isHighlighted ? 'ring-2 ring-blue-500 rounded-lg p-2 -m-2' : ''
                      }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-44 shrink-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {project.name}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`w-2 h-2 rounded-full ${getStatusColor(project.status)}`}
                          ></span>
                          <span className="text-xs text-gray-500 capitalize">
                            {project.status.replace('-', ' ')}
                          </span>
                        </div>
                      </div>

                      <div className="flex-1 relative h-12 bg-gray-100 rounded-lg overflow-hidden">
                        <button
                          onClick={() => handleProjectClick(project)}
                          className="absolute inset-0 group"
                          title="Click for details"
                        >
                          <div
                            className={`h-full ${getStatusColor(
                              project.status
                            )} rounded-lg flex items-center justify-between px-3 text-white text-xs font-medium transition-all hover:brightness-110 hover:shadow-md absolute top-0`}
                            style={getProjectBarStyle(project)}
                          >
                            <span className="truncate">{project.progress}%</span>
                            {project.resourceUtilization > 100 && (
                              <AlertTriangle className="w-4 h-4 text-white" />
                            )}
                            <div
                              className="absolute left-0 top-0 h-full bg-white/30 rounded-l-lg"
                              style={{ width: `${Math.max(0, Math.min(100, project.progress))}%` }}
                            ></div>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Assigned Resources */}
                    <div className="flex items-center gap-2 mt-2 pl-48">
                      <Users className="w-3.5 h-3.5 text-gray-400" />
                      <div className="flex -space-x-2">
                        {project.assignedResources.map((resource, idx) => (
                          <div
                            key={idx}
                            className="w-6 h-6 bg-linear-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center border-2 border-white text-white text-xs font-medium"
                            title={resource}
                          >
                            {resource.charAt(0)}
                          </div>
                        ))}
                      </div>
                      {project.resourceUtilization > 100 && (
                        <span className="text-xs text-red-600 font-medium ml-2">
                          {project.resourceUtilization}% utilized
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Decision Panel (AI Assisted) */}
        <div>
          <AIDecisionPanel
            selectedProject={selectedProject ? convertToProjectData(selectedProject) : null}
          />
        </div>
      </div>

      {!isLoading && filteredProjects.length === 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-600 shadow-sm">
          No planning projects were returned by the backend.
        </div>
      )}
    </div>
  );
}
