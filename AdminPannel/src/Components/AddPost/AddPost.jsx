import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Editor } from "@tinymce/tinymce-react";
import {
  FiPackage,
  FiUploadCloud,
  FiX,
  FiImage,
  FiTag,
  FiDollarSign,
  FiBox,
  FiBriefcase,
  FiStar,
  FiCheckCircle,
  FiSave,
  FiPercent,
  FiLayers,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiPlus,
  FiRotateCcw,
  FiRefreshCw,
} from "react-icons/fi";

import "./AddPost.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
const PRODUCTS_API = `${API_URL}/products`;
const CATEGORIES_API = `${API_URL}/categories`;

const resolveImageUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("blob:") || path.startsWith("data:")) return path;
  return `${BACKEND_URL}${path.startsWith("/") ? path : `/${path}`}`;
};

const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append("image", file);
  formData.append("folder", "product");
  const res = await fetch(`${API_URL}/upload?folder=product`, { method: "POST", body: formData });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || "Failed to upload image");
  return data.url;
};

const createEmptyForm = () => ({
  category: "",
  title: "",
  description: "",
  price: "",
  discount: "0",
  stockQuantity: "",
  companyName: "",
  bestSeller: false,
});

const AddPost = ({ onSubmit }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [images, setImages] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [form, setForm] = useState(createEmptyForm);

  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);

  // LOAD REAL CATEGORIES FROM DATABASE
  const loadCategories = async () => {
    setCategoriesLoading(true);
    try {
      const res = await fetch(CATEGORIES_API);
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.data)) {
        setCategories(data.data);
      }
    } catch (err) {
      console.warn("Could not load categories from backend:", err);
    } finally {
      setCategoriesLoading(false);
    }
  };

  // LOAD REAL PRODUCTS FROM DATABASE
  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(PRODUCTS_API);
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.data)) {
        setProducts(data.data);
      }
    } catch (err) {
      console.error("Error loading products from database:", err);
      setNotice("Could not connect to database. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
    loadProducts();

    window.addEventListener("blog_categories_updated", loadCategories);
    return () => {
      window.removeEventListener("blog_categories_updated", loadCategories);
    };
  }, []);

  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const editIdFromUrl = searchParams.get("edit");

  // CHECK IF EDITING PRODUCT PASSED VIA NAVIGATION STATE OR URL PARAMETER
  useEffect(() => {
    if (location.state?.product) {
      populateEditProduct(location.state.product);
    } else if (editIdFromUrl) {
      const fetchProductToEdit = async () => {
        try {
          const res = await fetch(`${PRODUCTS_API}/${editIdFromUrl}`);
          const data = await res.json();
          if (res.ok && data.success && data.data) {
            populateEditProduct(data.data);
          }
        } catch (err) {
          console.error("Error fetching product for edit:", err);
        }
      };
      fetchProductToEdit();
    }
  }, [location.state, editIdFromUrl]);

  const populateEditProduct = (product) => {
    if (!product) return;
    setForm({
      category: product.category || "",
      title: product.title || product.name || "",
      description: product.description || "",
      price: String(
        product.oldPrice !== undefined
          ? product.oldPrice
          : product.price || ""
      ),
      discount: String(product.discount !== undefined ? product.discount : "0"),
      stockQuantity: String(
        product.stockQuantity !== undefined ? product.stockQuantity : "1"
      ),
      companyName: product.companyName || product.brand || "",
      bestSeller: Boolean(product.bestSeller),
    });

    const rawImages =
      product.images && product.images.length > 0
        ? product.images
        : product.image
        ? [product.image]
        : [];

    const existingImgs = rawImages.map((img, idx) => ({
      id: `${Date.now()}-${idx}`,
      preview:
        typeof img === "string"
          ? img
          : img.preview || img.url || img.data || "",
      name: `Image ${idx + 1}`,
    }));

    setImages(existingImgs);
    setEditingId(product._id || product.id);
    setNotice("Editing product: " + (product.title || product.name));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // PRICE CALCULATION
  const finalPrice = useMemo(() => {
    const price = Number(form.price) || 0;
    const discount = Number(form.discount) || 0;
    return Math.max(0, price - (price * discount) / 100);
  }, [form.price, form.discount]);

  const formatPrice = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(value) || 0);

  // UPDATE FORM FIELD
  const updateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // IMAGE UPLOAD - Convert to Base64 for persistent database storage
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const remaining = 5 - images.length;
    if (remaining <= 0) {
      setNotice("Maximum 5 images are allowed.");
      e.target.value = "";
      return;
    }

    const validFiles = files.filter(
      (file) => file.type.startsWith("image/") && file.size <= 5 * 1024 * 1024
    );

    if (validFiles.length !== files.length) {
      setNotice("Invalid images skipped. Maximum size is 15MB per image.");
    } else {
      setNotice("");
    }

    validFiles.slice(0, remaining).forEach(async (file) => {
      const tempId = `${Date.now()}-${Math.random()}`;
      const localPreview = URL.createObjectURL(file);

      setImages((prev) => [
        ...prev,
        {
          id: tempId,
          preview: localPreview,
          name: file.name,
        },
      ]);

      try {
        const serverUrl = await uploadImage(file);
        setImages((prev) =>
          prev.map((img) =>
            img.id === tempId
              ? { ...img, preview: serverUrl, url: serverUrl }
              : img
          )
        );
      } catch (err) {
        console.error("Product image upload failed:", err);
        setNotice("Failed to upload " + file.name + ": " + err.message);
      }
    });

    e.target.value = "";
  };

  // REMOVE IMAGE
  const removeImage = (id) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  // RESET FORM
  const resetForm = () => {
    setImages([]);
    setForm(createEmptyForm());
    setEditingId(null);
    setNotice("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // SUBMIT PRODUCT TO DATABASE
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!images.length) {
      setNotice("Please upload at least one product image.");
      return;
    }

    if (!form.title.trim() || !form.category || !form.companyName.trim()) {
      setNotice("Please complete all required product information.");
      return;
    }

    if (!form.description.replace(/<[^>]*>/g, "").trim()) {
      setNotice("Please enter product description.");
      return;
    }

    const price = Number(form.price);
    const discount = Number(form.discount);
    const stock = Number(form.stockQuantity);

    if (!Number.isFinite(price) || price <= 0) {
      setNotice("Please enter a valid product price.");
      return;
    }

    if (!Number.isFinite(discount) || discount < 0 || discount > 100) {
      setNotice("Discount must be between 0 and 100.");
      return;
    }

    if (!Number.isInteger(stock) || stock < 0) {
      setNotice("Please enter a valid stock quantity.");
      return;
    }

    const payload = {
      title: form.title.trim(),
      category: form.category,
      companyName: form.companyName.trim(),
      description: form.description,
      price,
      discount,
      finalPrice,
      stockQuantity: stock,
      bestSeller: Boolean(form.bestSeller),
      images: images.map((img) => img.url || img.preview).filter(Boolean),
    };

    try {
      setIsSubmitting(true);

      const url = editingId ? `${PRODUCTS_API}/${editingId}` : PRODUCTS_API;
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.message || "Failed to save product to database.");
      }

      setNotice(
        editingId
          ? `Product "${form.title}" updated successfully in database!`
          : `Product "${form.title}" saved to database successfully!`
      );

      resetForm();
      await loadProducts();
    } catch (error) {
      console.error("Product submission error:", error);
      setNotice(error.message || "Unable to save product. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // EDIT PRODUCT FROM TABLE
  const handleEdit = (product) => {
    populateEditProduct(product);
  };

  // DELETE PRODUCT FROM DATABASE
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product from the database?"
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`${PRODUCTS_API}/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to delete product.");
      }

      setNotice("Product deleted successfully from database.");
      if (editingId === id) {
        resetForm();
      }
      await loadProducts();
    } catch (err) {
      console.error("Delete error:", err);
      setNotice(err.message || "Could not delete product.");
    }
  };

  // SEARCH FILTER
  const filteredProducts = products.filter((product) =>
    [
      product.title,
      product.name,
      product.category,
      product.companyName,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="AddPost">
      {/* HEADER */}
      <div className="AddPost-header">
        <div className="AddPost-headerLeft">
          <div className="AddPost-headerIcon">
            <FiPackage />
          </div>

          <div>
            <h2>{editingId ? "Edit Product" : "Add New Product"}</h2>
            <p>
              Fill out the details below to publish equipment products to MongoDB and your live storefront.
            </p>
          </div>
        </div>

        <div className="AddPost-headerActions">
          <button
            type="button"
            className="AddPost-resetBtn"
            onClick={resetForm}
            title="Clear all fields"
          >
            <FiRotateCcw /> Reset Form
          </button>
        </div>
      </div>

      {/* ALERT NOTICE */}
      {notice && (
        <div className={`AddPost-notice ${notice.includes("successfully") ? "success" : ""}`}>
          <FiCheckCircle />
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice("")}>
            <FiX />
          </button>
        </div>
      )}

      {/* FORM */}
      <form onSubmit={handleSubmit} className="AddPost-form">
        {/* SECTION 1: BASIC INFO */}
        <div className="AddPost-card">
          <div className="AddPost-cardHeader">
            <span className="AddPost-sectionNumber">1</span>
            <span className="AddPost-sectionIcon"><FiLayers /></span>
            <div>
              <h3>Basic Information</h3>
              <p>Enter your product details and category.</p>
            </div>
          </div>

          <div className="AddPost-formGrid">
            <div className="AddPost-field">
              <label>Choose Category <span>*</span></label>
              <div className="AddPost-inputWrap">
                <FiTag />
                <select
                  value={form.category}
                  onChange={(e) => updateField("category", e.target.value)}
                  required
                >
                  <option value="">
                    {categoriesLoading
                      ? "Loading real categories from database..."
                      : "-- Select Category --"}
                  </option>
                  {form.category &&
                    !categories.some(
                      (c) =>
                        (typeof c === "string" ? c : c.name) === form.category
                    ) && (
                      <option value={form.category}>{form.category}</option>
                    )}
                  {categories.map((category) => {
                    const catName =
                      typeof category === "string" ? category : category.name;
                    const catId =
                      typeof category === "string"
                        ? category
                        : category._id || category.id || category.name;
                    return (
                      <option key={catId} value={catName}>
                        {catName}
                      </option>
                    );
                  })}
                </select>
              </div>
              {categories.length === 0 && !categoriesLoading && (
                <small style={{ color: "#d97706", fontSize: "12px", marginTop: "3px" }}>
                  No categories found in database. Create one in{" "}
                  <Link to="/category" style={{ color: "#258b32", fontWeight: 600 }}>
                    Category Management
                  </Link>
                  .
                </small>
              )}
            </div>

            <div className="AddPost-field">
              <label>Product Title <span>*</span></label>
              <div className="AddPost-inputWrap">
                <FiPackage />
                <input
                  type="text"
                  placeholder="Enter product title"
                  value={form.title}
                  maxLength={150}
                  onChange={(e) => updateField("title", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="AddPost-field">
              <label>Manufacturer / Company Name <span>*</span></label>
              <div className="AddPost-inputWrap">
                <FiBriefcase />
                <input
                  type="text"
                  placeholder="e.g. Rhinco Heavy Machinery"
                  value={form.companyName}
                  maxLength={80}
                  onChange={(e) => updateField("companyName", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="AddPost-field">
              <label>Stock Quantity <span>*</span></label>
              <div className="AddPost-inputWrap">
                <FiBox />
                <input
                  type="number"
                  min="0"
                  placeholder="Available inventory units"
                  value={form.stockQuantity}
                  onChange={(e) => updateField("stockQuantity", e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: PRICING */}
        <div className="AddPost-card">
          <div className="AddPost-cardHeader">
            <span className="AddPost-sectionNumber">2</span>
            <span className="AddPost-sectionIcon"><FiDollarSign /></span>
            <div>
              <h3>Pricing & Discounts</h3>
              <p>Set base price and promotional discounts.</p>
            </div>
          </div>

          <div className="AddPost-formGrid">
            <div className="AddPost-field">
              <label>Price (₹) <span>*</span></label>
              <div className="AddPost-inputWrap">
                <FiDollarSign />
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  placeholder="Enter base price"
                  value={form.price}
                  onChange={(e) => updateField("price", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="AddPost-field">
              <label>Discount (%)</label>
              <div className="AddPost-inputWrap">
                <FiPercent />
                <input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="0 - 100%"
                  value={form.discount}
                  onChange={(e) => updateField("discount", e.target.value)}
                />
              </div>
            </div>

            <div className="AddPost-field full">
              <div className="AddPost-pricePreview">
                <div className="AddPost-priceItem">
                  <span>Base Price</span>
                  <strong>{formatPrice(form.price)}</strong>
                </div>

                <div className="AddPost-priceItem">
                  <span>Discount</span>
                  <span className="discount">{Number(form.discount) || 0}% OFF</span>
                </div>

                <div className="AddPost-priceItem total">
                  <span>Customer Final Price</span>
                  <strong>{formatPrice(finalPrice)}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: MEDIA */}
        <div className="AddPost-card">
          <div className="AddPost-cardHeader">
            <span className="AddPost-sectionNumber">3</span>
            <span className="AddPost-sectionIcon"><FiImage /></span>
            <div>
              <h3>Product Media <span>*</span></h3>
              <p>Upload up to 5 clear images of your equipment (Max 5MB each).</p>
            </div>
          </div>

          <div
            className={`AddPost-dropzone ${images.length >= 5 ? "disabled" : ""}`}
            onClick={() => {
              if (images.length < 5) {
                fileInputRef.current?.click();
              }
            }}
          >
            <FiUploadCloud className="AddPost-dropzoneIcon" />
            <h4>Drag & Drop product images here</h4>
            <p>or click to browse files from your computer</p>
            <span>JPG, PNG, WEBP (Max 5MB per file, up to 5 images)</span>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              hidden
              disabled={images.length >= 5}
            />
          </div>

          {images.length > 0 && (
            <div className="AddPost-imageGrid">
              {images.map((image, index) => (
                <div className="AddPost-imageCard" key={image.id}>
                  <img src={resolveImageUrl(image.preview)} alt={`Upload ${index + 1}`} />
                  <div className="AddPost-imageBadge">
                    {index === 0 ? "Main Photo" : `#${index + 1}`}
                  </div>
                  <button
                    type="button"
                    className="AddPost-removeImageBtn"
                    onClick={() => removeImage(image.id)}
                    title="Remove image"
                  >
                    <FiX />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION 4: DESCRIPTION */}
        <div className="AddPost-card">
          <div className="AddPost-cardHeader">
            <span className="AddPost-sectionNumber">4</span>
            <span className="AddPost-sectionIcon"><FiPackage /></span>
            <div>
              <h3>Product Description <span>*</span></h3>
              <p>Provide comprehensive equipment specifications and features.</p>
            </div>
          </div>

          <div className="AddPost-editorWrap">
            <Editor
              key={editingId || "new"}
              tinymceScriptSrc="https://cdnjs.cloudflare.com/ajax/libs/tinymce/6.8.3/tinymce.min.js"
              value={form.description}
              onEditorChange={(content) => updateField("description", content)}
              init={{
                height: 320,
                menubar: false,
                plugins: "advlist autolink lists link charmap preview searchreplace visualblocks code fullscreen insertdatetime table wordcount",
                toolbar: "undo redo | formatselect | bold italic underline forecolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | code",
                content_style: "body { font-family: Inter, Arial, sans-serif; font-size: 14px; color: #1e293b; line-height: 1.6; }",
              }}
            />
          </div>

          <div className="AddPost-toggleRow">
            <label className="AddPost-checkboxLabel">
              <input
                type="checkbox"
                checked={form.bestSeller}
                onChange={(e) => updateField("bestSeller", e.target.checked)}
              />
              <span className="AddPost-customCheck" />
              <div>
                <strong>Mark as Best Seller Equipment</strong>
                <p>Highlights this product with a badge on the store and catalogs.</p>
              </div>
            </label>
          </div>
        </div>

        {/* SUBMIT BUTTON ROW */}
        <div className="AddPost-submitRow">
          {editingId && (
            <button
              type="button"
              className="AddPost-cancelBtn"
              onClick={resetForm}
              disabled={isSubmitting}
            >
              Cancel Edit
            </button>
          )}

          <button
            type="submit"
            className="AddPost-submitButton"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <FiRefreshCw className="spin" /> Saving to Database...
              </>
            ) : (
              <>
                {editingId ? <FiEdit2 /> : <FiPlus />}
                {editingId ? "Update Product in Database" : "Save Product to Database"}
              </>
            )}
          </button>
        </div>
      </form>

      {/* =====================================
          PRODUCT MANAGEMENT TABLE
      ====================================== */}
      <div className="AddPost-tableCard">
        <div className="AddPost-tableHeader">
          <div>
            <h3>All Products in Database</h3>
            <p>Live inventory from MongoDB. Click edit to update or delete to remove.</p>
          </div>

          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <button
              type="button"
              className="AddPost-resetBtn"
              onClick={loadProducts}
              title="Refresh database records"
            >
              <FiRefreshCw className={loading ? "spin" : ""} /> Sync
            </button>
            <span className="AddPost-tableTotal">
              {products.length} Products
            </span>
          </div>
        </div>

        {/* SEARCH */}
        <div className="AddPost-tableToolbar">
          <div className="AddPost-searchBox">
            <FiSearch />
            <input
              type="text"
              placeholder="Search product, category or company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* TABLE */}
        <div className="AddPost-tableWrapper">
          <table className="AddPost-table">
            <thead>
              <tr>
                <th>Sl No.</th>
                <th>Image</th>
                <th>Product Details</th>
                <th>Category</th>
                <th>Price</th>
                <th>Discount</th>
                <th>Final Price</th>
                <th>Stock</th>
                <th>Company</th>
                <th>Best Seller</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {loading && products.length === 0 ? (
                <tr>
                  <td colSpan="11">
                    <div className="AddPost-emptyState">
                      <FiRefreshCw className="spin" size={28} />
                      <h4>Loading Products...</h4>
                      <p>Fetching inventory from MongoDB.</p>
                    </div>
                  </td>
                </tr>
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map((product, index) => {
                  const displayImg =
                    product.images && product.images.length > 0
                      ? typeof product.images[0] === "string"
                        ? product.images[0]
                        : product.images[0].preview || product.images[0].url
                      : product.image || "https://placehold.co/100x80?text=Product";

                  return (
                    <tr key={product._id || product.id}>
                      <td className="AddPost-serial">
                        {String(index + 1).padStart(2, "0")}
                      </td>

                      <td>
                        <div className="AddPost-tableImage">
                          <img
                            src={resolveImageUrl(displayImg)}
                            alt={product.title || product.name}
                            onError={(e) => {
                              e.currentTarget.src = "https://placehold.co/100x80?text=Product";
                            }}
                          />
                        </div>
                      </td>

                      <td>
                        <div className="AddPost-productDetails">
                          <strong>{product.title || product.name}</strong>
                          <span>{product.images?.length || 1} Images</span>
                        </div>
                      </td>

                      <td>
                        <span className="AddPost-categoryBadge">
                          {product.category}
                        </span>
                      </td>

                      <td className="AddPost-originalPrice">
                        {formatPrice(product.price || product.oldPrice)}
                      </td>

                      <td>
                        <span className="AddPost-discountBadge">
                          {product.discount}%
                        </span>
                      </td>

                      <td className="AddPost-tableFinalPrice">
                        {formatPrice(product.finalPrice || product.price)}
                      </td>

                      <td>
                        <span
                          className={`AddPost-stockBadge ${
                            product.stockQuantity > 0 ? "in-stock" : "out-stock"
                          }`}
                        >
                          {product.stockQuantity}
                        </span>
                      </td>

                      <td>{product.companyName}</td>

                      <td>
                        {product.bestSeller ? (
                          <span className="AddPost-bestBadge">
                            <FiStar /> Yes
                          </span>
                        ) : (
                          <span className="AddPost-noBadge">No</span>
                        )}
                      </td>

                      <td>
                        <div className="AddPost-actionButtons">
                          <button
                            type="button"
                            className="AddPost-editAction"
                            title="Edit product"
                            onClick={() => handleEdit(product)}
                          >
                            <FiEdit2 />
                          </button>

                          <button
                            type="button"
                            className="AddPost-deleteAction"
                            title="Delete product"
                            onClick={() => handleDelete(product._id || product.id)}
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="11">
                    <div className="AddPost-emptyState">
                      <FiPackage />
                      <h4>No Products Found</h4>
                      <p>
                        {search
                          ? "Try another search term."
                          : "No products in database yet. Add your first product using the form above."}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="AddPost-tableFooter">
          Showing {filteredProducts.length} of {products.length} products in database
        </div>
      </div>
    </div>
  );
};

export default AddPost;
