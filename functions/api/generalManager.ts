import { BackendApiUrl } from "../BackendApiUrl";

export type GeneralManagerResourceStatus = "available" | "moderate" | "busy" | "overloaded";

export interface GeneralManagerWorkforceSummary {
  totalEmployeeCount: number;
  activeEmployeeCount: number;
  averageAvailabilityPercent: number;
  averageWorkloadPercent: number;
  overloadedEmployeeCount: number;
  topSkills: Array<{
    skillId: string;
    skillName: string;
    category: string;
    employeeCount: number;
    coveragePercent: number;
  }>;
}

export interface GeneralManagerProjectCandidatePrediction {
  employeeId: string;
  fullName: string;
  departmentName: string | null;
  jobTitle: string;
  fitScore: number;
  skillScore: number;
  capacityScore: number;
  historyScore: number;
  roleExperienceScore: number;
  availabilityPercent: number;
  workloadPercent: number;
  matchedSkills: string[];
  inferredSkills: string[];
  missingSkills: string[];
  reason: string;
}

export interface GeneralManagerProjectRequirementPrediction {
  requirementId: string;
  roleName: string;
  quantity: number;
  experienceLevel: string;
  requiredSkills: string[];
  coverageScore: number;
  bestCandidateScore: number;
  recommendedCandidates: GeneralManagerProjectCandidatePrediction[];
}

export interface GeneralManagerProjectPrediction {
  projectId: string;
  projectName: string;
  overallCoverageScore: number;
  staffingRiskScore: number;
  requiredResourceCount: number;
  candidatePoolSize: number;
  candidateLimit: number;
  requirements: GeneralManagerProjectRequirementPrediction[];
}

export interface GeneralManagerContractDecision {
  rowId: string;
  decisionId: string;
  employeeId: string;
  employeeName: string;
  employeeAvatar: string;
  jobTitle: string;
  contractEndDate: string | null;
  availabilityPercent: number;
  workloadPercent: number;
  activeAssignmentCount: number;
  decisionType: string;
  decisionStatus: string;
}

/**
 * Represents a high-level decision made by the General Manager (e.g., Extend Contract, Hire Resource).
 * These are typically grouped by project and can affect multiple employees.
 */
export interface GeneralManagerDecision {
  id: string;
  type: string;
  title: string;
  details: string;
  projectName: string;
  affectedEmployees: string[];
  deadline: string | null;
  submittedAt: string;
  status: string;
}

interface GeneralManagerWorkforceSummaryResponse {
  totalEmployeeCount?: unknown;
  activeEmployeeCount?: unknown;
  averageAvailabilityPercent?: unknown;
  averageWorkloadPercent?: unknown;
  overloadedEmployeeCount?: unknown;
  topSkills?: unknown;
  data?: unknown;
}

interface GeneralManagerProjectPredictionResponse {
  projectId?: unknown;
  projectName?: unknown;
  overallCoverageScore?: unknown;
  staffingRiskScore?: unknown;
  requiredResourceCount?: unknown;
  candidatePoolSize?: unknown;
  candidateLimit?: unknown;
  requirements?: unknown;
}

interface GeneralManagerContractDecisionResponse {
  decisions?: unknown;
}

const asNumber = (value: unknown, fallback: number): number => {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
};

const asString = (value: unknown, fallback: string): string => {
  return typeof value === "string" && value.trim().length > 0 ? value : fallback;
};

const withQuery = (path: string, params: Record<string, string | undefined>): string => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (typeof value === "string" && value.length > 0) {
      searchParams.set(key, value);
    }
  });

  const query = searchParams.toString();
  return query.length > 0 ? `${path}?${query}` : path;
};

const normalizeTopSkills = (value: unknown): GeneralManagerWorkforceSummary["topSkills"] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item, index) => {
    const record = item as Record<string, unknown>;

    return {
      skillId: asString(record.skillId ?? record.skill_id, String(index + 1)),
      skillName: asString(record.skillName ?? record.skill_name, "Unknown skill"),
      category: asString(record.category, "General"),
      employeeCount: asNumber(record.employeeCount ?? record.employee_count, 0),
      coveragePercent: asNumber(record.coveragePercent ?? record.coverage_percent, 0),
    };
  });
};

