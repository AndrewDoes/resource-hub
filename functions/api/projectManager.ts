import { BackendApiUrl } from "../BackendApiUrl";
import { authorizedFetch } from "./authorizedFetch";

export type ProjectManagerProjectStatus = "on-track" | "at-risk" | "delayed" | "completed" | "cancelled";

export interface ProjectManagerProjectSummary {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: ProjectManagerProjectStatus;
  progress: number;
  teamSize: number;
  description: string;
}

interface ProjectManagerProjectsListResponse {
  projects?: unknown;
  items?: unknown;
  data?: unknown;
  pageNumber?: unknown;
  pageSize?: unknown;
  totalCount?: unknown;
  totalPages?: unknown;
}

export interface ProjectManagerProjectOverview {
  projectId: string;
  name: string;
  description: string;
  progressPercent: number;
  status: string;
  riskLevel: string;
  startDate: string;
  endDate: string;
  daysRemaining: number;
  teamSize: number;
  totalAssignments: number;
  completedAssignments: number;
}

export interface ProjectManagerProjectTeamMember {
  assignmentId: string;
  employeeId: string;
  fullName: string;
  jobTitle: string;
  roleName: string;
  allocationPercent: number;
  assignmentStatus: string;
  availabilityPercent: number;
  workloadPercent: number;
  assignedHours: number;
  employeeStatus: string;
}

export interface ProjectManagerAssignmentItem {
  id: string;
  projectId: string;
  employeeId: string;
  roleName: string;
  allocationPercent: number;
  startDate: string;
  endDate: string;
  status: string;
}

export interface ProjectManagerProjectActivity {
  occurredAt: string;
  message: string;
}

export interface ProjectManagerMilestone {
  milestoneId: string;
  title: string;
  description: string | null;
  dueDate: string;
  isCompleted: boolean;
  sortOrder: number;
}

export interface ProjectManagerTimelineTask {
  timelineTaskId: string;
  name: string;
  startOffsetDays: number;
  durationDays: number;
  startDate: string;
  endDate: string;
  colorTag: string;
  status: string;
  sortOrder: number;
}

export interface ProjectManagerCreateMilestoneInput {
  pmUserId: string;
  projectId: string;
  title: string;
  description?: string;
  dueDate: string;
  sortOrder: number;
}

export interface ProjectManagerUpdateMilestoneStatusInput {
  pmUserId: string;
  projectId: string;
  milestoneId: string;
  isCompleted: boolean;
}

export interface ProjectManagerCreateTimelineTaskInput {
  pmUserId: string;
  projectId: string;
  name: string;
  startOffsetDays: number;
  durationDays: number;
  colorTag: string;
  sortOrder: number;
}

export interface ProjectManagerUpdateTimelineTaskInput {
  pmUserId: string;
  projectId: string;
  timelineTaskId: string;
  name: string;
  startOffsetDays: number;
  durationDays: number;
  colorTag: string;
  status: "pending" | "in-progress" | "completed";
  sortOrder: number;
}

export interface ProjectManagerCreateChangeRequestInput {
  projectId: string;
  employeeId?: string;
  assignedByUserId: string;
  roleName: string;
  startDate: string;
  endDate: string;
  allocationPercent: number;
  requiredSkills: string[];
  additionalNeeds?: string;
}

export interface ProjectManagerCreateChangeRequestResult {
  assignmentId: string;
}

export interface ProjectManagerUpdateProjectStatusResult {
  projectId: string;
  status: string;
}

export interface PersistSplitWorkloadInput {
  projectId: string;
  fromEmployeeId: string;
  toEmployeeId: string;
  splitAllocationPercent: number;
  roleName: string;
  startDate: string;
  endDate: string;
  assignedByUserId: string;
}

interface ProjectManagerOverviewResponse {
  projectId?: unknown;
  name?: unknown;
  description?: unknown;
  progressPercent?: unknown;
  status?: unknown;
  riskLevel?: unknown;
  startDate?: unknown;
  endDate?: unknown;
  daysRemaining?: unknown;
  teamSize?: unknown;
  totalAssignments?: unknown;
  completedAssignments?: unknown;
}

