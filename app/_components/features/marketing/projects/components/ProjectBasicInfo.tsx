'use client';

import { Calendar } from 'lucide-react';

interface ProjectBasicInfoProps {
  totalResources: number;
}

export function ProjectBasicInfo({ totalResources }: ProjectBasicInfoProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Project Name */}
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Project Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          placeholder="e.g., Q2 Marketing Campaign"
          className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>

      {/* Client Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Client Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          placeholder="e.g., Acme Corporation"
          className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>

      {/* Estimated Resources - Auto-calculated */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Total Resources Required
        </label>
        <div className="relative">
          <input
            type="number"
            value={totalResources}
            readOnly
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm cursor-not-allowed"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
            Auto-calculated
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Automatically calculated from resource requirements below
        </p>
      </div>

      {/* Timeline - Start Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Start Date <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type="date"
            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
      </div>

      {/* Timeline - End Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          End Date <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type="date"
            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
      </div>
    </div>
  );
}
