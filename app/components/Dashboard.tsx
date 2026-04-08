'use client';
import { useState } from 'react';
import { useRole } from '../context/RoleContext';
import {
  TrendingUp,
  Users,
  AlertTriangle,
  Briefcase,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  Folder,
  ClipboardCheck,
  ArrowRight,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { StatusBadge, ProjectStatus } from './WorkflowSystem';
import Link from 'next/link';
import { PMTimelineDashboard } from './PMTimelineDashboard';

// Mock data for role-specific dashboards
const utilizationData = [
  { month: 'Jan', utilization: 65 },
  { month: 'Feb', utilization: 72 },
  { month: 'Mar', utilization: 68 },
  { month: 'Apr', utilization: 75 },
  { month: 'May', utilization: 78 },
  { month: 'Jun', utilization: 82 },
];

// Marketing Dashboard Data
const marketingProjects = [
  { id: '1', name: 'Q3 Campaign Launch', status: 'draft' as ProjectStatus, lastModified: '2 hours ago' },
  { id: '2', name: 'Website Redesign', status: 'submitted' as ProjectStatus, lastModified: '1 day ago' },
  { id: '3', name: 'Brand Refresh', status: 'rejected' as ProjectStatus, lastModified: '3 days ago', feedback: 'Budget constraints - please revise' },
];

// GM Dashboard Data
const gmPendingActions = [
  { id: '1', type: 'approval', title: 'Mobile App Development', submittedBy: 'Sarah Martinez', priority: 'high', daysWaiting: 2 },
  { id: '2', type: 'contract', title: 'David Lee Contract Extension', submittedBy: 'System', priority: 'medium', daysWaiting: 5 },
  { id: '3', type: 'conflict', title: 'Resource Overload: Emily Chen', submittedBy: 'HR', priority: 'high', daysWaiting: 1 },
];

const gmResourceConflicts = [
  { employee: 'Emily Chen', allocation: 145, projects: 3, status: 'critical' },
  { employee: 'David Lee', allocation: 110, projects: 2, status: 'warning' },
];

// PM Dashboard Data
const pmActiveProjects = [
  { id: '1', name: 'Website Redesign', progress: 65, status: 'in-progress' as ProjectStatus, teamSize: 8, deadline: '2026-07-15' },
  { id: '2', name: 'Mobile App', progress: 30, status: 'in-progress' as ProjectStatus, teamSize: 6, deadline: '2026-08-30' },
];

// HR Dashboard Data
const hrPendingValidations = [
  { id: '1', employee: 'David Lee', project: 'Website Redesign', hasConflict: false, daysWaiting: 1 },
  { id: '2', employee: 'Sarah Kim', project: 'Mobile App', hasConflict: false, daysWaiting: 3 },
  { id: '3', employee: 'David Lee', project: 'Marketing Campaign', hasConflict: true, daysWaiting: 1 },
];

// Employee Dashboard Data
const employeeAssignments = [
  { id: '1', project: 'Website Redesign', role: 'Frontend Developer', status: 'submitted' as ProjectStatus, allocation: 100 },
  { id: '2', project: 'Mobile App', role: 'Developer', status: 'in-progress' as ProjectStatus, progress: 65, allocation: 50 },
];

export function Dashboard() {
  const { currentUser } = useRole();
  const [filter, setFilter] = useState<'all' | 'pending' | 'active'>('all');

  // Marketing Dashboard
  if (currentUser.role === 'marketing') {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Marketing Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your project proposals</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/projects" className="bg-linear-to-br from-purple-500 to-pink-500 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <FileText className="w-6 h-6" />
              <h3 className="font-semibold text-lg">Create New Project</h3>
            </div>
            <p className="text-sm text-purple-50">Submit a new project proposal</p>
          </Link>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              <h3 className="font-semibold text-gray-900">Pending Review</h3>
            </div>
            <p className="text-3xl font-semibold text-gray-900">{marketingProjects.filter(p => p.status === 'submitted').length}</p>
            <p className="text-sm text-gray-500 mt-1">Awaiting GM approval</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <XCircle className="w-5 h-5 text-red-600" />
              <h3 className="font-semibold text-gray-900">Needs Revision</h3>
            </div>
            <p className="text-3xl font-semibold text-gray-900">{marketingProjects.filter(p => p.status === 'rejected').length}</p>
            <p className="text-sm text-gray-500 mt-1">Requires updates</p>
          </div>
        </div>

        {/* My Projects */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">My Projects</h2>
          </div>
          <div className="p-6 space-y-3">
            {marketingProjects.map((project) => (
              <div key={project.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold text-gray-900">{project.name}</h3>
                    <StatusBadge status={project.status} />
                  </div>
                  <p className="text-sm text-gray-500">Last modified: {project.lastModified}</p>
                  {project.feedback && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                      <span className="font-medium">Feedback:</span> {project.feedback}
                    </div>
                  )}
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // GM Dashboard
  if (currentUser.role === 'gm') {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">General Manager Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Critical actions and resource overview</p>
        </div>

        {/* Priority Actions */}
        <div className="bg-linear-to-br from-red-500 to-orange-500 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 shrink-0 mt-1" />
            <div>
              <h2 className="text-xl font-semibold mb-1">Immediate Action Required</h2>
              <p className="text-red-50 text-sm mb-4">{gmPendingActions.filter(a => a.priority === 'high').length} high-priority items need your attention</p>
              <div className="space-y-2">
                {gmPendingActions.filter(a => a.priority === 'high').map((action) => (
                  <div key={action.id} className="bg-white/20 backdrop-blur rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{action.title}</p>
                      <span className="text-xs bg-white/30 px-2 py-1 rounded">{action.daysWaiting}d waiting</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Resource Conflicts */}
        <div className="bg-white rounded-xl border-2 border-red-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 bg-red-50">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <h2 className="text-lg font-semibold text-gray-900">Resource Conflicts Detected</h2>
            </div>
          </div>
          <div className="p-6 space-y-3">
            {gmResourceConflicts.map((conflict, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                <div>
                  <p className="font-semibold text-gray-900">{conflict.employee}</p>
                  <p className="text-sm text-gray-600">{conflict.projects} overlapping projects</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-semibold text-red-600">{conflict.allocation}%</p>
                  <p className="text-xs text-red-600 font-medium uppercase">{conflict.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/planning" className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <Folder className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Planning</h3>
            </div>
            <p className="text-3xl font-semibold text-gray-900 mb-1">
              {gmPendingActions.filter(a => a.type === 'approval').length}
            </p>
            <p className="text-sm text-gray-500">Projects awaiting approval</p>
          </Link>

          <Link href="/decision-panel" className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <Users className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-gray-900">Contract Decisions</h3>
            </div>
            <p className="text-3xl font-semibold text-gray-900 mb-1">
              {gmPendingActions.filter(a => a.type === 'contract').length}
            </p>
            <p className="text-sm text-gray-500">Contracts pending decision</p>
          </Link>

          <Link href="/resource-overview" className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <Users className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-gray-900">Resource Overview</h3>
            </div>
            <p className="text-3xl font-semibold text-gray-900 mb-1">
              {gmResourceConflicts.length}
            </p>
            <p className="text-sm text-gray-500">View-only resource status</p>
          </Link>
        </div>

        {/* Utilization Chart */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Resource Utilization Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={utilizationData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="utilization" stroke="#3B82F6" strokeWidth={2} name="Utilization %" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  // PM Dashboard - Use new timeline dashboard
  if (currentUser.role === 'pm') {
    return <PMTimelineDashboard />;
  }

  // HR Dashboard
  if (currentUser.role === 'hr') {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">HR Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Manage resource validations and assignments</p>
        </div>

        {/* Pending Validations */}
        <div className="bg-linear-to-br from-green-500 to-teal-500 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-start gap-4">
            <ClipboardCheck className="w-6 h-6 shrink-0 mt-1" />
            <div>
              <h2 className="text-xl font-semibold mb-1">Pending Validations</h2>
              <p className="text-green-50 text-sm mb-2">
                {hrPendingValidations.length} assignments awaiting your approval
              </p>
              {hrPendingValidations.filter(v => v.hasConflict).length > 0 && (
                <div className="bg-red-500/30 backdrop-blur rounded-lg p-3 mt-3">
                  <p className="text-sm font-medium">⚠️ {hrPendingValidations.filter(v => v.hasConflict).length} conflict(s) detected</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/hr-validation" className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <ClipboardCheck className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-gray-900">Validation Queue</h3>
            </div>
            <p className="text-3xl font-semibold text-gray-900 mb-1">{hrPendingValidations.length}</p>
            <p className="text-sm text-gray-500">Assignments to review</p>
          </Link>

          <Link href="/employee-management" className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <Users className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Employee Management</h3>
            </div>
            <p className="text-3xl font-semibold text-gray-900 mb-1">48</p>
            <p className="text-sm text-gray-500">Total employees</p>
          </Link>
        </div>

        {/* Recent Validations */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Validation Requests</h2>
          </div>
          <div className="p-6 space-y-3">
            {hrPendingValidations.map((validation) => (
              <div
                key={validation.id}
                className={`flex items-center justify-between p-4 rounded-lg border ${validation.hasConflict
                  ? 'bg-red-50 border-red-200'
                  : 'bg-gray-50 border-gray-200'
                  }`}
              >
                <div>
                  <p className="font-semibold text-gray-900">{validation.employee}</p>
                  <p className="text-sm text-gray-600">{validation.project}</p>
                  {validation.hasConflict && (
                    <span className="inline-flex items-center gap-1 mt-1 text-xs text-red-700 font-medium">
                      <AlertTriangle className="w-3 h-3" />
                      Conflict detected
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-500">{validation.daysWaiting}d waiting</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Employee Dashboard
  if (currentUser.role === 'employee') {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Employee Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Your project assignments and tasks</p>
        </div>

        {/* Assignment Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-linear-to-br from-orange-500 to-yellow-500 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center gap-3 mb-3">
              <Clock className="w-6 h-6" />
              <h3 className="text-lg font-semibold">Pending Assignments</h3>
            </div>
            <p className="text-4xl font-semibold mb-1">
              {employeeAssignments.filter(a => a.status === 'submitted').length}
            </p>
            <p className="text-orange-50 text-sm">Awaiting your response</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Active Projects</h3>
            </div>
            <p className="text-4xl font-semibold text-gray-900 mb-1">
              {employeeAssignments.filter(a => a.status === 'in-progress').length}
            </p>
            <p className="text-sm text-gray-500">Currently working on</p>
          </div>
        </div>

        {/* My Assignments */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">My Assignments</h2>
          </div>
          <div className="p-6 space-y-3">
            {employeeAssignments.map((assignment) => (
              <div key={assignment.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{assignment.project}</h3>
                    <p className="text-sm text-gray-600 mt-1">{assignment.role}</p>
                  </div>
                  <StatusBadge status={assignment.status} />
                </div>
                {assignment.progress !== undefined && (
                  <div className="mb-2">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium text-gray-900">{assignment.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 bg-green-500 rounded-full"
                        style={{ width: `${assignment.progress}%` }}
                      />
                    </div>
                  </div>
                )}
                <p className="text-sm text-gray-600">Allocation: {assignment.allocation}%</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Default fallback (shouldn't reach here)
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Welcome to ResourceHub</p>
      </div>
    </div>
  );
}
