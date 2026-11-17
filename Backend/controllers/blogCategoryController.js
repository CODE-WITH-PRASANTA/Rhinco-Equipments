const BlogCategory = require('../models/BlogCategory');
const Blog = require('../models/Blog');
const { saveBase64Image } = require('../utils/saveBase64Image');

// @desc    Get all blog categories
// @route   GET /api/blog-categories
exports.getBlogCategories = async (req, res) => {
  try {
    const categories = await BlogCategory.find().sort({ createdAt: -1 });

    // Calculate dynamic post counts for each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        const count = await Blog.countDocuments({
          $or: [{ category: cat.name }, { categoryId: cat._id }],
        });
        return {
          ...cat.toObject(),
          postCount: count,
        };
      })
    );

    res.json({
      success: true,
      count: categoriesWithCount.length,
      data: categoriesWithCount,
    });
  } catch (error) {
    console.error('Error fetching blog categories:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single blog category
// @route   GET /api/blog-categories/:id
exports.getBlogCategoryById = async (req, res) => {
  try {
    const category = await BlogCategory.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    const count = await Blog.countDocuments({
      $or: [{ category: category.name }, { categoryId: category._id }],
    });
    res.json({
      success: true,
      data: { ...category.toObject(), postCount: count },
    });
  } catch (error) {
    console.error('Error fetching category by id:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new blog category
// @route   POST /api/blog-categories
exports.createBlogCategory = async (req, res) => {
  try {
    const { name, description, image, status } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }

    const trimmedName = name.trim();

    // Check duplicate
    const existing = await BlogCategory.findOne({
      name: { $regex: new RegExp(`^${trimmedName}$`, 'i') },
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'Category with this name already exists' });
    }

    const slug = trimmedName
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const newCategory = await BlogCategory.create({
      name: trimmedName,
      slug,
      description: description ? description.trim() : '',
      image: saveBase64Image(image, 'category'),
      status: status || 'Active',
    });

    res.status(201).json({
      success: true,
      message: 'Blog category created successfully',
      data: { ...newCategory.toObject(), postCount: 0 },
    });
  } catch (error) {
    console.error('Error creating blog category:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update blog category
// @route   PUT /api/blog-categories/:id
exports.updateBlogCategory = async (req, res) => {
  try {
    const { name, description, image, status } = req.body;

    const category = await BlogCategory.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    if (name && name.trim()) {
      const trimmedName = name.trim();
      const existing = await BlogCategory.findOne({
        _id: { $ne: req.params.id },
        name: { $regex: new RegExp(`^${trimmedName}$`, 'i') },
      });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Category name already taken' });
      }

      // If category name changed, update blogs using this category
      const oldName = category.name;
      category.name = trimmedName;
      category.slug = trimmedName
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');

      if (oldName !== trimmedName) {
        await Blog.updateMany({ category: oldName }, { category: trimmedName });
      }
    }

    if (description !== undefined) category.description = description.trim();
    if (image !== undefined) category.image = saveBase64Image(image, 'category');
    if (status) category.status = status;

    await category.save();

    const count = await Blog.countDocuments({
      $or: [{ category: category.name }, { categoryId: category._id }],
    });

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: { ...category.toObject(), postCount: count },
    });
  } catch (error) {
    console.error('Error updating blog category:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete blog category
// @route   DELETE /api/blog-categories/:id
exports.deleteBlogCategory = async (req, res) => {
  try {
    const category = await BlogCategory.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    await BlogCategory.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Category deleted successfully',
      data: category,
    });
  } catch (error) {
    console.error('Error deleting blog category:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
