'use client';

import { CheckCircle, Info, TrendingUp, Clock, AlertTriangle } from 'lucide-react';
import { EmployeeStatus } from '../types';
import { calculateStatus } from '../utils';

interface WorkloadKPIsProps {
  employeeStatus: EmployeeStatus[];
}

export function WorkloadKPIs({ employeeStatus }: WorkloadKPIsProps) {
  // Calculate workload-based status counts using assigned hours
  const availableCount = employeeStatus.filter((e) => calculateStatus(e.assignedHours) === 'available').length;
  const moderateCount = employeeStatus.filter((e) => calculateStatus(e.assignedHours) === 'moderate').length;
  const busyCount = employeeStatus.filter((e) => calculateStatus(e.assignedHours) === 'busy').length;
  const overloadedCount = employeeStatus.filter((e) => calculateStatus(e.assignedHours) === 'overloaded').length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900">Current Resource Status</h2>
        <p className="text-xs text-gray-500">Live counts by workload category</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Available */}
        <div className="bg-white rounded-lg border-2 border-green-200 p-5 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="group relative">
              <Info className="w-4 h-4 text-gray-400 cursor-help" />
              <div className="absolute right-0 top-6 w-64 bg-gray-900 text-white text-xs rounded-lg p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 shadow-lg">
                Resource with workload below 40% (0-3.2 hours/day). Ready for new assignments.
              </div>
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{availableCount}</div>
          <div className="text-sm font-medium text-green-700">Available</div>
          <div className="text-xs text-gray-500 mt-1">0–40% (0–3.2h)</div>
        </div>

        {/* Moderate */}
        <div className="bg-white rounded-lg border-2 border-yellow-200 p-5 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="group relative">
              <Info className="w-4 h-4 text-gray-400 cursor-help" />
              <div className="absolute right-0 top-6 w-64 bg-gray-900 text-white text-xs rounded-lg p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 shadow-lg">
                Resource with moderate workload 41-70% (3.2-5.6 hours/day). Can handle small additional tasks.
              </div>
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{moderateCount}</div>
          <div className="text-sm font-medium text-yellow-700">Moderate</div>
          <div className="text-xs text-gray-500 mt-1">41–70% (3.2–5.6h)</div>
        </div>

        {/* Busy */}
        <div className="bg-white rounded-lg border-2 border-orange-200 p-5 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <div className="group relative">
              <Info className="w-4 h-4 text-gray-400 cursor-help" />
              <div className="absolute right-0 top-6 w-64 bg-gray-900 text-white text-xs rounded-lg p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 shadow-lg">
                Resource with high workload 71-100% (5.6-8 hours/day). At capacity, avoid new assignments.
              </div>
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{busyCount}</div>
          <div className="text-sm font-medium text-orange-700">Busy</div>
          <div className="text-xs text-gray-500 mt-1">71–100% (5.6–8h)</div>
        </div>

        {/* Overloaded */}
        <div className="bg-white rounded-lg border-2 border-red-200 p-5 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div className="group relative">
              <Info className="w-4 h-4 text-gray-400 cursor-help" />
              <div className="absolute right-0 top-6 w-64 bg-gray-900 text-white text-xs rounded-lg p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 shadow-lg">
                Resource assigned above daily capacity (&gt;100%, more than 8 hours/day). Immediate action required to rebalance.
              </div>
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{overloadedCount}</div>
          <div className="text-sm font-medium text-red-700">Overloaded</div>
          <div className="text-xs text-gray-500 mt-1">&gt;100% (&gt;8h)</div>
        </div>
      </div>
    </div>
  );
}
