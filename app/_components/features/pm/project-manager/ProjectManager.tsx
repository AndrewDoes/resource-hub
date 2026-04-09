"use client";

import { useEffect, useMemo, useState } from 'react';
import { Activity, Calendar, CheckCircle, Circle, Users } from 'lucide-react';

import {
  fetchProjectManagerProjectActivity,
  fetchProjectManagerProjectOverview,
  fetchProjectManagerMilestones,
  fetchProjectManagerProjectTeam,
  fetchProjectManagerTimelineTasks,
  fetchProjectManagerProjects,
  projectManagerFallbackProjects,
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

const defaultPmUserId = process.env.NEXT_PUBLIC_PM_USER_ID ?? '11111111-1111-1111-1111-111111111111';

const fallbackProject = {
  name: 'Website Redesign',
  description: 'Complete overhaul of company website with modern design',
  progress: 65,
  startDate: '2026-04-10',
  endDate: '2026-06-30',
  daysRemaining: 89,
};

const fallbackMilestones: Milestone[] = [
  { id: '1', title: 'Requirements Gathering', date: '2026-04-15', completed: true },
  { id: '2', title: 'Design System Creation', date: '2026-04-30', completed: true },
  { id: '3', title: 'Frontend Development', date: '2026-05-20', completed: false },
  { id: '4', title: 'Backend Integration', date: '2026-06-05', completed: false },
  { id: '5', title: 'Testing & QA', date: '2026-06-20', completed: false },
  { id: '6', title: 'Deployment', date: '2026-06-30', completed: false },
];

const fallbackTeamMembers: TeamMember[] = [
  { id: '1', name: 'Sarah Johnson', role: 'Senior Developer', avatar: 'SJ' },
  { id: '2', name: 'Michael Chen', role: 'UI/UX Designer', avatar: 'MC' },
  { id: '3', name: 'Emily Davis', role: 'Full Stack Developer', avatar: 'ED' },
  { id: '4', name: 'Robert Brown', role: 'Frontend Developer', avatar: 'RB' },
  { id: '5', name: 'Jessica Martinez', role: 'Project Manager', avatar: 'JM' },
];

const fallbackActivities = [
  {
    id: '1',
    user: 'Sarah Johnson',
    action: 'completed task',
    task: 'User Authentication Module',
    time: '2 hours ago',
  },
  {
    id: '2',
    user: 'Michael Chen',
    action: 'uploaded design',
    task: 'Homepage Mockup v2',
    time: '5 hours ago',
  },
  {
    id: '3',
    user: 'Emily Davis',
    action: 'commented on',
    task: 'API Documentation',
    time: '1 day ago',
  },
  {
    id: '4',
    user: 'Robert Brown',
    action: 'submitted PR',
    task: 'Navigation Component',
    time: '1 day ago',
  },
];

const fallbackGanttTasks = [
  { task: 'Design Phase', start: 10, duration: 20, color: 'bg-blue-500' },
  { task: 'Development', start: 25, duration: 40, color: 'bg-green-500' },
  { task: 'Testing', start: 60, duration: 15, color: 'bg-yellow-500' },
  { task: 'Deployment', start: 75, duration: 10, color: 'bg-purple-500' },
];

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
  if (members.length === 0) {
    return fallbackTeamMembers;
  }

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
  if (items.length === 0) {
    return fallbackActivities;
  }

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
  if (items.length === 0) {
    return fallbackMilestones;
  }

  return items.map((item) => ({
    id: item.milestoneId,
    title: item.title,
    date: item.dueDate,
    completed: item.isCompleted,
  }));
};

const mapTimelineTasks = (items: ProjectManagerTimelineTask[]) => {
  if (items.length === 0) {
    return fallbackGanttTasks;
  }

  return items.map((item) => ({
    task: item.name,
    start: item.startOffsetDays,
    duration: item.durationDays,
    color:
      item.colorTag === 'green'
        ? 'bg-green-500'
        : item.colorTag === 'yellow'
          ? 'bg-yellow-500'
          : item.colorTag === 'purple'
            ? 'bg-purple-500'
            : 'bg-blue-500',
  }));
};

