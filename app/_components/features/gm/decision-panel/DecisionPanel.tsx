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
  fetchGeneralManagerMarketingDraftProjects,
  reviewGeneralManagerMarketingDraftProject,
  type GeneralManagerProjectPrediction,
  type GeneralManagerAssignmentRequest,
  type GeneralManagerMarketingDraftProject,
} from '@/functions/api/generalManager';
import {
  fetchProjectManagerProjects,
  fetchProjectManagerProjectTeam,
  createProjectManagerChangeRequest,
  type ProjectManagerProjectSummary,
} from '@/functions/api/projectManager';

// Sub-components
import { DecisionHeader } from './components/DecisionHeader';
import { ProjectSidebar } from './components/ProjectSidebar';
import { ProjectContext } from './components/ProjectContext';
import { AIRecommendationSection } from './components/AIRecommendationSection';
import { ContractDecisionSection } from './components/ContractDecisionSection';
import { MarketingDraftReviewSection } from './components/MarketingDraftReviewSection';

const defaultPmUserId = process.env.NEXT_PUBLIC_PM_USER_ID ?? '11111111-1111-1111-1111-111111111111';
const defaultDecisionActorUserId = process.env.NEXT_PUBLIC_GM_USER_ID ?? defaultPmUserId;

const mapSummaryToProject = (
  summary: ProjectManagerProjectSummary,
  teamMembers: string[] = [],
  projectPrediction?: GeneralManagerProjectPrediction | null
): ProjectData => {
  const mappedStatus: ProjectData['status'] =
    summary.status === 'delayed'
      ? 'delayed'
      : summary.status === 'at-risk'
        ? 'at-risk'
        : 'on-track';

  return {
    id: summary.id,
    name: summary.name,
    startDate: summary.startDate,
    endDate: summary.endDate,
    progress: summary.progress,
    status: mappedStatus,
    assignedResources: teamMembers,
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

const toDayStart = (value: string): Date => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
};

const isFinishedProject = (summary: ProjectManagerProjectSummary): boolean => {
  if (summary.status === 'completed' || summary.status === 'cancelled') {
    return true;
  }

  if (summary.progress >= 100) {
    return true;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return toDayStart(summary.endDate).getTime() < today.getTime();
};

const buildRecommendationsFromPrediction = (
  projectPrediction: GeneralManagerProjectPrediction,
  assignedResources: string[],
  requiredResources: number
): AIRecommendation[] => {
  const recommendations: AIRecommendation[] = [];
  const assignedResourceNames = assignedResources
    .map((name) => name.trim().toLowerCase())
    .filter((name) => name.length > 0);
  const hasRemainingResourceSlots = assignedResources.length < requiredResources;

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
      reasoning: `Backend prediction shows ${projectPrediction.overallCoverageScore}% coverage across ${projectPrediction.requiredResourceCount} required resources.`,
    });
  }

  projectPrediction.requirements.forEach((requirement, index) => {
    if (!hasRemainingResourceSlots) {
      return;
    }

    if (requirement.coverageScore >= 100) {
      return;
    }

    const topCandidate = requirement.recommendedCandidates[0];

    if (!topCandidate) {
      return;
    }

    const isAlreadyAssigned = assignedResourceNames.includes(topCandidate.fullName.trim().toLowerCase());
    if (isAlreadyAssigned) {
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
      reasoning: topCandidate.reason,
      metadata: {
        employeeId: topCandidate.employeeId,
        employeeName: topCandidate.fullName,
        roleName: requirement.roleName,
        requiredSkills: requirement.requiredSkills,
          allocationPercent: 0,
        candidateOptions: requirement.recommendedCandidates.map((candidate) => ({
          employeeId: candidate.employeeId,
          fullName: candidate.fullName,
          availabilityPercent: candidate.availabilityPercent,
        })),
      },
    });
  });

  return recommendations;
};

