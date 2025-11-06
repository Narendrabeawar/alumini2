import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { NotificationList } from "./notification-list";
import { NotificationItem } from "./notification-item";
import { Bell } from "lucide-react";

async function getNotifications() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data: notifications, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }

  return notifications || [];
}

export default async function NotificationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const notifications = await getNotifications();
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-700 to-green-600 bg-clip-text text-transparent mb-2">
            Notifications
          </h1>
          {unreadCount > 0 && (
            <p className="text-zinc-600">
              {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <NotificationList notifications={notifications} />
        )}
      </div>

      <div className="bg-white rounded-lg border border-zinc-200 divide-y divide-zinc-200">
        {notifications.length === 0 ? (
          <div className="p-12 text-center">
            <Bell className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
            <p className="text-zinc-600 text-lg">No notifications yet</p>
            <p className="text-zinc-500 text-sm mt-2">
              You'll be notified when new events are created or your profile is updated.
            </p>
          </div>
        ) : (
          notifications.map((notification) => (
            <NotificationItem key={notification.id} notification={notification} />
          ))
        )}
      </div>
    </div>
  );
}

