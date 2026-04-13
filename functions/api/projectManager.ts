import { BackendApiUrl } from "../BackendApiUrl";

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
  const match = value.match(/\d{4}-\d{2}-\d{2}/);
  return match ? match[0] : value;
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
  const source = Array.isArray(payload)
    ? payload
    : Array.isArray((payload as ProjectManagerTeamResponse | null)?.teamMembers)
      ? (payload as ProjectManagerTeamResponse).teamMembers
      : Array.isArray((payload as ProjectManagerTeamResponse | null)?.data)
        ? (payload as ProjectManagerTeamResponse).data
        : [];

  return source.map((item, index) => {
    const record = item as Record<string, unknown>;

    return {
      assignmentId: asString(record.assignmentId ?? record.assignment_id ?? record.id ?? record.Id, ''),
      employeeId: asString(record.employeeId ?? record.employee_id, String(index + 1)),
      fullName: asString(record.fullName ?? record.full_name, "Unknown Employee"),
      jobTitle: asString(record.jobTitle ?? record.job_title, "Unknown Role"),
      roleName: asString(record.roleName ?? record.role_name, "Member"),
      allocationPercent: asNumber(record.allocationPercent ?? record.allocation_percent, 0),
      assignmentStatus: asString(record.assignmentStatus ?? record.assignment_status, "Pending"),
      availabilityPercent: asNumber(record.availabilityPercent ?? record.availability_percent, 0),
      workloadPercent: asNumber(record.workloadPercent ?? record.workload_percent, 0),
      assignedHours: asNumber(record.assignedHours ?? record.assigned_hours, 0),
      employeeStatus: asString(record.employeeStatus ?? record.employee_status, "Active"),
    };
  });
};

export async function persistSplitWorkloadToBackend(input: PersistSplitWorkloadInput): Promise<void> {
  const response = await fetch(BackendApiUrl.assignmentsSplitWorkload, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
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
    let detail = '';
    try {
      const payload = (await response.json()) as Record<string, unknown>;
      detail = typeof payload.detail === 'string'
        ? payload.detail
        : typeof payload.message === 'string'
          ? payload.message
          : '';
    } catch {
      detail = '';
    }

    throw new Error(detail || `Failed to persist split workload (${response.status})`);
  }
}

const normalizeActivities = (payload: unknown): ProjectManagerProjectActivity[] => {
  const source = Array.isArray(payload)
    ? payload
    : Array.isArray((payload as ProjectManagerActivityResponse | null)?.activities)
      ? (payload as ProjectManagerActivityResponse).activities
      : Array.isArray((payload as ProjectManagerActivityResponse | null)?.data)
        ? (payload as ProjectManagerActivityResponse).data
        : [];

  return source.map((item, index) => {
    const record = item as Record<string, unknown>;

    return {
      occurredAt: asString(record.occurredAt ?? record.occurred_at, new Date(Date.now() - index * 86400000).toISOString()),
      message: asString(record.message, "No activity available"),
    };
  });
};

const normalizeMilestones = (payload: unknown): ProjectManagerMilestone[] => {
  const source = Array.isArray(payload)
    ? payload
    : Array.isArray((payload as ProjectManagerMilestonesResponse | null)?.milestones)
      ? (payload as ProjectManagerMilestonesResponse).milestones
      : Array.isArray((payload as ProjectManagerMilestonesResponse | null)?.data)
        ? (payload as ProjectManagerMilestonesResponse).data
        : [];

  return source.map((item, index) => {
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
  const source = Array.isArray(payload)
    ? payload
    : Array.isArray((payload as ProjectManagerTimelineTasksResponse | null)?.tasks)
      ? (payload as ProjectManagerTimelineTasksResponse).tasks
      : Array.isArray((payload as ProjectManagerTimelineTasksResponse | null)?.data)
        ? (payload as ProjectManagerTimelineTasksResponse).data
        : [];

  return source.map((item, index) => {
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

  const response = await fetch(url);

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

  const response = await fetch(url);

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

  const response = await fetch(url);

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

  const response = await fetch(url);

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

  const response = await fetch(url);

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

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to load project timeline tasks (${response.status})`);
  }

  const payload: unknown = await response.json();
  return normalizeTimelineTasks(payload);
}

export async function createProjectManagerChangeRequest(
  input: ProjectManagerCreateChangeRequestInput
): Promise<ProjectManagerCreateChangeRequestResult> {
  const response = await fetch(BackendApiUrl.assignmentsCreate, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
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
    throw new Error(`Failed to create change request (${response.status})`);
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