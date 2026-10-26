const fs = require('fs');
const { MongoClient } = require('mongodb');

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
  console.log('Connecting to database...');
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();
    console.log('Connected successfully. Fetching categories...');

    const categories = await db.collection("categories").find({ userId: targetUserId }).toArray();
    const idToSlugMap = {};
    categories.forEach(c => {
      idToSlugMap[c._id.toString()] = c.slug;
    });

    console.log("ID to Slug Map:", idToSlugMap);

    console.log('Fetching resources...');
    const resources = await db.collection("resources").find({ userId: targetUserId }).toArray();
    console.log(`Found ${resources.length} resources. Checking categoryId values...`);

    let updateCount = 0;
    for (const r of resources) {
      const currentCatId = r.categoryId;
      if (currentCatId && idToSlugMap[currentCatId]) {
        const targetSlug = idToSlugMap[currentCatId];
        console.log(`Resource "${r.title}" has categoryId "${currentCatId}". Updating to slug "${targetSlug}"...`);
        await db.collection("resources").updateOne(
          { _id: r._id },
          { $set: { categoryId: targetSlug, updatedAt: new Date() } }
        );
        updateCount++;
      }
    }

    console.log(`Updated ${updateCount} resources successfully.`);
  } catch (error) {
    console.error('Error during update:', error);
  } finally {
    await client.close();
  }
}

run();
