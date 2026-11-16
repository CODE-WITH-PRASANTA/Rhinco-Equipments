
import React, { useEffect, useRef, useState } from "react";
import {
  FiUploadCloud,
  FiEdit2,
  FiTrash2,
  FiImage,
  FiPlus,
  FiX,
  FiLayers,
  FiSearch,
  FiRefreshCw,
  FiCheckCircle,
} from "react-icons/fi";
import "./Catagory.css";
import { API_ENDPOINTS } from "../../config/api";

const CATEGORIES_API = API_ENDPOINTS.CATEGORIES;

const Catagory = () => {
  const fileInputRef = useRef(null);

  const [categoryName, setCategoryName] = useState("");
  const [categoryImage, setCategoryImage] = useState(null);
  const [previewImage, setPreviewImage] = useState("");
  const [categories, setCategories] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  // Show Toast Helper
  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3500);
  };

  // FETCH ALL CATEGORIES FROM DATABASE
  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch(CATEGORIES_API);
      const result = await res.json();
      if (res.ok && result.success && Array.isArray(result.data)) {
        setCategories(result.data);
      }
    } catch (err) {
      console.error("Error loading categories from database:", err);
      showToast("Could not connect to database. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // IMAGE UPLOAD (Converts to Base64 data URL for persistent database storage)
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPreviewImage(reader.result);
      setCategoryImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // RESET FORM
  const resetForm = () => {
    setCategoryName("");
    setCategoryImage(null);
    setPreviewImage("");
    setEditingId(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // SUBMIT FORM (CREATE OR UPDATE IN DATABASE)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!categoryName.trim()) {
      showToast("Please enter category name.");
      return;
    }

    if (!editingId && !previewImage) {
      showToast("Please upload category image.");
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        const res = await fetch(`${CATEGORIES_API}/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: categoryName.trim(),
            image: previewImage || "",
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || "Failed to update category.");
        }

        showToast(`Category "${categoryName.trim()}" updated successfully in database!`);
      } else {
        const res = await fetch(CATEGORIES_API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: categoryName.trim(),
            image: previewImage || "",
            status: "Active",
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || "Failed to create category.");
        }

        showToast(`Category "${categoryName.trim()}" saved to database successfully!`);
      }

      resetForm();
      await loadCategories();
      // Notify other parts of the admin panel (like Blog Posting category selector)
      window.dispatchEvent(new Event("blog_categories_updated"));
    } catch (err) {
      console.error("Submit error:", err);
      showToast(err.message || "Could not save category.");
    } finally {
      setSubmitting(false);
    }
  };

  // EDIT CATEGORY
  const handleEdit = (item) => {
    setEditingId(item._id || item.id);
    setCategoryName(item.name || "");
    setPreviewImage(item.image || "");
    setCategoryImage(item.image || null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // DELETE CATEGORY FROM DATABASE
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this category from database?"
    );

    if (!confirmDelete) return;

    try {
      const res = await fetch(`${CATEGORIES_API}/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to delete category.");
      }

      showToast("Category deleted successfully from database!");

      if (editingId === id) {
        resetForm();
      }

      await loadCategories();
      window.dispatchEvent(new Event("blog_categories_updated"));
    } catch (err) {
      console.error("Delete error:", err);
      showToast(err.message || "Could not delete category.");
    }
  };

  // SEARCH FILTER
  const filteredCategories = categories.filter((item) =>
    (item.name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="Catagory">
      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className="Catagory-toast">
          <FiCheckCircle size={18} />
          <span>{toast}</span>
        </div>
      )}

      {/* PAGE HEADER */}
      <div className="Catagory-header">
        <div className="Catagory-header-content">
          <div className="Catagory-header-icon">
            <FiLayers />
          </div>

          <div>
            <h2>Category Management</h2>
            <p>
              Create, edit, and manage categories integrated directly with your MongoDB database.
            </p>
          </div>
        </div>

        <div className="Catagory-header-actions">
          <button
            type="button"
            className="Catagory-sync-btn"
            onClick={loadCategories}
            title="Sync categories with database"
          >
            <FiRefreshCw className={loading ? "spin" : ""} />
            <span>Sync</span>
          </button>

          <div className="Catagory-header-count">
            <span>Total Categories</span>
            <strong>{categories.length}</strong>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="Catagory-layout">
        {/* LEFT SIDE - FORM */}
        <div className="Catagory-form-section">
          <div className="Catagory-section-heading">
            <div>
              <h3>
                {editingId ? "Edit Category" : "Add New Category"}
              </h3>
              <p>
                {editingId
                  ? "Update category details and save to database."
                  : "Enter category details to save into MongoDB."}
              </p>
            </div>

            {editingId && (
              <span className="Catagory-edit-badge">
                Editing Mode
              </span>
            )}
          </div>

          <form
            className="Catagory-form"
            onSubmit={handleSubmit}
          >
            {/* IMAGE UPLOAD */}
            <div className="Catagory-field">
              <label className="Catagory-label">
                Category Image <span>*</span>
              </label>

              <div
                className={`Catagory-upload-box ${
                  previewImage ? "has-image" : ""
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                {previewImage ? (
                  <div className="Catagory-image-preview">
                    <img
                      src={previewImage}
                      alt="Category Preview"
                    />

                    <div className="Catagory-image-overlay">
                      <FiUploadCloud />
                      <span>Change Image</span>
                    </div>
                  </div>
                ) : (
                  <div className="Catagory-upload-content">
                    <div className="Catagory-upload-icon">
                      <FiUploadCloud />
                    </div>

                    <h4>Upload Category Image</h4>
                    <p>
                      Click to browse or drag your image here
                    </p>
                    <span>
                      PNG, JPG, JPEG, WEBP (Max 5MB)
                    </span>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  hidden
                />
              </div>
            </div>

            {/* CATEGORY NAME */}
            <div className="Catagory-field">
              <label className="Catagory-label">
                Category Name <span>*</span>
              </label>

              <div className="Catagory-input-wrapper">
                <FiLayers className="Catagory-input-icon" />

                <input
                  type="text"
                  placeholder="Enter category name"
                  value={categoryName}
                  onChange={(e) =>
                    setCategoryName(e.target.value)
                  }
                  required
                />
              </div>
            </div>

            {/* BUTTONS */}
            <div className="Catagory-form-actions">
              <button
                type="submit"
                className="Catagory-submit-btn"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <FiRefreshCw className="spin" /> Saving...
                  </>
                ) : editingId ? (
                  <>
                    <FiEdit2 />
                    Update Category
                  </>
                ) : (
                  <>
                    <FiPlus />
                    Add Category
                  </>
                )}
              </button>

              {editingId && (
                <button
                  type="button"
                  className="Catagory-cancel-btn"
                  onClick={resetForm}
                  disabled={submitting}
                >
                  <FiX />
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* RIGHT SIDE - TABLE */}
        <div className="Catagory-table-section">
          <div className="Catagory-table-header">
            <div>
              <h3>All Database Categories</h3>
              <p>
                Manage your live categories in MongoDB.
              </p>
            </div>

            <div className="Catagory-table-count">
              {categories.length} Total
            </div>
          </div>

          {/* SEARCH */}
          <div className="Catagory-search-wrapper">
            <FiSearch />

            <input
              type="text"
              placeholder="Search categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* TABLE */}
          <div className="Catagory-table-container">
            <table className="Catagory-table">
              <thead>
                <tr>
                  <th>Sl No.</th>
                  <th>Image</th>
                  <th>Category Name</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {loading && categories.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="Catagory-empty-cell">
                      <div className="Catagory-empty-state">
                        <FiRefreshCw className="spin" size={24} style={{ color: "#389b16" }} />
                        <h4>Loading Database Categories...</h4>
                        <p>Fetching records from MongoDB.</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredCategories.length > 0 ? (
                  filteredCategories.map((item, index) => (
                    <tr key={item._id || item.id}>
                      <td className="Catagory-serial">
                        {String(index + 1).padStart(2, "0")}
                      </td>

                      <td>
                        <div className="Catagory-table-image">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                            />
                          ) : (
                            <div className="Catagory-placeholder-img">
                              <FiImage size={18} />
                            </div>
                          )}
                        </div>
                      </td>

                      <td>
                        <span className="Catagory-name">
                          {item.name}
                        </span>
                      </td>

                      <td>
                        <div className="Catagory-action-buttons">
                          <button
                            type="button"
                            className="Catagory-edit-btn"
                            title="Edit Category"
                            onClick={() => handleEdit(item)}
                          >
                            <FiEdit2 />
                          </button>

                          <button
                            type="button"
                            className="Catagory-delete-btn"
                            title="Delete Category"
                            onClick={() =>
                              handleDelete(item._id || item.id)
                            }
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="4"
                      className="Catagory-empty-cell"
                    >
                      <div className="Catagory-empty-state">
                        <FiImage />
                        <h4>No Categories Found</h4>
                        <p>
                          {search
                            ? "Try searching with another category name."
                            : "Add your first category using the form to save into database."}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="Catagory-table-footer">
            Showing {filteredCategories.length} of {categories.length} categories
          </div>
        </div>
      </div>
    </div>
  );
};

export default Catagory;
