export interface SkillItem {
  id: string;
  name: string;
  category: string;
}

export interface ProjectFormData {
  name: string;
  clientName: string;
  startDate: string;
  endDate: string;
  notes: string;
  attachments?: File[];
}

export interface ResourceRequirement {
  id: string;
  role: string;
  quantity: number;
  experienceLevel: string;
  requiredSkills: SkillItem[];
  notes: string;
}

export interface RejectedProject {
  id: string;
  name: string;
  clientName: string;
  rejectionReason: string;
  rejectedDate: string;
  gmFeedback: string;
}

export interface SuggestedEmployee {
  name: string;
  skills: string[];
  match: number;
}
