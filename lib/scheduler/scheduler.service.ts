import { qstashClient } from "./client";

export class SchedulerService {
  private static getDestinationUrl(urlPath: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    return `${baseUrl.replace(/\/$/, "")}${urlPath}`;
  }

  private static isLocalUrl(url: string): boolean {
    return url.includes("//localhost") || url.includes("//127.0.0.1") || url.includes("//::1");
  }

  /**
   * Schedules a delayed single webhook call via QStash.
   * @param urlPath The relative path of the API endpoint (e.g. '/api/scheduler/reminders')
   * @param payload JSON-serializable body to send
   * @param executeAt Date/time when the webhook should fire
   * @returns The QStash message ID
   */
  public static async schedule(
    urlPath: string,
    payload: any,
    executeAt: Date
  ): Promise<string> {
    const destination = this.getDestinationUrl(urlPath);
    const notBefore = Math.floor(executeAt.getTime() / 1000);

    // If destination is local loopback (localhost/127.0.0.1), QStash cannot reach it.
    // We mock scheduling in development to let tests succeed without ngrok tunnels.
    if (process.env.NODE_ENV === "development" && this.isLocalUrl(destination)) {
      const mockMessageId = `mock_msg_${Math.random().toString(36).substring(2, 11)}`;
      console.warn(
        `[Scheduler] Local development URL detected (${destination}). QStash cannot reach local loopback addresses.\n` +
        `-> Mocking schedule execution. Mock Message ID: ${mockMessageId}\n` +
        `-> To test real callbacks locally, use a tunnel (e.g., ngrok) and set NEXT_PUBLIC_APP_URL to the tunnel URL.`
      );
      return mockMessageId;
    }

    const res = await qstashClient.publishJSON({
      url: destination,
      body: payload,
      notBefore,
      retries: 3,
    });

    return res.messageId;
  }

  /**
   * Cancels a scheduled message in QStash.
   * @param messageId QStash message ID to cancel
   */
  public static async cancel(messageId: string): Promise<boolean> {
    if (messageId.startsWith("mock_msg_")) {
      console.log(`[Scheduler] Mock message cancelled: ${messageId}`);
      return true;
    }

    try {
      await qstashClient.messages.delete(messageId);
      return true;
    } catch (err) {
      console.error(`Failed to cancel QStash message ${messageId}:`, err);
      return false;
    }
  }

  /**
   * Schedules multiple delayed webhooks in a single batch request to QStash.
   * @param jobs List of jobs containing path, payload, and execute time
   */
  public static async scheduleMany(
    jobs: { urlPath: string; payload: any; executeAt: Date }[]
  ): Promise<string[]> {
    if (jobs.length === 0) return [];

    const batch = jobs.map((job) => ({
      url: this.getDestinationUrl(job.urlPath),
      body: job.payload,
      notBefore: Math.floor(job.executeAt.getTime() / 1000),
      retries: 3,
    }));

    // Mocking batch if any URL is local
    const hasLocal = batch.some((job) => this.isLocalUrl(job.url));
    if (process.env.NODE_ENV === "development" && hasLocal) {
      console.warn(
        `[Scheduler] Local development URLs detected in batch. Mocking schedules.\n` +
        `-> To test real callbacks locally, use a tunnel (e.g., ngrok) and set NEXT_PUBLIC_APP_URL to the tunnel URL.`
      );
      return batch.map(() => `mock_msg_${Math.random().toString(36).substring(2, 11)}`);
    }

    const results = await qstashClient.batchJSON(batch);
    return results.map((r) => r.messageId);
  }
}
