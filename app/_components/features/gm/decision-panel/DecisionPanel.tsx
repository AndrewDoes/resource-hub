'use client';

import { useEffect, useMemo, useState } from 'react';
import { Lightbulb, Users, CheckCircle, XCircle } from 'lucide-react';
import { useFeedbackToast } from '@/app/context/ToastContext';

// Types, Data and Utils
import { ProjectData, ContractDecision, AIRecommendation } from './types';
import {
  fetchGeneralManagerContractDecisions,
  fetchGeneralManagerProjectPrediction,
  submitGeneralManagerRecommendationResponse,
  fetchGeneralManagerPendingAssignmentRequests,
  updateGeneralManagerAssignmentRequestStatus,
  type GeneralManagerProjectPrediction,
  type GeneralManagerAssignmentRequest,
} from '@/functions/api/generalManager';
import {
  fetchProjectManagerProjects,
  type ProjectManagerProjectSummary,
} from '@/functions/api/projectManager';

// Sub-components
import { DecisionHeader } from './components/DecisionHeader';
import { ProjectSidebar } from './components/ProjectSidebar';
import { ProjectContext } from './components/ProjectContext';
import { AIRecommendationSection } from './components/AIRecommendationSection';
import { ContractDecisionSection } from './components/ContractDecisionSection';

const defaultPmUserId = process.env.NEXT_PUBLIC_PM_USER_ID ?? '11111111-1111-1111-1111-111111111111';

const mapSummaryToProject = (
  summary: ProjectManagerProjectSummary,
  projectPrediction?: GeneralManagerProjectPrediction | null
): ProjectData => {
  const candidateNames = Array.from(
    new Set(
      (projectPrediction?.requirements ?? []).flatMap((requirement) =>
        requirement.recommendedCandidates.map((candidate) => candidate.fullName)
      )
    )
  );

  return {
    id: summary.id,
    name: summary.name,
    startDate: summary.startDate,
    endDate: summary.endDate,
    progress: summary.progress,
    status: summary.status,
    assignedResources: candidateNames,
    requiredResources: summary.teamSize,
    resourceUtilization: Math.min(150, Math.round(summary.progress + (projectPrediction?.staffingRiskScore ?? 0))),
    riskLevel:
      projectPrediction && projectPrediction.staffingRiskScore >= 65
        ? 'high'
        : projectPrediction && projectPrediction.staffingRiskScore >= 35
          ? 'medium'
          : summary.status === 'delayed'
            ? 'high'
            : summary.status === 'at-risk'
              ? 'medium'
              : 'low',
  };
};

const buildRecommendationsFromPrediction = (
  projectPrediction: GeneralManagerProjectPrediction
): AIRecommendation[] => {
  const recommendations: AIRecommendation[] = [];

  if (projectPrediction.staffingRiskScore >= 40) {
    recommendations.push({
      id: 'risk-review',
      type: 'adjust-timeline',
      title: 'Review staffing risk',
      description: `Overall staffing risk is ${projectPrediction.staffingRiskScore}%, so this project needs closer planning.`,
      impact: {
        time: 'Review needed',
        risk: projectPrediction.staffingRiskScore >= 65 ? 'High → Medium' : 'Medium → Low',
      },
      confidence: Math.min(95, Math.max(60, Math.round(projectPrediction.overallCoverageScore))),
      reasoning: `Backend prediction shows ${projectPrediction.overallCoverageScore}% coverage across ${projectPrediction.requiredResourceCount} required resources.`,
    });
  }

  projectPrediction.requirements.forEach((requirement, index) => {
    const topCandidate = requirement.recommendedCandidates[0];

    if (!topCandidate) {
      return;
    }

    recommendations.push({
      id: `candidate-${requirement.requirementId}-${index}`,
      type: 'add-resource',
      title: `Assign ${topCandidate.fullName} to ${requirement.roleName}`,
      description: `${topCandidate.fullName} is the top fit for ${requirement.roleName} with a ${topCandidate.fitScore}% score.`,
      impact: {
        workload: `${Math.max(0, Math.round(topCandidate.capacityScore / 2))}%`,
        risk: projectPrediction.staffingRiskScore >= 65 ? 'High → Medium' : 'Medium → Low',
      },
      confidence: Math.min(99, Math.max(50, Math.round(topCandidate.fitScore))),
      reasoning: topCandidate.reason,
    });
  });

  return recommendations;
};

