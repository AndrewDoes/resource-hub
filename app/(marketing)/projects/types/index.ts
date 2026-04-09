export interface ResourceRequirement {
  id: string;
  role: string;
  quantity: number;
  experienceLevel: string;
  requiredSkills: string[];
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
