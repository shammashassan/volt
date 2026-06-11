const fs = require('fs');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');

// ─── ENV loader ────────────────────────────────────────────────────────────────
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
  } catch { /* no .env, use process.env */ }
}

loadEnv();
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/volt';
console.log('Connecting to:', uri);

// ─── Helpers ───────────────────────────────────────────────────────────────────
function parseDate(d) {
  if (!d) return new Date();
  if (d.$date) return new Date(d.$date);
  return new Date(d);
}

// ─── Slug remap ────────────────────────────────────────────────────────────────
// Old short slugs in JSON → canonical full slugs used as the `id` field in DB
// Resources in volt.resources.json still reference the old slugs, so we remap
// them at insert time.
const SLUG_REMAP = {
  'library': 'ui-library',
  'agents':  'ai-agents',
  'motion':  'motion-3d',
};
const slug = (raw) => SLUG_REMAP[raw] || (raw || '').toLowerCase().trim();

// ─── Tags by category ──────────────────────────────────────────────────────────
const CATEGORY_TAGS = {
  'ui-library':    ['design-system', 'components', 'accessible'],
  'components':    ['components', 'shadcn', 'copy-paste'],
  'blocks':        ['blocks', 'layouts', 'templates'],
  'pages':         ['pages', 'landing-page', 'full-page'],
  'motion-3d':     ['animation', '3d', 'gsap', 'framer-motion'],
  'charts':        ['data-viz', 'charts', 'dashboard'],
  'customize':     ['css', 'generators', 'tailwind'],
  'icons':         ['icons', 'svg'],
  'maps':          ['maps', 'geospatial'],
  'audio':         ['audio', 'media'],
  'interactions':  ['interactions', 'gestures', 'drag-drop'],
  'ai-agents':     ['ai', 'llm', 'agents'],
  'inspiration':   ['inspiration', 'showcase'],
  'search':        ['search', 'tools'],
};

// ─── Project definitions ────────────────────────────────────────────────────────
const PROJECTS = [
  {
    key:         'volt',
    name:        'Volt — Developer Resource Platform',
    description: 'Full-stack web platform for design engineers to discover and organise curated UI resources — components, blocks, animations, CSS tools, icon libraries, and AI tooling.',
    url:         'https://ui-volt.vercel.app/',
    status:      'active',
    tags:        ['nextjs', 'typescript', 'mongodb', 'shadcn', 'better-auth', 'tailwind', '21dev'],
  },
  {
    key:         'dime',
    name:        'Dime — Personal Finance Tracker',
    description: 'Production-ready multi-auth personal finance tracker with fully isolated per-user data — wallets, transactions, categories, budgets, and recurring rules.',
    url:         'https://dime-tracker.vercel.app/',
    status:      'completed',
    tags:        ['nextjs', 'typescript', 'mongodb', 'shadcn', 'better-auth', 'resend', 'tailwind'],
  },
  {
    key:         'zynerp',
    name:        'ZynERP — Business Management Platform',
    description: 'Full-stack ERP covering billing, inventory, expense tracking, employee records, and journal entries with role-based access control and exportable business performance reports.',
    url:         'https://zynerp.vercel.app/',
    status:      'completed',
    tags:        ['nextjs', 'typescript', 'mongodb', 'shadcn', 'dice-ui', 'erp', 'rbac'],
  },
  {
    key:         'zyn-mini',
    name:        'Zyn Mini ERP',
    description: 'Streamlined ERP with POS, inventory, procurement, accounting, and HRM modules — built for small business workflows.',
    url:         'https://zyn-mini-erp.vercel.app/',
    status:      'completed',
    tags:        ['nextjs', 'typescript', 'mongodb', 'shadcn', 'dice-ui', 'erp', 'pos'],
  },
  {
    key:         'zyn-legacy',
    name:        'Zyn ERP — Legacy',
    description: 'Legacy ERP prototype; superseded by ZynERP. Kept for reference and testing only.',
    url:         'https://zyn-erp.vercel.app/',
    status:      'paused',
    tags:        ['nextjs', 'typescript', 'mongodb', 'shadcn', 'dice-ui', 'erp', 'legacy'],
  },
  {
    key:         'portfolio',
    name:        'Personal Portfolio Website',
    description: 'Clean, responsive portfolio site built with Next.js App Router and TypeScript, deployed to Vercel with CI/CD via GitHub.',
    url:         'https://shammas-kt.vercel.app/',
    status:      'completed',
    tags:        ['nextjs', 'typescript', 'tailwind', 'shadcn', 'tailark', 'uitripled', 'portfolio'],
  },
];

