'use client';

import {
  ClipboardCheck,
  Users,
  AlertTriangle,
  Briefcase,
  Clock,
  ChevronDown,
  ChevronUp,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { fetchHRDashboardSummary, HRDashboardSummary } from '@/functions/api/humanResource';


export function HRDashboard() {
  const [summary, setSummary] = useState<HRDashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showExpiringDetails, setShowExpiringDetails] = useState(false);

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

  // Compute combined totals for the original UI slots
  const pendingAssignments = summary?.pendingValidationsCount ?? 0;
  const pendingDirectives = summary?.pendingGmDecisionsCount ?? 0;
  const pendingClarifications = summary?.pendingClarificationsCount ?? 0;

  // The "Validations" slot now covers everything needing HR attention
  const combinedValidationCount = pendingAssignments + pendingDirectives + pendingClarifications;

  const recentAssignments = summary?.recentRequests ?? [];
  const recentDecisions = summary?.recentGmDecisions ?? [];

  // Combine all activity into the single existing list with descriptive labels
  const allRecentActivity = [
    ...recentAssignments.map(r => ({
      ...r,
      label: 'Assignment',
      badgeColor: 'bg-green-100 text-green-700'
    })),
    ...recentDecisions.map(d => {
      let actionLabel = 'Directive';
      let title = d.details;
      let badgeColor = 'bg-gray-100 text-gray-700';

      // Map technical types to human-readable ones with distinct colors
      if (d.type.includes('Extend')) {
        actionLabel = 'Extension';
        badgeColor = 'bg-purple-100 text-purple-700';
      } else if (d.type.includes('Terminate')) {
        actionLabel = 'Termination';
        badgeColor = 'bg-red-100 text-red-700 border border-red-200';
      } else if (d.type.includes('Hire')) {
        actionLabel = 'Recruitment';
        badgeColor = 'bg-blue-100 text-blue-700';
      } else if (d.type.includes('Assignment')) {
        actionLabel = 'Executive Assignment';
        badgeColor = 'bg-teal-100 text-teal-700';
      }

      return {
        id: d.id,
        employeeName: title,
        projectName: d.status.toUpperCase(), // Show status for directives
        hasConflict: false,
        daysWaiting: 0,
        label: actionLabel,
        badgeColor: badgeColor
      };
    })
  ].sort((a, b) => (b.daysWaiting || 0) - (a.daysWaiting || 0)).slice(0, 5);

  const conflictsCount = recentAssignments.filter(r => r.hasConflict).length;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">HR Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Manage resource validations and assignments</p>
      </div>

      {/* Banner */}
      <div className="bg-linear-to-br from-green-500 to-teal-500 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-start gap-4">
          <ClipboardCheck className="w-6 h-6 shrink-0 mt-1" />
          <div>
            <h2 className="text-xl font-semibold mb-1">Pending Validations</h2>
            {isLoading ? (
              <div className="h-6 w-32 bg-white/20 rounded animate-pulse" />
            ) : (
              <p className="text-green-50 text-sm mb-2">
                {combinedValidationCount} {combinedValidationCount === 1 ? 'task' : 'tasks'} awaiting your attention
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

      {/* 4 KPI Grid (Original Layout) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Validation Queue */}
        <Link href="/hr/hr-validation" className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex items-center gap-3 mb-3">
            <ClipboardCheck className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-gray-900">Validations</h3>
          </div>
          {isLoading ? (
            <div className="h-9 w-12 bg-gray-100 rounded animate-pulse" />
          ) : (
            <p className="text-3xl font-semibold text-gray-900 mb-1">{combinedValidationCount}</p>
          )}
          <p className="text-sm text-gray-500">Awaiting review</p>
        </Link>

        {/* Employee Management */}
        <Link href="/hr/employee-management" className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <Users className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Employees</h3>
          </div>
          {isLoading ? (
            <div className="h-9 w-12 bg-gray-100 rounded animate-pulse" />
          ) : (
            <p className="text-3xl font-semibold text-gray-900 mb-1">{summary?.totalEmployeeCount ?? 0}</p>
          )}
          <p className="text-sm text-gray-500">Total active workforce</p>
        </Link>

        {/* Active Hiring */}
        <Link
          href="/hr/hiring"
          className="text-left bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Active Hiring</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {isLoading ? '...' : summary?.activeHiringRequestsCount ?? 0}
              </h3>
            </div>
          </div>
          <p className="mt-4 text-xs text-blue-600 font-medium flex items-center gap-1">
            View Hiring Pipeline <ArrowRight className="w-3 h-3" />
          </p>
        </Link>

        {/* Expiring Contracts Card */}
        <button
          onClick={() => setShowExpiringDetails(!showExpiringDetails)}
          className={`text-left bg-white rounded-xl p-6 border transition-all ${showExpiringDetails ? 'border-amber-400 ring-1 ring-amber-400 shadow-md' : 'border-gray-200 shadow-sm hover:shadow-md'}`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-red-600" />
              <h3 className="font-semibold text-gray-900">Expiring</h3>
            </div>
            {showExpiringDetails ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
          </div>
          {isLoading ? (
            <div className="h-9 w-12 bg-gray-100 rounded animate-pulse" />
          ) : (
            <p className="text-3xl font-semibold text-gray-900 mb-1">{summary?.expiringContractsCount ?? 0}</p>
          )}
          <p className="text-sm text-gray-500">Ending within 30 days</p>
        </button>
      </div>

      {/* Expiring Contracts Detail List (Lazy Loaded in UI) */}
      {showExpiringDetails && (
        <div className="bg-amber-50 rounded-xl border border-amber-200 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="px-6 py-4 border-b border-amber-200 bg-amber-100/50 flex justify-between items-center">
            <h3 className="font-semibold text-amber-900">Expiring Contracts Details</h3>
            <span className="text-xs font-medium bg-amber-200 text-amber-800 px-2 py-1 rounded-full uppercase tracking-wider">Attention Required</span>
          </div>
          <div className="p-6">
            {!summary?.expiringContracts || summary.expiringContracts.length === 0 ? (
              <p className="text-center py-4 text-amber-700 italic">No contracts expiring within the next 30 days.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {summary.expiringContracts.map((contract) => (
                  <div key={contract.employeeId} className="bg-white p-4 rounded-lg border border-amber-200 shadow-xs flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-gray-900">{contract.employeeName}</p>
                      <p className="text-xs text-red-600 font-medium mt-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Expires: {contract.endDate ? new Date(contract.endDate).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <Link
                      href="/hr/employee-management"
                      className="p-2 hover:bg-amber-50 rounded-full transition-colors group"
                      title="View in Employee Management"
                    >
                      <Users className="w-4 h-4 text-amber-600 group-hover:text-amber-700" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
            <p className="mt-4 text-[10px] text-amber-600 text-center uppercase tracking-widest font-bold">Actions must be taken from the Resource Management page</p>
          </div>
        </div>
      )}

      {/* Recent Activity (Original Layout) */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Validation Requests</h2>
        </div>
        <div className="p-6 space-y-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 bg-gray-50 border border-gray-100 rounded-lg animate-pulse" />
            ))
          ) : allRecentActivity.length === 0 ? (
            <p className="text-center py-8 text-gray-500 text-sm italic">No pending requests</p>
          ) : (
            allRecentActivity.map((validation, idx) => (
              <div
                key={validation.id + idx}
                className={`flex items-center justify-between p-4 rounded-lg border ${validation.hasConflict
                  ? 'bg-red-50 border-red-200'
                  : 'bg-gray-50 border-gray-200'
                  }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900 line-clamp-1">{validation.employeeName}</p>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-tighter ${validation.badgeColor || 'bg-gray-200 text-gray-600'}`}>
                      {validation.label}
                    </span>
                  </div>
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