export function ProjectManager() {
  const [selectedProject, setSelectedProject] = useState<ProjectManagerProjectSummary | null>(null);
  const [projectOverview, setProjectOverview] = useState<ProjectManagerProjectOverview | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(fallbackTeamMembers);
  const [activities, setActivities] = useState(fallbackActivities);
  const [milestones, setMilestones] = useState<Milestone[]>(fallbackMilestones);
  const [ganttTasks, setGanttTasks] = useState(fallbackGanttTasks);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadProjectData = async () => {
      try {
        const projects = await fetchProjectManagerProjects(defaultPmUserId);
        const activeProject = projects[0] ?? projectManagerFallbackProjects[0];

        if (!isMounted) {
          return;
        }

        setSelectedProject(activeProject);

        const [overviewResult, teamResult, activityResult, milestoneResult, timelineTaskResult] = await Promise.allSettled([
          fetchProjectManagerProjectOverview(defaultPmUserId, activeProject.id),
          fetchProjectManagerProjectTeam(defaultPmUserId, activeProject.id),
          fetchProjectManagerProjectActivity(defaultPmUserId, activeProject.id),
          fetchProjectManagerMilestones(defaultPmUserId, activeProject.id),
          fetchProjectManagerTimelineTasks(defaultPmUserId, activeProject.id),
        ]);

        if (!isMounted) {
          return;
        }

        setProjectOverview(
          overviewResult.status === 'fulfilled' ? overviewResult.value : mapSummaryToOverview(activeProject)
        );
        setTeamMembers(
          teamResult.status === 'fulfilled' ? mapTeamMembers(teamResult.value) : fallbackTeamMembers
        );
        setActivities(
          activityResult.status === 'fulfilled' ? mapActivities(activityResult.value) : fallbackActivities
        );
        setMilestones(
          milestoneResult.status === 'fulfilled' ? mapMilestones(milestoneResult.value) : fallbackMilestones
        );
        setGanttTasks(
          timelineTaskResult.status === 'fulfilled'
            ? mapTimelineTasks(timelineTaskResult.value)
            : fallbackGanttTasks
        );
        setError(null);
      } catch (loadError) {
        if (!isMounted) {
          return;
        }

        setSelectedProject(projectManagerFallbackProjects[0]);
        setProjectOverview(mapSummaryToOverview(projectManagerFallbackProjects[0]));
        setTeamMembers(fallbackTeamMembers);
        setActivities(fallbackActivities);
        setMilestones(fallbackMilestones);
        setGanttTasks(fallbackGanttTasks);
        setError(loadError instanceof Error ? loadError.message : 'Failed to load project manager data');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadProjectData();

    return () => {
      isMounted = false;
    };
  }, []);

  const overview = useMemo(() => {
    if (projectOverview) {
      return projectOverview;
    }

    return mapSummaryToOverview(projectManagerFallbackProjects[0]);
  }, [projectOverview]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">{overview.name}</h1>
        <p className="text-sm text-gray-500 mt-1">{overview.description}</p>
        {error && (
          <p className="mt-2 text-sm text-amber-700">
            Showing fallback data because the backend request failed: {error}
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
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Project Timeline</h3>
        <div className="space-y-4">
          {ganttTasks.map((task, index) => (
            <div key={index}>
              <div className="flex items-center gap-4 mb-2">
                <p className="text-sm font-medium text-gray-900 w-32">{task.task}</p>
                <div className="flex-1 bg-gray-100 rounded-full h-8 relative">
                  <div
                    className={`absolute h-8 rounded-full ${task.color} flex items-center justify-center`}
                    style={{
                      left: `${task.start}%`,
                      width: `${task.duration}%`,
                    }}
                  >
                    <span className="text-xs text-white font-medium">
                      {task.duration} days
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Milestones</h3>
          <div className="space-y-3">
            {milestones.map((milestone) => (
              <div
                key={milestone.id}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
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
              </div>
            ))}
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
        </div>
      </div>
    </div>
  );
}
