import { BackendApiUrl } from "../BackendApiUrl";
import { GeneralManagerContractDecision, GeneralManagerDecision } from "./generalManager";

export interface HREmployeeListItem {
  id: string;
  fullName: string;
  email: string;
  jobTitle: string;
  department: string | null;
  availabilityPercent: number;
  workloadPercent: number;
  phone: string;
  status: string;
  workloadStatus: string;
  assignedHours: number;
  assignments: any[];
  hireDate?: string;
  skills?: string[];
  contractEndDate?: string;
}

export interface DepartmentLookup {
  id: string;
  name: string;
}

export interface ProjectLookup {
  id: string;
  name: string;
}

export interface SkillLookup {
  id: string;
  name: string;
  category: string;
}

interface GetEmployeeListResponse {
  employees?: unknown;
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

export type HiringRequestStatus = 'Sourcing' | 'Interviewing' | 'Offering' | 'Completed' | 'Cancelled';

export interface HiringRequestItem {
  id: string;
  jobTitle: string;
  projectName: string;
  details: string;
  status: HiringRequestStatus;
  startedAt: string;
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

    return {
      id: asString(record.id, String(index + 1)),
      fullName: asString(record.fullName ?? record.full_name, "Unknown Employee"),
      email: asString(record.email, "N/A"),
      jobTitle: asString(record.jobTitle ?? record.job_title, "Unknown Role"),
      department: typeof record.department === "string" ? record.department : null,
      availabilityPercent: asNumber(record.availabilityPercent ?? record.availability_percent, 100),
      workloadPercent: asNumber(record.workloadPercent ?? record.workload_percent, 0),
      assignedHours: asNumber(record.assignedHours ?? record.assigned_hours, 0),
      phone: asString(record.phone, "N/A"),
      status: asString(record.status, "Active"),
      workloadStatus: asString(record.workloadStatus ?? record.workload_status, ""),
      assignments: Array.isArray(record.assignments) ? record.assignments : [],
      hireDate: asString(record.hireDate, ""),
      skills: Array.isArray(record.skills) ? record.skills as string[] : [],
      contractEndDate: record.contractEndDate as string | undefined,
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

interface GetEmployeeAssignmentsResponse {
  assignments?: unknown;
  items?: unknown;
  data?: unknown;
}

interface EmployeeAssignmentListItem {
  id: string;
  projectId: string;
  projectName: string;
  status: string;
  projectStatus: string;
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
      projectStatus: asString(record.projectStatus ?? record.project_status, ""),
      allocationPercent: asNumber(record.allocationPercent ?? record.allocation_percent, 0),
    };
  });
};

/**
 * Helper to get a mapping of employee IDs to their current project names.
 */
export async function fetchHREmployeeCurrentProjectsMap(employeeIds: string[]): Promise<Record<string, string[]>> {
  const activeStatuses = new Set(["pending", "approved", "accepted", "inprogress", "in-progress"]);
  const finishedProjectStatuses = new Set(["completed", "cancelled"]);

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
              .filter((assignment) => !finishedProjectStatuses.has(assignment.projectStatus.trim().toLowerCase()))
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
    phone: apiItem.phone,
    location: "", // Not in list API
    department: apiItem.department ?? "General",
    skills: apiItem.skills || [],
    status: apiItem.status.toLowerCase() === "active" ? "active" : apiItem.status.toLowerCase() === "inactive" ? "inactive" : "terminated",
    workloadStatus: apiItem.workloadStatus,
    availability: apiItem.availabilityPercent,
    workload: apiItem.workloadPercent,
    assignedHours: apiItem.assignedHours,
    currentProjects: apiItem.assignments
      .filter((a: any) => {
        const s = a.status?.toLowerCase();
        return (
          s === "pending" ||
          s === "gmapproved" ||
          s === "approved" ||
          s === "accepted" ||
          s === "inprogress"
        );
      })
      .map((a: any) => a.projectName || "Unknown Project"),
    projectHistory: apiItem.assignments
      .filter((a: any) => a.status?.toLowerCase() === "completed")
      .map((a: any) => a.projectName || "Unknown Project"),
    joinedDate: apiItem.hireDate || new Date().toISOString(),
    hireDate: apiItem.hireDate || "",
    contractEndDate: apiItem.contractEndDate,
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
    status: apiItem.status.toLowerCase(),
    workloadStatus: apiItem.workloadStatus,
    currentProjects: apiItem.assignments
      .filter((a: any) => {
        const s = a.status?.toLowerCase();
        return (
          s === "pending" ||
          s === "gmapproved" ||
          s === "approved" ||
          s === "accepted" ||
          s === "inprogress"
        );
      })
      .map((a: any) => a.projectName || "Unknown Project"),
    assignedHours: apiItem.assignedHours,
    workload: apiItem.workloadPercent,
    availability: apiItem.availabilityPercent,
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
/**
 * Maps the GeneralManagerDecision into the UI-ready GMDecision type.
 * This classifies decisions as Extend Contract, Terminate Contract, Hire Resource, or Project Assignment.
 */
export const mapToUIDecision = (decision: GeneralManagerDecision): any => {
  let type: 'extend-contract' | 'terminate-contract' | 'hire-resource' | 'project-assignment' = 'extend-contract';
  const apiType = decision.type.toLowerCase();

  if (apiType.includes('extend')) type = 'extend-contract';
  else if (apiType.includes('terminate')) type = 'terminate-contract';
  else if (apiType.includes('hire')) type = 'hire-resource';
  else if (apiType.includes('projectassignment')) type = 'project-assignment';

  // Clean up details for display
  let cleanDetails = decision.details.replace(/\[recommendation:[^\]]+\]/g, '').trim();
  try {
    const parsed = JSON.parse(cleanDetails);
    if (parsed && typeof parsed === 'object' && 'reasoning' in parsed) {
      cleanDetails = parsed.reasoning;
    }
  } catch (e) {
    // Not JSON, use as is
  }

  return {
    id: decision.id,
    type,
    projectName: decision.projectName,
    affectedEmployees: decision.affectedEmployees,
    deadline: decision.deadline ?? 'No deadline',
    submittedDate: decision.submittedAt.split('T')[0],
    status: decision.status.toLowerCase() === 'pending' ? 'pending' :
      decision.status.toLowerCase() === 'gmapproved' ? 'gmapproved' :
        decision.status.toLowerCase().includes('clarification') ? 'clarification-requested' : 'executed',
    details: cleanDetails,
  };
};