interface ProjectManagerTeamResponse {
  projectId?: unknown;
  teamMembers?: unknown;
  data?: unknown;
}

interface ProjectManagerActivityResponse {
  projectId?: unknown;
  activities?: unknown;
  data?: unknown;
}

interface ProjectManagerMilestonesResponse {
  projectId?: unknown;
  milestones?: unknown;
  data?: unknown;
}

interface ProjectManagerTimelineTasksResponse {
  projectId?: unknown;
  tasks?: unknown;
  data?: unknown;
}

const fallbackStatus = (value: string | undefined): ProjectManagerProjectStatus => {
  switch (value) {
    case "at-risk":
    case "delayed":
    case "on-track":
    case "completed":
    case "cancelled":
      return value;
    default:
      return "on-track";
  }
};

const asString = (value: unknown, fallback: string): string => {
  return typeof value === "string" && value.trim().length > 0 ? value : fallback;
};

const asNumber = (value: unknown, fallback: number): number => {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
};

const normalizeDateOnlyString = (value: string): string => {
  const isoMatch = value.match(/\d{4}-\d{2}-\d{2}/);
  if (isoMatch) {
    return isoMatch[0];
  }

  const slashMatch = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slashMatch) {
    const day = slashMatch[1].padStart(2, "0");
    const month = slashMatch[2].padStart(2, "0");
    const year = slashMatch[3];
    return `${year}-${month}-${day}`;
  }

  return value;
};

const normalizeTaskPriority = (value: unknown): TaskPriority => {
  const raw = typeof value === "string" ? value.toLowerCase() : "";
  if (raw === "high") {
    return "high";
  }
  if (raw === "medium") {
    return "medium";
  }

  return "low";
};

