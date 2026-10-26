const { MongoClient } = require('mongodb');
const fs = require('fs');

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
    console.log('No .env file found, using process.env');
  }
}

loadEnv();
const uri = process.env.MONGODB_URI;
const targetUserId = "69f4e8bdc404fa0372c3277e";

async function run() {
  if (!uri) {
    console.error('Error: MONGODB_URI not found.');
    process.exit(1);
  }

  console.log('Connecting to database...');
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('volt');
    console.log('Connected successfully.');

    // 1. Verify source and target categories exist for this user
    const sourceCat = await db.collection("categories").findOne({ userId: targetUserId, slug: "components" });
    const targetCat = await db.collection("categories").findOne({ userId: targetUserId, slug: "general-components" });

    if (!sourceCat) {
      console.error('Error: Source category "components" not found for target user.');
      process.exit(1);
    }
    if (!targetCat) {
      console.error('Error: Target category "general-components" not found for target user.');
      process.exit(1);
    }

    console.log(`Source Category: ${sourceCat.name} (slug: ${sourceCat.slug})`);
    console.log(`Target Category: ${targetCat.name} (slug: ${targetCat.slug})`);

    // 2. Fetch resources to be updated to show progress details
    const resourcesToUpdate = await db.collection("resources").find({
      userId: targetUserId,
      categoryId: "components"
    }).toArray();

    console.log(`Found ${resourcesToUpdate.length} resources in "components" category.`);

    if (resourcesToUpdate.length === 0) {
      console.log('No resources need migration.');
      return;
    }

    console.log('Resources to migrate:');
    resourcesToUpdate.forEach(r => {
      console.log(` - ${r.title} (ID: ${r._id.toString()})`);
    });

    // 3. Perform update
    console.log('\nMigrating resources to "general-components"...');
    const result = await db.collection("resources").updateMany(
      { userId: targetUserId, categoryId: "components" },
      { $set: { categoryId: "general-components", updatedAt: new Date() } }
    );

    console.log(`Successfully migrated ${result.modifiedCount} resources.`);

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await client.close();
  }
}

run();
