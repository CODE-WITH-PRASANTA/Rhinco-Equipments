const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const upload = require('../middleware/uploadMiddleware');

const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
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
 * Process an uploaded file:
 * - If image (jpeg, png, webp, bmp, tiff, avif, etc.): converts to optimized WebP format
 * - If document (pdf, doc, xls, etc.) or SVG: saves directly with safe filename
 * Saves into target folder (e.g. uploads/product or uploads/machinery)
 * Returns { url, filename, originalName, size, mimetype, convertedToWebp }
 */
const processAndSaveFile = async (file, folder = '') => {
  const cleanFolder = sanitizeFolder(folder);
  const targetDir = cleanFolder ? path.join(uploadsDir, cleanFolder) : uploadsDir;
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const ext = path.extname(file.originalname).toLowerCase();
  const cleanBase =
    path
      .basename(file.originalname, ext)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .slice(0, 40) || 'upload';
  const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;

  const mime = (file.mimetype || '').toLowerCase();
  const isSvg = mime === 'image/svg+xml' || ext === '.svg';
  const isImage =
    (mime.startsWith('image/') ||
      ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.tiff', '.avif'].includes(ext)) &&
    !isSvg;

  const urlPrefix = cleanFolder ? `/uploads/${cleanFolder}` : '/uploads';

  // 1. Process raster image -> Convert to WebP
  if (isImage) {
    try {
      const finalFilename = `${cleanBase}-${uniqueSuffix}.webp`;
      const finalPath = path.join(targetDir, finalFilename);

      await sharp(file.buffer)
        .webp({ quality: 85, effort: 4 })
        .toFile(finalPath);

      const stats = await fs.promises.stat(finalPath);

      return {
        url: `${urlPrefix}/${finalFilename}`,
        filename: finalFilename,
        folder: cleanFolder,
        originalName: file.originalname,
        size: stats.size,
        mimetype: 'image/webp',
        convertedToWebp: true,
      };
    } catch (sharpError) {
      console.warn('Sharp WebP conversion failed, falling back to original buffer:', sharpError.message);
      const safeExt = ext || '.jpg';
      const finalFilename = `${cleanBase}-${uniqueSuffix}${safeExt}`;
      const finalPath = path.join(targetDir, finalFilename);

      await fs.promises.writeFile(finalPath, file.buffer);
      const stats = await fs.promises.stat(finalPath);

      return {
        url: `${urlPrefix}/${finalFilename}`,
        filename: finalFilename,
        folder: cleanFolder,
        originalName: file.originalname,
        size: stats.size,
        mimetype: file.mimetype || 'image/jpeg',
        convertedToWebp: false,
      };
    }
  }

  // 2. Document or SVG -> Save directly with safe sanitized filename
  const safeExt = ext || (isSvg ? '.svg' : '.bin');
  const finalFilename = `${cleanBase}-${uniqueSuffix}${safeExt}`;
  const finalPath = path.join(targetDir, finalFilename);

  await fs.promises.writeFile(finalPath, file.buffer);
  const stats = await fs.promises.stat(finalPath);

  return {
    url: `${urlPrefix}/${finalFilename}`,
    filename: finalFilename,
    folder: cleanFolder,
    originalName: file.originalname,
    size: stats.size,
    mimetype: file.mimetype || 'application/octet-stream',
    convertedToWebp: false,
  };
};

// @desc    Upload single image or file (converts images to WebP)
// @route   POST /api/upload
router.post('/', (req, res) => {
  const uploadSingle = upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'file', maxCount: 1 },
    { name: 'document', maxCount: 1 },
  ]);

  uploadSingle(req, res, async (err) => {
    if (err) {
      console.error('Upload error:', err);
      return res.status(400).json({
        success: false,
        message: err.message || 'File upload failed',
      });
    }

    const file =
      (req.files && req.files.image && req.files.image[0]) ||
      (req.files && req.files.file && req.files.file[0]) ||
      (req.files && req.files.document && req.files.document[0]) ||
      req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'No file provided in request body (expected field: "image", "file", or "document")',
      });
    }

    const folder = req.query.folder || req.body?.folder || '';

    try {
      const result = await processAndSaveFile(file, folder);

      res.status(200).json({
        success: true,
        message: result.convertedToWebp
          ? 'Image uploaded and converted to WebP successfully'
          : 'File uploaded successfully to server folder',
        ...result,
      });
    } catch (saveError) {
      console.error('File processing error:', saveError);
      res.status(500).json({
        success: false,
        message: 'Failed to process and save file on server',
        error: saveError.message,
      });
    }
  });
});

// @desc    Upload multiple images or files (converts all images to WebP)
// @route   POST /api/upload/multiple
router.post('/multiple', (req, res) => {
  const uploadMultiple = upload.fields([
    { name: 'images', maxCount: 15 },
    { name: 'files', maxCount: 15 },
    { name: 'documents', maxCount: 15 },
  ]);

  uploadMultiple(req, res, async (err) => {
    if (err) {
      console.error('Multiple upload error:', err);
      return res.status(400).json({
        success: false,
        message: err.message || 'Multiple file upload failed',
      });
    }

    const files = [
      ...(req.files?.images || []),
      ...(req.files?.files || []),
      ...(req.files?.documents || []),
    ];

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files provided in request body (field: "images", "files", or "documents")',
      });
    }

    const folder = req.query.folder || req.body?.folder || '';

    try {
      const results = await Promise.all(files.map((f) => processAndSaveFile(f, folder)));
      const urls = results.map((r) => r.url);

      res.status(200).json({
        success: true,
        message: `${files.length} file(s) uploaded and processed successfully`,
        urls,
        files: results,
      });
    } catch (saveError) {
      console.error('Multiple file processing error:', saveError);
      res.status(500).json({
        success: false,
        message: 'Failed to process files on server',
        error: saveError.message,
      });
    }
  });
});

module.exports = router;
