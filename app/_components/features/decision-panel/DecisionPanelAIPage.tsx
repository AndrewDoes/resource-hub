'use client';
import { useState } from 'react';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  Clock,
  Users,
  Lightbulb,
  Info,
  Calendar,
  Zap,
  HelpCircle,
  DollarSign,
  ChevronRight,
} from 'lucide-react';
import { useFeedbackToast } from '../../../context/ToastContext';

interface ProjectData {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  progress: number;
  status: 'on-track' | 'at-risk' | 'delayed';
  assignedResources: string[];
  requiredResources: number;
  resourceUtilization: number;
  riskLevel: 'low' | 'medium' | 'high';
}

interface AIRecommendation {
  id: string;
  type: 'add-resource' | 'adjust-timeline' | 'reallocate';
  title: string;
  description: string;
  impact: {
    time?: string;
    cost?: string;
    risk?: string;
    workload?: string;
  };
  confidence: number;
  reasoning: string;
}

interface ContractDecision {
  id: string;
  employeeName: string;
  employeeAvatar: string;
  contractEndDate: string;
  performance: 'excellent' | 'good' | 'average';
  currentWorkload: string;
  status: 'pending' | 'extended' | 'not-extended';
}

const mockProjects: ProjectData[] = [
  {
    id: 'p1',
    name: 'Website Redesign',
    startDate: '2026-04-15',
    endDate: '2026-07-15',
    progress: 45,
    status: 'at-risk',
    assignedResources: ['Sarah Chen', 'Mike Johnson', 'Alex Rivera', 'Emma Wilson', 'David Park', 'Lisa Brown'],
    requiredResources: 8,
    resourceUtilization: 110,
    riskLevel: 'high',
  },
  {
    id: 'p2',
    name: 'Mobile App Development',
    startDate: '2026-05-01',
    endDate: '2026-08-30',
    progress: 30,
    status: 'on-track',
    assignedResources: ['Emma Wilson', 'David Park', 'Lisa Brown', 'John Smith', 'Anna Lee', 'Tom Wilson', 'Kate Johnson', 'Mark Davis'],
    requiredResources: 8,
    resourceUtilization: 85,
    riskLevel: 'low',
  },
  {
    id: 'p3',
    name: 'Marketing Campaign Q3',
    startDate: '2026-06-01',
    endDate: '2026-09-15',
    progress: 15,
    status: 'delayed',
    assignedResources: ['Sarah Chen', 'David Park', 'Anna Lee', 'Kate Johnson'],
    requiredResources: 5,
    resourceUtilization: 125,
    riskLevel: 'high',
  },
];

const mockContractDecisions: ContractDecision[] = [
  {
    id: 'contract-1',
    employeeName: 'David Lee',
    employeeAvatar: 'DL',
    contractEndDate: '2026-05-15',
    performance: 'excellent',
    currentWorkload: 'Backend Lead - 2 projects',
    status: 'pending',
  },
  {
    id: 'contract-2',
    employeeName: 'Emily Chen',
    employeeAvatar: 'EC',
    contractEndDate: '2026-06-01',
    performance: 'good',
    currentWorkload: 'Frontend Dev - 1 project',
    status: 'pending',
  },
];