const normalizeTaskStatus = (value: unknown): "pending" | "in-progress" | "completed" => {
  const raw = typeof value === "string" ? value.toLowerCase().replace("_", "-") : "";
  if (raw === "completed") {
    return "completed";
  }
  if (raw === "inprogress" || raw === "in-progress") {
    return "in-progress";
  }

  return "pending";
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

const readErrorMessage = async (response: Response, fallbackMessage: string): Promise<string> => {
  try {
    const payload = (await response.json()) as Record<string, unknown>;

    const directMessage = asString(payload.message ?? payload.error ?? payload.detail, "");
    if (directMessage) {
      return directMessage;
    }

    const errors = payload.errors;
    if (errors && typeof errors === "object") {
      const allErrors = Object.values(errors as Record<string, unknown>)
        .flatMap((value) => (Array.isArray(value) ? value : [value]))
        .map((value) => (typeof value === "string" ? value.trim() : ""))
        .filter((value) => value.length > 0);

      const meaningfulError = allErrors.find(
        (message) => message.toLowerCase() !== "the request field is required."
      );

      if (meaningfulError) {
        return meaningfulError;
      }

      if (allErrors.length > 0) {
        return allErrors[0];
      }
    }

    const titleMessage = asString(payload.title, "");
    if (titleMessage) {
      return titleMessage;
    }
  } catch {
    // fall back to plain text handling below
  }

  try {
    const text = (await response.text()).trim();
    if (text.length > 0) {
      return text;
    }
  } catch {
    // keep fallback message
  }

  return fallbackMessage;
};

const normalizeProjects = (payload: unknown): ProjectManagerProjectSummary[] => {
  const record = (payload ?? {}) as Record<string, unknown>;
  const dataRecord = (record.data ?? record.Data ?? null) as Record<string, unknown> | null;

  const source = Array.isArray(payload)
    ? payload
    : Array.isArray(record.projects)
      ? record.projects
      : Array.isArray(record.Projects)
        ? record.Projects
        : Array.isArray(record.items)
          ? record.items
          : Array.isArray(record.Items)
            ? record.Items
            : Array.isArray(record.data)
              ? record.data
              : Array.isArray(record.Data)
                ? record.Data
                : Array.isArray(dataRecord?.projects)
                  ? dataRecord.projects
                  : Array.isArray(dataRecord?.Projects)
                    ? dataRecord.Projects
                    : Array.isArray(dataRecord?.items)
                      ? dataRecord.items
                      : Array.isArray(dataRecord?.Items)
                        ? dataRecord.Items
                        : [];

  return source.map((item, index) => {
    const record = item as Record<string, unknown>;
    const fallbackProjectId = String(index + 1);

    return {
      id: asString(record.id ?? record.Id ?? record.projectId ?? record.ProjectId ?? record.project_id, fallbackProjectId),
      name: asString(record.name ?? record.Name, "Untitled Project"),
      startDate: asString(record.startDate ?? record.StartDate ?? record.start_date, "2026-01-01"),
      endDate: asString(record.endDate ?? record.EndDate ?? record.end_date, "2026-12-31"),
      status: fallbackStatus(
        typeof (record.status ?? record.Status) === "string" ? String(record.status ?? record.Status).toLowerCase() : undefined
      ),
      progress: asNumber(record.progress ?? record.Progress ?? record.progressPercent ?? record.ProgressPercent ?? record.progress_percent, 0),
      teamSize: asNumber(record.teamSize ?? record.TeamSize ?? record.team_size, 0),
      description: asString(record.description ?? record.Description ?? record.clientName ?? record.ClientName ?? record.client_name, "No description provided"),
    };
  });
};

const normalizeOverview = (payload: unknown): ProjectManagerProjectOverview => {
  const source = (payload as ProjectManagerOverviewResponse | null) ?? {};

  return {
    projectId: asString(source.projectId, ""),
    name: asString(source.name, "Untitled Project"),
    description: asString(source.description, "No description provided"),
    progressPercent: asNumber(source.progressPercent, 0),
    status: asString(source.status, "Draft"),
    riskLevel: asString(source.riskLevel, "Low"),
    startDate: asString(source.startDate, "2026-01-01"),
    endDate: asString(source.endDate, "2026-12-31"),
    daysRemaining: asNumber(source.daysRemaining, 0),
    teamSize: asNumber(source.teamSize, 0),
    totalAssignments: asNumber(source.totalAssignments, 0),
    completedAssignments: asNumber(source.completedAssignments, 0),
  };
};

const normalizeTeamMembers = (payload: unknown): ProjectManagerProjectTeamMember[] => {
  const source: unknown[] = Array.isArray(payload)
    ? payload
    : Array.isArray((payload as ProjectManagerTeamResponse | null)?.teamMembers)
      ? ((payload as ProjectManagerTeamResponse).teamMembers as unknown[])
      : Array.isArray((payload as ProjectManagerTeamResponse | null)?.data)
        ? ((payload as ProjectManagerTeamResponse).data as unknown[])
        : [];

  return (source as any[]).map((item, index) => {
    const record = item as Record<string, unknown>;

    return {
      assignmentId: asString(record.assignmentId ?? record.AssignmentId ?? record.assignment_id ?? record.id ?? record.Id, ''),
      employeeId: asString(record.employeeId ?? record.EmployeeId ?? record.employee_id, ''),
      fullName: asString(record.fullName ?? record.FullName ?? record.full_name, "Unknown Employee"),
      jobTitle: asString(record.jobTitle ?? record.JobTitle ?? record.job_title, "Unknown Role"),
      roleName: asString(record.roleName ?? record.RoleName ?? record.role_name, "Member"),
      allocationPercent: asNumber(record.allocationPercent ?? record.AllocationPercent ?? record.allocation_percent, 0),
      assignmentStatus: asString(record.assignmentStatus ?? record.AssignmentStatus ?? record.assignment_status, "Pending"),
      availabilityPercent: asNumber(record.availabilityPercent ?? record.AvailabilityPercent ?? record.availability_percent, 0),
      workloadPercent: asNumber(record.workloadPercent ?? record.WorkloadPercent ?? record.workload_percent, 0),
      assignedHours: asNumber(record.assignedHours ?? record.AssignedHours ?? record.assigned_hours, 0),
      employeeStatus: asString(record.employeeStatus ?? record.EmployeeStatus ?? record.employee_status, "Active"),
    };
  });
};

export async function persistSplitWorkloadToBackend(input: PersistSplitWorkloadInput): Promise<void> {
  const response = await authorizedFetch(BackendApiUrl.assignmentsSplitWorkload, {
    method: 'POST',
    body: JSON.stringify({
      projectId: input.projectId,
      fromEmployeeId: input.fromEmployeeId,
      toEmployeeId: input.toEmployeeId,
      assignedByUserId: input.assignedByUserId,
      roleName: input.roleName,
      startDate: input.startDate,
      endDate: input.endDate,
      splitAllocationPercent: input.splitAllocationPercent,
    }),
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, `Failed to persist split workload (${response.status})`));
  }
}