const normalizeWorkforceSummary = (payload: unknown): GeneralManagerWorkforceSummary => {
  const source = (payload as GeneralManagerWorkforceSummaryResponse | null)?.data ?? payload;
  const record = source as Record<string, unknown>;

  return {
    totalEmployeeCount: asNumber(record.totalEmployeeCount, 0),
    activeEmployeeCount: asNumber(record.activeEmployeeCount, 0),
    averageAvailabilityPercent: asNumber(record.averageAvailabilityPercent, 0),
    averageWorkloadPercent: asNumber(record.averageWorkloadPercent, 0),
    overloadedEmployeeCount: asNumber(record.overloadedEmployeeCount, 0),
    topSkills: normalizeTopSkills(record.topSkills),
  };
};

const normalizeCandidates = (value: unknown): GeneralManagerProjectCandidatePrediction[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item, index) => {
    const record = item as Record<string, unknown>;

    return {
      employeeId: asString(record.employeeId ?? record.employee_id, String(index + 1)),
      fullName: asString(record.fullName ?? record.full_name, "Unknown Employee"),
      departmentName: typeof record.departmentName === "string" ? record.departmentName : typeof record.department_name === "string" ? record.department_name : null,
      jobTitle: asString(record.jobTitle ?? record.job_title, "Unknown Role"),
      fitScore: asNumber(record.fitScore ?? record.fit_score, 0),
      skillScore: asNumber(record.skillScore ?? record.skill_score, 0),
      capacityScore: asNumber(record.capacityScore ?? record.capacity_score, 0),
      historyScore: asNumber(record.historyScore ?? record.history_score, 0),
      roleExperienceScore: asNumber(record.roleExperienceScore ?? record.role_experience_score, 0),
      availabilityPercent: asNumber(record.availabilityPercent ?? record.availability_percent, 0),
      workloadPercent: asNumber(record.workloadPercent ?? record.workload_percent, 0),
      matchedSkills: Array.isArray(record.matchedSkills) ? record.matchedSkills.map(String) : [],
      inferredSkills: Array.isArray(record.inferredSkills) ? record.inferredSkills.map(String) : [],
      missingSkills: Array.isArray(record.missingSkills) ? record.missingSkills.map(String) : [],
      reason: asString(record.reason, "No reason provided"),
    };
  });
};

const normalizeRequirements = (payload: unknown): GeneralManagerProjectRequirementPrediction[] => {
  if (!Array.isArray(payload)) {
    return [];
  }

  return payload.map((item, index) => {
    const record = item as Record<string, unknown>;

    return {
      requirementId: asString(record.requirementId ?? record.requirement_id, String(index + 1)),
      roleName: asString(record.roleName ?? record.role_name, "Unknown Role"),
      quantity: asNumber(record.quantity, 0),
      experienceLevel: asString(record.experienceLevel ?? record.experience_level, "Unknown"),
      requiredSkills: Array.isArray(record.requiredSkills) ? record.requiredSkills.map(String) : [],
      coverageScore: asNumber(record.coverageScore ?? record.coverage_score, 0),
      bestCandidateScore: asNumber(record.bestCandidateScore ?? record.best_candidate_score, 0),
      recommendedCandidates: normalizeCandidates(record.recommendedCandidates ?? record.recommended_candidates),
    };
  });
};

const normalizeProjectPrediction = (payload: unknown): GeneralManagerProjectPrediction => {
  const source = (payload as GeneralManagerProjectPredictionResponse | null)?.data ?? payload;
  const record = source as Record<string, unknown>;

  return {
    projectId: asString(record.projectId, ""),
    projectName: asString(record.projectName, "Untitled Project"),
    overallCoverageScore: asNumber(record.overallCoverageScore, 0),
    staffingRiskScore: asNumber(record.staffingRiskScore, 0),
    requiredResourceCount: asNumber(record.requiredResourceCount, 0),
    candidatePoolSize: asNumber(record.candidatePoolSize, 0),
    candidateLimit: asNumber(record.candidateLimit, 0),
    requirements: normalizeRequirements(record.requirements),
  };
};

