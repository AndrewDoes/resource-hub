'use client';

import { useEffect, useState } from 'react';
import {
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { fetchEmployeeDashboard, acceptAssignment, type EmployeeDashboardData } from '@/functions/api/employeeDashboard';
import { useRole } from '@/app/context/RoleContext';
import { StatusBadge } from '@/app/_components/system/components/StatusBadge';
import { useFeedbackToast } from '@/app/context/ToastContext';
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


export function EmployeeDashboardView() {
  const { currentUser } = useRole();
  const { addToast } = useFeedbackToast();
  const [data, setData] = useState<EmployeeDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = async () => {
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
    if (currentUser.id && currentUser.role === 'employee') {
      loadDashboard();
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
        <p className="text-gray-500 font-medium">Loading your assignments...</p>
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

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Employee Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Hello, {currentUser.name}! Here are your project assignments.</p>
      </div>

      {/* Assignment Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-linear-to-br from-orange-500 to-yellow-500 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <Clock className="w-6 h-6" />
            <h3 className="text-lg font-semibold">Pending Assignments</h3>
          </div>
          <p className="text-4xl font-semibold mb-1">
            {data.pendingAssignmentsCount}
          </p>
          <p className="text-orange-50 text-sm">Awaiting your response</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Active Projects</h3>
          </div>
          <p className="text-4xl font-semibold text-gray-900 mb-1">
            {data.activeProjectsCount}
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
          {data.assignments.length === 0 ? (
            <div className="py-10 text-center text-gray-500">
              No assignments found.
            </div>
          ) : (
            data.assignments.map((assignment) => {
              const statusLower = assignment.status.toLowerCase();
              const isPending = statusLower === 'pending' || statusLower === 'gmapproved' || statusLower === 'approved';

              return (
                <div key={assignment.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-orange-200 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{assignment.projectName}</h3>
                      <p className="text-sm text-gray-600 mt-1">{assignment.roleName}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <StatusBadge status={mapAssignmentStatus(assignment.status)} />
                      <span className="text-[10px] text-gray-400 font-mono">Raw: {assignment.status}</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-600 font-semibold uppercase tracking-wider text-[10px]">Progress</span>
                      <span className="font-bold text-gray-900">{assignment.projectProgressPercent}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 shadow-inner overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full transition-all duration-1000"
                        style={{ width: `${assignment.projectProgressPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500">Allocation: <span className="font-medium text-gray-900">{assignment.allocationPercent}%</span></p>

                    {isPending && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleAccept(assignment.id)}
                          className="px-3 py-1 text-xs font-semibold text-white bg-green-600 hover:bg-green-700 rounded-md shadow-sm transition-colors"
                        >
                          Accept
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
