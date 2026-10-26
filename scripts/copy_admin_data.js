const fs = require('fs');
const { MongoClient, ObjectId } = require('mongodb');

function loadEnv() {
  try {
    const envFile = fs.readFileSync('.env', 'utf-8');
    for (const line of envFile.split('\n')) {
      const parts = line.trim().split('=');
      if (parts.length >= 2 && !parts[0].startsWith('#')) {
        const key = parts[0].trim();
        let val = parts.slice(1).join('=').trim();
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
        process.env[key] = val;
      }
    }
  } catch (e) {
    console.error("Failed to load .env");
  }
}

loadEnv();
const uri = process.env.MONGODB_URI;

async function main() {
  const isDryRun = process.argv.includes('--dry-run');
  console.log(`=== DATA COPY UTILITY: admin@gmail.com -> shammashassan.kt@gmail.com ===`);
  console.log(`Mode: ${isDryRun ? 'DRY RUN (no database changes)' : 'LIVE EXECUTION'}\n`);

  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 20000 });
  try {
    await client.connect();
    const db = client.db();

    // 1. Fetch source (admin) and target users
    const adminUser = await db.collection("user").findOne({ email: "admin@gmail.com" });
    const targetUser = await db.collection("user").findOne({ email: "shammashassan.kt@gmail.com" });

    if (!adminUser) {
      throw new Error("Source user admin@gmail.com not found!");
    }
    if (!targetUser) {
      throw new Error("Target user shammashassan.kt@gmail.com not found!");
    }

    const adminId = adminUser._id.toString();
    const targetId = targetUser._id.toString();

    console.log(`Source user: ${adminUser.name} (${adminUser.email}) [ID: ${adminId}]`);
    console.log(`Target user: ${targetUser.name} (${targetUser.email}) [ID: ${targetId}]\n`);

    // ID mapping dictionaries
    const collectionMap = {};
    const categoryMap = {};
    const projectMap = {};
    const personMap = {};
    const resourceMap = {};
    const noteMap = {};
    const reminderMap = {};
    const watchlistMap = {};

    // 2. Fetch all admin data
    console.log("Reading data for admin@gmail.com...");
    const adminCollections = await db.collection("collections").find({ userId: adminId }).toArray();
    const adminCategories = await db.collection("categories").find({ userId: adminId }).toArray();
    const adminProjects = await db.collection("projects").find({ userId: adminId }).toArray();
    const adminPeople = await db.collection("people").find({ userId: adminId }).toArray();
    const adminResources = await db.collection("resources").find({ userId: adminId }).toArray();
    const adminNotes = await db.collection("notes").find({ userId: adminId }).toArray();
    const adminReminders = await db.collection("reminders").find({ userId: adminId }).toArray();
    const adminWatchlist = await db.collection("watchlist").find({ userId: adminId }).toArray();
    const adminNotifications = await db.collection("notifications").find({ userId: adminId }).toArray();
    const adminSearchIndex = await db.collection("search_index").find({ userId: adminId }).toArray();

    console.log(`Found:`);
    console.log(`- collections: ${adminCollections.length}`);
    console.log(`- categories: ${adminCategories.length}`);
    console.log(`- projects: ${adminProjects.length}`);
    console.log(`- people: ${adminPeople.length}`);
    console.log(`- resources: ${adminResources.length}`);
    console.log(`- notes: ${adminNotes.length}`);
    console.log(`- reminders: ${adminReminders.length}`);
    console.log(`- watchlist: ${adminWatchlist.length}`);
    console.log(`- notifications: ${adminNotifications.length}`);
    console.log(`- search_index: ${adminSearchIndex.length}`);

    // 3. Prepare Collections
    const newCollections = adminCollections.map(doc => {
      const newId = new ObjectId();
      collectionMap[doc._id.toString()] = newId.toString();
      const clone = { ...doc, _id: newId, userId: targetId };
      return clone;
    });

    // 4. Prepare Categories
    const newCategories = adminCategories.map(doc => {
      const newId = new ObjectId();
      categoryMap[doc._id.toString()] = newId.toString();
      const clone = { ...doc, _id: newId, userId: targetId };
      if (doc.collectionId && collectionMap[doc.collectionId]) {
        clone.collectionId = collectionMap[doc.collectionId];
      }
      return clone;
    });

    // 5. Prepare Projects
    const newProjects = adminProjects.map(doc => {
      const newId = new ObjectId();
      projectMap[doc._id.toString()] = newId.toString();
      const clone = { ...doc, _id: newId, userId: targetId };
      return clone;
    });

    // 6. Prepare People
    const newPeople = adminPeople.map(doc => {
      const newId = new ObjectId();
      personMap[doc._id.toString()] = newId.toString();
      const clone = { ...doc, _id: newId, userId: targetId };
      return clone;
    });

    // 7. Prepare Resources
    const newResources = adminResources.map(doc => {
      const newId = new ObjectId();
      resourceMap[doc._id.toString()] = newId.toString();
      const clone = { ...doc, _id: newId, userId: targetId };
      
      // Remap categoryId if it was an ObjectId
      if (doc.categoryId && categoryMap[doc.categoryId]) {
        clone.categoryId = categoryMap[doc.categoryId];
      }
      // Remap projectIds
      if (Array.isArray(doc.projectIds)) {
        clone.projectIds = doc.projectIds.map(pid => projectMap[pid] || pid);
      }
      // Remap personIds
      if (Array.isArray(doc.personIds)) {
        clone.personIds = doc.personIds.map(pid => personMap[pid] || pid);
      }
      return clone;
    });

    // 8. Prepare Notes
    const newNotes = adminNotes.map(doc => {
      const newId = new ObjectId();
      noteMap[doc._id.toString()] = newId.toString();
      const clone = { ...doc, _id: newId, userId: targetId };
      
      if (Array.isArray(doc.relatedResources)) {
        clone.relatedResources = doc.relatedResources.map(rid => resourceMap[rid] || rid);
      }
      if (Array.isArray(doc.relatedProjects)) {
        clone.relatedProjects = doc.relatedProjects.map(pid => projectMap[pid] || pid);
      }
      if (Array.isArray(doc.relatedPeople)) {
        clone.relatedPeople = doc.relatedPeople.map(pid => personMap[pid] || pid);
      }
      return clone;
    });

    // 9. Prepare Reminders
    const newReminders = adminReminders.map(doc => {
      const newId = new ObjectId();
      reminderMap[doc._id.toString()] = newId.toString();
      const clone = { ...doc, _id: newId, userId: targetId };
      return clone;
    });

    // 10. Prepare Watchlist
    const newWatchlist = adminWatchlist.map(doc => {
      const newId = new ObjectId();
      watchlistMap[doc._id.toString()] = newId.toString();
      const clone = { ...doc, _id: newId, userId: targetId };
      return clone;
    });

    // 11. Prepare Notifications
    const newNotifications = adminNotifications.map(doc => {
      const newId = new ObjectId();
      const clone = { ...doc, _id: newId, userId: targetId };
      return clone;
    });

    // 12. Prepare Search Index
    const entityMap = {
      ...resourceMap,
      ...noteMap,
      ...projectMap,
      ...personMap,
      ...reminderMap,
      ...watchlistMap
    };

    const newSearchIndex = adminSearchIndex.map(doc => {
      const newId = new ObjectId();
      const mappedEntityId = entityMap[doc.entityId] || doc.entityId;
      const clone = {
        ...doc,
        _id: newId,
        userId: targetId,
        entityId: mappedEntityId
      };
      return clone;
    });

    console.log(`\nPrepared all mapped documents successfully.`);
    console.log(`Sample mapped projectIds on resource:`, newResources.find(r => r.projectIds && r.projectIds.length > 0)?.projectIds);

    if (isDryRun) {
      console.log("\n[DRY RUN] No writes performed. Exiting.");
      return;
    }

    // 13. Perform Database Writes
    console.log("\nStarting database insertions...");

    if (newCollections.length > 0) {
      const res = await db.collection("collections").insertMany(newCollections);
      console.log(`✓ Inserted ${res.insertedCount} collections`);
    }

    if (newCategories.length > 0) {
      const res = await db.collection("categories").insertMany(newCategories);
      console.log(`✓ Inserted ${res.insertedCount} categories`);
    }

    if (newProjects.length > 0) {
      const res = await db.collection("projects").insertMany(newProjects);
      console.log(`✓ Inserted ${res.insertedCount} projects`);
    }

    if (newPeople.length > 0) {
      const res = await db.collection("people").insertMany(newPeople);
      console.log(`✓ Inserted ${res.insertedCount} people`);
    }

    if (newResources.length > 0) {
      const res = await db.collection("resources").insertMany(newResources);
      console.log(`✓ Inserted ${res.insertedCount} resources`);
    }

    if (newNotes.length > 0) {
      const res = await db.collection("notes").insertMany(newNotes);
      console.log(`✓ Inserted ${res.insertedCount} notes`);
    }

    if (newReminders.length > 0) {
      const res = await db.collection("reminders").insertMany(newReminders);
      console.log(`✓ Inserted ${res.insertedCount} reminders`);
    }

    if (newWatchlist.length > 0) {
      const res = await db.collection("watchlist").insertMany(newWatchlist);
      console.log(`✓ Inserted ${res.insertedCount} watchlist items`);
    }

    if (newNotifications.length > 0) {
      const res = await db.collection("notifications").insertMany(newNotifications);
      console.log(`✓ Inserted ${res.insertedCount} notifications`);
    }

    if (newSearchIndex.length > 0) {
      const res = await db.collection("search_index").insertMany(newSearchIndex);
      console.log(`✓ Inserted ${res.insertedCount} search_index entries`);
    }

    // 14. Update target user role to admin
    await db.collection("user").updateOne(
      { _id: targetUser._id },
      { $set: { role: "admin", updatedAt: new Date() } }
    );
    console.log(`✓ Updated target user (${targetUser.email}) role to 'admin'`);

    console.log("\nAll data copied successfully! 🎉");

  } finally {
    await client.close();
  }
}

main().catch(err => {
  console.error("Migration failed:", err);
  process.exit(1);
});
