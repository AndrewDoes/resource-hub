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

  // Compute totals
  const pendingAssignments = summary?.pendingValidationsCount ?? 0;
  const pendingDirectives = summary?.pendingGmDecisionsCount ?? 0;
  // Note: We still calculate the count for the KPI, but we will filter the actual list below
  const combinedValidationCount = pendingAssignments + pendingDirectives;

  const recentAssignments = summary?.recentRequests ?? [];
  const recentDecisions = summary?.recentGmDecisions ?? [];

  // Logic to clean messy IDs and JSON strings
  const parseCleanContent = (text: string) => {
    if (!text) return "";
    if (text.includes('{')) {
      try {
        const jsonPart = text.substring(text.indexOf('{'));
        const parsed = JSON.parse(jsonPart);
        if (parsed.reasoning) return parsed.reasoning;
      } catch (e) { }
    }
    return text.replace(/\[.*?\]\s*/g, '').split(' {')[0].trim();
  };

  const allRecentActivity = [
    ...recentAssignments.map(r => ({
      ...r,
      employeeName: parseCleanContent(r.employeeName),
      label: 'Assignment',
      badgeColor: 'bg-green-100 text-green-700',
      internalStatus: r.hasConflict ? 'CLARIFICATION' : 'PENDING'
    })),
    ...recentDecisions.map(d => {
      let actionLabel = 'Directive';
      let badgeColor = 'bg-gray-100 text-gray-700';
      if (d.type.includes('Extend')) { actionLabel = 'Extension'; badgeColor = 'bg-purple-100 text-purple-700'; }
      else if (d.type.includes('Terminate')) { actionLabel = 'Termination'; badgeColor = 'bg-red-100 text-red-700 border border-red-200'; }
      else if (d.type.includes('Hire')) { actionLabel = 'Recruitment'; badgeColor = 'bg-blue-100 text-blue-700'; }
      else if (d.type.includes('Assignment')) { actionLabel = 'Executive Assignment'; badgeColor = 'bg-teal-100 text-teal-700'; }

      return {
        id: d.id,
        employeeName: parseCleanContent(d.details),
        projectName: d.status.toUpperCase(),
        internalStatus: d.status, // Store raw status for filtering
        hasConflict: false,
        daysWaiting: 0,
        label: actionLabel,
        badgeColor: badgeColor
      };
    })
  ]
    // FILTER: Remove EXECUTED and CLARIFICATIONREQUESTED
    .filter(item =>
      item.internalStatus !== 'EXECUTED' &&
      item.internalStatus !== 'CLARIFICATIONREQUESTED' &&
      item.projectName !== 'EXECUTED' &&
      item.projectName !== 'CLARIFICATIONREQUESTED'
    )
    .sort((a, b) => (b.daysWaiting || 0) - (a.daysWaiting || 0))
    .slice(0, 5);

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
                {allRecentActivity.length} active {allRecentActivity.length === 1 ? 'task' : 'tasks'} awaiting your attention
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/hr/hr-validation" className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex items-center gap-3 mb-3">
            <ClipboardCheck className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-gray-900">Validations</h3>
          </div>
          <p className="text-3xl font-semibold text-gray-900 mb-1">{isLoading ? '...' : allRecentActivity.length}</p>
          <p className="text-sm text-gray-500">Awaiting review</p>
        </Link>

        <Link href="/hr/employee-management" className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <Users className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Employees</h3>
          </div>
          <p className="text-3xl font-semibold text-gray-900 mb-1">{isLoading ? '...' : summary?.totalEmployeeCount ?? 0}</p>
          <p className="text-sm text-gray-500">Total workforce</p>
        </Link>

        <Link href="/hr/hiring" className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Active Hiring</p>
              <h3 className="text-2xl font-bold text-gray-900">{isLoading ? '...' : summary?.activeHiringRequestsCount ?? 0}</h3>
            </div>
          </div>
        </Link>

        <button onClick={() => setShowExpiringDetails(!showExpiringDetails)} className={`text-left bg-white rounded-xl p-6 border transition-all ${showExpiringDetails ? 'border-amber-400 ring-1 ring-amber-400 shadow-md' : 'border-gray-200 shadow-sm hover:shadow-md'}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3"><Clock className="w-5 h-5 text-red-600" /><h3 className="font-semibold text-gray-900">Expiring</h3></div>
            {showExpiringDetails ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
          </div>
          <p className="text-3xl font-semibold text-gray-900 mb-1">{isLoading ? '...' : summary?.expiringContractsCount ?? 0}</p>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Validation Requests</h2>
        </div>
        <div className="p-6 space-y-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 bg-gray-50 border border-gray-100 rounded-lg animate-pulse" />)
          ) : allRecentActivity.length === 0 ? (
            <p className="text-center py-8 text-gray-500 text-sm italic">No pending requests</p>
          ) : (
            allRecentActivity.map((validation, idx) => (
              <div key={validation.id + idx} className="flex items-center justify-between p-4 rounded-lg border bg-gray-50 border-gray-200">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900 line-clamp-1">{validation.employeeName}</p>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-tighter ${validation.badgeColor}`}>
                      {validation.label}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{validation.projectName}</p>
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