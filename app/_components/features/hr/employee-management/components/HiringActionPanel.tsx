'use client';

import { UserPlus } from 'lucide-react';
import { HiringRequest } from '../types';

interface HiringActionPanelProps {
  hiringRequests: HiringRequest[];
  onStartHiring: (id: string) => void;
}

export function HiringActionPanel({ hiringRequests, onStartHiring }: HiringActionPanelProps) {
  const pendingHiring = hiringRequests.filter((h) => h.status === 'pending');

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-gray-700" />
          <h2 className="text-sm font-semibold text-gray-900">Hiring Action Panel</h2>
        </div>
        <p className="text-xs text-gray-500 mt-1">Triggered by GM Decision</p>
      </div>

      <div className="p-6 space-y-3">
        {pendingHiring.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <UserPlus className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            <p className="text-xs">No pending hiring requests</p>
          </div>
        ) : (
          pendingHiring.map((hiring) => (
            <div
              key={hiring.id}
              className="bg-blue-50 border border-blue-200 rounded-lg p-4"
            >
              <div className="mb-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{hiring.role}</h3>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                    Quantity: {hiring.quantity}
                  </span>
                </div>
                <p className="text-xs text-gray-600">Project: {hiring.projectName}</p>
              </div>

              <div className="mb-4 p-3 bg-white rounded-lg">
                <p className="text-xs font-semibold text-gray-700 mb-2">
                  Required Skills:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {hiring.skillRequirements.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => onStartHiring(hiring.id)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                <UserPlus className="w-4 h-4" />
                Start Hiring Process
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
