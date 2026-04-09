'use client';

import { Calendar, Users, TrendingUp, Clock } from 'lucide-react';
import { ProjectData } from '../types';
import { getStatusColor, getRiskColor } from '../utils';

interface ProjectContextProps {
  project: ProjectData;
}

export function ProjectContext({ project }: ProjectContextProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Project Info</h3>
      <div className="space-y-3">
        <div>
          <p className="text-lg font-semibold text-gray-900">{project.name}</p>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`w-2.5 h-2.5 rounded-full ${getStatusColor(
                project.status
              )}`}
            ></span>
            <span className="text-sm text-gray-600 capitalize">
              {project.status.replace('-', ' ')}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-200">
          <div>
            <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Timeline</span>
            </div>
            <p className="text-sm font-medium text-gray-900">
              {new Date(project.startDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}{' '}
              -{' '}
              {new Date(project.endDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
              <Users className="w-3.5 h-3.5" />
              <span>Resources</span>
            </div>
            <p className="text-sm font-medium text-gray-900">
              {project.assignedResources.length} /{' '}
              {project.requiredResources}
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Status</span>
            </div>
            <span
              className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getRiskColor(
                project.riskLevel
              )}`}
            >
              {project.riskLevel.toUpperCase()} RISK
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Workload</span>
            </div>
            <p
              className={`text-sm font-medium ${project.resourceUtilization > 100
                  ? 'text-red-600'
                  : 'text-green-600'
                }`}
            >
              {project.resourceUtilization}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
