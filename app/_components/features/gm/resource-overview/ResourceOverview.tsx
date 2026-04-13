'use client';

import { useEffect, useMemo, useState } from 'react';
import { Lock, Info } from 'lucide-react';

// Types, Data and Utils
import type { ResourceSummary } from './types';
import {
  fetchGeneralManagerWorkforceSummary,
  type GeneralManagerWorkforceSummary,
} from '@/functions/api/generalManager';
import { fetchHREmployeeCurrentProjectsMap, fetchHREmployeeList } from '@/functions/api/humanResource';

// Sub-components
import { ResourceStats } from './components/ResourceStats';
import { ResourceFilterBar } from './components/ResourceFilterBar';
import { ResourceTable } from './components/ResourceTable';


export function ResourceOverview() {
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [resources, setResources] = useState<ResourceSummary[]>([]);
  const [summary, setSummary] = useState<GeneralManagerWorkforceSummary>({
    totalEmployeeCount: 0,
    activeEmployeeCount: 0,
    averageAvailabilityPercent: 0,
    averageWorkloadPercent: 0,
    overloadedEmployeeCount: 0,
    topSkills: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const uniqueResources = useMemo(() => {
    const seen = new Set<string>();

    return resources.filter((resource) => {
      if (seen.has(resource.id)) {
        return false;
      }

      seen.add(resource.id);
      return true;
    });
  }, [resources]);

  useEffect(() => {
    let isMounted = true;

    const loadSummary = async () => {
      const [summaryResult, employeesResult] = await Promise.allSettled([
        fetchGeneralManagerWorkforceSummary(),
        fetchHREmployeeList(),
      ]);

      if (!isMounted) {
        return;
      }

      if (summaryResult.status === 'fulfilled') {
        setSummary(summaryResult.value);
      } else {
        setSummary({
          totalEmployeeCount: 0,
          activeEmployeeCount: 0,
          averageAvailabilityPercent: 0,
          averageWorkloadPercent: 0,
          overloadedEmployeeCount: 0,
          topSkills: [],
        });
      }

      if (employeesResult.status === 'fulfilled') {
        const currentProjectsMap = await fetchHREmployeeCurrentProjectsMap(
          employeesResult.value.map((employee) => employee.id)
        );

        const mappedResources: ResourceSummary[] = employeesResult.value.map((employee) => {
          const normalizedName = employee.fullName.trim();
          const initials = normalizedName
            .split(' ')
            .filter((part) => part.length > 0)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase() ?? '')
            .join('');

          const workload = Math.max(0, Math.round(employee.workloadPercent));
          const status =
            workload > 100
              ? 'overloaded'
              : workload > 70
                ? 'busy'
                : workload > 40
                  ? 'moderate'
                  : 'available';

          return {
            id: employee.id,
            name: employee.fullName,
            avatar: initials || 'U',
            role: employee.jobTitle,
            department: employee.department ?? 'General',
            skills: employee.skills,
            availability: Math.max(0, Math.min(100, Math.round(employee.availabilityPercent))),
            workload,
            assignedHours: Math.max(0, Math.round(employee.assignedHours * 10) / 10),
            currentProjects: currentProjectsMap[employee.id] ?? [],
            status,
          };
        });

        const dedupedResources = Array.from(
          new Map(mappedResources.map((resource) => [resource.id, resource])).values()
        );

        setResources(dedupedResources);
      } else {
        setResources([]);
      }

      const hasError = summaryResult.status === 'rejected' || employeesResult.status === 'rejected';
      setError(
        hasError
            ? 'Some GM resource data failed to load from backend. Showing backend-returned fields only.'
          : null
      );
      setIsLoading(false);
    };

    void loadSummary();

    return () => {
      isMounted = false;
    };
  }, []);

  // Filter resources
  const filteredResources = uniqueResources.filter((resource) => {
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
    total: uniqueResources.length,
    available: uniqueResources.filter((r) => r.workload <= 40).length,
    moderate: uniqueResources.filter((r) => r.workload > 40 && r.workload <= 70).length,
    busy: uniqueResources.filter((r) => r.workload > 70 && r.workload <= 100).length,
    overloaded: uniqueResources.filter((r) => r.workload > 100).length,
    avgUtilization: Math.round(
      uniqueResources.length === 0 ? 0 : uniqueResources.reduce((acc, r) => acc + r.workload, 0) / uniqueResources.length
    ),
  }), [uniqueResources]);

  const departments = Array.from(new Set(uniqueResources.map((r) => r.department)));

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
          Monitor live backend resource allocation and availability across all projects
        </p>
        {error && (
          <p className="mt-2 text-sm text-amber-700">
            Backend data unavailable for resource overview: {error}
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
          {summary.topSkills.slice(0, 3).length === 0 ? (
            <div className="md:col-span-3 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
              No workforce summary skills were returned by the backend.
            </div>
          ) : (
            summary.topSkills.slice(0, 3).map((skill, index) => (
              <div key={`${skill.skillId}-${skill.skillName}-${index}`} className="rounded-lg border border-gray-200 p-4">
                <p className="text-sm font-medium text-gray-900">{skill.skillName}</p>
                <p className="text-xs text-gray-500">{skill.category}</p>
                <p className="mt-2 text-sm text-gray-700">
                  {skill.employeeCount} employees • {skill.coveragePercent}% coverage
                </p>
              </div>
            ))
          )}
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

      {filteredResources.length === 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-600 shadow-sm">
          No resources were returned by the backend.
        </div>
      )}
    </div>
  );
}
