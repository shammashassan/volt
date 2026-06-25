import { getDb } from '@/lib/db';

export interface JobResult {
  itemsProcessed: number;
}

export interface Job {
  name: string;
  priority: number; // 1 = highest, running first
  run(): Promise<JobResult>;
}

export class JobRegistry {
  constructor(private jobs: Job[]) {}

  async runAll(): Promise<Record<string, { durationMs: number; itemsProcessed: number; success: boolean }>> {
    // Sort jobs by priority ascending
    const sorted = [...this.jobs].sort((a, b) => a.priority - b.priority);
    const results: Record<string, any> = {};

    const db = await getDb();
    const metricsCol = db.collection('job_metrics');

    for (const job of sorted) {
      const start = new Date();
      let success = true;
      let itemsProcessed = 0;
      let error: string | undefined;

      try {
        const res = await job.run();
        itemsProcessed = res.itemsProcessed;
      } catch (err: any) {
        success = false;
        error = err.message || String(err);
      }

      const finish = new Date();
      const durationMs = finish.getTime() - start.getTime();

      results[job.name] = { durationMs, itemsProcessed, success };

      // Write statistics to db
      try {
        await metricsCol.insertOne({
          jobName: job.name,
          startedAt: start,
          finishedAt: finish,
          durationMs,
          success,
          itemsProcessed,
          retryCount: 0,
          status: success ? 'success' : 'failed',
          version: '1.0.0',
          error,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      } catch (dbErr) {
        console.error(`Failed to write job metrics for ${job.name}:`, dbErr);
      }
    }

    return results;
  }
}
