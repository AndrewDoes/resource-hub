'use client';

import { useEffect, useState } from 'react';
import {
  Briefcase,
  CheckCircle,
  Clock,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { useRole } from '@/app/context/RoleContext';
import { useFeedbackToast } from '@/app/context/ToastContext';
import { fetchEmployeeDashboard, acceptAssignment, type EmployeeDashboardData } from '@/functions/api/employeeDashboard';
import { StatusBadge } from '@/app/_components/system/components/StatusBadge';
import { ProjectStatus } from '@/app/_components/system/types';

const mapAssignmentStatus = (status: string): ProjectStatus => {
  const s = status.toLowerCase();
  switch (s) {
    case 'pending': return 'submitted';
    case 'gmapproved': return 'under-review';
    case 'approved': return 'approved';
    case 'accepted': return 'assigned';
    case 'inprogress':
    case 'in-progress': return 'in-progress';
    case 'rejected': return 'rejected';
    default: return 'submitted';
  }
};


export function MyProjects() {
  const { currentUser } = useRole();
  const { addToast } = useFeedbackToast();
  const [data, setData] = useState<EmployeeDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      const result = await fetchEmployeeDashboard(currentUser.id);
      setData(result);
      setError(null);
    } catch (err) {
      console.error('Failed to load projects:', err);
      setError('Failed to load project data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser.id && currentUser.role === 'employee') {
      loadProjects();
    }
  }, [currentUser.id, currentUser.role]);

  const handleAccept = async (assignmentId: string) => {
    try {
      const success = await acceptAssignment(assignmentId);
      if (success) {
        addToast({
          type: 'success',
          title: 'Assignment Accepted',
          message: 'You have joined the project successfully.',
        });
        loadProjects();
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
        <p className="text-gray-500 font-medium">Loading your projects...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-7xl mx-auto py-20 flex flex-col items-center justify-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <p className="text-gray-900 font-semibold">{error || 'Something went wrong'}</p>
        <button
          onClick={() => loadProjects()}
          className="px-4 py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const pendingAssignments = data.assignments.filter((a) => {
    const s = a.status.toLowerCase();
    return s === 'pending' || s === 'gmapproved' || s === 'approved';
  });

  const acceptedAssignments = data.assignments.filter((a) => {
    const s = a.status.toLowerCase();
    return s === 'accepted' || s === 'inprogress' || s === 'in-progress';
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">My Projects</h1>
        <p className="text-sm text-gray-500 mt-1">
          View and manage your project assignments
        </p>
      </div>

      {/* Summary Card */}
      <div className="bg-linear-to-br from-orange-500 to-yellow-500 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white/20 rounded-lg backdrop-blur">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-1">Your Project Dashboard</h2>
            <p className="text-orange-50 text-sm">
              You have {pendingAssignments.length} pending assignment{pendingAssignments.length !== 1 ? 's' : ''}
              {' '}and {acceptedAssignments.length} active project{acceptedAssignments.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Pending Assignments */}
      {pendingAssignments.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-700" />
            <h2 className="text-lg font-semibold text-gray-900">Pending Assignments</h2>
            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
              {pendingAssignments.length}
            </span>
          </div>

          {pendingAssignments.map((assignment) => (
            <div
              key={assignment.id}
              className="bg-white rounded-xl border-2 border-yellow-200 shadow-sm p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{assignment.projectName}</h3>
                  <p className="text-sm text-gray-600 mt-1">Role: <span className="font-medium">{assignment.roleName}</span></p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <StatusBadge status={mapAssignmentStatus(assignment.status)} />
                  <span className="text-[10px] text-gray-400 font-mono">Raw: {assignment.status}</span>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                  <span>Progress</span>
                  <span className="text-gray-900">{assignment.projectProgressPercent}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden shadow-inner">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all duration-1000"
                    style={{ width: `${assignment.projectProgressPercent}%` }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6 pt-4 border-t border-gray-100">
                <div>
                  <p className="text-xs text-gray-500 mb-1 text-uppercase">Allocation</p>
                  <p className="text-sm text-gray-900 font-medium">{assignment.allocationPercent}%</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1 text-uppercase">Timeline</p>
                  <div className="flex items-center gap-1 text-sm text-gray-900 font-medium">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    Project Timeline
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleAccept(assignment.id)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 active:bg-green-800 transition-all shadow-sm hover:shadow-md text-sm font-medium"
                >
                  <CheckCircle className="w-4 h-4" />
                  Accept Assignment
                </button>
                <p className="text-sm text-gray-500 ml-auto italic">
                  Assigned by <span className="font-medium">System</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Active Projects */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <h2 className="text-lg font-semibold text-gray-900">Active Projects</h2>
          <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
            {acceptedAssignments.length}
          </span>
        </div>

        {acceptedAssignments.length > 0 ? (
          acceptedAssignments.map((assignment) => (
            <div
              key={assignment.id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:border-blue-200 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{assignment.projectName}</h3>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed max-w-2xl">{assignment.projectDescription}</p>
                </div>
                <div className="flex flex-col items-end">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${assignment.status.toLowerCase() === 'accepted' || assignment.status.toLowerCase() === 'inprogress'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-blue-100 text-blue-700'
                    }`}>
                    {assignment.status.toLowerCase() === 'accepted' ? 'ACTIVE' : assignment.status.toUpperCase()}
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono mt-1">Raw: {assignment.status}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-gray-100">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Your Role</p>
                  <p className="text-sm font-bold text-gray-900 leading-tight">{assignment.roleName}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Progress</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-gray-100 rounded-full h-2 min-w-[100px] overflow-hidden shadow-inner">
                      <div
                        className="h-full bg-green-500 rounded-full transition-all duration-1000"
                        style={{ width: `${assignment.projectProgressPercent}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-bold text-gray-900">{assignment.projectProgressPercent}%</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">End Date</p>
                  <p className="text-sm font-bold text-gray-900">{assignment.endDate}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Allocation</p>
                  <p className="text-sm font-bold text-gray-900">{assignment.allocationPercent}%</p>
                </div>
              </div>

            </div>
          ))
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="p-4 bg-gray-50 rounded-full w-fit mx-auto mb-4">
              <Briefcase className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-900 mb-1">No Active Projects</p>
            <p className="text-xs text-gray-500">
              You'll see your active projects here once you've been assigned and projects start
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
