'use client';
import React, { useState, useEffect } from 'react';
import { GanttTimeline, TimelineProject } from './GanttTimeline';
import { SmartFilters, FilterOptions } from './SmartFilters';
import {
  ResourcePlanningSystem,
  ResourceConflict,
  SystemSuggestion,
  SystemAlert,
  Project as IntelligenceProject,
  Employee,
} from './SystemIntelligence';
import { useFeedbackToast } from '../context/ToastContext';
import Link from 'next/link';
import {
  BarChart3,
  Users,
  AlertTriangle,
  TrendingUp,
  CheckCircle,
  Clock,
  Calendar,
  MessageSquare,
  Settings,
  RefreshCw,
  GitBranch
} from 'lucide-react';

// Mock employee data for conflict detection
const mockEmployees: Employee[] = [
  {
    id: 'emp-1',
    name: 'Sarah Chen',
    skills: ['Frontend', 'React', 'Design'],
    availability: 40,
    currentProjects: ['1', '4', '6'],
    status: 'active',
  },
  {
    id: 'emp-2',
    name: 'Mike Johnson',
    skills: ['Full Stack', 'Node.js', 'React'],
    availability: 0,
    currentProjects: ['1', '2'],
    status: 'active',
  },
  {
    id: 'emp-3',
    name: 'Alex Rivera',
    skills: ['Frontend', 'React', 'UI/UX'],
    availability: 60,
    currentProjects: ['1', '5'],
    status: 'active',
  },
  {
    id: 'emp-4',
    name: 'Emma Wilson',
    skills: ['Mobile', 'React Native', 'iOS'],
    availability: 45,
    currentProjects: ['2', '5'],
    status: 'active',
  },
  {
    id: 'emp-5',
    name: 'David Park',
    skills: ['Backend', 'Database', 'DevOps'],
    availability: 30,
    currentProjects: ['2', '4'],
    status: 'active',
  },
  {
    id: 'emp-6',
    name: 'Lisa Anderson',
    skills: ['Marketing', 'Content', 'SEO'],
    availability: 55,
    currentProjects: ['3'],
    status: 'active',
  },
  {
    id: 'emp-7',
    name: 'Tom Harris',
    skills: ['Marketing', 'Analytics', 'Ads'],
    availability: 45,
    currentProjects: ['3'],
    status: 'active',
  },
  {
    id: 'emp-8',
    name: 'Chris Martinez',
    skills: ['Security', 'Backend', 'Testing'],
    availability: 70,
    currentProjects: ['6'],
    status: 'active',
  },
];

// Mock data for PM Timeline Dashboard
const mockProjects: TimelineProject[] = [
  {
    id: '1',
    name: 'Website Redesign',
    description: 'Complete overhaul of company website with new branding',
    startDate: '2026-04-01',
    endDate: '2026-05-15',
    progress: 65,
    status: 'in-progress',
    teamMembers: ['Sarah Chen', 'Mike Johnson', 'Alex Rivera'],
    phase: 'execution',
    hasConflict: false,
  },
  {
    id: '2',
    name: 'Mobile App Launch',
    description: 'iOS and Android app development and launch',
    startDate: '2026-04-10',
    endDate: '2026-06-30',
    progress: 35,
    status: 'in-progress',
    teamMembers: ['Mike Johnson', 'Emma Wilson', 'David Park'],
    phase: 'execution',
    hasConflict: true,
    conflictMessage: 'Mike Johnson is allocated to 2 overlapping projects (150% capacity)',
  },
  {
    id: '3',
    name: 'Q2 Marketing Campaign',
    description: 'Multi-channel marketing campaign for Q2 product launch',
    startDate: '2026-04-15',
    endDate: '2026-05-30',
    progress: 45,
    status: 'in-progress',
    teamMembers: ['Lisa Anderson', 'Tom Harris'],
    phase: 'execution',
    hasConflict: false,
  },
  {
    id: '4',
    name: 'Database Migration',
    description: 'Migrate legacy database to new cloud infrastructure',
    startDate: '2026-05-01',
    endDate: '2026-06-15',
    progress: 15,
    status: 'assigned',
    teamMembers: ['David Park', 'Sarah Chen'],
    phase: 'planning',
    hasConflict: false,
  },
  {
    id: '5',
    name: 'Customer Portal v2',
    description: 'Enhanced customer self-service portal',
    startDate: '2026-03-15',
    endDate: '2026-04-10',
    progress: 100,
    status: 'completed',
    teamMembers: ['Alex Rivera', 'Emma Wilson'],
    phase: 'delivery',
    hasConflict: false,
  },
  {
    id: '6',
    name: 'Security Audit',
    description: 'Comprehensive security review and penetration testing',
    startDate: '2026-05-20',
    endDate: '2026-06-30',
    progress: 0,
    status: 'assigned',
    teamMembers: ['Chris Martinez', 'Sarah Chen'],
    phase: 'planning',
    hasConflict: true,
    conflictMessage: 'Sarah Chen is allocated to 3 overlapping projects (120% capacity)',
  },
];

