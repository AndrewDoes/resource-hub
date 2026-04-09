/**
 * Helper function to calculate workload percentage from assigned hours
 * @param assignedHours Daily working hours assigned
 * @returns Workload percentage
 */
export const calculateWorkloadFromHours = (assignedHours: number): number => {
  return (assignedHours / 8) * 100;
};

/**
 * Helper function to calculate status from workload percentage
 * @param workloadPercent Workload percentage
 * @returns Status label
 */
export const calculateStatusFromWorkload = (workloadPercent: number): 'available' | 'moderate' | 'busy' | 'overloaded' => {
  if (workloadPercent <= 40) return 'available';
  if (workloadPercent <= 70) return 'moderate';
  if (workloadPercent <= 100) return 'busy';
  return 'overloaded';
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'available':
      return 'bg-green-100 text-green-700';
    case 'moderate':
      return 'bg-yellow-100 text-yellow-700';
    case 'busy':
      return 'bg-orange-100 text-orange-700';
    case 'overloaded':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};
