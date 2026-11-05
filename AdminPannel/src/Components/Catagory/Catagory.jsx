
import React, { useRef, useState } from "react";
import {
  FiUploadCloud,
  FiEdit2,
  FiTrash2,
  FiImage,
  FiPlus,
  FiX,
  FiLayers,
  FiSearch,
} from "react-icons/fi";

import "./Catagory.css";

const Catagory = () => {
  const fileInputRef = useRef(null);

  const [categoryName, setCategoryName] = useState("");
  const [categoryImage, setCategoryImage] = useState(null);
  const [previewImage, setPreviewImage] = useState("");
  const [categories, setCategories] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");

  // IMAGE UPLOAD
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

    setCategoryImage(file);
    setPreviewImage(URL.createObjectURL(file));
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

  // SUBMIT FORM
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!categoryName.trim()) {
      alert("Please enter category name.");
      return;
    }

    if (!editingId && !categoryImage) {
      alert("Please upload category image.");
      return;
    }

    if (editingId) {
      setCategories((prev) =>
        prev.map((item) =>
          item.id === editingId
            ? {
                ...item,
                name: categoryName.trim(),
                image: previewImage || item.image,
              }
            : item
        )
      );
    } else {
      const newCategory = {
        id: Date.now(),
        name: categoryName.trim(),
        image: previewImage,
      };

      setCategories((prev) => [newCategory, ...prev]);
    }

    resetForm();
  };

  // EDIT CATEGORY
  const handleEdit = (item) => {
    setEditingId(item.id);
    setCategoryName(item.name);
    setPreviewImage(item.image);
    setCategoryImage(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // DELETE CATEGORY
  const handleDelete = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this category?"
    );

    if (!confirmDelete) return;

    setCategories((prev) =>
      prev.filter((item) => item.id !== id)
    );

    if (editingId === id) {
      resetForm();
    }
  };

  // SEARCH
  const filteredCategories = categories.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="Catagory">

      {/* PAGE HEADER */}
      <div className="Catagory-header">
        <div className="Catagory-header-content">
          <div className="Catagory-header-icon">
            <FiLayers />
          </div>

          <div>
            <h2>Category Management</h2>
            <p>
              Create and manage your equipment categories.
            </p>
          </div>
        </div>

        <div className="Catagory-header-count">
          <span>Total Categories</span>
          <strong>{categories.length}</strong>
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
                Enter category details below.
              </p>
            </div>

            {editingId && (
              <span className="Catagory-edit-badge">
                Editing
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
              >
                {editingId ? (
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
              <h3>All Categories</h3>
              <p>
                Manage your existing categories.
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
                {filteredCategories.length > 0 ? (
                  filteredCategories.map((item, index) => (
                    <tr key={item.id}>
                      <td className="Catagory-serial">
                        {String(index + 1).padStart(2, "0")}
                      </td>

                      <td>
                        <div className="Catagory-table-image">
                          <img
                            src={item.image}
                            alt={item.name}
                          />
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
                              handleDelete(item.id)
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
                            : "Add your first category using the form."}
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
