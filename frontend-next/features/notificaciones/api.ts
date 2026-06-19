import { apiRequest } from "@/shared/api/client";
import {
  NotificationsResponse,
  UnreadCountResponse,
  NotificationEntity,
} from "@/shared/types/domain";

export function getNotifications(payload: {
  token: string;
  type?: string;
  isRead?: boolean;
  page?: number;
  limit?: number;
}) {
  const params = new URLSearchParams();

  if (payload.type) params.set("type", payload.type);
  if (payload.isRead !== undefined) params.set("isRead", String(payload.isRead));
  if (payload.page) params.set("page", String(payload.page));
  if (payload.limit) params.set("limit", String(payload.limit));

  const query = params.toString();
  const path = query ? `/api/notifications?${query}` : "/api/notifications";

  return apiRequest<NotificationsResponse>(path, {
    method: "GET",
    token: payload.token,
  });
}

export function getUnreadCount(token: string) {
  return apiRequest<UnreadCountResponse>("/api/notifications/unread-count", {
    method: "GET",
    token,
  });
}

export function markNotificationAsRead(payload: { token: string; id: string }) {
  return apiRequest<{ message: string; notification: NotificationEntity }>(
    `/api/notifications/${payload.id}/read`,
    { method: "PUT", token: payload.token }
  );
}

export function markAllNotificationsAsRead(token: string) {
  return apiRequest<{ message: string; modifiedCount: number }>(
    "/api/notifications/mark-all-read",
    { method: "PUT", token }
  );
}

export function deleteNotification(payload: { token: string; id: string }) {
  return apiRequest<{ message: string }>(`/api/notifications/${payload.id}`, {
    method: "DELETE",
    token: payload.token,
  });
}