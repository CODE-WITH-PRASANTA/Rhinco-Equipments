const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

/**
 * Checks if a string is a base64 Data URL
 */
const isBase64DataUrl = (str) => {
  if (typeof str !== 'string') return false;
  return /^data:image\/[a-zA-Z0-9+.-]+;base64,/.test(str);
};

/**
 * Saves a base64 string to a file in the uploads directory and returns its relative URL path.
 * If the input is already a URL or filePath, returns it unchanged.
 */
const saveBase64Image = (input, prefix = 'img') => {
  if (!input) return '';

  // If input is an object with a data or url property
  if (typeof input === 'object') {
    if (input.url && !isBase64DataUrl(input.url)) {
      return input.url;
    }
    if (input.data) {
      return saveBase64Image(input.data, prefix);
    }
    if (input.preview && isBase64DataUrl(input.preview)) {
      return saveBase64Image(input.preview, prefix);
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
    if (ext === 'jpeg') ext = 'jpg';
    if (ext === 'svg+xml') ext = 'svg';

    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    const randomSuffix = crypto.randomBytes(8).toString('hex');
    const filename = `${prefix}-${Date.now()}-${randomSuffix}.${ext}`;
    const filePath = path.join(UPLOADS_DIR, filename);

    fs.writeFileSync(filePath, buffer);

    // Return the relative web URL for frontend access and database storage
    return `/uploads/${filename}`;
  } catch (err) {
    console.error('Error saving base64 image to disk:', err);
    return input;
  }
};

/**
 * Processes an array of images (or mixed objects/strings), ensuring every item
 * is written to disk if base64 and returned as clean URL paths.
 */
const saveMultipleBase64Images = (images, prefix = 'img') => {
  if (!Array.isArray(images)) return [];

  return images.map((img, index) => {
    if (typeof img === 'string') {
      return saveBase64Image(img, `${prefix}-${index + 1}`);
    }
    if (img && typeof img === 'object') {
      const target = img.data || img.url || img.preview || '';
      const savedUrl = saveBase64Image(target, `${prefix}-${index + 1}`);
      return {
        ...img,
        url: savedUrl,
        data: savedUrl,
        preview: savedUrl,
      };
    }
    return img;
  });
};

module.exports = {
  isBase64DataUrl,
  saveBase64Image,
  saveMultipleBase64Images,
  UPLOADS_DIR,
};
