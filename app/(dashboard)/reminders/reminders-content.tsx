"use client";

import { useState, useEffect, Fragment } from "react";
import { Reminder, ReminderPriority, ReminderStatus, ReminderAttachment } from "@/features/reminders/schemas/reminder";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
  ItemGroup,
  ItemSeparator,
} from "@/components/ui/item";
import { createReminderFromTextAction, updateReminderAction, deleteReminderAction } from "@/features/reminders/actions/reminders";
import { Plus, Trash2, Calendar, Clock, ChevronDown, ChevronUp, ArrowUp, ArrowDown, Minus, ArrowUpDown } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
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

const getPriorityIcon = (priority: ReminderPriority) => {
  switch (priority) {
    case "high":
      return (
        <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-destructive/10 text-destructive">
          <ArrowUp className="size-4" />
        </span>
      );
    case "medium":
      return (
        <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
          <Minus className="size-4" />
        </span>
      );
    case "low":
      return (
        <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
          <ArrowDown className="size-4" />
        </span>
      );
  }
};

export function RemindersContent({ initialReminders, notes, projects }: RemindersContentProps) {
  const [reminders, setReminders] = useState<Reminder[]>(initialReminders);
  const [checkingIds, setCheckingIds] = useState<Record<string, boolean>>({});
  const [uncheckingIds, setUncheckingIds] = useState<Record<string, boolean>>({});
  const [orderByPriority, setOrderByPriority] = useState(false);

  useEffect(() => {
    setReminders(initialReminders);
  }, [initialReminders]);

  const PRIORITY_ORDER: Record<ReminderPriority, number> = {
    high: 1,
    medium: 2,
    low: 3,
  };

  const getSortedPending = () => {
    const list = [...pending];
    if (orderByPriority) {
      return list.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
    }
    return list.sort((a, b) => new Date(a.triggerAt).getTime() - new Date(b.triggerAt).getTime());
  };

  const getSortedCompleted = () => {
    const list = [...completed];
    if (orderByPriority) {
      return list.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
    }
    return list.sort((a, b) => new Date(a.triggerAt).getTime() - new Date(b.triggerAt).getTime());
  };

  const [inputText, setInputText] = useState("");
  const [priority, setPriority] = useState<ReminderPriority>("medium");
  const [selectedNoteId, setSelectedNoteId] = useState<string>("");
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const selectedProject = projects.find((p) => p._id === selectedProjectId) || null;
  const selectedNote = notes.find((n) => n._id === selectedNoteId) || null;

  const pending = reminders.filter((r) => r.status === "pending");
  const completed = reminders.filter((r) => r.status === "completed");

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const attachments: ReminderAttachment[] = [];
    if (selectedNoteId) {
      attachments.push({ type: "note", id: selectedNoteId });
    }
    if (selectedProjectId) {
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
      setSelectedNoteId("");
      setSelectedProjectId("");
      toast.success("Reminder added");
    } else {
      toast.error("Failed to add reminder");
    }
  };

  const handleStatusChange = async (id: string, completedStatus: boolean) => {
    const nextStatus: ReminderStatus = completedStatus ? "completed" : "pending";
    const originalReminders = reminders;

    // Optimistically update local state immediately so checkbox checks and item fades out instantly
    setReminders((prev) => prev.map((r) => (r._id === id ? { ...r, status: nextStatus } : r)));

    const res = await updateReminderAction(id, { status: nextStatus });
    if (res.success && res.data) {
      toast.success(completedStatus ? "Reminder completed" : "Reminder pending");
    } else {
      // Revert if request fails
      setReminders(originalReminders);
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    const originalReminders = reminders;

    // Optimistically update local state immediately so item fades out instantly
    setReminders((prev) => prev.filter((r) => r._id !== id));

    const res = await deleteReminderAction(id);
    if (res.success) {
      toast.success("Reminder deleted");
    } else {
      // Revert if request fails
      setReminders(originalReminders);
      toast.error("Failed to delete reminder");
    }
  };

  const handleCheckActive = (id: string) => {
    setCheckingIds((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => {
      handleStatusChange(id, true);
      setCheckingIds((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    }, 400);
  };

  const handleCheckCompleted = (id: string) => {
    setUncheckingIds((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => {
      handleStatusChange(id, false);
      setUncheckingIds((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    }, 400);
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

      {/* Main Content */}
      <section className="px-4 lg:px-6">
        <div className="max-w-7xl grid gap-6 md:grid-cols-3">
          {/* List Column */}
          <div className="md:col-span-2 flex flex-col gap-4">
            {/* Quick Add */}
            <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen} className="w-full">
              <form onSubmit={handleQuickAdd} className="flex flex-col gap-3 bg-muted/20 p-3.5 rounded-xl border border-border/40">
                <div className="flex gap-2 items-center">
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
                  <CollapsibleTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="shrink-0"
                    >
                      {isAdvancedOpen ? <ChevronUp /> : <ChevronDown />}
                      <span className="sr-only">Toggle advanced options</span>
                    </Button>
                  </CollapsibleTrigger>
                </div>

                <CollapsibleContent className="space-y-3 pt-3 border-t border-border/40 mt-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs font-semibold text-muted-foreground lowercase">link project</Label>
                      <Combobox
                        items={projects}
                        value={selectedProject}
                        onValueChange={(val) => setSelectedProjectId(val?._id || "")}
                        itemToStringLabel={(proj) => proj?.name || proj?.title || ""}
                        isItemEqualToValue={(a, b) => a?._id === b?._id}
                      >
                        <ComboboxInput placeholder="Select Project" className="w-full" />
                        <ComboboxContent>
                          <ComboboxEmpty>No projects found.</ComboboxEmpty>
                          <ComboboxList>
                            {(project) => (
                              <ComboboxItem key={project._id} value={project}>
                                {project.name || project.title || "Untitled Project"}
                              </ComboboxItem>
                            )}
                          </ComboboxList>
                        </ComboboxContent>
                      </Combobox>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs font-semibold text-muted-foreground lowercase">link note</Label>
                      <Combobox
                        items={notes}
                        value={selectedNote}
                        onValueChange={(val) => setSelectedNoteId(val?._id || "")}
                        itemToStringLabel={(note) => note?.title || ""}
                        isItemEqualToValue={(a, b) => a?._id === b?._id}
                      >
                        <ComboboxInput placeholder="Select Note" className="w-full" />
                        <ComboboxContent>
                          <ComboboxEmpty>No notes found.</ComboboxEmpty>
                          <ComboboxList>
                            {(note) => (
                              <ComboboxItem key={note._id} value={note}>
                                {note.title}
                              </ComboboxItem>
                            )}
                          </ComboboxList>
                        </ComboboxContent>
                      </Combobox>
                    </div>
                  </div>
                </CollapsibleContent>
              </form>
            </Collapsible>

            <Card>
              <Tabs defaultValue="pending">
                <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3">
                  <CardTitle>Tasks</CardTitle>
                  <div className="flex items-center gap-4">
                    <Toggle
                      pressed={orderByPriority}
                      onPressedChange={setOrderByPriority}
                      variant="outline"
                      size="sm"
                      aria-label="Toggle sort by priority"
                    >
                      <ArrowUpDown />
                      Priority
                    </Toggle>
                    <TabsList>
                      <TabsTrigger value="pending">
                        Active
                        {pending.length > 0 && (
                          <Badge variant="outline">
                            {pending.length}
                          </Badge>
                        )}
                      </TabsTrigger>
                      <TabsTrigger value="completed">
                        Completed
                        {completed.length > 0 && (
                          <Badge variant="outline">
                            {completed.length}
                          </Badge>
                        )}
                      </TabsTrigger>
                    </TabsList>
                  </div>
                </CardHeader>
                <CardContent className="p-5 pt-0">
                  <TabsContent value="pending" className="mt-0">
                    {pending.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-8 text-center">
                        No tasks to do.
                      </p>
                    ) : (
                      <ScrollArea className="h-[500px] w-full">
                        <ItemGroup className="gap-2.5 pr-3.5 pb-4">
                          <AnimatePresence initial={false}>
                            {getSortedPending().map((r) => (
                              <motion.div
                                key={r._id as string}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -10, height: 0, marginTop: 0, marginBottom: 0, overflow: "hidden" }}
                                transition={{
                                  type: "spring",
                                  stiffness: 500,
                                  damping: 40,
                                  opacity: { duration: 0.15 },
                                  height: { duration: 0.2 }
                                }}
                              >
                                <Item variant="outline">
                                  <ItemMedia>
                                    <Checkbox
                                      checked={!!checkingIds[r._id as string] || r.status === "completed"}
                                      onCheckedChange={(checked) => {
                                        if (checked) {
                                          handleCheckActive(r._id as string);
                                        } else {
                                          handleStatusChange(r._id as string, false);
                                        }
                                      }}
                                    />
                                    {getPriorityIcon(r.priority)}
                                  </ItemMedia>
                                  <ItemContent>
                                    <ItemTitle className={cn("font-semibold transition-all duration-300", (checkingIds[r._id as string] || r.status === "completed") && "line-through text-muted-foreground/60")}>{r.title}</ItemTitle>
                                    <ItemDescription className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mt-0.5">
                                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Calendar className="size-3" />
                                        {new Date(r.triggerAt).toLocaleString([], {
                                          dateStyle: "short",
                                          timeStyle: "short",
                                        })}
                                      </span>
                                      {r.attachments && r.attachments.length > 0 && (
                                        <span className="flex flex-wrap gap-1.5">
                                          {r.attachments.map((a, i) => {
                                            const linkPath = a.type === 'note' ? `/notes?id=${a.id}` : a.type === 'project' ? `/projects/${a.id}` : a.type === 'person' ? `/people/${a.id}` : a.type === 'resource' ? '/resources' : '/media-watchlist';
                                            return (
                                              <Link
                                                key={i}
                                                href={linkPath}
                                                className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-muted text-[10px] font-semibold text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors border border-border/40 line-clamp-1"
                                              >
                                                <span className="opacity-60 font-bold">{a.type}:</span>
                                                <span className="truncate max-w-[120px]">{a.title}</span>
                                              </Link>
                                            );
                                          })}
                                        </span>
                                      )}
                                    </ItemDescription>
                                  </ItemContent>
                                  <ItemActions>
                                    <Button
                                      onClick={() => handleDelete(r._id as string)}
                                      variant="ghost"
                                      size="icon"
                                    >
                                      <Trash2 />
                                    </Button>
                                  </ItemActions>
                                </Item>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </ItemGroup>
                      </ScrollArea>
                    )}
                  </TabsContent>

                  <TabsContent value="completed" className="mt-0">
                    {completed.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-8 text-center">
                        No completed tasks.
                      </p>
                    ) : (
                      <ScrollArea className="h-[500px] w-full">
                        <ItemGroup className="gap-2.5 opacity-80 pr-3.5 pb-4">
                          <AnimatePresence initial={false}>
                            {getSortedCompleted().map((r) => (
                              <motion.div
                                key={r._id as string}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -10, height: 0, marginTop: 0, marginBottom: 0, overflow: "hidden" }}
                                transition={{
                                  type: "spring",
                                  stiffness: 500,
                                  damping: 40,
                                  opacity: { duration: 0.15 },
                                  height: { duration: 0.2 }
                                }}
                              >
                                <Item variant="outline">
                                  <ItemMedia>
                                    <Checkbox
                                      checked={!uncheckingIds[r._id as string] && r.status === "completed"}
                                      onCheckedChange={(checked) => {
                                        if (!checked) {
                                          handleCheckCompleted(r._id as string);
                                        } else {
                                          handleStatusChange(r._id as string, true);
                                        }
                                      }}
                                    />
                                    {getPriorityIcon(r.priority)}
                                  </ItemMedia>
                                  <ItemContent>
                                    <ItemTitle className={cn("transition-all duration-300", (uncheckingIds[r._id as string] || r.status === "pending") ? "font-semibold text-foreground" : "line-through text-muted-foreground")}>{r.title}</ItemTitle>
                                    <ItemDescription className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mt-0.5">
                                      <span className="text-xs text-muted-foreground/50 flex items-center gap-1 line-through">
                                        <Calendar className="size-3" />
                                        {new Date(r.triggerAt).toLocaleString([], {
                                          dateStyle: "short",
                                          timeStyle: "short",
                                        })}
                                      </span>
                                      {r.attachments && r.attachments.length > 0 && (
                                        <span className="flex flex-wrap gap-1.5 mt-0.5">
                                          {r.attachments.map((a, i) => {
                                            const linkPath = a.type === 'note' ? `/notes?id=${a.id}` : a.type === 'project' ? `/projects/${a.id}` : a.type === 'person' ? `/people/${a.id}` : a.type === 'resource' ? '/resources' : '/media-watchlist';
                                            return (
                                              <Link
                                                key={i}
                                                href={linkPath}
                                                className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-muted/40 text-[10px] font-semibold text-muted-foreground/60 hover:bg-primary/5 hover:text-primary transition-colors border border-border/20 line-through line-clamp-1"
                                              >
                                                <span className="opacity-40 font-bold">{a.type}:</span>
                                                <span className="truncate max-w-[120px]">{a.title}</span>
                                              </Link>
                                            );
                                          })}
                                        </span>
                                      )}
                                    </ItemDescription>
                                  </ItemContent>
                                  <ItemActions>
                                    <Button
                                      onClick={() => handleDelete(r._id as string)}
                                      variant="ghost"
                                      size="icon"
                                    >
                                      <Trash2 />
                                    </Button>
                                  </ItemActions>
                                </Item>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </ItemGroup>
                      </ScrollArea>
                    )}
                  </TabsContent>
                </CardContent>
              </Tabs>
            </Card>
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