// ─── Resource → project mapping ────────────────────────────────────────────────
// Keys are lowercase substrings matched against resource name (case-insensitive).
// Values are arrays of project keys from PROJECTS above.
const ALL_PROJECTS   = PROJECTS.map(p => p.key);
const ERP_PROJECTS   = ['zynerp', 'zyn-mini', 'zyn-legacy'];

const RESOURCE_PROJECT_MAP = {
  // ShadCN — used by everything
  'shadcn':    ALL_PROJECTS,
  // 21st.dev — used by Volt
  '21st.dev':  ['volt'],
  '21st':      ['volt'],
  // Tailark — used by Portfolio
  'tailark':   ['portfolio'],
  // TripleD / UITripled — used by Portfolio
  'tripled':   ['portfolio'],
  // Dice UI — used by all ERPs
  'dice ui':   ERP_PROJECTS,
  'diceui':    ERP_PROJECTS,
};

// ─── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log('Connected successfully.\n');
    const db = client.db();

    // 1. Users
    const users = await db.collection('user').find({}).toArray();
    if (!users.length) {
      console.error('No users found. Register a user first.');
      process.exit(1);
    }
    console.log(`Found ${users.length} user(s):`);
    users.forEach(u => console.log(`  · ${u.name} (${u.email}) — ${u._id}`));

    // 2. Clean
    console.log('\nClearing collections...');
    await Promise.all([
      db.collection('resources').deleteMany({}),
      db.collection('categories').deleteMany({}),
      db.collection('people').deleteMany({}),
      db.collection('notes').deleteMany({}),
      db.collection('projects').deleteMany({}),
    ]);
    console.log('Done.\n');

    // 3. Load JSON
    const rawCategories = JSON.parse(fs.readFileSync(path.join(__dirname, 'volt.categories.json'), 'utf-8'));
    const rawResources  = JSON.parse(fs.readFileSync(path.join(__dirname, 'volt.resources.json'),  'utf-8'));
    console.log(`Loaded ${rawCategories.length} categories, ${rawResources.length} resources.\n`);

    // ── Seed per user ──────────────────────────────────────────────────────────
    for (const user of users) {
      const userId = user._id.toString();
      console.log(`══════════════════════════════════════════════`);
      console.log(`Seeding: ${user.email}`);
      console.log(`══════════════════════════════════════════════`);

      // ── 4.1 Categories ──────────────────────────────────────────────────────
      const categoriesToInsert = rawCategories.map(cat => {
        const catSlug  = slug(cat.id);
        const titleVal = cat.title || cat.name || catSlug;
        return {
          _id:         new ObjectId(),
          id:          catSlug,          // ← full slug: ui-library, ai-agents, motion-3d …
          name:        titleVal,
          title:       titleVal,
          description: cat.description || '',
          icon:        cat.icon || 'Rocket',
          image:       cat.image || '',
          order:       cat.order ?? 0,
          userId,
          createdAt:   parseDate(cat.createdAt),
          updatedAt:   parseDate(cat.updatedAt || cat.createdAt),
        };
      });

      await db.collection('categories').insertMany(categoriesToInsert);
      console.log(`\n✓ ${categoriesToInsert.length} categories:`);
      [...categoriesToInsert].sort((a, b) => a.order - b.order)
        .forEach(c => console.log(`    [${String(c.order).padStart(2)}] "${c.id}"  →  ${c.title}`));

      // Build old-slug → new-slug lookup for resource category remapping
      const oldToNew = {};
      rawCategories.forEach(cat => { oldToNew[cat.id] = slug(cat.id); });

      // ── 4.2 Projects ────────────────────────────────────────────────────────
      const projectIdMap = {};  // key → ObjectId string
      const projectsToInsert = PROJECTS.map(p => {
        const oid = new ObjectId();
        projectIdMap[p.key] = oid.toString();
        return {
          _id:         oid,
          name:        p.name,
          description: p.description,
          url:         p.url,
          status:      p.status,
          tags:        p.tags,
          userId,
          createdAt:   new Date(),
          updatedAt:   new Date(),
        };
      });

      await db.collection('projects').insertMany(projectsToInsert);
      console.log(`\n✓ ${projectsToInsert.length} projects:`);
      projectsToInsert.forEach(p => console.log(`    · ${p.name}  [${p.status}]  tags: ${p.tags.join(', ')}`));

      // ── 4.3 Resources ───────────────────────────────────────────────────────
      let warnings = 0;
      const validSlugs = new Set(categoriesToInsert.map(c => c.id));

      const resourcesToInsert = rawResources.map(res => {
        const titleVal    = res.title || res.name || '';
        const urlVal      = res.url   || res.link || '';
        const favoriteVal = res.favorite ?? res.featured ?? false;

        // Type from URL
        let typeVal = res.type || 'website';
        if (urlVal.includes('github.com'))                                   typeVal = 'github';
        else if (urlVal.includes('youtube.com') || urlVal.includes('youtu.be')) typeVal = 'youtube';

        // Remap old category slug → new slug
        const catSlug = oldToNew[res.category] || slug(res.category);
        if (res.category && !validSlugs.has(catSlug)) {
          console.warn(`  ⚠ "${titleVal}" → unknown category slug "${catSlug}"`);
          warnings++;
        }

        // Tags: from JSON + auto-tags from category
        const jsonTags  = Array.isArray(res.tags) ? res.tags : [];
        const autoTags  = CATEGORY_TAGS[catSlug] || [];
        const allTags   = [...new Set([...jsonTags, ...autoTags])];

        // Project links
        const linkedProjectIds = [];
        const nameLower = titleVal.toLowerCase();
        for (const [pattern, projectKeys] of Object.entries(RESOURCE_PROJECT_MAP)) {
          if (nameLower.includes(pattern.toLowerCase())) {
            projectKeys.forEach(key => {
              const pid = projectIdMap[key];
              if (pid && !linkedProjectIds.includes(pid)) linkedProjectIds.push(pid);
            });
          }
        }

        return {
          _id:         new ObjectId(),
          title:       titleVal,
          name:        titleVal,
          url:         urlVal,
          link:        urlVal,
          description: res.description || '',
          categoryId:  catSlug,
          category:    catSlug,
          tags:        allTags,
          notes:       res.notes    || '',
          whySaved:    res.whySaved || '',
          status:      res.status   || 'saved',
          type:        typeVal,
          favorite:    favoriteVal,
          featured:    favoriteVal,
          logo:        res.logo || '',
          order:       res.order ?? 0,
          userId,
          projectIds:  linkedProjectIds,
          personIds:   [],
          useCount:    res.useCount || 0,
          createdAt:   parseDate(res.createdAt),
          updatedAt:   parseDate(res.updatedAt || res.createdAt),
        };
      });

      await db.collection('resources').insertMany(resourcesToInsert);
      console.log(`\n✓ ${resourcesToInsert.length} resources inserted.`);
      if (warnings) console.log(`  ⚠ ${warnings} unknown category slug(s).`);

      // Print project-linked resources summary
      const linked = resourcesToInsert.filter(r => r.projectIds.length > 0);
      if (linked.length) {
        console.log(`\n  Project-linked resources (${linked.length}):`);
        linked.forEach(r => {
          const projNames = r.projectIds.map(id => {
            const p = projectsToInsert.find(p => p._id.toString() === id);
            return p ? p.name.split('—')[0].trim() : id;
          });
          console.log(`    · "${r.name}"  →  [${projNames.join(', ')}]`);
        });
      }
    }

    console.log('\n══════════════════════════════════════════════');
    console.log('✅ Seeding complete!');

  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  } finally {
    await client.close();
  }
}

main();