const parseConflictWarning = (warning: string): { requiredSkills?: string[]; additionalNeeds?: string; rawText?: string } => {
  if (!warning || warning.trim().length === 0) {
    return {};
  }

  try {
    const parsed = JSON.parse(warning) as Record<string, unknown>;
    const requiredSkills = Array.isArray(parsed.requiredSkills)
      ? parsed.requiredSkills.map((item) => String(item).trim()).filter((item) => item.length > 0)
      : typeof parsed.requiredSkills === 'string'
        ? parsed.requiredSkills.split(',').map((item) => item.trim()).filter((item) => item.length > 0)
        : [];
    const additionalNeeds = typeof parsed.additionalNeeds === 'string' ? parsed.additionalNeeds.trim() : '';

    return {
      requiredSkills: requiredSkills.length > 0 ? requiredSkills : undefined,
      additionalNeeds: additionalNeeds.length > 0 ? additionalNeeds : undefined,
    };
  } catch {
    const parts = warning.split('|').map((part) => part.trim()).filter((part) => part.length > 0);
    const skillsPart = parts.find((part) => part.toLowerCase().startsWith('requested skills:'));
    const additionalPart = parts.find((part) => part.toLowerCase().startsWith('additional needs:'));

    const requiredSkills = skillsPart
      ? skillsPart.replace(/requested skills:/i, '').split(',').map((item) => item.trim()).filter((item) => item.length > 0)
      : [];
    const additionalNeeds = additionalPart
      ? additionalPart.replace(/additional needs:/i, '').trim()
      : '';

    return {
      requiredSkills: requiredSkills.length > 0 ? requiredSkills : undefined,
      additionalNeeds: additionalNeeds.length > 0 ? additionalNeeds : undefined,
      rawText: warning,
    };
  }
};

