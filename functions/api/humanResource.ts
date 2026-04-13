import { BackendApiUrl } from "../BackendApiUrl";
import { GeneralManagerContractDecision, GeneralManagerDecision } from "./generalManager";

export interface HREmployeeListItem {
  id: string;
  fullName: string;
  email: string;
  jobTitle: string;
  department: string | null;
  skills: string[];
  availabilityPercent: number;
  workloadPercent: number;
  status: string;
  assignedHours: number;
}

interface GetEmployeeListResponse {
  employees?: unknown;
  items?: unknown;
  data?: unknown;
}

interface GetEmployeeAssignmentsResponse {
  assignments?: unknown;
  items?: unknown;
  data?: unknown;
}

interface GMContractDecision {
  employeeName: string;
  projectName: string;
  action: 'extend-contract' | 'terminate-contract' | 'hire-resource';
  deadline: string;
  submittedDate: string;
  status: 'pending' | 'executed' | 'clarification-requested';
  details: string;
}

const asString = (value: unknown, fallback: string): string => {
  return typeof value === "string" && value.trim().length > 0 ? value : fallback;
};

const asNumber = (value: unknown, fallback: number): number => {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
};

const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const normalizeEmployees = (payload: unknown): HREmployeeListItem[] => {
  const source = Array.isArray(payload)
    ? payload
    : Array.isArray((payload as GetEmployeeListResponse | null)?.employees)
      ? (payload as GetEmployeeListResponse).employees
      : Array.isArray((payload as GetEmployeeListResponse | null)?.items)
        ? (payload as GetEmployeeListResponse).items
        : Array.isArray((payload as GetEmployeeListResponse | null)?.data)
          ? (payload as GetEmployeeListResponse).data
          : [];

  return (source as any[]).map((item, index) => {
    const record = item as Record<string, unknown>;
    const skillSource =
      record.skills ??
      record.Skills ??
      record.skillNames ??
      record.SkillNames ??
      record.employeeSkills ??
      record.EmployeeSkills;

    return {
      id: asString(record.id, String(index + 1)),
      fullName: asString(record.fullName ?? record.full_name, "Unknown Employee"),
      email: asString(record.email, "N/A"),
      jobTitle: asString(record.jobTitle ?? record.job_title, "Unknown Role"),
      department: typeof record.department === "string" ? record.department : null,
      skills: Array.isArray(skillSource) ? skillSource.map((skill) => String(skill)).filter((skill) => skill.trim().length > 0) : [],
      availabilityPercent: asNumber(record.availabilityPercent ?? record.availability_percent, 100),
      workloadPercent: asNumber(record.workloadPercent ?? record.workload_percent, 0),
      assignedHours: asNumber(record.assignedHours ?? record.assigned_hours, 0),
      status: asString(record.status, "Active"),
    };
  });
};

export async function fetchHREmployeeList(): Promise<HREmployeeListItem[]> {
  const response = await fetch(BackendApiUrl.employeesList);

  if (!response.ok) {
    throw new Error(`Failed to load employee list (${response.status})`);
  }

  const payload: unknown = await response.json();
  return normalizeEmployees(payload);
}

/**
 * Maps the backend HREmployeeListItem to the frontend Employee type.
 * This can be used in the component to bridge the API and the UI types.
 */
export const mapToUIEmployee = (apiItem: HREmployeeListItem): any => {
  return {
    id: apiItem.id,
    name: apiItem.fullName,
    avatar: getInitials(apiItem.fullName),
    role: apiItem.jobTitle,
    email: apiItem.email,
    phone: "", // Not in list API
    location: "", // Not in list API
    department: apiItem.department ?? "General",
    skills: apiItem.skills,
    status: apiItem.status.toLowerCase() === "active" ? "active" : "inactive",
    availability: apiItem.availabilityPercent,
    workload: apiItem.workloadPercent,
    assignedHours: apiItem.assignedHours,
    currentProjects: [], // Need separate API call if needed, or placeholder
    projectHistory: [],
    joinedDate: new Date().toISOString(),
  };
};

/**
 * Maps the backend HREmployeeListItem to the EmployeeStatus type used by Validation components.
 */
