'use client';
import { useState } from 'react';
import { Bell, CheckCircle, XCircle, Calendar, Clock, AlertCircle } from 'lucide-react';

interface Assignment {
  id: string;
  projectName: string;
  role: string;
  startDate: string;
  endDate: string;
  workload: number;
  status: 'pending' | 'accepted' | 'rejected';
  priority: 'high' | 'medium' | 'low';
}

interface Notification {
  id: string;
  type: 'assignment' | 'change' | 'alert';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const assignments: Assignment[] = [
  {
    id: '1',
    projectName: 'Website Redesign',
    role: 'Senior Developer',
    startDate: '2026-04-10',
    endDate: '2026-06-30',
    workload: 80,
    status: 'pending',
    priority: 'high',
  },
  {
    id: '2',
    projectName: 'Mobile App Development',
    role: 'Backend Developer',
    startDate: '2026-04-01',
    endDate: '2026-05-15',
    workload: 60,
    status: 'accepted',
    priority: 'medium',
  },
  {
    id: '3',
    projectName: 'Data Analytics Platform',
    role: 'Full Stack Developer',
    startDate: '2026-05-01',
    endDate: '2026-07-15',
    workload: 70,
    status: 'pending',
    priority: 'medium',
  },
];

const notifications: Notification[] = [
  {
    id: '1',
    type: 'assignment',
    title: 'New Project Assignment',
    message: 'You have been assigned to "Website Redesign" as Senior Developer',
    time: '10 minutes ago',
    read: false,
  },
  {
    id: '2',
    type: 'change',
    title: 'Timeline Updated',
    message: 'Mobile App Development timeline extended by 1 week',
    time: '2 hours ago',
    read: false,
  },
  {
    id: '3',
    type: 'alert',
    title: 'Workload Warning',
    message: 'Your workload will exceed 100% if you accept the new assignment',
    time: '5 hours ago',
    read: true,
  },
];

export function EmployeeDashboard() {
  const [assignmentsList, setAssignmentsList] = useState(assignments);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [rescheduleReason, setRescheduleReason] = useState('');

  const handleAccept = (assignmentId: string) => {
    setAssignmentsList(
      assignmentsList.map((a) =>
        a.id === assignmentId ? { ...a, status: 'accepted' as const } : a
      )
    );
  };

  const handleReject = (assignmentId: string) => {
    setAssignmentsList(
      assignmentsList.map((a) =>
        a.id === assignmentId ? { ...a, status: 'rejected' as const } : a
      )
    );
  };

  const handleRequestReschedule = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setShowRescheduleModal(true);
  };

  const submitReschedule = () => {
    console.log('Reschedule requested for:', selectedAssignment?.id, 'Reason:', rescheduleReason);
    setShowRescheduleModal(false);
    setRescheduleReason('');
    setSelectedAssignment(null);
  };

  const totalWorkload = assignmentsList
    .filter((a) => a.status === 'accepted' || a.status === 'pending')
    .reduce((sum, a) => sum + a.workload, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">My Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">View and manage your project assignments</p>
      </div>

      {/* Workload Summary */}
      <div className="bg-gradient-to-br from-blue-500 to-green-500 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-blue-50 mb-1">Current Workload</p>
            <p className="text-4xl font-semibold">{totalWorkload}%</p>
          </div>
          <div className="p-4 bg-white/20 rounded-lg backdrop-blur">
            <Clock className="w-8 h-8" />
          </div>
        </div>
        <div className="w-full bg-white/20 rounded-full h-3 backdrop-blur">
          <div
            className={`h-3 rounded-full transition-all duration-300 ${totalWorkload <= 80 ? 'bg-white' : totalWorkload <= 100 ? 'bg-yellow-300' : 'bg-red-300'
              }`}
            style={{ width: `${Math.min(totalWorkload, 100)}%` }}
          ></div>
        </div>
        <p className="text-sm text-blue-50 mt-3">
          {totalWorkload <= 80
            ? 'Optimal workload - capacity available'
            : totalWorkload <= 100
              ? 'Near capacity - limited availability'
              : 'Overloaded - consider rejecting assignments'}
        </p>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-5 h-5 text-gray-700" />
          <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
          <span className="ml-auto text-xs text-white bg-red-500 rounded-full px-2 py-0.5 font-medium">
            {notifications.filter((n) => !n.read).length}
          </span>
        </div>
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg border transition-colors ${notification.read
                  ? 'bg-gray-50 border-gray-200'
                  : 'bg-blue-50 border-blue-200'
                }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`p-2 rounded-lg ${notification.type === 'assignment'
                      ? 'bg-blue-100 text-blue-600'
                      : notification.type === 'change'
                        ? 'bg-green-100 text-green-600'
                        : 'bg-red-100 text-red-600'
                    }`}
                >
                  {notification.type === 'assignment' ? (
                    <Calendar className="w-4 h-4" />
                  ) : notification.type === 'change' ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <AlertCircle className="w-4 h-4" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                  <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-2">{notification.time}</p>
                </div>
                {!notification.read && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Assignments */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">My Assignments</h3>
        {assignmentsList.map((assignment) => (
          <div
            key={assignment.id}
            className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="text-lg font-semibold text-gray-900">{assignment.projectName}</h4>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${assignment.priority === 'high'
                        ? 'bg-red-100 text-red-700'
                        : assignment.priority === 'medium'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                  >
                    {assignment.priority.toUpperCase()}
                  </span>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${assignment.status === 'pending'
                        ? 'bg-blue-100 text-blue-700'
                        : assignment.status === 'accepted'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                  >
                    {assignment.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-gray-600">Role: {assignment.role}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Timeline</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(assignment.startDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}{' '}
                  -{' '}
                  {new Date(assignment.endDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Duration</p>
                <p className="text-sm font-medium text-gray-900">
                  {Math.ceil(
                    (new Date(assignment.endDate).getTime() -
                      new Date(assignment.startDate).getTime()) /
                    (1000 * 60 * 60 * 24 * 7)
                  )}{' '}
                  weeks
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Workload</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${assignment.workload <= 80
                          ? 'bg-green-500'
                          : assignment.workload <= 100
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                      style={{ width: `${Math.min(assignment.workload, 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{assignment.workload}%</span>
                </div>
              </div>
            </div>

            {assignment.status === 'pending' && (
              <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleAccept(assignment.id)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Accept Assignment
                </button>
                <button
                  onClick={() => handleReject(assignment.id)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  Reject Assignment
                </button>
                <button
                  onClick={() => handleRequestReschedule(assignment)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Calendar className="w-4 h-4" />
                  Request Reschedule
                </button>
              </div>
            )}

            {assignment.status === 'accepted' && (
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="font-medium">Assignment accepted and added to your schedule</span>
                </div>
              </div>
            )}

            {assignment.status === 'rejected' && (
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2 text-sm text-red-600">
                  <XCircle className="w-4 h-4" />
                  <span className="font-medium">Assignment rejected</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Reschedule Modal */}
      {showRescheduleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Reschedule</h3>
            <p className="text-sm text-gray-600 mb-4">
              Please provide a reason for requesting a schedule change. Your manager will review
              and respond.
            </p>
            <textarea
              value={rescheduleReason}
              onChange={(e) => setRescheduleReason(e.target.value)}
              placeholder="Enter reason for reschedule request..."
              rows={4}
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none mb-4"
            ></textarea>
            <div className="flex items-center gap-3">
              <button
                onClick={submitReschedule}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Submit Request
              </button>
              <button
                onClick={() => {
                  setShowRescheduleModal(false);
                  setRescheduleReason('');
                }}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
