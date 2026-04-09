'use client';

import { CheckCircle, TrendingUp, Clock, AlertTriangle, Info } from 'lucide-react';

export function WorkloadStatusIndicator() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Workload Status Indicator</h2>
        <p className="text-sm text-gray-600">Understanding resource capacity and availability</p>
      </div>

      {/* Horizontal Legend Bar with Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Available */}
        <div className="group relative bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 rounded-lg p-4 hover:shadow-md transition-all cursor-help">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-sm font-bold text-green-900">Available</h3>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold text-green-800">Workload: 0% – 40%</p>
            <p className="text-xs font-semibold text-green-800">Hours: 0 – 3.2h</p>
          </div>
          <div className="absolute left-0 right-0 top-full mt-2 bg-gray-900 text-white text-xs rounded-lg p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 shadow-lg mx-2">
            Resource has low workload and is available for assignment
          </div>
        </div>

        {/* Moderate */}
        <div className="group relative bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-300 rounded-lg p-4 hover:shadow-md transition-all cursor-help">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-sm font-bold text-yellow-900">Moderate</h3>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold text-yellow-800">Workload: 41% – 70%</p>
            <p className="text-xs font-semibold text-yellow-800">Hours: 3.3 – 5.6h</p>
          </div>
          <div className="absolute left-0 right-0 top-full mt-2 bg-gray-900 text-white text-xs rounded-lg p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 shadow-lg mx-2">
            Resource has moderate workload and can still take tasks
          </div>
        </div>

        {/* Busy */}
        <div className="group relative bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-300 rounded-lg p-4 hover:shadow-md transition-all cursor-help">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-sm font-bold text-orange-900">Busy</h3>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold text-orange-800">Workload: 71% – 100%</p>
            <p className="text-xs font-semibold text-orange-800">Hours: 5.7 – 8h</p>
          </div>
          <div className="absolute left-0 right-0 top-full mt-2 bg-gray-900 text-white text-xs rounded-lg p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 shadow-lg mx-2">
            Resource is near full capacity
          </div>
        </div>

        {/* Overloaded */}
        <div className="group relative bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-400 rounded-lg p-4 hover:shadow-md transition-all cursor-help">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-sm font-bold text-red-900">Overloaded</h3>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold text-red-800">Workload: &gt; 100%</p>
            <p className="text-xs font-semibold text-red-800">Hours: &gt; 8h</p>
          </div>
          <div className="absolute left-0 right-0 top-full mt-2 bg-gray-900 text-white text-xs rounded-lg p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 shadow-lg mx-2">
            Resource is assigned more than daily capacity (over 8 hours/day)
          </div>
        </div>
      </div>

      {/* Capacity Note */}
      <div className="flex items-center justify-center gap-2 py-3 bg-blue-50 border border-blue-200 rounded-lg">
        <Info className="w-4 h-4 text-blue-600" />
        <p className="text-sm font-semibold text-blue-900">
          1 working day = 8 hours = 100% workload
        </p>
      </div>

      {/* Visual Bar Indicator */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-gray-700 text-center">Workload Scale</p>
        <div className="relative">
          <div className="flex h-8 rounded-lg overflow-hidden shadow-inner border-2 border-gray-300">
            <div className="flex-[40] bg-gradient-to-r from-green-400 to-green-500"></div>
            <div className="flex-[30] bg-gradient-to-r from-yellow-400 to-yellow-500"></div>
            <div className="flex-[30] bg-gradient-to-r from-orange-400 to-orange-500"></div>
            <div className="w-12 bg-gradient-to-r from-red-500 to-red-600"></div>
          </div>
          <div className="flex justify-between mt-2 text-xs font-semibold text-gray-700">
            <span className="text-green-700">0%</span>
            <span className="text-yellow-700" style={{ marginLeft: '-10px' }}>40%</span>
            <span className="text-orange-700" style={{ marginLeft: '-10px' }}>70%</span>
            <span className="text-red-700" style={{ marginLeft: '-15px' }}>100%</span>
            <span className="text-red-800">&gt;100%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
