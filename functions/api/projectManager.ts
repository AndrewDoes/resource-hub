import { BackendApiUrl } from "../BackendApiUrl";

export type ProjectManagerProjectStatus = "on-track" | "at-risk" | "delayed";

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
}

const fallbackStatus = (value: string | undefined): ProjectManagerProjectStatus => {
  if (value === "at-risk" || value === "delayed") {
    return value;
  }

  return "on-track";
};

const asString = (value: unknown, fallback: string): string => {
  return typeof value === "string" && value.trim().length > 0 ? value : fallback;
};

const asNumber = (value: unknown, fallback: number): number => {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
};

const normalizeProjects = (payload: unknown): ProjectManagerProjectSummary[] => {
  const source = Array.isArray(payload)
    ? payload
    : Array.isArray((payload as ProjectManagerProjectsListResponse | null)?.projects)
      ? (payload as ProjectManagerProjectsListResponse).projects
      : Array.isArray((payload as ProjectManagerProjectsListResponse | null)?.items)
        ? (payload as ProjectManagerProjectsListResponse).items
        : Array.isArray((payload as ProjectManagerProjectsListResponse | null)?.data)
          ? (payload as ProjectManagerProjectsListResponse).data
          : [];

  return source.map((item, index) => {
    const record = item as Record<string, unknown>;

    return {
      id: asString(record.id, String(index + 1)),
      name: asString(record.name, "Untitled Project"),
      startDate: asString(record.startDate ?? record.start_date, "2026-01-01"),
      endDate: asString(record.endDate ?? record.end_date, "2026-12-31"),
      status: fallbackStatus(
        typeof record.status === "string" ? record.status.toLowerCase() : undefined
      ),
      progress: asNumber(record.progress, 0),
      teamSize: asNumber(record.teamSize ?? record.team_size, 0),
      description: asString(record.description, "No description provided"),
    };
  });
};

export async function fetchProjectManagerProjects(): Promise<ProjectManagerProjectSummary[]> {
  const response = await fetch(BackendApiUrl.projectManagerProjectsList);

  if (!response.ok) {
    throw new Error(`Failed to load project manager projects (${response.status})`);
  }

  const payload: unknown = await response.json();
  return normalizeProjects(payload);
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