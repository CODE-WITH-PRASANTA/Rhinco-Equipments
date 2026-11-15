const Blog = require('../models/Blog');
const BlogCategory = require('../models/BlogCategory');

// @desc    Get all blogs
// @route   GET /api/blogs
exports.getBlogs = async (req, res) => {
  try {
    const { search, category, status, sort } = req.query;
    let query = {};

    if (search && search.trim()) {
      const q = search.trim();
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { author: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } },
        { excerpt: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } },
      ];
    }

    if (category && category !== 'ALL') {
      query.category = category;
    }

    if (status && status !== 'ALL') {
      query.status = status;
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'oldest') sortOption = { createdAt: 1 };
    if (sort === 'views') sortOption = { views: -1 };
    if (sort === 'title') sortOption = { title: 1 };

    const blogs = await Blog.find(query).sort(sortOption);

    res.json({
      success: true,
      count: blogs.length,
      data: blogs,
    });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single blog by ID or slug
// @route   GET /api/blogs/:id
exports.getBlogById = async (req, res) => {
  try {
    const { id } = req.params;
    let blog;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      blog = await Blog.findById(id);
    }
    if (!blog) {
      blog = await Blog.findOne({ slug: id });
    }
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog post not found' });
    }

    // Increment views on public view if requested
    if (req.query.view === 'true') {
      blog.views += 1;
      await blog.save();
    }

    res.json({ success: true, data: blog });
  } catch (error) {
    console.error('Error fetching blog:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new blog
// @route   POST /api/blogs
exports.createBlog = async (req, res) => {
  try {
    const {
      title,
      slug,
      category,
      categoryId,
      tags,
      excerpt,
      content,
      author,
      authorRole,
      authorAvatar,
      image,
      readTime,
      status,
      featured,
      publishDate,
      metaTitle,
      metaKeyword,
      metaKeywords,
      metaDescription,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Blog title is required' });
    }
    if (!category || !category.trim()) {
      return res.status(400).json({ success: false, message: 'Blog category is required' });
    }
    if (!excerpt || !excerpt.trim()) {
      return res.status(400).json({ success: false, message: 'Excerpt is required' });
    }
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Content is required' });
    }
    if (!image) {
      return res.status(400).json({ success: false, message: 'Banner image is required' });
    }

    const calculatedSlug =
      (slug && slug.trim()) ||
      title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');

    // Check duplicate slug
    let finalSlug = calculatedSlug;
    const existingSlug = await Blog.findOne({ slug: finalSlug });
    if (existingSlug) {
      finalSlug = `${calculatedSlug}-${Date.now().toString().slice(-4)}`;
    }

    const newBlog = await Blog.create({
      title: title.trim(),
      slug: finalSlug,
      category: category.trim(),
      categoryId: categoryId || null,
      tags: Array.isArray(tags) ? tags : [],
      excerpt: excerpt.trim(),
      content,
      author: author ? author.trim() : 'Admin User',
      authorRole: authorRole ? authorRole.trim() : 'Author',
      authorAvatar: authorAvatar || '',
      image,
      readTime: readTime || '5 min read',
      status: status || 'Published',
      featured: Boolean(featured),
      publishDate: publishDate || new Date().toISOString().split('T')[0],
      metaTitle: metaTitle || '',
      metaKeywords: metaKeywords || metaKeyword || '',
      metaDescription: metaDescription || '',
    });

    res.status(201).json({
      success: true,
      message: 'Blog post created successfully',
      data: newBlog,
    });
  } catch (error) {
    console.error('Error creating blog:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update blog
// @route   PUT /api/blogs/:id
exports.updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog post not found' });
    }

    Object.assign(blog, req.body);
    await blog.save();

    res.json({
      success: true,
      message: 'Blog post updated successfully',
      data: blog,
    });
  } catch (error) {
    console.error('Error updating blog:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete blog
// @route   DELETE /api/blogs/:id
exports.deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog post not found' });
    }
    res.json({
      success: true,
      message: 'Blog deleted successfully',
      data: blog,
    });
  } catch (error) {
    console.error('Error deleting blog:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Bulk delete blogs
// @route   POST /api/blogs/bulk-delete
exports.bulkDeleteBlogs = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'No blog IDs provided' });
    }
    await Blog.deleteMany({ _id: { $in: ids } });
    res.json({
      success: true,
      message: `Successfully deleted ${ids.length} blogs`,
    });
  } catch (error) {
    console.error('Error bulk deleting blogs:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Bulk update status
// @route   POST /api/blogs/bulk-status
exports.bulkUpdateStatus = async (req, res) => {
  try {
    const { ids, status } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'No blog IDs provided' });
    }
    await Blog.updateMany({ _id: { $in: ids } }, { status });
    res.json({
      success: true,
      message: `Updated status of ${ids.length} blogs to ${status}`,
    });
  } catch (error) {
    console.error('Error bulk updating status:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
