/**
 * Pure testable domain calculations for reminders and scheduling.
 */

export type ReminderUrgency = "overdue" | "today" | "upcoming" | "future" | "unscheduled"

export interface ReminderTimelineSummary {
  overdue: number
  today: number
  upcoming: number
  future: number
  unscheduled: number
}

/**
 * Calculates the millisecond offset shift between the server timezone and the client timezone.
 */
export function calculateTimezoneShiftMs(serverOffset: number, clientOffset?: number): number {
  if (typeof clientOffset !== "number" || Number.isNaN(clientOffset)) {
    return 0
  }
  return (serverOffset - clientOffset) * 60 * 1000
}

/**
 * Checks whether a reminder's trigger timestamp is in the past compared to the reference time.
 */
export function isReminderOverdue(triggerAt: Date | string | null | undefined, now: Date = new Date()): boolean {
  if (!triggerAt) return false
  const triggerDate = typeof triggerAt === "string" ? new Date(triggerAt) : triggerAt
  return triggerDate.getTime() < now.getTime()
}

/**
 * Evaluates the urgency tier of a scheduled reminder relative to the current reference date.
 */
export function getReminderUrgency(
  triggerAt: Date | string | null | undefined,
  now: Date = new Date()
): ReminderUrgency {
  if (!triggerAt) return "unscheduled"
  const triggerDate = typeof triggerAt === "string" ? new Date(triggerAt) : triggerAt

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const endOfToday = startOfToday + 24 * 60 * 60 * 1000
  const triggerTime = triggerDate.getTime()

  if (triggerTime < now.getTime()) {
    return "overdue"
  }
  if (triggerTime >= startOfToday && triggerTime < endOfToday) {
    return "today"
  }
  if (triggerTime >= endOfToday && triggerTime < endOfToday + 7 * 24 * 60 * 60 * 1000) {
    return "upcoming"
  }
  return "future"
}

/**
 * Aggregates a list of reminders into timeline buckets for dashboard metrics.
 */
export function calculateReminderTimelineSummary(
  items: Array<{ triggerAt?: string | Date | null; status?: string }>,
  now: Date = new Date()
): ReminderTimelineSummary {
  const summary: ReminderTimelineSummary = {
    overdue: 0,
    today: 0,
    upcoming: 0,
    future: 0,
    unscheduled: 0,
  }

  for (const item of items) {
    if (item.status === "completed") continue
    const urgency = getReminderUrgency(item.triggerAt, now)
    summary[urgency]++
  }

  return summary
}
