'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Settings, MessageSquare, RefreshCw, GitBranch } from 'lucide-react';
import { useFeedbackToast } from '@/app/context/ToastContext';


// Components
import { GanttTimeline } from './GanttTimeline';
import { SmartFilters, FilterOptions } from '@/app/_components/common/SmartFilters';
import { DashboardStats } from './DashboardStats';
import { ProjectGrid } from './ProjectGrid';


// Types, Data, Utils
import { TimelineProject } from '@/app/_components/features/common/dashboard/types';
import { mockProjects, mockEmployees, statsData } from '@/app/_components/features/common/dashboard/data';
import { convertToIntelligenceProjects } from '@/app/_components/features/common/dashboard/utils';
import { ResourcePlanningSystem, ResourceConflict, SystemSuggestion, SystemAlert } from '@/app/_components/system/SystemIntelligence';


export function PMDashboard() {
  const { addToast } = useFeedbackToast();
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    status: 'all',
    dateRange: 'all',
    sortBy: 'startDate',
    sortOrder: 'asc',
  });

  const [filteredProjects, setFilteredProjects] = useState<TimelineProject[]>(mockProjects);
  const [detectedConflicts, setDetectedConflicts] = useState<ResourceConflict[]>([]);

  // Run conflict detection on mount and when projects change
  useEffect(() => {
    const intelligenceProjects = convertToIntelligenceProjects(mockProjects, mockEmployees);
    const conflicts = ResourcePlanningSystem.detectConflicts(intelligenceProjects, mockEmployees);

    // Generate recommendations for each conflict
    const conflictsWithSuggestions = conflicts.map((conflict) => ({
      ...conflict,
      suggestions: ResourcePlanningSystem.generateRecommendations(
        conflict,
        mockEmployees,
        intelligenceProjects
      ),
    }));

    setDetectedConflicts(conflictsWithSuggestions);
  }, []);

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);

    let filtered = [...mockProjects];

    // Search filter
    if (newFilters.search) {
      const searchLower = newFilters.search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower) ||
          p.teamMembers.some((m) => m.toLowerCase().includes(searchLower))
      );
    }

    // Status filter
    if (newFilters.status !== 'all') {
      filtered = filtered.filter((p) => p.status === newFilters.status);
    }

    // Date range filter
    if (newFilters.dateRange !== 'all') {
      const today = new Date();
      const filterDate = new Date(today);

      switch (newFilters.dateRange) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          filtered = filtered.filter(
            (p) =>
              new Date(p.startDate) <= filterDate &&
              new Date(p.endDate) >= filterDate
          );
          break;
        case 'week':
          filterDate.setDate(today.getDate() + 7);
          filtered = filtered.filter((p) => new Date(p.endDate) <= filterDate);
          break;
        case 'month':
          filterDate.setMonth(today.getMonth() + 1);
          filtered = filtered.filter((p) => new Date(p.endDate) <= filterDate);
          break;
      }
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue: any = a[newFilters.sortBy as keyof TimelineProject];
      let bValue: any = b[newFilters.sortBy as keyof TimelineProject];

      if (newFilters.sortBy === 'startDate' || newFilters.sortBy === 'endDate') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (newFilters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredProjects(filtered);
  };

  const handleProjectClick = (projectId: string) => {
    console.log('Project clicked:', projectId);
  };

  const handleApplySuggestion = (suggestion: SystemSuggestion) => {
    addToast({
      type: 'success',
      title: 'Suggestion Applied',
      message: `${suggestion.title} has been applied. Changes are pending GM approval.`,
    });
  };

  const handleRequestChange = () => {
    addToast({
      type: 'info',
      title: 'Change Request Sent',
      message: 'Your resource change request has been sent to the General Manager for review.',
    });
  };

  const handleSendFeedback = () => {
    addToast({
      type: 'info',
      title: 'Feedback Sent',
      message: 'Your feedback has been sent to the General Manager.',
    });
  };

  const handleRefreshConflicts = () => {
    const intelligenceProjects = convertToIntelligenceProjects(mockProjects, mockEmployees);
    const conflicts = ResourcePlanningSystem.detectConflicts(intelligenceProjects, mockEmployees);

    const conflictsWithSuggestions = conflicts.map((conflict) => ({
      ...conflict,
      suggestions: ResourcePlanningSystem.generateRecommendations(
        conflict,
        mockEmployees,
        intelligenceProjects
      ),
    }));

    setDetectedConflicts(conflictsWithSuggestions);
    addToast({
      type: 'success',
      title: 'Conflicts Refreshed',
      message: `System detected ${conflictsWithSuggestions.length} resource conflict(s).`,
    });
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Project Timeline</h1>
          <p className="text-gray-600">
            Monitor project progress, resource allocation, and detect scheduling conflicts
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/workflow"
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors"
          >
            <GitBranch className="w-4 h-4" />
            View System Flow
          </Link>
          <button
            onClick={handleRefreshConflicts}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Conflicts
          </button>
          <button
            onClick={handleRequestChange}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
          >
            <Settings className="w-4 h-4" />
            Request Change
          </button>
          <button
            onClick={handleSendFeedback}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            Send Feedback to GM
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <DashboardStats stats={statsData} />

      {/* System Intelligence Alerts */}
      {detectedConflicts.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              System Detected Conflicts ({detectedConflicts.length})
            </h2>
            <p className="text-sm text-gray-600">
              AI-powered conflict detection with smart recommendations
            </p>
          </div>
          {detectedConflicts.map((conflict) => (
            <SystemAlert
              key={conflict.id}
              conflict={conflict}
              onViewDetails={() => {
                addToast({
                  type: 'info',
                  title: 'Conflict Details',
                  message: `Viewing detailed analysis for ${conflict.employeeName}`,
                });
              }}
              onApplySuggestion={handleApplySuggestion}
            />
          ))}
        </div>
      )}

      {/* Filters */}
      <SmartFilters
        onFilterChange={handleFilterChange}
        statusOptions={['all', 'assigned', 'in-progress', 'completed']}
        showDateRange={true}
        showSort={true}
        placeholder="Search projects, team members..."
      />

      {/* Timeline */}
      <GanttTimeline
        projects={filteredProjects}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onProjectClick={handleProjectClick}
      />

      {/* Project Overview Cards */}
      <ProjectGrid 
        projects={filteredProjects.slice(0, 4)} 
        onProjectClick={handleProjectClick} 
      />

      {/* Empty State */}
      {filteredProjects.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
          <div className="flex flex-col items-center justify-center">
            <GitBranch className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Projects Found</h3>
            <p className="text-gray-600">
              {filters.search || filters.status !== 'all'
                ? 'Try adjusting your filters to see more projects'
                : 'You have no assigned projects at this time'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
