"use client";

import { useEffect, useMemo, useState } from 'react';
import { Activity, Calendar, CheckCircle, Circle, Plus, Users } from 'lucide-react';

import {
  fetchProjectManagerProjectActivity,
  fetchProjectManagerProjectOverview,
  fetchProjectManagerMilestones,
  fetchProjectManagerProjectTeam,
  fetchProjectManagerTimelineTasks,
  fetchProjectManagerProjects,
  createProjectManagerMilestone,
  createProjectManagerTimelineTask,
  updateProjectManagerMilestoneStatus,
  updateProjectManagerTimelineTask,
  type ProjectManagerProjectActivity,
  type ProjectManagerMilestone,
  type ProjectManagerProjectOverview,
  type ProjectManagerProjectSummary,
  type ProjectManagerProjectTeamMember,
  type ProjectManagerTimelineTask,
} from '@/functions/api/projectManager';

interface Milestone {
  id: string;
  title: string;
  date: string;
  completed: boolean;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

interface TimelineTaskItem {
  id: string;
  name: string;
  startOffsetDays: number;
  durationDays: number;
  colorTag: string;
  status: 'pending' | 'in-progress' | 'completed';
  sortOrder: number;
}

const defaultPmUserId = process.env.NEXT_PUBLIC_PM_USER_ID ?? '11111111-1111-1111-1111-111111111111';


const formatDate = (value: string) => {
  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return parsedDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const mapSummaryToOverview = (summary: ProjectManagerProjectSummary): ProjectManagerProjectOverview => ({
  projectId: summary.id,
  name: summary.name,
  description: summary.description,
  progressPercent: summary.progress,
  status: summary.status,
  riskLevel: summary.status === 'at-risk' ? 'Medium' : summary.status === 'delayed' ? 'High' : 'Low',
  startDate: summary.startDate,
  endDate: summary.endDate,
  daysRemaining: Math.max(Math.floor((new Date(summary.endDate).getTime() - Date.now()) / 86400000), 0),
  teamSize: summary.teamSize,
  totalAssignments: summary.teamSize,
  completedAssignments: Math.floor(summary.teamSize * (summary.progress / 100)),
});

const mapTeamMembers = (members: ProjectManagerProjectTeamMember[]): TeamMember[] => {
  return members.map((member) => ({
    id: member.employeeId,
    name: member.fullName,
    role: member.jobTitle || member.roleName,
    avatar: member.fullName
      .split(' ')
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join('')
      .toUpperCase(),
  }));
};

const mapActivities = (items: ProjectManagerProjectActivity[]) => {
  return items.map((item, index) => {
    const [user, ...messageParts] = item.message.split(' ');

    return {
      id: `${index + 1}`,
      user,
      action: messageParts.slice(0, 2).join(' ') || 'updated',
      task: messageParts.slice(2).join(' ') || item.message,
      time: formatDate(item.occurredAt),
    };
  });
};

const mapMilestones = (items: ProjectManagerMilestone[]) => {
  return items.map((item) => ({
    id: item.milestoneId,
    title: item.title,
    date: item.dueDate,
    completed: item.isCompleted,
  }));
};

const mapTimelineTasks = (items: ProjectManagerTimelineTask[]): TimelineTaskItem[] => {
  return items.map((item) => ({
    id: item.timelineTaskId,
    name: item.name,
    startOffsetDays: item.startOffsetDays,
    durationDays: item.durationDays,
    colorTag: item.colorTag,
    status: item.status.toLowerCase() === 'completed'
      ? 'completed'
      : item.status.toLowerCase() === 'inprogress' || item.status.toLowerCase() === 'in-progress'
        ? 'in-progress'
        : 'pending',
    sortOrder: item.sortOrder,
  }));
};

const timelineColorClass = (colorTag: string) => {
  if (colorTag === 'green') {
    return 'bg-green-500';
  }

  if (colorTag === 'yellow') {
    return 'bg-yellow-500';
  }

  if (colorTag === 'purple') {
    return 'bg-purple-500';
  }

  return 'bg-blue-500';
};

export function ProjectManager() {
  const [projectList, setProjectList] = useState<ProjectManagerProjectSummary[]>([]);
  const [selectedProject, setSelectedProject] = useState<ProjectManagerProjectSummary | null>(null);
  const [projectOverview, setProjectOverview] = useState<ProjectManagerProjectOverview | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [activities, setActivities] = useState<Array<{ id: string; user: string; action: string; task: string; time: string }>>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [ganttTasks, setGanttTasks] = useState<TimelineTaskItem[]>([]);
  const [isCreatingMilestone, setIsCreatingMilestone] = useState(false);
  const [isUpdatingMilestoneId, setIsUpdatingMilestoneId] = useState<string | null>(null);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [newMilestoneDate, setNewMilestoneDate] = useState('');
  const [isCreatingTimelineTask, setIsCreatingTimelineTask] = useState(false);
  const [newTimelineName, setNewTimelineName] = useState('');
  const [newTimelineStartOffset, setNewTimelineStartOffset] = useState(0);
  const [newTimelineDuration, setNewTimelineDuration] = useState(7);
  const [newTimelineColorTag, setNewTimelineColorTag] = useState('blue');
  const [editingTimelineTaskId, setEditingTimelineTaskId] = useState<string | null>(null);
  const [timelineEditDraft, setTimelineEditDraft] = useState<TimelineTaskItem | null>(null);
  const [isSavingTimelineTask, setIsSavingTimelineTask] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadProjectList = async () => {
      try {
        const projects = await fetchProjectManagerProjects(defaultPmUserId);
        const resolvedProjects = projects;

        if (!isMounted) {
          return;
        }

        setProjectList(resolvedProjects);
        setSelectedProject((currentProject) => {
          if (currentProject && resolvedProjects.some((project) => project.id === currentProject.id)) {
            return currentProject;
          }

          return resolvedProjects[0] ?? null;
        });
        setError(null);
      } catch (loadError) {
        if (!isMounted) {
          return;
        }

        setProjectList([]);
        setSelectedProject(null);
        setError(loadError instanceof Error ? loadError.message : 'Failed to load project manager data');
      }
    };

    void loadProjectList();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedProject) {
      return;
    }

    let isMounted = true;

    const loadSelectedProjectData = async () => {
      setIsLoading(true);

      const [overviewResult, teamResult, activityResult, milestoneResult, timelineTaskResult] = await Promise.allSettled([
        fetchProjectManagerProjectOverview(defaultPmUserId, selectedProject.id),
        fetchProjectManagerProjectTeam(defaultPmUserId, selectedProject.id),
        fetchProjectManagerProjectActivity(defaultPmUserId, selectedProject.id),
        fetchProjectManagerMilestones(defaultPmUserId, selectedProject.id),
        fetchProjectManagerTimelineTasks(defaultPmUserId, selectedProject.id),
      ]);

      if (!isMounted) {
        return;
      }

      setProjectOverview(
        overviewResult.status === 'fulfilled' ? overviewResult.value : null
      );
      setTeamMembers(
        teamResult.status === 'fulfilled' ? mapTeamMembers(teamResult.value) : []
      );
      setActivities(
        activityResult.status === 'fulfilled' ? mapActivities(activityResult.value) : []
      );
      setMilestones(
        milestoneResult.status === 'fulfilled' ? mapMilestones(milestoneResult.value) : []
      );
      setGanttTasks(
        timelineTaskResult.status === 'fulfilled'
          ? mapTimelineTasks(timelineTaskResult.value)
          : []
      );

      const hasAnyFailure = [overviewResult, teamResult, activityResult, milestoneResult, timelineTaskResult]
        .some((result) => result.status === 'rejected');

      setError(hasAnyFailure ? 'Some project data is unavailable right now.' : null);
      setIsLoading(false);
    };

    void loadSelectedProjectData();

    return () => {
      isMounted = false;
    };
  }, [selectedProject]);

  const overview = useMemo(() => {
    if (projectOverview) {
      return projectOverview;
    }

    if (selectedProject) {
      return mapSummaryToOverview(selectedProject);
    }

    return null;
  }, [projectOverview, selectedProject]);

  const refreshMilestones = async () => {
    if (!selectedProject) {
      return;
    }

    const items = await fetchProjectManagerMilestones(defaultPmUserId, selectedProject.id);
    setMilestones(mapMilestones(items));
  };

  const refreshTimelineTasks = async () => {
    if (!selectedProject) {
      return;
    }

    const items = await fetchProjectManagerTimelineTasks(defaultPmUserId, selectedProject.id);
    setGanttTasks(mapTimelineTasks(items));
  };

  const handleToggleMilestone = async (milestone: Milestone) => {
    if (!selectedProject || isUpdatingMilestoneId) {
      return;
    }

    try {
      setError(null);
      setIsUpdatingMilestoneId(milestone.id);
      await updateProjectManagerMilestoneStatus({
        pmUserId: defaultPmUserId,
        projectId: selectedProject.id,
        milestoneId: milestone.id,
        isCompleted: !milestone.completed,
      });
      await refreshMilestones();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Failed to update milestone');
    } finally {
      setIsUpdatingMilestoneId(null);
    }
  };

  const handleCreateMilestone = async () => {
    if (!selectedProject) {
      return;
    }

    if (!newMilestoneTitle.trim() || !newMilestoneDate) {
      setError('Milestone title and due date are required.');
      return;
    }

    try {
      setError(null);
      setIsCreatingMilestone(true);
      await createProjectManagerMilestone({
        pmUserId: defaultPmUserId,
        projectId: selectedProject.id,
        title: newMilestoneTitle.trim(),
        dueDate: newMilestoneDate,
        sortOrder: milestones.length + 1,
      });
      setNewMilestoneTitle('');
      setNewMilestoneDate('');
      await refreshMilestones();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'Failed to create milestone');
    } finally {
      setIsCreatingMilestone(false);
    }
  };

  const handleStartEditTimelineTask = (task: TimelineTaskItem) => {
    setEditingTimelineTaskId(task.id);
    setTimelineEditDraft({ ...task });
  };

  const handleSaveTimelineTask = async () => {
    if (!selectedProject || !editingTimelineTaskId || !timelineEditDraft) {
      return;
    }

    if (!timelineEditDraft.name.trim()) {
      setError('Timeline task name is required.');
      return;
    }

    try {
      setError(null);
      setIsSavingTimelineTask(true);
      await updateProjectManagerTimelineTask({
        pmUserId: defaultPmUserId,
        projectId: selectedProject.id,
        timelineTaskId: editingTimelineTaskId,
        name: timelineEditDraft.name.trim(),
        startOffsetDays: Math.max(0, timelineEditDraft.startOffsetDays),
        durationDays: Math.max(1, timelineEditDraft.durationDays),
        colorTag: timelineEditDraft.colorTag,
        status: timelineEditDraft.status,
        sortOrder: timelineEditDraft.sortOrder,
      });
      setEditingTimelineTaskId(null);
      setTimelineEditDraft(null);
      await refreshTimelineTasks();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to update timeline task');
    } finally {
      setIsSavingTimelineTask(false);
    }
  };

  const handleCreateTimelineTask = async () => {
    if (!selectedProject) {
      return;
    }

    if (!newTimelineName.trim()) {
      setError('Timeline task name is required.');
      return;
    }

    try {
      setError(null);
      setIsCreatingTimelineTask(true);
      await createProjectManagerTimelineTask({
        pmUserId: defaultPmUserId,
        projectId: selectedProject.id,
        name: newTimelineName.trim(),
        startOffsetDays: Math.max(0, newTimelineStartOffset),
        durationDays: Math.max(1, newTimelineDuration),
        colorTag: newTimelineColorTag,
        sortOrder: ganttTasks.length + 1,
      });
      setNewTimelineName('');
      setNewTimelineStartOffset(0);
      setNewTimelineDuration(7);
      setNewTimelineColorTag('blue');
      await refreshTimelineTasks();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'Failed to create timeline task');
    } finally {
      setIsCreatingTimelineTask(false);
    }
  };

  if (!selectedProject || !overview) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">No Project Data</h2>
        <p className="mt-1 text-sm text-gray-600">No PM projects were returned from backend.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">{overview.name}</h1>
        <p className="text-sm text-gray-500 mt-1">{overview.description}</p>
        <div className="mt-3 max-w-sm">
          <label htmlFor="pm-project-selector" className="mb-1 block text-xs font-medium text-gray-500">
            Selected project
          </label>
          <select
            id="pm-project-selector"
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
            value={selectedProject?.id ?? ''}
            onChange={(event) => {
              const nextProject = projectList.find((project) => project.id === event.target.value) ?? null;
              setSelectedProject(nextProject);
            }}
          >
            {projectList.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>
        {error && (
          <p className="mt-2 text-sm text-amber-700">
            Backend warning: {error}
          </p>
        )}
      </div>

      {/* Project Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Activity className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium text-gray-600">Overall Progress</p>
          </div>
          <p className="text-3xl font-semibold text-gray-900 mb-2">{overview.progressPercent}%</p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${overview.progressPercent}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-50 text-green-600 rounded-lg">
              <Calendar className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium text-gray-600">Timeline</p>
          </div>
          <p className="text-sm text-gray-900 mb-1">
            {formatDate(overview.startDate)} - {formatDate(overview.endDate)}
          </p>
          <p className="text-xs text-gray-500">{overview.daysRemaining} days remaining</p>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium text-gray-600">Team Size</p>
          </div>
          <p className="text-3xl font-semibold text-gray-900">{teamMembers.length}</p>
          <p className="text-xs text-gray-500 mt-1">Active members</p>
        </div>
      </div>

      {/* Gantt Chart Timeline */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-gray-900">Project Timeline</h3>
          <button
            type="button"
            onClick={() => void handleCreateTimelineTask()}
            disabled={isCreatingTimelineTask || !newTimelineName.trim()}
            className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Plus className="h-3.5 w-3.5" />
            {isCreatingTimelineTask ? 'Adding...' : 'Add Timeline Task'}
          </button>
        </div>

        <p className="mb-3 text-xs text-gray-500">
          Start Offset = days from project start. Duration = task length in days.
        </p>

        <div className="mb-6 grid grid-cols-1 gap-3 rounded-lg border border-blue-100 bg-blue-50/60 p-3 md:grid-cols-5">
          <label className="flex flex-col gap-1 md:col-span-2">
            <span className="text-xs font-medium text-gray-600">Task Name</span>
            <input
              type="text"
              value={newTimelineName}
              onChange={(event) => setNewTimelineName(event.target.value)}
              placeholder="Task name"
              className="rounded-md border border-gray-300 px-2 py-1.5 text-sm"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-gray-600">Start Offset (days)</span>
            <input
              type="number"
              min={0}
              value={newTimelineStartOffset}
              onChange={(event) => setNewTimelineStartOffset(Number(event.target.value) || 0)}
              placeholder="0"
              className="rounded-md border border-gray-300 px-2 py-1.5 text-sm"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-gray-600">Duration (days)</span>
            <input
              type="number"
              min={1}
              value={newTimelineDuration}
              onChange={(event) => setNewTimelineDuration(Math.max(1, Number(event.target.value) || 1))}
              placeholder="7"
              className="rounded-md border border-gray-300 px-2 py-1.5 text-sm"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-gray-600">Color</span>
            <select
              value={newTimelineColorTag}
              onChange={(event) => setNewTimelineColorTag(event.target.value)}
              className="rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm"
            >
              <option value="blue">Blue</option>
              <option value="green">Green</option>
              <option value="yellow">Yellow</option>
              <option value="purple">Purple</option>
            </select>
          </label>
        </div>

        <div className="space-y-4">
          {ganttTasks.map((task) => (
            <div key={task.id} className="rounded-lg border border-gray-100 p-2">
              <div className="flex items-center gap-4 mb-2">
                <p className="text-sm font-medium text-gray-900 w-40">{task.name}</p>
                <div className="flex-1 bg-gray-100 rounded-full h-8 relative">
                  <div
                    className={`absolute h-8 rounded-full ${timelineColorClass(task.colorTag)} flex items-center justify-center`}
                    style={{
                      left: `${Math.max(0, task.startOffsetDays)}%`,
                      width: `${Math.max(1, task.durationDays)}%`,
                    }}
                  >
                    <span className="text-xs text-white font-medium">
                      {task.durationDays} days
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleStartEditTimelineTask(task)}
                  className="rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
                >
                  Edit
                </button>
              </div>

              {editingTimelineTaskId === task.id && timelineEditDraft && (
                <div className="grid grid-cols-1 gap-2 border-t border-gray-200 pt-2 md:grid-cols-6">
                  <label className="flex flex-col gap-1 md:col-span-2">
                    <span className="text-xs font-medium text-gray-600">Task Name</span>
                    <input
                      type="text"
                      value={timelineEditDraft.name}
                      onChange={(event) =>
                        setTimelineEditDraft((prev) => (prev ? { ...prev, name: event.target.value } : prev))
                      }
                      className="rounded-md border border-gray-300 px-2 py-1.5 text-sm"
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-xs font-medium text-gray-600">Start Offset (days)</span>
                    <input
                      type="number"
                      min={0}
                      value={timelineEditDraft.startOffsetDays}
                      onChange={(event) =>
                        setTimelineEditDraft((prev) => (prev ? { ...prev, startOffsetDays: Number(event.target.value) || 0 } : prev))
                      }
                      className="rounded-md border border-gray-300 px-2 py-1.5 text-sm"
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-xs font-medium text-gray-600">Duration (days)</span>
                    <input
                      type="number"
                      min={1}
                      value={timelineEditDraft.durationDays}
                      onChange={(event) =>
                        setTimelineEditDraft((prev) => (prev ? { ...prev, durationDays: Math.max(1, Number(event.target.value) || 1) } : prev))
                      }
                      className="rounded-md border border-gray-300 px-2 py-1.5 text-sm"
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-xs font-medium text-gray-600">Color</span>
                    <select
                      value={timelineEditDraft.colorTag}
                      onChange={(event) =>
                        setTimelineEditDraft((prev) => (prev ? { ...prev, colorTag: event.target.value } : prev))
                      }
                      className="rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm"
                    >
                      <option value="blue">Blue</option>
                      <option value="green">Green</option>
                      <option value="yellow">Yellow</option>
                      <option value="purple">Purple</option>
                    </select>
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-xs font-medium text-gray-600">Status</span>
                    <select
                      value={timelineEditDraft.status}
                      onChange={(event) =>
                        setTimelineEditDraft((prev) =>
                          prev
                            ? { ...prev, status: event.target.value as 'pending' | 'in-progress' | 'completed' }
                            : prev
                        )
                      }
                      className="rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm"
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </label>
                  <div className="flex items-center gap-2 md:col-span-6 md:justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingTimelineTaskId(null);
                        setTimelineEditDraft(null);
                      }}
                      className="rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleSaveTimelineTask()}
                      disabled={isSavingTimelineTask}
                      className="rounded-md bg-blue-600 px-2 py-1 text-xs font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isSavingTimelineTask ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {ganttTasks.length === 0 && (
            <p className="text-sm text-gray-500">No timeline tasks yet.</p>
          )}
        </div>
        <div className="flex justify-between mt-4 pt-4 border-t border-gray-200">
          <span className="text-xs text-gray-500">Start</span>
          <span className="text-xs text-gray-500">Week 5</span>
          <span className="text-xs text-gray-500">Week 10</span>
          <span className="text-xs text-gray-500">End</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Milestones */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-2">
            <h3 className="text-lg font-semibold text-gray-900">Milestones</h3>
            <button
              type="button"
              onClick={() => void handleCreateMilestone()}
              disabled={isCreatingMilestone || !newMilestoneTitle.trim() || !newMilestoneDate}
              className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Plus className="h-3.5 w-3.5" />
              {isCreatingMilestone ? 'Adding...' : 'Add Milestone'}
            </button>
          </div>

          <div className="mb-3 grid grid-cols-1 gap-2 rounded-lg border border-blue-100 bg-blue-50/60 p-3 md:grid-cols-2">
            <input
              type="text"
              value={newMilestoneTitle}
              onChange={(event) => setNewMilestoneTitle(event.target.value)}
              placeholder="Milestone title"
              className="rounded-md border border-gray-300 px-2 py-1.5 text-sm"
            />
            <input
              type="date"
              value={newMilestoneDate}
              onChange={(event) => setNewMilestoneDate(event.target.value)}
              className="rounded-md border border-gray-300 px-2 py-1.5 text-sm"
            />
          </div>

          <div className="space-y-3">
            {milestones.map((milestone) => (
              <button
                type="button"
                key={milestone.id}
                onClick={() => void handleToggleMilestone(milestone)}
                disabled={isUpdatingMilestoneId === milestone.id}
                className="flex w-full items-center gap-3 rounded-lg p-3 text-left hover:bg-gray-50 transition-colors disabled:cursor-not-allowed disabled:opacity-70"
              >
                {milestone.completed ? (
                  <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-400 shrink-0" />
                )}
                <div className="flex-1">
                  <p
                    className={`text-sm font-medium ${milestone.completed ? 'text-gray-500 line-through' : 'text-gray-900'
                      }`}
                  >
                    {milestone.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {formatDate(milestone.date)}
                  </p>
                </div>
              </button>
            ))}
            {milestones.length === 0 && (
              <p className="text-sm text-gray-500">No milestones yet. Add your first milestone above.</p>
            )}
          </div>
        </div>

        {/* Team Members */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Members</h3>
          <div className="space-y-3">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-white text-sm font-medium">{member.avatar}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{member.name}</p>
                  <p className="text-xs text-gray-500">{member.role}</p>
                </div>
              </div>
            ))}
            {teamMembers.length === 0 && (
              <p className="text-sm text-gray-500">No team members found for this project.</p>
            )}
          </div>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
            {activities.map((activity) => (
            <div key={activity.id} className="flex gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 shrink-0"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">
                  <span className="font-medium">{activity.user}</span>{' '}
                  <span className="text-gray-600">{activity.action}</span>{' '}
                  <span className="font-medium">{activity.task}</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
              </div>
            </div>
          ))}
          {activities.length === 0 && (
            <p className="text-sm text-gray-500">No recent activity yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
