'use client';

import { useRole } from '../../../context/RoleContext';
import { GMDashboard } from './GMDashboard';
import { MarketingDashboard } from './MarketingDashboard';
import { HRDashboard } from './HRDashboard';
import { EmployeeDashboardView } from './EmployeeDashboardView';
import { PMDashboard } from './PMDashboard';

export function Dashboard() {
  const { currentUser } = useRole();

  // Marketing Dashboard
  if (currentUser.role === 'marketing') {
    return <MarketingDashboard />;
  }

  // GM Dashboard
  if (currentUser.role === 'gm') {
    return <GMDashboard />;
  }

  // PM Dashboard - Use new timeline dashboard
  if (currentUser.role === 'pm') {
    return <PMDashboard />;
  }

  // HR Dashboard
  if (currentUser.role === 'hr') {
    return <HRDashboard />;
  }

  // Employee Dashboard
  if (currentUser.role === 'employee') {
    return <EmployeeDashboardView />;
  }

  // Default fallback (shouldn't reach here)
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Welcome to ResourceHub</p>
      </div>
    </div>
  );
}
