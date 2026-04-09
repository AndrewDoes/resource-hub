'use client';

import { useState } from 'react';
import { Lock, Info } from 'lucide-react';

// Types, Data and Utils
import { ResourceSummary } from '../types';
import { mockResources } from '../data';
import { calculateWorkloadFromHours } from '../utils';

// Sub-components
import { ResourceStats } from '../components/ResourceStats';
import { ResourceFilterBar } from '../components/ResourceFilterBar';
import { ResourceTable } from '../components/ResourceTable';


export function ResourceOverview() {
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

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
  const stats = {
    total: mockResources.length,
    available: mockResources.filter((r) => r.availability >= 80).length,
    moderate: mockResources.filter((r) => r.availability >= 50 && r.availability < 80)
      .length,
    busy: mockResources.filter((r) => r.availability > 0 && r.availability < 50).length,
    overloaded: mockResources.filter((r) => r.workload > 100).length,
    avgUtilization: Math.round(
      mockResources.reduce((acc, r) => acc + r.workload, 0) / mockResources.length
    ),
  };

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
