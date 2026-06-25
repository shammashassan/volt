import { getNotificationsAction } from '@/features/notifications/actions/notifications';
import { NotificationsContent } from './notifications-content';

export const dynamic = 'force-dynamic';

export default async function NotificationsPage() {
  const result = await getNotificationsAction();
  const initialNotifications = result.success && result.data ? result.data : [];

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Notifications</h2>
      </div>
      <NotificationsContent initialNotifications={initialNotifications} />
    </div>
  );
}
