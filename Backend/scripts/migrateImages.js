const mongoose = require('mongoose');
const { saveBase64Image } = require('../utils/saveBase64Image');

async function migrateDatabase() {
  await mongoose.connect('mongodb://127.0.0.1:27017/rhinco_equipments');
  console.log('Connected to DB for migration');

  const Team = mongoose.model('Team', new mongoose.Schema({}, { strict: false }));
  const teams = await Team.find({});
  for (const t of teams) {
    if (t.image && t.image.startsWith('data:image/')) {
      console.log('Migrating base64 image for team member:', t.name);
      const cleanPrefix = 'team-' + (t.name || 'member').toLowerCase().replace(/[^a-z0-9]/g, '-');
      const savedPath = await saveBase64Image(t.image, cleanPrefix, 'team');
      t.image = savedPath;
      await t.save();
      console.log('Updated team member to disk path:', savedPath);
    }
  }

  // Scan all collections to ensure NO blob: or data:image/ remains
  const cols = await mongoose.connection.db.collections();
  for (const c of cols) {
    const docs = await c.find({}).toArray();
    for (const doc of docs) {
      let changed = false;
      if (Array.isArray(doc.images)) {
        const cleaned = doc.images.filter((x) => typeof x === 'string' && !x.startsWith('blob:') && !x.startsWith('data:'));
        if (cleaned.length !== doc.images.length) {
          doc.images = cleaned;
          changed = true;
        }
      }
      if (typeof doc.image === 'string' && (doc.image.startsWith('blob:') || doc.image.startsWith('data:'))) {
        doc.image = '';
        changed = true;
      }
      if (changed) {
        await c.replaceOne({ _id: doc._id }, doc);
        console.log('Cleaned invalid image from collection:', c.collectionName, doc._id);
      }
    }
  }

  console.log('Migration completed successfully!');
  await mongoose.disconnect();
}

migrateDatabase().catch(console.error);
