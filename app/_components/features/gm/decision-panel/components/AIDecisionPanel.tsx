'use client';

import { useEffect, useMemo, useState } from 'react';
import { Lightbulb } from 'lucide-react';
import { ProjectData, AIRecommendation } from '../types';
import { ProjectContext } from './ProjectContext';
import { AIRecommendationSection } from './AIRecommendationSection';
import { useFeedbackToast } from '@/app/context/ToastContext';
import {
  fetchGeneralManagerProjectPrediction,
  submitGeneralManagerRecommendationResponse,
  type GeneralManagerProjectPrediction,
} from '@/functions/api/generalManager';
import { createProjectManagerChangeRequest } from '@/functions/api/projectManager';

interface AIDecisionPanelProps {
  selectedProject: ProjectData | null;
}

const defaultDecisionActorUserId =
  process.env.NEXT_PUBLIC_GM_USER_ID ??
  process.env.NEXT_PUBLIC_PM_USER_ID ??
  '11111111-1111-1111-1111-111111111111';

export function AIDecisionPanel({ selectedProject }: AIDecisionPanelProps) {
  const { addToast } = useFeedbackToast();
  const [prediction, setPrediction] = useState<GeneralManagerProjectPrediction | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadPrediction = async () => {
      if (!selectedProject) {
        setPrediction(null);
        return;
      }

      try {
        const result = await fetchGeneralManagerProjectPrediction(selectedProject.id, 5);

        if (!isMounted) {
          return;
        }

        setPrediction(result);
      } catch {
        if (!isMounted) {
          return;
        }

        setPrediction(null);
      }
    };

    void loadPrediction();

    return () => {
      isMounted = false;
    };
  }, [selectedProject?.id]);

  const recommendations = useMemo(() => {
    if (!prediction) {
      return [] as AIRecommendation[];
    }

    const items: AIRecommendation[] = [];

    if (prediction.staffingRiskScore >= 40) {
      items.push({
        id: 'risk-review',
        type: 'adjust-timeline',
        title: 'Review staffing risk',
        description: `Overall staffing risk is ${prediction.staffingRiskScore}%, so this project needs closer planning.`,
        impact: {
          time: 'Review needed',
          risk: prediction.staffingRiskScore >= 65 ? 'High to Medium' : 'Medium to Low',
        },
        reasoning: `Backend prediction shows ${prediction.overallCoverageScore}% coverage across ${prediction.requiredResourceCount} required resources.`,
      });
    }

    prediction.requirements.forEach((requirement, index) => {
      const topCandidate = requirement.recommendedCandidates[0];

      if (!topCandidate) {
        return;
      }

      items.push({
        id: `candidate-${requirement.requirementId}-${index}`,
        type: 'add-resource',
        title: `Assign ${topCandidate.fullName} to ${requirement.roleName}`,
        description: `${topCandidate.fullName} is the top fit for ${requirement.roleName} with a ${topCandidate.fitScore}% score.`,
        impact: {
          workload: `${Math.max(0, Math.round(topCandidate.capacityScore / 2))}%`,
          risk: prediction.staffingRiskScore >= 65 ? 'High to Medium' : 'Medium to Low',
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

    return items;
  }, [prediction]);

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
          additionalNeeds: 'Auto-assigned from GM planning recommendation apply action.',
        });
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

  if (!selectedProject) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 h-full flex flex-col items-center justify-center text-center">
        <div className="p-4 bg-linear-to-br from-blue-100 to-green-100 rounded-full mb-4">
          <Lightbulb className="w-10 h-10 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Select a Project to Begin
        </h3>
        <p className="text-sm text-gray-600">
          Choose a project from the timeline to view system recommendations and make decisions
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ProjectContext project={selectedProject} />
      
      <AIRecommendationSection 
        project={selectedProject}
        recommendations={recommendations}
        onApply={handleApplyRecommendation}
        onReject={handleRejectRecommendation}
      />
    </div>
  );
}