export const mapToUIEmployeeStatus = (apiItem: HREmployeeListItem): any => {
  return {
    id: apiItem.id,
    name: apiItem.fullName,
    avatar: getInitials(apiItem.fullName),
    status: apiItem.status.toLowerCase() === "active" ? "available" : "blocked", // UI status mapping logic
    currentProjects: [], // Not in list API
    assignedHours: apiItem.assignedHours,
  };
};

/**
 * Maps the GeneralManagerContractDecision to the UI ContractAction type.
 */
export const mapToUIContractAction = (decision: GeneralManagerContractDecision): any => {
  return {
    id: decision.decisionId,
    employeeName: decision.employeeName,
    employeeAvatar: decision.employeeAvatar,
    currentContractEnd: decision.contractEndDate ?? "N/A",
    assignedProject: "General / Cross-Project", // Backend doesn't link to single project for contract actions yet
    action: decision.decisionType.toLowerCase().includes("extend") ? "extend" : "terminate",
    gmDecisionId: decision.decisionId,
    status: decision.decisionStatus.toLowerCase() === "pending" ? "pending" : "executed",
  };
};

/**
 * Maps the GeneralManagerDecision into the UI-ready GMDecision type.
 * This classifies decisions as Extend Contract, Terminate Contract, or Hire Resource.
 */
export const mapToUIDecision = (decision: GeneralManagerDecision): any => {
  let type: 'extend-contract' | 'terminate-contract' | 'hire-resource' = 'extend-contract';
  const apiType = decision.type.toLowerCase();

  if (apiType.includes('extend')) type = 'extend-contract';
  else if (apiType.includes('terminate')) type = 'terminate-contract';
  else if (apiType.includes('hire')) type = 'hire-resource';

  return {
    id: decision.id,
    type,
    projectName: decision.projectName,
    affectedEmployees: decision.affectedEmployees,
    deadline: decision.deadline ?? 'No deadline',
    submittedDate: decision.submittedAt.split('T')[0],
    status: decision.status.toLowerCase() === 'pending' ? 'pending' :
      decision.status.toLowerCase().includes('clarification') ? 'clarification-requested' : 'executed',
    details: decision.details,
  };
};

export interface HRAssignmentRequestItem {
  id: string;
  projectId: string;
  projectName: string;
  employeeId: string;
  employeeName: string;
  roleName: string;
  status: string;
  allocationPercent: number;
  startDate: string;
  endDate: string;
  requestedByName: string;
}

interface EmployeeAssignmentListItem {
  id: string;
  projectId: string;
  projectName: string;
  status: string;
  allocationPercent: number;
}

const normalizeEmployeeAssignments = (payload: unknown): EmployeeAssignmentListItem[] => {
  const source = Array.isArray(payload)
    ? payload
    : Array.isArray((payload as GetEmployeeAssignmentsResponse | null)?.assignments)
      ? (payload as GetEmployeeAssignmentsResponse).assignments
      : Array.isArray((payload as GetEmployeeAssignmentsResponse | null)?.items)
        ? (payload as GetEmployeeAssignmentsResponse).items
        : Array.isArray((payload as GetEmployeeAssignmentsResponse | null)?.data)
          ? (payload as GetEmployeeAssignmentsResponse).data
          : [];

  return (source as any[]).map((item, index) => {
    const record = item as Record<string, unknown>;

    return {
      id: asString(record.id, String(index + 1)),
      projectId: asString(record.projectId, ""),
      projectName: asString(record.projectName, "Untitled Project"),
      status: asString(record.status, "Pending"),
      allocationPercent: asNumber(record.allocationPercent ?? record.allocation_percent, 0),
    };
  });
};

