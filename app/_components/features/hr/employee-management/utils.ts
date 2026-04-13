export const getDecisionTypeLabel = (type: string) => {
  switch (type) {
    case 'extend-contract':
      return 'Extend Contract';
    case 'terminate-contract':
      return 'Terminate Contract';
    case 'hire-resource':
      return 'Hire New Resource';
    default:
      return type;
  }
};

export const getDecisionTypeColor = (type: string) => {
  switch (type) {
    case 'extend-contract':
      return 'bg-green-100 text-green-700';
    case 'terminate-contract':
      return 'bg-red-100 text-red-700';
    case 'hire-resource':
      return 'bg-blue-100 text-blue-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
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

/**
 * Helper function to calculate workload percentage from assigned hours
 * @param assignedHours Daily working hours assigned
 * @returns Workload percentage
 */
export const calculateWorkloadFromHours = (assignedHours: number): number => {
  return (assignedHours / 8) * 100;
};

/**
 * Calculate status based on assigned hours
 * @param assignedHours Daily working hours assigned
 * @returns Status label
 */
export const calculateStatus = (assignedHours: number): 'available' | 'moderate' | 'busy' | 'overloaded' => {
  const workloadPercent = calculateWorkloadFromHours(assignedHours);
  console.log(`Assigned Hours: ${assignedHours}, Workload Percent: ${workloadPercent}`);
  if (workloadPercent <= 40) return 'available';
  if (workloadPercent <= 70) return 'moderate';
  if (workloadPercent <= 100) return 'busy';
  return 'overloaded';
};

/**
 * Helper for UnifiedEmployeeManagement availability status
 */
export const getAvailabilityStatus = (assignedHours: number) => {
  const status = calculateStatus(assignedHours);
  switch (status) {
    case 'available':
      return { label: 'Available', color: 'green' };
    case 'moderate':
      return { label: 'Moderate', color: 'yellow' };
    case 'busy':
      return { label: 'Busy', color: 'orange' };
    case 'overloaded':
      return { label: 'Overloaded', color: 'red' };
    default:
      return { label: 'Unknown', color: 'gray' };
  }
};

export const getEmployeeStatus = (employeeStatus: string) => {
  switch (employeeStatus) {
    case 'active':
      return { label: 'Active', color: 'green' };
    case 'inactive':
      return { label: 'Inactive', color: 'red' };
    case 'terminated':
      return { label: 'Terminated', color: 'gray' };
    default:
      return { label: 'Unknown', color: 'gray' };
  }
}
