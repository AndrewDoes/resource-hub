import { RejectedProject } from '../types';

// Structured skill categories
export const skillCategories = {
  'Technical Skills': [
    'React',
    'Node.js',
    'Python',
    'JavaScript',
    'TypeScript',
    'Java',
    'C++',
    'SQL',
    'MongoDB',
    'PostgreSQL',
    'AWS',
    'Docker',
    'Kubernetes',
    'DevOps',
    'CI/CD',
    'API Development',
    'Mobile Development',
    'iOS',
    'Android',
    'React Native',
    'UI/UX Design',
    'Figma',
    'Adobe Suite',
    'HTML/CSS',
  ],
  'Soft Skills': [
    'Project Management',
    'Communication',
    'Leadership',
    'Critical Thinking',
    'Problem Solving',
    'Collaboration',
    'Time Management',
    'Adaptability',
    'Creativity',
  ],
  'Business Skills': [
    'Marketing',
    'Content Writing',
    'SEO',
    'Data Analysis',
    'Strategy',
    'Sales',
    'Client Management',
    'Budget Planning',
  ],
};

export const allSkills = Object.values(skillCategories).flat();

export const roleOptions = [
  'Backend Developer',
  'Frontend Developer',
  'Full Stack Developer',
  'UI/UX Designer',
  'QA Engineer',
  'Project Manager',
  'DevOps Engineer',
  'Data Analyst',
  'Marketing Specialist',
  'Content Writer',
];

export const experienceLevels = ['Junior', 'Mid', 'Senior'];

export const rejectedProjects: RejectedProject[] = [
  {
    id: 'rejected-1',
    name: 'Marketing Automation Platform',
    clientName: 'Global Retail Co',
    rejectionReason: 'Timeline is too aggressive given current resource availability. Please extend to Q3 or reduce scope.',
    rejectedDate: '2026-04-03',
    gmFeedback: 'The proposed 2-month timeline conflicts with existing Website Redesign project. Consider Q3 start date instead.',
  },
];
