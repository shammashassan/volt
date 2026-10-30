"use client";

import { useEffect, useState } from 'react';
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CalendarDays, CheckCircle2 } from 'lucide-react';
import { Reminder } from '@/types/reminder';
import { getRemindersAction, updateReminderAction } from '@/lib/actions/reminders';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export function MyDayCard() {
  const router = useRouter();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await getRemindersAction();
      if (res.success && res.data) {
        const todayStr = new Date().toDateString();
        const todayReminders = res.data.filter(
          r => r.status === 'pending' && new Date(r.triggerAt).toDateString() === todayStr
        );
        setReminders(todayReminders);
      }
      setLoaded(true);
    }
    load();
  }, []);

  const handleChecked = async (id: string) => {
    const res = await updateReminderAction(id, { status: 'completed' });
    if (res.success) {
      setReminders(prev => prev.filter(r => r._id !== id));
      router.refresh();
    }
  };

  return (
    <Card size="sm" className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>
          <span className="flex items-center gap-2">
            <CalendarDays className="size-4 text-violet-500" />
            <span className="text-muted-foreground">My Day</span>
          </span>
        </CardTitle>
        {reminders.length > 0 && (
          <CardAction>
            <span className="font-mono text-xs text-muted-foreground/60 tabular-nums">
              {reminders.length} pending
            </span>
          </CardAction>
        )}
      </CardHeader>

      {/* min-h-0 lets flex-1 children shrink/grow correctly for ScrollArea */}
      <CardContent className="flex flex-1 flex-col min-h-0">
        {!loaded ? (
          <div className="flex flex-col gap-1.5">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-8 animate-pulse rounded-md border border-border/30 bg-muted/20" />
            ))}
          </div>
        ) : reminders.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border/40 bg-muted/10 p-3 text-center">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
              <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <p className="text-xs font-medium text-foreground">All clear for today</p>
              <Link href="/reminders" className="text-[10px] text-primary hover:underline">
                View all reminders &rarr;
              </Link>
            </div>
          </div>
        ) : (
          <ScrollArea className="h-full w-full">
            <div className="flex flex-col gap-1.5 pr-3">
              {reminders.map(reminder => {
                const id = String(reminder._id);
                return (
                  <div
                    key={id}
                    className="group/rem flex items-center gap-2.5 rounded-md border border-border/40 bg-muted/10 p-2 transition-colors hover:bg-muted/30"
                  >
                    <Checkbox
                      id={`rem-${id}`}
                      onCheckedChange={() => handleChecked(id)}
                    />
                    <div className="flex flex-1 flex-col min-w-0">
                      <label
                        htmlFor={`rem-${id}`}
                        className="cursor-pointer truncate text-xs font-medium text-foreground transition-colors group-hover/rem:text-primary"
                      >
                        {reminder.title}
                      </label>
                      <span className="text-[10px] text-muted-foreground/60">
                        {new Date(reminder.triggerAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