export async function executeDecision(decisionId: string, notes?: string): Promise<boolean> {
  const response = await fetch(BackendApiUrl.executeDecision, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ decisionId, notes }),
  });

  return response.ok;
}

export async function executeContractAction(decisionId: string): Promise<boolean> {
  const response = await fetch(BackendApiUrl.executeContract, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ decisionId }),
  });

  return response.ok;
}

export async function startHiring(decisionId: string): Promise<boolean> {
  const response = await fetch(BackendApiUrl.startHiring, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ decisionId }),
  });

  return response.ok;
}

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

export async function fetchHRAssignmentRequests(): Promise<HRAssignmentRequestItem[]> {
  const url = `${BackendApiUrl.assignmentsList}?status=GmApproved`;
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
    status: item.status.toLowerCase() as 'pending' | 'gmapproved' | 'approved' | 'rejected',
  };
};

export interface HRDashboardSummary {
  pendingValidationsCount: number;
  totalEmployeeCount: number;
  expiringContractsCount: number;
  activeHiringRequestsCount: number;
  pendingGmDecisionsCount: number;
  pendingClarificationsCount: number;
  recentRequests: {
    id: string;
    employeeName: string;
    projectName: string;
    hasConflict: boolean;
    daysWaiting: number;
  }[];
  expiringContracts: {
    employeeId: string;
    employeeName: string;
    endDate: string | null;
  }[];
  recentGmDecisions: {
    id: string;
    type: string;
    details: string;
    date: string;
    status: string;
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
    expiringContractsCount: asNumber(payload.expiringContractsCount, 0),
    activeHiringRequestsCount: asNumber(payload.activeHiringRequestsCount, 0),
    pendingGmDecisionsCount: asNumber(payload.pendingGmDecisionsCount, 0),
    pendingClarificationsCount: asNumber(payload.pendingClarificationsCount, 0),
    recentRequests: Array.isArray(payload.recentRequests) ? payload.recentRequests.map((item: any) => ({
      id: asString(item.id, ""),
      employeeName: asString(item.employeeName, "Unknown"),
      projectName: asString(item.projectName, "Untitled Project"),
      hasConflict: Boolean(item.hasConflict),
      daysWaiting: asNumber(item.daysWaiting, 0),
    })) : [],
    expiringContracts: Array.isArray(payload.expiringContracts) ? payload.expiringContracts.map((item: any) => ({
      employeeId: asString(item.employeeId, ""),
      employeeName: asString(item.employeeName, "Unknown"),
      endDate: item.endDate,
    })) : [],
    recentGmDecisions: Array.isArray(payload.recentGmDecisions) ? payload.recentGmDecisions.map((item: any) => ({
      id: asString(item.id, ""),
      type: asString(item.type, "General"),
      details: asString(item.details, "No details provided"),
      date: asString(item.date, ""),
      status: asString(item.status, "Pending"),
    })) : [],
  };
}

