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

interface GeneralManagerWorkforceSummaryResponse {
  totalEmployeeCount?: unknown;
  activeEmployeeCount?: unknown;
  averageAvailabilityPercent?: unknown;
  averageWorkloadPercent?: unknown;
  overloadedEmployeeCount?: unknown;
  topSkills?: unknown;
  data?: unknown;
}

const asNumber = (value: unknown, fallback: number): number => {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
};

const asString = (value: unknown, fallback: string): string => {
  return typeof value === "string" && value.trim().length > 0 ? value : fallback;
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

export async function fetchGeneralManagerWorkforceSummary(): Promise<GeneralManagerWorkforceSummary> {
  const response = await fetch(BackendApiUrl.generalManagerWorkforceSummary);

  if (!response.ok) {
    throw new Error(`Failed to load workforce summary (${response.status})`);
  }

  const payload: unknown = await response.json();
  return normalizeWorkforceSummary(payload);
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