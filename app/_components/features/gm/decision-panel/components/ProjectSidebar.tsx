'use client';

import { ChevronRight } from 'lucide-react';
import { ProjectData } from '../types';
import { getStatusColor, getRiskColor } from '../utils';

interface ProjectSidebarProps {
  projects: ProjectData[];
  selectedProjectId: string | undefined;
  onSelect: (project: ProjectData) => void;
}

export function ProjectSidebar({ projects, selectedProjectId, onSelect }: ProjectSidebarProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sticky top-6">
      <h2 className="text-sm font-semibold text-gray-900 mb-4">Select Project</h2>
      <div className="space-y-3">
        {projects.map((project) => (
          <button
            key={project.id}
            onClick={() => onSelect(project)}
            className={`w-full text-left p-4 rounded-lg border-2 transition-all ${selectedProjectId === project.id
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
          >
            <div className="flex items-start justify-between mb-2">
              <p className="font-semibold text-gray-900 text-sm">{project.name}</p>
              <ChevronRight
                className={`w-4 h-4 shrink-0 transition-transform ${selectedProjectId === project.id
                  ? 'text-blue-600 translate-x-1'
                  : 'text-gray-400'
                  }`}
              />
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`w-2 h-2 rounded-full ${getStatusColor(project.status)}`}
              ></span>
              <span className="text-xs text-gray-600 capitalize">
                {project.status.replace('-', ' ')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-0.5 rounded text-xs font-medium ${getRiskColor(
                  project.riskLevel
                )}`}
              >
                {project.riskLevel.toUpperCase()}
              </span>
              <span className="text-xs text-gray-500">
                {project.assignedResources.length}/{project.requiredResources} resources
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
