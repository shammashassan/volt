import { NextRequest, NextResponse } from 'next/server';
import { CalendarService } from '@/lib/services/calendar.service';
import { getDb } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const token = searchParams.get('token');

    if (!token) {
      return new NextResponse('Unauthorized: Missing subscription token', { status: 401 });
    }

    const db = await getDb();
    // Validate user by calendarToken preference
    const user = await db.collection('users').findOne({ 'preferences.calendarToken': token });
    if (!user) {
      // Temporary: validate with user email if token isn't generated yet
      return new NextResponse('Unauthorized: Invalid subscription token', { status: 401 });
    }

    const icsContent = await CalendarService.generateIcsFeed(user._id.toString());

    return new NextResponse(icsContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'attachment; filename="volt-calendar.ics"',
      },
    });
  } catch (error: any) {
    return new NextResponse(`Error generating calendar: ${error.message}`, { status: 500 });
  }
}
