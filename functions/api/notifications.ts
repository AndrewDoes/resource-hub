import { BackendApiUrl } from "../BackendApiUrl";
import { authorizedFetch } from "./authorizedFetch";
import type { Notification } from "@/app/types";

export interface GetNotificationsResponse {
  notifications: NotificationItemResponse[];
}

export interface NotificationItemResponse {
  id: string;
  type: string;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  sourceEntityType: string | null;
  sourceEntityId: string | null;
}

/**
 * Maps backend NotificationItemResponse to frontend Notification type
 */
function mapNotification(item: NotificationItemResponse, role?: string): Notification {
  // Construct navigation target based on entity type and user role
  let navigationTarget = "/dashboard";
  
  if (role) {
    const userRole = role.toLowerCase();
    if (item.sourceEntityType === "Project") {
      if (userRole === "pm") {
        navigationTarget = "/pm/project-overview";
      } else if (userRole === "marketing") {
        navigationTarget = "/marketing/dashboard";
      } else if (userRole === "gm") {
        navigationTarget = "/gm/planning";
      } else if (userRole === "hr") {
        navigationTarget = "/hr/hr-validation";
      } else {
        navigationTarget = "/dashboard";
      }
    } else if (item.sourceEntityType === "Assignment") {
      if (userRole === "employee") {
        navigationTarget = "/employee/my-projects";
      } else if (userRole === "pm") {
        navigationTarget = "/pm/project-manager";
      }
    }
  }

  // Map backend types to frontend expectations
  let type: 'assignment' | 'approval' | 'alert' | 'info' = 'info';
  const backendType = item.type.toLowerCase();

  if (backendType === 'assignment') type = 'assignment';
  else if (backendType === 'alert') type = 'alert';
  else if (backendType === 'feedback') type = 'approval';
  else if (backendType === 'change') type = 'info';

  return {
    id: item.id,
    type: type,
    title: item.title,
    message: item.message,
    timestamp: new Date(item.createdAt).toLocaleString(),
    read: item.isRead,
    navigationTarget: navigationTarget,
    highlightProject: item.sourceEntityType === "Project" ? item.sourceEntityId || undefined : undefined
  };
}

export async function fetchAllNotifications(role?: string): Promise<Notification[]> {
  const response = await authorizedFetch(BackendApiUrl.notifications);
  if (!response.ok) {
    return [];
  }
  const data = (await response.json()) as GetNotificationsResponse;
  return (data.notifications || []).map(item => mapNotification(item, role));
}

export async function markNotificationAsRead(id: string): Promise<boolean> {
  const response = await authorizedFetch(BackendApiUrl.notificationsMarkRead(id), {
    method: "PUT",
  });
  return response.ok;
}

export async function markAllNotificationsAsRead(): Promise<boolean> {
  const response = await authorizedFetch(BackendApiUrl.notificationsMarkAllRead, {
    method: "POST",
  });
  return response.ok;
}
