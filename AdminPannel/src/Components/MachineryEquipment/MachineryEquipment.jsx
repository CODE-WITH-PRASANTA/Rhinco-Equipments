import React, { useEffect, useMemo, useRef, useState } from "react";
import { Editor } from "@tinymce/tinymce-react";
import {
  FiPlus, FiSearch, FiEye, FiEdit2, FiTrash2, FiX, FiUploadCloud,
  FiImage, FiGrid, FiCheckCircle, FiFilter, FiChevronLeft,
  FiChevronRight, FiSave, FiRotateCcw, FiLayers, FiFileText,
  FiTag, FiFolder, FiFile, FiExternalLink, FiPackage, FiMapPin,
  FiDollarSign, FiBox, FiTool
} from "react-icons/fi";
import "./MachineryEquipment.css";

const STORAGE_KEY = "rhino_equipment_posts";

const categories = [
  "Excavators",
  "Loaders",
  "Cranes",
  "Earthmoving Equipment",
  "Material Handling",
  "Road Construction",
  "Generators",
  "Agricultural Equipment",
  "Other"
];

const emptyForm = () => ({
  machineImages: [],
  title: "",
  brandName: "",
  modelName: "",
  implementType: "",
  category: "",
  implementPower: "",
  price: "",
  discountPrice: "",
  description: "",
  specification: "",
  documents: [],
  availableAtStore: ""
});

const readFile = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () =>
      resolve({
        name: file.name,
        type: file.type,
        size: file.size,
        data: reader.result
      });

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const formatCurrency = (value) =>
  Number(value || 0).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  });

const formatDate = (date) =>
  date
    ? new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      })
    : "—";

const plainText = (html = "") =>
  html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

const imageSrc = (image) => image?.data || "";