const statsData = [
  {
    label: 'Active Projects',
    value: '8',
    change: '+2 this week',
    icon: BarChart3,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    label: 'Total Team Members',
    value: '24',
    change: '6 teams',
    icon: Users,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  {
    label: 'Conflicts Detected',
    value: '3',
    change: 'Needs attention',
    icon: AlertTriangle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
  },
  {
    label: 'Avg Progress',
    value: '67%',
    change: '+12% vs last month',
    icon: TrendingUp,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
];

export function PMTimelineDashboard() {
  const { addToast } = useFeedbackToast();
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    status: 'all',
    dateRange: 'all',
    sortBy: 'startDate',
    sortOrder: 'asc',
  });

  const [filteredProjects, setFilteredProjects] = useState(mockProjects);
  const [detectedConflicts, setDetectedConflicts] = useState<ResourceConflict[]>([]);

  // Convert TimelineProject to IntelligenceProject format
  const convertToIntelligenceProjects = (projects: TimelineProject[]): IntelligenceProject[] => {
    return projects.map((p) => ({
      id: p.id,
      name: p.name,
      status: p.status as any,
      startDate: p.startDate,
      endDate: p.endDate,
      requiredSkills: [],
      assignedEmployees: mockEmployees
        .filter((emp) => emp.currentProjects.includes(p.id))
        .map((emp) => emp.id),
      workload: p.status === 'completed' ? 0 : p.status === 'in-progress' ? 50 : 30,
    }));
  };

  // Run conflict detection on mount and when projects change
  useEffect(() => {
    const intelligenceProjects = convertToIntelligenceProjects(mockProjects);
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
    // Navigate to project detail page or open modal
  };

  const conflictProjects = filteredProjects.filter((p) => p.hasConflict);

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
    const intelligenceProjects = convertToIntelligenceProjects(mockProjects);
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsData.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`${stat.bgColor} rounded-lg p-2.5`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
              <p className="text-2xl font-semibold text-gray-900 mb-1">{stat.value}</p>
              <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
              <p className="text-xs text-gray-500">{stat.change}</p>
            </div>
          );
        })}
      </div>

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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredProjects.slice(0, 4).map((project) => (
          <div
            key={project.id}
            className={`bg-white rounded-xl border shadow-sm p-5 hover:shadow-md transition-shadow cursor-pointer ${project.hasConflict ? 'border-red-200 bg-red-50/30' : 'border-gray-200'
              }`}
            onClick={() => handleProjectClick(project.id)}
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

      {/* Empty State */}
      {filteredProjects.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
          <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Projects Found</h3>
          <p className="text-gray-600">
            {filters.search || filters.status !== 'all'
              ? 'Try adjusting your filters to see more projects'
              : 'You have no assigned projects at this time'}
          </p>
        </div>
      )}
    </div>
  );
}
