const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const sharp = require('sharp');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/rhinco_equipments';
const UPLOADS_DIR = path.join(__dirname, 'uploads');

const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const slugify = (text) => {
  return (text || 'item')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 35)
    .replace(/^-|-$/g, '');
};

const downloadAndConvertToWebp = async (url, targetSubfolder, baseName) => {
  console.log(`Downloading: ${url}`);
  const targetDir = path.join(UPLOADS_DIR, targetSubfolder);
  ensureDir(targetDir);

  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  });

  if (!res.ok) {
    throw new Error(`Failed to download ${url}: HTTP status ${res.status}`);
  }

  const arrayBuffer = await res.arrayBuffer();
  const inputBuffer = Buffer.from(arrayBuffer);

  const clean = slugify(baseName);
  const randomSuffix = crypto.randomBytes(4).toString('hex');
  const filename = `${clean}-${Date.now()}-${randomSuffix}.webp`;
  const filePath = path.join(targetDir, filename);

  await sharp(inputBuffer)
    .webp({ quality: 85, effort: 4 })
    .toFile(filePath);

  console.log(` -> Saved as WebP: /uploads/${targetSubfolder}/${filename}`);
  return `/uploads/${targetSubfolder}/${filename}`;
};

async function migrate() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB:', MONGO_URI);

  const db = mongoose.connection.db;

  // 1. Migrate Products
  console.log('\n========================================');
  console.log('Migrating Product Images...');
  console.log('========================================');
  const products = await db.collection('products').find({}).toArray();
  let migratedProductsCount = 0;

  for (const product of products) {
    const rawImages = product.images || [];
    let modified = false;
    const newImages = [];

    for (let i = 0; i < rawImages.length; i++) {
      const img = rawImages[i];
      if (typeof img === 'string' && (img.startsWith('http://') || img.startsWith('https://'))) {
        try {
          const webpPath = await downloadAndConvertToWebp(img, 'product', `${product.title || 'product'}-${i + 1}`);
          newImages.push(webpPath);
          modified = true;
        } catch (downloadErr) {
          console.error(`Failed to migrate image for product "${product.title}":`, downloadErr.message);
          newImages.push(img); // keep original if download fails
        }
      } else {
        newImages.push(img);
      }
    }

    if (modified) {
      await db.collection('products').updateOne(
        { _id: product._id },
        { $set: { images: newImages } }
      );
      migratedProductsCount++;
      console.log(`Updated Product: "${product.title}" with new local WebP images.`);
    }
  }

  console.log(`Successfully migrated images for ${migratedProductsCount} products.`);

  // 2. Migrate Machinery
  console.log('\n========================================');
  console.log('Migrating Machinery Images...');
  console.log('========================================');
  const machinery = await db.collection('machinery').find({}).toArray();
  let migratedMachineryCount = 0;

  for (const machine of machinery) {
    const rawImages = machine.machineImages || [];
    let modified = false;
    const newImages = [];

    for (let i = 0; i < rawImages.length; i++) {
      const img = rawImages[i];
      const targetUrl = typeof img === 'string' ? img : (img?.url || img?.data || img?.preview || '');

      if (typeof targetUrl === 'string' && (targetUrl.startsWith('http://') || targetUrl.startsWith('https://'))) {
        try {
          const webpPath = await downloadAndConvertToWebp(targetUrl, 'machinery', `${machine.title || 'machinery'}-${i + 1}`);
          if (typeof img === 'object' && img !== null) {
            newImages.push({
              ...img,
              url: webpPath,
              data: webpPath,
              preview: webpPath,
            });
          } else {
            newImages.push(webpPath);
          }
          modified = true;
        } catch (downloadErr) {
          console.error(`Failed to migrate image for machinery "${machine.title}":`, downloadErr.message);
          newImages.push(img);
        }
      } else {
        newImages.push(img);
      }
    }

    if (modified) {
      await db.collection('machinery').updateOne(
        { _id: machine._id },
        { $set: { machineImages: newImages } }
      );
      migratedMachineryCount++;
      console.log(`Updated Machinery: "${machine.title}" with new local WebP images.`);
    }
  }

  console.log(`Successfully migrated images for ${migratedMachineryCount} machinery items.`);

  // 3. Migrate BlogCategories if needed
  console.log('\n========================================');
  console.log('Checking Blog Categories...');
  console.log('========================================');
  const categories = await db.collection('blogcategories').find({}).toArray();
  for (const cat of categories) {
    if (typeof cat.image === 'string' && (cat.image.startsWith('http://') || cat.image.startsWith('https://'))) {
      try {
        const webpPath = await downloadAndConvertToWebp(cat.image, 'category', cat.name || 'category');
        await db.collection('blogcategories').updateOne(
          { _id: cat._id },
          { $set: { image: webpPath } }
        );
        console.log(`Updated Category: "${cat.name}" with local WebP image.`);
      } catch (err) {
        console.error(`Failed to migrate category image "${cat.name}":`, err.message);
      }
    }
  }

  console.log('\n========================================');
  console.log('Migration Complete!');
  console.log('========================================');

  await mongoose.disconnect();
}

migrate().catch((err) => {
  console.error('Fatal migration error:', err);
  process.exit(1);
});