export function DecisionPanel() {
  const { addToast } = useFeedbackToast();
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null);
  const [prediction, setPrediction] = useState<GeneralManagerProjectPrediction | null>(null);
  const [isPredictionLoading, setIsPredictionLoading] = useState(false);
  const [contractDecisions, setContractDecisions] = useState<ContractDecision[]>([]);
  const [pendingAssignmentRequests, setPendingAssignmentRequests] = useState<GeneralManagerAssignmentRequest[]>([]);
  const [isLoadingPendingRequests, setIsLoadingPendingRequests] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadProjects = async () => {
      const [projectResult, contractResult] = await Promise.allSettled([
        fetchProjectManagerProjects(defaultPmUserId),
        fetchGeneralManagerContractDecisions(),
      ]);

      if (!isMounted) {
        return;
      }

      if (projectResult.status === 'fulfilled') {
        const backendProjects = projectResult.value.map((summary) => mapSummaryToProject(summary));

        const initialProject = backendProjects[0] ?? null;

        setProjects(backendProjects);
        setSelectedProject(initialProject);
      } else {
        setProjects([]);
        setSelectedProject(null);
        setPrediction(null);
      }

      if (contractResult.status === 'fulfilled' && contractResult.value.length > 0) {
        setContractDecisions(
          contractResult.value.map((decision) => ({
            id: decision.rowId,
            employeeName: decision.employeeName,
            employeeAvatar: decision.employeeAvatar,
            contractEndDate: decision.contractEndDate ?? 'TBD',
            performance:
              decision.availabilityPercent >= 75 && decision.workloadPercent <= 30
                ? 'excellent'
                : decision.availabilityPercent >= 45 && decision.workloadPercent <= 60
                  ? 'good'
                  : 'average',
            currentWorkload: `${decision.jobTitle} - ${decision.activeAssignmentCount} project${decision.activeAssignmentCount === 1 ? '' : 's'}`,
            status:
              decision.decisionStatus.toLowerCase() === 'executed'
                ? decision.decisionType === 'ExtendContract'
                  ? 'extended'
                  : 'not-extended'
                : 'pending',
          }))
        );
      } else {
        setContractDecisions([]);
      }

      const loadError = projectResult.status === 'rejected' ? projectResult.reason : null;
      setError(loadError instanceof Error ? loadError.message : loadError ? 'Failed to load decision panel data' : null);
      setIsLoading(false);
    };

    void loadProjects();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadPrediction = async () => {
      if (!selectedProject) {
        setPrediction(null);
        return;
      }

      setIsPredictionLoading(true);

      try {
        const projectPrediction = await fetchGeneralManagerProjectPrediction(selectedProject.id, 5);

        if (!isMounted) {
          return;
        }

        setPrediction(projectPrediction);
      } catch {
        if (!isMounted) {
          return;
        }

        setPrediction(null);
      } finally {
        if (isMounted) {
          setIsPredictionLoading(false);
        }
      }
    };

    void loadPrediction();

    return () => {
      isMounted = false;
    };
  }, [selectedProject?.id]);

  useEffect(() => {
    let isMounted = true;

    const loadPendingRequests = async () => {
      setIsLoadingPendingRequests(true);

      try {
        const requests = await fetchGeneralManagerPendingAssignmentRequests();

        if (!isMounted) {
          return;
        }

        setPendingAssignmentRequests(requests);
      } catch {
        if (!isMounted) {
          return;
        }

        setPendingAssignmentRequests([]);
      } finally {
        if (isMounted) {
          setIsLoadingPendingRequests(false);
        }
      }
    };

    void loadPendingRequests();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleApplyRecommendation = async (recommendation: AIRecommendation) => {
    if (!selectedProject) {
      addToast({
        type: 'error',
        title: 'No Project Selected',
        message: 'Select a project before applying a recommendation.',
      });
      return false;
    }

    try {
      await submitGeneralManagerRecommendationResponse({
        projectId: selectedProject.id,
        recommendationId: recommendation.id,
        recommendationType: recommendation.type,
        title: recommendation.title,
        details: recommendation.reasoning,
        action: 'Applied',
      });

      addToast({
        type: 'success',
        title: 'Recommendation Applied',
        message: `${recommendation.title} has been submitted to backend successfully.`,
      });

      return true;
    } catch {
      addToast({
        type: 'error',
        title: 'Apply Failed',
        message: 'Unable to send apply action to backend. Please try again.',
      });

      return false;
    }
  };

  const handleRejectRecommendation = async (recommendation: AIRecommendation) => {
    if (!selectedProject) {
      addToast({
        type: 'error',
        title: 'No Project Selected',
        message: 'Select a project before rejecting a recommendation.',
      });
      return false;
    }

    try {
      await submitGeneralManagerRecommendationResponse({
        projectId: selectedProject.id,
        recommendationId: recommendation.id,
        recommendationType: recommendation.type,
        title: recommendation.title,
        details: recommendation.reasoning,
        action: 'Rejected',
      });

      addToast({
        type: 'info',
        title: 'Recommendation Rejected',
        message: `${recommendation.title} has been submitted as rejected to backend.`,
      });

      return true;
    } catch {
      addToast({
        type: 'error',
        title: 'Reject Failed',
        message: 'Unable to send reject action to backend. Please try again.',
      });

      return false;
    }
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

  const handleApproveAssignmentRequest = async (requestId: string) => {
    try {
      await updateGeneralManagerAssignmentRequestStatus(requestId, 'Approved');

      setPendingAssignmentRequests((prev) => prev.filter((r) => r.id !== requestId));

      addToast({
        type: 'success',
        title: 'Assignment Approved',
        message: 'Request has been approved and forwarded to HR for final validation.',
      });
    } catch {
      addToast({
        type: 'error',
        title: 'Approval Failed',
        message: 'Unable to approve assignment request. Please try again.',
      });
    }
  };

  const handleRejectAssignmentRequest = async (requestId: string) => {
    try {
      await updateGeneralManagerAssignmentRequestStatus(requestId, 'Rejected');

      setPendingAssignmentRequests((prev) => prev.filter((r) => r.id !== requestId));

      addToast({
        type: 'info',
        title: 'Assignment Rejected',
        message: 'Request has been rejected. PM will be notified.',
      });
    } catch {
      addToast({
        type: 'error',
        title: 'Rejection Failed',
        message: 'Unable to reject assignment request. Please try again.',
      });
    }
  };

  const recommendations = useMemo(() => {
    if (!selectedProject || !prediction) {
      return [];
    }

    return buildRecommendationsFromPrediction(prediction);
  }, [prediction, selectedProject]);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <DecisionHeader />

      {error && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Backend data unavailable for decision panel: {error}
        </div>
      )}

      {isLoading && (
        <div className="mb-4 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-500 shadow-sm">
          Loading live project predictions...
        </div>
      )}

      {!isLoading && isPredictionLoading && (
        <div className="mb-4 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-500 shadow-sm">
          Updating backend recommendation for the selected project...
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Selection Sidebar */}
        <div className="lg:col-span-1">
          <ProjectSidebar
            projects={projects}
            selectedProjectId={selectedProject?.id}
            onSelect={(project) => {
              setSelectedProject(project);
              setPrediction(null);
            }}
          />
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {selectedProject ? (
            <>
              {/* Project Context */}
              <ProjectContext project={selectedProject} />

              {/* AI Recommendation Section */}
              <AIRecommendationSection
                project={selectedProject}
                recommendations={recommendations}
                onApply={handleApplyRecommendation}
                onReject={handleRejectRecommendation}
              />

              {/* Contract Decision Section */}
              <ContractDecisionSection
                decisions={contractDecisions}
                onDecision={handleContractDecision}
              />

              {/* Pending Assignment Requests Section */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Pending PM Role Change Requests
                  </h3>
                </div>

                {isLoadingPendingRequests && (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    Loading pending requests...
                  </div>
                )}

                {!isLoadingPendingRequests && pendingAssignmentRequests.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>No pending PM role change requests</p>
                  </div>
                )}

                {!isLoadingPendingRequests && pendingAssignmentRequests.length > 0 && (
                  <div className="space-y-3">
                    {pendingAssignmentRequests.map((request) => {
                      const metadata = request.conflictWarning
                        ? (() => {
                            try {
                              return JSON.parse(request.conflictWarning);
                            } catch {
                              return {};
                            }
                          })()
                        : {};

                      return (
                        <div
                          key={request.id}
                          className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">
                                {request.projectName} - {request.roleName}
                              </p>
                              <p className="text-sm text-gray-600">
                                Requested by: {request.requestedByName}
                              </p>
                              <p className="text-sm text-gray-500">
                                {request.startDate && request.endDate
                                  ? `${new Date(request.startDate).toLocaleDateString()} - ${new Date(request.endDate).toLocaleDateString()}`
                                  : 'Dates TBD'}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-blue-600">
                                {request.allocationPercent}% allocation
                              </p>
                              {request.employeeName && (
                                <p className="text-xs text-gray-500">
                                  Auto-selected: {request.employeeName}
                                </p>
                              )}
                            </div>
                          </div>

                          {(metadata.requiredSkills || metadata.additionalNeeds) && (
                            <div className="mb-3 space-y-1 text-sm">
                              {metadata.requiredSkills && (
                                <p className="text-gray-700">
                                  <span className="font-medium">Required Skills:</span>{' '}
                                  {Array.isArray(metadata.requiredSkills)
                                    ? metadata.requiredSkills.join(', ')
                                    : metadata.requiredSkills}
                                </p>
                              )}
                              {metadata.additionalNeeds && (
                                <p className="text-gray-700">
                                  <span className="font-medium">Additional Needs:</span>{' '}
                                  {metadata.additionalNeeds}
                                </p>
                              )}
                            </div>
                          )}

                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApproveAssignmentRequest(request.id)}
                              className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md bg-green-50 hover:bg-green-100 text-green-700 text-sm font-medium transition-colors"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectAssignmentRequest(request.id)}
                              className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md bg-red-50 hover:bg-red-100 text-red-700 text-sm font-medium transition-colors"
                            >
                              <XCircle className="w-4 h-4" />
                              Reject
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="p-4 bg-linear-to-br from-blue-100 to-green-100 rounded-full mb-4">
                  <Lightbulb className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Select a Project to Begin
                </h3>
                <p className="text-sm text-gray-600">
                  No projects were returned from the backend yet.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
