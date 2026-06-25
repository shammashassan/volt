import { getDb } from '@/lib/db';
import { Reminder } from '@/features/reminders/schemas/reminder';
import { WatchlistItem } from '@/app/(dashboard)/media-watchlist/_types/watchlist.types';

export class CalendarService {
  public static async generateIcsFeed(userId: string): Promise<string> {
    const db = await getDb();
    
    // Fetch active reminders
    const reminders = await db.collection<Reminder>('reminders').find({
      userId,
      deletedAt: { $exists: false }
    }).toArray();

    // Fetch watchlist items
    const watchlist = await db.collection<WatchlistItem>('watchlist').find({
      userId,
      deletedAt: { $exists: false }
    }).toArray();

    let ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Volt//Personal Knowledge OS//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH'
    ];

    // Format Date helper
    const formatIcsDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    // Add reminders
    for (const r of reminders) {
      const dtStart = formatIcsDate(new Date(r.triggerAt));
      const dtEnd = formatIcsDate(new Date(new Date(r.triggerAt).getTime() + 30 * 60 * 1000)); // Default 30 min duration
      const uid = `reminder-${r._id}`;
      const stamp = formatIcsDate(r.createdAt || new Date());
      const modified = formatIcsDate(r.updatedAt || new Date());

      ics.push(
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${stamp}`,
        `LAST-MODIFIED:${modified}`,
        `CREATED:${stamp}`,
        `DTSTART:${dtStart}`,
        `DTEND:${dtEnd}`,
        `SUMMARY:Reminder: ${r.title}`,
        r.description ? `DESCRIPTION:${r.description}` : '',
        'STATUS:CONFIRMED',
        'END:VEVENT'
      );
    }

    // Add watchlist releases
    for (const w of watchlist) {
      const relDateStr = (w.metadata as any)?.releaseDate;
      if (!relDateStr) continue;

      const relDate = new Date(relDateStr);
      // All-day event formatting (YYYYMMDD)
      const dateVal = relDate.toISOString().replace(/[-:]/g, '').split('T')[0];
      const uid = `watchlist-${w._id}`;
      const stamp = formatIcsDate(w.createdAt || new Date());

      ics.push(
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${stamp}`,
        `DTSTART;VALUE=DATE:${dateVal}`,
        `SUMMARY:Release: ${w.metadata?.title || 'Media'}`,
        `DESCRIPTION:Watchlist item release date for ${w.type}.`,
        'STATUS:CONFIRMED',
        'END:VEVENT'
      );
    }

    ics.push('END:VCALENDAR');

    // Clean up empty lines and join with CRLF
    return ics.filter(line => line.trim().length > 0).join('\r\n');
  }
}
