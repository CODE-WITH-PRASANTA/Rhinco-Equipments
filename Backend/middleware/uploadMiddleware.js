const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Memory storage to process and convert images directly with sharp
const storage = multer.memoryStorage();

// File filter: accept images and common documents
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    // Images
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/svg+xml',
    'image/avif',
    'image/bmp',
    'image/tiff',
    // Documents
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv',
  ];

  const allowedExtensions = [
    '.jpg',
    '.jpeg',
    '.png',
    '.webp',
    '.gif',
    '.svg',
    '.avif',
    '.bmp',
    '.tiff',
    '.pdf',
    '.doc',
    '.docx',
    '.xls',
    '.xlsx',
    '.txt',
    '.csv',
  ];

  const ext = path.extname(file.originalname).toLowerCase();
  const mime = (file.mimetype || '').toLowerCase();

  if (allowedMimeTypes.includes(mime) || allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Unsupported file type (${file.mimetype || ext}). Allowed formats: images (JPG, PNG, WebP, etc.) and documents (PDF, DOC, XLS).`
      ),
      false
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20 MB max file size
    files: 15, // max 15 files per batch
  },
});

module.exports = upload;
