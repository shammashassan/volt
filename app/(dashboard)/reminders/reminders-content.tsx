"use client";

import { useState } from "react";
import { Reminder, ReminderPriority, ReminderStatus } from "@/features/reminders/schemas/reminder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createReminderFromTextAction, updateReminderAction, deleteReminderAction } from "@/features/reminders/actions/reminders";
import { Plus, Trash2, Calendar, Clock } from "lucide-react";
import { toast } from "sonner";
import {
  Timeline,
  TimelineContent,
  TimelineDate,
  TimelineHeader,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle,
} from "@/components/ui/timeline";

interface RemindersContentProps {
  initialReminders: Reminder[];
}

const PRIORITY_VARIANT: Record<ReminderPriority, "destructive" | "secondary" | "outline"> = {
  high: "destructive",
  medium: "secondary",
  low: "outline",
};

export function RemindersContent({ initialReminders }: RemindersContentProps) {
  const [reminders, setReminders] = useState<Reminder[]>(initialReminders);
  const [inputText, setInputText] = useState("");
  const [priority, setPriority] = useState<ReminderPriority>("medium");

  const pending = reminders.filter((r) => r.status === "pending");
  const completed = reminders.filter((r) => r.status === "completed");

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    const res = await createReminderFromTextAction(inputText, priority);
    if (res.success && res.data) {
      setReminders((prev) =>
        [res.data!, ...prev].sort((a, b) => a.status.localeCompare(b.status))
      );
      setInputText("");
      toast.success("Reminder added");
    } else {
      toast.error("Failed to add reminder");
    }
  };

  const handleStatusChange = async (id: string, completedStatus: boolean) => {
    const nextStatus: ReminderStatus = completedStatus ? "completed" : "pending";
    const res = await updateReminderAction(id, { status: nextStatus });
    if (res.success && res.data) {
      setReminders((prev) => prev.map((r) => (r._id === id ? res.data! : r)));
      toast.success(completedStatus ? "Reminder completed" : "Reminder pending");
      // revalidateTag('reminders') in the server action handles cache invalidation
    } else {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    const res = await deleteReminderAction(id);
    if (res.success) {
      setReminders((prev) => prev.filter((r) => r._id !== id));
      toast.success("Reminder deleted");
      // revalidateTag('reminders') in the server action handles cache invalidation
    } else {
      toast.error("Failed to delete reminder");
    }
  };

  const getTimelineItems = () => {
    const todayStr = new Date().toDateString();
    return reminders
      .filter((r) => new Date(r.triggerAt).toDateString() === todayStr)
      .sort((a, b) => new Date(a.triggerAt).getTime() - new Date(b.triggerAt).getTime());
  };

  const timelineItems = getTimelineItems();

  return (
    <div className="flex flex-1 flex-col gap-6 pb-12">
      {/* Header */}
      <section className="px-4 pt-8 lg:px-6">
        <div className="flex flex-col gap-2 max-w-7xl">
          <div className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Clock />
            </div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-black tracking-tight md:text-4xl bg-clip-text text-transparent bg-linear-to-r from-foreground to-foreground/60">
                Reminders
              </h1>
              <Badge variant="outline" className="rounded-full">
                {pending.length} Pending
              </Badge>
            </div>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl font-medium">
            Manage your checklists, tasks, and today&apos;s dynamic event timeline.
          </p>
        </div>
      </section>

      <Separator />

      {/* Main Content */}
      <section className="px-4 lg:px-6">
        <div className="max-w-7xl grid gap-6 md:grid-cols-3">
          {/* List Column */}
          <div className="md:col-span-2 flex flex-col gap-4">
            {/* Quick Add */}
            <form onSubmit={handleQuickAdd} className="flex gap-2">
              <Input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder='Add a reminder (e.g. "Meeting tomorrow at 3pm")'
                className="flex-1"
              />
              <Select value={priority} onValueChange={(v) => setPriority(v as ReminderPriority)}>
                <SelectTrigger className="w-[110px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Button type="submit">
                <Plus data-icon="inline-start" />
                Add
              </Button>
            </form>

            {/* Pending */}
            <Card>
              <CardHeader>
                <CardTitle>Tasks</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {pending.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-8 text-center">
                    No tasks to do.
                  </p>
                ) : (
                  <div className="divide-y">
                    {pending.map((r) => (
                      <div
                        key={r._id as string}
                        className="flex items-center justify-between px-4 py-3 gap-4"
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={false}
                            onCheckedChange={(checked) =>
                              handleStatusChange(r._id as string, !!checked)
                            }
                          />
                          <div className="flex flex-col gap-0.5">
                            <span className="text-sm font-semibold">{r.title}</span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                              <Calendar className="size-3" />
                              {new Date(r.triggerAt).toLocaleString([], {
                                dateStyle: "short",
                                timeStyle: "short",
                              })}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant={PRIORITY_VARIANT[r.priority]}>
                            {r.priority}
                          </Badge>
                          <Button
                            onClick={() => handleDelete(r._id as string)}
                            variant="ghost"
                            size="icon"
                          >
                            <Trash2 />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Completed */}
            {completed.length > 0 && (
              <Card className="opacity-70">
                <CardHeader>
                  <CardTitle className="text-muted-foreground">Completed</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {completed.map((r) => (
                      <div
                        key={r._id as string}
                        className="flex items-center justify-between px-4 py-3 gap-4"
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={true}
                            onCheckedChange={(checked) =>
                              handleStatusChange(r._id as string, !!checked)
                            }
                          />
                          <span className="text-sm line-through text-muted-foreground">
                            {r.title}
                          </span>
                        </div>
                        <Button
                          onClick={() => handleDelete(r._id as string)}
                          variant="ghost"
                          size="icon"
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Timeline Sidebar */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="size-4 text-primary" />
                  Today&apos;s Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                {timelineItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    No activities scheduled for today.
                  </p>
                ) : (
                  <Timeline value={timelineItems.filter((r) => r.status === "completed").length}>
                    {timelineItems.map((item, idx) => (
                      <TimelineItem key={item._id as string} step={idx + 1}>
                        <TimelineHeader>
                          <TimelineSeparator />
                          <TimelineDate>
                            {new Date(item.triggerAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </TimelineDate>
                          <TimelineTitle
                            className={
                              item.status === "completed"
                                ? "line-through text-muted-foreground"
                                : ""
                            }
                          >
                            {item.title}
                          </TimelineTitle>
                          <TimelineIndicator
                            className={
                              item.status === "completed" ? "border-primary bg-primary" : ""
                            }
                          />
                        </TimelineHeader>
                        {item.priority && (
                          <TimelineContent>
                            <Badge variant={PRIORITY_VARIANT[item.priority]}>
                              {item.priority}
                            </Badge>
                          </TimelineContent>
                        )}
                      </TimelineItem>
                    ))}
                  </Timeline>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
