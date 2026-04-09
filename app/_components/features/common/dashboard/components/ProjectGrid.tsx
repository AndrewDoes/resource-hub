'use client';

import { AlertTriangle, Calendar, Users } from 'lucide-react';
import { TimelineProject } from '@/app/_components/features/common/dashboard/types';

interface ProjectGridProps {
  projects: TimelineProject[];
  onProjectClick: (projectId: string) => void;
}

export function ProjectGrid({ projects, onProjectClick }: ProjectGridProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {projects.map((project) => (
        <div
          key={project.id}
          className={`bg-white rounded-xl border shadow-sm p-5 hover:shadow-md transition-shadow cursor-pointer ${project.hasConflict ? 'border-red-200 bg-red-50/30' : 'border-gray-200'
            }`}
          onClick={() => onProjectClick(project.id)}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-gray-900">{project.name}</h3>
                {project.hasConflict && (
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                )}
              </div>
              <p className="text-sm text-gray-600">{project.description}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600 font-medium">Progress</span>
              <span className="text-gray-900 font-semibold">{project.progress}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${project.status === 'completed' ? 'bg-green-500' :
                  project.status === 'in-progress' ? 'bg-blue-500' :
                    'bg-purple-500'
                  }`}
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </div>

          {/* Dates and Team */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>
                  {new Date(project.startDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                  })}
                  {' - '}
                  {new Date(project.endDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-600">
                <Users className="w-4 h-4" />
                <span>{project.teamMembers.length} members</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