const normalizeActivities = (payload: unknown): ProjectManagerProjectActivity[] => {
  const source: unknown[] = Array.isArray(payload)
    ? payload
    : Array.isArray((payload as ProjectManagerActivityResponse | null)?.activities)
      ? ((payload as ProjectManagerActivityResponse).activities as unknown[])
      : Array.isArray((payload as ProjectManagerActivityResponse | null)?.data)
        ? ((payload as ProjectManagerActivityResponse).data as unknown[])
        : [];

  return (source as any[]).map((item, index) => {
    const record = item as Record<string, unknown>;

    return {
      occurredAt: asString(record.occurredAt ?? record.occurred_at, new Date(Date.now() - index * 86400000).toISOString()),
      message: asString(record.message, "No activity available"),
    };
  });
};

const normalizeMilestones = (payload: unknown): ProjectManagerMilestone[] => {
  const source: unknown[] = Array.isArray(payload)
    ? payload
    : Array.isArray((payload as ProjectManagerMilestonesResponse | null)?.milestones)
      ? ((payload as ProjectManagerMilestonesResponse).milestones as unknown[])
      : Array.isArray((payload as ProjectManagerMilestonesResponse | null)?.data)
        ? ((payload as ProjectManagerMilestonesResponse).data as unknown[])
        : [];

  return (source as any[]).map((item, index) => {
    const record = item as Record<string, unknown>;

    return {
      milestoneId: asString(record.milestoneId ?? record.milestone_id, String(index + 1)),
      title: asString(record.title, "Untitled milestone"),
      description: typeof record.description === "string" ? record.description : null,
      dueDate: asString(record.dueDate ?? record.due_date, new Date().toISOString()),
      isCompleted: Boolean(record.isCompleted ?? record.is_completed),
      sortOrder: asNumber(record.sortOrder ?? record.sort_order, index + 1),
    };
  });
};

const normalizeTimelineTasks = (payload: unknown): ProjectManagerTimelineTask[] => {
  const source: unknown[] = Array.isArray(payload)
    ? payload
    : Array.isArray((payload as ProjectManagerTimelineTasksResponse | null)?.tasks)
      ? ((payload as ProjectManagerTimelineTasksResponse).tasks as unknown[])
      : Array.isArray((payload as ProjectManagerTimelineTasksResponse | null)?.data)
        ? ((payload as ProjectManagerTimelineTasksResponse).data as unknown[])
        : [];

  return (source as any[]).map((item, index) => {
    const record = item as Record<string, unknown>;

    return {
      timelineTaskId: asString(record.timelineTaskId ?? record.timeline_task_id, String(index + 1)),
      name: asString(record.name, "Untitled task"),
      startOffsetDays: asNumber(record.startOffsetDays ?? record.start_offset_days, 0),
      durationDays: asNumber(record.durationDays ?? record.duration_days, 0),
      startDate: asString(record.startDate ?? record.start_date, new Date().toISOString()),
      endDate: asString(record.endDate ?? record.end_date, new Date().toISOString()),
      colorTag: asString(record.colorTag ?? record.color_tag, "blue"),
      status: asString(record.status, "Pending"),
      sortOrder: asNumber(record.sortOrder ?? record.sort_order, index + 1),
    };
  });
};

