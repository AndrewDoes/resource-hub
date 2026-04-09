'use client';

import { useState } from 'react';
import { Lightbulb } from 'lucide-react';
import { useFeedbackToast } from '../../../context/ToastContext';

// Types, Data and Utils
import { ProjectData, ContractDecision, AIRecommendation } from './types';
import { mockProjects, mockContractDecisions } from './data';
import { generateRecommendations } from './utils';

// Sub-components
import { DecisionHeader } from './components/DecisionHeader';
import { ProjectSidebar } from './components/ProjectSidebar';
import { ProjectContext } from './components/ProjectContext';
import { AIRecommendationSection } from './components/AIRecommendationSection';
import { ContractDecisionSection } from './components/ContractDecisionSection';

export function DecisionPanelAIPage() {
  const { addToast } = useFeedbackToast();
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(mockProjects[0]);
  const [contractDecisions, setContractDecisions] = useState<ContractDecision[]>(
    mockContractDecisions
  );

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

  const recommendations = selectedProject ? generateRecommendations(selectedProject) : [];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <DecisionHeader />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Selection Sidebar */}
        <div className="lg:col-span-1">
          <ProjectSidebar 
            projects={mockProjects} 
            selectedProjectId={selectedProject?.id} 
            onSelect={setSelectedProject} 
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
