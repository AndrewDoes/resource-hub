"use client";

import { useEffect, useMemo, useState } from "react";
import { Calendar, Clock, Folder, TrendingUp, Users } from "lucide-react";

import {
  fetchProjectManagerProjects,
  projectManagerFallbackProjects,
  type ProjectManagerProjectSummary,
  updateProjectManagerProjectStatus,
} from "@/functions/api/projectManager";

const defaultPmUserId = process.env.NEXT_PUBLIC_PM_USER_ID ?? '11111111-1111-1111-1111-111111111111';

const formatDate = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export function ProjectOverview() {
  const [projects, setProjects] = useState<ProjectManagerProjectSummary[]>(projectManagerFallbackProjects);
  const [updatingProjectIds, setUpdatingProjectIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUsingFallbackData, setIsUsingFallbackData] = useState(true);

  const handleMarkCompleted = async (projectId: string) => {
    if (isUsingFallbackData) {
      setError('Cannot update status while using fallback data. Please ensure backend is reachable.');
      return;
    }

    setUpdatingProjectIds((prev) => [...prev, projectId]);

    try {
      await updateProjectManagerProjectStatus(projectId, 'Completed');

      const refreshed = await fetchProjectManagerProjects(defaultPmUserId);
      setProjects(refreshed.length > 0 ? refreshed : []);
      setIsUsingFallbackData(false);
      setError(null);
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Failed to update project status');
    } finally {
      setUpdatingProjectIds((prev) => prev.filter((id) => id !== projectId));
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadProjects = async () => {
      try {
        const response = await fetchProjectManagerProjects(defaultPmUserId);

        if (!isMounted) {
          return;
        }

        setProjects(response.length > 0 ? response : projectManagerFallbackProjects);
        setIsUsingFallbackData(response.length === 0);
        setError(null);
      } catch (loadError) {
        if (!isMounted) {
          return;
        }

        setProjects(projectManagerFallbackProjects);
        setIsUsingFallbackData(true);
        setError(loadError instanceof Error ? loadError.message : "Failed to load projects");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadProjects();

    return () => {
      isMounted = false;
    };
  }, []);
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track':
        return 'bg-green-100 text-green-700';
      case 'at-risk':
        return 'bg-yellow-100 text-yellow-700';
      case 'delayed':
        return 'bg-red-100 text-red-700';
      case 'completed':
        return 'bg-emerald-100 text-emerald-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'on-track':
        return 'bg-green-500';
      case 'at-risk':
        return 'bg-yellow-500';
      case 'delayed':
        return 'bg-red-500';
      case 'completed':
        return 'bg-emerald-500';
      default:
        return 'bg-gray-500';
    }
  };

  const stats = useMemo(() => {
    return {
      total: projects.length,
      onTrack: projects.filter((project) => project.status === 'on-track').length,
      atRisk: projects.filter((project) => project.status === 'at-risk').length,
      delayed: projects.filter((project) => project.status === 'delayed').length,
      completed: projects.filter((project) => project.status === 'completed').length,
    };
  }, [projects]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Project Overview</h1>
        <p className="text-sm text-gray-500 mt-1">
          Monitor all projects and track their progress
        </p>
        {error && (
          <p className="mt-2 text-sm text-amber-700">
            {isUsingFallbackData
              ? `Showing local fallback data because backend is unavailable: ${error}`
              : `Backend action failed: ${error}`}
          </p>
        )}
      </div>

      {/* Summary Card */}
      <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white/20 rounded-lg backdrop-blur">
            <Folder className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-1">Active Projects</h2>
            <p className="text-blue-50 text-sm">
              {stats.total} projects in progress • {stats.onTrack} on track
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <p className="text-sm mb-1">On Track</p>
            <p className="text-2xl font-semibold">{stats.onTrack}</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <p className="text-sm mb-1">At Risk</p>
            <p className="text-2xl font-semibold">{stats.atRisk}</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <p className="text-sm mb-1">Delayed</p>
            <p className="text-2xl font-semibold">{stats.delayed}</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <p className="text-sm mb-1">Completed</p>
            <p className="text-2xl font-semibold">{stats.completed}</p>
          </div>
        </div>
      </div>

      {/* Projects List */}
      <div className="space-y-4">
        {isLoading && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 text-sm text-gray-500">
            Loading projects from the backend...
          </div>
        )}

        {!isLoading && projects.map((project) => (
          <div
            key={project.id}
            className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                    {project.status.toUpperCase().replace('-', ' ')}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{project.description}</p>
              </div>
              {!isUsingFallbackData && project.status !== 'completed' && project.status !== 'cancelled' && (
                <button
                  type="button"
                  onClick={() => handleMarkCompleted(project.id)}
                  disabled={updatingProjectIds.includes(project.id)}
                  className="ml-4 shrink-0 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {updatingProjectIds.includes(project.id) ? 'Updating...' : 'Mark Completed'}
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-4">
              <div>
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                  <Calendar className="w-4 h-4" />
                  Start Date
                </div>
                <p className="text-sm font-medium text-gray-900">{formatDate(project.startDate)}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                  <Clock className="w-4 h-4" />
                  End Date
                </div>
                <p className="text-sm font-medium text-gray-900">{formatDate(project.endDate)}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                  <Users className="w-4 h-4" />
                  Team Size
                </div>
                <p className="text-sm font-medium text-gray-900">{project.teamSize} members</p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                  <TrendingUp className="w-4 h-4" />
                  Progress
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getProgressColor(project.status)}`}
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{project.progress}%</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
