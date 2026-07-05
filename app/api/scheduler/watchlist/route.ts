import { NextRequest, NextResponse } from "next/server";
import { WatchlistService } from "@/lib/services/watchlist.service";
import { verifySchedulerRequest } from "@/lib/scheduler/verify";

async function handleRequest(req: Request) {
  try {
    const payload = await req.json().catch(() => null);

    if (!payload || !payload.id) {
      console.error("[Scheduler] Watchlist webhook received invalid payload (missing id)");
      // Return 200 to prevent QStash from retrying an invalid payload forever
      return NextResponse.json(
        { success: false, error: "Invalid payload, missing watchlist item id" },
        { status: 200 }
      );
    }

    const { id, type } = payload;
    console.log(`[Scheduler] Watchlist webhook received for item ID: ${id}, type: ${type || 'sync'}`);

    if (type && ['theatrical', 'ott', 'episode'].includes(type)) {
      await WatchlistService.processWatchlistTrigger(id, type);
    } else {
      // Fallback/Legacy route behavior
      const success = await WatchlistService.syncItemById(id);
      if (!success) {
        console.warn(`[Scheduler] Watchlist item ${id} not found in database.`);
        return NextResponse.json(
          { success: false, error: "Watchlist item not found" },
          { status: 200 }
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[Scheduler] Exception in watchlist webhook handler:", err);
    
    // Return 500 on transient database/server errors to allow QStash retrying
    return NextResponse.json(
      { success: false, error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

// Wrap with signature verification (bypassed in dev if keys are missing)
export const POST = verifySchedulerRequest(handleRequest);
