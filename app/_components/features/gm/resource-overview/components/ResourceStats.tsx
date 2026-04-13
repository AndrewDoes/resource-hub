'use client';

import { Users, AlertTriangle, TrendingUp } from 'lucide-react';

interface ResourceStatsProps {
  stats: {
    total: number;
    available: number;
    moderate: number;
    busy: number;
    overloaded: number;
    avgUtilization: number;
  };
}

export function ResourceStats({ stats }: ResourceStatsProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Total Resources</h3>
            <Users className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-green-200 bg-green-50 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-green-700">Available</h3>
            <Users className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-semibold text-green-900">{stats.available}</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-yellow-200 bg-yellow-50 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-yellow-700">Moderate</h3>
            <Users className="w-5 h-5 text-yellow-600" />
          </div>
          <p className="text-2xl font-semibold text-yellow-900">{stats.moderate}</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-orange-200 bg-orange-50 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-orange-700">Busy</h3>
            <Users className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-2xl font-semibold text-orange-900">{stats.busy}</p>
        </div>

        <div
          className={`rounded-xl p-5 border shadow-sm ${stats.overloaded > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'
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

        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Avg Utilization</h3>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-2xl font-semibold text-gray-900">{stats.avgUtilization}%</p>
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
                {stats.overloaded}{' '}resource(s) are over-allocated (workload &gt; 100%). Consider
                adjusting project timelines or reallocating resources. Contact HR for resource
                reallocation.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
