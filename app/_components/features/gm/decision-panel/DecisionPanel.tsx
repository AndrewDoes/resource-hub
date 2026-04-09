'use client';

import { useEffect, useMemo, useState } from 'react';
import { Lightbulb } from 'lucide-react';
import { useFeedbackToast } from '@/app/context/ToastContext';

// Types, Data and Utils
import { ProjectData, ContractDecision, AIRecommendation } from './types';
import { mockProjects, mockContractDecisions } from './data';
import { generateRecommendations } from './utils';
import {
  fetchGeneralManagerContractDecisions,
  fetchGeneralManagerProjectPrediction,
  type GeneralManagerProjectPrediction,
} from '@/functions/api/generalManager';
import {
  fetchProjectManagerProjects,
  projectManagerFallbackProjects,
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
  projectPrediction: GeneralManagerProjectPrediction,
  fallbackProject: ProjectData
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

  if (recommendations.length === 0) {
    return generateRecommendations(fallbackProject);
  }

  return recommendations;
};

export function DecisionPanel() {
  const { addToast } = useFeedbackToast();
  const [projects, setProjects] = useState<ProjectData[]>(mockProjects);
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(mockProjects[0]);
  const [prediction, setPrediction] = useState<GeneralManagerProjectPrediction | null>(null);
  const [contractDecisions, setContractDecisions] = useState<ContractDecision[]>(
    mockContractDecisions
  );
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
        const backendProjects = projectResult.value.length > 0
          ? projectResult.value.map((summary) => mapSummaryToProject(summary))
          : projectManagerFallbackProjects.map((summary) => mapSummaryToProject(summary));

        const initialProject = backendProjects[0] ?? mockProjects[0];

        setProjects(backendProjects.length > 0 ? backendProjects : mockProjects);
        setSelectedProject(initialProject);

        if (initialProject) {
          try {
            const projectPrediction = await fetchGeneralManagerProjectPrediction(initialProject.id, 5);
            if (!isMounted) {
              return;
            }

            setPrediction(projectPrediction);
          } catch {
            if (!isMounted) {
              return;
            }

            setPrediction(null);
          }
        }
      } else {
        setProjects(mockProjects);
        setSelectedProject(mockProjects[0]);
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
        setContractDecisions(mockContractDecisions);
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

  const recommendations = useMemo(() => {
    if (!selectedProject) {
      return [];
    }

    if (prediction) {
      return buildRecommendationsFromPrediction(prediction, selectedProject);
    }

    return generateRecommendations(selectedProject);
  }, [prediction, selectedProject]);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <DecisionHeader />

      {error && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Showing fallback project data because the backend request failed: {error}
        </div>
      )}

      {isLoading && (
        <div className="mb-4 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-500 shadow-sm">
          Loading live project predictions...
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
              if (prediction && selectedProject?.id !== project.id) {
                void fetchGeneralManagerProjectPrediction(project.id, 5)
                  .then((result) => setPrediction(result))
                  .catch(() => setPrediction(null));
              }
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
                onModify={handleModifyPlan}
              />

              {/* Contract Decision Section */}
              <ContractDecisionSection
                decisions={contractDecisions}
                onDecision={handleContractDecision}
              />
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
