"use client";

import { useState } from 'react';
import { Reminder, ReminderPriority, ReminderStatus } from '@/features/reminders/schemas/reminder';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createReminderFromTextAction, updateReminderAction, deleteReminderAction } from '@/features/reminders/actions/reminders';
import { Plus, Trash2, Calendar, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface RemindersContentProps {
  initialReminders: Reminder[];
}

export function RemindersContent({ initialReminders }: RemindersContentProps) {
  const [reminders, setReminders] = useState<Reminder[]>(initialReminders);
  const [inputText, setInputText] = useState('');
  const [priority, setPriority] = useState<ReminderPriority>('medium');

  const pending = reminders.filter(r => r.status === 'pending');
  const completed = reminders.filter(r => r.status === 'completed');

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const res = await createReminderFromTextAction(inputText, priority);
    if (res.success && res.data) {
      setReminders(prev => [res.data!, ...prev].sort((a, b) => a.status.localeCompare(b.status)));
      setInputText('');
      toast.success('Reminder added');
    } else {
      toast.error('Failed to add reminder');
    }
  };

  const handleStatusChange = async (id: string, completedStatus: boolean) => {
    const nextStatus: ReminderStatus = completedStatus ? 'completed' : 'pending';
    const res = await updateReminderAction(id, { status: nextStatus });
    if (res.success && res.data) {
      setReminders(prev => prev.map(r => r._id === id ? res.data! : r));
      toast.success(completedStatus ? 'Reminder completed' : 'Reminder pending');
    } else {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id: string) => {
    const res = await deleteReminderAction(id);
    if (res.success) {
      setReminders(prev => prev.filter(r => r._id !== id));
      toast.success('Reminder deleted');
    } else {
      toast.error('Failed to delete reminder');
    }
  };

  const getPriorityColor = (p: ReminderPriority) => {
    switch (p) {
      case 'high': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'medium': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      default: return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
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
    <div className="grid gap-6 md:grid-cols-3">
      {/* List Column */}
      <div className="md:col-span-2 space-y-4">
        {/* Quick Add Capture */}
        <form onSubmit={handleQuickAdd} className="flex gap-2">
          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder='Add a reminder (e.g. "Meeting tomorrow at 3pm")'
            className="flex-1"
          />
          <Select value={priority} onValueChange={(v) => setPriority(v as ReminderPriority)}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
          <Button type="submit">
            <Plus className="size-4 mr-2" />
            Add
          </Button>
        </form>

        {/* Pending checklist */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tasks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {pending.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No tasks to do.</p>
            ) : (
              pending.map(r => (
                <div key={r._id as string} className="flex items-center justify-between border-b pb-2 gap-3">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={false}
                      onCheckedChange={(checked) => handleStatusChange(r._id as string, !!checked)}
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{r.title}</span>
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Clock className="size-3" />
                        {new Date(r.triggerAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={getPriorityColor(r.priority)}>
                      {r.priority}
                    </Badge>
                    <Button onClick={() => handleDelete(r._id as string)} variant="ghost" size="icon" className="size-8 text-destructive">
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
          <Card className="opacity-70">
            <CardHeader>
              <CardTitle className="text-lg">Completed</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {completed.map(r => (
                <div key={r._id as string} className="flex items-center justify-between border-b pb-2 gap-3">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={true}
                      onCheckedChange={(checked) => handleStatusChange(r._id as string, !!checked)}
                    />
                    <span className="text-sm line-through text-muted-foreground">{r.title}</span>
                  </div>
                  <Button onClick={() => handleDelete(r._id as string)} variant="ghost" size="icon" className="size-8 text-destructive">
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
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="size-5 text-primary" />
              Today's Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            {timelineItems.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No activities scheduled for today.</p>
            ) : (
              <div className="relative border-l pl-4 ml-2 space-y-4">
                {timelineItems.map((r, idx) => (
                  <div key={r._id as string} className="relative">
                    {/* Circle Node */}
                    <div className={`absolute -left-[21px] mt-1 size-3 rounded-full border bg-background ${r.status === 'completed' ? 'border-emerald-500 bg-emerald-500' : 'border-primary'}`}></div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-semibold text-muted-foreground">
                        {new Date(r.triggerAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className={`text-xs font-medium mt-0.5 ${r.status === 'completed' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                        {r.title}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
