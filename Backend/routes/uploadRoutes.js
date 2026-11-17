const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');

// @desc    Upload single image
// @route   POST /api/upload
router.post('/', (req, res) => {
  const uploadSingle = upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'file', maxCount: 1 },
  ]);

  uploadSingle(req, res, (err) => {
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
      req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided in request body (field: "image" or "file")',
      });
    }

    const relativeUrl = `/uploads/${file.filename}`;

    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully to server folder',
      url: relativeUrl,
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
    });
  });
});

// @desc    Upload multiple images
// @route   POST /api/upload/multiple
router.post('/multiple', (req, res) => {
  const uploadMultiple = upload.fields([
    { name: 'images', maxCount: 15 },
    { name: 'files', maxCount: 15 },
  ]);

  uploadMultiple(req, res, (err) => {
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
    ];

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No image files provided in request body (field: "images" or "files")',
      });
    }

    const urls = files.map((f) => `/uploads/${f.filename}`);
    const details = files.map((f) => ({
      url: `/uploads/${f.filename}`,
      filename: f.filename,
      originalName: f.originalname,
      size: f.size,
      mimetype: f.mimetype,
    }));

    res.status(200).json({
      success: true,
      message: `${files.length} images uploaded successfully to server folder`,
      urls,
      files: details,
    });
  });
});

module.exports = router;
