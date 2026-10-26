const fs = require('fs');
const { MongoClient } = require('mongodb');

// Load environment variables
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
if (!uri) {
  console.error('Error: MONGODB_URI environment variable not found in .env');
  process.exit(1);
}

const targetUserId = "69f4e8bdc404fa0372c3277e";

async function runCleanup() {
  console.log('Connecting to database...');
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();
    console.log('Connected successfully.');

    // Delete collections for other users
    const collectionsResult = await db.collection('collections').deleteMany({
      userId: { $ne: targetUserId }
    });
    console.log(`Deleted ${collectionsResult.deletedCount} collections for other users.`);

    // Delete categories for other users
    const categoriesResult = await db.collection('categories').deleteMany({
      userId: { $ne: targetUserId }
    });
    console.log(`Deleted ${categoriesResult.deletedCount} categories for other users.`);

    // Delete resources for other users
    const resourcesResult = await db.collection('resources').deleteMany({
      userId: { $ne: targetUserId }
    });
    console.log(`Deleted ${resourcesResult.deletedCount} resources for other users.`);

    console.log('Cleanup successfully completed!');
  } catch (error) {
    console.error('Error during cleanup:', error);
  } finally {
    await client.close();
  }
}

runCleanup();
