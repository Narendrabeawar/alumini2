"use client";

import { Calendar, UserCheck, UserX, Mail, Bell } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { showToast } from "@/lib/toast";
import { useRouter } from "next/navigation";

function getNotificationIcon(type: string) {
  switch (type) {
    case "event_created":
    case "event_updated":
    case "event_reminder":
      return Calendar;
    case "profile_approved":
      return UserCheck;
    case "profile_rejected":
      return UserX;
    case "invite_received":
      return Mail;
    default:
      return Bell;
  }
}

export function NotificationItem({ notification }: { notification: any }) {
  const router = useRouter();
  const Icon = getNotificationIcon(notification.type);
  const link =
    notification.related_event_id
      ? `/events/${notification.related_event_id}`
      : notification.type === "profile_approved" || notification.type === "profile_rejected"
      ? "/profile"
      : "#";

  async function markAsRead() {
    if (notification.is_read) return;

    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notification_id: notification.id }),
      });

      if (!response.ok) {
        throw new Error("Failed to mark as read");
      }

      router.refresh();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  }

  return (
    <div
      onClick={link !== "#" ? markAsRead : undefined}
      className={`p-6 hover:bg-zinc-50 transition-colors cursor-pointer ${
        !notification.is_read ? "bg-blue-50" : ""
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`p-3 rounded-full ${
            !notification.is_read
              ? "bg-blue-100 text-blue-600"
              : "bg-zinc-100 text-zinc-600"
          }`}
        >
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between mb-1">
            <h3
              className={`font-semibold ${
                !notification.is_read
                  ? "text-zinc-900"
                  : "text-zinc-700"
              }`}
            >
              {notification.title}
            </h3>
            {!notification.is_read && (
              <span className="w-2 h-2 bg-blue-600 rounded-full ml-2 mt-2"></span>
            )}
          </div>
          <p className="text-zinc-600 text-sm mb-2">{notification.message}</p>
          <p className="text-zinc-400 text-xs">
            {new Date(notification.created_at).toLocaleString()}
          </p>
          {link !== "#" && (
            <div className="mt-3">
              <Button variant="ghost" size="sm" asChild>
                <Link href={link} onClick={markAsRead}>
                  View Details
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

