'use client';
import { useState } from 'react';
import { Briefcase, CheckCircle, XCircle, Clock, Calendar, Users } from 'lucide-react';

interface ProjectAssignment {
  id: string;
  projectName: string;
  role: string;
  startDate: string;
  endDate: string;
  allocation: number;
  assignedBy: string;
  status: 'pending' | 'accepted' | 'declined';
  description: string;
}

const mockAssignments: ProjectAssignment[] = [
  {
    id: '1',
    projectName: 'Website Redesign',
    role: 'Frontend Developer',
    startDate: '2026-04-15',
    endDate: '2026-07-15',
    allocation: 100,
    assignedBy: 'Emily Chen (HR)',
    status: 'pending',
    description: 'Lead frontend development for company website redesign project with React and Tailwind CSS',
  },
  {
    id: '2',
    projectName: 'Mobile App Development',
    role: 'Frontend Developer',
    startDate: '2026-06-01',
    endDate: '2026-09-30',
    allocation: 80,
    assignedBy: 'Emily Chen (HR)',
    status: 'pending',
    description: 'Develop mobile application UI components using React Native',
  },
  {
    id: '3',
    projectName: 'Marketing Campaign Q2',
    role: 'Developer',
    startDate: '2026-03-01',
    endDate: '2026-05-31',
    allocation: 100,
    assignedBy: 'Emily Chen (HR)',
    status: 'accepted',
    description: 'Build landing pages and marketing tools for Q2 campaigns',
  },
];

export function MyProjects() {
  const [assignments, setAssignments] = useState<ProjectAssignment[]>(mockAssignments);

  const handleAccept = (id: string) => {
    setAssignments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'accepted' } : a))
    );
  };

  const handleDecline = (id: string) => {
    setAssignments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'declined' } : a))
    );
  };

  const pendingAssignments = assignments.filter((a) => a.status === 'pending');
  const acceptedAssignments = assignments.filter((a) => a.status === 'accepted');

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">My Projects</h1>
        <p className="text-sm text-gray-500 mt-1">
          View and manage your project assignments
        </p>
      </div>

      {/* Summary Card */}
      <div className="bg-gradient-to-br from-orange-500 to-yellow-500 rounded-xl p-6 text-white shadow-lg">
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
                  <p className="text-sm text-gray-600 mt-1">{assignment.description}</p>
                </div>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium whitespace-nowrap">
                  AWAITING RESPONSE
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Your Role</p>
                  <p className="text-sm text-gray-900 font-medium">{assignment.role}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Duration</p>
                  <div className="flex items-center gap-1 text-sm text-gray-900 font-medium">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    3 months
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Start Date</p>
                  <p className="text-sm text-gray-900 font-medium">{assignment.startDate}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Allocation</p>
                  <p className="text-sm text-gray-900 font-medium">{assignment.allocation}%</p>
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
                <button
                  onClick={() => handleDecline(assignment.id)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 active:bg-gray-800 transition-all shadow-sm hover:shadow-md text-sm font-medium"
                >
                  <XCircle className="w-4 h-4" />
                  Decline
                </button>
                <p className="text-sm text-gray-600 ml-auto">
                  Assigned by <span className="font-medium">{assignment.assignedBy}</span>
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
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{assignment.projectName}</h3>
                  <p className="text-sm text-gray-600 mt-1">{assignment.description}</p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium whitespace-nowrap">
                  ACTIVE
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Your Role</p>
                  <p className="text-sm text-gray-900 font-medium">{assignment.role}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Progress</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div className="h-2 bg-green-500 rounded-full" style={{ width: '65%' }}></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">65%</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">End Date</p>
                  <p className="text-sm text-gray-900 font-medium">{assignment.endDate}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Allocation</p>
                  <p className="text-sm text-gray-900 font-medium">{assignment.allocation}%</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="p-4 bg-gray-100 rounded-full w-fit mx-auto mb-4">
              <Briefcase className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-900 mb-1">No Active Projects</p>
            <p className="text-xs text-gray-500">
              You'll see your active projects here once you accept assignments
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
