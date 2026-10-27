import { getCachedNotifications } from "@/lib/queries/notifications";
import { NotificationsContent } from "@/components/notifications/notifications-view";
import type { Metadata } from "next";
import { getSessionUser } from "@/lib/auth-utils";

export const metadata: Metadata = {
  title: "Notifications",
  description: "View and manage your activities, reminders, and alerts.",
};

export default async function NotificationsPage() {
  const user = await getSessionUser();
  const initialNotifications = await getCachedNotifications(user.id);
  return <NotificationsContent initialNotifications={initialNotifications} />;
}
