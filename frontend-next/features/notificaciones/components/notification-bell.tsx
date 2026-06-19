"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import {
  useUnreadCount,
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
  getNotificationIcon,
} from "@/features/notificaciones/hooks";
import { NotificationEntity } from "@/shared/types/domain";
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
  return `Hace ${diffDays}d`;
}

function getRelatedEntityLink(notification: NotificationEntity): string | null {
  if (!notification.relatedEntityType || !notification.relatedEntityId) return null;

  switch (notification.relatedEntityType) {
    case "Meeting":
      return "/reuniones";
    case "Match":
      return "/matches";
    case "Evento":
      return `/eventos/${notification.relatedEntityId}`;
    default:
      return null;
  }
}

function NotificationItem({
  notification,
  onMarkAsRead,
}: {
  notification: NotificationEntity;
  onMarkAsRead: (id: string) => void;
}) {
  const link = getRelatedEntityLink(notification);
  const icon = getNotificationIcon(notification.type);

  const content = (
    <div
      className={cn(
        "flex gap-3 rounded-lg px-3 py-2.5 transition hover:bg-slate-50 cursor-pointer",
        !notification.isRead && "bg-accent/5"
      )}
      onClick={() => {
        if (!notification.isRead) onMarkAsRead(notification._id);
      }}
    >
      <span className="mt-0.5 text-lg shrink-0">{icon}</span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className={cn("text-sm font-semibold text-ink truncate", !notification.isRead && "font-bold")}>
            {notification.title}
          </p>
          {!notification.isRead && (
            <span className="h-2 w-2 shrink-0 rounded-full bg-accent" />
          )}
        </div>
        <p className="mt-0.5 text-xs text-muted line-clamp-2">{notification.message}</p>
        <p className="mt-1 text-[11px] text-muted/70">{formatRelativeTime(notification.createdAt)}</p>
      </div>
    </div>
  );

  if (link && notification.isRead) {
    return <Link href={link}>{content}</Link>;
  }

  return content;
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const token = useAuthStore((s) => s.token);

  const { data: unreadData } = useUnreadCount(token ?? "");
  const unreadCount = unreadData?.unreadCount ?? 0;

  const { data: recentData } = useNotifications({
    token: token ?? "",
    limit: 10,
  });

  const markAsRead = useMarkAsRead();
  const markAllRead = useMarkAllAsRead();

  const notifications = recentData?.data ?? [];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        className="relative flex h-9 w-9 items-center justify-center rounded-full bg-slate-100/80 text-ink transition hover:bg-slate-200"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Notificaciones"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.322 23.848 23.848 0 005.454 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
          />
        </svg>

        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl2 bg-white shadow-card ring-1 ring-slate-200/70">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <h3 className="text-sm font-bold text-ink">Notificaciones</h3>
            {unreadCount > 0 && (
              <button
                type="button"
                className="text-xs font-medium text-accent hover:underline"
                onClick={() => markAllRead.mutate(token ?? "")}
              >
                Marcar todas como leídas
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-muted">No hay notificaciones</div>
            ) : (
              notifications.map((n) => (
                <NotificationItem
                  key={n._id}
                  notification={n}
                  onMarkAsRead={(id) => markAsRead.mutate({ token: token ?? "", id })}
                />
              ))
            )}
          </div>

          <div className="border-t border-slate-100 px-4 py-2.5">
            <Link
              href="/notificaciones"
              className="block text-center text-xs font-semibold text-accent hover:underline"
              onClick={() => setOpen(false)}
            >
              Ver todas las notificaciones
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}