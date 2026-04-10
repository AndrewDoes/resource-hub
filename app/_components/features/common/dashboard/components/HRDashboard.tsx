'use client';

import { 
  ClipboardCheck, 
  Users, 
  AlertTriangle 
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { hrPendingValidations } from '@/app/_components/features/common/dashboard/data';
import { fetchHRDashboardSummary, HRDashboardSummary } from '@/functions/api/humanResource';


export function HRDashboard() {
  const [summary, setSummary] = useState<HRDashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSummary = async () => {
      try {
        setIsLoading(true);
        const data = await fetchHRDashboardSummary();
        setSummary(data);
      } catch (err) {
        console.error('Failed to load HR summary:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadSummary();
  }, []);

  const pendingValidationsCount = summary?.pendingValidationsCount ?? 0;
  const recentRequests = summary?.recentRequests ?? [];
  const conflictsCount = recentRequests.filter(r => r.hasConflict).length;
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">HR Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Manage resource validations and assignments</p>
      </div>

      <div className="bg-linear-to-br from-green-500 to-teal-500 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-start gap-4">
          <ClipboardCheck className="w-6 h-6 shrink-0 mt-1" />
          <div>
            <h2 className="text-xl font-semibold mb-1">Pending Validations</h2>
            {isLoading ? (
              <div className="h-6 w-32 bg-white/20 rounded animate-pulse" />
            ) : (
              <p className="text-green-50 text-sm mb-2">
                {pendingValidationsCount} assignments awaiting your approval
              </p>
            )}
            {!isLoading && conflictsCount > 0 && (
              <div className="bg-red-500/30 backdrop-blur rounded-lg p-3 mt-3">
                <p className="text-sm font-medium">⚠️ {conflictsCount} conflict(s) detected</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/hr/hr-validation" className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <ClipboardCheck className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-gray-900">Validation Queue</h3>
          </div>
          {isLoading ? (
            <div className="h-9 w-12 bg-gray-100 rounded animate-pulse" />
          ) : (
            <p className="text-3xl font-semibold text-gray-900 mb-1">{pendingValidationsCount}</p>
          )}
          <p className="text-sm text-gray-500">Assignments to review</p>
        </Link>

        <Link href="/hr/employee-management" className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <Users className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Employee Management</h3>
          </div>
          {isLoading ? (
            <div className="h-9 w-12 bg-gray-100 rounded animate-pulse" />
          ) : (
            <p className="text-3xl font-semibold text-gray-900 mb-1">{summary?.totalEmployeeCount ?? 0}</p>
          )}
          <p className="text-sm text-gray-500">Total employees</p>
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Validation Requests</h2>
        </div>
        <div className="p-6 space-y-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 bg-gray-50 border border-gray-100 rounded-lg animate-pulse" />
            ))
          ) : recentRequests.length === 0 ? (
            <p className="text-center py-8 text-gray-500 text-sm italic">No pending requests</p>
          ) : (
            recentRequests.map((validation) => (
              <div
                key={validation.id}
                className={`flex items-center justify-between p-4 rounded-lg border ${validation.hasConflict
                  ? 'bg-red-50 border-red-200'
                  : 'bg-gray-50 border-gray-200'
                  }`}
              >
                <div>
                  <p className="font-semibold text-gray-900">{validation.employeeName}</p>
                  <p className="text-sm text-gray-600">{validation.projectName}</p>
                  {validation.hasConflict && (
                    <span className="inline-flex items-center gap-1 mt-1 text-xs text-red-700 font-medium">
                      <AlertTriangle className="w-3 h-3" />
                      Conflict detected
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-500">{validation.daysWaiting}d waiting</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
