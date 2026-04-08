'use client';
import React, { useState } from 'react';
import { Calendar, Users, AlertTriangle, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { StatusBadge, ProjectStatus } from './WorkflowSystem';

export interface TimelineProject {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  progress: number;
  status: ProjectStatus;
  teamMembers: string[];
  description: string;
  hasConflict?: boolean;
  conflictMessage?: string;
  phase?: 'planning' | 'execution' | 'review' | 'delivery';
}

interface GanttTimelineProps {
  projects: TimelineProject[];
  viewMode: 'week' | 'month';
  onViewModeChange: (mode: 'week' | 'month') => void;
  onProjectClick?: (projectId: string) => void;
}

export function GanttTimeline({ projects, viewMode, onViewModeChange, onProjectClick }: GanttTimelineProps) {
  const [hoveredProject, setHoveredProject] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Calculate timeline range
  const getTimelineRange = () => {
    const today = new Date();
    const startOfRange = new Date(today);
    startOfRange.setDate(1);

    if (viewMode === 'week') {
      // Show 8 weeks
      const columns = 8;
      const weeks = [];
      for (let i = 0; i < columns; i++) {
        const weekStart = new Date(startOfRange);
        weekStart.setDate(startOfRange.getDate() + (i * 7));
        weeks.push(weekStart);
      }
      return weeks;
    } else {
      // Show 6 months
      const columns = 6;
      const months = [];
      for (let i = 0; i < columns; i++) {
        const monthStart = new Date(startOfRange);
        monthStart.setMonth(startOfRange.getMonth() + i);
        months.push(monthStart);
      }
      return months;
    }
  };

  const timelineColumns = getTimelineRange();
  const totalDays = viewMode === 'week' ? 8 * 7 : 6 * 30;
  const startRangeDate = timelineColumns[0];

  // Calculate project position and width
  const getProjectPosition = (project: TimelineProject) => {
    const projectStart = new Date(project.startDate);
    const projectEnd = new Date(project.endDate);
    const rangeStart = startRangeDate;

    const daysFromStart = Math.floor((projectStart.getTime() - rangeStart.getTime()) / (1000 * 60 * 60 * 24));
    const projectDuration = Math.floor((projectEnd.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24));

    const leftPercent = Math.max(0, (daysFromStart / totalDays) * 100);
    const widthPercent = Math.min(100 - leftPercent, (projectDuration / totalDays) * 100);

    return { left: leftPercent, width: widthPercent };
  };

  // Get status color
  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'in-progress':
        return 'bg-blue-500';
      case 'assigned':
        return 'bg-purple-500';
      case 'approved':
        return 'bg-teal-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getPhaseColor = (phase?: string) => {
    switch (phase) {
      case 'planning':
        return 'bg-yellow-100 text-yellow-800';
      case 'execution':
        return 'bg-blue-100 text-blue-800';
      case 'review':
        return 'bg-purple-100 text-purple-800';
      case 'delivery':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: Date) => {
    if (viewMode === 'week') {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    }
  };

  const navigateTime = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (viewMode === 'week') {
      newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    setCurrentDate(newDate);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      {/* Timeline Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Project Timeline</h3>
        </div>

        <div className="flex items-center gap-3">
          {/* Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateTime('prev')}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => navigateTime('next')}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => onViewModeChange('week')}
              className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${viewMode === 'week' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              Week
            </button>
            <button
              onClick={() => onViewModeChange('month')}
              className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${viewMode === 'month' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              Month
            </button>
          </div>
        </div>
      </div>

      {/* Timeline Grid */}
      <div className="p-6 overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Timeline Header with Dates */}
          <div className="flex mb-4">
            <div className="w-64 flex-shrink-0" />
            <div className="flex-1 grid" style={{ gridTemplateColumns: `repeat(${timelineColumns.length}, 1fr)` }}>
              {timelineColumns.map((date, index) => (
                <div key={index} className="text-center border-l border-gray-200 px-2">
                  <div className="text-xs font-medium text-gray-600">{formatDate(date)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Project Rows */}
          <div className="space-y-3">
            {projects.map((project) => {
              const position = getProjectPosition(project);
              const isHovered = hoveredProject === project.id;

              return (
                <div key={project.id} className="flex items-center group">
                  {/* Project Info */}
                  <div className="w-64 flex-shrink-0 pr-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gray-900 text-sm truncate">{project.name}</h4>
                        {project.hasConflict && (
                          <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={project.status} showLabel={false} />
                        {project.phase && (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getPhaseColor(project.phase)}`}>
                            {project.phase}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Users className="w-3 h-3" />
                        <span>{project.teamMembers.length} members</span>
                      </div>
                    </div>
                  </div>

                  {/* Timeline Bar Container */}
                  <div className="flex-1 relative h-16">
                    {/* Grid Lines */}
                    <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${timelineColumns.length}, 1fr)` }}>
                      {timelineColumns.map((_, index) => (
                        <div key={index} className="border-l border-gray-200" />
                      ))}
                    </div>

                    {/* Project Bar */}
                    <div
                      className={`absolute top-1/2 -translate-y-1/2 h-10 rounded-lg cursor-pointer transition-all ${project.hasConflict ? 'ring-2 ring-red-400' : ''
                        } ${isHovered ? 'scale-105 shadow-lg z-10' : 'shadow'}`}
                      style={{
                        left: `${position.left}%`,
                        width: `${position.width}%`,
                      }}
                      onMouseEnter={() => setHoveredProject(project.id)}
                      onMouseLeave={() => setHoveredProject(null)}
                      onClick={() => onProjectClick?.(project.id)}
                    >
                      {/* Background with status color */}
                      <div className={`absolute inset-0 ${getStatusColor(project.status)} opacity-20 rounded-lg`} />

                      {/* Progress Bar */}
                      <div
                        className={`absolute inset-0 ${getStatusColor(project.status)} rounded-lg`}
                        style={{ width: `${project.progress}%` }}
                      />

                      {/* Bar Content */}
                      <div className="absolute inset-0 px-3 flex items-center justify-between text-xs font-medium text-gray-900">
                        <span className="truncate">{project.progress}%</span>
                        {isHovered && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span className="text-xs">
                              {Math.ceil((new Date(project.endDate).getTime() - new Date(project.startDate).getTime()) / (1000 * 60 * 60 * 24))}d
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Hover Tooltip */}
                      {isHovered && (
                        <div className="absolute top-full mt-2 left-0 bg-gray-900 text-white p-3 rounded-lg shadow-xl z-20 min-w-[280px]">
                          <div className="space-y-2">
                            <div>
                              <p className="font-semibold">{project.name}</p>
                              <p className="text-xs text-gray-300 mt-1">{project.description}</p>
                            </div>
                            <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-700">
                              <div>
                                <p className="text-gray-400">Start</p>
                                <p className="font-medium">{new Date(project.startDate).toLocaleDateString()}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-gray-400">End</p>
                                <p className="font-medium">{new Date(project.endDate).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <div className="pt-2 border-t border-gray-700">
                              <p className="text-xs text-gray-400 mb-1">Team Members</p>
                              <div className="flex flex-wrap gap-1">
                                {project.teamMembers.map((member, idx) => (
                                  <span key={idx} className="text-xs bg-gray-800 px-2 py-1 rounded">
                                    {member}
                                  </span>
                                ))}
                              </div>
                            </div>
                            {project.hasConflict && (
                              <div className="pt-2 border-t border-red-800 flex items-start gap-2">
                                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                                <div>
                                  <p className="text-xs font-semibold text-red-400">Conflict Detected</p>
                                  <p className="text-xs text-red-300 mt-1">{project.conflictMessage}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {projects.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No Projects in Timeline</h3>
              <p className="text-sm text-gray-500">Projects assigned to you will appear here</p>
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded" />
            <span className="text-gray-600">Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded" />
            <span className="text-gray-600">In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded" />
            <span className="text-gray-600">Assigned</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-3 h-3 text-red-500" />
            <span className="text-gray-600">Resource Conflict</span>
          </div>
        </div>
      </div>
    </div>
  );
}
