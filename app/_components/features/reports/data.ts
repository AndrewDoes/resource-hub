export const reportTypes = [
  {
    id: '1',
    title: 'Resource Utilization Report',
    description: 'Monthly breakdown of resource allocation and availability',
    lastGenerated: '2026-04-01',
    type: 'Monthly',
  },
  {
    id: '2',
    title: 'Project Performance Report',
    description: 'Analysis of project timelines and completion rates',
    lastGenerated: '2026-04-01',
    type: 'Quarterly',
  },
  {
    id: '3',
    title: 'Hiring Demand Forecast',
    description: 'Predicted hiring needs based on upcoming projects',
    lastGenerated: '2026-03-28',
    type: 'Weekly',
  },
  {
    id: '4',
    title: 'Skills Gap Analysis',
    description: 'Identified skill shortages and training recommendations',
    lastGenerated: '2026-03-25',
    type: 'Monthly',
  },
];

export const utilizationByDept = [
  { dept: 'Engineering', utilization: 92 },
  { dept: 'Design', utilization: 78 },
  { dept: 'Marketing', utilization: 65 },
  { dept: 'Sales', utilization: 88 },
  { dept: 'Support', utilization: 70 },
];

export const projectCompletion = [
  { month: 'Jan', completed: 8, total: 10 },
  { month: 'Feb', completed: 12, total: 14 },
  { month: 'Mar', completed: 10, total: 12 },
  { month: 'Apr', completed: 6, total: 15 },
];

export const skillDistribution = [
  { name: 'Development', value: 35, color: '#3B82F6' },
  { name: 'Design', value: 20, color: '#10B981' },
  { name: 'Marketing', value: 15, color: '#F59E0B' },
  { name: 'Management', value: 18, color: '#8B5CF6' },
  { name: 'Other', value: 12, color: '#6B7280' },
];
