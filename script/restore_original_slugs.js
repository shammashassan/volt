const fs = require('fs');
const { MongoClient } = require('mongodb');

function loadEnv() {
  try {
    const envFile = fs.readFileSync('.env', 'utf-8');
    for (const line of envFile.split('\n')) {
      const parts = line.trim().split('=');
      if (parts.length >= 2 && !parts[0].startsWith('#')) {
        process.env[parts[0].trim()] = parts.slice(1).join('=').trim().replace(/^"|"$/g, '');
      }
    }
  } catch (e) {}
}

loadEnv();
const uri = process.env.MONGODB_URI;

const mappings = [
  { name: "Visual Generators", originalSlug: "customize" },
  { name: "Maps & Geospatial", originalSlug: "maps" },
  { name: "Backgrounds & Textures", originalSlug: "backgrounds" }
];

async function run() {
  console.log('Connecting to database...');
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();
    
    console.log('Connected successfully. Restoring original slugs...');

    for (const mapping of mappings) {
      const category = await db.collection("categories").findOne({ name: mapping.name });
      if (category) {
        console.log(`Found category "${mapping.name}". Current slug is "${category.slug}". Restoring to "${mapping.originalSlug}"...`);
        await db.collection("categories").updateOne(
          { _id: category._id },
          { $set: { slug: mapping.originalSlug, updatedAt: new Date() } }
        );
        console.log(`Successfully updated "${mapping.name}" slug to "${mapping.originalSlug}".`);
      } else {
        console.log(`Category "${mapping.name}" not found in database.`);
      }
    }

    console.log('\nSlug restoration complete.');
  } finally {
    await client.close();
  }
}
run();