export async function fetchProjectManagerProjects(pmUserId: string): Promise<ProjectManagerProjectSummary[]> {
  const url = withQuery(BackendApiUrl.projectManagerProjectsList, {
    pmUserId,
    pageNumber: "1",
    pageSize: "10",
  });

  const response = await authorizedFetch(url);

  if (!response.ok) {
    throw new Error(`Failed to load project manager projects (${response.status})`);
  }

  const payload: unknown = await response.json();
  return normalizeProjects(payload);
}

export async function fetchProjectManagerProjectOverview(pmUserId: string, projectId: string): Promise<ProjectManagerProjectOverview> {
  const url = withQuery(BackendApiUrl.projectManagerProjectOverview(projectId), {
    pmUserId,
  });

  const response = await authorizedFetch(url);

  if (!response.ok) {
    throw new Error(`Failed to load project overview (${response.status})`);
  }

  const payload: unknown = await response.json();
  return normalizeOverview(payload);
}

export async function fetchProjectManagerProjectTeam(pmUserId: string, projectId: string): Promise<ProjectManagerProjectTeamMember[]> {
  const url = withQuery(BackendApiUrl.projectManagerProjectTeam(projectId), {
    pmUserId,
  });

  const response = await authorizedFetch(url);

  if (!response.ok) {
    throw new Error(`Failed to load project team (${response.status})`);
  }

  const payload: unknown = await response.json();
  return normalizeTeamMembers(payload);
}

export async function fetchProjectManagerProjectActivity(pmUserId: string, projectId: string): Promise<ProjectManagerProjectActivity[]> {
  const url = withQuery(BackendApiUrl.projectManagerProjectActivity(projectId), {
    pmUserId,
  });

  const response = await authorizedFetch(url);

  if (!response.ok) {
    throw new Error(`Failed to load project activity (${response.status})`);
  }

  const payload: unknown = await response.json();
  return normalizeActivities(payload);
}

export async function fetchProjectManagerMilestones(pmUserId: string, projectId: string): Promise<ProjectManagerMilestone[]> {
  const url = withQuery(BackendApiUrl.projectManagerProjectMilestones(projectId), {
    pmUserId,
  });

  const response = await authorizedFetch(url);

  if (!response.ok) {
    throw new Error(`Failed to load project milestones (${response.status})`);
  }

  const payload: unknown = await response.json();
  return normalizeMilestones(payload);
}

export async function fetchProjectManagerTimelineTasks(pmUserId: string, projectId: string): Promise<ProjectManagerTimelineTask[]> {
  const url = withQuery(BackendApiUrl.projectManagerProjectTimelineTasks(projectId), {
    pmUserId,
  });

  const response = await authorizedFetch(url);

  if (!response.ok) {
    throw new Error(`Failed to load project timeline tasks (${response.status})`);
  }

  const payload: unknown = await response.json();
  return normalizeTimelineTasks(payload);
}

export async function createProjectManagerMilestone(input: ProjectManagerCreateMilestoneInput): Promise<void> {
  const response = await fetch(BackendApiUrl.projectManagerCreateMilestone, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      pmUserId: input.pmUserId,
      projectId: input.projectId,
      title: input.title,
      description: input.description,
      dueDate: normalizeDateOnlyString(input.dueDate),
      sortOrder: input.sortOrder,
    }),
  });

  if (!response.ok) {
    const fallbackMessage = `Failed to create milestone (${response.status})`;
    const errorMessage = await readErrorMessage(response, fallbackMessage);
    throw new Error(errorMessage);
  }
}

