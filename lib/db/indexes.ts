import { db } from "./client"

const globalWithMongo = global as typeof globalThis & {
  _dbInitialized?: boolean
  _dbInitializingPromise?: Promise<void>
}

export async function initDatabase() {
  if (globalWithMongo._dbInitialized) return
  if (globalWithMongo._dbInitializingPromise) {
    return globalWithMongo._dbInitializingPromise
  }

  globalWithMongo._dbInitializingPromise = (async () => {
    try {
      console.log("Initializing database indexes...")

      await Promise.allSettled([
        // Resources indexes
        db.collection("resources").createIndex({ userId: 1, createdAt: -1 }),
        db.collection("resources").createIndex({ userId: 1, favorite: 1 }),
        db.collection("resources").createIndex({ userId: 1, recentlyViewedAt: -1 }),
        db.collection("resources").createIndex({ userId: 1, useCount: -1, recentlyUsedAt: -1 }),
        db.collection("resources").createIndex({ userId: 1, order: 1, createdAt: -1 }),
        db.collection("resources").createIndex({ userId: 1, categoryId: 1 }),
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

        // Notes indexes
        db.collection("notes").createIndex({ userId: 1, pinned: -1, updatedAt: -1 }),
        db.collection("notes").createIndex({ userId: 1, relatedProjects: 1 }),
        db.collection("notes").createIndex({ userId: 1, relatedPeople: 1 }),
        db.collection("notes").createIndex({ title: "text", content: "text", tags: "text" }),

        // People indexes
        db.collection("people").createIndex({ userId: 1, name: 1 }),
        db.collection("people").createIndex({ name: "text", notes: "text", tags: "text" }),

        // Projects indexes
        db.collection("projects").createIndex({ userId: 1, updatedAt: -1 }),
        db.collection("projects").createIndex({ name: "text", description: "text" }),

        // Categories indexes
        db.collection("categories").createIndex({ userId: 1, name: 1 }),
        db.collection("categories").createIndex({ name: "text", description: "text" }),

        // Watchlist indexes
        db.collection("watchlist").createIndex({ userId: 1, source: 1, externalId: 1 }, { unique: true }),
        db.collection("watchlist").createIndex({ userId: 1, status: 1, type: 1 }),
        db.collection("watchlist").createIndex({ userId: 1, updatedAt: -1 }),

        // Notifications TTL indexes & lookup
        db.collection("notifications").createIndex({ deletedAt: 1 }, { expireAfterSeconds: 2592000 }),
        db.collection("notifications").createIndex({ readAt: 1 }, { expireAfterSeconds: 2592000 }),
        db.collection("notifications").createIndex({ userId: 1, createdAt: -1 }),

        // Reminders Partial TTL index (expires 30 days after updated/completed)
        db.collection("reminders").createIndex(
          { updatedAt: 1 },
          {
            expireAfterSeconds: 2592000,
            partialFilterExpression: { status: "completed" },
          }
        ),
        db.collection("reminders").createIndex({ userId: 1, dueAt: 1 }),

        // Auth collection indexes
        db.collection("user").createIndex({ email: 1 }, { unique: true }),
        db.collection("user").createIndex({ username: 1 }, { sparse: true }),
        db.collection("session").createIndex({ token: 1 }, { unique: true }),
        db.collection("session").createIndex({ userId: 1 }),
        db.collection("account").createIndex({ userId: 1 }),
        db.collection("account").createIndex({ providerId: 1, accountId: 1 }, { unique: true }),
      ])

      globalWithMongo._dbInitialized = true
      console.log("Database indexes initialization completed.")
    } catch (err) {
      console.error("Error ensuring database indexes:", err)
    } finally {
      globalWithMongo._dbInitializingPromise = undefined
    }
  })()

  return globalWithMongo._dbInitializingPromise
}