export function DecisionPanelAIPage() {
  const { addToast } = useFeedbackToast();
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(mockProjects[0]);
  const [contractDecisions, setContractDecisions] = useState<ContractDecision[]>(
    mockContractDecisions
  );
  const [expandedReason, setExpandedReason] = useState<string | null>(null);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'text-green-600 bg-green-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'high':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

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

  const getPerformanceBadge = (performance: string) => {
    switch (performance) {
      case 'excellent':
        return 'bg-green-100 text-green-700';
      case 'good':
        return 'bg-blue-100 text-blue-700';
      case 'average':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const handleApplyRecommendation = (recommendation: AIRecommendation) => {
    addToast({
      type: 'success',
      title: 'Recommendation Applied',
      message: `${recommendation.title} has been applied to the project plan`,
    });
  };

  const handleModifyPlan = () => {
    addToast({
      type: 'info',
      title: 'Manual Modification',
      message: 'Navigate to Planning page to manually adjust the plan',
    });
  };

  const handleRejectRecommendation = (recommendation: AIRecommendation) => {
    addToast({
      type: 'info',
      title: 'Recommendation Rejected',
      message: `${recommendation.title} was not applied`,
    });
  };

  const handleContractDecision = (id: string, action: 'extended' | 'not-extended') => {
    setContractDecisions((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: action } : d))
    );
    addToast({
      type: 'success',
      title: action === 'extended' ? 'Contract Extended' : 'Contract Not Extended',
      message: `Decision has been recorded and HR will be notified`,
    });
  };

  // Generate AI recommendations based on project data
  const generateRecommendations = (project: ProjectData): AIRecommendation[] => {
    const recommendations: AIRecommendation[] = [];

    const resourceGap = project.requiredResources - project.assignedResources.length;

    // Resource suggestion
    if (resourceGap > 0) {
      recommendations.push({
        id: 'rec-add-resource',
        type: 'add-resource',
        title: `Add ${resourceGap} Backend Developer${resourceGap > 1 ? 's' : ''}`,
        description: `Add ${resourceGap} senior backend developer${resourceGap > 1 ? 's' : ''
          } to meet project deadline`,
        impact: {
          time: resourceGap > 1 ? '-7 days delay' : '-3 days delay',
          cost: `+$${resourceGap * 7500}`,
          risk: 'Medium → Low',
          workload: `-${resourceGap * 15}%`,
        },
        confidence: 87,
        reasoning:
          'Current team velocity analysis shows backend development is behind schedule. Adding senior developers will accelerate API development and database optimization tasks.',
      });
    }

    // Timeline suggestion
    if (project.resourceUtilization > 100) {
      const extensionDays = Math.ceil((project.resourceUtilization - 100) * 0.2);
      recommendations.push({
        id: 'rec-extend-timeline',
        type: 'adjust-timeline',
        title: `Extend Timeline by ${extensionDays} Days`,
        description: `Adjust project deadline to reduce team pressure`,
        impact: {
          time: `+${extensionDays} days`,
          cost: 'No change',
          risk: 'High → Medium',
          workload: `-${Math.ceil((project.resourceUtilization - 100) / 2)}%`,
        },
        confidence: 92,
        reasoning: `With current resource allocation at ${project.resourceUtilization}% utilization, completing all deliverables on time has low probability. Extending by ${extensionDays} days increases success probability significantly.`,
      });
    }

    // Reallocation suggestion
    if (project.status === 'at-risk' || project.status === 'delayed') {
      recommendations.push({
        id: 'rec-reallocate',
        type: 'reallocate',
        title: 'Move Resource from Project A',
        description: 'Reallocate 1 frontend developer from lower priority project',
        impact: {
          time: '-5 days delay',
          cost: 'No change',
          risk: 'Medium → Medium',
          workload: '-10%',
        },
        confidence: 78,
        reasoning:
          'Lower priority projects have buffer time. Temporarily moving a specialist can help complete critical components faster.',
      });
    }

    return recommendations;
  };

  const recommendations = selectedProject ? generateRecommendations(selectedProject) : [];
  const resourceGap = selectedProject
    ? selectedProject.requiredResources - selectedProject.assignedResources.length
    : 0;
  const delayPrediction = selectedProject
    ? selectedProject.resourceUtilization > 100
      ? Math.floor((selectedProject.resourceUtilization - 100) * 0.5)
      : 0
    : 0;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 to-green-600 rounded-xl p-6 text-white shadow-lg mb-6">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur">
            <Zap className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-semibold mb-1">Decision Panel</h1>
            <p className="text-blue-100">AI-assisted resource planning decisions</p>
          </div>
          <span className="px-3 py-1.5 bg-white/20 backdrop-blur rounded-full text-sm font-medium">
            Recommended by AI
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Selection Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sticky top-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Select Project</h2>
            <div className="space-y-3">
              {mockProjects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => setSelectedProject(project)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${selectedProject?.id === project.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-semibold text-gray-900 text-sm">{project.name}</p>
                    <ChevronRight
                      className={`w-4 h-4 flex-shrink-0 transition-transform ${selectedProject?.id === project.id
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
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {selectedProject ? (
            <>
              {/* Project Context */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Project Info</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-lg font-semibold text-gray-900">{selectedProject.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${getStatusColor(
                          selectedProject.status
                        )}`}
                      ></span>
                      <span className="text-sm text-gray-600 capitalize">
                        {selectedProject.status.replace('-', ' ')}
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
                        {new Date(selectedProject.startDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}{' '}
                        -{' '}
                        {new Date(selectedProject.endDate).toLocaleDateString('en-US', {
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
                        {selectedProject.assignedResources.length} /{' '}
                        {selectedProject.requiredResources}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>Status</span>
                      </div>
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getRiskColor(
                          selectedProject.riskLevel
                        )}`}
                      >
                        {selectedProject.riskLevel.toUpperCase()} RISK
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Workload</span>
                      </div>
                      <p
                        className={`text-sm font-medium ${selectedProject.resourceUtilization > 100
                            ? 'text-red-600'
                            : 'text-green-600'
                          }`}
                      >
                        {selectedProject.resourceUtilization}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Recommendation Section */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-blue-600" />
                    <h3 className="text-sm font-semibold text-gray-900">AI Recommendation</h3>
                  </div>
                  <span className="text-xs text-gray-500 bg-blue-50 px-2 py-1 rounded">
                    {recommendations.length} suggestion{recommendations.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Alert Indicators */}
                {(resourceGap > 0 || delayPrediction > 0) && (
                  <div className="space-y-2 mb-4">
                    {resourceGap > 0 && (
                      <div className="flex items-start gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                        <AlertTriangle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900">Resource Gap</p>
                          <p className="text-xs text-gray-700 mt-0.5">
                            Need {resourceGap} more resource{resourceGap > 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                    )}

                    {delayPrediction > 0 && (
                      <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <Clock className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900">Timeline Risk</p>
                          <p className="text-xs text-gray-700 mt-0.5">
                            Predicted +{delayPrediction} days delay
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Recommendations List */}
                <div className="space-y-3">
                  {recommendations.map((recommendation) => (
                    <div
                      key={recommendation.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors bg-gray-50"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="text-sm font-semibold text-gray-900">
                              {recommendation.title}
                            </h4>
                            <button
                              onClick={() =>
                                setExpandedReason(
                                  expandedReason === recommendation.id ? null : recommendation.id
                                )
                              }
                              className="p-1 text-gray-400 hover:text-blue-600 rounded transition-colors"
                              title="Why this recommendation?"
                            >
                              <HelpCircle className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{recommendation.description}</p>

                          {/* Impact Metrics */}
                          <div className="grid grid-cols-2 gap-2 mb-3">
                            {recommendation.impact.time && (
                              <div className="flex items-center gap-1.5 text-xs">
                                <Clock className="w-3.5 h-3.5 text-gray-500" />
                                <span className="font-medium text-gray-700">
                                  {recommendation.impact.time}
                                </span>
                              </div>
                            )}
                            {recommendation.impact.cost && (
                              <div className="flex items-center gap-1.5 text-xs">
                                <DollarSign className="w-3.5 h-3.5 text-gray-500" />
                                <span className="font-medium text-gray-700">
                                  {recommendation.impact.cost}
                                </span>
                              </div>
                            )}
                            {recommendation.impact.risk && (
                              <div className="flex items-center gap-1.5 text-xs">
                                <AlertTriangle className="w-3.5 h-3.5 text-gray-500" />
                                <span className="font-medium text-gray-700">
                                  {recommendation.impact.risk}
                                </span>
                              </div>
                            )}
                            {recommendation.impact.workload && (
                              <div className="flex items-center gap-1.5 text-xs">
                                <TrendingUp className="w-3.5 h-3.5 text-gray-500" />
                                <span className="font-medium text-gray-700">
                                  {recommendation.impact.workload}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Confidence Level */}
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${recommendation.confidence >= 85
                                    ? 'bg-green-500'
                                    : recommendation.confidence >= 70
                                      ? 'bg-yellow-500'
                                      : 'bg-red-500'
                                  }`}
                                style={{ width: `${recommendation.confidence}%` }}
                              ></div>
                            </div>
                            <span className="text-xs font-semibold text-gray-700">
                              {recommendation.confidence}% confidence
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Reasoning (Expandable) */}
                      {expandedReason === recommendation.id && (
                        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Info className="w-4 h-4 text-blue-600" />
                            <p className="text-xs font-semibold text-blue-900">
                              Why this recommendation?
                            </p>
                          </div>
                          <p className="text-sm text-blue-800">{recommendation.reasoning}</p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-3 border-t border-gray-200">
                        <button
                          onClick={() => handleApplyRecommendation(recommendation)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Apply
                        </button>
                        <button
                          onClick={handleModifyPlan}
                          className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                        >
                          Modify Manually
                        </button>
                        <button
                          onClick={() => handleRejectRecommendation(recommendation)}
                          className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contract Decision Section */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-gray-700" />
                  <h3 className="text-sm font-semibold text-gray-900">Contract Decision</h3>
                </div>

                <div className="space-y-3">
                  {contractDecisions.map((decision) => (
                    <div
                      key={decision.id}
                      className="bg-gray-50 border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-sm font-medium">
                            {decision.employeeAvatar}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-semibold text-gray-900">
                                {decision.employeeName}
                              </p>
                              <p className="text-xs text-gray-600 mt-1">
                                {decision.currentWorkload}
                              </p>
                            </div>
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-medium ${getPerformanceBadge(
                                decision.performance
                              )}`}
                            >
                              {decision.performance.toUpperCase()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-2 text-xs text-gray-600">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Contract ends: {decision.contractEndDate}</span>
                          </div>
                        </div>
                      </div>

                      {decision.status === 'pending' ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleContractDecision(decision.id, 'extended')}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Extend Contract
                          </button>
                          <button
                            onClick={() => handleContractDecision(decision.id, 'not-extended')}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                          >
                            <XCircle className="w-4 h-4" />
                            Do Not Extend
                          </button>
                        </div>
                      ) : (
                        <div
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg w-full ${decision.status === 'extended'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                            }`}
                        >
                          {decision.status === 'extended' ? (
                            <>
                              <CheckCircle className="w-4 h-4" />
                              <span className="text-sm font-medium">Contract Extended</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4" />
                              <span className="text-sm font-medium">Contract Not Extended</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="p-4 bg-gradient-to-br from-blue-100 to-green-100 rounded-full mb-4">
                  <Lightbulb className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Select a Project to Begin
                </h3>
                <p className="text-sm text-gray-600">
                  Choose a project from the left sidebar to view AI recommendations and make
                  decisions
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
