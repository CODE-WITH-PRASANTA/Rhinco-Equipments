import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./MachinaryEquipmentOne.css";
import { resolveImageUrl, toMachinerySlug } from "../../utils/helpers";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const MACHINERY_API = `${API_URL}/machinery`;

const fallbackImage =
  "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80";

const formatPrice = (price) =>
  `₹${Number(price || 0).toLocaleString("en-IN")}`;

const GridIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
    <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
    <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
    <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
  </svg>
);

const AwardIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="8" r="6" stroke="currentColor" strokeWidth="2" />
    <path
      d="m8.5 13-1 8 4.5-2.8 4.5 2.8-1-8"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const SortIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M7 3v18m0-18L3.5 6.5M7 3l3.5 3.5M17 21V3m0 18-3.5-3.5M17 21l3.5-3.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ChevronIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="m9 18 6-6-6-6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const SubsidyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="m12 2.8 3 1.6 3.4.2.2 3.4 1.6 3-1.6 3-.2 3.4-3.4.2-3 1.6-3-1.6-3.4-.2-.2-3.4-1.6-3 1.6-3 .2-3.4 3.4-.2 3-1.6Z"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinejoin="round"
    />
    <path
      d="m9 12 2 2 4-4"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const MachineryCatalogue = () => {
  const [machineryProducts, setMachineryProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [sortBy, setSortBy] = useState("recommended");

  // Fetch real machinery from database
  useEffect(() => {
    let isMounted = true;
    const fetchMachinery = async () => {
      try {
        setLoading(true);
        const res = await fetch(MACHINERY_API);
        const data = await res.json();
        if (res.ok && data.success && Array.isArray(data.data)) {
          if (isMounted) {
            setMachineryProducts(data.data);
          }
        }
      } catch (err) {
        console.error("Error loading catalogue machinery:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchMachinery();
    return () => {
      isMounted = false;
    };
  }, []);

  // Derive dynamic categories from database items
  const categories = useMemo(() => {
    const set = new Set();
    machineryProducts.forEach((item) => {
      if (item.category) set.add(item.category);
      if (item.implementType) set.add(item.implementType);
    });
    return Array.from(set).sort();
  }, [machineryProducts]);

  // Derive dynamic brands from database items
  const brands = useMemo(() => {
    const set = new Set();
    machineryProducts.forEach((item) => {
      const b = item.brand || item.brandName;
      if (b) set.add(b);
    });
    return Array.from(set).sort();
  }, [machineryProducts]);

  const filteredProducts = useMemo(() => {
    let result = [...machineryProducts];

    if (search.trim()) {
      const query = search.toLowerCase().trim();
      result = result.filter((product) => {
        const name = (product.title || product.name || "").toLowerCase();
        const brand = (product.brandName || product.brand || "").toLowerCase();
        const category = (product.category || product.implementType || "").toLowerCase();
        return `${name} ${brand} ${category}`.includes(query);
      });
    }

    if (selectedCategory) {
      result = result.filter(
        (product) =>
          product.category === selectedCategory ||
          product.implementType === selectedCategory
      );
    }

    if (selectedBrand) {
      result = result.filter(
        (product) =>
          (product.brandName || product.brand) === selectedBrand
      );
    }

    if (sortBy === "price-low") {
      result.sort(
        (a, b) =>
          Number(a.discountPrice || a.price || 0) -
          Number(b.discountPrice || b.price || 0)
      );
    } else if (sortBy === "price-high") {
      result.sort(
        (a, b) =>
          Number(b.discountPrice || b.price || 0) -
          Number(a.discountPrice || a.price || 0)
      );
    } else if (sortBy === "name") {
      result.sort((a, b) =>
        (a.title || a.name || "").localeCompare(b.title || b.name || "")
      );
    }

    return result;
  }, [machineryProducts, search, selectedCategory, selectedBrand, sortBy]);

  const activeFilterCount = [
    selectedCategory,
    selectedBrand,
    sortBy !== "recommended" ? sortBy : "",
  ].filter(Boolean).length;

  const clearFilters = () => {
    setSelectedCategory("");
    setSelectedBrand("");
    setSortBy("recommended");
    setSearch("");
    setActiveFilter("");
  };

  const handleImageError = (event) => {
    const image = event.currentTarget;
    if (image.dataset.fallbackApplied) return;
    image.dataset.fallbackApplied = "true";
    image.src = fallbackImage;
  };

  return (
    <section className="MachineryCatalogue">
      <div className="MachineryCatalogue-container">
        {/* Catalogue header and filters */}

        <div className="MachineryCatalogue-filter-panel">
          <div className="MachineryCatalogue-header">
            <div className="MachineryCatalogue-heading-content">
              <h1>Machinery Catalogue</h1>
              <p>
                Select verified models eligible for government subsidy &amp;
                dealer delivery
              </p>
            </div>

            <span className="MachineryCatalogue-model-count">
              {machineryProducts.length} Models Available
            </span>
          </div>

          {/* Search */}

          <div className="MachineryCatalogue-search">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle
                cx="11"
                cy="11"
                r="7"
                stroke="currentColor"
                strokeWidth="1.8"
              />
              <path
                d="m16 16 4.5 4.5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>

            <input
              type="search"
              placeholder="Search by machine name, implement or brand..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search machinery"
            />

            {search && (
              <button
                type="button"
                className="MachineryCatalogue-search-clear"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>

          {/* Filter cards */}

          <div className="MachineryCatalogue-filter-grid">
            <div className="MachineryCatalogue-filter-item">
              <button
                type="button"
                className={`MachineryCatalogue-filter-trigger ${
                  activeFilter === "category"
                    ? "MachineryCatalogue-filter-trigger-active"
                    : ""
                }`}
                onClick={() =>
                  setActiveFilter(
                    activeFilter === "category" ? "" : "category"
                  )
                }
              >
                <span className="MachineryCatalogue-filter-icon">
                  <GridIcon />
                </span>

                <span className="MachineryCatalogue-filter-copy">
                  <small>CATEGORY</small>
                  <strong>
                    {selectedCategory || "Select Category"}
                  </strong>
                  <span>{categories.length} categories available</span>
                </span>

                <span className="MachineryCatalogue-filter-arrow">
                  <ChevronIcon />
                </span>
              </button>

              {activeFilter === "category" && (
                <div className="MachineryCatalogue-dropdown">
                  <div className="MachineryCatalogue-dropdown-heading">
                    <strong>Select Category</strong>
                    <button
                      type="button"
                      onClick={() => setActiveFilter("")}
                      aria-label="Close category filter"
                    >
                      ×
                    </button>
                  </div>

                  <button
                    type="button"
                    className={`MachineryCatalogue-dropdown-option ${
                      !selectedCategory
                        ? "MachineryCatalogue-option-selected"
                        : ""
                    }`}
                    onClick={() => {
                      setSelectedCategory("");
                      setActiveFilter("");
                    }}
                  >
                    All Categories
                  </button>

                  {categories.map((category) => (
                    <button
                      type="button"
                      key={category}
                      className={`MachineryCatalogue-dropdown-option ${
                        selectedCategory === category
                          ? "MachineryCatalogue-option-selected"
                          : ""
                      }`}
                      onClick={() => {
                        setSelectedCategory(category);
                        setActiveFilter("");
                      }}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="MachineryCatalogue-filter-item">
              <button
                type="button"
                className={`MachineryCatalogue-filter-trigger ${
                  activeFilter === "brand"
                    ? "MachineryCatalogue-filter-trigger-active"
                    : ""
                }`}
                onClick={() =>
                  setActiveFilter(activeFilter === "brand" ? "" : "brand")
                }
              >
                <span className="MachineryCatalogue-filter-icon">
                  <AwardIcon />
                </span>

                <span className="MachineryCatalogue-filter-copy">
                  <small>BRAND</small>
                  <strong>{selectedBrand || "Select Brand"}</strong>
                  <span>{brands.length} manufacturers</span>
                </span>

                <span className="MachineryCatalogue-filter-arrow">
                  <ChevronIcon />
                </span>
              </button>

              {activeFilter === "brand" && (
                <div className="MachineryCatalogue-dropdown">
                  <div className="MachineryCatalogue-dropdown-heading">
                    <strong>Select Brand</strong>
                    <button
                      type="button"
                      onClick={() => setActiveFilter("")}
                      aria-label="Close brand filter"
                    >
                      ×
                    </button>
                  </div>

                  <button
                    type="button"
                    className={`MachineryCatalogue-dropdown-option ${
                      !selectedBrand
                        ? "MachineryCatalogue-option-selected"
                        : ""
                    }`}
                    onClick={() => {
                      setSelectedBrand("");
                      setActiveFilter("");
                    }}
                  >
                    All Brands
                  </button>

                  {brands.map((brand) => (
                    <button
                      type="button"
                      key={brand}
                      className={`MachineryCatalogue-dropdown-option ${
                        selectedBrand === brand
                          ? "MachineryCatalogue-option-selected"
                          : ""
                      }`}
                      onClick={() => {
                        setSelectedBrand(brand);
                        setActiveFilter("");
                      }}
                    >
                      {brand}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="MachineryCatalogue-filter-item">
              <button
                type="button"
                className={`MachineryCatalogue-filter-trigger ${
                  activeFilter === "sort"
                    ? "MachineryCatalogue-filter-trigger-active"
                    : ""
                }`}
                onClick={() =>
                  setActiveFilter(activeFilter === "sort" ? "" : "sort")
                }
              >
                <span className="MachineryCatalogue-filter-icon">
                  <SortIcon />
                </span>

                <span className="MachineryCatalogue-filter-copy">
                  <small>SORT BY</small>
                  <strong>
                    {sortBy === "recommended"
                      ? "Recommended"
                      : sortBy === "price-low"
                      ? "Price: Low to High"
                      : sortBy === "price-high"
                      ? "Price: High to Low"
                      : "Name: A to Z"}
                  </strong>
                  <span>A fresh mix every visit</span>
                </span>

                <span className="MachineryCatalogue-filter-arrow">
                  <ChevronIcon />
                </span>
              </button>

              {activeFilter === "sort" && (
                <div className="MachineryCatalogue-dropdown">
                  <div className="MachineryCatalogue-dropdown-heading">
                    <strong>Sort Machinery</strong>
                    <button
                      type="button"
                      onClick={() => setActiveFilter("")}
                      aria-label="Close sort filter"
                    >
                      ×
                    </button>
                  </div>

                  {[
                    ["recommended", "Recommended"],
                    ["price-low", "Price: Low to High"],
                    ["price-high", "Price: High to Low"],
                    ["name", "Name: A to Z"],
                  ].map(([value, label]) => (
                    <button
                      type="button"
                      key={value}
                      className={`MachineryCatalogue-dropdown-option ${
                        sortBy === value
                          ? "MachineryCatalogue-option-selected"
                          : ""
                      }`}
                      onClick={() => {
                        setSortBy(value);
                        setActiveFilter("");
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {activeFilterCount > 0 && (
            <div className="MachineryCatalogue-active-filters">
              <span>{activeFilterCount} filter(s) applied</span>
              <button type="button" onClick={clearFilters}>
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Product listing */}

        <div className="MachineryCatalogue-results-heading">
          <div>
            <h2>Available Machinery</h2>
            <p>
              Showing {filteredProducts.length} of {machineryProducts.length} machinery models
            </p>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#64748b" }}>
            <p>Loading machinery catalogue from database...</p>
          </div>
        ) : (
          <div className="MachineryCatalogue-grid">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => {
                const name = product.title || product.name;
                const brand = product.brandName || product.brand || "Rhinco";
                const price = Number(product.discountPrice || product.price || 0);
                const subsidy = Math.round(price * 0.4);
                const rawImage =
                  (Array.isArray(product.machineImages) && product.machineImages[0]) ||
                  product.image ||
                  product.featuredImage?.data ||
                  "";
                const image = resolveImageUrl(rawImage, fallbackImage);

                return (
                  <Link
                    to={`/machinery-details/${toMachinerySlug(name)}`}
                    className="MachineryCatalogue-product-card"
                    key={product._id || product.id}
                  >
                    <div className="MachineryCatalogue-image-area">
                      <span className="MachineryCatalogue-brand-logo">
                        {brand}
                      </span>

                      <span className="MachineryCatalogue-subsidy-badge">
                        <SubsidyIcon />
                        Subsidy
                      </span>

                      <img
                        src={image}
                        alt={`${brand} ${name}`}
                        className="MachineryCatalogue-product-image"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        onError={handleImageError}
                      />
                    </div>

                    <div className="MachineryCatalogue-product-content">
                      <div className="MachineryCatalogue-product-info">
                        <span className="MachineryCatalogue-product-brand">
                          {brand}
                        </span>

                        <h3>{name}</h3>
                      </div>

                      <div className="MachineryCatalogue-product-divider" />

                      <div className="MachineryCatalogue-price-row">
                        <div className="MachineryCatalogue-price-content">
                          <span className="MachineryCatalogue-base-price-label">
                            BASE PRICE
                          </span>

                          <strong className="MachineryCatalogue-price">
                            {formatPrice(price)}
                          </strong>

                          <span className="MachineryCatalogue-subsidy-text">
                            <SubsidyIcon />
                            Subsidy upto {formatPrice(subsidy)}
                          </span>
                        </div>

                        <span className="MachineryCatalogue-product-arrow">
                          <ChevronIcon />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="MachineryCatalogue-empty">
                <div className="MachineryCatalogue-empty-icon">
                  <GridIcon />
                </div>
                <h3>No machinery found</h3>
                <p>
                  Try another machine name, category or manufacturer.
                </p>
                <button type="button" onClick={clearFilters}>
                  Clear filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default MachineryCatalogue;
