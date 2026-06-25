"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { CalendarDays } from 'lucide-react';
import { Reminder } from '@/features/reminders/schemas/reminder';
import { getRemindersAction, updateReminderAction } from '@/features/reminders/actions/reminders';

export function MyDayCard() {
  const [reminders, setReminders] = useState<Reminder[]>([]);

  useEffect(() => {
    async function load() {
      const res = await getRemindersAction();
      if (res.success && res.data) {
        const todayStr = new Date().toDateString();
        const todayReminders = res.data.filter(
          r => r.status === 'pending' && new Date(r.triggerAt).toDateString() === todayStr
        );
        setReminders(todayReminders.slice(0, 3));
      }
    }
    load();
  }, []);

  const handleChecked = async (id: string) => {
    const res = await updateReminderAction(id, { status: 'completed' });
    if (res.success) {
      setReminders(prev => prev.filter(r => r._id !== id));
    }
  };

  return (
    <Card className="workspace-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
          <CalendarDays className="size-4 text-violet-500" />
          My Day
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {reminders.length === 0 ? (
          <p className="text-xs text-muted-foreground py-4 text-center">No tasks due today.</p>
        ) : (
          reminders.map(r => (
            <div key={r._id as string} className="flex items-center gap-2.5 py-1">
              <Checkbox onCheckedChange={() => handleChecked(r._id as string)} />
              <span className="text-xs font-medium text-foreground truncate">{r.title}</span>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