export function DecisionPanel() {
  const { addToast } = useFeedbackToast();
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null);
  const [prediction, setPrediction] = useState<GeneralManagerProjectPrediction | null>(null);
  const [isPredictionLoading, setIsPredictionLoading] = useState(false);
  const [contractDecisions, setContractDecisions] = useState<ContractDecision[]>([]);
  const [pendingAssignmentRequests, setPendingAssignmentRequests] = useState<GeneralManagerAssignmentRequest[]>([]);
  const [marketingDraftProjects, setMarketingDraftProjects] = useState<GeneralManagerMarketingDraftProject[]>([]);
  const [isLoadingMarketingDraftProjects, setIsLoadingMarketingDraftProjects] = useState(false);
  const [isLoadingPendingRequests, setIsLoadingPendingRequests] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mapContractDecisions = (decisions: Awaited<ReturnType<typeof fetchGeneralManagerContractDecisions>>): ContractDecision[] => {
    return decisions.map((decision) => ({
      id: decision.decisionId,
      employeeName: decision.employeeName,
      employeeAvatar: decision.employeeAvatar,
      contractEndDate: decision.contractEndDate ?? 'TBD',
      jobTitle: decision.jobTitle,
      availabilityPercent: decision.availabilityPercent,
      workloadPercent: decision.workloadPercent,
      activeAssignmentCount: decision.activeAssignmentCount,
      decisionType: decision.decisionType,
      decisionStatus: decision.decisionStatus,
    }));
  };

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
        const activeSummaries = projectResult.value.filter(
          (summary) => !isFinishedProject(summary)
        );

        const teamResults = await Promise.all(
          activeSummaries.map(async (summary) => {
            try {
              const team = await fetchProjectManagerProjectTeam(defaultPmUserId, summary.id);

              return {
                projectId: summary.id,
                teamMembers: team.map((member) => member.fullName),
              };
            } catch {
              return {
                projectId: summary.id,
                teamMembers: [] as string[],
              };
            }
          })
        );

        const teamMap = new Map(teamResults.map((entry) => [entry.projectId, entry.teamMembers]));
        const backendProjects = activeSummaries.map((summary) =>
          mapSummaryToProject(summary, teamMap.get(summary.id) ?? [])
        );

        const initialProject = backendProjects[0] ?? null;

        setProjects(backendProjects);
        setSelectedProject(initialProject);
      } else {
        setProjects([]);
        setSelectedProject(null);
        setPrediction(null);
      }

      if (contractResult.status === 'fulfilled' && contractResult.value.length > 0) {
        setContractDecisions(mapContractDecisions(contractResult.value));
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

    const loadMarketingDraftProjects = async () => {
      setIsLoadingMarketingDraftProjects(true);

      try {
        const projects = await fetchGeneralManagerMarketingDraftProjects();

        if (!isMounted) {
          return;
        }

        setMarketingDraftProjects(projects);
      } catch {
        if (!isMounted) {
          return;
        }

        setMarketingDraftProjects([]);
      } finally {
        if (isMounted) {
          setIsLoadingMarketingDraftProjects(false);
        }
      }
    };

    void loadMarketingDraftProjects();

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
      if (recommendation.type === 'add-resource') {
        const employeeId = recommendation.metadata?.employeeId;
        const roleName = recommendation.metadata?.roleName;
        const allocationPercent = 0;

        if (!employeeId || !roleName) {
          addToast({
            type: 'error',
            title: 'Assignment Data Missing',
            message: 'This recommendation does not include enough data for auto-assignment.',
          });
          return false;
        }

        await createProjectManagerChangeRequest({
          projectId: selectedProject.id,
          employeeId,
          assignedByUserId: defaultDecisionActorUserId,
          roleName,
          startDate: selectedProject.startDate,
          endDate: selectedProject.endDate,
          allocationPercent,
          requiredSkills: recommendation.metadata?.requiredSkills ?? [],
          additionalNeeds: 'Auto-assigned from GM recommendation apply action.',
        });

        const refreshedTeam = await fetchProjectManagerProjectTeam(defaultPmUserId, selectedProject.id);
        const refreshedNames = refreshedTeam.map((member) => member.fullName);

        setProjects((prev) =>
          prev.map((project) =>
            project.id === selectedProject.id
              ? {
                ...project,
                assignedResources: refreshedNames,
              }
              : project
          )
        );

        setSelectedProject((prev) =>
          prev && prev.id === selectedProject.id
            ? {
              ...prev,
              assignedResources: refreshedNames,
            }
            : prev
        );
      }

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
        message:
          recommendation.type === 'add-resource'
            ? `${recommendation.title} was auto-assigned and submitted to backend successfully.`
            : `${recommendation.title} has been submitted to backend successfully.`,
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

  const handleContractDecision = async (decisionId: string, action: 'ExtendContract' | 'TerminateContract') => {
    try {
      addToast({
        type: 'info',
        title: 'HR Review Requested',
        message:
          action === 'ExtendContract'
            ? 'GM request to extend contract has been forwarded to HR for final decision.'
            : 'GM request to terminate contract has been forwarded to HR for final decision.',
      });
    } catch {
      addToast({
        type: 'error',
        title: 'Request Failed',
        message: 'Unable to send request to HR. Please try again.',
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

  const handleApproveMarketingDraftProject = async (
    project: GeneralManagerMarketingDraftProject,
    pmOwnerUserId?: string
  ) => {
    try {
      const success = await reviewGeneralManagerMarketingDraftProject(project.id, 'Approved', undefined, pmOwnerUserId);

      if (!success) {
        addToast({
          type: 'error',
          title: 'Approval Failed',
          message: `Unable to approve ${project.name}. Please try again.`,
        });
        return false;
      }

      setMarketingDraftProjects((prev) => prev.filter((item) => item.id !== project.id));

      addToast({
        type: 'success',
        title: 'Draft Approved',
        message: `${project.name} is approved and can now move to allocation planning.`,
      });

      return true;
    } catch {
      addToast({
        type: 'error',
        title: 'Approval Failed',
        message: `Unable to approve ${project.name}. Please try again.`,
      });

      return false;
    }
  };

  const handleRejectMarketingDraftProject = async (
    project: GeneralManagerMarketingDraftProject,
    rejectionReason: string
  ) => {
    try {
      const success = await reviewGeneralManagerMarketingDraftProject(project.id, 'Rejected', rejectionReason);

      if (!success) {
        addToast({
          type: 'error',
          title: 'Rejection Failed',
          message: `Unable to reject ${project.name}. Please try again.`,
        });
        return false;
      }

      setMarketingDraftProjects((prev) => prev.filter((item) => item.id !== project.id));

      addToast({
        type: 'info',
        title: 'Draft Rejected',
        message: `${project.name} was rejected and marketing has been notified with your feedback.`,
      });

      return true;
    } catch {
      addToast({
        type: 'error',
        title: 'Rejection Failed',
        message: `Unable to reject ${project.name}. Please try again.`,
      });

      return false;
    }
  };

  const recommendations = useMemo(() => {
    if (!selectedProject || !prediction) {
      return [];
    }

    return buildRecommendationsFromPrediction(
      prediction,
      selectedProject.assignedResources,
      selectedProject.requiredResources
    );
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
                onRequestHrReview={handleContractDecision}
              />

              <MarketingDraftReviewSection
                projects={marketingDraftProjects}
                isLoading={isLoadingMarketingDraftProjects}
                onApprove={handleApproveMarketingDraftProject}
                onReject={handleRejectMarketingDraftProject}
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
                      const metadata = parseConflictWarning(request.conflictWarning);

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
                                  {metadata.requiredSkills.join(', ')}
                                </p>
                              )}
                              {metadata.additionalNeeds && (
                                <p className="text-gray-700">
                                  <span className="font-medium">Additional Needs:</span>{' '}
                                  {metadata.additionalNeeds}
                                </p>
                              )}
                              {!metadata.requiredSkills && !metadata.additionalNeeds && metadata.rawText && (
                                <p className="text-gray-700">
                                  <span className="font-medium">Notes:</span>{' '}
                                  {metadata.rawText}
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
