'use client';

import { Lightbulb } from 'lucide-react';
import { ProjectData, AIRecommendation } from '../types';
import { generateRecommendations } from '../utils';
import { ProjectContext } from './ProjectContext';
import { AIRecommendationSection } from './AIRecommendationSection';
import { useFeedbackToast } from '@/app/context/ToastContext';

interface AIDecisionPanelProps {
  selectedProject: ProjectData | null;
}

export function AIDecisionPanel({ selectedProject }: AIDecisionPanelProps) {
  const { addToast } = useFeedbackToast();

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

  const recommendations = selectedProject ? generateRecommendations(selectedProject) : [];

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
          Choose a project from the timeline to view AI recommendations and make decisions
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
        onModify={handleModifyPlan}
      />
    </div>
  );
}
