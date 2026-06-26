"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CalendarDays, CheckCircle2 } from 'lucide-react';
import { Reminder } from '@/features/reminders/schemas/reminder';
import { getRemindersAction, updateReminderAction } from '@/features/reminders/actions/reminders';
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
    <Card className="h-full flex flex-col border-border/50 bg-card/60 shadow-sm backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center gap-0 p-4 pb-3">
        <div className="flex items-center gap-2 flex-1">
          <div className="flex size-5 items-center justify-center rounded bg-violet-500/10">
            <CalendarDays className="size-3 text-violet-500" />
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">
            my day
          </span>
        </div>
        {reminders.length > 0 && (
          <span className="font-mono text-[10px] text-muted-foreground/50 tabular-nums">
            {reminders.length} pending
          </span>
        )}
      </CardHeader>

      <CardContent className="flex flex-1 flex-col p-4 pt-0">
        {!loaded ? (
          <div className="flex flex-col gap-1.5">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-8 animate-pulse rounded-md border border-border/30 bg-muted/20" />
            ))}
          </div>
        ) : reminders.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border/40 bg-muted/10 py-5">
            <div className="flex size-8 items-center justify-center rounded-full bg-emerald-500/10">
              <CheckCircle2 className="size-4 text-emerald-500" />
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <p className="text-xs font-medium text-foreground">All clear!</p>
              <p className="text-[10px] text-muted-foreground/60 text-center">No reminders due today.</p>
            </div>
            <Link href="/reminders" className="text-[10px] text-primary hover:underline">
              Manage reminders →
            </Link>
          </div>
        ) : (
          <ScrollArea className="flex-1 max-h-[170px]">
            <div className="flex flex-col gap-1.5 pr-3">
              {reminders.map(r => (
                <div
                  key={r._id as string}
                  className="flex items-center gap-2.5 rounded-md border border-border/40 bg-muted/10 px-2.5 py-2"
                >
                  <Checkbox onCheckedChange={() => handleChecked(r._id as string)} />
                  <span className="text-xs font-medium text-foreground truncate">{r.title}</span>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}