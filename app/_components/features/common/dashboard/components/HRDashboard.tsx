'use client';

import { 
  ClipboardCheck, 
  Users, 
  AlertTriangle 
} from 'lucide-react';
import Link from 'next/link';
import { hrPendingValidations } from '@/app/_components/features/common/dashboard/data';


export function HRDashboard() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">HR Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Manage resource validations and assignments</p>
      </div>

      {/* Pending Validations */}
      <div className="bg-linear-to-br from-green-500 to-teal-500 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-start gap-4">
          <ClipboardCheck className="w-6 h-6 shrink-0 mt-1" />
          <div>
            <h2 className="text-xl font-semibold mb-1">Pending Validations</h2>
            <p className="text-green-50 text-sm mb-2">
              {hrPendingValidations.length} assignments awaiting your approval
            </p>
            {hrPendingValidations.filter(v => v.hasConflict).length > 0 && (
              <div className="bg-red-500/30 backdrop-blur rounded-lg p-3 mt-3">
                <p className="text-sm font-medium">⚠️ {hrPendingValidations.filter(v => v.hasConflict).length} conflict(s) detected</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/hr/hr-validation" className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <ClipboardCheck className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-gray-900">Validation Queue</h3>
          </div>
          <p className="text-3xl font-semibold text-gray-900 mb-1">{hrPendingValidations.length}</p>
          <p className="text-sm text-gray-500">Assignments to review</p>
        </Link>

        <Link href="/hr/employee-management" className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <Users className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Employee Management</h3>
          </div>
          <p className="text-3xl font-semibold text-gray-900 mb-1">48</p>
          <p className="text-sm text-gray-500">Total employees</p>
        </Link>
      </div>

      {/* Recent Validations */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Validation Requests</h2>
        </div>
        <div className="p-6 space-y-3">
          {hrPendingValidations.map((validation) => (
            <div
              key={validation.id}
              className={`flex items-center justify-between p-4 rounded-lg border ${validation.hasConflict
                ? 'bg-red-50 border-red-200'
                : 'bg-gray-50 border-gray-200'
                }`}
            >
              <div>
                <p className="font-semibold text-gray-900">{validation.employee}</p>
                <p className="text-sm text-gray-600">{validation.project}</p>
                {validation.hasConflict && (
                  <span className="inline-flex items-center gap-1 mt-1 text-xs text-red-700 font-medium">
                    <AlertTriangle className="w-3 h-3" />
                    Conflict detected
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-500">{validation.daysWaiting}d waiting</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