export async function updateProjectManagerMilestoneStatus(input: ProjectManagerUpdateMilestoneStatusInput): Promise<void> {
  const response = await fetch(BackendApiUrl.projectManagerUpdateMilestoneStatus, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      pmUserId: input.pmUserId,
      projectId: input.projectId,
      milestoneId: input.milestoneId,
      isCompleted: input.isCompleted,
    }),
  });

  if (!response.ok) {
    const fallbackMessage = `Failed to update milestone status (${response.status})`;
    const errorMessage = await readErrorMessage(response, fallbackMessage);
    throw new Error(errorMessage);
  }
}

export async function createProjectManagerTimelineTask(input: ProjectManagerCreateTimelineTaskInput): Promise<void> {
  const response = await fetch(BackendApiUrl.projectManagerCreateTimelineTask, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      pmUserId: input.pmUserId,
      projectId: input.projectId,
      name: input.name,
      startOffsetDays: input.startOffsetDays,
      durationDays: input.durationDays,
      colorTag: input.colorTag,
      sortOrder: input.sortOrder,
    }),
  });

  if (!response.ok) {
    const fallbackMessage = `Failed to create timeline task (${response.status})`;
    const errorMessage = await readErrorMessage(response, fallbackMessage);
    throw new Error(errorMessage);
  }
}

export async function updateProjectManagerTimelineTask(input: ProjectManagerUpdateTimelineTaskInput): Promise<void> {
  const status = input.status === "in-progress"
    ? "InProgress"
    : input.status === "completed"
      ? "Completed"
      : "Pending";

  const response = await fetch(BackendApiUrl.projectManagerUpdateTimelineTask, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      pmUserId: input.pmUserId,
      projectId: input.projectId,
      timelineTaskId: input.timelineTaskId,
      name: input.name,
      startOffsetDays: input.startOffsetDays,
      durationDays: input.durationDays,
      colorTag: input.colorTag,
      status,
      sortOrder: input.sortOrder,
    }),
  });

  if (!response.ok) {
    const fallbackMessage = `Failed to update timeline task (${response.status})`;
    const errorMessage = await readErrorMessage(response, fallbackMessage);
    throw new Error(errorMessage);
  }
}

