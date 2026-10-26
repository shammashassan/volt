import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";

/**
 * Wraps an API route handler to verify the signature of incoming webhooks from QStash.
 * In development, if QSTASH_CURRENT_SIGNING_KEY is not defined, verification is bypassed
 * to allow testing with mock requests.
 */
export function verifySchedulerRequest(
  handler: (req: Request) => Promise<Response> | Response
) {
  return async (req: Request) => {
    const currentKey = process.env.QSTASH_CURRENT_SIGNING_KEY || process.env.QSTASH_NEXT_SIGNING_KEY;
    const nextKey = process.env.QSTASH_NEXT_SIGNING_KEY || process.env.QSTASH_CURRENT_SIGNING_KEY;

    if (!currentKey) {
      if (process.env.NODE_ENV === "development") {
        console.warn("Skipping scheduler signature verification in development (signing keys missing).");
        return handler(req);
      } else {
        console.error("[Scheduler] QStash signing keys are missing in production environment.");
        return new Response(
          JSON.stringify({ success: false, error: "Scheduler signing keys missing" }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    // Ensure @upstash/qstash verifier can access signing keys in expected env vars
    if (!process.env.QSTASH_CURRENT_SIGNING_KEY && currentKey) {
      process.env.QSTASH_CURRENT_SIGNING_KEY = currentKey;
    }
    if (!process.env.QSTASH_NEXT_SIGNING_KEY && nextKey) {
      process.env.QSTASH_NEXT_SIGNING_KEY = nextKey;
    }

    const verifiedHandler = verifySignatureAppRouter(handler);
    return verifiedHandler(req);
  };
}
