'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Clock,
  CheckCircle,
  AlertCircle,
  Target,
  Calendar,
  ArrowRight
} from 'lucide-react';
import {
  fetchEmployeeDashboard,
  acceptAssignment,
  type EmployeeDashboardData,
} from '@/functions/api/employeeDashboard';
import { useRole } from '@/app/context/RoleContext';
import { useFeedbackToast } from '@/app/context/ToastContext';
import { UnifiedTaskList, GlobalMilestoneList, CompactProjectCard } from './DashboardWidgets';
import { AssignmentCard } from './AssignmentCard';

export function EmployeeDashboardView() {
  const { currentUser } = useRole();
  const { addToast } = useFeedbackToast();
  const [data, setData] = useState<EmployeeDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = async () => {
    if (!currentUser) return;
    try {
      setIsLoading(true);
      const result = await fetchEmployeeDashboard(currentUser.id);
      setData(result);
      setError(null);
    } catch (err) {
      console.error('Failed to load employee dashboard:', err);
      setError('Failed to load dashboard data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.id && currentUser?.role === 'employee') {
      loadDashboard();
    }
  }, [currentUser?.id, currentUser?.role]);

  const handleAccept = async (assignmentId: string) => {
    try {
      const success = await acceptAssignment(assignmentId);
      if (success) {
        addToast({
          type: 'success',
          title: 'Assignment Accepted',
          message: 'You have joined the project successfully.',
        });
        loadDashboard();
      }
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Action Failed',
        message: 'Could not accept the assignment.',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto py-20 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 font-medium">Loading your cockpit...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-7xl mx-auto py-20 flex flex-col items-center justify-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <p className="text-gray-900 font-semibold">{error || 'Something went wrong'}</p>
        <button
          onClick={() => loadDashboard()}
          className="px-4 py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  // Aggregate global priorities
  const globalTasks = data.assignments.flatMap(a =>
    a.tasks.filter(t => t.status.toLowerCase() === 'inprogress').map(t => ({
      ...t,
      projectName: a.projectName
    }))
  ).sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 10);

  const globalMilestones = data.assignments.flatMap(a =>
    a.milestones.filter(m => !m.isCompleted).map(m => ({
      ...m,
      projectName: a.projectName
    }))
  ).sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 5);

  const invitations = data.assignments.filter(a => {
    const s = a.status.toLowerCase();
    return s === 'pending' || s === 'gmapproved' || s === 'approved';
  });

  const activeEngagements = data.assignments.filter(a => {
    const s = a.status.toLowerCase();
    return s === 'accepted' || s === 'inprogress' || s === 'in-progress';
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome, {currentUser?.name}!</h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">Here's your real-time performance and priority highlight.</p>
        </div>
      </div>

      {/* Stats Quick Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-linear-to-br from-orange-500 to-yellow-500 rounded-2xl p-5 text-white shadow-lg border border-orange-400/20">
          <p className="text-xs font-bold text-orange-100 uppercase tracking-widest mb-1">Invites</p>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-bold">{data.pendingAssignmentsCount}</h3>
            <Clock className="w-6 h-6 opacity-40 mb-1" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm group hover:border-green-200 transition-all">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 group-hover:text-green-500 transition-colors">Projects</p>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-bold text-gray-900">{data.activeProjectsCount}</h3>
            <Target className="w-6 h-6 text-green-500 opacity-20 group-hover:opacity-100 transition-opacity mb-1" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Tasks</p>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-bold text-gray-900">{globalTasks.length}</h3>
            <CheckCircle className="w-6 h-6 text-blue-500 opacity-20 mb-1" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Upcoming</p>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-bold text-gray-900">{globalMilestones.length}</h3>
            <Calendar className="w-6 h-6 text-orange-500 opacity-20 mb-1" />
          </div>
        </div>
      </div>

      {/* Main Cockpit Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Unified Task Spotlight (Primary) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-xl">
                <Clock className="w-4 h-4 text-orange-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">Task Spotlight</h2>
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-100 px-2 py-1 rounded-lg">Top {globalTasks.length} Priorities</span>
          </div>

          <UnifiedTaskList tasks={globalTasks} />

          {globalTasks.length > 0 && (
            <Link
              href="/employee/my-projects"
              className="flex items-center justify-center gap-2 py-3 w-full border-2 border-dashed border-gray-200 rounded-2xl text-sm font-bold text-gray-400 hover:text-orange-600 hover:border-orange-200 hover:bg-orange-50/30 transition-all group"
            >
              Dive into project details
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
        </div>

        {/* Sidebar widgets */}
        <div className="space-y-8">

          {/* Upcoming Milestones */}
          <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-tight mb-6 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-500" />
              Upcoming Goals
            </h3>
            <GlobalMilestoneList milestones={globalMilestones} />
          </section>

          {/* Active Projects Mini-List */}
          <section className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active Projects</h3>
              <Link href="/employee/my-projects" className="text-[10px] font-bold text-blue-600 uppercase hover:underline">See All</Link>
            </div>
            <div className="space-y-3">
              {activeEngagements.map(a => <CompactProjectCard key={a.id} assignment={a} />)}
              {activeEngagements.length === 0 && (
                <p className="text-xs text-gray-400 italic px-1">No active projects currently.</p>
              )}
            </div>
          </section>

        </div>
      </div>

      {/* Invitations Section (Separate to keep primary dashboard clean) */}
      {invitations.length > 0 && (
        <div className="space-y-6 pt-10 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-xl">
              <AlertCircle className="w-4 h-4 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">New Invitations</h2>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {invitations.map(a => (
              <AssignmentCard
                key={a.id}
                assignment={a}
                onAccept={() => handleAccept(a.id)}
                defaultExpanded
              />
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
