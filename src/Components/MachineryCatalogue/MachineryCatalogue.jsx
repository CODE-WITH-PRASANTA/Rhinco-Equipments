
import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./MachineryCatalogue.css";

const commonsImage = (filename) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(
    filename
  )}?width=700`;

const fallbackImage = commonsImage("Agriculture Machinery Harvester.jpg");

const machineryProducts = [
  {
    id: "honda-f300",
    brand: "HONDA",
    name: "F300",
    price: 54000,
    subsidy: 10500,
    category: "Power Weeder",
    image: commonsImage("A tractor.jpg"),
  },
  {
    id: "walson-1rk190",
    brand: "WALSON",
    name: "Walson - 1RK190",
    price: 94500,
    subsidy: 46875,
    category: "Rice Mill",
    image: commonsImage("Saatgut-Reinigungsanlage 3786.JPG"),
  },
  {
    id: "rico-ri2000",
    brand: "RICO ITALY",
    name: "Rico Italy - RI 2000",
    price: 152500,
    subsidy: 87600,
    category: "Harvester",
    image: commonsImage("A Twenty-Four Horse Power Harvester (NBY 9002).jpg"),
  },
  {
    id: "indoxen-105p",
    brand: "INDOXEN",
    name: "Indoxen 105P",
    price: 61000,
    subsidy: 23250,
    category: "Power Tiller",
    image: commonsImage("Agricultural Equipment (1).jpg"),
  },
  {
    id: "vst-234md",
    brand: "VST",
    name: "234MD",
    price: 30000,
    subsidy: 5850,
    category: "Brush Cutter",
    image: commonsImage("Aerosolni generator 33.jpg"),
  },
  {
    id: "riddish-mt-kishan",
    brand: "Riddish",
    name: "Riddish - MT KISHAN 001",
    price: 48000,
    subsidy: 23250,
    category: "Power Tiller",
    image: commonsImage("Chaff cutter machine at work.jpg"),
  },
  {
    id: "kamco-kmb200",
    brand: "KAMCO",
    name: "KMB 200",
    price: 214800,
    subsidy: 127500,
    category: "Power Tiller",
    image: commonsImage("Mc Cormick-by-RaBoe-07.jpg"),
  },
  {
    id: "agrineer-an205p",
    brand: "Agrineer",
    name: "AN 205P 9HP",
    price: 58100,
    subsidy: 23250,
    category: "Power Tiller",
    image: commonsImage("Agricultural Equipment (2).jpg"),
  },
  {
    id: "john-deere-8320",
    brand: "JOHN DEERE",
    name: "John Deere 8320",
    price: 850000,
    subsidy: 250000,
    category: "Tractor",
    image: commonsImage("John Deere 8320.jpg"),
  },
  {
    id: "agri-harvester-01",
    brand: "AGRI TECH",
    name: "Mini Harvester 01",
    price: 185000,
    subsidy: 65000,
    category: "Harvester",
    image: commonsImage("Maehdrescher1 hg.jpg"),
  },
  {
    id: "farm-chaff-cutter",
    brand: "FARM KING",
    name: "Chaff Cutter Machine",
    price: 42500,
    subsidy: 15000,
    category: "Chaff Cutter",
    image: commonsImage("Food cuter machine.jpg"),
  },
  {
    id: "agri-irrigation-pump",
    brand: "AGRO PLUS",
    name: "Irrigation Pump Set",
    price: 18500,
    subsidy: 5500,
    category: "Irrigation",
    image: commonsImage(
      "Agricultural irrigation pump set with borewell, Vrindavan, Uttar Pradesh, India.jpg"
    ),
  },
  {
    id: "seed-cleaner-01",
    brand: "WALSON",
    name: "Seed Cleaning Machine",
    price: 72000,
    subsidy: 25000,
    category: "Seed Cleaner",
    image: commonsImage("Saatgut-Reinigungsanlage 3787.jpg"),
  },
  {
    id: "rotary-tiller-01",
    brand: "FIELD MASTER",
    name: "Rotary Tiller",
    price: 67500,
    subsidy: 21000,
    category: "Power Tiller",
    image: commonsImage("Agricultural Equipment (3).jpg"),
  },
];

const categories = [
  "Power Weeder",
  "Rice Mill",
  "Harvester",
  "Power Tiller",
  "Brush Cutter",
  "Tractor",
  "Chaff Cutter",
  "Irrigation",
  "Seed Cleaner",
  "Rotary Tiller",
  "Cultivator",
  "Sprayer",
  "Plough",
  "Thresher",
  "Planter",
  "Reaper",
  "Water Pump",
  "Other Machinery",
];

const brands = [
  "HONDA",
  "WALSON",
  "RICO ITALY",
  "INDOXEN",
  "VST",
  "Riddish",
  "KAMCO",
  "Agrineer",
  "JOHN DEERE",
  "AGRI TECH",
  "FARM KING",
  "AGRO PLUS",
  "FIELD MASTER",
];

const formatPrice = (price) =>
  `₹${Number(price).toLocaleString("en-IN")}`;

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
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [sortBy, setSortBy] = useState("recommended");

  const filteredProducts = useMemo(() => {
    let result = [...machineryProducts];

    if (search.trim()) {
      const query = search.toLowerCase().trim();

      result = result.filter((product) =>
        `${product.name} ${product.brand} ${product.category}`
          .toLowerCase()
          .includes(query)
      );
    }

    if (selectedCategory) {
      result = result.filter(
        (product) => product.category === selectedCategory
      );
    }

    if (selectedBrand) {
      result = result.filter(
        (product) => product.brand === selectedBrand
      );
    }

    if (sortBy === "price-low") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [search, selectedCategory, selectedBrand, sortBy]);

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
              67 Models Available
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
                  <span>18 categories available</span>
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
                  <span>25 manufacturers</span>
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
              Showing {filteredProducts.length} of 67 machinery models
            </p>
          </div>
        </div>

        <div className="MachineryCatalogue-grid">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <Link
                to={`/machinery/${product.id}`}
                className="MachineryCatalogue-product-card"
                key={product.id}
              >
                <div className="MachineryCatalogue-image-area">
                  <span className="MachineryCatalogue-brand-logo">
                    {product.brand}
                  </span>

                  <span className="MachineryCatalogue-subsidy-badge">
                    <SubsidyIcon />
                    Subsidy
                  </span>

                  <img
                    src={product.image}
                    alt={`${product.brand} ${product.name}`}
                    className="MachineryCatalogue-product-image"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    onError={handleImageError}
                  />
                </div>

                <div className="MachineryCatalogue-product-content">
                  <div className="MachineryCatalogue-product-info">
                    <span className="MachineryCatalogue-product-brand">
                      {product.brand}
                    </span>

                    <h3>{product.name}</h3>
                  </div>

                  <div className="MachineryCatalogue-product-divider" />

                  <div className="MachineryCatalogue-price-row">
                    <div className="MachineryCatalogue-price-content">
                      <span className="MachineryCatalogue-base-price-label">
                        BASE PRICE
                      </span>

                      <strong className="MachineryCatalogue-price">
                        {formatPrice(product.price)}
                      </strong>

                      <span className="MachineryCatalogue-subsidy-text">
                        <SubsidyIcon />
                        Subsidy upto {formatPrice(product.subsidy)}
                      </span>
                    </div>

                    <span className="MachineryCatalogue-product-arrow">
                      <ChevronIcon />
                    </span>
                  </div>
                </div>
              </Link>
            ))
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
      </div>
    </section>
  );
};

export default MachineryCatalogue;
