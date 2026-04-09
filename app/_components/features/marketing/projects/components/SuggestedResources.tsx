'use client';

import { Lightbulb } from 'lucide-react';
import { SuggestedEmployee } from '../types';

interface SuggestedResourcesProps {
  suggestedEmployees: SuggestedEmployee[];
}

export function SuggestedResources({
  suggestedEmployees,
}: SuggestedResourcesProps) {
  if (suggestedEmployees.length === 0) return null;

  return (
    <div className="bg-linear-to-br from-blue-50 to-green-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb className="w-5 h-5 text-blue-600" />
        <h4 className="text-sm font-semibold text-gray-900">
          Recommended Employees Based on Skills
        </h4>
      </div>
      <p className="text-xs text-gray-600 mb-3">
        These employees match your required skills (for reference only)
      </p>
      <div className="space-y-2">
        {suggestedEmployees.map((employee) => (
          <div
            key={employee.name}
            className="bg-white border border-blue-200 rounded-lg p-3 flex items-center justify-between"
          >
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{employee.name}</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {employee.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <div className="text-right ml-3">
              <span className="text-sm font-semibold text-green-600">
                {employee.match}% match
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
