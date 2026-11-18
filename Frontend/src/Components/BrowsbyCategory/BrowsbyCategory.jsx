import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronRight,
  X,
  Package,
  Tractor,
  Layers,
  ArrowUpRight,
} from "lucide-react";

import "./BrowsbyCategory.css";
import { resolveImageUrl } from "../../utils/helpers";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const CATEGORIES_API = `${API_URL}/categories`;
const PRODUCTS_API = `${API_URL}/products`;
const MACHINERY_API = `${API_URL}/machinery`;

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=500&q=80";

const toSlug = (text) =>
  (text || "")
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");

const cleanText = (str) => (str || "").trim().toLowerCase();

const formatPrice = (val) => {
  const num = Number(val || 0);
  if (!num) return "Price on Request";
  return num.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });
};

const BrowsbyCategory = () => {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'products' | 'machinery'
  const [isClosing, setIsClosing] = useState(false);

  // Fetch categories, products, and machinery to only show categories having items
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        setLoading(true);

        const [catRes, prodRes, machRes] = await Promise.all([
          fetch(CATEGORIES_API).then((r) => r.json()).catch(() => ({ data: [] })),
          fetch(PRODUCTS_API).then((r) => r.json()).catch(() => ({ data: [] })),
          fetch(MACHINERY_API).then((r) => r.json()).catch(() => ({ data: [] })),
        ]);

        if (!isMounted) return;

        const rawCats = Array.isArray(catRes?.data) ? catRes.data : [];
        const rawProds = Array.isArray(prodRes?.data) ? prodRes.data : [];
        const rawMachs = Array.isArray(machRes?.data) ? machRes.data : [];

        // Build list of all unique category names
        const categoryMap = new Map();

        // 1. Seed with registered categories from DB
        rawCats.forEach((cat) => {
          if (cat.status !== "Inactive" && cat.name) {
            const key = cleanText(cat.name);
            categoryMap.set(key, {
              _id: cat._id,
              name: cat.name,
              slug: cat.slug || toSlug(cat.name),
              image: cat.image || "",
              products: [],
              machinery: [],
            });
          }
        });

        // 2. Associate products with their categories
        rawProds.forEach((prod) => {
          if (!prod.category) return;
          const key = cleanText(prod.category);
          if (!categoryMap.has(key)) {
            categoryMap.set(key, {
              _id: `prod-cat-${key}`,
              name: prod.category,
              slug: toSlug(prod.category),
              image: prod.image || "",
              products: [],
              machinery: [],
            });
          }
          categoryMap.get(key).products.push({
            ...prod,
            itemType: "product",
          });
        });

        // 3. Associate machinery with their categories
        rawMachs.forEach((mach) => {
          if (!mach.category) return;
          const key = cleanText(mach.category);
          if (!categoryMap.has(key)) {
            categoryMap.set(key, {
              _id: `mach-cat-${key}`,
              name: mach.category,
              slug: toSlug(mach.category),
              image: mach.image || mach.machineImages?.[0] || "",
              products: [],
              machinery: [],
            });
          }
          categoryMap.get(key).machinery.push({
            ...mach,
            itemType: "machinery",
          });
        });

        // 4. Filter categories to ONLY those that have products OR machinery
        const populatedCategories = Array.from(categoryMap.values()).filter(
          (cat) => cat.products.length > 0 || cat.machinery.length > 0
        );

        setCategories(populatedCategories);
      } catch (err) {
        console.error("Error loading categories, products, or machinery:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const closePopup = () => {
    if (!selectedCategory || isClosing) return;

    setIsClosing(true);

    window.setTimeout(() => {
      setSelectedCategory(null);
      setActiveTab("all");
      setIsClosing(false);
    }, 220);
  };

  useEffect(() => {
    if (!selectedCategory) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") closePopup();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [selectedCategory, isClosing]);

  const openCategory = (category) => {
    setIsClosing(false);
    setActiveTab("all");
    setSelectedCategory(category);
  };

  const handleOpenItem = (item) => {
    closePopup();

    const title = item.title || item.name || "";
    const slug = toSlug(title);

    if (item.itemType === "machinery") {
      navigate(`/machinery/${slug}`);
    } else {
      navigate(`/product/${slug}`);
    }
  };

  // Compute items to display in modal based on activeTab
  const modalItems = selectedCategory
    ? [
        ...(activeTab === "all" || activeTab === "products"
          ? selectedCategory.products
          : []),
        ...(activeTab === "all" || activeTab === "machinery"
          ? selectedCategory.machinery
          : []),
      ]
    : [];

  return (
    <section className="BrowsbyCategory">
      <div className="BrowsbyCategory-container">
        <div className="BrowsbyCategory-header">
          <div className="BrowsbyCategory-heading-group">
            <h2 className="BrowsbyCategory-title">Browse by Category</h2>
            <p className="BrowsbyCategory-subtitle">
              Explore genuine equipment and farming products by category
            </p>
          </div>

          <button
            type="button"
            className="BrowsbyCategory-all-button"
            onClick={() => navigate("/machinery")}
          >
            All Categories
            <ChevronRight size={19} />
          </button>
        </div>

        <div className="BrowsbyCategory-grid">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="BrowsbyCategory-card BrowsbyCategory-card-skeleton"
              >
                <div className="BrowsbyCategory-image-wrap BrowsbyCategory-skeleton-shimmer" />
                <span className="BrowsbyCategory-skeleton-line" />
              </div>
            ))
          ) : categories.length === 0 ? (
            <p className="BrowsbyCategory-empty">
              No categories with available products or machinery at the moment.
            </p>
          ) : (
            categories.map((category) => {
              const catKey = category._id || category.slug || category.name;
              const catImage = resolveImageUrl(category.image, FALLBACK_IMAGE);
              const totalItems = category.products.length + category.machinery.length;

              return (
                <button
                  type="button"
                  key={catKey}
                  className="BrowsbyCategory-card"
                  onClick={() => openCategory(category)}
                  aria-label={`View ${category.name} (${totalItems} items)`}
                >
                  <div className="BrowsbyCategory-image-wrap">
                    <img
                      src={catImage}
                      alt={category.name}
                      className="BrowsbyCategory-image"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = FALLBACK_IMAGE;
                      }}
                    />
                  </div>

                  <span className="BrowsbyCategory-card-name">
                    {category.name}
                  </span>

                  <span className="BrowsbyCategory-count-badge">
                    {totalItems} {totalItems === 1 ? "Item" : "Items"}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* MODAL FOR PRODUCTS & MACHINERY IN SELECTED CATEGORY */}
      {selectedCategory && (
        <div
          className={`BrowsbyCategory-modal-overlay ${
            isClosing ? "is-closing" : ""
          }`}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closePopup();
          }}
        >
          <div
            className={`BrowsbyCategory-modal ${
              isClosing ? "is-closing" : ""
            }`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="BrowsbyCategory-modal-title"
          >
            {/* Modal Header */}
            <div className="BrowsbyCategory-modal-header">
              <div>
                <div className="BrowsbyCategory-modal-title-row">
                  <h3
                    className="BrowsbyCategory-modal-title"
                    id="BrowsbyCategory-modal-title"
                  >
                    {selectedCategory.name}
                  </h3>

                  <span className="BrowsbyCategory-count">
                    {selectedCategory.products.length +
                      selectedCategory.machinery.length}
                  </span>
                </div>

                <p className="BrowsbyCategory-modal-subtitle">
                  {selectedCategory.products.length > 0 && selectedCategory.machinery.length > 0
                    ? `Contains ${selectedCategory.products.length} Products and ${selectedCategory.machinery.length} Machinery Equipment`
                    : selectedCategory.products.length > 0
                    ? `Contains ${selectedCategory.products.length} Products`
                    : `Contains ${selectedCategory.machinery.length} Machinery Equipment`}
                </p>
              </div>

              <button
                type="button"
                className="BrowsbyCategory-close"
                onClick={closePopup}
                aria-label="Close popup"
              >
                <X size={23} />
              </button>
            </div>

            {/* Modal Tabs: All / Products / Machinery */}
            <div className="BrowsbyCategory-modal-tabs">
              <button
                type="button"
                className={`BrowsbyCategory-tab-pill ${
                  activeTab === "all" ? "active" : ""
                }`}
                onClick={() => setActiveTab("all")}
              >
                <Layers size={15} />
                All Items (
                {selectedCategory.products.length +
                  selectedCategory.machinery.length}
                )
              </button>

              {selectedCategory.products.length > 0 && (
                <button
                  type="button"
                  className={`BrowsbyCategory-tab-pill ${
                    activeTab === "products" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("products")}
                >
                  <Package size={15} />
                  Products ({selectedCategory.products.length})
                </button>
              )}

              {selectedCategory.machinery.length > 0 && (
                <button
                  type="button"
                  className={`BrowsbyCategory-tab-pill ${
                    activeTab === "machinery" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("machinery")}
                >
                  <Tractor size={15} />
                  Machinery ({selectedCategory.machinery.length})
                </button>
              )}
            </div>

            {/* Modal Body: Products & Machinery Cards */}
            <div className="BrowsbyCategory-modal-body">
              {modalItems.length === 0 ? (
                <div className="BrowsbyCategory-modal-empty">
                  No items found under this filter.
                </div>
              ) : (
                <div className="BrowsbyCategory-item-grid">
                  {modalItems.map((item) => {
                    const isMachinery = item.itemType === "machinery";
                    const title = item.title || item.name || "Equipment";
                    const brand = item.brandName || item.companyName || item.brand || "";
                    const price = item.finalPrice || item.discountPrice || item.price;
                    const itemImage = resolveImageUrl(
                      item.image ||
                        (Array.isArray(item.machineImages) && item.machineImages[0]) ||
                        (Array.isArray(item.images) && item.images[0]),
                      FALLBACK_IMAGE
                    );

                    return (
                      <div
                        key={item._id || item.id || title}
                        className="BrowsbyCategory-item-card"
                        onClick={() => handleOpenItem(item)}
                      >
                        <div className="BrowsbyCategory-item-image-wrap">
                          <img
                            src={itemImage}
                            alt={title}
                            className="BrowsbyCategory-item-image"
                            loading="lazy"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = FALLBACK_IMAGE;
                            }}
                          />
                          <span
                            className={`BrowsbyCategory-item-type-badge ${
                              isMachinery ? "badge-machinery" : "badge-product"
                            }`}
                          >
                            {isMachinery ? (
                              <>
                                <Tractor size={12} /> Machinery
                              </>
                            ) : (
                              <>
                                <Package size={12} /> Product
                              </>
                            )}
                          </span>
                        </div>

                        <div className="BrowsbyCategory-item-info">
                          {brand && (
                            <span className="BrowsbyCategory-item-brand">
                              {brand}
                            </span>
                          )}
                          <h4 className="BrowsbyCategory-item-title" title={title}>
                            {title}
                          </h4>
                          <div className="BrowsbyCategory-item-price-row">
                            <span className="BrowsbyCategory-item-price">
                              {formatPrice(price)}
                            </span>
                            <span className="BrowsbyCategory-item-view-btn">
                              View <ArrowUpRight size={14} />
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="BrowsbyCategory-modal-footer">
              <span>
                Showing {modalItems.length} of{" "}
                {selectedCategory.products.length +
                  selectedCategory.machinery.length}{" "}
                items
              </span>

              <button
                type="button"
                className="BrowsbyCategory-cancel"
                onClick={closePopup}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default BrowsbyCategory;
