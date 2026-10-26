const fs = require('fs');
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

function slugify(text) {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start
    .replace(/-+$/, '');            // Trim - from end
}

async function run() {
  console.log('Connecting to database...');
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();
    console.log('Connected successfully.');

    // 1. Recover Collections
    console.log('\n--- Recovering Collections ---');
    const collections = await db.collection("collections").find({}).toArray();
    const badCollections = collections.filter(c => !c.slug);
    console.log(`Found ${badCollections.length} collections with missing/null slugs.`);

    for (const coll of badCollections) {
      const baseSlug = slugify(coll.name);
      let targetSlug = baseSlug;
      let counter = 1;
      
      // Ensure unique slug for this user
      while (collections.some(c => c.userId === coll.userId && c.slug === targetSlug && c._id.toString() !== coll._id.toString())) {
        targetSlug = `${baseSlug}-${counter}`;
        counter++;
      }

      console.log(`Collection "${coll.name}" (ID: ${coll._id}): Setting slug to "${targetSlug}"`);
      await db.collection("collections").updateOne(
        { _id: coll._id },
        { $set: { slug: targetSlug, updatedAt: new Date() } }
      );
    }

    // 2. Recover Categories
    console.log('\n--- Recovering Categories ---');
    const categories = await db.collection("categories").find({}).toArray();
    const badCategories = categories.filter(c => !c.slug);
    console.log(`Found ${badCategories.length} categories with missing/null slugs.`);

    if (badCategories.length > 0) {
      // Find all categoryIds used in resources
      const resources = await db.collection("resources").find({}).toArray();
      const resourceCategoryIds = new Set(resources.map(r => r.categoryId).filter(Boolean));
      const activeCategorySlugs = new Set(categories.map(c => c.slug).filter(Boolean));
      
      // Orphaned categoryIds are those present in resources but not in any active category slug
      const orphanedCategoryIds = [...resourceCategoryIds].filter(id => !activeCategorySlugs.has(id));
      console.log("Orphaned category IDs found in resources:", orphanedCategoryIds);

      for (const cat of badCategories) {
        const baseSlug = slugify(cat.name);
        let targetSlug = null;

        // Try to find a match in the orphanedCategoryIds
        const matchedOrphan = orphanedCategoryIds.find(id => {
          return id.toLowerCase().trim() === baseSlug || slugify(id) === baseSlug;
        });

        if (matchedOrphan) {
          targetSlug = matchedOrphan;
          console.log(`Category "${cat.name}" matches orphaned resource categoryId: "${targetSlug}"`);
        } else {
          targetSlug = baseSlug;
          let counter = 1;
          // Ensure unique slug for this user
          while (categories.some(c => c.userId === cat.userId && c.slug === targetSlug && c._id.toString() !== cat._id.toString())) {
            targetSlug = `${baseSlug}-${counter}`;
            counter++;
          }
          console.log(`Category "${cat.name}" will get generated slug: "${targetSlug}"`);
        }

        await db.collection("categories").updateOne(
          { _id: cat._id },
          { $set: { slug: targetSlug, updatedAt: new Date() } }
        );
        
        console.log(`Category "${cat.name}" (ID: ${cat._id}) updated with slug: "${targetSlug}"`);
      }
    }

    console.log('\nRecovery complete.');
  } catch (error) {
    console.error('Error during recovery:', error);
  } finally {
    await client.close();
  }
}

run();
