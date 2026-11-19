import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import {
  Tractor,
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
  FileText,
  File,
  ShieldCheck,
  Zap,
} from "lucide-react";

import "./MachineryEquipment.css";
import { API_URL, BACKEND_URL, resolveImageUrl } from "../../utils/apiConfig";

const MACHINERY_API = `${API_URL}/machinery`;
const CATEGORIES_API = `${API_URL}/categories`;

// STRICT LIMITS AS REQUESTED
const MAX_IMAGE_MB = 5;
const MAX_IMAGE_BYTES = MAX_IMAGE_MB * 1024 * 1024;
const MAX_DOC_MB = 10;
const MAX_DOC_BYTES = MAX_DOC_MB * 1024 * 1024;

// Direct FormData upload for images
const uploadImageFile = async (file) => {
  const formData = new FormData();
  formData.append("image", file);
  formData.append("folder", "machinery");

  const res = await fetch(`${API_URL}/upload?folder=machinery`, {
    method: "POST",
    body: formData,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) {
    throw new Error(data.message || "Failed to upload machinery image to server.");
  }
  return data.url;
};

// Direct FormData upload for documents
const uploadDocumentFile = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", "documents");

  const res = await fetch(`${API_URL}/upload?folder=documents`, {
    method: "POST",
    body: formData,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) {
    throw new Error(data.message || "Failed to upload document to server.");
  }
  return data.url;
};

const createEmptyForm = () => ({
  title: "",
  brandName: "Rhinco",
  modelName: "",
  category: "",
  implementType: "",
  implementPower: "35 - 50 HP",
  price: "",
  discount: "0",
  discountPrice: "",
  warranty: "1 Year Standard",
  status: "Available",
  availableAtStore: "Yes",
  description: "",
  specification: "",
});

const MachineryEquipment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const imageInputRef = useRef(null);
  const docInputRef = useRef(null);

  const [form, setForm] = useState(createEmptyForm);
  const [images, setImages] = useState([]); // [{ id, preview, url, name, size, uploading }]
  const [documents, setDocuments] = useState([]); // [{ id, name, url, size, type, uploading }]
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [notice, setNotice] = useState({ type: "", text: "" });
  const [mediaError, setMediaError] = useState("");
  const [createdMachine, setCreatedMachine] = useState(null);

  // Load categories dynamically from database
  useEffect(() => {
    const loadCategories = async () => {
      setCategoriesLoading(true);
      try {
        const res = await fetch(CATEGORIES_API);
        const data = await res.json();
        if (res.ok && data.success && Array.isArray(data.data)) {
          const sorted = [...data.data].sort((a, b) =>
            (a.name || "").localeCompare(b.name || "")
          );
          setCategories(sorted);
        }
      } catch (err) {
        console.warn("Could not fetch categories:", err);
      } finally {
        setCategoriesLoading(false);
      }
    };
    loadCategories();
  }, []);

  // Check URL query ?edit=ID or location.state
  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );
  const editIdFromUrl = searchParams.get("edit");

  useEffect(() => {
    if (location.state?.equipment) {
      populateMachinery(location.state.equipment);
    } else if (editIdFromUrl) {
      const fetchMachine = async () => {
        try {
          const res = await fetch(`${MACHINERY_API}/${editIdFromUrl}`);
          const data = await res.json();
          if (res.ok && data.success && data.data) {
            populateMachinery(data.data);
          }
        } catch (err) {
          console.error("Failed to load machinery for edit:", err);
        }
      };
      fetchMachine();
    }
  }, [location.state, editIdFromUrl]);

  const populateMachinery = (machine) => {
    if (!machine) return;
    setEditingId(machine._id || machine.id);
    setForm({
      title: machine.title || machine.name || "",
      brandName: machine.brandName || machine.brand || "Rhinco",
      modelName: machine.modelName || "",
      category: machine.category || "Rotavators",
      implementType: machine.implementType || machine.category || "Rotavators",
      implementPower: machine.implementPower || machine.power || "35 - 50 HP",
      price: String(machine.price || ""),
      discount: String(machine.discount !== undefined ? machine.discount : "0"),
      discountPrice: String(machine.discountPrice || ""),
      warranty: machine.warranty || "1 Year Standard",
      status: machine.status || "Available",
      availableAtStore: machine.availableAtStore || "Yes",
      description: machine.description || "",
      specification: machine.specification || "",
    });

    // Populate images
    const rawImages = Array.isArray(machine.machineImages) && machine.machineImages.length > 0
      ? machine.machineImages
      : machine.image
      ? [machine.image]
      : [];

    setImages(
      rawImages.map((img, idx) => ({
        id: `img-${idx}-${Date.now()}`,
        url: typeof img === "string" ? img : img.url || img.data || img.preview || "",
        preview: typeof img === "string" ? img : img.url || img.data || img.preview || "",
        name: `Image ${idx + 1}`,
        uploading: false,
      }))
    );

    // Populate documents
    if (Array.isArray(machine.documents)) {
      setDocuments(
        machine.documents.map((doc, idx) => ({
          id: `doc-${idx}-${Date.now()}`,
          name: typeof doc === "string" ? "Brochure.pdf" : doc.name || `Document ${idx + 1}`,
          url: typeof doc === "string" ? doc : doc.url || doc.path || "",
          size: typeof doc === "object" ? doc.size || 0 : 0,
          uploading: false,
        }))
      );
    }

    setNotice({
      type: "info",
      text: `Now editing: "${machine.title || machine.name}"`,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // Auto-calculated discount price
  const calcDiscountPrice = useMemo(() => {
    const p = Number(form.price) || 0;
    const d = Number(form.discount) || 0;
    if (d > 0) return Math.max(0, p - (p * d) / 100);
    if (form.discountPrice && Number(form.discountPrice) > 0)
      return Number(form.discountPrice);
    return p;
  }, [form.price, form.discount, form.discountPrice]);

  // IMAGE UPLOADER: Strict 5 MB check, uploads to /api/upload?folder=machinery
  const handleImageUpload = async (e) => {
    setMediaError("");
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const remaining = 8 - images.length;
    if (remaining <= 0) {
      setMediaError("Maximum 8 images allowed per machinery item.");
      if (imageInputRef.current) imageInputRef.current.value = "";
      return;
    }

    const imageFiles = files.filter((f) => f.type.startsWith("image/"));
    if (!imageFiles.length) {
      setMediaError("Please select valid image files (JPG, PNG, WebP).");
      if (imageInputRef.current) imageInputRef.current.value = "";
      return;
    }

    // STRICT 5 MB CHECK
    const oversized = imageFiles.filter((f) => f.size > MAX_IMAGE_BYTES);
    if (oversized.length > 0) {
      const details = oversized
        .map((f) => `"${f.name}" (${(f.size / (1024 * 1024)).toFixed(2)} MB)`)
        .join(", ");
      const errMsg = `Image size limit exceeded! Files over ${MAX_IMAGE_MB} MB cannot be uploaded. Exceeded: ${details}`;
      setMediaError(errMsg);
      setNotice({ type: "error", text: errMsg });
      if (imageInputRef.current) imageInputRef.current.value = "";
      return;
    }

    const toUpload = imageFiles.slice(0, remaining);
    setUploadingMedia(true);
    setNotice({ type: "info", text: "Uploading machinery image(s)..." });

    for (const file of toUpload) {
      const tempId = `temp-${Date.now()}-${Math.random()}`;
      const localPreview = URL.createObjectURL(file);

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
              ? { ...item, preview: serverUrl, url: serverUrl, uploading: false }
              : item
          )
        );
      } catch (err) {
        console.error("Machinery image upload failed:", err);
        setMediaError(`Failed to upload "${file.name}": ${err.message}`);
        setImages((prev) => prev.filter((item) => item.id !== tempId));
      }
    }

    setUploadingMedia(false);
    setNotice({ type: "success", text: "Images uploaded successfully!" });
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  // DOCUMENT UPLOADER: Strict 10 MB check, uploads to /api/upload?folder=documents
  const handleDocUpload = async (e) => {
    setMediaError("");
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    // STRICT 10 MB CHECK
    const oversized = files.filter((f) => f.size > MAX_DOC_BYTES);
    if (oversized.length > 0) {
      const details = oversized
        .map((f) => `"${f.name}" (${(f.size / (1024 * 1024)).toFixed(2)} MB)`)
        .join(", ");
      const errMsg = `Document size limit exceeded! Files over ${MAX_DOC_MB} MB cannot be uploaded. Exceeded: ${details}`;
      setMediaError(errMsg);
      setNotice({ type: "error", text: errMsg });
      if (docInputRef.current) docInputRef.current.value = "";
      return;
    }

    setUploadingMedia(true);
    setNotice({ type: "info", text: "Uploading document / brochure..." });

    for (const file of files) {
      const tempId = `temp-doc-${Date.now()}-${Math.random()}`;

      setDocuments((prev) => [
        ...prev,
        {
          id: tempId,
          name: file.name,
          url: "",
          size: file.size,
          uploading: true,
        },
      ]);

      try {
        const serverUrl = await uploadDocumentFile(file);
        setDocuments((prev) =>
          prev.map((item) =>
            item.id === tempId
              ? { ...item, url: serverUrl, uploading: false }
              : item
          )
        );
      } catch (err) {
        console.error("Document upload failed:", err);
        setMediaError(`Failed to upload document "${file.name}": ${err.message}`);
        setDocuments((prev) => prev.filter((item) => item.id !== tempId));
      }
    }

    setUploadingMedia(false);
    setNotice({ type: "success", text: "Document(s) uploaded successfully!" });
    if (docInputRef.current) docInputRef.current.value = "";
  };

  const removeImage = (id) => {
    setMediaError("");
    setImages((prev) => prev.filter((item) => item.id !== id));
  };

  const removeDocument = (id) => {
    setMediaError("");
    setDocuments((prev) => prev.filter((item) => item.id !== id));
  };

  const resetForm = () => {
    setForm(createEmptyForm());
    setImages([]);
    setDocuments([]);
    setEditingId(null);
    setMediaError("");
    setNotice({ type: "", text: "" });
    setCreatedMachine(null);
    if (imageInputRef.current) imageInputRef.current.value = "";
    if (docInputRef.current) docInputRef.current.value = "";
  };

  // SUBMIT FORM TO DATABASE
  const handleSubmit = async (e) => {
    e.preventDefault();

    // STRICT CHECK: Cannot submit if media error is showing
    if (mediaError) {
      setNotice({
        type: "error",
        text: `Cannot submit form! Please resolve the file size error: ${mediaError}`,
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setNotice({ type: "", text: "" });

    if (uploadingMedia || images.some((img) => img.uploading)) {
      setNotice({
        type: "error",
        text: "Please wait for media uploads to finish before submitting.",
      });
      return;
    }

    const readyImageUrls = images
      .map((img) => img.url)
      .filter((url) => typeof url === "string" && url.startsWith("/uploads"));

    if (readyImageUrls.length === 0) {
      setMediaError("Please upload at least one machinery image.");
      setNotice({
        type: "error",
        text: "Machinery equipment must have at least one uploaded photo.",
      });
      return;
    }

    if (!form.title.trim()) {
      setNotice({ type: "error", text: "Please enter machinery title." });
      return;
    }
    if (!form.brandName.trim()) {
      setNotice({ type: "error", text: "Please enter brand name." });
      return;
    }
    if (!form.category.trim()) {
      setNotice({ type: "error", text: "Please select machinery category." });
      return;
    }
    if (!form.description.trim()) {
      setNotice({ type: "error", text: "Please provide equipment description." });
      return;
    }

    const numPrice = Number(form.price);
    if (isNaN(numPrice) || numPrice <= 0) {
      setNotice({ type: "error", text: "Please enter a valid price." });
      return;
    }

    const readyDocs = documents
      .filter((d) => d.url && d.url.startsWith("/uploads"))
      .map((d) => ({
        name: d.name || "Technical Brochure",
        url: d.url,
        size: d.size || 0,
      }));

    setIsSubmitting(true);

    const payload = {
      title: form.title.trim(),
      brandName: form.brandName.trim(),
      brand: form.brandName.trim(),
      modelName: form.modelName.trim(),
      category: form.category.trim(),
      implementType: form.implementType.trim() || form.category.trim(),
      implementPower: form.implementPower.trim(),
      powerRequirement: form.implementPower.trim(),
      price: numPrice,
      discount: Number(form.discount) || 0,
      discountPrice: calcDiscountPrice,
      warranty: form.warranty.trim() || "1 Year Standard",
      status: form.status,
      availableAtStore: form.availableAtStore,
      description: form.description.trim(),
      specification: form.specification.trim(),
      machineImages: readyImageUrls,
      documents: readyDocs,
    };

    try {
      const url = editingId
        ? `${MACHINERY_API}/${editingId}`
        : MACHINERY_API;
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to save machinery in database.");
      }

      setCreatedMachine(data.data);
      setNotice({
        type: "success",
        text: editingId
          ? "Machinery specifications updated successfully in database!"
          : "Machinery equipment published successfully and live in database!",
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
    <div className="AddMachinery">
      {/* Top Header */}
      <div className="AddMachinery-header">
        <div className="AddMachinery-headerLeft">
          <div className="AddMachinery-headerIcon">
            <Tractor size={26} />
          </div>
          <div>
            <h2>
              {editingId
                ? "Edit Machinery & Heavy Equipment"
                : "Add New Machinery & Equipment"}
            </h2>
            <p>
              Full specifications, tractor HP, dealer delivery • Image max: 5 MB
              • Doc max: 10 MB
            </p>
          </div>
        </div>

        <div className="AddMachinery-headerActions">
          <button
            type="button"
            className="AddMachinery-resetBtn"
            onClick={resetForm}
            title="Reset form"
          >
            <RotateCcw size={16} />
            <span>Reset Form</span>
          </button>

          <Link
            to="/machinery-equipment"
            className="AddMachinery-manageLink"
          >
            <Box size={16} />
            <span>View All Machinery</span>
          </Link>
        </div>
      </div>

      {/* Notice Banner */}
      {notice.text && (
        <div
          className={`AddMachinery-notice AddMachinery-notice--${notice.type}`}
        >
          {notice.type === "success" ? (
            <CheckCircle2 size={18} />
          ) : (
            <AlertCircle size={18} />
          )}
          <span>{notice.text}</span>
          {createdMachine && (
            <a
              href={`http://localhost:5173/machinery`}
              target="_blank"
              rel="noopener noreferrer"
              className="AddMachinery-viewLiveBtn"
            >
              <ExternalLink size={14} />
              <span>View On Live Catalogue</span>
            </a>
          )}
        </div>
      )}

      {/* 2-Column Main Layout */}
      <div className="AddMachinery-layout">
        {/* LEFT COLUMN: The Form */}
        <form onSubmit={handleSubmit} className="AddMachinery-formCol">
          {/* CARD 1: GENERAL & MODEL SPECIFICATIONS */}
          <div className="AddMachinery-card">
            <div className="AddMachinery-cardHeader">
              <div className="AddMachinery-cardHeaderIcon">
                <Tag size={18} />
              </div>
              <div>
                <h3>General & Model Specifications</h3>
                <p>Machine name, manufacturer brand, and model code</p>
              </div>
            </div>

            <div className="AddMachinery-cardBody">
              <div className="AddMachinery-field">
                <label>
                  Machine Title * <span className="AddMachinery-reqNote">(e.g. Fieldking Multi-Crop Super Seeder 7 Feet)</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fieldking Multi-Crop Super Seeder 7 Feet"
                  value={form.title}
                  onChange={(e) => updateField("title", e.target.value)}
                />
              </div>

              <div className="AddMachinery-row">
                <div className="AddMachinery-field">
                  <label>
                    <Building2 size={14} />
                    <span>Brand / OEM Manufacturer *</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Fieldking, Rhinco, Shaktiman"
                    value={form.brandName}
                    onChange={(e) => updateField("brandName", e.target.value)}
                  />
                </div>

                <div className="AddMachinery-field">
                  <label>
                    <span>Model Name / Code</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. FKMS-7F"
                    value={form.modelName}
                    onChange={(e) => updateField("modelName", e.target.value)}
                  />
                </div>
              </div>

              <div className="AddMachinery-row">
                <div className="AddMachinery-field">
                  <label>
                    <Layers size={14} />
                    <span>Category / Implement Type *</span>
                  </label>
                  <select
                    required
                    value={form.category}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateField("category", val);
                      updateField("implementType", val);
                    }}
                  >
                    <option value="">
                      {categoriesLoading
                        ? "Loading categories from database..."
                        : `-- Select Category --`}
                    </option>
                    {categories.map((c) => (
                      <option key={c._id || c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                    {form.category &&
                      !categories.some(
                        (c) =>
                          c.name?.toLowerCase().trim() ===
                          form.category?.toLowerCase().trim()
                      ) && (
                        <option value={form.category}>{form.category}</option>
                      )}
                  </select>
                </div>

                <div className="AddMachinery-field">
                  <label>
                    <Zap size={14} />
                    <span>Tractor Power Required *</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 45 - 55 HP"
                    value={form.implementPower}
                    onChange={(e) => updateField("implementPower", e.target.value)}
                  />
                </div>
              </div>

              <div className="AddMachinery-field">
                <label>Detailed Machine Overview & Field Benefits *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Explain high performance field capabilities, soil compatibility, fuel efficiency, and government subsidy eligibility..."
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value)}
                />
              </div>

              <div className="AddMachinery-field">
                <label>Technical Specifications (Specs Sheet)</label>
                <textarea
                  rows={4}
                  placeholder="e.g. Number of Blades: 48, Working Width: 2.1m, Gearbox: Multi-Speed Heavy Duty, Weight: 480 kg..."
                  value={form.specification}
                  onChange={(e) => updateField("specification", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* CARD 2: PRICING, WARRANTY & DEALER STATUS */}
          <div className="AddMachinery-card">
            <div className="AddMachinery-cardHeader">
              <div className="AddMachinery-cardHeaderIcon">
                <DollarSign size={18} />
              </div>
              <div>
                <h3>Ex-Showroom Price & Availability</h3>
                <p>Ex-showroom pricing, subsidy discounts, and stock status</p>
              </div>
            </div>

            <div className="AddMachinery-cardBody">
              <div className="AddMachinery-pricingGrid">
                <div className="AddMachinery-field">
                  <label>Ex-Showroom Price (₹) *</label>
                  <div className="AddMachinery-inputWithPrefix">
                    <span>₹</span>
                    <input
                      type="number"
                      required
                      min="0"
                      step="any"
                      placeholder="e.g. 175000"
                      value={form.price}
                      onChange={(e) => updateField("price", e.target.value)}
                    />
                  </div>
                </div>

                <div className="AddMachinery-field">
                  <label>Subsidy / Discount (%)</label>
                  <div className="AddMachinery-inputWithPrefix">
                    <span>%</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="e.g. 10"
                      value={form.discount}
                      onChange={(e) => updateField("discount", e.target.value)}
                    />
                  </div>
                </div>

                <div className="AddMachinery-field">
                  <label>Discounted Price (₹)</label>
                  <div className="AddMachinery-calculatedPrice">
                    ₹ {calcDiscountPrice.toLocaleString("en-IN")}
                  </div>
                </div>
              </div>

              <div className="AddMachinery-row">
                <div className="AddMachinery-field">
                  <label>
                    <ShieldCheck size={14} />
                    <span>Warranty Duration</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 1 Year Standard / 2 Years Comprehensive"
                    value={form.warranty}
                    onChange={(e) => updateField("warranty", e.target.value)}
                  />
                </div>

                <div className="AddMachinery-field">
                  <label>Status at Dealership</label>
                  <select
                    value={form.status}
                    onChange={(e) => updateField("status", e.target.value)}
                  >
                    <option value="Available">Available (Ready Stock)</option>
                    <option value="On Order">On Order (Fabrication Queue)</option>
                    <option value="Reserved">Reserved</option>
                    <option value="Sold">Sold</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* CARD 3: MACHINERY PHOTOS (STRICT 5 MB LIMIT) */}
          <div className="AddMachinery-card">
            <div className="AddMachinery-cardHeader">
              <div className="AddMachinery-cardHeaderIcon">
                <Image size={18} />
              </div>
              <div>
                <h3>Machinery Photos</h3>
                <p>Upload up to 8 photos • Max 5 MB per image (JPG, PNG, WebP)</p>
              </div>
            </div>

            <div className="AddMachinery-cardBody">
              <div
                className="AddMachinery-dropzone"
                onClick={() => imageInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={imageInputRef}
                  style={{ display: "none" }}
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  multiple
                  onChange={handleImageUpload}
                />
                <UploadCloud size={38} className="AddMachinery-dropzoneIcon" />
                <div className="AddMachinery-dropzoneText">
                  <h4>Click to upload machine photo(s)</h4>
                  <p>
                    Maximum size: <strong>5 MB per image</strong>. First photo
                    is used as the catalogue thumbnail.
                  </p>
                </div>
              </div>

              {images.length > 0 && (
                <div className="AddMachinery-thumbsGrid">
                  {images.map((img, idx) => (
                    <div
                      key={img.id}
                      className={`AddMachinery-thumbItem ${
                        img.uploading ? "uploading" : ""
                      }`}
                    >
                      <img
                        src={resolveImageUrl(img.preview || img.url)}
                        alt={`machine-photo-${idx}`}
                        className="AddMachinery-thumbImg"
                      />
                      {idx === 0 && (
                        <span className="AddMachinery-primaryTag">Cover</span>
                      )}
                      {img.uploading && (
                        <div className="AddMachinery-uploadingOverlay">
                          <RefreshCw size={18} className="AddMachinery-spin" />
                          <span>Uploading</span>
                        </div>
                      )}
                      <button
                        type="button"
                        className="AddMachinery-thumbDeleteBtn"
                        onClick={() => removeImage(img.id)}
                        title="Remove photo"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* CARD 4: TECHNICAL BROCHURES & DOCUMENTS (STRICT 10 MB LIMIT) */}
          <div className="AddMachinery-card">
            <div className="AddMachinery-cardHeader">
              <div className="AddMachinery-cardHeaderIcon">
                <FileText size={18} />
              </div>
              <div>
                <h3>Technical Documents & Brochures</h3>
                <p>Upload PDF specifications, subsidy forms • Max 10 MB per doc</p>
              </div>
            </div>

            <div className="AddMachinery-cardBody">
              <div
                className="AddMachinery-dropzone AddMachinery-dropzone--doc"
                onClick={() => docInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={docInputRef}
                  style={{ display: "none" }}
                  accept=".pdf,.doc,.docx,.xls,.xlsx"
                  multiple
                  onChange={handleDocUpload}
                />
                <FileText size={32} className="AddMachinery-dropzoneIcon" />
                <div className="AddMachinery-dropzoneText">
                  <h4>Click to attach PDF brochures or technical sheets</h4>
                  <p>
                    Maximum size: <strong>10 MB per document</strong> (PDF, DOCX, XLS).
                  </p>
                </div>
              </div>

              {mediaError && (
                <div className="AddMachinery-mediaError">
                  <AlertCircle size={16} />
                  <span>{mediaError}</span>
                </div>
              )}

              {documents.length > 0 && (
                <div className="AddMachinery-docsList">
                  {documents.map((doc) => (
                    <div key={doc.id} className="AddMachinery-docItem">
                      <File size={18} color="#059669" />
                      <div className="AddMachinery-docMeta">
                        <span className="AddMachinery-docName">{doc.name}</span>
                        {doc.size > 0 && (
                          <span className="AddMachinery-docSize">
                            ({(doc.size / (1024 * 1024)).toFixed(2)} MB)
                          </span>
                        )}
                      </div>
                      {doc.uploading ? (
                        <RefreshCw size={14} className="AddMachinery-spin" />
                      ) : (
                        <button
                          type="button"
                          className="AddMachinery-docDeleteBtn"
                          onClick={() => removeDocument(doc.id)}
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <div className="AddMachinery-submitRow">
            {mediaError && (
              <div className="AddMachinery-submitBlockNotice">
                <AlertCircle size={16} />
                <span>Form submission is blocked: {mediaError}</span>
                <button
                  type="button"
                  className="AddMachinery-dismissErrorBtn"
                  onClick={() => setMediaError("")}
                >
                  Dismiss
                </button>
              </div>
            )}
            <button
              type="submit"
              disabled={isSubmitting || uploadingMedia || Boolean(mediaError)}
              className={`AddMachinery-submitBtn ${mediaError ? "disabled-error" : ""}`}
            >
              <Save size={18} />
              <span>
                {isSubmitting
                  ? "Saving to Database..."
                  : mediaError
                  ? "Cannot Submit — Fix Error Above"
                  : editingId
                  ? "Update Machinery"
                  : "Publish Machinery to Catalogue →"}
              </span>
            </button>
          </div>
        </form>

        {/* RIGHT COLUMN: Live Card Preview */}
        <aside className="AddMachinery-previewCol">
          <div className="AddMachinery-previewCard">
            <div className="AddMachinery-previewHeader">
              <Eye size={16} />
              <span>Live Catalogue Preview</span>
            </div>

            <div className="AddMachinery-mockCard">
              <div className="AddMachinery-mockMedia">
                {images.length > 0 ? (
                  <img
                    src={resolveImageUrl(images[0].preview || images[0].url)}
                    alt="preview"
                    className="AddMachinery-mockImg"
                  />
                ) : (
                  <div className="AddMachinery-mockPlaceholder">
                    <Tractor size={40} strokeWidth={1.2} />
                    <span>No Photo Uploaded</span>
                  </div>
                )}
                <span className="AddMachinery-mockSubsidyTag">
                  Subsidy Eligible
                </span>
              </div>

              <div className="AddMachinery-mockBody">
                <div className="AddMachinery-mockMeta">
                  <span className="AddMachinery-mockBrand">
                    {form.brandName || "Rhinco"}
                  </span>
                  <span className="AddMachinery-mockCat">
                    {form.category || "Farm Machinery"}
                  </span>
                </div>

                <h4 className="AddMachinery-mockTitle">
                  {form.title || "Machinery Equipment Title..."}
                </h4>

                <div className="AddMachinery-mockSpecRow">
                  <div>
                    <small>Power HP</small>
                    <strong>{form.implementPower || "35 - 50 HP"}</strong>
                  </div>
                  <div>
                    <small>Warranty</small>
                    <strong>{form.warranty || "1 Year"}</strong>
                  </div>
                </div>

                <div className="AddMachinery-mockFooter">
                  <div className="AddMachinery-mockPrice">
                    <span>
                      {Number(form.price) > 0
                        ? `₹ ${calcDiscountPrice.toLocaleString("en-IN")}`
                        : "Price on Request"}
                    </span>
                    <small>Govt. subsidy available</small>
                  </div>
                  <span className="AddMachinery-mockStatus">
                    {form.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="AddMachinery-uploadLimitsCard">
              <h4>
                <CheckCircle2 size={16} color="#059669" />
                Upload Limits & Integration Specs
              </h4>
              <ul>
                <li>
                  <strong>Images:</strong> Max <strong>5 MB</strong> per file (WebP auto-optimized).
                </li>
                <li>
                  <strong>Documents:</strong> Max <strong>10 MB</strong> per file (PDF, DOCX, XLS).
                </li>
                <li>
                  <strong>Database:</strong> Stored on disk under <code>/uploads/machinery</code> and <code>/uploads/documents</code>.
                </li>
                <li>
                  <strong>Live URL:</strong> Appears directly at <code>http://localhost:5173/machinery</code>.
                </li>
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default MachineryEquipment;
