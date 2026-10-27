// Standalone script to initialize and verify all MongoDB indexes
const { MongoClient } = require("mongodb");
const fs = require("fs");
const path = require("path");

// Load .env if present
const envPath = path.resolve(__dirname, "../.env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const [key, ...rest] = trimmed.split("=");
    if (key && rest.length > 0) {
      const val = rest.join("=").replace(/^["']|["']$/g, "");
      if (!process.env[key.trim()]) {
        process.env[key.trim()] = val;
      }
    }
  }
}

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("Missing MONGODB_URI in environment.");
  process.exit(1);
}

async function run() {
  console.log("Connecting to MongoDB...");
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();
    console.log("Connected. Creating indexes...");

    const results = await Promise.allSettled([
      // Resources indexes (ESR compliant)
      db.collection("resources").createIndex({ userId: 1, createdAt: -1 }),
      db.collection("resources").createIndex({ userId: 1, favorite: 1, order: 1, createdAt: -1 }),
      db.collection("resources").createIndex({ userId: 1, recentlyViewedAt: -1 }),
      db.collection("resources").createIndex({ userId: 1, useCount: -1, recentlyUsedAt: -1 }),
      db.collection("resources").createIndex({ userId: 1, order: 1, createdAt: -1 }),
      db.collection("resources").createIndex({ userId: 1, categoryId: 1, order: 1, createdAt: -1 }),
      db.collection("resources").createIndex({ userId: 1, category: 1 }),
      db.collection("resources").createIndex({ userId: 1, projectIds: 1 }),
      db.collection("resources").createIndex({ userId: 1, personIds: 1 }),
      db.collection("resources").createIndex({
        title: "text",
        url: "text",
        tags: "text",
        description: "text",
        whySaved: "text",
        notes: "text",
      }),

      // Search index
      db.collection("search_index").createIndex({ title: "text", description: "text" }),
      db.collection("search_index").createIndex({ userId: 1, entityId: 1 }),

      // Notes
      db.collection("notes").createIndex({ userId: 1, pinned: -1, updatedAt: -1 }),
      db.collection("notes").createIndex({ userId: 1, relatedProjects: 1 }),
      db.collection("notes").createIndex({ userId: 1, relatedPeople: 1 }),
      db.collection("notes").createIndex({ title: "text", content: "text", tags: "text" }),

      // People
      db.collection("people").createIndex({ userId: 1, name: 1 }),
      db.collection("people").createIndex({ name: "text", notes: "text", tags: "text" }),

      // Projects
      db.collection("projects").createIndex({ userId: 1, updatedAt: -1 }),
      db.collection("projects").createIndex({ name: "text", description: "text" }),

      // Categories
      db.collection("categories").createIndex({ userId: 1, name: 1 }),
      db.collection("categories").createIndex({ name: "text", description: "text" }),

      // Watchlist
      db.collection("watchlist").createIndex({ userId: 1, source: 1, externalId: 1 }, { unique: true }),
      db.collection("watchlist").createIndex({ userId: 1, status: 1, type: 1 }),
      db.collection("watchlist").createIndex({ userId: 1, updatedAt: -1 }),

      // Notifications
      db.collection("notifications").createIndex({ deletedAt: 1 }, { expireAfterSeconds: 2592000 }),
      db.collection("notifications").createIndex({ readAt: 1 }, { expireAfterSeconds: 2592000 }),
      db.collection("notifications").createIndex({ userId: 1, createdAt: -1 }),

      // Reminders
      db.collection("reminders").createIndex(
        { updatedAt: 1 },
        {
          expireAfterSeconds: 2592000,
          partialFilterExpression: { status: "completed" },
        }
      ),
      db.collection("reminders").createIndex({ userId: 1, dueAt: 1 }),

      // Auth
      db.collection("user").createIndex({ email: 1 }, { unique: true }),
      db.collection("user").createIndex({ username: 1 }, { sparse: true }),
      db.collection("session").createIndex({ token: 1 }, { unique: true }),
      db.collection("session").createIndex({ userId: 1 }),
      db.collection("account").createIndex({ userId: 1 }),
      db.collection("account").createIndex({ providerId: 1, accountId: 1 }, { unique: true }),
    ]);

    const failures = results.filter((r) => r.status === "rejected");
    if (failures.length > 0) {
      console.warn(`${failures.length} indexes failed to create:`, failures);
    } else {
      console.log("All indexes verified and created successfully.");
    }
  } catch (err) {
    console.error("Index creation failed:", err);
  } finally {
    await client.close();
  }
}

run();
