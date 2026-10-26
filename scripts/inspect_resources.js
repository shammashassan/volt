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

async function run() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();
    const resources = await db.collection("resources").find({ userId: "69f4e8bdc404fa0372c3277e" }).toArray();
    console.log("RESOURCES:");
    resources.forEach(r => {
      console.log(`Title: ${r.title}, CategoryId: ${r.categoryId}`);
    });

    const categories = await db.collection("categories").find({ userId: "69f4e8bdc404fa0372c3277e" }).toArray();
    console.log("\nCATEGORIES:");
    categories.forEach(c => {
      console.log(`Name: ${c.name}, Slug: ${c.slug}, ID: ${c._id.toString()}`);
    });
  } finally {
    await client.close();
  }
}

run();
