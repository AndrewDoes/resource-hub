export interface CompletionStats {
  total: number;
  completed: number;
}

export const PROJECT_PROGRESS_WEIGHTS = {
  tasks: 0.7,
  milestones: 0.2,
  timeline: 0.1,
} as const;

export const clampPercent = (value: number): number => Math.max(0, Math.min(100, Math.round(value)));

const toRatio = (stats?: CompletionStats | null): number | null => {
  if (!stats || stats.total <= 0) {
    return null;
  }

  return stats.completed / stats.total;
};

export const isCompletedTimelineStatus = (status: string): boolean => {
  const normalized = status.toLowerCase().replace('_', '-');
  return normalized === 'completed';
};

export const calculateDerivedProgressPercent = (params: {
  tasks?: CompletionStats | null;
  milestones?: CompletionStats | null;
  timeline?: CompletionStats | null;
  fallbackPercent: number;
}): number => {
  const weightedRatios: Array<{ ratio: number; weight: number }> = [];

  const taskRatio = toRatio(params.tasks);
  if (taskRatio !== null) {
    weightedRatios.push({ ratio: taskRatio, weight: PROJECT_PROGRESS_WEIGHTS.tasks });
  }

  const milestoneRatio = toRatio(params.milestones);
  if (milestoneRatio !== null) {
    weightedRatios.push({ ratio: milestoneRatio, weight: PROJECT_PROGRESS_WEIGHTS.milestones });
  }

  const timelineRatio = toRatio(params.timeline);
  if (timelineRatio !== null) {
    weightedRatios.push({ ratio: timelineRatio, weight: PROJECT_PROGRESS_WEIGHTS.timeline });
  }

  if (weightedRatios.length === 0) {
    return clampPercent(params.fallbackPercent);
  }

  const totalWeight = weightedRatios.reduce((sum, item) => sum + item.weight, 0);
  const weightedProgress = weightedRatios.reduce((sum, item) => sum + item.ratio * item.weight, 0) / totalWeight;

  return clampPercent(weightedProgress * 100);
};
