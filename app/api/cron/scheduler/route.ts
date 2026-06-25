import { NextRequest, NextResponse } from 'next/server';
import { JobRegistry, Job } from '@/features/automation/registry';
import { ReminderService } from '@/features/reminders/services/reminder.service';
import { NotificationService } from '@/features/notifications/services/notification.service';

class ReminderJob implements Job {
  name = 'ReminderJob';
  priority = 1;
  async run() {
    const itemsProcessed = await ReminderService.processDueReminders();
    return { itemsProcessed };
  }
}

class CleanupJob implements Job {
  name = 'CleanupJob';
  priority = 4;
  async run() {
    const itemsProcessed = await NotificationService.purgeOldNotifications();
    return { itemsProcessed };
  }
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const registry = new JobRegistry([
      new ReminderJob(),
      new CleanupJob()
    ]);

    const results = await registry.runAll();
    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
