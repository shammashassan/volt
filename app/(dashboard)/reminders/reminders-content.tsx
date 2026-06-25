"use client";

import { useState } from "react";
import { Reminder, ReminderPriority, ReminderStatus } from "@/features/reminders/schemas/reminder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
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

export function RemindersContent({ initialReminders }: RemindersContentProps) {
  const [reminders, setReminders] = useState<Reminder[]>(initialReminders);
  const [inputText, setInputText] = useState("");
  const [priority, setPriority] = useState<ReminderPriority>("medium");

  const pending = reminders.filter(r => r.status === "pending");
  const completed = reminders.filter(r => r.status === "completed");

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const res = await createReminderFromTextAction(inputText, priority);
    if (res.success && res.data) {
      setReminders(prev => [res.data!, ...prev].sort((a, b) => a.status.localeCompare(b.status)));
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
      setReminders(prev => prev.map(r => r._id === id ? res.data! : r));
      toast.success(completedStatus ? "Reminder completed" : "Reminder pending");
    } else {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    const res = await deleteReminderAction(id);
    if (res.success) {
      setReminders(prev => prev.filter(r => r._id !== id));
      toast.success("Reminder deleted");
    } else {
      toast.error("Failed to delete reminder");
    }
  };

  const getPriorityColor = (p: ReminderPriority) => {
    switch (p) {
      case "high": return "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/10";
      case "medium": return "bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/10";
      default: return "bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/10";
    }
  };

  // Generate Today Timeline
  const getTimelineItems = () => {
    const todayStr = new Date().toDateString();
    return reminders
      .filter(r => new Date(r.triggerAt).toDateString() === todayStr)
      .sort((a, b) => new Date(a.triggerAt).getTime() - new Date(b.triggerAt).getTime());
  };

  const timelineItems = getTimelineItems();

  return (
    <div className="flex flex-1 flex-col gap-6 pb-12">
      {/* Header section */}
      <section className="px-4 pt-8 lg:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between max-w-7xl">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Clock className="size-6" />
              </div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-black tracking-tight md:text-4xl bg-clip-text text-transparent bg-linear-to-r from-foreground to-foreground/60">
                  Reminders
                </h1>
                <Badge variant="outline" className="h-6 rounded-full border-primary/20 bg-primary/5 text-primary text-[10px] uppercase font-bold tracking-widest px-2.5">
                  {pending.length} Pending
                </Badge>
              </div>
            </div>
            <p className="text-lg text-muted-foreground/80 max-w-2xl font-medium">
              Manage your checklists, tasks, and today&apos;s dynamic event timeline.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content section */}
      <section className="px-4 lg:px-6">
        <div className="max-w-7xl">
          <div className="grid gap-6 md:grid-cols-3">
            {/* List Column */}
            <div className="md:col-span-2 space-y-4">
              {/* Quick Add Capture */}
              <form onSubmit={handleQuickAdd} className="flex gap-2">
                <Input
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder='Add a reminder (e.g. "Meeting tomorrow at 3pm")'
                  className="flex-1 h-10 border-border/60 bg-background/50 focus-visible:ring-primary/20"
                />
                <Select value={priority} onValueChange={(v) => setPriority(v as ReminderPriority)}>
                  <SelectTrigger className="w-[110px] h-10 bg-background/50 border-border/60">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
                <Button type="submit" className="h-10 font-bold cursor-pointer">
                  <Plus className="size-4 mr-1.5" />
                  Add
                </Button>
              </form>

              {/* Pending checklist */}
              <Card className="border border-border/40 bg-card/30 backdrop-blur-sm rounded-2xl overflow-hidden shadow-xs">
                <CardHeader className="pb-3 border-b border-border/40 bg-muted/20">
                  <CardTitle className="text-base font-bold text-foreground">Tasks</CardTitle>
                </CardHeader>
                <CardContent className="p-0 divide-y divide-border/40">
                  {pending.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-8 text-center">No tasks to do.</p>
                  ) : (
                    pending.map(r => (
                      <div key={r._id as string} className="flex items-center justify-between p-4 gap-4 transition-colors hover:bg-muted/15">
                        <div className="flex items-center gap-3.5">
                          <Checkbox
                            checked={false}
                            onCheckedChange={(checked) => handleStatusChange(r._id as string, !!checked)}
                            className="size-4.5 border-border/80 focus-visible:ring-primary/25 cursor-pointer"
                          />
                          <div className="flex flex-col gap-0.5">
                            <span className="text-sm font-semibold text-foreground">{r.title}</span>
                            <span className="text-[11px] text-muted-foreground/75 flex items-center gap-1.5">
                              <Calendar className="size-3" />
                              {new Date(r.triggerAt).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant="outline" className={`h-5 text-[9px] uppercase font-bold tracking-wider px-2 ${getPriorityColor(r.priority)}`}>
                            {r.priority}
                          </Badge>
                          <Button onClick={() => handleDelete(r._id as string)} variant="ghost" size="icon" className="size-8 text-destructive hover:text-destructive/90 hover:bg-destructive/10 cursor-pointer">
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Completed checklist */}
              {completed.length > 0 && (
                <Card className="border border-border/40 bg-card/15 backdrop-blur-sm rounded-2xl overflow-hidden opacity-75 shadow-xs">
                  <CardHeader className="pb-3 border-b border-border/40 bg-muted/10">
                    <CardTitle className="text-base font-bold text-muted-foreground">Completed</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 divide-y divide-border/20">
                    {completed.map(r => (
                      <div key={r._id as string} className="flex items-center justify-between p-4 gap-4 transition-colors hover:bg-muted/5">
                        <div className="flex items-center gap-3.5">
                          <Checkbox
                            checked={true}
                            onCheckedChange={(checked) => handleStatusChange(r._id as string, !!checked)}
                            className="size-4.5 border-border/80 focus-visible:ring-primary/25 cursor-pointer"
                          />
                          <span className="text-sm font-medium line-through text-muted-foreground/80">{r.title}</span>
                        </div>
                        <Button onClick={() => handleDelete(r._id as string)} variant="ghost" size="icon" className="size-8 text-destructive hover:text-destructive/90 hover:bg-destructive/10 cursor-pointer">
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Timeline Sidebar Column */}
            <div className="space-y-4">
              <Card className="border border-border/40 bg-card/30 backdrop-blur-sm rounded-2xl overflow-hidden shadow-xs">
                <CardHeader className="pb-3 border-b border-border/40 bg-muted/20">
                  <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                    <Calendar className="size-4 text-primary" />
                    Today&apos;s Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5">
                  {timelineItems.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">No activities scheduled for today.</p>
                  ) : (
                    <Timeline value={timelineItems.filter(r => r.status === "completed").length}>
                      {timelineItems.map((item, idx) => (
                        <TimelineItem key={item._id as string} step={idx + 1}>
                          <TimelineHeader>
                            <TimelineSeparator />
                            <TimelineDate>
                              {new Date(item.triggerAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </TimelineDate>
                            <TimelineTitle className={item.status === "completed" ? "line-through text-muted-foreground/75" : ""}>
                              {item.title}
                            </TimelineTitle>
                            <TimelineIndicator className={item.status === "completed" ? "border-primary bg-primary" : ""} />
                          </TimelineHeader>
                          {item.priority && (
                            <TimelineContent>
                              <Badge variant="outline" className={`h-4 text-[9px] uppercase font-bold tracking-wider px-1.5 ${item.priority === "high" ? "bg-destructive/10 text-destructive border-destructive/20" : item.priority === "medium" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : "bg-blue-500/10 text-blue-500 border-blue-500/20"}`}>
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
        </div>
      </section>
    </div>
  );
}
