import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import {
  Package,
  UploadCloud,
  X,
  Image,
  Tag,
  DollarSign,
  Box,
  Building2,
  Star,
  CheckCircle2,
  Save,
  Percent,
  Layers,
  Edit,
  Trash2,
  Search,
  Plus,
  RotateCcw,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  Eye,
  Check,
} from "lucide-react";

import "./AddPost.css";
import { API_URL, BACKEND_URL, resolveImageUrl } from "../../utils/apiConfig";

const PRODUCTS_API = `${API_URL}/products`;
const CATEGORIES_API = `${API_URL}/categories`;

// STRICT LIMIT: Max 5 MB per image as required
const MAX_IMAGE_MB = 5;
const MAX_IMAGE_BYTES = MAX_IMAGE_MB * 1024 * 1024;

// Direct FormData upload to backend /api/upload
const uploadImageFile = async (file) => {
  const formData = new FormData();
  formData.append("image", file);
  formData.append("folder", "product");

  const res = await fetch(`${API_URL}/upload?folder=product`, {
    method: "POST",
    body: formData,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) {
    throw new Error(data.message || "Failed to upload image to server.");
  }
  return data.url;
};

const createEmptyForm = () => ({
  category: "",
  title: "",
  companyName: "Rhinco",
  price: "",
  discount: "0",
  stockQuantity: "10",
  description: "",
  bestSeller: false,
});

const AddPost = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState(createEmptyForm);
  const [images, setImages] = useState([]); // [{ id, preview, url, name, size, uploading }]
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [notice, setNotice] = useState({ type: "", text: "" });
  const [imageError, setImageError] = useState("");
  const [createdProduct, setCreatedProduct] = useState(null);

  // Load real categories from backend database
  const loadCategories = async () => {
    setCategoriesLoading(true);
    try {
      const res = await fetch(CATEGORIES_API);
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.data)) {
        setCategories(data.data);
      }
    } catch (err) {
      console.warn("Could not load categories:", err);
    } finally {
      setCategoriesLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // Check URL query ?edit=ID or location.state
  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );
  const editIdFromUrl = searchParams.get("edit");

  useEffect(() => {
    if (location.state?.product) {
      populateProduct(location.state.product);
    } else if (editIdFromUrl) {
      const fetchProduct = async () => {
        try {
          const res = await fetch(`${PRODUCTS_API}/${editIdFromUrl}`);
          const data = await res.json();
          if (res.ok && data.success && data.data) {
            populateProduct(data.data);
          }
        } catch (err) {
          console.error("Failed to fetch product for editing:", err);
        }
      };
      fetchProduct();
    }
  }, [location.state, editIdFromUrl]);

  const populateProduct = (product) => {
    if (!product) return;
    setEditingId(product._id || product.id);
    setForm({
      category: product.category || "",
      title: product.title || product.name || "",
      companyName: product.companyName || product.brand || "Rhinco",
      price: String(product.price || product.oldPrice || ""),
      discount: String(product.discount !== undefined ? product.discount : "0"),
      stockQuantity: String(product.stockQuantity !== undefined ? product.stockQuantity : "10"),
      description: product.description || "",
      bestSeller: Boolean(product.bestSeller),
    });

    const rawImgs = Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : product.image
      ? [product.image]
      : [];

    setImages(
      rawImgs.map((img, idx) => ({
        id: `existing-${idx}-${Date.now()}`,
        url: typeof img === "string" ? img : img.url || img.preview || "",
        preview: typeof img === "string" ? img : img.url || img.preview || "",
        name: `Image ${idx + 1}`,
        uploading: false,
      }))
    );

    setNotice({
      type: "info",
      text: `Now editing: "${product.title || product.name}"`,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Real-time calculated price
  const finalPrice = useMemo(() => {
    const p = Number(form.price) || 0;
    const d = Number(form.discount) || 0;
    return Math.max(0, p - (p * d) / 100);
  }, [form.price, form.discount]);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // IMAGE UPLOADER: Strict 5 MB check, immediate upload to /api/upload
  const handleImageUpload = async (e) => {
    setImageError("");
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const remainingSlots = 5 - images.length;
    if (remainingSlots <= 0) {
      setImageError("Maximum 5 images allowed per product.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const imageFiles = files.filter((f) => f.type.startsWith("image/"));
    if (!imageFiles.length) {
      setImageError("Please upload valid image files (JPG, PNG, WebP).");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // STRICT CHECK: Max 5 MB per file
    const oversized = imageFiles.filter((f) => f.size > MAX_IMAGE_BYTES);
    if (oversized.length > 0) {
      const details = oversized
        .map((f) => `"${f.name}" (${(f.size / (1024 * 1024)).toFixed(2)} MB)`)
        .join(", ");
      const errMsg = `Image size limit exceeded! Files over ${MAX_IMAGE_MB} MB cannot be uploaded. Exceeded: ${details}`;
      setImageError(errMsg);
      setNotice({ type: "error", text: errMsg });
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const toUpload = imageFiles.slice(0, remainingSlots);
    setUploadingImages(true);
    setNotice({ type: "info", text: "Uploading images to server..." });

    for (const file of toUpload) {
      const tempId = `temp-${Date.now()}-${Math.random()}`;
      const localPreview = URL.createObjectURL(file);

      // Add temporary placeholder
      setImages((prev) => [
        ...prev,
        {
          id: tempId,
          preview: localPreview,
          url: "",
          name: file.name,
          size: file.size,
          uploading: true,
        },
      ]);

      try {
        const serverUrl = await uploadImageFile(file);
        setImages((prev) =>
          prev.map((item) =>
            item.id === tempId
              ? {
                  ...item,
                  preview: serverUrl,
                  url: serverUrl,
                  uploading: false,
                }
              : item
          )
        );
      } catch (err) {
        console.error("Upload error:", err);
        setImageError(`Failed to upload "${file.name}": ${err.message}`);
        setImages((prev) => prev.filter((item) => item.id !== tempId));
      }
    }

    setUploadingImages(false);
    setNotice({ type: "success", text: "Images uploaded successfully!" });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (id) => {
    setImageError("");
    setImages((prev) => prev.filter((item) => item.id !== id));
  };

  const resetForm = () => {
    setForm(createEmptyForm());
    setImages([]);
    setEditingId(null);
    setImageError("");
    setNotice({ type: "", text: "" });
    setCreatedProduct(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // SUBMIT FORM TO DATABASE
  const handleSubmit = async (e) => {
    e.preventDefault();

    // STRICT CHECK: Cannot submit if image error is showing
    if (imageError) {
      setNotice({
        type: "error",
        text: `Cannot submit form! Please resolve the upload error first: ${imageError}`,
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setNotice({ type: "", text: "" });

    if (uploadingImages || images.some((img) => img.uploading)) {
      setNotice({
        type: "error",
        text: "Please wait for image uploads to complete before saving.",
      });
      return;
    }

    const readyUrls = images
      .map((img) => img.url)
      .filter((url) => typeof url === "string" && url.startsWith("/uploads"));

    if (readyUrls.length === 0) {
      setImageError("Please upload at least one valid product image.");
      setNotice({
        type: "error",
        text: "Product must have at least one uploaded image.",
      });
      return;
    }

    if (!form.title.trim()) {
      setNotice({ type: "error", text: "Please enter product title." });
      return;
    }
    if (!form.category.trim()) {
      setNotice({ type: "error", text: "Please select or enter category." });
      return;
    }
    if (!form.companyName.trim()) {
      setNotice({ type: "error", text: "Please enter brand or company name." });
      return;
    }
    if (!form.description.trim()) {
      setNotice({ type: "error", text: "Please provide product description." });
      return;
    }

    const numPrice = Number(form.price);
    if (isNaN(numPrice) || numPrice <= 0) {
      setNotice({ type: "error", text: "Please enter a valid positive price." });
      return;
    }

    setIsSubmitting(true);

    const payload = {
      title: form.title.trim(),
      category: form.category.trim(),
      companyName: form.companyName.trim(),
      brand: form.companyName.trim(),
      description: form.description.trim(),
      price: numPrice,
      discount: Number(form.discount) || 0,
      finalPrice: finalPrice,
      stockQuantity: Number(form.stockQuantity) || 1,
      bestSeller: Boolean(form.bestSeller),
      images: readyUrls,
    };

    try {
      const url = editingId
        ? `${PRODUCTS_API}/${editingId}`
        : PRODUCTS_API;
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to save product in database.");
      }

      setCreatedProduct(data.data);
      setNotice({
        type: "success",
        text: editingId
          ? "Product updated successfully in database!"
          : "Product published successfully and live in database!",
      });

      if (!editingId) {
        resetForm();
      }
    } catch (err) {
      console.error("Submission failed:", err);
      setNotice({
        type: "error",
        text: err.message || "An unexpected error occurred while saving.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="AddPost">
      {/* Top Header */}
      <div className="AddPost-header">
        <div className="AddPost-headerLeft">
          <div className="AddPost-headerIcon">
            <Package size={26} />
          </div>
          <div>
            <h2>{editingId ? "Edit Store Product" : "Add New Store Product"}</h2>
            <p>
              Direct end-to-end catalogue management • Max image size: 5 MB per
              file
            </p>
          </div>
        </div>

        <div className="AddPost-headerActions">
          <button
            type="button"
            className="AddPost-resetBtn"
            onClick={resetForm}
            title="Reset form"
          >
            <RotateCcw size={16} />
            <span>Reset Form</span>
          </button>

          <Link to="/products" className="AddPost-manageLink">
            <Box size={16} />
            <span>View All Products</span>
          </Link>
        </div>
      </div>

      {/* Notice Banner */}
      {notice.text && (
        <div className={`AddPost-notice AddPost-notice--${notice.type}`}>
          {notice.type === "success" ? (
            <CheckCircle2 size={18} />
          ) : (
            <AlertCircle size={18} />
          )}
          <span>{notice.text}</span>
          {createdProduct && (
            <a
              href={`http://localhost:5173/products`}
              target="_blank"
              rel="noopener noreferrer"
              className="AddPost-viewLiveBtn"
            >
              <ExternalLink size={14} />
              <span>View On Live Store</span>
            </a>
          )}
        </div>
      )}

      {/* Main Two-Column Layout */}
      <div className="AddPost-layout">
        {/* LEFT COLUMN: The Form */}
        <form onSubmit={handleSubmit} className="AddPost-formCol">
          {/* CARD 1: GENERAL INFORMATION */}
          <div className="AddPost-card">
            <div className="AddPost-cardHeader">
              <div className="AddPost-cardHeaderIcon">
                <Tag size={18} />
              </div>
              <div>
                <h3>General Information</h3>
                <p>Title, brand, and store category</p>
              </div>
            </div>

            <div className="AddPost-cardBody">
              <div className="AddPost-field">
                <label>
                  Product Title * <span className="AddPost-reqNote">(Visible to buyers)</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Heavy Duty Tractor Linkage Pin (Pack of 4)"
                  value={form.title}
                  onChange={(e) => updateField("title", e.target.value)}
                />
              </div>

              <div className="AddPost-row">
                <div className="AddPost-field">
                  <label>
                    <Building2 size={14} />
                    <span>Brand / Manufacturer *</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rhinco, Fieldking, Shaktiman"
                    value={form.companyName}
                    onChange={(e) => updateField("companyName", e.target.value)}
                  />
                </div>

                <div className="AddPost-field">
                  <label>
                    <Layers size={14} />
                    <span>Category *</span>
                  </label>
                  <div className="AddPost-categoryInputWrap">
                    <input
                      type="text"
                      required
                      list="product-categories-list"
                      placeholder="Select or enter category..."
                      value={form.category}
                      onChange={(e) => updateField("category", e.target.value)}
                    />
                    <datalist id="product-categories-list">
                      {categories.map((c) => (
                        <option key={c._id || c.name} value={c.name} />
                      ))}
                      <option value="Spare Parts" />
                      <option value="Tractor Attachments" />
                      <option value="Pumps & Motors" />
                      <option value="Sprayers" />
                      <option value="Blades & Rotary Tools" />
                    </datalist>
                  </div>
                </div>
              </div>

              <div className="AddPost-field">
                <label>Product Description *</label>
                <textarea
                  rows={5}
                  required
                  placeholder="Enter detailed description, key technical benefits, compatibility, and packaging contents..."
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* CARD 2: PRICING & INVENTORY */}
          <div className="AddPost-card">
            <div className="AddPost-cardHeader">
              <div className="AddPost-cardHeaderIcon">
                <DollarSign size={18} />
              </div>
              <div>
                <h3>Pricing & Stock</h3>
                <p>Regular price, discount %, and quantity</p>
              </div>
            </div>

            <div className="AddPost-cardBody">
              <div className="AddPost-pricingGrid">
                <div className="AddPost-field">
                  <label>Regular Price (₹) *</label>
                  <div className="AddPost-inputWithPrefix">
                    <span>₹</span>
                    <input
                      type="number"
                      required
                      min="0"
                      step="any"
                      placeholder="e.g. 1500"
                      value={form.price}
                      onChange={(e) => updateField("price", e.target.value)}
                    />
                  </div>
                </div>

                <div className="AddPost-field">
                  <label>Discount (%)</label>
                  <div className="AddPost-inputWithPrefix">
                    <span>%</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="e.g. 15"
                      value={form.discount}
                      onChange={(e) => updateField("discount", e.target.value)}
                    />
                  </div>
                </div>

                <div className="AddPost-field">
                  <label>Customer Price (Auto-Calculated)</label>
                  <div className="AddPost-calculatedPrice">
                    ₹ {finalPrice.toLocaleString("en-IN")}
                  </div>
                </div>
              </div>

              <div className="AddPost-row">
                <div className="AddPost-field">
                  <label>Stock Quantity Available *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="e.g. 25"
                    value={form.stockQuantity}
                    onChange={(e) => updateField("stockQuantity", e.target.value)}
                  />
                </div>

                <div className="AddPost-field AddPost-field--checkbox">
                  <label className="AddPost-checkboxLabel">
                    <input
                      type="checkbox"
                      checked={form.bestSeller}
                      onChange={(e) =>
                        updateField("bestSeller", e.target.checked)
                      }
                    />
                    <div className="AddPost-checkboxBox">
                      {form.bestSeller && <Check size={14} />}
                    </div>
                    <div>
                      <strong>Mark as Featured / Best Seller</strong>
                      <p>Displays a gold "Best Seller" badge on the product card</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* CARD 3: MEDIA UPLOAD (STRICT 5 MB LIMIT) */}
          <div className="AddPost-card">
            <div className="AddPost-cardHeader">
              <div className="AddPost-cardHeaderIcon">
                <Image size={18} />
              </div>
              <div>
                <h3>Product Images</h3>
                <p>Upload up to 5 images • Max 5 MB per image (JPG, PNG, WebP)</p>
              </div>
            </div>

            <div className="AddPost-cardBody">
              {/* Uploader Dropzone */}
              <div
                className="AddPost-dropzone"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  multiple
                  onChange={handleImageUpload}
                />
                <UploadCloud size={38} className="AddPost-dropzoneIcon" />
                <div className="AddPost-dropzoneText">
                  <h4>Click to upload product image(s)</h4>
                  <p>
                    Maximum size: <strong>5 MB per image</strong>. First image
                    becomes the primary cover.
                  </p>
                </div>
              </div>

              {imageError && (
                <div className="AddPost-imageError">
                  <AlertCircle size={16} />
                  <span>{imageError}</span>
                </div>
              )}

              {/* Uploaded Thumbnail Strip */}
              {images.length > 0 && (
                <div className="AddPost-thumbsGrid">
                  {images.map((img, idx) => (
                    <div
                      key={img.id}
                      className={`AddPost-thumbItem ${
                        img.uploading ? "uploading" : ""
                      }`}
                    >
                      <img
                        src={resolveImageUrl(img.preview || img.url)}
                        alt={`upload-${idx}`}
                        className="AddPost-thumbImg"
                      />
                      {idx === 0 && (
                        <span className="AddPost-primaryTag">Cover</span>
                      )}
                      {img.uploading && (
                        <div className="AddPost-uploadingOverlay">
                          <RefreshCw size={18} className="AddPost-spin" />
                          <span>Uploading</span>
                        </div>
                      )}
                      <button
                        type="button"
                        className="AddPost-thumbDeleteBtn"
                        onClick={() => removeImage(img.id)}
                        title="Remove image"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* SUBMIT BUTTON ROW */}
          <div className="AddPost-submitRow">
            {imageError && (
              <div className="AddPost-submitBlockNotice">
                <AlertCircle size={16} />
                <span>Form submission is blocked: {imageError}</span>
                <button
                  type="button"
                  className="AddPost-dismissErrorBtn"
                  onClick={() => setImageError("")}
                >
                  Dismiss
                </button>
              </div>
            )}
            <button
              type="submit"
              disabled={isSubmitting || uploadingImages || Boolean(imageError)}
              className={`AddPost-submitBtn ${imageError ? "disabled-error" : ""}`}
            >
              <Save size={18} />
              <span>
                {isSubmitting
                  ? "Saving to Database..."
                  : imageError
                  ? "Cannot Submit — Fix Error Above"
                  : editingId
                  ? "Update Product"
                  : "Publish Product to Store →"}
              </span>
            </button>
          </div>
        </form>

        {/* RIGHT COLUMN: Live Card Preview */}
        <aside className="AddPost-previewCol">
          <div className="AddPost-previewCard">
            <div className="AddPost-previewHeader">
              <Eye size={16} />
              <span>Live Buyer Preview</span>
            </div>

            <div className="AddPost-storePreviewMock">
              <div className="AddPost-mockMedia">
                {images.length > 0 ? (
                  <img
                    src={resolveImageUrl(images[0].preview || images[0].url)}
                    alt="preview"
                    className="AddPost-mockImg"
                  />
                ) : (
                  <div className="AddPost-mockPlaceholder">
                    <Package size={36} strokeWidth={1.2} />
                    <span>No Image Uploaded</span>
                  </div>
                )}
                {Number(form.discount) > 0 && (
                  <span className="AddPost-mockDiscount">
                    {form.discount}% OFF
                  </span>
                )}
                {form.bestSeller && (
                  <span className="AddPost-mockBadge">Best Seller</span>
                )}
              </div>

              <div className="AddPost-mockBody">
                <div className="AddPost-mockMeta">
                  <span className="AddPost-mockBrand">
                    {form.companyName || "Rhinco"}
                  </span>
                  <span className="AddPost-mockCat">
                    {form.category || "General Store"}
                  </span>
                </div>

                <h4 className="AddPost-mockTitle">
                  {form.title || "Product Title Goes Here..."}
                </h4>

                <div className="AddPost-mockRating">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={12} fill="#f59e0b" color="#f59e0b" />
                  ))}
                  <span>4.8 (12 Reviews)</span>
                </div>

                <div className="AddPost-mockPriceRow">
                  <div>
                    <span className="AddPost-mockFinalPrice">
                      ₹ {finalPrice.toLocaleString("en-IN")}
                    </span>
                    {Number(form.discount) > 0 && Number(form.price) > 0 && (
                      <del className="AddPost-mockOldPrice">
                        ₹ {Number(form.price).toLocaleString("en-IN")}
                      </del>
                    )}
                  </div>
                  <span className="AddPost-mockStockTag">
                    {Number(form.stockQuantity) > 0 ? "In Stock" : "Out of Stock"}
                  </span>
                </div>
              </div>
            </div>

            <div className="AddPost-uploadLimitsCard">
              <h4>
                <CheckCircle2 size={16} color="#059669" />
                Upload Limits & Integration Specs
              </h4>
              <ul>
                <li>
                  <strong>Images:</strong> Max <strong>5 MB</strong> per file (WebP auto-optimized).
                </li>
                <li>
                  <strong>Database:</strong> Relative path <code>/uploads/product/...</code> stored in MongoDB.
                </li>
                <li>
                  <strong>Real-time Sync:</strong> Saved products appear immediately on <code>http://localhost:5173/products</code>.
                </li>
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default AddPost;
