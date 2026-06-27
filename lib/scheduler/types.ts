export interface ScheduleMetadata {
  provider: 'qstash' | 'none';
  messageId?: string;
  status: 'idle' | 'scheduling' | 'scheduled' | 'failed';
  scheduledFor?: string; // ISO String
  scheduledAt?: string;   // ISO String
  lastScheduledAt?: string; // ISO String
  lastTriggeredAt?: string; // ISO String
  error?: string;
}

export interface SchedulerPayload {
  id: string;
}

export interface SchedulerOptions {
  delay?: number;
  notBefore?: number;
  retries?: number;
}
