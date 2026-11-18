const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const sharp = require('sharp');

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

/**
 * Sanitize folder name so it only allows safe subdirectories (e.g. 'product', 'machinery', 'category')
 */
const sanitizeFolder = (f) => {
  if (!f || typeof f !== 'string') return '';
  return f
    .toLowerCase()
    .trim()
    .replace(/\\/g, '/')
    .split('/')
    .filter((segment) => segment && !segment.startsWith('.'))
    .join('/');
};

/**
 * Checks if a string is a base64 Data URL
 */
const isBase64DataUrl = (str) => {
  if (typeof str !== 'string') return false;
  return /^data:image\/[a-zA-Z0-9+.-]+;base64,/.test(str);
};

/**
 * Saves a base64 string to a WebP file in the uploads directory (or subfolder) and returns its relative URL path.
 * If the input is already a URL or filePath, returns it unchanged.
 */
const saveBase64Image = async (input, prefix = 'img', folder = '') => {
  if (!input) return '';

  // If input is an object with a data, url or preview property
  if (typeof input === 'object') {
    if (input.url && !isBase64DataUrl(input.url)) {
      return input.url;
    }
    if (input.data) {
      return saveBase64Image(input.data, prefix, folder);
    }
    if (input.preview && isBase64DataUrl(input.preview)) {
      return saveBase64Image(input.preview, prefix, folder);
    }
    if (input.preview && !isBase64DataUrl(input.preview)) {
      return input.preview;
    }
  }

  if (typeof input !== 'string') return '';

  // If already an HTTP/HTTPS URL or /uploads/ path, return as is
  if (!isBase64DataUrl(input)) {
    return input;
  }

  try {
    const matches = input.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/);
    if (!matches || matches.length < 3) {
      return input;
    }

    let ext = matches[1].toLowerCase();
    const isSvg = ext === 'svg' || ext === 'svg+xml';
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    const cleanFolder = sanitizeFolder(folder);
    const targetDir = cleanFolder ? path.join(UPLOADS_DIR, cleanFolder) : UPLOADS_DIR;
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const randomSuffix = crypto.randomBytes(8).toString('hex');
    const cleanPrefix = (prefix || 'img').replace(/[^a-z0-9_-]/gi, '-');
    const urlPrefix = cleanFolder ? `/uploads/${cleanFolder}` : '/uploads';

    if (!isSvg) {
      try {
        const filename = `${cleanPrefix}-${Date.now()}-${randomSuffix}.webp`;
        const filePath = path.join(targetDir, filename);

        await sharp(buffer)
          .webp({ quality: 85, effort: 4 })
          .toFile(filePath);

        return `${urlPrefix}/${filename}`;
      } catch (sharpErr) {
        console.warn('Sharp WebP conversion of base64 failed, writing buffer directly:', sharpErr.message);
      }
    }

    // Fallback for SVG or sharp error:
    const safeExt = isSvg ? 'svg' : (ext === 'jpeg' ? 'jpg' : ext);
    const filename = `${cleanPrefix}-${Date.now()}-${randomSuffix}.${safeExt}`;
    const filePath = path.join(targetDir, filename);
    await fs.promises.writeFile(filePath, buffer);

    return `${urlPrefix}/${filename}`;
  } catch (err) {
    console.error('Error saving base64 image to disk:', err);
    return input;
  }
};

/**
 * Processes an array of images (or mixed objects/strings), ensuring every item
 * is written to disk if base64 and returned as clean URL paths.
 */
const saveMultipleBase64Images = async (images, prefix = 'img', folder = '') => {
  if (!Array.isArray(images)) return [];

  const promises = images.map(async (img, index) => {
    if (typeof img === 'string') {
      return saveBase64Image(img, `${prefix}-${index + 1}`, folder);
    }
    if (img && typeof img === 'object') {
      const target = img.data || img.url || img.preview || '';
      const savedUrl = await saveBase64Image(target, `${prefix}-${index + 1}`, folder);
      return {
        ...img,
        url: savedUrl,
        data: savedUrl,
        preview: savedUrl,
      };
    }
    return img;
  });

  return Promise.all(promises);
};

module.exports = {
  isBase64DataUrl,
  saveBase64Image,
  saveMultipleBase64Images,
  UPLOADS_DIR,
};
