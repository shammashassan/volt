const fs = require('fs');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');

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

const seedCollectionsPath = path.join(__dirname, 'seed', 'collections.json');
const seedCategoriesPath = path.join(__dirname, 'seed', 'categories.json');

const seedCollections = JSON.parse(fs.readFileSync(seedCollectionsPath, 'utf-8'));
const seedCategories = JSON.parse(fs.readFileSync(seedCategoriesPath, 'utf-8'));

async function runMigration() {
  console.log('Connecting to database...');
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();
    console.log('Connected successfully. Fetching users...');

    const users = await db.collection('user').find({}).toArray();
    console.log(`Found ${users.length} users to migrate.`);

    for (const user of users) {
      const userId = user._id.toString();
      console.log(`\n=========================================`);
      console.log(`Migrating for User: ${user.email} (${userId})`);
      console.log(`=========================================`);

      // 1. Migrate Collections
      console.log('\n--- Migrating Collections ---');
      for (const coll of seedCollections) {
        const query = { userId, slug: coll.slug };
        const existing = await db.collection('collections').findOne(query);

        if (existing) {
          console.log(`  Updating collection: ${coll.slug}`);
          await db.collection('collections').updateOne(
            { _id: existing._id },
            {
              $set: {
                name: coll.name,
                description: coll.description,
                icon: coll.icon,
                order: coll.order,
                updatedAt: new Date()
              }
            }
          );
        } else {
          console.log(`  Inserting collection: ${coll.slug}`);
          await db.collection('collections').insertOne({
            _id: new ObjectId(),
            slug: coll.slug,
            name: coll.name,
            description: coll.description,
            icon: coll.icon,
            order: coll.order,
            userId,
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
      }

      // 2. Migrate Categories
      console.log('\n--- Migrating Categories ---');
      // Retrieve all existing categories for this user to inspect the old data
      const oldCategories = await db.collection('categories').find({ userId }).toArray();
      const oldToNewSlug = {};

      for (const cat of seedCategories) {
        // Find matching old category by slug/id
        const matchedOld = oldCategories.find(c => (c.id || c.slug) === cat.slug);

        const query = { userId, slug: cat.slug };
        const updateData = {
          slug: cat.slug,
          name: cat.name,
          title: cat.name, // Keep for backward compatibility if needed, but we will mostly clean
          description: cat.description || (matchedOld && matchedOld.description) || '',
          icon: cat.icon,
          order: cat.order,
          collectionId: cat.collectionId,
          userId,
          updatedAt: new Date()
        };

        if (matchedOld) {
          console.log(`  Updating category: ${cat.slug}`);
          await db.collection('categories').updateOne(
            { _id: matchedOld._id },
            {
              $set: updateData,
              $unset: { collection: "", id: "" } // Remove legacy fields
            }
          );
          oldToNewSlug[matchedOld.id || matchedOld.slug] = cat.slug;
        } else {
          console.log(`  Inserting category: ${cat.slug}`);
          await db.collection('categories').insertOne({
            _id: new ObjectId(),
            ...updateData,
            createdAt: new Date()
          });
          oldToNewSlug[cat.slug] = cat.slug;
        }
      }

      // Clean up any remaining categories for this user (remove legacy fields if they exist)
      console.log('  Cleaning remaining categories fields...');
      await db.collection('categories').updateMany(
        { userId },
        { $unset: { collection: "", id: "" } }
      );

      // 3. Migrate Resources
      console.log('\n--- Migrating Resources ---');
      const resources = await db.collection('resources').find({ userId }).toArray();
      console.log(`  Found ${resources.length} resources to migrate for this user.`);

      for (const res of resources) {
        // Resolve categoryId
        const oldCatRaw = res.categoryId || res.category || '';
        const mappedCatSlug = oldToNewSlug[oldCatRaw] || oldCatRaw.toLowerCase().trim();

        // Prepare updates
        const updateSet = {
          categoryId: mappedCatSlug,
          updatedAt: new Date()
        };

        // If favorite is not defined, default it from featured
        if (res.favorite === undefined) {
          updateSet.favorite = res.featured || false;
        }

        // Clean up legacy fields
        const updateUnset = {
          category: "",
          status: "",
          featured: ""
        };

        await db.collection('resources').updateOne(
          { _id: res._id },
          {
            $set: updateSet,
            $unset: updateUnset
          }
        );
      }
      console.log(`  Finished resources migration for ${user.email}`);
    }

    console.log('\n=========================================');
    console.log('Migration successfully completed!');
    console.log('=========================================');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await client.close();
  }
}

runMigration();
