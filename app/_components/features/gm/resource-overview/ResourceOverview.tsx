'use client';

import { useEffect, useMemo, useState } from 'react';
import { Lock, Info } from 'lucide-react';

// Types, Data and Utils
import { mockResources } from './data';
import {
  fetchGeneralManagerWorkforceSummary,
  generalManagerFallbackSummary,
  type GeneralManagerWorkforceSummary,
} from '@/functions/api/generalManager';

// Sub-components
import { ResourceStats } from './components/ResourceStats';
import { ResourceFilterBar } from './components/ResourceFilterBar';
import { ResourceTable } from './components/ResourceTable';


export function ResourceOverview() {
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [summary, setSummary] = useState<GeneralManagerWorkforceSummary>(generalManagerFallbackSummary);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadSummary = async () => {
      try {
        const response = await fetchGeneralManagerWorkforceSummary();

        if (!isMounted) {
          return;
        }

        setSummary(response);
        setError(null);
      } catch (loadError) {
        if (!isMounted) {
          return;
        }

        setSummary(generalManagerFallbackSummary);
        setError(loadError instanceof Error ? loadError.message : 'Failed to load workforce summary');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadSummary();

    return () => {
      isMounted = false;
    };
  }, []);

  // Filter resources
  const filteredResources = mockResources.filter((resource) => {
    const matchesSearch =
      searchQuery === '' ||
      resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.department.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDepartment =
      departmentFilter === 'all' || resource.department === departmentFilter;

    const matchesStatus = statusFilter === 'all' || resource.status === statusFilter;

    return matchesSearch && matchesDepartment && matchesStatus;
  });

  // Calculate stats
  const stats = useMemo(() => ({
    total: mockResources.length,
    available: mockResources.filter((r) => r.availability >= 80).length,
    moderate: mockResources.filter((r) => r.availability >= 50 && r.availability < 80)
      .length,
    busy: mockResources.filter((r) => r.availability > 0 && r.availability < 50).length,
    overloaded: mockResources.filter((r) => r.workload > 100).length,
    avgUtilization: Math.round(
      mockResources.reduce((acc, r) => acc + r.workload, 0) / mockResources.length
    ),
  }), []);

  const departments = Array.from(new Set(mockResources.map((r) => r.department)));

  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-semibold text-gray-900">Resource Overview</h1>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
            <Lock className="w-3 h-3" />
            Read-Only
          </span>
        </div>
        <p className="text-sm text-gray-500">
          Monitor resource allocation and availability across all projects
        </p>
        {error && (
          <p className="mt-2 text-sm text-amber-700">
            Showing local fallback data because the backend request failed: {error}
          </p>
        )}
        <div className="mt-3 flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-blue-700">
            <strong>Note:</strong> This is a read-only view. To manage employees (add, edit, or
            remove), please contact HR.
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <ResourceStats stats={stats} />

      <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Backend Workforce Summary</h3>
            <p className="text-xs text-gray-500">
              {isLoading ? 'Loading summary from the backend...' : 'Live GM summary data'}
            </p>
          </div>
          <div className="text-xs text-gray-500 text-right">
            <div>Employees: {summary.totalEmployeeCount}</div>
            <div>Active: {summary.activeEmployeeCount}</div>
            <div>Overloaded: {summary.overloadedEmployeeCount}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {summary.topSkills.slice(0, 3).map((skill) => (
            <div key={skill.skillId} className="rounded-lg border border-gray-200 p-4">
              <p className="text-sm font-medium text-gray-900">{skill.skillName}</p>
              <p className="text-xs text-gray-500">{skill.category}</p>
              <p className="mt-2 text-sm text-gray-700">
                {skill.employeeCount} employees • {skill.coveragePercent}% coverage
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Search and Filters */}
      <ResourceFilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        departmentFilter={departmentFilter}
        setDepartmentFilter={setDepartmentFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        departments={departments}
      />

      {/* Resource Table */}
      <ResourceTable resources={filteredResources} />
    </div>
  );
}
