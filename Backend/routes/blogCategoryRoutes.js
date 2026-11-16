const express = require('express');
const router = express.Router();
const {
  getBlogCategories,
  getBlogCategoryById,
  createBlogCategory,
  updateBlogCategory,
  deleteBlogCategory,
} = require('../controllers/blogCategoryController');

router.route('/')
  .get(getBlogCategories)
  .post(createBlogCategory);

router.route('/:id')
  .get(getBlogCategoryById)
  .put(updateBlogCategory)
  .delete(deleteBlogCategory);

module.exports = router;
