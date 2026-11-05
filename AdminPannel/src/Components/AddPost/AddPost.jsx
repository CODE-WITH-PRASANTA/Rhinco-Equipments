
import React, { useEffect, useMemo, useRef, useState } from "react";
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
} from "react-icons/fi";

import "./AddPost.css";

const categories = [
  "Tractors",
  "Rotavators",
  "Cultivators",
  "Disc Harrows",
  "Seed Drills",
  "Ploughs",
  "Harvesting Equipment",
  "Sprayers",
  "Trailers",
  "Tractor Attachments",
  "Other Equipment",
];

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
  const fileInputRef = useRef(null);
  const imagesRef = useRef([]);

  const [images, setImages] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(createEmptyForm);

  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Keep image reference updated
  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  useEffect(() => {
    return () => {
      imagesRef.current.forEach((image) => {
        if (image.preview?.startsWith("blob:")) {
          URL.revokeObjectURL(image.preview);
        }
      });
    };
  }, []);

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

  // UPDATE FORM
  const updateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // IMAGE UPLOAD
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
      (file) =>
        file.type.startsWith("image/") &&
        file.size <= 5 * 1024 * 1024
    );

    if (validFiles.length !== files.length) {
      setNotice("Invalid images skipped. Maximum size is 5MB per image.");
    } else {
      setNotice("");
    }

    const selected = validFiles.slice(0, remaining).map((file) => ({
      id: `${Date.now()}-${Math.random()}`,
      file,
      preview: URL.createObjectURL(file),
    }));

    setImages((prev) => [...prev, ...selected]);
    e.target.value = "";
  };

  // REMOVE IMAGE
  const removeImage = (id) => {
    setImages((prev) => {
      const removed = prev.find((img) => img.id === id);

      if (removed?.preview?.startsWith("blob:")) {
        URL.revokeObjectURL(removed.preview);
      }

      return prev.filter((img) => img.id !== id);
    });
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

  // SUBMIT PRODUCT
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

    const productId = editingId || Date.now();

    const product = {
      id: productId,
      ...form,
      title: form.title.trim(),
      companyName: form.companyName.trim(),
      price,
      discount,
      finalPrice,
      stockQuantity: stock,
      images: images.map((image) => ({
        id: image.id,
        file: image.file || null,
        preview: image.preview,
        name: image.name || image.file?.name || "Product image",
      })),
      updatedAt: new Date().toISOString(),
    };

    const formData = new FormData();

    formData.append("category", product.category);
    formData.append("title", product.title);
    formData.append("description", product.description);
    formData.append("price", String(product.price));
    formData.append("discount", String(product.discount));
    formData.append("finalPrice", String(product.finalPrice));
    formData.append("stockQuantity", String(product.stockQuantity));
    formData.append("companyName", product.companyName);
    formData.append("bestSeller", String(product.bestSeller));

    images.forEach((image) => {
      if (image.file) {
        formData.append("images", image.file);
      }
    });

    try {
      setIsSubmitting(true);

      // Optional backend callback
      if (onSubmit) {
        await onSubmit(formData, product);
      }

      if (editingId) {
        setProducts((prev) =>
          prev.map((item) =>
            item.id === editingId ? product : item
          )
        );
        setNotice("Product updated successfully!");
      } else {
        setProducts((prev) => [product, ...prev]);
        setNotice("Product added successfully!");
      }

      resetForm();
    } catch (error) {
      console.error("Product submission error:", error);
      setNotice("Unable to save product. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // EDIT PRODUCT
  const handleEdit = (product) => {
    setForm({
      category: product.category,
      title: product.title,
      description: product.description,
      price: String(product.price),
      discount: String(product.discount),
      stockQuantity: String(product.stockQuantity),
      companyName: product.companyName,
      bestSeller: product.bestSeller,
    });

    setImages(product.images);
    setEditingId(product.id);
    setNotice("Editing product: " + product.title);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // DELETE PRODUCT
  const handleDelete = (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) return;

    setProducts((prev) => prev.filter((item) => item.id !== id));

    if (editingId === id) {
      resetForm();
    }

    setNotice("Product deleted successfully.");
  };

  // SEARCH
  const filteredProducts = products.filter((product) =>
    [
      product.title,
      product.category,
      product.companyName,
    ]
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
            <span className="AddPost-eyebrow">
              RHINO'S EQUIPMENT
            </span>
            <h2>Product Management</h2>
            <p>Add, edit and manage your equipment products.</p>
          </div>
        </div>

        <div className="AddPost-headerCount">
          <FiLayers />
          <span>Total Products</span>
          <strong>{products.length}</strong>
        </div>
      </div>

      {/* NOTICE */}
      {notice && (
        <div className="AddPost-notice" role="status">
          <FiCheckCircle />
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice("")}>
            <FiX />
          </button>
        </div>
      )}

      {/* PRODUCT FORM */}
      <form className="AddPost-form" onSubmit={handleSubmit}>

        {/* IMAGES */}
        <div className="AddPost-card">
          <div className="AddPost-cardHeader">
            <div className="AddPost-cardHeading">
              <span className="AddPost-sectionIcon"><FiImage /></span>
              <div>
                <h3>Product Images</h3>
                <p>Upload up to 5 product images.</p>
              </div>
            </div>

            <span className="AddPost-imageCount">
              {images.length}/5 Images
            </span>
          </div>

          <div className="AddPost-imageGrid">
            {images.map((image, index) => (
              <div className="AddPost-imageItem" key={image.id}>
                <img src={image.preview} alt={`Product ${index + 1}`} />

                <span className="AddPost-imageNumber">
                  {index === 0 ? "Main Image" : `Image ${index + 1}`}
                </span>

                <button
                  type="button"
                  className="AddPost-removeImage"
                  onClick={() => removeImage(image.id)}
                  aria-label="Remove image"
                >
                  <FiX />
                </button>
              </div>
            ))}

            {images.length < 5 && (
              <button
                type="button"
                className="AddPost-uploadBox"
                onClick={() => fileInputRef.current?.click()}
              >
                <span className="AddPost-uploadIcon"><FiUploadCloud /></span>
                <strong>Upload Image</strong>
                <span>Click to browse</span>
                <small>PNG, JPG, WEBP · Max 5MB</small>
              </button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={handleImageUpload}
          />

          <p className="AddPost-imageHint">
            <FiCheckCircle />
            First image will be used as the main product image.
          </p>
        </div>

        {/* BASIC DETAILS */}
        <div className="AddPost-card">
          <div className="AddPost-cardHeader">
            <div className="AddPost-cardHeading">
              <span className="AddPost-sectionIcon"><FiLayers /></span>
              <div>
                <h3>Basic Information</h3>
                <p>Enter your product details.</p>
              </div>
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
                  <option value="">Select product category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
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

            <div className="AddPost-field AddPost-fieldWide">
              <label>Company Name <span>*</span></label>
              <div className="AddPost-inputWrap">
                <FiBriefcase />
                <input
                  type="text"
                  placeholder="Enter manufacturer or company name"
                  value={form.companyName}
                  onChange={(e) => updateField("companyName", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="AddPost-field AddPost-fieldWide">
              <div className="AddPost-editorHeading">
                <label>Product Description <span>*</span></label>
                <span>Rich Text Editor</span>
              </div>

              <div className="AddPost-editor">
                <Editor
                  apiKey={import.meta.env.VITE_TINYMCE_API_KEY || "8hswbe7bfeeneui9eb9gjgsym8ku30nx5gwre9808ajdzniu"}
                  value={form.description}
                  onEditorChange={(content) => updateField("description", content)}
                  init={{
                    height: 350,
                    menubar: "edit view insert format tools table",
                    plugins: [
                      "advlist", "autolink", "lists", "link",
                      "image", "charmap", "preview", "anchor",
                      "searchreplace", "visualblocks", "code",
                      "fullscreen", "table", "wordcount",
                    ],
                    toolbar:
                      "undo redo | blocks | bold italic underline | " +
                      "forecolor backcolor | alignleft aligncenter alignright | " +
                      "bullist numlist | link image table | removeformat | code fullscreen",
                    branding: false,
                    promotion: false,
                    resize: true,
                    placeholder: "Write detailed product information...",
                    content_style:
                      "body { font-family: Arial,sans-serif; font-size:14px; line-height:1.7; color:#26372b; padding:12px; }",
                  }}
                />
              </div>
            </div>

          </div>
        </div>

        {/* PRICE AND STOCK */}
        <div className="AddPost-card">
          <div className="AddPost-cardHeader">
            <div className="AddPost-cardHeading">
              <span className="AddPost-sectionIcon"><FiDollarSign /></span>
              <div>
                <h3>Pricing & Stock</h3>
                <p>Manage product price, discount and inventory.</p>
              </div>
            </div>
          </div>

          <div className="AddPost-formGrid">

            <div className="AddPost-field">
              <label>Original Price (₹) <span>*</span></label>
              <div className="AddPost-inputWrap">
                <FiDollarSign />
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="Enter original price"
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
                  step="0.01"
                  placeholder="Enter discount"
                  value={form.discount}
                  onChange={(e) => updateField("discount", e.target.value)}
                />
              </div>
            </div>

            <div className="AddPost-field">
              <label>Final Price (₹)</label>
              <div className="AddPost-inputWrap AddPost-finalPriceWrap">
                <FiCheckCircle />
                <input type="text" value={formatPrice(finalPrice)} readOnly />
              </div>
            </div>

            <div className="AddPost-field">
              <label>Stock Quantity <span>*</span></label>
              <div className="AddPost-inputWrap">
                <FiBox />
                <input
                  type="number"
                  min="0"
                  step="1"
                  placeholder="Enter available stock"
                  value={form.stockQuantity}
                  onChange={(e) => updateField("stockQuantity", e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div className="AddPost-priceSummary">
            <div>
              <span>Original Price</span>
              <strong>{formatPrice(form.price)}</strong>
            </div>
            <div>
              <span>Discount</span>
              <strong className="AddPost-discountValue">{form.discount || 0}%</strong>
            </div>
            <div>
              <span>Final Selling Price</span>
              <strong className="AddPost-sellingPrice">{formatPrice(finalPrice)}</strong>
            </div>
          </div>
        </div>

        {/* SETTINGS */}
        <div className="AddPost-card">
          <div className="AddPost-cardHeader">
            <div className="AddPost-cardHeading">
              <span className="AddPost-sectionIcon"><FiStar /></span>
              <div>
                <h3>Product Settings</h3>
                <p>Configure product promotional status.</p>
              </div>
            </div>
          </div>

          <label className="AddPost-bestSeller">
            <div className="AddPost-bestSellerIcon"><FiStar /></div>
            <div className="AddPost-bestSellerContent">
              <strong>Mark as Best Seller</strong>
              <span>Highlight this product as a popular product.</span>
            </div>
            <input
              type="checkbox"
              checked={form.bestSeller}
              onChange={(e) => updateField("bestSeller", e.target.checked)}
            />
            <span className="AddPost-toggle"></span>
          </label>
        </div>

        {/* FORM BUTTONS */}
        <div className="AddPost-footer">
          <button
            type="button"
            className="AddPost-resetButton"
            onClick={resetForm}
          >
            <FiRotateCcw /> Reset Form
          </button>

          <button
            type="submit"
            className="AddPost-submitButton"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              "Saving Product..."
            ) : (
              <>
                {editingId ? <FiEdit2 /> : <FiPlus />}
                {editingId ? "Update Product" : "Add Product"}
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
            <h3>Manage Products</h3>
            <p>View, edit and manage all your products.</p>
          </div>

          <span className="AddPost-tableTotal">
            {products.length} Products
          </span>
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
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product, index) => (
                  <tr key={product.id}>
                    <td className="AddPost-serial">
                      {String(index + 1).padStart(2, "0")}
                    </td>

                    <td>
                      <div className="AddPost-tableImage">
                        <img
                          src={product.images[0]?.preview}
                          alt={product.title}
                        />
                      </div>
                    </td>

                    <td>
                      <div className="AddPost-productDetails">
                        <strong>{product.title}</strong>
                        <span>{product.images.length} Images</span>
                      </div>
                    </td>

                    <td>
                      <span className="AddPost-categoryBadge">
                        {product.category}
                      </span>
                    </td>

                    <td className="AddPost-originalPrice">
                      {formatPrice(product.price)}
                    </td>

                    <td>
                      <span className="AddPost-discountBadge">
                        {product.discount}%
                      </span>
                    </td>

                    <td className="AddPost-tableFinalPrice">
                      {formatPrice(product.finalPrice)}
                    </td>

                    <td>
                      <span className={`AddPost-stockBadge ${
                        product.stockQuantity > 0 ? "in-stock" : "out-stock"
                      }`}>
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
                          onClick={() => handleDelete(product.id)}
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="11">
                    <div className="AddPost-emptyState">
                      <FiPackage />
                      <h4>No Products Found</h4>
                      <p>
                        {search
                          ? "Try another search term."
                          : "Add your first product using the form above."}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="AddPost-tableFooter">
          Showing {filteredProducts.length} of {products.length} products
        </div>
      </div>
    </div>
  );
};

export default AddPost;