const MachineryEquipment = () => {
  const [activeTab, setActiveTab] = useState("form");

  const [equipments, setEquipments] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [currentPage, setCurrentPage] = useState(1);
  const [notice, setNotice] = useState("");
  const [viewEquipment, setViewEquipment] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [saving, setSaving] = useState(false);

  const imageInputRef = useRef(null);
  const documentInputRef = useRef(null);

  const itemsPerPage = 6;

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(equipments));
    } catch (error) {
      console.error("Equipment storage error:", error);
      setNotice(
        "Browser storage is full. Please use smaller images or connect a backend for larger files."
      );
    }
  }, [equipments]);

  const updateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  // IMAGE UPLOAD
  const handleImages = async (event) => {
    const files = Array.from(event.target.files || []);

    if (!files.length) return;

    const remaining = 6 - form.machineImages.length;

    if (remaining <= 0) {
      setNotice(
        "You can upload a maximum of 6 images (1 main image + 5 additional images)."
      );
      event.target.value = "";
      return;
    }

    const valid = files.filter(
      (file) =>
        file.type.startsWith("image/") &&
        file.size <= 5 * 1024 * 1024
    );

    if (valid.length !== files.length) {
      setNotice("Some files were skipped. Select images up to 5 MB each.");
    }

    const selected = valid.slice(0, remaining);

    try {
      const uploaded = await Promise.all(selected.map(readFile));

      setForm((prev) => ({
        ...prev,
        machineImages: [...prev.machineImages, ...uploaded]
      }));

      if (files.length > remaining) {
        setNotice("Only the remaining image slots were filled.");
      }
    } catch {
      setNotice("Unable to read one or more images.");
    }

    event.target.value = "";
  };

  const removeImage = (index) => {
    setForm((prev) => ({
      ...prev,
      machineImages: prev.machineImages.filter(
        (_, i) => i !== index
      )
    }));
  };

  // DOCUMENT UPLOAD
  const handleDocuments = async (event) => {
    const files = Array.from(event.target.files || []);

    if (!files.length) return;

    const valid = files.filter((file) => {
      const ext = file.name.split(".").pop().toLowerCase();

      return (
        ["pdf", "doc", "docx", "xls", "xlsx"].includes(ext) &&
        file.size <= 10 * 1024 * 1024
      );
    });

    if (valid.length !== files.length) {
      setNotice(
        "Only PDF, DOC, DOCX, XLS and XLSX files up to 10 MB are allowed."
      );
    }

    try {
      const docs = await Promise.all(valid.map(readFile));

      setForm((prev) => ({
        ...prev,
        documents: [...prev.documents, ...docs]
      }));
    } catch {
      setNotice("Unable to read one or more documents.");
    }

    event.target.value = "";
  };

  const removeDocument = (index) => {
    setForm((prev) => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }));
  };

  // RESET FORM
  const openNewForm = () => {
    setForm(emptyForm());
    setEditingId(null);
    setNotice("");
    setActiveTab("form");

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  // EDIT EQUIPMENT
  const openEditForm = (item) => {
    setForm({
      ...emptyForm(),
      ...item,
      machineImages: item.machineImages || [],
      documents: item.documents || []
    });

    setEditingId(item.id);
    setNotice("");
    setActiveTab("form");
    setViewEquipment(null);

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  // SUBMIT FORM
  const handleSubmit = (event) => {
    event.preventDefault();

    if (!form.machineImages.length) {
      return setNotice("Please upload at least one machine image.");
    }

    if (!form.title.trim()) {
      return setNotice("Please enter the machine title.");
    }

    if (!form.brandName.trim()) {
      return setNotice("Please enter the brand name.");
    }

    if (!form.category) {
      return setNotice("Please select a category.");
    }

    if (!plainText(form.description)) {
      return setNotice("Please enter the product description.");
    }

    if (!plainText(form.specification)) {
      return setNotice("Please enter the product specifications.");
    }

    if (form.price === "" || Number(form.price) < 0) {
      return setNotice("Please enter a valid price.");
    }

    if (
      form.discountPrice !== "" &&
      Number(form.discountPrice) < 0
    ) {
      return setNotice("Discount price cannot be negative.");
    }

    if (
      form.discountPrice !== "" &&
      Number(form.discountPrice) > Number(form.price)
    ) {
      return setNotice(
        "Discount price cannot be greater than the original price."
      );
    }

    setSaving(true);

    const now = new Date().toISOString();

    const previous = equipments.find(
      (item) => item.id === editingId
    );

    const data = {
      ...form,
      id: editingId || Date.now(),
      title: form.title.trim(),
      brandName: form.brandName.trim(),
      modelName: form.modelName.trim(),
      implementType: form.implementType.trim(),
      price: Number(form.price),
      discountPrice:
        form.discountPrice === ""
          ? ""
          : Number(form.discountPrice),
      createdAt: previous?.createdAt || now,
      updatedAt: now
    };

    setEquipments((prev) =>
      editingId
        ? prev.map((item) =>
            item.id === editingId ? data : item
          )
        : [data, ...prev]
    );

    setNotice(
      editingId
        ? "Equipment updated successfully."
        : "Equipment added successfully."
    );

    setForm(emptyForm());
    setEditingId(null);
    setCurrentPage(1);
    setActiveTab("table");
    setSaving(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  // DELETE EQUIPMENT
  const confirmDelete = () => {
    setEquipments((prev) =>
      prev.filter((item) => item.id !== deleteId)
    );

    setDeleteId(null);
    setNotice("Equipment deleted successfully.");
  };

  // SEARCH AND FILTER
  const filteredEquipments = useMemo(() => {
    const q = search.trim().toLowerCase();

    return equipments.filter((item) => {
      const matchesQuery =
        !q ||
        [
          item.title,
          item.brandName,
          item.modelName,
          item.implementType,
          item.category,
          item.availableAtStore
        ].some((value) =>
          String(value || "").toLowerCase().includes(q)
        );

      return (
        matchesQuery &&
        (categoryFilter === "All Categories" ||
          item.category === categoryFilter)
      );
    });
  }, [equipments, search, categoryFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredEquipments.length / itemsPerPage)
  );

  const paginatedEquipments = filteredEquipments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalImages = equipments.reduce(
    (total, item) =>
      total + (item.machineImages?.length || 0),
    0
  );

  const totalDocuments = equipments.reduce(
    (total, item) =>
      total + (item.documents?.length || 0),
    0
  );

  const storeListings = equipments.filter(
    (item) => item.availableAtStore === "Yes"
  ).length;

  const editorConfig = {
    height: 260,
    menubar: false,
    plugins: [
      "lists",
      "link",
      "table",
      "wordcount",
      "autolink",
      "code"
    ],
    toolbar:
      "undo redo | blocks | bold italic underline | " +
      "bullist numlist | alignleft aligncenter alignright | " +
      "link table | removeformat",
    branding: false,
    promotion: false,
    content_style:
      "body { font-family: Arial, sans-serif; font-size: 14px; color: #26352b; }"
  };
    return (
    <div className="MachineryEquipment">
      {/* PAGE HEADER */}
      <div className="MachineryEquipment-header">
        <div>
          <span className="MachineryEquipment-eyebrow">
            RHINO'S EQUIPMENT / INVENTORY
          </span>

          <h1>Machinery & Equipment</h1>

          <p>
            Manage your machinery products, pricing, images and specifications.
          </p>
        </div>

        <button
          className="MachineryEquipment-addBtn"
          type="button"
          onClick={openNewForm}
        >
          <FiPlus />
          Add New Equipment
        </button>
      </div>

      {/* NOTIFICATION */}
      {notice && (
        <div className="MachineryEquipment-notice">
          <FiCheckCircle />
          <span>{notice}</span>
          <button
            type="button"
            onClick={() => setNotice("")}
          >
            <FiX />
          </button>
        </div>
      )}

      {/* STATISTICS */}
      <div className="MachineryEquipment-stats">
        <div className="MachineryEquipment-statCard">
          <div className="MachineryEquipment-statIcon">
            <FiPackage />
          </div>
          <div>
            <span>Total Equipment</span>
            <h3>{equipments.length}</h3>
          </div>
        </div>

        <div className="MachineryEquipment-statCard">
          <div className="MachineryEquipment-statIcon">
            <FiImage />
          </div>
          <div>
            <span>Total Images</span>
            <h3>{totalImages}</h3>
          </div>
        </div>

        <div className="MachineryEquipment-statCard">
          <div className="MachineryEquipment-statIcon">
            <FiFileText />
          </div>
          <div>
            <span>Documents</span>
            <h3>{totalDocuments}</h3>
          </div>
        </div>

        <div className="MachineryEquipment-statCard">
          <div className="MachineryEquipment-statIcon">
            <FiMapPin />
          </div>
          <div>
            <span>Available at Store</span>
            <h3>{storeListings}</h3>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="MachineryEquipment-tabs">
        <button
          type="button"
          className={
            activeTab === "form" ? "active" : ""
          }
          onClick={() => setActiveTab("form")}
        >
          <FiPlus />
          {editingId ? "Edit Equipment" : "Add Equipment"}
        </button>

        <button
          type="button"
          className={
            activeTab === "table" ? "active" : ""
          }
          onClick={() => setActiveTab("table")}
        >
          <FiGrid />
          Equipment List
          <span>{equipments.length}</span>
        </button>
      </div>

      {/* ADD / EDIT FORM */}
      {activeTab === "form" && (
        <form
          className="MachineryEquipment-form"
          onSubmit={handleSubmit}
        >
          <div className="MachineryEquipment-formHeading">
            <div>
              <h2>
                {editingId
                  ? "Update Equipment Details"
                  : "Add New Machinery"}
              </h2>
              <p>
                Enter all the required information about your machine.
              </p>
            </div>

            {editingId && (
              <span className="MachineryEquipment-editBadge">
                Editing
              </span>
            )}
          </div>

          {/* IMAGE UPLOAD */}
          <section className="MachineryEquipment-section">
            <div className="MachineryEquipment-sectionTitle">
              <div className="MachineryEquipment-sectionIcon">
                <FiImage />
              </div>

              <div>
                <h3>Machine Images</h3>
                <p>
                  Upload up to 6 images: 1 main image and 5 additional images.
                </p>
              </div>
            </div>

            <div className="MachineryEquipment-uploadGrid">
              {form.machineImages.map((image, index) => (
                <div
                  className="MachineryEquipment-imagePreview"
                  key={`${image.name}-${index}`}
                >
                  <img
                    src={imageSrc(image)}
                    alt={image.name || "Machine"}
                  />

                  <button
                    type="button"
                    className="MachineryEquipment-removeImage"
                    onClick={() => removeImage(index)}
                    title="Remove image"
                  >
                    <FiX />
                  </button>

                  {index === 0 && (
                    <span className="MachineryEquipment-mainImageLabel">
                      Main Image
                    </span>
                  )}
                </div>
              ))}

              {form.machineImages.length < 6 && (
                <button
                  type="button"
                  className="MachineryEquipment-uploadBox"
                  onClick={() => imageInputRef.current?.click()}
                >
                  <FiUploadCloud />
                  <strong>Upload Images</strong>
                  <span>
                    {form.machineImages.length}/6 images
                  </span>
                  <small>PNG, JPG, WEBP · Max 5 MB</small>
                </button>
              )}

              <input
                type="file"
                accept="image/*"
                multiple
                ref={imageInputRef}
                onChange={handleImages}
                hidden
              />
            </div>
          </section>

          {/* BASIC INFORMATION */}
          <section className="MachineryEquipment-section">
            <div className="MachineryEquipment-sectionTitle">
              <div className="MachineryEquipment-sectionIcon">
                <FiPackage />
              </div>

              <div>
                <h3>Basic Machine Information</h3>
                <p>
                  Provide the machine's name, brand, model and category.
                </p>
              </div>
            </div>

            <div className="MachineryEquipment-formGrid">
              <div className="MachineryEquipment-field full">
                <label>
                  Title of the Machine <span>*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter machine title"
                  value={form.title}
                  onChange={(e) =>
                    updateField("title", e.target.value)
                  }
                  required
                />
              </div>

              <div className="MachineryEquipment-field">
                <label>
                  Brand Name <span>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. JCB, Caterpillar, Komatsu"
                  value={form.brandName}
                  onChange={(e) =>
                    updateField("brandName", e.target.value)
                  }
                  required
                />
              </div>

              <div className="MachineryEquipment-field">
                <label>Model Name</label>
                <input
                  type="text"
                  placeholder="Enter model name"
                  value={form.modelName}
                  onChange={(e) =>
                    updateField("modelName", e.target.value)
                  }
                />
              </div>

              <div className="MachineryEquipment-field">
                <label>Implement Type</label>
                <input
                  type="text"
                  placeholder="Enter implement type"
                  value={form.implementType}
                  onChange={(e) =>
                    updateField("implementType", e.target.value)
                  }
                />
              </div>

              <div className="MachineryEquipment-field">
                <label>
                  Category <span>*</span>
                </label>
                <select
                  value={form.category}
                  onChange={(e) =>
                    updateField("category", e.target.value)
                  }
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option
                      value={category}
                      key={category}
                    >
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="MachineryEquipment-field">
                <label>Implement Power</label>
                <input
                  type="text"
                  placeholder="e.g. 75 HP, 55 kW"
                  value={form.implementPower}
                  onChange={(e) =>
                    updateField("implementPower", e.target.value)
                  }
                />
              </div>
            </div>
          </section>

          {/* PRICING */}
          <section className="MachineryEquipment-section">
            <div className="MachineryEquipment-sectionTitle">
              <div className="MachineryEquipment-sectionIcon">
                <FiDollarSign />
              </div>

              <div>
                <h3>Pricing Information</h3>
                <p>
                  Set the original price and discounted selling price.
                </p>
              </div>
            </div>

            <div className="MachineryEquipment-formGrid">
              <div className="MachineryEquipment-field">
                <label>
                  Price (₹) <span>*</span>
                </label>
                <div className="MachineryEquipment-inputWithIcon">
                  <span>₹</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="Enter original price"
                    value={form.price}
                    onChange={(e) =>
                      updateField("price", e.target.value)
                    }
                    required
                  />
                </div>
              </div>

              <div className="MachineryEquipment-field">
                <label>Discount Price (₹)</label>
                <div className="MachineryEquipment-inputWithIcon">
                  <span>₹</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="Enter discount price"
                    value={form.discountPrice}
                    onChange={(e) =>
                      updateField("discountPrice", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          </section>

          {/* DESCRIPTION */}
          <section className="MachineryEquipment-section">
            <div className="MachineryEquipment-sectionTitle">
              <div className="MachineryEquipment-sectionIcon">
                <FiFileText />
              </div>

              <div>
                <h3>Product Description</h3>
                <p>
                  Write a detailed description of the machine.
                </p>
              </div>
            </div>

            <div className="MachineryEquipment-editor">
              <label>
                Description <span>*</span>
              </label>

              <Editor
                apiKey="8hswbe7bfeeneui9eb9gjgsym8ku30nx5gwre9808ajdzniu"
                value={form.description}
                onEditorChange={(value) =>
                  updateField("description", value)
                }
                init={editorConfig}
              />
            </div>
          </section>

          {/* SPECIFICATION */}
          <section className="MachineryEquipment-section">
            <div className="MachineryEquipment-sectionTitle">
              <div className="MachineryEquipment-sectionIcon">
                <FiTool />
              </div>

              <div>
                <h3>Machine Specifications</h3>
                <p>
                  Add technical specifications and machine features.
                </p>
              </div>
            </div>

            <div className="MachineryEquipment-editor">
              <label>
                Specification <span>*</span>
              </label>

              <Editor
                apiKey="8hswbe7bfeeneui9eb9gjgsym8ku30nx5gwre9808ajdzniu"
                value={form.specification}
                onEditorChange={(value) =>
                  updateField("specification", value)
                }
                init={editorConfig}
              />
            </div>
          </section>

          {/* DOCUMENTS */}
          <section className="MachineryEquipment-section">
            <div className="MachineryEquipment-sectionTitle">
              <div className="MachineryEquipment-sectionIcon">
                <FiFileText />
              </div>

              <div>
                <h3>Required Documents</h3>
                <p>
                  Upload brochures, manuals, datasheets or other documents.
                </p>
              </div>
            </div>

            <button
              type="button"
              className="MachineryEquipment-documentUpload"
              onClick={() => documentInputRef.current?.click()}
            >
              <FiUploadCloud />
              <span>
                <strong>Upload Documents</strong>
                <small>PDF, DOC, DOCX, XLS, XLSX · Max 10 MB each</small>
              </span>
            </button>

            <input
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.xls,.xlsx"
              ref={documentInputRef}
              onChange={handleDocuments}
              hidden
            />

            {form.documents.length > 0 && (
              <div className="MachineryEquipment-documentList">
                {form.documents.map((doc, index) => (
                  <div
                    className="MachineryEquipment-documentItem"
                    key={`${doc.name}-${index}`}
                  >
                    <FiFileText />

                    <div>
                      <strong>{doc.name}</strong>
                      <small>
                        {(doc.size / (1024 * 1024)).toFixed(2)} MB
                      </small>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeDocument(index)}
                      title="Remove document"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* STORE AVAILABILITY */}
          <section className="MachineryEquipment-section">
            <div className="MachineryEquipment-sectionTitle">
              <div className="MachineryEquipment-sectionIcon">
                <FiMapPin />
              </div>

              <div>
                <h3>Store Availability</h3>
                <p>
                  Specify whether this machine is available at your store.
                </p>
              </div>
            </div>

            <div className="MachineryEquipment-field">
              <label>Available at Store</label>

              <div className="MachineryEquipment-radioGroup">
                <label>
                  <input
                    type="radio"
                    name="availableAtStore"
                    value="Yes"
                    checked={form.availableAtStore === "Yes"}
                    onChange={(e) =>
                      updateField(
                        "availableAtStore",
                        e.target.value
                      )
                    }
                  />
                  <span>Yes, Available</span>
                </label>

                <label>
                  <input
                    type="radio"
                    name="availableAtStore"
                    value="No"
                    checked={form.availableAtStore === "No"}
                    onChange={(e) =>
                      updateField(
                        "availableAtStore",
                        e.target.value
                      )
                    }
                  />
                  <span>Not Available</span>
                </label>
              </div>
            </div>
          </section>

          {/* FORM ACTIONS */}
          <div className="MachineryEquipment-formActions">
            <button
              type="button"
              className="MachineryEquipment-resetBtn"
              onClick={openNewForm}
            >
              <FiRotateCcw />
              Reset Form
            </button>

            <button
              type="submit"
              className="MachineryEquipment-submitBtn"
              disabled={saving}
            >
              <FiSave />
              {saving
                ? "Saving..."
                : editingId
                ? "Update Equipment"
                : "Submit Equipment"}
            </button>
          </div>
        </form>
      )}
            {/* EQUIPMENT TABLE */}
      {activeTab === "table" && (
        <div className="MachineryEquipment-tableWrapper">
          <div className="MachineryEquipment-tableHeader">
            <div>
              <h2>Equipment Management</h2>
              <p>View, edit and manage all machinery products.</p>
            </div>

            <button
              type="button"
              className="MachineryEquipment-addBtn"
              onClick={openNewForm}
            >
              <FiPlus />
              Add Equipment
            </button>
          </div>

          {/* FILTERS */}
          <div className="MachineryEquipment-filters">
            <div className="MachineryEquipment-search">
              <FiSearch />
              <input
                type="text"
                placeholder="Search equipment, brand or model..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            <div className="MachineryEquipment-categoryFilter">
              <FiFilter />
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="All Categories">All Categories</option>

                {categories.map((category) => (
                  <option value={category} key={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* TABLE */}
          <div className="MachineryEquipment-tableScroll">
            <table className="MachineryEquipment-table">
              <thead>
                <tr>
                  <th>Machine</th>
                  <th>Brand / Model</th>
                  <th>Category</th>
                  <th>Implement Type</th>
                  <th>Power</th>
                  <th>Price</th>
                  <th>Store</th>
                  <th>Files</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {paginatedEquipments.length > 0 ? (
                  paginatedEquipments.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="MachineryEquipment-productCell">
                          {item.machineImages?.[0]?.data ? (
                            <img
                              src={item.machineImages[0].data}
                              alt={item.title}
                            />
                          ) : (
                            <div className="MachineryEquipment-noImage">
                              <FiImage />
                            </div>
                          )}

                          <div>
                            <strong>{item.title}</strong>
                            <small>
                              Added {formatDate(item.createdAt)}
                            </small>
                          </div>
                        </div>
                      </td>

                      <td>
                        <strong>{item.brandName || "—"}</strong>
                        <small className="MachineryEquipment-subText">
                          {item.modelName || "No model"}
                        </small>
                      </td>

                      <td>
                        <span className="MachineryEquipment-categoryBadge">
                          {item.category || "—"}
                        </span>
                      </td>

                      <td>{item.implementType || "—"}</td>

                      <td>{item.implementPower || "—"}</td>

                      <td>
                        <strong>
                          {formatCurrency(
                            item.discountPrice || item.price
                          )}
                        </strong>

                        {item.discountPrice !== "" &&
                          item.discountPrice !== undefined &&
                          Number(item.discountPrice) < Number(item.price) && (
                            <small className="MachineryEquipment-oldPrice">
                              {formatCurrency(item.price)}
                            </small>
                          )}
                      </td>

                      <td>
                        <span
                          className={`MachineryEquipment-storeBadge ${
                            item.availableAtStore === "Yes"
                              ? "available"
                              : "unavailable"
                          }`}
                        >
                          {item.availableAtStore || "Not Set"}
                        </span>
                      </td>

                      <td>
                        <span className="MachineryEquipment-fileCount">
                          <FiImage />
                          {item.machineImages?.length || 0}
                        </span>

                        <span className="MachineryEquipment-fileCount">
                          <FiFileText />
                          {item.documents?.length || 0}
                        </span>
                      </td>

                      <td>
                        <div className="MachineryEquipment-actions">
                          <button
                            type="button"
                            title="View"
                            onClick={() => setViewEquipment(item)}
                          >
                            <FiEye />
                          </button>

                          <button
                            type="button"
                            title="Edit"
                            onClick={() => openEditForm(item)}
                          >
                            <FiEdit2 />
                          </button>

                          <button
                            type="button"
                            title="Delete"
                            onClick={() => setDeleteId(item.id)}
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
                      colSpan="9"
                      className="MachineryEquipment-empty"
                    >
                      <FiPackage />
                      <strong>No equipment found</strong>
                      <span>
                        Add equipment or change your search filters.
                      </span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div className="MachineryEquipment-pagination">
            <span>
              Showing{" "}
              {filteredEquipments.length === 0
                ? 0
                : (currentPage - 1) * itemsPerPage + 1}
              {" - "}
              {Math.min(
                currentPage * itemsPerPage,
                filteredEquipments.length
              )}{" "}
              of {filteredEquipments.length} equipment
            </span>

            <div>
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() =>
                  setCurrentPage((prev) => Math.max(1, prev - 1))
                }
              >
                <FiChevronLeft />
              </button>

              <span>
                {currentPage} / {totalPages}
              </span>

              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(totalPages, prev + 1)
                  )
                }
              >
                <FiChevronRight />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW EQUIPMENT MODAL */}
      {viewEquipment && (
        <div
          className="MachineryEquipment-modalOverlay"
          onClick={() => setViewEquipment(null)}
        >
          <div
            className="MachineryEquipment-viewModal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="MachineryEquipment-modalHeader">
              <div>
                <span>PRODUCT DETAILS</span>
                <h2>{viewEquipment.title}</h2>
              </div>

              <button
                type="button"
                onClick={() => setViewEquipment(null)}
              >
                <FiX />
              </button>
            </div>

            <div className="MachineryEquipment-modalBody">
              {/* IMAGES */}
              <div className="MachineryEquipment-modalImages">
                {viewEquipment.machineImages?.map((image, index) => (
                  <img
                    key={index}
                    src={imageSrc(image)}
                    alt={`${viewEquipment.title} ${index + 1}`}
                  />
                ))}
              </div>

              {/* DETAILS */}
              <div className="MachineryEquipment-detailGrid">
                <div>
                  <span>Brand Name</span>
                  <strong>{viewEquipment.brandName || "—"}</strong>
                </div>

                <div>
                  <span>Model Name</span>
                  <strong>{viewEquipment.modelName || "—"}</strong>
                </div>

                <div>
                  <span>Category</span>
                  <strong>{viewEquipment.category || "—"}</strong>
                </div>

                <div>
                  <span>Implement Type</span>
                  <strong>{viewEquipment.implementType || "—"}</strong>
                </div>

                <div>
                  <span>Implement Power</span>
                  <strong>{viewEquipment.implementPower || "—"}</strong>
                </div>

                <div>
                  <span>Available at Store</span>
                  <strong>
                    {viewEquipment.availableAtStore || "Not Set"}
                  </strong>
                </div>

                <div>
                  <span>Original Price</span>
                  <strong>
                    {formatCurrency(viewEquipment.price)}
                  </strong>
                </div>

                <div>
                  <span>Discount Price</span>
                  <strong>
                    {viewEquipment.discountPrice !== ""
                      ? formatCurrency(viewEquipment.discountPrice)
                      : "No discount"}
                  </strong>
                </div>
              </div>

              {/* DESCRIPTION */}
              <div className="MachineryEquipment-detailSection">
                <h3>Description</h3>
                <div
                  className="MachineryEquipment-richText"
                  dangerouslySetInnerHTML={{
                    __html: viewEquipment.description || "No description added."
                  }}
                />
              </div>

              {/* SPECIFICATIONS */}
              <div className="MachineryEquipment-detailSection">
                <h3>Specifications</h3>
                <div
                  className="MachineryEquipment-richText"
                  dangerouslySetInnerHTML={{
                    __html:
                      viewEquipment.specification ||
                      "No specifications added."
                  }}
                />
              </div>

              {/* DOCUMENTS */}
              <div className="MachineryEquipment-detailSection">
                <h3>Required Documents</h3>

                {viewEquipment.documents?.length ? (
                  <div className="MachineryEquipment-viewDocuments">
                    {viewEquipment.documents.map((doc, index) => (
                      <a
                        href={doc.data}
                        download={doc.name}
                        key={index}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <FiFileText />
                        {doc.name}
                        <FiExternalLink />
                      </a>
                    ))}
                  </div>
                ) : (
                  <p>No documents uploaded.</p>
                )}
              </div>
            </div>

            <div className="MachineryEquipment-modalFooter">
              <button
                type="button"
                className="MachineryEquipment-resetBtn"
                onClick={() => setViewEquipment(null)}
              >
                Close
              </button>

              <button
                type="button"
                className="MachineryEquipment-submitBtn"
                onClick={() => openEditForm(viewEquipment)}
              >
                <FiEdit2 />
                Edit Equipment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION */}
      {deleteId !== null && (
        <div
          className="MachineryEquipment-modalOverlay"
          onClick={() => setDeleteId(null)}
        >
          <div
            className="MachineryEquipment-deleteModal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="MachineryEquipment-deleteIcon">
              <FiTrash2 />
            </div>

            <h3>Delete Equipment?</h3>

            <p>
              Are you sure you want to delete this equipment? This action
              cannot be undone.
            </p>

            <div className="MachineryEquipment-deleteActions">
              <button
                type="button"
                className="MachineryEquipment-resetBtn"
                onClick={() => setDeleteId(null)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="MachineryEquipment-deleteConfirm"
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MachineryEquipment;