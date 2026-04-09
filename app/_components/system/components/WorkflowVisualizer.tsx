'use client';

import { AlertTriangle, CheckCircle } from 'lucide-react';
import { ProjectStatus } from '../types';
import { workflowSteps } from '../data';
import { StatusBadge } from './StatusBadge';

interface WorkflowVisualizerProps {
  currentStatus: ProjectStatus;
  compact?: boolean;
}

export function WorkflowVisualizer({ currentStatus, compact = false }: WorkflowVisualizerProps) {
  const getCurrentStepIndex = () => {
    for (let i = 0; i < workflowSteps.length; i++) {
      if (workflowSteps[i].status.includes(currentStatus)) {
        return i;
      }
    }
    return 0;
  };

  const currentStepIndex = getCurrentStepIndex();

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <StatusBadge status={currentStatus} />
        <span className="text-xs text-gray-500">
          Step {currentStepIndex + 1} of {workflowSteps.length}
        </span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Workflow</h3>

      <div className="space-y-4">
        {workflowSteps.map((step, index) => {
          const isActive = index === currentStepIndex;
          const isCompleted = index < currentStepIndex;
          const isPending = index > currentStepIndex;

          return (
            <div key={step.role} className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${isActive
                    ? `bg-linear-to-br ${step.color} text-white shadow-md`
                    : isCompleted
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-400'
                    }`}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-semibold">{index + 1}</span>
                  )}
                </div>
                {index < workflowSteps.length - 1 && (
                  <div
                    className={`w-0.5 h-12 ${isCompleted ? 'bg-green-300' : 'bg-gray-200'
                      }`}
                  />
                )}
              </div>

              <div className="flex-1 pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <h4
                    className={`font-semibold ${isActive ? 'text-gray-900' : isPending ? 'text-gray-400' : 'text-gray-700'
                      }`}
                  >
                    {step.role}
                  </h4>
                  {isActive && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                      Current
                    </span>
                  )}
                </div>
                <p
                  className={`text-sm ${isActive ? 'text-gray-600' : 'text-gray-400'
                    }`}
                >
                  {step.description}
                </p>
                {isActive && (
                  <div className="mt-2">
                    <StatusBadge status={currentStatus} />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Revision Loop Indicator */}
      {currentStatus === 'rejected' && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-900">Project Rejected</p>
              <p className="text-sm text-red-700 mt-1">
                Marketing can revise and resubmit the project proposal
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
