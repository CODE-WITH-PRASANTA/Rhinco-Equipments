import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiLayers,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiImage,
  FiUploadCloud,
  FiX,
  FiCheckCircle,
  FiCheck,
  FiAlertTriangle,
  FiFileText,
  FiArrowRight,
  FiRefreshCw,
} from "react-icons/fi";
import "./BlogCategory.css";
import { API_ENDPOINTS } from "../../config/api";

const API_BASE = API_ENDPOINTS.BLOG_CATEGORIES;

const emptyForm = {
  name: "",
  description: "",
  image: "",
  status: "Active",
};

const BlogCategory = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  const fileInputRef = useRef(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 3500);
  };

  // Fetch all categories from backend database
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_BASE);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setCategories(data.data);
      } else {
        setCategories([]);
      }
    } catch (err) {
      console.error("Failed to fetch blog categories:", err);
      showToast("Backend not reachable. Ensure server is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Form handling
  const handleNameChange = (e) => {
    setForm((prev) => ({
      ...prev,
      name: e.target.value,
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image file size should not exceed 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setForm((prev) => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleEditClick = (cat) => {
    setEditingId(cat._id);
    setForm({
      name: cat.name || "",
      description: cat.description || "",
      image: cat.image || "",
      status: cat.status || "Active",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      showToast("Please enter a category name.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        image: form.image,
        status: form.status,
      };

      const url = editingId ? `${API_BASE}/${editingId}` : API_BASE;
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.message || "Operation failed");
      }

      showToast(editingId ? "Category updated successfully!" : "Category saved to database!");
      resetForm();
      fetchCategories();
      // Notify other components (Posting / Management) to update dynamic categories
      window.dispatchEvent(new Event("blog_categories_updated"));
    } catch (err) {
      console.error("Save category error:", err);
      showToast(err.message || "Failed to save category.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Category
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`${API_BASE}/${deleteTarget._id}`, {
        method: "DELETE",
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.message || "Failed to delete category");
      }
      showToast(`Category "${deleteTarget.name}" deleted.`);
      setDeleteTarget(null);
      fetchCategories();
      window.dispatchEvent(new Event("blog_categories_updated"));
    } catch (err) {
      console.error("Delete category error:", err);
      showToast(err.message || "Failed to delete category.");
      setDeleteTarget(null);
    }
  };

  // Filter categories
  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      const matchesSearch =
        !search.trim() ||
        cat.name.toLowerCase().includes(search.toLowerCase()) ||
        cat.slug?.toLowerCase().includes(search.toLowerCase()) ||
        cat.description?.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "ALL" || cat.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [categories, search, statusFilter]);

  // Stats
  const stats = useMemo(() => {
    const total = categories.length;
    const active = categories.filter((c) => c.status === "Active").length;
    const totalPosts = categories.reduce((sum, c) => sum + (c.postCount || 0), 0);
    return { total, active, totalPosts };
  }, [categories]);

  return (
    <div className="BlogCategory">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="BlogCategory-toast">
          <FiCheckCircle size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="BlogCategory-header">
        <div className="BlogCategory-headerLeft">
          <div className="BlogCategory-iconWrapper">
            <FiLayers size={25} />
          </div>
          <div>
            <span className="BlogCategory-eyebrow">BLOG CMS / TAXONOMY</span>
            <h2>Blog Category Management</h2>
            <p>Create, organize, and manage blog categories stored dynamically in the database.</p>
          </div>
        </div>

        <div className="BlogCategory-headerActions">
          <button
            type="button"
            className="BlogCategory-btnSecondary"
            onClick={fetchCategories}
            title="Refresh from Database"
          >
            <FiRefreshCw size={15} className={loading ? "spin" : ""} />
            <span>Sync</span>
          </button>
          <Link to="/blog/new" className="BlogCategory-btnPrimary">
            <FiPlus size={16} />
            <span>Create Article</span>
          </Link>
        </div>
      </div>

      {/* STATS OVERVIEW */}
      <div className="BlogCategory-statsGrid">
        <div className="BlogCategory-statCard">
          <span className="BlogCategory-statLabel">Total Categories</span>
          <h3 className="BlogCategory-statValue">{stats.total}</h3>
          <span className="BlogCategory-statMeta">Stored in database</span>
        </div>
        <div className="BlogCategory-statCard">
          <span className="BlogCategory-statLabel">Active Categories</span>
          <h3 className="BlogCategory-statValue" style={{ color: "#15803d" }}>
            {stats.active}
          </h3>
          <span className="BlogCategory-statMeta">Visible on blog posting</span>
        </div>
        <div className="BlogCategory-statCard">
          <span className="BlogCategory-statLabel">Tagged Articles</span>
          <h3 className="BlogCategory-statValue" style={{ color: "#2563eb" }}>
            {stats.totalPosts}
          </h3>
          <span className="BlogCategory-statMeta">Total linked articles</span>
        </div>
      </div>

      {/* TWO-COLUMN GRID: FORM (LEFT) & TABLE (RIGHT) */}
      <div className="BlogCategory-grid">
        {/* LEFT COLUMN: ADD / EDIT CATEGORY FORM */}
        <div className="BlogCategory-formCard">
          <div className="BlogCategory-cardHeader">
            <h3>{editingId ? "Edit Category" : "Add New Blog Category"}</h3>
            <span className="BlogCategory-badge">
              {editingId ? "Update Mode" : "Database Model"}
            </span>
          </div>

          <form onSubmit={handleSubmit} className="BlogCategory-form">
            {/* Category Name */}
            <div className="BlogCategory-field">
              <label>
                Category Name <span className="req">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Modern Farming, Crop Care..."
                value={form.name}
                onChange={handleNameChange}
                required
              />
            </div>

            {/* Category Image */}
            <div className="BlogCategory-field">
              <label>Category Icon / Image</label>
              {form.image ? (
                <div className="BlogCategory-imagePreview">
                  <img src={form.image} alt="Preview" />
                  <button
                    type="button"
                    className="BlogCategory-imageRemove"
                    onClick={() => setForm((prev) => ({ ...prev, image: "" }))}
                  >
                    <FiX size={15} />
                  </button>
                </div>
              ) : (
                <div
                  className="BlogCategory-dropzone"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <FiUploadCloud size={28} />
                  <span>Upload category icon or image</span>
                  <small>PNG, JPG up to 5MB</small>
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleImageUpload}
              />
            </div>

            {/* Description */}
            <div className="BlogCategory-field">
              <label>Description</label>
              <textarea
                rows={3}
                placeholder="Brief summary of what this category covers..."
                value={form.description}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, description: e.target.value }))
                }
              />
            </div>

            {/* Status */}
            <div className="BlogCategory-field">
              <label>Display Status</label>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, status: e.target.value }))
                }
              >
                <option value="Active">Active (Available for posts)</option>
                <option value="Inactive">Inactive (Hidden)</option>
              </select>
            </div>

            {/* Form Actions */}
            <div className="BlogCategory-formActions">
              {editingId && (
                <button
                  type="button"
                  className="BlogCategory-btnCancel"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="BlogCategory-btnSubmit"
                disabled={isSubmitting}
              >
                <FiCheck size={16} />
                <span>
                  {isSubmitting
                    ? "Saving..."
                    : editingId
                    ? "Update Category"
                    : "Save Category"}
                </span>
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT COLUMN: CATEGORY LIST */}
        <div className="BlogCategory-listCard">
          {/* Card Header & Search */}
          <div className="BlogCategory-listHeader">
            <div>
              <h3>All Categories</h3>
              <p>Dynamic database entries</p>
            </div>

            <div className="BlogCategory-listFilters">
              <div className="BlogCategory-searchWrapper">
                <FiSearch size={15} />
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="BlogCategory-filterSelect"
              >
                <option value="ALL">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Table / List */}
          {loading ? (
            <div className="BlogCategory-empty">
              <p>Loading categories from database...</p>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="BlogCategory-empty">
              <FiLayers size={36} className="BlogCategory-emptyIcon" />
              <h4>No Categories Found</h4>
              <p>
                {search
                  ? "No categories matched your search query."
                  : "Start by adding your first category in the form on the left."}
              </p>
            </div>
          ) : (
            <div className="BlogCategory-tableWrapper">
              <table className="BlogCategory-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Posts</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCategories.map((cat) => (
                    <tr
                      key={cat._id}
                      className={editingId === cat._id ? "is-editing" : ""}
                    >
                      <td>
                        <div className="BlogCategory-catInfo">
                          {cat.image ? (
                            <img
                              src={cat.image}
                              alt=""
                              className="BlogCategory-catThumb"
                            />
                          ) : (
                            <div className="BlogCategory-catThumbPlaceholder">
                              <FiLayers size={16} />
                            </div>
                          )}
                          <div>
                            <strong>{cat.name}</strong>
                            {cat.description && (
                              <small>{cat.description}</small>
                            )}
                          </div>
                        </div>
                      </td>

                      <td>
                        <span
                          className={`BlogCategory-statusBadge ${
                            cat.status === "Active"
                              ? "badge--active"
                              : "badge--inactive"
                          }`}
                        >
                          {cat.status}
                        </span>
                      </td>

                      <td>
                        <span className="BlogCategory-postBadge">
                          {cat.postCount || 0}
                        </span>
                      </td>

                      <td>
                        <div className="BlogCategory-actions">
                          <button
                            type="button"
                            className="BlogCategory-actionBtn"
                            title="Edit Category"
                            onClick={() => handleEditClick(cat)}
                          >
                            <FiEdit2 size={14} />
                          </button>
                          <button
                            type="button"
                            className="BlogCategory-actionBtn actionBtn--danger"
                            title="Delete Category"
                            onClick={() => setDeleteTarget(cat)}
                          >
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      {deleteTarget && (
        <div
          className="BlogCategory-modalOverlay"
          onClick={() => setDeleteTarget(null)}
        >
          <div
            className="BlogCategory-confirmModal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="BlogCategory-confirmIcon">
              <FiAlertTriangle size={28} />
            </div>
            <h3>Delete Category?</h3>
            <p>
              Are you sure you want to permanently delete category{" "}
              <strong>"{deleteTarget.name}"</strong> from the database?
            </p>
            <div className="BlogCategory-confirmActions">
              <button
                type="button"
                className="BlogCategory-btnCancel"
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="BlogCategory-btnDanger"
                onClick={handleDeleteConfirm}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogCategory;
