const express = require('express');
const router = express.Router();
const {
  getBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  bulkDeleteBlogs,
  bulkUpdateStatus,
} = require('../controllers/blogController');

router.route('/')
  .get(getBlogs)
  .post(createBlog);

router.post('/bulk-delete', bulkDeleteBlogs);
router.post('/bulk-status', bulkUpdateStatus);

router.route('/:id')
  .get(getBlogById)
  .put(updateBlog)
  .delete(deleteBlog);

module.exports = router;
