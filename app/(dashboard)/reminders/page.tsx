import { getRemindersAction } from '@/features/reminders/actions/reminders';
import { RemindersContent } from './reminders-content';

export const dynamic = 'force-dynamic';

export default async function RemindersPage() {
  const result = await getRemindersAction();
  const initialReminders = result.success && result.data ? result.data : [];

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Reminders</h2>
      </div>
      <RemindersContent initialReminders={initialReminders} />
    </div>
  );
}