export async function updateProjectManagerProjectStatus(
  projectId: string,
  status: 'Completed' | 'Cancelled'
): Promise<ProjectManagerUpdateProjectStatusResult> {
  const response = await authorizedFetch(BackendApiUrl.projectsUpdateStatus, {
    method: 'POST',
    body: JSON.stringify({
      projectId,
      status,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to update project status (${response.status})`);
  }

  const payload = (await response.json()) as Record<string, unknown>;

  return {
    projectId: asString(payload.projectId ?? payload.ProjectId, projectId),
    status: asString(payload.status ?? payload.Status, status),
  };
}

export async function createProjectManagerChangeRequest(
  input: ProjectManagerCreateChangeRequestInput
): Promise<ProjectManagerCreateChangeRequestResult> {
  const response = await authorizedFetch(BackendApiUrl.assignmentsCreate, {
    method: 'POST',
    body: JSON.stringify({
      projectId: input.projectId,
      employeeId: input.employeeId ?? '00000000-0000-0000-0000-000000000000',
      assignedByUserId: input.assignedByUserId,
      roleName: input.roleName,
      startDate: normalizeDateOnlyString(input.startDate),
      endDate: normalizeDateOnlyString(input.endDate),
      allocationPercent: input.allocationPercent,
      requiredSkills: input.requiredSkills,
      additionalNeeds: input.additionalNeeds ?? '',
    }),
  });

  if (!response.ok) {
    const fallbackMessage = `Failed to create change request (${response.status})`;
    const errorMessage = await readErrorMessage(response, fallbackMessage);
    throw new Error(errorMessage);
  }

  const payload = (await response.json()) as Record<string, unknown>;

  return {
    assignmentId: asString(payload.assignmentId ?? payload.AssignmentId, ''),
  };
}

export const projectManagerFallbackProjects: ProjectManagerProjectSummary[] = [
  {
    id: "1",
    name: "Website Redesign",
    startDate: "2026-04-15",
    endDate: "2026-07-15",
    status: "on-track",
    progress: 45,
    teamSize: 8,
    description: "Complete redesign of company website with modern UI/UX",
  },
  {
    id: "2",
    name: "Mobile App Development",
    startDate: "2026-05-01",
    endDate: "2026-08-30",
    status: "at-risk",
    progress: 30,
    teamSize: 6,
    description: "Native mobile application for iOS and Android platforms",
  },
  {
    id: "3",
    name: "Marketing Campaign Q3",
    startDate: "2026-06-01",
    endDate: "2026-09-15",
    status: "on-track",
    progress: 20,
    teamSize: 5,
    description: "Comprehensive marketing campaign for Q3 product launch",
  },
];

// Task Assignment Types and Functions
export type TaskPriority = "low" | "medium" | "high";

export interface TaskAssignmentWorkloadConfig {
  priority: TaskPriority;
  hours: number;
  label: string;
  color: string;
}

export const WORKLOAD_CONFIG: Record<TaskPriority, TaskAssignmentWorkloadConfig> = {
  low: { priority: "low", hours: 20, label: "Low (20%)", color: "bg-blue-100 text-blue-700" },
  medium: { priority: "medium", hours: 30, label: "Medium (30%)", color: "bg-yellow-100 text-yellow-700" },
  high: { priority: "high", hours: 50, label: "High (50%)", color: "bg-red-100 text-red-700" },
};

export interface ProjectTaskAssignment {
  taskId: string;
  projectId: string;
  projectName: string;
  employeeId: string;
  employeeName: string;
  taskName: string;
  description: string;
  priority: TaskPriority;
  workloadHours: number;
  assignedDate: string;
  dueDate: string;
  status: "pending" | "in-progress" | "completed";
  createdAt: string;
}

export interface TaskAssignmentCreateInput {
  projectId: string;
  employeeId: string;
  taskName: string;
  description: string;
  priority: TaskPriority;
  workloadHours: number;
  dueDate: string;
  assignedByUserId: string;
}

export interface TaskAssignmentUpdateInput {
  taskId: string;
  status: "pending" | "in-progress" | "completed";
  taskName?: string;
  description?: string;
  priority?: TaskPriority;
  workloadHours?: number;
  dueDate?: string;
}

const normalizeTaskAssignments = (payload: unknown): ProjectTaskAssignment[] => {
  const source: any[] = (Array.isArray(payload)
    ? payload
    : Array.isArray((payload as Record<string, unknown>)?.tasks)
      ? (payload as Record<string, unknown>).tasks
      : Array.isArray((payload as Record<string, unknown>)?.data)
        ? (payload as Record<string, unknown>).data
        : []) as any[];

  return source.map((item, index) => {
    const record = item as Record<string, unknown>;
    const priority = normalizeTaskPriority(record.priority ?? record.Priority ?? "low");
    const workloadHours = asNumber(record.workloadHours ?? record.WorkloadHours, WORKLOAD_CONFIG[priority]?.hours ?? 20);

    return {
      taskId: asString(record.taskId ?? record.task_id ?? record.id, String(index + 1)),
      projectId: asString(record.projectId ?? record.project_id, ""),
      projectName: asString(record.projectName ?? record.project_name, "Unknown Project"),
      employeeId: asString(record.employeeId ?? record.employee_id, ""),
      employeeName: asString(record.employeeName ?? record.employee_name ?? record.fullName ?? record.full_name, "Unknown Employee"),
      taskName: asString(record.taskName ?? record.task_name ?? record.name, "Untitled Task"),
      description: asString(record.description ?? record.Description, ""),
      priority,
      workloadHours,
      assignedDate: asString(record.assignedDate ?? record.assigned_date, new Date().toISOString()),
      dueDate: asString(record.dueDate ?? record.due_date, new Date(Date.now() + 86400000 * 7).toISOString()),
      status: normalizeTaskStatus(record.status ?? record.Status ?? "pending"),
      createdAt: asString(record.createdAt ?? record.created_at, new Date().toISOString()),
    };
  });
};

export async function fetchTaskAssignmentsForProject(pmUserId: string, projectId: string): Promise<ProjectTaskAssignment[]> {
  const url = withQuery(`${BackendApiUrl.taskAssignmentsForProject(projectId)}`, {
    pmUserId,
  });

  try {
    const response = await authorizedFetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load task assignments (${response.status})`);
    }
    const payload = await response.json();
    return normalizeTaskAssignments(payload);
  } catch {
    // Return empty array on error to allow fallback to create new tasks
    return [];
  }
}

export async function fetchAllTaskAssignments(pmUserId: string): Promise<ProjectTaskAssignment[]> {
  try {
    const url = withQuery(`${BackendApiUrl.taskAssignmentsList}`, {
      pmUserId,
    });
    const response = await authorizedFetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load all task assignments (${response.status})`);
    }
    const payload = await response.json();
    return normalizeTaskAssignments(payload);
  } catch {
    return [];
  }
}

export async function createTaskAssignment(input: TaskAssignmentCreateInput): Promise<ProjectTaskAssignment> {
  const response = await authorizedFetch(BackendApiUrl.taskAssignmentsCreate, {
    method: 'POST',
    body: JSON.stringify({
      projectId: input.projectId,
      employeeId: input.employeeId,
      taskName: input.taskName,
      description: input.description,
      priority: input.priority,
      workloadHours: input.workloadHours,
      dueDate: normalizeDateOnlyString(input.dueDate),
      assignedByUserId: input.assignedByUserId,
    }),
  });

  if (!response.ok) {
    const fallbackMessage = `Failed to create task assignment (${response.status})`;
    const errorMessage = await readErrorMessage(response, fallbackMessage);
    throw new Error(errorMessage);
  }

  const payload = (await response.json()) as Record<string, unknown>;
  const normalized = normalizeTaskAssignments([payload]);
  return normalized[0] || { taskId: '', projectId: '', projectName: '', employeeId: '', employeeName: '', taskName: '', description: '', priority: 'low', workloadHours: 20, assignedDate: new Date().toISOString(), dueDate: new Date().toISOString(), status: 'pending', createdAt: new Date().toISOString() };
}

export async function updateTaskAssignment(input: TaskAssignmentUpdateInput): Promise<ProjectTaskAssignment> {
  const status = input.status === 'in-progress'
    ? 'InProgress'
    : input.status === 'completed'
      ? 'Completed'
      : 'Pending';

  const priority = input.priority
    ? input.priority.charAt(0).toUpperCase() + input.priority.slice(1)
    : undefined;

  const response = await authorizedFetch(BackendApiUrl.taskAssignmentsUpdate, {
    method: 'PUT',
    body: JSON.stringify({
      taskId: input.taskId,
      status,
      taskName: input.taskName,
      description: input.description,
      priority,
      workloadHours: input.workloadHours,
      dueDate: input.dueDate ? normalizeDateOnlyString(input.dueDate) : undefined,
    }),
  });

  if (!response.ok) {
    const fallbackMessage = `Failed to update task assignment (${response.status})`;
    const errorMessage = await readErrorMessage(response, fallbackMessage);
    throw new Error(errorMessage);
  }

  const payload = (await response.json()) as Record<string, unknown>;
  const normalized = normalizeTaskAssignments([payload]);
  return normalized[0] || { taskId: '', projectId: '', projectName: '', employeeId: '', employeeName: '', taskName: '', description: '', priority: 'low', workloadHours: 20, assignedDate: new Date().toISOString(), dueDate: new Date().toISOString(), status: 'pending', createdAt: new Date().toISOString() };
}

export async function deleteTaskAssignment(taskId: string): Promise<void> {
  const response = await fetch(BackendApiUrl.taskAssignmentsDelete(taskId), {
    method: 'DELETE',
  });

  if (!response.ok) {
    const fallbackMessage = `Failed to delete task assignment (${response.status})`;
    const errorMessage = await readErrorMessage(response, fallbackMessage);
    throw new Error(errorMessage);
  }
}