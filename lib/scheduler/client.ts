import { Client } from "@upstash/qstash";

if (!process.env.QSTASH_TOKEN) {
  console.warn("Warning: QSTASH_TOKEN is not defined in environment variables.");
}

export const qstashClient = new Client({
  token: process.env.QSTASH_TOKEN || "mock-token",
  baseUrl: process.env.QSTASH_URL,
});