export async function fetchHREmployeeCurrentProjectsMap(employeeIds: string[]): Promise<Record<string, string[]>> {
  const activeStatuses = new Set(["pending", "approved", "accepted", "inprogress", "in-progress"]);

  const entries = await Promise.all(
    employeeIds.map(async (employeeId) => {
      try {
        const response = await fetch(`${BackendApiUrl.employees}/${employeeId}/assignments?pageNumber=1&pageSize=100`);

        if (!response.ok) {
          return [employeeId, [] as string[]] as const;
        }

        const payload: unknown = await response.json();
        const assignments = normalizeEmployeeAssignments(payload);

        const currentProjects = Array.from(
          new Set(
            assignments
              .filter((assignment) => activeStatuses.has(assignment.status.trim().toLowerCase()))
              .filter((assignment) => assignment.allocationPercent > 0)
              .map((assignment) => assignment.projectName)
              .filter((name) => name.trim().length > 0)
          )
        );

        return [employeeId, currentProjects] as const;
      } catch {
        return [employeeId, [] as string[]] as const;
      }
    })
  );

  return Object.fromEntries(entries);
}

export async function fetchHRAssignmentRequests(): Promise<HRAssignmentRequestItem[]> {
  const url = `${BackendApiUrl.assignmentsList}?status=Approved`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to load assignment requests (${response.status})`);
  }

  const payload: any = await response.json();
  const assignments = Array.isArray(payload.assignments) ? payload.assignments : [];

  return assignments.map((item: any) => ({
    id: asString(item.id, ""),
    projectId: asString(item.projectId, ""),
    projectName: asString(item.projectName, "Untitled Project"),
    employeeId: asString(item.employeeId, ""),
    employeeName: asString(item.employeeName, "Unknown Employee"),
    roleName: asString(item.roleName, "Resource"),
    status: asString(item.status, "Pending"),
    allocationPercent: asNumber(item.allocationPercent, 0),
    startDate: asString(item.startDate, ""),
    endDate: asString(item.endDate, ""),
    requestedByName: asString(item.requestedByName, "System"),
  }));
}

export async function updateAssignmentStatus(assignmentId: string, status: 'Approved' | 'Rejected' | 'Accepted'): Promise<boolean> {
  const response = await fetch(BackendApiUrl.updateAssignmentStatus, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ assignmentId, status }),
  });

  return response.ok;
}

const formatDateRange = (start: string, end: string): string => {
  if (!start || !end) return "Flexible";
  try {
    const s = new Date(start);
    const e = new Date(end);
    const options: Intl.DateTimeFormatOptions = { month: 'short', year: 'numeric' };
    return `${s.toLocaleDateString('en-US', options)} - ${e.toLocaleDateString('en-US', options)}`;
  } catch {
    return "Flexible";
  }
};

export const mapToUIAssignmentRequest = (item: HRAssignmentRequestItem): any => {
  return {
    id: item.id,
    projectName: item.projectName,
    employeeName: item.employeeName,
    employeeAvatar: item.employeeName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2),
    role: item.roleName,
    hoursPerWeek: (40 * item.allocationPercent) / 100, // For display in other areas
    duration: formatDateRange(item.startDate, item.endDate),
    allocation: item.allocationPercent,
    requestedBy: item.requestedByName,
    status: item.status.toLowerCase() as 'pending' | 'approved' | 'rejected',
  };
};

export interface HRDashboardSummary {
  pendingValidationsCount: number;
  totalEmployeeCount: number;
  recentRequests: {
    id: string;
    employeeName: string;
    projectName: string;
    hasConflict: boolean;
    daysWaiting: number;
  }[];
}

export async function fetchHRDashboardSummary(): Promise<HRDashboardSummary> {
  const response = await fetch(BackendApiUrl.hrDashboardSummary);

  if (!response.ok) {
    throw new Error(`Failed to load HR summary (${response.status})`);
  }

  const payload: any = await response.json();
  return {
    pendingValidationsCount: asNumber(payload.pendingValidationsCount, 0),
    totalEmployeeCount: asNumber(payload.totalEmployeeCount, 0),
    recentRequests: Array.isArray(payload.recentRequests) ? payload.recentRequests.map((item: any) => ({
      id: asString(item.id, ""),
      employeeName: asString(item.employeeName, "Unknown"),
      projectName: asString(item.projectName, "Untitled Project"),
      hasConflict: Boolean(item.hasConflict),
      daysWaiting: asNumber(item.daysWaiting, 0),
    })) : [],
  };
}
