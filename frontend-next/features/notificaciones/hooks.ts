"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  getNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "@/features/notificaciones/api";
import { NotificationType } from "@/shared/types/domain";

export function useNotifications(payload: {
  token: string;
  type?: string;
  isRead?: boolean;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ["notifications", payload.type, payload.isRead, payload.page, payload.limit],
    queryFn: () => getNotifications(payload),
    enabled: !!payload.token,
  });
}

export function useUnreadCount(token: string) {
  return useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: () => getUnreadCount(token),
    enabled: !!token,
    refetchInterval: 30_000,
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function getNotificationIcon(type: NotificationType): string {
  const iconMap: Record<NotificationType, string> = {
    meeting_created: "📅",
    meeting_reminder: "🔔",
    meeting_cancelled: "❌",
    meeting_rescheduled: "🔄",
    match_created: "🤝",
  };
  return iconMap[type] ?? "📩";
}

export function getTypeGroupFilter(typeFilter: string): {
  type?: string;
  isRead?: boolean;
} {
  switch (typeFilter) {
    case "unread":
      return { isRead: false };
    case "meeting":
      return {};
    case "match":
      return { type: "match_created" as NotificationType };
    default:
      return {};
  }
}
