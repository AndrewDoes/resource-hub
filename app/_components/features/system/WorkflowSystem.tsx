'use client';
import { ArrowRight, CheckCircle, Clock, XCircle, AlertTriangle } from 'lucide-react';

export type ProjectStatus =
  | 'draft'
  | 'submitted'
  | 'approved'
  | 'rejected'
  | 'assigned'
  | 'in-progress'
  | 'completed'
  | 'cancelled';

interface WorkflowStep {
  role: string;
  status: ProjectStatus[];
  description: string;
  color: string;
}

const workflowSteps: WorkflowStep[] = [
  {
    role: 'Marketing',
    status: ['draft', 'submitted'],
    description: 'Create and submit project proposal',
    color: 'from-purple-500 to-pink-500',
  },
  {
    role: 'General Manager',
    status: ['submitted', 'approved', 'rejected'],
    description: 'Review and approve/reject proposal',
    color: 'from-blue-500 to-green-500',
  },
  {
    role: 'Project Manager',
    status: ['approved', 'assigned'],
    description: 'Review project and provide feedback',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    role: 'HR',
    status: ['assigned'],
    description: 'Validate and approve resource assignments',
    color: 'from-green-500 to-teal-500',
  },
  {
    role: 'Employee',
    status: ['assigned', 'in-progress', 'completed'],
    description: 'Accept assignment and execute work',
    color: 'from-orange-500 to-yellow-500',
  },
];

interface StatusBadgeProps {
  status: ProjectStatus;
  showLabel?: boolean;
}

export function StatusBadge({ status, showLabel = true }: StatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'draft':
        return { icon: Clock, bg: 'bg-gray-100', text: 'text-gray-700', label: 'Draft' };
      case 'submitted':
        return { icon: Clock, bg: 'bg-blue-100', text: 'text-blue-700', label: 'Submitted' };
      case 'approved':
        return { icon: CheckCircle, bg: 'bg-green-100', text: 'text-green-700', label: 'Approved' };
      case 'rejected':
        return { icon: XCircle, bg: 'bg-red-100', text: 'text-red-700', label: 'Rejected' };
      case 'assigned':
        return { icon: CheckCircle, bg: 'bg-purple-100', text: 'text-purple-700', label: 'Assigned' };
      case 'in-progress':
        return { icon: Clock, bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'In Progress' };
      case 'completed':
        return { icon: CheckCircle, bg: 'bg-green-100', text: 'text-green-700', label: 'Completed' };
      case 'cancelled':
        return { icon: XCircle, bg: 'bg-gray-100', text: 'text-gray-700', label: 'Cancelled' };
      default:
        return { icon: Clock, bg: 'bg-gray-100', text: 'text-gray-700', label: 'Unknown' };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      <Icon className="w-3.5 h-3.5" />
      {showLabel && config.label}
    </span>
  );
}

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

interface StatusTransitionProps {
  from: ProjectStatus;
  to: ProjectStatus;
}

export function StatusTransition({ from, to }: StatusTransitionProps) {
  return (
    <div className="flex items-center gap-3">
      <StatusBadge status={from} />
      <ArrowRight className="w-5 h-5 text-gray-400" />
      <StatusBadge status={to} />
    </div>
  );
}
