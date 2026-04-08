'use client';
import { CheckCircle, Circle, Users, Calendar, Activity } from 'lucide-react';

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

const projectData = {
  name: 'Website Redesign',
  description: 'Complete overhaul of company website with modern design',
  progress: 65,
  startDate: '2026-04-10',
  endDate: '2026-06-30',
  daysRemaining: 89,
};

const milestones: Milestone[] = [
  { id: '1', title: 'Requirements Gathering', date: '2026-04-15', completed: true },
  { id: '2', title: 'Design System Creation', date: '2026-04-30', completed: true },
  { id: '3', title: 'Frontend Development', date: '2026-05-20', completed: false },
  { id: '4', title: 'Backend Integration', date: '2026-06-05', completed: false },
  { id: '5', title: 'Testing & QA', date: '2026-06-20', completed: false },
  { id: '6', title: 'Deployment', date: '2026-06-30', completed: false },
];

const teamMembers: TeamMember[] = [
  { id: '1', name: 'Sarah Johnson', role: 'Senior Developer', avatar: 'SJ' },
  { id: '2', name: 'Michael Chen', role: 'UI/UX Designer', avatar: 'MC' },
  { id: '3', name: 'Emily Davis', role: 'Full Stack Developer', avatar: 'ED' },
  { id: '4', name: 'Robert Brown', role: 'Frontend Developer', avatar: 'RB' },
  { id: '5', name: 'Jessica Martinez', role: 'Project Manager', avatar: 'JM' },
];

const activities = [
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

const ganttTasks = [
  { task: 'Design Phase', start: 10, duration: 20, color: 'bg-blue-500' },
  { task: 'Development', start: 25, duration: 40, color: 'bg-green-500' },
  { task: 'Testing', start: 60, duration: 15, color: 'bg-yellow-500' },
  { task: 'Deployment', start: 75, duration: 10, color: 'bg-purple-500' },
];

export function ProjectManagerView() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">{projectData.name}</h1>
        <p className="text-sm text-gray-500 mt-1">{projectData.description}</p>
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
          <p className="text-3xl font-semibold text-gray-900 mb-2">{projectData.progress}%</p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${projectData.progress}%` }}
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
            {new Date(projectData.startDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}{' '}
            -{' '}
            {new Date(projectData.endDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
          <p className="text-xs text-gray-500">{projectData.daysRemaining} days remaining</p>
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
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-400 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p
                    className={`text-sm font-medium ${milestone.completed ? 'text-gray-500 line-through' : 'text-gray-900'
                      }`}
                  >
                    {milestone.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {new Date(milestone.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
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
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center flex-shrink-0">
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
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
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
