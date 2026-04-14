'use client';

import { useEffect, useMemo, useState } from 'react';
import { 
  AlertTriangle, 
  Folder, 
  Users 
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import Link from 'next/link';
import {
  fetchGeneralManagerContractDecisions,
  fetchGeneralManagerDecisions,
  fetchGeneralManagerWorkforceSummary,
  type GeneralManagerWorkforceSummary,
  type GeneralManagerContractDecision,
  type GeneralManagerDecision,
} from '@/functions/api/generalManager';
import { fetchHREmployeeCurrentProjectsMap, fetchHREmployeeList } from '@/functions/api/humanResource';
import type { GMAction, ResourceConflict } from '@/app/types';

const emptySummary: GeneralManagerWorkforceSummary = {
  totalEmployeeCount: 0,
  activeEmployeeCount: 0,
  averageAvailabilityPercent: 0,
  averageWorkloadPercent: 0,
  overloadedEmployeeCount: 0,
  topSkills: [],
};

const toDaysWaiting = (submittedAt: string) => {
  const parsed = new Date(submittedAt);

  if (Number.isNaN(parsed.getTime())) {
    return 0;
  }

  return Math.max(0, Math.floor((Date.now() - parsed.getTime()) / 86400000));
};

const getPriority = (daysWaiting: number, status: string) => {
  const normalizedStatus = status.toLowerCase();

  if (normalizedStatus.includes('pending') && daysWaiting >= 3) {
    return 'high';
  }

  if (normalizedStatus.includes('pending')) {
    return 'medium';
  }

  return 'low';
};

const mapDecisionToAction = (decision: GeneralManagerDecision): GMAction => {
  const daysWaiting = toDaysWaiting(decision.submittedAt);

  return {
    id: decision.id,
    type: decision.type.toLowerCase().includes('contract') ? 'contract' : 'approval',
    title: decision.title,
    submittedBy: decision.projectName || 'System',
    priority: getPriority(daysWaiting, decision.status),
    daysWaiting,
  };
};

const mapContractDecisionToConflict = (decision: GeneralManagerContractDecision): ResourceConflict | null => {
  if (decision.workloadPercent < 100 && decision.availabilityPercent > 20) {
    return null;
  }

  return {
    employee: decision.employeeName,
    allocation: decision.workloadPercent,
    projects: decision.activeAssignmentCount,
    status: decision.workloadPercent >= 130 ? 'critical' : 'warning',
  };
};


export function GMDashboard() {
  const [hasMounted, setHasMounted] = useState(false);
  const [pendingActions, setPendingActions] = useState<GMAction[]>([]);
  const [resourceConflicts, setResourceConflicts] = useState<ResourceConflict[]>([]);
  const [summary, setSummary] = useState<GeneralManagerWorkforceSummary>(emptySummary);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      const failedSections: string[] = [];

      const [summaryResult, decisionsResult, contractResult, employeeResult] = await Promise.allSettled([
        fetchGeneralManagerWorkforceSummary(),
        fetchGeneralManagerDecisions(),
        fetchGeneralManagerContractDecisions(),
        fetchHREmployeeList(),
      ]);

      if (!isMounted) {
        return;
      }

      if (summaryResult.status === 'fulfilled') {
        setSummary(summaryResult.value);
      } else {
        setSummary(emptySummary);
        failedSections.push('Workforce summary');
      }

      if (decisionsResult.status === 'fulfilled') {
        const mappedActions = decisionsResult.value
          .filter((decision) => decision.status.toLowerCase().includes('pending'))
          .map(mapDecisionToAction);
        setPendingActions(mappedActions);
      } else {
        setPendingActions([]);
        failedSections.push('Pending decisions');
      }

      if (employeeResult.status === 'fulfilled') {
        const currentProjectsMap = await fetchHREmployeeCurrentProjectsMap(
          employeeResult.value.map((employee) => employee.id)
        );

        const liveConflicts = employeeResult.value
          .filter((employee) => employee.workloadPercent > 100 || employee.availabilityPercent <= 20)
          .map((employee) => ({
            employee: employee.fullName,
            allocation: Math.round(employee.workloadPercent),
            projects: currentProjectsMap[employee.id]?.length ?? 0,
            status: employee.workloadPercent >= 130 ? 'critical' : 'warning',
          }));

        setResourceConflicts(liveConflicts);
      } else if (contractResult.status === 'fulfilled') {
        const mappedConflicts = contractResult.value
          .filter((decision) => decision.decisionStatus.toLowerCase().includes('pending'))
          .map(mapContractDecisionToConflict)
          .filter((item): item is ResourceConflict => item !== null);

        setResourceConflicts(mappedConflicts);
      } else {
        setResourceConflicts([]);
        failedSections.push('Resource conflicts');
      }

      setError(
        failedSections.length > 0
          ? `Backend data unavailable for: ${failedSections.join(', ')}.`
          : null
      );
      setIsLoading(false);
    };

    void loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const chartData = useMemo(() => {
    const activeRate = summary.totalEmployeeCount === 0
      ? 0
      : Math.round((summary.activeEmployeeCount / summary.totalEmployeeCount) * 100);

    return [
      { metric: 'Availability', utilization: Math.round(summary.averageAvailabilityPercent) },
      { metric: 'Workload', utilization: Math.round(summary.averageWorkloadPercent) },
      { metric: 'Active Rate', utilization: activeRate },
    ];
  }, [summary]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">General Manager Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Critical actions and resource overview</p>
        <p className="text-xs text-gray-500 mt-2">
          Workforce: {summary.activeEmployeeCount}/{summary.totalEmployeeCount} active • Overloaded: {summary.overloadedEmployeeCount}
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {error}
        </div>
      )}

      {isLoading && (
        <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-500 shadow-sm">
          Loading General Manager dashboard from backend...
        </div>
      )}

      {/* Priority Actions */}
      <div className="bg-linear-to-br from-red-500 to-orange-500 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 shrink-0 mt-1" />
          <div>
            <h2 className="text-xl font-semibold mb-1">Immediate Action Required</h2>
            <p className="text-red-50 text-sm mb-4">
              {pendingActions.filter(a => a.priority === 'high').length} high-priority items need your attention
            </p>
            <div className="space-y-2">
              {pendingActions.filter(a => a.priority === 'high').length === 0 ? (
                <div className="bg-white/20 backdrop-blur rounded-lg p-3 text-sm text-red-50">
                  No high-priority pending actions returned by backend.
                </div>
              ) : (
                pendingActions.filter(a => a.priority === 'high').map((action) => (
                  <div key={action.id} className="bg-white/20 backdrop-blur rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{action.title}</p>
                      <span className="text-xs bg-white/30 px-2 py-1 rounded">{action.daysWaiting}d waiting</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Resource Conflicts */}
      <div className="bg-white rounded-xl border-2 border-red-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 bg-red-50">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h2 className="text-lg font-semibold text-gray-900">Resource Conflicts Detected</h2>
          </div>
        </div>
        <div className="p-6 space-y-3">
          {resourceConflicts.length === 0 ? (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
              No active resource conflicts returned by backend.
            </div>
          ) : (
            resourceConflicts.map((conflict, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                <div>
                  <p className="font-semibold text-gray-900">{conflict.employee}</p>
                  <p className="text-sm text-gray-600">{conflict.projects} active projects</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-semibold text-red-600">{conflict.allocation}%</p>
                  <p className="text-xs text-red-600 font-medium uppercase">{conflict.status}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Pending Approvals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/gm/planning" className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <Folder className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Planning</h3>
          </div>
          <p className="text-3xl font-semibold text-gray-900 mb-1">
            {pendingActions.filter(a => a.type === 'approval').length}
          </p>
          <p className="text-sm text-gray-500">Projects awaiting approval</p>
        </Link>

        <Link href="/gm/decision-panel" className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <Users className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-gray-900">Contract Decisions</h3>
          </div>
          <p className="text-3xl font-semibold text-gray-900 mb-1">
            {pendingActions.filter(a => a.type === 'contract').length}
          </p>
          <p className="text-sm text-gray-500">Contracts pending decision</p>
        </Link>

        <Link href="/gm/resource-overview" className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <Users className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-gray-900">Resource Overview</h3>
          </div>
          <p className="text-3xl font-semibold text-gray-900 mb-1">
            {resourceConflicts.length}
          </p>
          <p className="text-sm text-gray-500">View-only resource status</p>
        </Link>
      </div>

      {/* Utilization Chart */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Workforce Metrics</h3>
        <div className="h-[200px] w-full">
          {hasMounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="metric" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="utilization" stroke="#3B82F6" strokeWidth={2} name="Utilization %" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full bg-gray-50 rounded flex items-center justify-center text-xs text-gray-400">
              Loading chart...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
