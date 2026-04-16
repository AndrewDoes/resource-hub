import { ProjectData, AIRecommendation } from './types';

export const getRiskColor = (risk: string) => {
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

export const getStatusColor = (status: string) => {
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

export const getPerformanceBadge = (performance: string) => {
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

// Generate AI recommendations based on project data
export const generateRecommendations = (project: ProjectData): AIRecommendation[] => {
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
      reasoning:
        'Lower priority projects have buffer time. Temporarily moving a specialist can help complete critical components faster.',
    });
  }

  return recommendations;
};
