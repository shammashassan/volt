import { NextRequest, NextResponse } from "next/server";
import { ReminderService } from "@/features/reminders/services/reminder.service";
import { verifySchedulerRequest } from "@/lib/scheduler/verify";

async function handleRequest(req: Request) {
  try {
    const payload = await req.json().catch(() => null);

    if (!payload || !payload.id) {
      console.error("[Scheduler] Webhook received invalid payload (missing id)");
      // Return 200 to prevent QStash from retrying an invalid payload forever
      return NextResponse.json(
        { success: false, error: "Invalid payload, missing reminder id" },
        { status: 200 }
      );
    }

    const { id } = payload;
    console.log(`[Scheduler] Webhook received for reminder ID: ${id}`);

    await ReminderService.processReminderById(id);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[Scheduler] Exception in reminders webhook handler:", err);
    
    // Return 500 on transient database/server errors to allow QStash retrying
    return NextResponse.json(
      { success: false, error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

// Wrap with signature verification (bypassed in dev if keys are missing)
export const POST = verifySchedulerRequest(handleRequest);