export async function fetchDepartmentsLookup(): Promise<DepartmentLookup[]> {
  const response = await fetch(`${BackendApiUrl.lookups}/departments/list?pageSize=100`);
  if (!response.ok) {
    throw new Error(`Failed to load departments (${response.status})`);
  }
  const payload: any = await response.json();
  return (payload.departments || []).map((d: any) => ({
    id: d.id,
    name: d.name
  }));
}

export async function fetchProjectsLookup(): Promise<ProjectLookup[]> {
  const response = await fetch(`${BackendApiUrl.projects}/list?pageSize=100`);
  if (!response.ok) {
    throw new Error(`Failed to load projects (${response.status})`);
  }
  const payload: any = await response.json();
  return (payload.projects || payload.items || payload.data || []).map((p: any) => ({
    id: p.id,
    name: p.name || p.fullName || "Untitled Project"
  }));
}

export async function fetchSkillsLookup(): Promise<SkillLookup[]> {
  const response = await fetch(`${BackendApiUrl.lookups}/skills/list?pageSize=1000`);
  if (!response.ok) {
    throw new Error(`Failed to load skills (${response.status})`);
  }
  const payload: any = await response.json();
  const skills = Array.isArray(payload.skills) ? payload.skills : [];
  return skills.map((s: any) => ({
    id: s.id,
    name: s.name,
    category: s.category
  }));
}

export async function createEmployee(data: any): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await fetch(BackendApiUrl.employeeCreate, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const body = await response.json();
    if (!response.ok) {
      return {
        success: false,
        message: body.message || body.title || "Failed to create employee"
      };
    }

    return { success: true };
  } catch (error) {
    return { success: false, message: "Network error occurred." };
  }
}

export async function updateEmployee(id: string, data: any): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await fetch(BackendApiUrl.employeeUpdate(id), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const body = await response.json();
    if (!response.ok) {
      return {
        success: false,
        message: body.message || body.title || "Failed to update employee"
      };
    }

    return { success: true };
  } catch (error) {
    return { success: false, message: "Network error occurred." };
  }
}

export async function deleteEmployee(id: string): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await fetch(BackendApiUrl.employeeDelete(id), {
      method: 'DELETE',
    });

    const body = await response.json();
    if (!response.ok) {
      return {
        success: false,
        message: body.message || body.title || "Failed to delete employee"
      };
    }

    return { success: true };
  } catch (error) {
    return { success: false, message: "Network error occurred." };
  }
}

export async function fetchHiringRequests(): Promise<HiringRequestItem[]> {
  const response = await fetch(`${BackendApiUrl.humanResources}/hiring/list`);
  if (!response.ok) {
    throw new Error(`Failed to load hiring requests (${response.status})`);
  }
  const payload: any = await response.json();
  return payload.hiringRequests || [];
}

export async function updateHiringStage(id: string, status: HiringRequestStatus): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await fetch(`${BackendApiUrl.humanResources}/hiring/update-stage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hiringRequestId: id, newStatus: status }),
    });

    const body = await response.json();
    return {
      success: response.ok,
      message: body.message
    };
  } catch (error) {
    return { success: false, message: "Network error occurred." };
  }
}

export async function rehireEmployee(data: {
  employeeId: string,
  jobTitle: string,
  startDate: string,
  endDate: string,
  notes?: string
}): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await fetch(`${BackendApiUrl.humanResources}/rehire`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const body = await response.json();
    return {
      success: response.ok,
      message: body.message
    };
  } catch (error) {
    return { success: false, message: "Network error occurred." };
  }
}

export async function requestClarification(id: string, reason: string): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await fetch(`${BackendApiUrl.humanResources}/decision/${id}/clarify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    });

    const body = await response.json();
    return {
      success: response.ok,
      message: body.message
    };
  } catch (error) {
    return { success: false, message: "Network error occurred." };
  }
}

export async function splitAssignmentWorkload(assignmentId: string, primaryAllocation: number): Promise<boolean> {
  const response = await fetch(BackendApiUrl.assignmentsSplitWorkload, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ assignmentId, primaryAllocation }),
  });

  return response.ok;
}

export async function reassignAssignment(assignmentId: string, targetEmployeeId: string): Promise<boolean> {
  const response = await fetch(BackendApiUrl.reassignAssignment, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ assignmentId, targetEmployeeId }),
  });

  return response.ok;
}

export interface UpdateAssignmentPayload {
  assignmentId: string;
  allocationPercent?: number;
  startDate?: string;
  endDate?: string;
}

export async function updateAssignment(payload: UpdateAssignmentPayload): Promise<boolean> {
  const response = await fetch(BackendApiUrl.updateAssignment, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  return response.ok;
}
