const fs = require('fs');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');

// Load environment variables from .env
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
  } catch { /* no .env file, use existing environment variables */ }
}

loadEnv();
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/volt';
console.log('Connecting to MongoDB:', uri.replace(/:([^:@]{4,})@/, ':****@')); // Hide password in logs

async function main() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log('Connected successfully to database.');
    const db = client.db();

    const searchIndexCol = db.collection('search_index');

    // 1. Clear existing search index entries
    console.log('\nClearing search index...');
    const deleteResult = await searchIndexCol.deleteMany({});
    console.log(`Cleared ${deleteResult.deletedCount} existing search index entries.`);

    const now = new Date();
    const searchEntries = [];

    // Helper to query and map documents to search index entries
    async function collectEntries(collectionName, entityType, mapper) {
      const docs = await db.collection(collectionName).find({ deletedAt: { $exists: false } }).toArray();
      console.log(`Fetched ${docs.length} active documents from "${collectionName}"...`);
      for (const doc of docs) {
        const mapped = mapper(doc);
        if (mapped && doc.userId && mapped.title) {
          searchEntries.push({
            userId: doc.userId,
            entityId: doc._id.toString(),
            entityType: entityType,
            title: mapped.title,
            description: mapped.description || '',
            searchVersion: 1,
            createdAt: doc.createdAt || now,
            updatedAt: doc.updatedAt || now
          });
        }
      }
    }

    // 2. Collect from all collections
    await collectEntries('resources', 'resource', (doc) => ({
      title: doc.title || doc.name,
      description: doc.description || doc.notes
    }));

    await collectEntries('notes', 'note', (doc) => ({
      title: doc.title,
      description: doc.content
    }));

    await collectEntries('projects', 'project', (doc) => ({
      title: doc.name,
      description: doc.description
    }));

    await collectEntries('people', 'person', (doc) => ({
      title: doc.name,
      description: doc.notes
    }));

    await collectEntries('reminders', 'reminder', (doc) => ({
      title: doc.title,
      description: doc.description
    }));

    // 3. Write entries back to search_index
    if (searchEntries.length > 0) {
      console.log(`\nInserting ${searchEntries.length} new entries into "search_index"...`);
      const insertResult = await searchIndexCol.insertMany(searchEntries);
      console.log(`Successfully inserted ${insertResult.insertedCount} search index entries.`);

      // Ensure text index exists
      console.log('Ensuring text indexes exist on title and description...');
      await searchIndexCol.createIndex({ title: 'text', description: 'text' });
      console.log('Text indexes created/verified.');
    } else {
      console.log('\nNo active documents found to index.');
    }

    console.log('\nSearch index rebuild complete! ✅');
  } catch (error) {
    console.error('Rebuilding search index failed:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

main();
