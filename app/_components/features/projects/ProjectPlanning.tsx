'use client';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  AlertTriangle,
  Users,
  Calendar,
  Filter,
  ZoomIn,
  ZoomOut,
  X,
} from 'lucide-react';
import { AIDecisionPanel } from '../decision-panel/components/AIDecisionPanel';
import type { ProjectData } from '../decision-panel/types';

interface GanttProject {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  progress: number;
  status: 'on-track' | 'at-risk' | 'delayed';
  assignedResources: string[];
  resourceUtilization: number;
  riskLevel: 'low' | 'medium' | 'high';
}

const ganttProjects: GanttProject[] = [
  {
    id: '1',
    name: 'Website Redesign',
    startDate: '2026-04-10',
    endDate: '2026-06-30',
    progress: 35,
    status: 'on-track',
    assignedResources: ['Sarah J.', 'Michael C.', 'Emily D.'],
    resourceUtilization: 85,
    riskLevel: 'low',
  },
  {
    id: '2',
    name: 'Mobile App Development',
    startDate: '2026-04-01',
    endDate: '2026-05-15',
    progress: 60,
    status: 'at-risk',
    assignedResources: ['Sarah J.', 'Lisa A.'],
    resourceUtilization: 95,
    riskLevel: 'medium',
  },
  {
    id: 'marketing-campaign',
    name: 'Marketing Campaign',
    startDate: '2026-05-01',
    endDate: '2026-06-15',
    progress: 10,
    status: 'at-risk',
    assignedResources: ['James W.'],
    resourceUtilization: 110,
    riskLevel: 'high',
  },
  {
    id: '4',
    name: 'Data Analytics Platform',
    startDate: '2026-04-15',
    endDate: '2026-07-15',
    progress: 25,
    status: 'delayed',
    assignedResources: ['Emily D.', 'Robert B.'],
    resourceUtilization: 105,
    riskLevel: 'high',
  },
  {
    id: '5',
    name: 'CRM Integration',
    startDate: '2026-05-10',
    endDate: '2026-06-20',
    progress: 0,
    status: 'on-track',
    assignedResources: ['Lisa A.'],
    resourceUtilization: 75,
    riskLevel: 'low',
  },
];

// Convert GanttProject to ProjectData format for SmartDecisionPanel
const convertToProjectData = (project: GanttProject): ProjectData => ({
  id: project.id,
  name: project.name,
  startDate: project.startDate,
  endDate: project.endDate,
  progress: project.progress,
  status: project.status,
  assignedResources: project.assignedResources,
  requiredResources: project.assignedResources.length + (project.resourceUtilization > 100 ? 2 : 0),
  resourceUtilization: project.resourceUtilization,
  riskLevel: project.riskLevel,
});

export function ProjectPlanning() {
  const searchParams = useSearchParams();
  const highlightProject = searchParams.get('highlight');

  const [viewMode, setViewMode] = useState<'weekly' | 'monthly'>('monthly');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<GanttProject | null>(null);

  const filteredProjects =
    statusFilter === 'all'
      ? ganttProjects
      : ganttProjects.filter((p) => p.status === statusFilter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track':
        return 'bg-green-500';
      case 'at-risk':
        return 'bg-yellow-500';
      case 'delayed':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const handleProjectClick = (project: GanttProject) => {
    setSelectedProject(project);
  };

  const getDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return Math.ceil(days / 7);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Project Planning</h1>
          <p className="text-sm text-gray-500 mt-1">
            GM Dashboard - Timeline visualization and resource allocation
          </p>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="on-track">On Track</option>
              <option value="at-risk">At Risk</option>
              <option value="delayed">Delayed</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">View:</span>
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('weekly')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${viewMode === 'weekly'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                <ZoomIn className="w-3.5 h-3.5 inline mr-1" />
                Weekly
              </button>
              <button
                onClick={() => setViewMode('monthly')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${viewMode === 'monthly'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                <ZoomOut className="w-3.5 h-3.5 inline mr-1" />
                Monthly
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gantt Chart */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Project Timeline</h3>

            {/* Timeline Header */}
            <div className="mb-4 pl-48">
              <div className="flex justify-between text-xs text-gray-500 mb-2">
                <span>Apr 2026</span>
                <span>May 2026</span>
                <span>Jun 2026</span>
                <span>Jul 2026</span>
              </div>
              <div className="h-px bg-gray-200"></div>
            </div>

            {/* Gantt Bars */}
            <div className="space-y-4">
              {filteredProjects.map((project) => {
                const isHighlighted = highlightProject === project.id;

                return (
                  <div
                    key={project.id}
                    className={`transition-all ${isHighlighted ? 'ring-2 ring-blue-500 rounded-lg p-2 -m-2' : ''
                      }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-44 shrink-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {project.name}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`w-2 h-2 rounded-full ${getStatusColor(project.status)}`}
                          ></span>
                          <span className="text-xs text-gray-500 capitalize">
                            {project.status.replace('-', ' ')}
                          </span>
                        </div>
                      </div>

                      <div className="flex-1 relative h-12 bg-gray-100 rounded-lg overflow-hidden">
                        <button
                          onClick={() => handleProjectClick(project)}
                          className="absolute inset-0 group"
                          title="Click for details"
                        >
                          <div
                            className={`h-full ${getStatusColor(
                              project.status
                            )} rounded-lg flex items-center justify-between px-3 text-white text-xs font-medium transition-all hover:brightness-110 hover:shadow-md`}
                            style={{ width: `${getDuration(project.startDate, project.endDate) * 8}%` }}
                          >
                            <span className="truncate">{project.progress}%</span>
                            {project.resourceUtilization > 100 && (
                              <AlertTriangle className="w-4 h-4 text-white" />
                            )}
                          </div>
                          <div
                            className="absolute left-0 top-0 h-full bg-white/30"
                            style={{ width: `${project.progress}%` }}
                          ></div>
                        </button>
                      </div>
                    </div>

                    {/* Assigned Resources */}
                    <div className="flex items-center gap-2 mt-2 pl-48">
                      <Users className="w-3.5 h-3.5 text-gray-400" />
                      <div className="flex -space-x-2">
                        {project.assignedResources.map((resource, idx) => (
                          <div
                            key={idx}
                            className="w-6 h-6 bg-linear-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center border-2 border-white text-white text-xs font-medium"
                            title={resource}
                          >
                            {resource.charAt(0)}
                          </div>
                        ))}
                      </div>
                      {project.resourceUtilization > 100 && (
                        <span className="text-xs text-red-600 font-medium ml-2">
                          {project.resourceUtilization}% utilized
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Decision Panel (AI Assisted) */}
        <div>
          <AIDecisionPanel
            selectedProject={selectedProject ? convertToProjectData(selectedProject) : null}
          />
        </div>
      </div>
    </div>
  );
}
