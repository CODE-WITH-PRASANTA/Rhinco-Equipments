import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import "./MainProduct.css";
import {
  getCart,
  addToCart,
  updateCartQuantity,
  getCartItemQuantity,
  getWishlist,
  toggleWishlist,
  isInWishlist,
} from "../../utils/cartWishlist";
import { API_ENDPOINTS } from "../../config/api";

const PRODUCTS_API = API_ENDPOINTS.PRODUCTS;

const getProductId = (product) => product?._id || product?.id;

const formatPrice = (price) =>
  `₹${Number(price || 0).toLocaleString("en-IN")}`;

const MainProduct = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All Products");
  const [search, setSearch] = useState("");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000000);
  const [appliedMin, setAppliedMin] = useState(0);
  const [appliedMax, setAppliedMax] = useState(1000000);
  const [sortBy, setSortBy] = useState("featured");
  const [wishlist, setWishlist] = useState(getWishlist);
  const [cart, setCart] = useState(getCart);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [searchParams] = useSearchParams();

  useEffect(() => {
    const cat = searchParams.get("category");
    const q = searchParams.get("search");
    if (cat) {
      setActiveCategory(cat);
    }
    if (q) {
      setSearch(q);
    }
  }, [searchParams]);

  // Sync cart & wishlist across tabs and components
  useEffect(() => {
    const syncCartWishlist = () => {
      setCart(getCart());
      setWishlist(getWishlist());
    };

    window.addEventListener("rhinco_cart_updated", syncCartWishlist);
    window.addEventListener("rhinco_wishlist_updated", syncCartWishlist);
    window.addEventListener("storage", syncCartWishlist);

    return () => {
      window.removeEventListener("rhinco_cart_updated", syncCartWishlist);
      window.removeEventListener("rhinco_wishlist_updated", syncCartWishlist);
      window.removeEventListener("storage", syncCartWishlist);
    };
  }, []);

  // FETCH REAL PRODUCTS FROM DATABASE
  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(PRODUCTS_API);
      const result = await res.json();
      if (res.ok && result.success && Array.isArray(result.data)) {
        setAllProducts(result.data);

        // Adjust default max price slider to fit actual products
        if (result.data.length > 0) {
          const highest = Math.max(
            ...result.data.map((p) => Number(p.finalPrice || p.price || 0))
          );
          const roundedMax = Math.max(10000, Math.ceil(highest / 5000) * 5000);
          setMaxPrice(roundedMax);
          setAppliedMax(roundedMax);
        }
      }
    } catch (err) {
      console.error("Could not fetch real products from backend:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // DYNAMIC CATEGORIES EXTRACTED FROM REAL PRODUCTS
  const categories = useMemo(() => {
    const categoryCountMap = {};

    allProducts.forEach((product) => {
      const cat = product.category || "General";
      categoryCountMap[cat] = (categoryCountMap[cat] || 0) + 1;
    });

    const categoryList = Object.entries(categoryCountMap).map(
      ([name, count]) => ({
        name,
        count,
      })
    );

    return [
      { name: "All Products", count: allProducts.length },
      ...categoryList,
    ];
  }, [allProducts]);

  // HIGHEST PRICE IN CURRENT DATA
  const sliderMax = useMemo(() => {
    if (!allProducts.length) return 500000;
    const highest = Math.max(
      ...allProducts.map((p) => Number(p.finalPrice || p.price || 0))
    );
    return Math.max(10000, Math.ceil(highest / 5000) * 5000);
  }, [allProducts]);

  // FILTERED & SORTED PRODUCTS
  const filteredProducts = useMemo(() => {
    let list = [...allProducts];

    if (activeCategory !== "All Products") {
      list = list.filter(
        (product) =>
          (product.category || "").toLowerCase() === activeCategory.toLowerCase()
      );
    }

    if (search.trim()) {
      const searchTerm = search.toLowerCase().trim();
      list = list.filter(
        (product) =>
          (product.title || product.name || "").toLowerCase().includes(searchTerm) ||
          (product.category || "").toLowerCase().includes(searchTerm) ||
          (product.companyName || "").toLowerCase().includes(searchTerm) ||
          (product.description || "").toLowerCase().includes(searchTerm)
      );
    }

    list = list.filter((product) => {
      const p = Number(product.finalPrice || product.price || 0);
      return p >= appliedMin && p <= appliedMax;
    });

    if (sortBy === "price-low") {
      list.sort((a, b) => (a.finalPrice || a.price) - (b.finalPrice || b.price));
    } else if (sortBy === "price-high") {
      list.sort((a, b) => (b.finalPrice || b.price) - (a.finalPrice || a.price));
    } else if (sortBy === "rating") {
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === "name") {
      list.sort((a, b) =>
        (a.title || a.name || "").localeCompare(b.title || b.name || "")
      );
    } else {
      // "featured": bestSeller first, then newest
      list.sort((a, b) => {
        if (a.bestSeller && !b.bestSeller) return -1;
        if (!a.bestSeller && b.bestSeller) return 1;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
    }

    return list;
  }, [allProducts, activeCategory, search, appliedMin, appliedMax, sortBy]);

  const handleToggleWishlist = (product) => {
    toggleWishlist(product);
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1);
  };

  const handleUpdateQty = (pId, delta) => {
    updateCartQuantity(pId, delta);
  };

  const applyPriceFilter = () => {
    setAppliedMin(Math.min(minPrice, maxPrice));
    setAppliedMax(Math.max(minPrice, maxPrice));
  };

  const clearFilters = () => {
    setActiveCategory("All Products");
    setSearch("");
    setMinPrice(0);
    setMaxPrice(sliderMax);
    setAppliedMin(0);
    setAppliedMax(sliderMax);
    setSortBy("featured");
  };

  const closeMobileFilters = () => setMobileFiltersOpen(false);

  return (
    <section className="MainProduct">
      <div className="MainProduct-container">
        {/* Mobile filter button */}
        <div className="MainProduct-mobile-toolbar">
          <button
            type="button"
            className="MainProduct-mobile-filter-button"
            onClick={() => setMobileFiltersOpen(true)}
          >
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M4 6h16M7 12h10m-7 6h4"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
            Filters
          </button>

          <span>{filteredProducts.length} Products</span>
        </div>

        {/* Sidebar */}
        <aside
          className={`MainProduct-sidebar ${
            mobileFiltersOpen ? "MainProduct-sidebar-open" : ""
          }`}
        >
          <div className="MainProduct-mobile-sidebar-heading">
            <h2>Filters</h2>
            <button
              type="button"
              onClick={closeMobileFilters}
              aria-label="Close filters"
            >
              ×
            </button>
          </div>

          {/* Search */}
          <div className="MainProduct-sidebar-search">
            <svg viewBox="0 0 24 24" fill="none">
              <circle
                cx="11"
                cy="11"
                r="7"
                stroke="currentColor"
                strokeWidth="1.8"
              />
              <path
                d="M16.5 16.5L21 21"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search products"
            />
          </div>

          {/* Categories */}
          <div className="MainProduct-sidebar-section">
            <div className="MainProduct-sidebar-title">
              <h2>Categories</h2>
              <span className="MainProduct-title-line" />
            </div>

            <div className="MainProduct-category-list">
              {categories.map((category) => (
                <button
                  type="button"
                  key={category.name}
                  className={`MainProduct-category-item ${
                    activeCategory === category.name
                      ? "MainProduct-category-active"
                      : ""
                  }`}
                  onClick={() => {
                    setActiveCategory(category.name);
                    closeMobileFilters();
                  }}
                >
                  <span className="MainProduct-category-name">
                    {activeCategory === category.name && (
                      <span className="MainProduct-category-arrow">›</span>
                    )}
                    {category.name}
                  </span>
                  <span className="MainProduct-category-count">
                    {category.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Price filter */}
          <div className="MainProduct-sidebar-section MainProduct-price-section">
            <div className="MainProduct-sidebar-title">
              <h2>Filter By Price</h2>
              <span className="MainProduct-title-line" />
            </div>

            <div className="MainProduct-price-range">
              <div className="MainProduct-range-values">
                <span>{formatPrice(minPrice)}</span>
                <span>{formatPrice(maxPrice)}</span>
              </div>

              <div className="MainProduct-range-inputs">
                <input
                  type="range"
                  min="0"
                  max={sliderMax}
                  step={sliderMax > 100000 ? "5000" : "500"}
                  value={minPrice}
                  onChange={(event) =>
                    setMinPrice(
                      Math.min(Number(event.target.value), maxPrice)
                    )
                  }
                  aria-label="Minimum price"
                  style={{
                    "--MainProduct-range-progress": `${
                      (minPrice / sliderMax) * 100
                    }%`,
                  }}
                />

                <input
                  type="range"
                  min="0"
                  max={sliderMax}
                  step={sliderMax > 100000 ? "5000" : "500"}
                  value={maxPrice}
                  onChange={(event) =>
                    setMaxPrice(
                      Math.max(Number(event.target.value), minPrice)
                    )
                  }
                  aria-label="Maximum price"
                />
              </div>

              <div className="MainProduct-price-filter-bottom">
                <button
                  type="button"
                  className="MainProduct-filter-button"
                  onClick={applyPriceFilter}
                >
                  Filter
                </button>

                <span>
                  Price: {formatPrice(appliedMin)} – {formatPrice(appliedMax)}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="MainProduct-clear-filters"
            onClick={clearFilters}
          >
            Clear All Filters
          </button>

          <button
            type="button"
            className="MainProduct-mobile-apply"
            onClick={closeMobileFilters}
          >
            Show {filteredProducts.length} Products
          </button>
        </aside>

        {/* Overlay for mobile filters */}
        {mobileFiltersOpen && (
          <button
            type="button"
            className="MainProduct-sidebar-overlay"
            onClick={closeMobileFilters}
            aria-label="Close filter panel"
          />
        )}

        {/* Main product content */}
        <main className="MainProduct-content">
          <div className="MainProduct-topbar">
            <div className="MainProduct-topbar-left">
              <span className="MainProduct-eyebrow">RHINCO EQUIPMENTS STORE</span>
              <h1>Explore Our Products</h1>
              <p>
                Quality agricultural machinery and equipment direct from our live inventory.
              </p>
            </div>

            <div className="MainProduct-topbar-right">
              <label htmlFor="MainProduct-sort">Sort by:</label>
              <select
                id="MainProduct-sort"
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
              >
                <option value="featured">Featured (Best Sellers)</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
                <option value="name">Name: A to Z</option>
              </select>
            </div>
          </div>

          {/* Active category */}
          <div className="MainProduct-results-bar">
            <div>
              <h2>
                {activeCategory === "All Products"
                  ? "All Products"
                  : activeCategory}
              </h2>
              <p>
                Showing {filteredProducts.length} products
              </p>
            </div>

            {(activeCategory !== "All Products" || search) && (
              <button
                type="button"
                onClick={clearFilters}
                className="MainProduct-reset-link"
              >
                Reset filters
              </button>
            )}
          </div>

          {/* Product cards */}
          <div className="MainProduct-grid">
            {loading ? (
              <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "60px 20px" }}>
                <div style={{ fontSize: "28px", marginBottom: "12px" }}>↻</div>
                <h3 style={{ fontSize: "18px", color: "#1c2c20" }}>Loading Store Products...</h3>
                <p style={{ color: "#64748b", fontSize: "14px" }}>Fetching live inventory from database.</p>
              </div>
            ) : filteredProducts.length > 0 ? (
              filteredProducts.map((product) => {
                const pId = getProductId(product);
                const cartQty = getCartItemQuantity(pId);
                const inWishlist = isInWishlist(pId);
                const displayImg =
                  product.images && product.images.length > 0
                    ? typeof product.images[0] === "string"
                      ? product.images[0]
                      : product.images[0].preview || product.images[0].url
                    : product.image || "https://placehold.co/700x500?text=Product";

                const regularPrice = Number(product.price || product.oldPrice || 0);
                const salesPrice = Number(product.finalPrice || product.price || 0);
                const discountPct =
                  product.discount ||
                  (regularPrice > salesPrice
                    ? Math.round(((regularPrice - salesPrice) / regularPrice) * 100)
                    : 0);

                return (
                  <article className="MainProduct-card" key={pId}>
                    <div className="MainProduct-card-image">
                      {(product.badge || product.bestSeller) && (
                        <span className="MainProduct-product-badge">
                          {product.badge || "Best Seller"}
                        </span>
                      )}

                      <button
                        type="button"
                        className={`MainProduct-wishlist ${
                          inWishlist ? "MainProduct-wishlist-active" : ""
                        }`}
                        onClick={() => handleToggleWishlist(product)}
                        aria-label={
                          inWishlist
                            ? "Remove from wishlist"
                            : "Add to wishlist"
                        }
                      >
                        {inWishlist ? "♥" : "♡"}
                      </button>

                      <Link
                        to={`/product/${encodeURIComponent(product.title || product.name)}`}
                        className="MainProduct-image-link"
                      >
                        <img
                          src={displayImg}
                          alt={product.title || product.name}
                          loading="lazy"
                          className="MainProduct-image"
                          onError={(e) => {
                            e.currentTarget.src =
                              "https://placehold.co/700x500?text=Product";
                          }}
                        />
                      </Link>
                    </div>

                    <div className="MainProduct-card-content">
                      <span className="MainProduct-product-category">
                        {product.category}
                      </span>

                      <Link
                        to={`/product/${encodeURIComponent(product.title || product.name)}`}
                        className="MainProduct-product-name"
                      >
                        {product.title || product.name}
                      </Link>

                      <div className="MainProduct-rating-row">
                        <span className="MainProduct-stars">
                          {"★".repeat(Math.floor(product.rating || 5))}
                          {"☆".repeat(5 - Math.floor(product.rating || 5))}
                        </span>
                        <span className="MainProduct-rating-value">
                          {product.rating || 4.8}
                        </span>
                        <span className="MainProduct-review-count">
                          ({product.reviews || 12})
                        </span>
                      </div>

                      <div className="MainProduct-price-row">
                        <div className="MainProduct-product-prices">
                          <strong>{formatPrice(salesPrice)}</strong>
                          {regularPrice > salesPrice && (
                            <del>{formatPrice(regularPrice)}</del>
                          )}
                        </div>

                        {discountPct > 0 && (
                          <span className="MainProduct-discount">
                            {discountPct}% OFF
                          </span>
                        )}
                      </div>

                      {cartQty > 0 ? (
                        <div
                          className="MainProduct-qty-control"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            className="MainProduct-qty-btn MainProduct-qty-minus"
                            onClick={() => handleUpdateQty(pId, -1)}
                            title="Decrease quantity"
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>
                          <span className="MainProduct-qty-number">
                            <span>✓</span> {cartQty} in Cart
                          </span>
                          <button
                            type="button"
                            className="MainProduct-qty-btn MainProduct-qty-plus"
                            onClick={() => handleUpdateQty(pId, 1)}
                            title="Increase quantity"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="MainProduct-add-cart"
                          onClick={() => handleAddToCart(product)}
                        >
                          <svg viewBox="0 0 24 24" fill="none">
                            <path
                              d="M3 4h2l2.2 11.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 2-1.6L21 8H6"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <circle cx="10" cy="20" r="1.3" fill="currentColor" />
                            <circle cx="18" cy="20" r="1.3" fill="currentColor" />
                          </svg>
                          Add to Cart
                        </button>
                      )}
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="MainProduct-empty">
                <div className="MainProduct-empty-icon">⌕</div>
                <h3>No products found</h3>
                <p>
                  No products found in this category. Add products in the Admin Panel to display them here.
                </p>
                <button type="button" onClick={clearFilters}>
                  View All Products
                </button>
              </div>
            )}
          </div>

          <div className="MainProduct-bottom-note">
            <span>✓</span>
            Genuine Agricultural Machinery • Direct from Rhinco Equipments • Guaranteed Quality
          </div>
        </main>
      </div>
    </section>
  );
};

export default MainProduct;
