import React from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { StatusBadge } from '@/app/_components/system/components/StatusBadge';

interface ProjectListProps {
  projects: any[];
  isLoading: boolean;
  error: string | null;
  title?: string;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  onProjectClick?: (project: any) => void;
}

export function ProjectList({ 
  projects, 
  isLoading, 
  error, 
  title = "My Projects",
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  onProjectClick
}: ProjectListProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      </div>
      <div className="p-6 space-y-3">
        {!isLoading && projects.length === 0 && !error && (
          <p className="text-sm text-gray-500 text-center py-4">No projects found.</p>
        )}
        {projects.map((project) => (
          <div 
            key={project.id} 
            className={`flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 ${onProjectClick ? 'cursor-pointer hover:bg-gray-100 transition-colors' : ''}`}
            onClick={() => onProjectClick?.(project)}
          >
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="font-semibold text-gray-900">{project.name}</h3>
                <StatusBadge status={project.status} />
              </div>
              <p className="text-sm text-gray-500">Last modified: {project.lastModified}</p>
              {project.feedback && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                  <span className="font-medium">Feedback:</span> {project.feedback}
                </div>
              )}
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400" />
          </div>
        ))}
        
        {/* Pagination Controls */}
        {!isLoading && projects.length > 0 && onPageChange && (
          <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-6 md:p-2">
            <span className="text-sm text-gray-500 font-medium">
              Page {currentPage} of {Math.max(1, totalPages)}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200 transition-colors"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages || totalPages === 0}
                className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200 transition-colors"
                aria-label="Next page"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
