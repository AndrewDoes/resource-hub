'use client';

import { useRole } from "@/app/context/RoleContext";
import { GMDashboard } from "./components/GMDashboard";
import { MarketingDashboard } from "./components/MarketingDashboard";
import { HRDashboard } from "./components/HRDashboard";
import { EmployeeDashboardView } from "./components/EmployeeDashboardView";
import { PMDashboard } from "./components/PMDashboard";



export function Dashboard() {
  const { currentUser } = useRole();

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 text-sm">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  // Marketing Dashboard
  const currentRole = currentUser.role?.toLowerCase();

  if (currentRole === 'marketing') {
    return <MarketingDashboard />;
  }

  // GM Dashboard
  if (currentRole === 'gm') {
    return <GMDashboard />;
  }

  // PM Dashboard - Use new timeline dashboard
  if (currentRole === 'pm') {
    return <PMDashboard />;
  }

  // HR Dashboard
  if (currentRole === 'hr') {
    return <HRDashboard />;
  }

  // Employee Dashboard
  if (currentRole === 'employee') {
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
