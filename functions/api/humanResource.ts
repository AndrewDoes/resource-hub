import { BackendApiUrl } from "../BackendApiUrl";

export interface HREmployeeListItem {
  id: string;
  fullName: string;
  email: string;
  jobTitle: string;
  department: string | null;
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
    skills: [], // Not in list API yet
    status: apiItem.status.toLowerCase() === "active" ? "active" : "inactive",
    availability: apiItem.availabilityPercent,
    workload: apiItem.workloadPercent,
    assignedHours: apiItem.assignedHours,
    currentProjects: [], // Need separate API call if needed, or placeholder
    projectHistory: [],
    joinedDate: new Date().toISOString(),
  };
};
