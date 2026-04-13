'use client';

import React from 'react';
import { HiringKanban } from '@/app/_components/features/hr/hiring/HiringKanban';
import { UserPlus, Info } from 'lucide-react';

export default function HiringPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Hiring Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            Visual pipeline for tracking recruitment processes and onboarding successful candidates.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg flex items-center gap-2 font-medium text-sm">
            <UserPlus className="w-5 h-5" />
            <span>Active Pipeline</span>
          </div>
        </div>
      </div>

      {/* Info Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 items-start">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800">
          <p className="font-semibold mb-1">Hiring Workflow Tip</p>
          <p>
            Move cards through the stages as you find and interview candidates. Once a candidate is ready, 
            click <strong>Onboard Candidate</strong> in the Offering stage to register them as a new employee.
          </p>
        </div>
      </div>

      {/* Kanban Board */}
      <HiringKanban />
    </div>
  );
}
