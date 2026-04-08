'use client';

import { 
  Clock, 
  CheckCircle 
} from 'lucide-react';
import { employeeAssignments } from '../../../data/dashboard';
import { StatusBadge } from '../../common/StatusBadge';

export function EmployeeDashboardView() {
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
