'use client';

import { Users, UserCircle, Briefcase, AlertTriangle } from 'lucide-react';

interface EmployeeStatsProps {
  stats: {
    total: number;
    active: number;
    available: number;
    assigned: number;
    overloaded: number;
  };
}

export function EmployeeStats({ stats }: EmployeeStatsProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Total Employees</h3>
            <Users className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Active</h3>
            <UserCircle className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-2xl font-semibold text-gray-900">{stats.active}</p>
        </div>

        <div className="rounded-xl p-5 border border-green-200 bg-green-50 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-green-700">Available</h3>
            <UserCircle className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-semibold text-green-900">{stats.available}</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Assigned</h3>
            <Briefcase className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-2xl font-semibold text-gray-900">{stats.assigned}</p>
        </div>

        <div
          className={`rounded-xl p-5 border shadow-sm ${stats.overloaded > 0
            ? 'bg-red-50 border-red-200'
            : 'bg-white border-gray-200'
            }`}
        >
          <div className="flex items-center justify-between mb-2">
            <h3
              className={`text-sm font-medium ${stats.overloaded > 0 ? 'text-red-700' : 'text-gray-600'
                }`}
            >
              Overloaded
            </h3>
            <AlertTriangle
              className={`w-5 h-5 ${stats.overloaded > 0 ? 'text-red-600' : 'text-gray-400'
                }`}
            />
          </div>
          <p
            className={`text-2xl font-semibold ${stats.overloaded > 0 ? 'text-red-900' : 'text-gray-900'
              }`}
          >
            {stats.overloaded}
          </p>
        </div>
      </div>

      {stats.overloaded > 0 && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-red-900 mb-1">
                Resource Overload Warning
              </h3>
              <p className="text-sm text-red-700">
                {stats.overloaded} employee(s) are over-allocated (workload &gt; 100%). Review
                assignments to prevent burnout.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
