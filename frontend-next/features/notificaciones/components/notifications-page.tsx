"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
  getNotificationIcon,
  getTypeGroupFilter,
} from "@/features/notificaciones/hooks";
import {
  NOTIFICATION_TYPE_GROUP_FILTERS,
  NotificationEntity,
  NotificationType,
} from "@/shared/types/domain";
import { cn } from "@/lib/cn";

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMinutes < 1) return "Ahora";
  if (diffMinutes < 60) return `Hace ${diffMinutes} min`;
  if (diffHours < 24) return `Hace ${diffHours}h`;
  if (diffDays < 7) return `Hace ${diffDays}d`;
  return date.toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
}

function getTypeBadgeColor(type: NotificationType): string {
  const map: Record<NotificationType, string> = {
    meeting_created: "bg-accent/10 text-accent",
    meeting_reminder: "bg-warning/10 text-warning",
    meeting_cancelled: "bg-danger/10 text-danger",
    meeting_rescheduled: "bg-warning/10 text-warning",
    match_created: "bg-success/10 text-success",
  };
  return map[type] ?? "bg-slate-100 text-slate-600";
}

function NotificationRow({
  notification,
  onMarkAsRead,
  onDelete,
}: {
  notification: NotificationEntity;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const icon = getNotificationIcon(notification.type);

  return (
    <div
      className={cn(
        "flex items-start gap-4 rounded-xl px-4 py-3.5 transition",
        !notification.isRead ? "bg-accent/5 ring-1 ring-accent/10" : "hover:bg-slate-50"
      )}
    >
      <span className="mt-0.5 text-xl shrink-0">{icon}</span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className={cn("text-sm text-ink", !notification.isRead && "font-bold")}>
            {notification.title}
          </p>
          {!notification.isRead && (
            <span className="h-2 w-2 shrink-0 rounded-full bg-accent" />
          )}
          <span className={cn("ml-auto shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold", getTypeBadgeColor(notification.type))}>
            {notification.type.replace("_", " ").replace("meeting", "reunión").replace("match", "match")}
          </span>
        </div>
        <p className="mt-1 text-sm text-muted">{notification.message}</p>
        <p className="mt-1.5 text-xs text-muted/60">{formatRelativeTime(notification.createdAt)}</p>
      </div>

      <div className="flex shrink-0 flex-col gap-1">
        {!notification.isRead && (
          <button
            type="button"
            className="rounded-lg px-2.5 py-1 text-xs font-medium text-accent hover:bg-accent/10 transition"
            onClick={() => onMarkAsRead(notification._id)}
          >
            Marcar leída
          </button>
        )}
        <button
          type="button"
          className="rounded-lg px-2.5 py-1 text-xs font-medium text-danger hover:bg-danger/10 transition"
          onClick={() => onDelete(notification._id)}
        >
          Eliminar
        </button>
      </div>
    </div>
  );
}

export function NotificationsPage() {
  const token = useAuthStore((s) => s.token);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [page, setPage] = useState(1);

  const filterParams = getTypeGroupFilter(activeFilter);

  const { data, isLoading } = useNotifications({
    token: token ?? "",
    type: filterParams.type,
    isRead: filterParams.isRead,
    page,
    limit: 15,
  });

  const markAsRead = useMarkAsRead();
  const markAllRead = useMarkAllAsRead();
  const deleteNotif = useDeleteNotification();

  const notifications = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-[var(--font-heading)] text-2xl font-bold text-ink">Notificaciones</h1>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => markAllRead.mutate(token ?? "")}
          loading={markAllRead.isPending}
        >
          Marcar todas como leídas
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {NOTIFICATION_TYPE_GROUP_FILTERS.map((filter) => (
          <button
            key={filter.key}
            type="button"
            className={cn(
              "rounded-full px-3.5 py-1.5 text-xs font-semibold transition",
              activeFilter === filter.key
                ? "bg-accent text-white"
                : "bg-slate-100 text-ink hover:bg-slate-200"
            )}
            onClick={() => {
              setActiveFilter(filter.key);
              setPage(1);
            }}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <Card className="p-8 text-center text-sm text-muted">Cargando notificaciones...</Card>
      ) : notifications.length === 0 ? (
        <EmptyState
          title="Sin notificaciones"
          description="No hay notificaciones para mostrar en esta categoría."
        />
      ) : (
        <Card className="divide-y divide-slate-100 p-0">
          {notifications.map((n) => (
            <NotificationRow
              key={n._id}
              notification={n}
              onMarkAsRead={(id) => markAsRead.mutate({ token: token ?? "", id })}
              onDelete={(id) => deleteNotif.mutate({ token: token ?? "", id })}
            />
          ))}
        </Card>
      )}

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Anterior
          </Button>
          <span className="text-sm text-muted">
            Página {meta.page} de {meta.totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={page >= meta.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Siguiente
          </Button>
        </div>
      )}
    </div>
  );
}
