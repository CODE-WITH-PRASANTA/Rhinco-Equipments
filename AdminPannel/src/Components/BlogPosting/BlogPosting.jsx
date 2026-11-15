import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams, useParams } from "react-router-dom";
import { Editor } from "@tinymce/tinymce-react";
import {
  FiEdit3,
  FiUploadCloud,
  FiX,
  FiImage,
  FiCheckCircle,
  FiSave,
  FiCalendar,
  FiClock,
  FiGlobe,
  FiPlus,
  FiLayers,
} from "react-icons/fi";
import {
  BLOGS_API,
  CATEGORIES_API,
  fetchDynamicCategories,
} from "../BlogManagement/blogData";
import "./BlogPosting.css";

const generateSlug = (text) => {
  return (text || "")
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const createInitialForm = () => ({
  title: "",
  slug: "",
  category: "",
  tags: [],
  excerpt: "",
  content: "",
  author: "Admin User",
  authorRole: "Author",
  authorAvatar: "",
  image: "",
  readTime: "5 min read",
  status: "Published",
  featured: false,
  publishDate: new Date().toISOString().split("T")[0],
  metaTitle: "",
  metaKeywords: "",
  metaDescription: "",
});

const BlogPosting = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { id: paramId } = useParams();

  const editId = paramId || searchParams.get("edit");
  const isEditing = Boolean(editId);

  const [form, setForm] = useState(createInitialForm);
  const [categories, setCategories] = useState([]);
  const [newCatInput, setNewCatInput] = useState("");
  const [showAddCat, setShowAddCat] = useState(false);

  const [tagInput, setTagInput] = useState("");
  const [isCustomSlug, setIsCustomSlug] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [toastMessage, setToastMessage] = useState("");

  const fileInputRef = useRef(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 3500);
  };

  // Fetch dynamic categories from database
  const loadCategories = async () => {
    try {
      const cats = await fetchDynamicCategories();
      setCategories(cats);
      // Auto-select first category if form category is empty
      if (cats.length > 0) {
        setForm((prev) => ({
          ...prev,
          category: prev.category || cats[0].name,
        }));
      }
    } catch (err) {
      console.error("Error loading categories:", err);
    }
  };

  // If editing, load blog data from backend API
  const loadBlogToEdit = async () => {
    if (!editId) return;
    try {
      const res = await fetch(`${BLOGS_API}/${editId}`);
      const result = await res.json();
      if (result.success && result.data) {
        const target = result.data;
        setForm({
          title: target.title || "",
          slug: target.slug || "",
          category: target.category || "",
          tags: Array.isArray(target.tags) ? target.tags : [],
          excerpt: target.excerpt || "",
          content: target.content || "",
          author: target.author || "Admin User",
          authorRole: target.authorRole || "Author",
          authorAvatar: target.authorAvatar || "",
          image: target.image || "",
          readTime: target.readTime || "5 min read",
          status: target.status || "Published",
          featured: Boolean(target.featured),
          publishDate: target.publishDate || new Date().toISOString().split("T")[0],
          metaTitle: target.metaTitle || "",
          metaKeywords: target.metaKeywords || target.metaKeyword || "",
          metaDescription: target.metaDescription || "",
        });
        setIsCustomSlug(true);
      }
    } catch (err) {
      console.error("Failed to load blog for editing:", err);
      showToast("Failed to fetch blog article data.");
    }
  };

  useEffect(() => {
    loadCategories();
    if (isEditing) {
      loadBlogToEdit();
    }
    // Listen for category updates
    window.addEventListener("blog_categories_updated", loadCategories);
    return () => window.removeEventListener("blog_categories_updated", loadCategories);
  }, [editId]);

  // Auto-generate slug when title changes unless custom edited
  const handleTitleChange = (e) => {
    const val = e.target.value;
    setForm((prev) => ({
      ...prev,
      title: val,
      slug: isCustomSlug ? prev.slug : generateSlug(val),
      metaTitle: prev.metaTitle || val,
    }));
    if (errors.title) setErrors((prev) => ({ ...prev, title: null }));
  };

  // Word count & auto read-time calculation
  const calculatedReadTime = useMemo(() => {
    const text = form.content ? form.content.replace(/<[^>]*>/g, " ") : "";
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.ceil(words / 200));
    return `${minutes} min read`;
  }, [form.content]);

  useEffect(() => {
    if (form.content) {
      setForm((prev) => ({ ...prev, readTime: calculatedReadTime }));
    }
  }, [calculatedReadTime]);

  // Tags handling
  const executeAddTag = () => {
    const trimmed = tagInput.trim();
    if (!trimmed) return;

    const splitTags = trimmed
      .split(",")
      .map((t) => t.trim().replace(/^#/, ""))
      .filter((t) => t && !form.tags.includes(t));

    if (splitTags.length > 0) {
      setForm((prev) => ({
        ...prev,
        tags: [...prev.tags, ...splitTags],
      }));
    }
    setTagInput("");
  };

  const handleAddTag = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      executeAddTag();
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tagToRemove),
    }));
  };

  // Add new category directly to database
  const handleAddCategory = async () => {
    const trimmed = newCatInput.trim();
    if (!trimmed) return;

    try {
      const res = await fetch(CATEGORIES_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to add category");
      }

      await loadCategories();
      setForm((prev) => ({ ...prev, category: trimmed }));
      setNewCatInput("");
      setShowAddCat(false);
      showToast(`Category "${trimmed}" saved to database!`);
      window.dispatchEvent(new Event("blog_categories_updated"));
    } catch (err) {
      console.error("Add category error:", err);
      showToast(err.message || "Could not save category.");
    }
  };

  // Image Upload handler
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size exceeds 5MB limit.");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setForm((prev) => ({ ...prev, image: reader.result }));
        if (errors.image) setErrors((prev) => ({ ...prev, image: null }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Validation
  const validateForm = () => {
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = "Blog title is required.";
    if (!form.category) newErrors.category = "Please select or add a category.";
    if (!form.excerpt.trim()) newErrors.excerpt = "Short summary is required.";
    if (!form.content.trim()) newErrors.content = "Article content is required.";
    if (!form.image) newErrors.image = "Featured banner image is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save / Update to Database
  const handleSave = async (publishStatus = form.status) => {
    if (!validateForm()) {
      showToast("Please fill in all required fields.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...form,
        status: publishStatus,
      };

      const url = isEditing ? `${BLOGS_API}/${editId}` : BLOGS_API;
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to save blog article.");
      }

      showToast(
        isEditing
          ? "Article updated successfully in database!"
          : "Article saved to database successfully!"
      );

      setTimeout(() => {
        navigate("/blog");
      }, 700);
    } catch (err) {
      console.error("Save article error:", err);
      showToast(err.message || "Failed to save article.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="BlogPosting">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="BlogPosting-toast">
          <FiCheckCircle size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="BlogPosting-header">
        <div className="BlogPosting-headerLeft">
          <div className="BlogPosting-iconWrapper">
            <FiEdit3 size={25} />
          </div>
          <div>
            <span className="BlogPosting-eyebrow">
              {isEditing ? "EDIT ARTICLE" : "NEW ARTICLE / POSTING"}
            </span>
            <h2>{isEditing ? "Edit Blog Article" : "Create New Blog Post"}</h2>
            <p>Write, format, and save articles directly into your MongoDB database.</p>
          </div>
        </div>

        <div className="BlogPosting-headerActions">
          <button
            type="button"
            className="BlogPosting-btnDraft"
            disabled={isSubmitting}
            onClick={() => handleSave("Draft")}
          >
            <FiSave size={16} />
            <span>Save Draft</span>
          </button>

          <button
            type="button"
            className="BlogPosting-btnPublish"
            disabled={isSubmitting}
            onClick={() => handleSave("Published")}
          >
            <FiCheckCircle size={17} />
            <span>
              {isSubmitting
                ? "Saving to Database..."
                : isEditing
                ? "Update Article"
                : "Publish Article"}
            </span>
          </button>
        </div>
      </div>

      {/* MAIN TWO-COLUMN CONTENT GRID */}
      <div className="BlogPosting-grid">
        {/* LEFT COLUMN: PRIMARY CONTENT & EDITOR (70%) */}
        <div className="BlogPosting-mainCol">
          {/* TITLE & PERMALINK CARD */}
          <div className="BlogPosting-card">
            <div className="BlogPosting-cardHeader">
              <h3>Article Title & Overview</h3>
              <span className="BlogPosting-badge">Core Details</span>
            </div>

            <div className="BlogPosting-formGroup">
              <label className="BlogPosting-label">
                Post Title <span className="req">*</span>
              </label>
              <input
                type="text"
                className={`BlogPosting-input titleInput ${errors.title ? "has-error" : ""}`}
                placeholder="e.g. How Modern Technology Is Transforming Indian Agriculture"
                value={form.title}
                onChange={handleTitleChange}
              />
              {errors.title && <span className="BlogPosting-error">{errors.title}</span>}
            </div>

            {/* Slug / URL Permalink Row */}
            <div className="BlogPosting-slugRow">
              <span className="BlogPosting-slugPrefix">Permalink:</span>
              <span className="BlogPosting-slugDomain">rhinco.com/blog/</span>
              {isCustomSlug ? (
                <input
                  type="text"
                  className="BlogPosting-slugInput"
                  value={form.slug}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      slug: generateSlug(e.target.value),
                    }))
                  }
                />
              ) : (
                <code className="BlogPosting-slugCode">{form.slug || "your-post-slug"}</code>
              )}
              <button
                type="button"
                className="BlogPosting-slugEditBtn"
                onClick={() => setIsCustomSlug(!isCustomSlug)}
              >
                {isCustomSlug ? "Lock" : "Customize"}
              </button>
            </div>

            {/* Short Excerpt */}
            <div className="BlogPosting-formGroup" style={{ marginTop: "18px" }}>
              <div className="BlogPosting-labelBetween">
                <label className="BlogPosting-label">
                  Short Excerpt / Summary <span className="req">*</span>
                </label>
                <span className="BlogPosting-charCount">
                  {form.excerpt.length} / 220 chars recommended
                </span>
              </div>
              <textarea
                rows={3}
                className={`BlogPosting-textarea ${errors.excerpt ? "has-error" : ""}`}
                placeholder="Write a compelling 1-2 sentence overview shown on blog listings..."
                value={form.excerpt}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, excerpt: e.target.value }));
                  if (errors.excerpt) setErrors((prev) => ({ ...prev, excerpt: null }));
                }}
              />
              {errors.excerpt && (
                <span className="BlogPosting-error">{errors.excerpt}</span>
              )}
            </div>
          </div>

          {/* RICH TEXT CONTENT EDITOR CARD */}
          <div className="BlogPosting-card">
            <div className="BlogPosting-cardHeader">
              <div>
                <h3>Article Content Body</h3>
                <p className="BlogPosting-cardSub">
                  Use headings, bullet points, images, and formatting to create rich content.
                </p>
              </div>
              <span className="BlogPosting-readTimeIndicator">
                <FiClock size={14} />
                {calculatedReadTime}
              </span>
            </div>

            <div className="BlogPosting-editorWrapper">
              <Editor
                apiKey={
                  import.meta.env.VITE_TINYMCE_API_KEY ||
                  "8hswbe7bfeeneui9eb9gjgsym8ku30nx5gwre9808ajdzniu"
                }
                value={form.content}
                onEditorChange={(content) => {
                  setForm((prev) => ({ ...prev, content }));
                  if (errors.content) setErrors((prev) => ({ ...prev, content: null }));
                }}
                init={{
                  height: 480,
                  menubar: "edit view insert format tools table",
                  plugins: [
                    "advlist",
                    "autolink",
                    "lists",
                    "link",
                    "image",
                    "charmap",
                    "preview",
                    "anchor",
                    "searchreplace",
                    "visualblocks",
                    "code",
                    "fullscreen",
                    "insertdatetime",
                    "media",
                    "table",
                    "code",
                    "help",
                    "wordcount",
                  ],
                  toolbar:
                    "undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | " +
                    "forecolor backcolor | alignleft aligncenter alignright alignjustify | " +
                    "bullist numlist outdent indent | link image media table | blockquote removeformat | help",
                  content_style:
                    "body { font-family: Inter, Segoe UI, sans-serif; font-size: 15px; color: #263b2e; line-height: 1.6; padding: 12px; } blockquote { border-left: 3px solid #258b32; padding-left: 14px; color: #556b5c; }",
                  placeholder:
                    "Start writing your article here... Discuss machinery features, soil preparation techniques, or farming tips.",
                }}
              />
            </div>
            {errors.content && (
              <span className="BlogPosting-error" style={{ marginTop: "8px", display: "block" }}>
                {errors.content}
              </span>
            )}
          </div>

          {/* SEO MENTION (ROW-WISE) */}
          <div className="BlogPosting-card BlogPosting-seoCard">
            <div className="BlogPosting-cardHeader">
              <div className="BlogPosting-seoHeaderTitle">
                <FiGlobe size={18} className="BlogPosting-seoIcon" />
                <h3>SEO Mention</h3>
              </div>
            </div>

            <div className="BlogPosting-seoFields">
              {/* Row 1: Meta Title */}
              <div className="BlogPosting-formGroup">
                <div className="BlogPosting-labelBetween">
                  <label className="BlogPosting-label">Meta Title</label>
                  <span className="BlogPosting-charCount">
                    {form.metaTitle.length} / 60 chars
                  </span>
                </div>
                <input
                  type="text"
                  className="BlogPosting-input"
                  placeholder="e.g. Modern Agriculture Guide | Rhinco"
                  value={form.metaTitle}
                  onChange={(e) => setForm((prev) => ({ ...prev, metaTitle: e.target.value }))}
                />
              </div>

              {/* Row 2: Meta Keyword */}
              <div className="BlogPosting-formGroup">
                <div className="BlogPosting-labelBetween">
                  <label className="BlogPosting-label">Meta Keyword</label>
                  <span className="BlogPosting-charCount">Comma separated</span>
                </div>
                <input
                  type="text"
                  className="BlogPosting-input"
                  placeholder="e.g. farming, tractors, machinery, agriculture"
                  value={form.metaKeywords}
                  onChange={(e) => setForm((prev) => ({ ...prev, metaKeywords: e.target.value }))}
                />
              </div>

              {/* Row 3: Meta Description */}
              <div className="BlogPosting-formGroup">
                <div className="BlogPosting-labelBetween">
                  <label className="BlogPosting-label">Meta Description</label>
                  <span className="BlogPosting-charCount">
                    {form.metaDescription.length} / 160 chars
                  </span>
                </div>
                <textarea
                  rows={2}
                  className="BlogPosting-textarea"
                  placeholder="Concise search summary snippet shown on search engine results..."
                  value={form.metaDescription}
                  onChange={(e) => setForm((prev) => ({ ...prev, metaDescription: e.target.value }))}
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: PUBLISHING SETTINGS & DYNAMIC CATEGORIES (30%) */}
        <div className="BlogPosting-sideCol">
          {/* PUBLISH STATUS CARD */}
          <div className="BlogPosting-card">
            <div className="BlogPosting-cardHeader">
              <h3>Publishing Status</h3>
              <span
                className={`BlogPosting-statusTag ${
                  form.status === "Published" ? "tag--published" : "tag--draft"
                }`}
              >
                {form.status}
              </span>
            </div>

            <div className="BlogPosting-formGroup">
              <label className="BlogPosting-label">Post Status</label>
              <select
                className="BlogPosting-select"
                value={form.status}
                onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
              >
                <option value="Published">Published (Live)</option>
                <option value="Draft">Draft (Hidden)</option>
              </select>
            </div>

            <div className="BlogPosting-formGroup">
              <label className="BlogPosting-label">Publication Date</label>
              <input
                type="date"
                className="BlogPosting-input"
                value={form.publishDate}
                onChange={(e) => setForm((prev) => ({ ...prev, publishDate: e.target.value }))}
              />
            </div>

            {/* Featured Article Toggle */}
            <label className="BlogPosting-toggleRow">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setForm((prev) => ({ ...prev, featured: e.target.checked }))}
              />
              <div className="BlogPosting-toggleText">
                <strong>Featured Article</strong>
                <small>Pin this post to the top of the blog page</small>
              </div>
            </label>
          </div>

          {/* DYNAMIC CATEGORY CARD */}
          <div className="BlogPosting-card">
            <div className="BlogPosting-cardHeader">
              <h3>Category & Taxonomy</h3>
              <FiLayers size={17} className="BlogPosting-iconMuted" />
            </div>

            <div className="BlogPosting-formGroup">
              <div className="BlogPosting-labelBetween">
                <label className="BlogPosting-label">
                  Category (from Database) <span className="req">*</span>
                </label>
                <button
                  type="button"
                  className="BlogPosting-inlineAddBtn"
                  onClick={() => setShowAddCat(!showAddCat)}
                >
                  <FiPlus size={13} /> {showAddCat ? "Cancel" : "Add New"}
                </button>
              </div>

              {showAddCat ? (
                <div className="BlogPosting-newCatBox">
                  <input
                    type="text"
                    placeholder="Enter new category name..."
                    value={newCatInput}
                    onChange={(e) => setNewCatInput(e.target.value)}
                  />
                  <button type="button" onClick={handleAddCategory}>
                    Save
                  </button>
                </div>
              ) : categories.length === 0 ? (
                <div style={{ fontSize: "13px", color: "#64748b", margin: "6px 0" }}>
                  No categories in database yet. Click "Add New" or visit{" "}
                  <Link to="/category" style={{ color: "#258b32", fontWeight: 600 }}>
                    Category
                  </Link>
                  .
                </div>
              ) : (
                <select
                  className="BlogPosting-select"
                  value={form.category}
                  onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                >
                  <option value="">-- Select Category --</option>
                  {categories.map((cat) => (
                    <option key={cat._id || cat.name} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              )}
              {errors.category && (
                <span className="BlogPosting-error">{errors.category}</span>
              )}
            </div>

            {/* Tags Input */}
            <div className="BlogPosting-formGroup">
              <label className="BlogPosting-label">Tags</label>
              <div className="BlogPosting-tagInputRow">
                <input
                  type="text"
                  placeholder="Add tag..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  className="BlogPosting-tagInputBox"
                />
                <button
                  type="button"
                  onClick={executeAddTag}
                  className="BlogPosting-tagAddBtn"
                >
                  <FiPlus size={14} /> Add
                </button>
              </div>

              {form.tags && form.tags.length > 0 && (
                <div className="BlogPosting-tagContainer">
                  {form.tags.map((t, idx) => (
                    <span key={idx} className="BlogPosting-tagChip">
                      #{t}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(t)}
                        className="BlogPosting-tagRemove"
                        title="Remove tag"
                      >
                        <FiX size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* FEATURED BANNER IMAGE CARD */}
          <div className="BlogPosting-card">
            <div className="BlogPosting-cardHeader">
              <h3>Featured Banner Image <span className="req">*</span></h3>
              <FiImage size={17} className="BlogPosting-iconMuted" />
            </div>

            {form.image ? (
              <div className="BlogPosting-imagePreviewContainer">
                <img src={form.image} alt="Featured Banner" />
                <div className="BlogPosting-imageOverlay">
                  <button
                    type="button"
                    className="BlogPosting-overlayBtn"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Change Image
                  </button>
                  <button
                    type="button"
                    className="BlogPosting-overlayBtn removeBtn"
                    onClick={() => setForm((prev) => ({ ...prev, image: "" }))}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <div
                className={`BlogPosting-dropzone ${errors.image ? "has-error" : ""}`}
                onClick={() => fileInputRef.current?.click()}
              >
                <FiUploadCloud size={36} />
                <strong>Click to upload banner</strong>
                <span>Recommended: 1200 x 630 px (PNG/JPG up to 5MB)</span>
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
            {errors.image && <span className="BlogPosting-error">{errors.image}</span>}

            {/* Image URL fallback */}
            <div className="BlogPosting-formGroup" style={{ marginTop: "14px" }}>
              <label className="BlogPosting-label">Or Image URL</label>
              <input
                type="url"
                className="BlogPosting-input"
                placeholder="https://images.unsplash.com/..."
                value={form.image}
                onChange={(e) => setForm((prev) => ({ ...prev, image: e.target.value }))}
              />
            </div>
          </div>

          {/* AUTHOR DETAILS CARD */}
          <div className="BlogPosting-card">
            <div className="BlogPosting-cardHeader">
              <h3>Author Information</h3>
            </div>

            <div className="BlogPosting-formGroup">
              <label className="BlogPosting-label">Author Name</label>
              <input
                type="text"
                className="BlogPosting-input"
                value={form.author}
                onChange={(e) => setForm((prev) => ({ ...prev, author: e.target.value }))}
              />
            </div>

            <div className="BlogPosting-formGroup">
              <label className="BlogPosting-label">Author Role / Designation</label>
              <input
                type="text"
                className="BlogPosting-input"
                placeholder="e.g. Senior Agronomist"
                value={form.authorRole}
                onChange={(e) => setForm((prev) => ({ ...prev, authorRole: e.target.value }))}
              />
            </div>

            <div className="BlogPosting-formGroup">
              <label className="BlogPosting-label">Author Avatar URL</label>
              <input
                type="url"
                className="BlogPosting-input"
                placeholder="https://..."
                value={form.authorAvatar}
                onChange={(e) => setForm((prev) => ({ ...prev, authorAvatar: e.target.value }))}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPosting;