const normalizeContractDecisions = (payload: unknown): GeneralManagerContractDecision[] => {
  const source = (payload as GeneralManagerContractDecisionResponse | null)?.data ?? payload;
  const record = source as Record<string, unknown>;
  const decisions = Array.isArray(record.decisions) ? record.decisions : [];

  return decisions.map((item, index) => {
    const decision = item as Record<string, unknown>;

    return {
      rowId: `${asString(decision.decisionId ?? decision.decision_id, String(index + 1))}-${asString(decision.employeeId ?? decision.employee_id, String(index + 1))}`,
      decisionId: asString(decision.decisionId ?? decision.decision_id, String(index + 1)),
      employeeId: asString(decision.employeeId ?? decision.employee_id, String(index + 1)),
      employeeName: asString(decision.employeeName ?? decision.employee_name, "Unknown Employee"),
      employeeAvatar: asString(decision.employeeAvatar ?? decision.employee_avatar, "U"),
      jobTitle: asString(decision.jobTitle ?? decision.job_title, "Unknown role"),
      contractEndDate: typeof decision.contractEndDate === "string"
        ? decision.contractEndDate
        : typeof decision.contract_end_date === "string"
          ? decision.contract_end_date
          : null,
      availabilityPercent: asNumber(decision.availabilityPercent ?? decision.availability_percent, 0),
      workloadPercent: asNumber(decision.workloadPercent ?? decision.workload_percent, 0),
      activeAssignmentCount: asNumber(decision.activeAssignmentCount ?? decision.active_assignment_count, 0),
      decisionType: asString(decision.decisionType ?? decision.decision_type, "Unknown"),
      decisionStatus: asString(decision.decisionStatus ?? decision.decision_status, "Pending"),
    };
  });
};

export async function fetchGeneralManagerWorkforceSummary(): Promise<GeneralManagerWorkforceSummary> {
  const response = await fetch(BackendApiUrl.generalManagerWorkforceSummary);

  if (!response.ok) {
    throw new Error(`Failed to load workforce summary (${response.status})`);
  }

  const payload: unknown = await response.json();
  return normalizeWorkforceSummary(payload);
}

export async function fetchGeneralManagerProjectPrediction(projectId: string, candidateLimit?: number): Promise<GeneralManagerProjectPrediction> {
  const url = withQuery(BackendApiUrl.generalManagerProjectPrediction(projectId), {
    candidateLimit: typeof candidateLimit === "number" ? String(candidateLimit) : undefined,
  });

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to load project prediction (${response.status})`);
  }

  const payload: unknown = await response.json();
  return normalizeProjectPrediction(payload);
}

export async function fetchGeneralManagerContractDecisions(): Promise<GeneralManagerContractDecision[]> {
  const response = await fetch(BackendApiUrl.generalManagerContractDecisions);

  if (!response.ok) {
    throw new Error(`Failed to load contract decisions (${response.status})`);
  }

  const payload: unknown = await response.json();
  return normalizeContractDecisions(payload);
}

/**
 * Normalizes the raw API response for general decisions into the frontend interface.
 */
const normalizeDecisions = (payload: unknown): GeneralManagerDecision[] => {
  const source = (payload as { decisions?: unknown } | null)?.decisions ?? payload;
  const decisions = Array.isArray(source) ? source : [];

  return decisions.map((item, index) => {
    const record = item as Record<string, unknown>;

    return {
      id: asString(record.id, String(index + 1)),
      type: asString(record.type, "Unknown"),
      title: asString(record.title, "Untitled Decision"),
      details: asString(record.details, ""),
      projectName: asString(record.projectName ?? record.project_name, "General"),
      affectedEmployees: Array.isArray(record.affectedEmployees ?? record.affected_employees)
        ? (record.affectedEmployees ?? record.affected_employees) as string[]
        : [],
      deadline: typeof record.deadline === "string" ? record.deadline : null,
      submittedAt: asString(record.submittedAt ?? record.submitted_at, new Date().toISOString()),
      status: asString(record.status, "Pending"),
    };
  });
};

/**
 * Fetches the list of all high-level decisions made by the General Manager.
 */
export async function fetchGeneralManagerDecisions(): Promise<GeneralManagerDecision[]> {
  const response = await fetch(BackendApiUrl.generalManagerDecisions);

  if (!response.ok) {
    throw new Error(`Failed to load decisions (${response.status})`);
  }

  const payload: unknown = await response.json();
  return normalizeDecisions(payload);
}

export const generalManagerFallbackSummary: GeneralManagerWorkforceSummary = {
  totalEmployeeCount: 5,
  activeEmployeeCount: 5,
  averageAvailabilityPercent: 72,
  averageWorkloadPercent: 56,
  overloadedEmployeeCount: 1,
  topSkills: [
    {
      skillId: "1",
      skillName: "Node.js",
      category: "Technical",
      employeeCount: 3,
      coveragePercent: 60,
    },
    {
      skillId: "2",
      skillName: "React",
      category: "Technical",
      employeeCount: 3,
      coveragePercent: 60,
    },
    {
      skillId: "3",
      skillName: "PostgreSQL",
      category: "Technical",
      employeeCount: 2,
      coveragePercent: 40,
    },
  ],
};