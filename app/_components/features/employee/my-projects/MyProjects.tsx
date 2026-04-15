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
import {
  fetchEmployeeDashboard,
  acceptAssignment,
  type EmployeeDashboardData
} from '@/functions/api/employeeDashboard';
import { AssignmentCard } from '../../common/dashboard/components/AssignmentCard';

export function MyProjects() {
  const { currentUser } = useRole();
  const { addToast } = useFeedbackToast();
  const [data, setData] = useState<EmployeeDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProjects = async () => {
    if (!currentUser) return;
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
    if (currentUser?.id && currentUser?.role === 'employee') {
      loadProjects();
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

  const pendingAssignmentsList = data.assignments.filter((a) => {
    const s = a.status.toLowerCase();
    return s === 'pending' || s === 'gmapproved' || s === 'approved';
  });

  const acceptedAssignmentsList = data.assignments.filter((a) => {
    const s = a.status.toLowerCase();
    return s === 'accepted' || s === 'inprogress' || s === 'in-progress';
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">My Projects</h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">
            Manage your roles, track progress, and collaborate with your project teams.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-xs flex flex-col items-center">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Active</span>
            <span className="text-lg font-bold text-green-600 leading-none">{acceptedAssignmentsList.length}</span>
          </div>
          <div className="bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-xs flex flex-col items-center">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Invites</span>
            <span className="text-lg font-bold text-orange-500 leading-none">{pendingAssignmentsList.length}</span>
          </div>
        </div>
      </div>

      {/* Pending Assignments */}
      {pendingAssignmentsList.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 px-1">
            <div className="p-1.5 bg-orange-100 rounded-lg">
              <Clock className="w-4 h-4 text-orange-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">Project Invitations</h2>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {pendingAssignmentsList.map((assignment) => (
              <AssignmentCard
                key={assignment.id}
                assignment={assignment}
                onAccept={() => handleAccept(assignment.id)}
                defaultExpanded
              />
            ))}
          </div>
        </div>
      )}

      {/* Active Projects */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center gap-3 px-1">
          <div className="p-1.5 bg-green-100 rounded-lg">
            <CheckCircle className="w-4 h-4 text-green-600" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 tracking-tight">Ongoing Engagements</h2>
        </div>

        {acceptedAssignmentsList.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {acceptedAssignmentsList.map((assignment) => (
              <AssignmentCard
                key={assignment.id}
                assignment={assignment}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-16 text-center shadow-xs">
            <div className="p-5 bg-gray-50 rounded-full w-fit mx-auto mb-6">
              <Briefcase className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">No ongoing projects found</h3>
            <p className="text-sm text-gray-500 max-w-xs mx-auto">
              Once your project assignments are accepted and activated, they will appear here with full tracking capabilities.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
