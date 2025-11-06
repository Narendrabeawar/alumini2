"use client";

import { Button } from "@/components/ui/button";
import { showToast } from "@/lib/toast";
import { useRouter } from "next/navigation";

export function NotificationList({ notifications }: { notifications: any[] }) {
  const router = useRouter();
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  async function markAllAsRead() {
    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mark_all_read: true }),
      });

      if (!response.ok) {
        throw new Error("Failed to mark as read");
      }

      showToast.success("All notifications marked as read");
      router.refresh();
    } catch (error) {
      showToast.error("Failed to update notifications");
    }
  }

  if (unreadCount === 0) {
    return null;
  }

  return (
    <Button onClick={markAllAsRead} variant="outline" size="sm">
      Mark All as Read
    </Button>
  );
}

