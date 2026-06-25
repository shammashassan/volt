"use client";

import { useState, useEffect } from "react";
import { Reminder, ReminderPriority, ReminderStatus, ReminderAttachment } from "@/features/reminders/schemas/reminder";
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
import Link from "next/link";
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

interface NoteSelectItem {
  _id: string;
  title: string;
}

interface ProjectSelectItem {
  _id: string;
  name: string;
  title?: string;
}

interface RemindersContentProps {
  initialReminders: Reminder[];
  notes: NoteSelectItem[];
  projects: ProjectSelectItem[];
}

const PRIORITY_VARIANT: Record<ReminderPriority, "destructive" | "secondary" | "outline"> = {
  high: "destructive",
  medium: "secondary",
  low: "outline",
};

export function RemindersContent({ initialReminders, notes, projects }: RemindersContentProps) {
  const [reminders, setReminders] = useState<Reminder[]>(initialReminders);

  useEffect(() => {
    setReminders(initialReminders);
  }, [initialReminders]);

  const [inputText, setInputText] = useState("");
  const [priority, setPriority] = useState<ReminderPriority>("medium");
  const [selectedNoteId, setSelectedNoteId] = useState<string>("none");
  const [selectedProjectId, setSelectedProjectId] = useState<string>("none");

  const pending = reminders.filter((r) => r.status === "pending");
  const completed = reminders.filter((r) => r.status === "completed");

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const attachments: ReminderAttachment[] = [];
    if (selectedNoteId && selectedNoteId !== "none") {
      attachments.push({ type: "note", id: selectedNoteId });
    }
    if (selectedProjectId && selectedProjectId !== "none") {
      attachments.push({ type: "project", id: selectedProjectId });
    }

    const res = await createReminderFromTextAction(inputText, priority, attachments);
    if (res.success && res.data) {
      // Populate newly added attachments titles locally
      const populatedAttachments = attachments.map((a) => {
        let title = `Attached ${a.type}`;
        if (a.type === "note") {
          const noteObj = notes.find((n) => n._id === a.id);
          if (noteObj) title = noteObj.title;
        } else if (a.type === "project") {
          const projObj = projects.find((p) => p._id === a.id);
          if (projObj) title = projObj.name || projObj.title || title;
        }
        return { ...a, title };
      });
      const newReminder = { ...res.data!, attachments: populatedAttachments };

      setReminders((prev) =>
        [newReminder, ...prev].sort((a, b) => a.status.localeCompare(b.status))
      );
      setInputText("");
      setSelectedNoteId("none");
      setSelectedProjectId("none");
      toast.success("Reminder added");
    } else {
      toast.error("Failed to add reminder");
    }
  };

  const handleStatusChange = async (id: string, completedStatus: boolean) => {
    const nextStatus: ReminderStatus = completedStatus ? "completed" : "pending";
    const res = await updateReminderAction(id, { status: nextStatus });
    if (res.success && res.data) {
      setReminders((prev) => prev.map((r) => (r._id === id ? { ...r, status: nextStatus } : r)));
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
            <form onSubmit={handleQuickAdd} className="flex flex-col gap-3 bg-muted/20 p-3.5 rounded-xl border border-border/40">
              <div className="flex gap-2">
                <Input
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder='Add a reminder (e.g. "Meeting tomorrow at 3pm")'
                  className="flex-1"
                />
                <Button type="submit">
                  <Plus data-icon="inline-start" />
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-muted-foreground/80 font-medium lowercase">priority:</span>
                  <Select value={priority} onValueChange={(v) => setPriority(v as ReminderPriority)}>
                    <SelectTrigger className="w-[100px] h-8 text-xs">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-muted-foreground/80 font-medium lowercase">link project:</span>
                  <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                    <SelectTrigger className="w-[150px] h-8 text-xs">
                      <SelectValue placeholder="Select Project" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {projects.map((p) => (
                        <SelectItem key={p._id} value={p._id}>
                          {p.name || p.title || "Untitled Project"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-muted-foreground/80 font-medium lowercase">link note:</span>
                  <Select value={selectedNoteId} onValueChange={setSelectedNoteId}>
                    <SelectTrigger className="w-[150px] h-8 text-xs">
                      <SelectValue placeholder="Select Note" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {notes.map((n) => (
                        <SelectItem key={n._id} value={n._id}>
                          {n.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
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
                            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mt-0.5">
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Calendar className="size-3" />
                                {new Date(r.triggerAt).toLocaleString([], {
                                  dateStyle: "short",
                                  timeStyle: "short",
                                })}
                              </span>
                              {r.attachments && r.attachments.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                  {r.attachments.map((a, i) => {
                                    const linkPath = a.type === 'note' ? '/notes' : a.type === 'project' ? `/projects/${a.id}` : a.type === 'person' ? `/people/${a.id}` : a.type === 'resource' ? '/resources' : '/media-watchlist';
                                    return (
                                      <Link
                                        key={i}
                                        href={linkPath}
                                        className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-muted text-[10px] font-semibold text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors border border-border/40"
                                      >
                                        <span className="opacity-60 font-bold">{a.type}:</span>
                                        <span className="truncate max-w-[120px]">{a.title}</span>
                                      </Link>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
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
                          <div className="flex flex-col gap-0.5">
                            <span className="text-sm line-through text-muted-foreground">
                              {r.title}
                            </span>
                            {r.attachments && r.attachments.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-0.5">
                                {r.attachments.map((a, i) => {
                                  const linkPath = a.type === 'note' ? '/notes' : a.type === 'project' ? `/projects/${a.id}` : a.type === 'person' ? `/people/${a.id}` : a.type === 'resource' ? '/resources' : '/media-watchlist';
                                  return (
                                    <Link
                                      key={i}
                                      href={linkPath}
                                      className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-muted/40 text-[10px] font-semibold text-muted-foreground/60 hover:bg-primary/5 hover:text-primary transition-colors border border-border/20 line-through"
                                    >
                                      <span className="opacity-40 font-bold">{a.type}:</span>
                                      <span className="truncate max-w-[120px]">{a.title}</span>
                                    </Link>
                                  );
                                })}
                              </div>
                            )}
                          </div>
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
