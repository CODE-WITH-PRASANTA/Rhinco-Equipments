
import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./MainProduct.css";

const productData = [
  {
    id: 1,
    name: "Professional Cordless Drill",
    category: "Power Tools",
    price: 3499,
    oldPrice: 4299,
    rating: 4.8,
    reviews: 124,
    badge: "Best Seller",
    image:
      "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=700&q=85",
  },
  {
    id: 2,
    name: "Agriculture Safety Helmet",
    category: "Safety Equipment",
    price: 899,
    oldPrice: 1199,
    rating: 4.6,
    reviews: 86,
    badge: "Popular",
    image:
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=700&q=85",
  },
  {
    id: 3,
    name: "Electric Cutting Machine",
    category: "Power Tools",
    price: 2899,
    oldPrice: 3499,
    rating: 4.7,
    reviews: 93,
    badge: "Trending",
    image:
      "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=700&q=85",
  },
  {
    id: 4,
    name: "Electric Garden Trimmer",
    category: "Garden Tools",
    price: 2499,
    oldPrice: 2999,
    rating: 4.5,
    reviews: 67,
    badge: "",
    image:
      "https://images.unsplash.com/photo-1599685315640-6ec5f1f2f6d7?w=700&q=85",
  },
  {
    id: 5,
    name: "Digital Soil Moisture Meter",
    category: "Farm Accessories",
    price: 1299,
    oldPrice: 1599,
    rating: 4.9,
    reviews: 145,
    badge: "Top Rated",
    image:
      "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=700&q=85",
  },
  {
    id: 6,
    name: "Heavy Duty Cordless Drill",
    category: "Power Tools",
    price: 4599,
    oldPrice: 5299,
    rating: 4.7,
    reviews: 102,
    badge: "",
    image:
      "https://images.unsplash.com/photo-1581147036324-c1c9b4f6a7b4?w=700&q=85",
  },
  {
    id: 7,
    name: "Professional Gardening Gloves",
    category: "Safety Equipment",
    price: 499,
    oldPrice: 699,
    rating: 4.4,
    reviews: 58,
    badge: "Value Deal",
    image:
      "https://images.unsplash.com/photo-1457140072488-2a8e5f8e7b8f?w=700&q=85",
  },
  {
    id: 8,
    name: "Garden Water Sprayer",
    category: "Irrigation",
    price: 799,
    oldPrice: 999,
    rating: 4.6,
    reviews: 75,
    badge: "",
    image:
      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=700&q=85",
  },
  {
    id: 9,
    name: "Heavy Duty Hand Tool Kit",
    category: "Hand Tools",
    price: 1899,
    oldPrice: 2299,
    rating: 4.8,
    reviews: 112,
    badge: "Best Seller",
    image:
      "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=700&q=85",
  },
];

const categories = [
  { name: "All Products", count: 67 },
  { name: "Power Tools", count: 15 },
  { name: "Garden Tools", count: 12 },
  { name: "Safety Equipment", count: 9 },
  { name: "Farm Accessories", count: 11 },
  { name: "Irrigation", count: 8 },
  { name: "Hand Tools", count: 12 },
];

const formatPrice = (price) =>
  `₹${Number(price).toLocaleString("en-IN")}`;

const MainProduct = () => {
  const [activeCategory, setActiveCategory] = useState("All Products");
  const [search, setSearch] = useState("");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(6000);
  const [appliedMin, setAppliedMin] = useState(0);
  const [appliedMax, setAppliedMax] = useState(6000);
  const [sortBy, setSortBy] = useState("featured");
  const [wishlist, setWishlist] = useState([]);
  const [cart, setCart] = useState([]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const filteredProducts = useMemo(() => {
    let products = [...productData];

    if (activeCategory !== "All Products") {
      products = products.filter(
        (product) => product.category === activeCategory
      );
    }

    if (search.trim()) {
      const searchTerm = search.toLowerCase().trim();

      products = products.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm) ||
          product.category.toLowerCase().includes(searchTerm)
      );
    }

    products = products.filter(
      (product) =>
        product.price >= appliedMin && product.price <= appliedMax
    );

    if (sortBy === "price-low") {
      products.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      products.sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating") {
      products.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "name") {
      products.sort((a, b) => a.name.localeCompare(b.name));
    }

    return products;
  }, [activeCategory, search, appliedMin, appliedMax, sortBy]);

  const toggleWishlist = (id) => {
    setWishlist((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id]
    );
  };

  const addToCart = (id) => {
    setCart((previous) => [...previous, id]);
  };

  const applyPriceFilter = () => {
    setAppliedMin(Math.min(minPrice, maxPrice));
    setAppliedMax(Math.max(minPrice, maxPrice));
  };

  const clearFilters = () => {
    setActiveCategory("All Products");
    setSearch("");
    setMinPrice(0);
    setMaxPrice(6000);
    setAppliedMin(0);
    setAppliedMax(6000);
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
                d="m16 16 4 4"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>

            <input
              type="search"
              placeholder="Search products..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
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
                  max="6000"
                  step="100"
                  value={minPrice}
                  onChange={(event) =>
                    setMinPrice(
                      Math.min(Number(event.target.value), maxPrice)
                    )
                  }
                  aria-label="Minimum price"
                  style={{
                    "--MainProduct-range-progress": `${
                      (minPrice / 6000) * 100
                    }%`,
                  }}
                />

                <input
                  type="range"
                  min="0"
                  max="6000"
                  step="100"
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
              <span className="MainProduct-eyebrow">FARMTECH AGRO STORE</span>
              <h1>Explore Our Products</h1>
              <p>
                Quality tools and equipment for smarter farming.
              </p>
            </div>

            <div className="MainProduct-topbar-right">
              <label htmlFor="MainProduct-sort">Sort by:</label>
              <select
                id="MainProduct-sort"
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
              >
                <option value="featured">Featured</option>
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
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <article className="MainProduct-card" key={product.id}>
                  <div className="MainProduct-card-image">
                    {product.badge && (
                      <span className="MainProduct-product-badge">
                        {product.badge}
                      </span>
                    )}

                    <button
                      type="button"
                      className={`MainProduct-wishlist ${
                        wishlist.includes(product.id)
                          ? "MainProduct-wishlist-active"
                          : ""
                      }`}
                      onClick={() => toggleWishlist(product.id)}
                      aria-label={
                        wishlist.includes(product.id)
                          ? "Remove from wishlist"
                          : "Add to wishlist"
                      }
                    >
                      {wishlist.includes(product.id) ? "♥" : "♡"}
                    </button>

                    <Link
                      to={`/product/${product.id}`}
                      className="MainProduct-image-link"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        loading="lazy"
                        className="MainProduct-image"
                      />
                    </Link>
                  </div>

                  <div className="MainProduct-card-content">
                    <span className="MainProduct-product-category">
                      {product.category}
                    </span>

                    <Link
                      to={`/product/${product.id}`}
                      className="MainProduct-product-name"
                    >
                      {product.name}
                    </Link>

                    <div className="MainProduct-rating-row">
                      <span className="MainProduct-stars">
                        {"★".repeat(Math.floor(product.rating))}
                        {"☆".repeat(5 - Math.floor(product.rating))}
                      </span>
                      <span className="MainProduct-rating-value">
                        {product.rating}
                      </span>
                      <span className="MainProduct-review-count">
                        ({product.reviews})
                      </span>
                    </div>

                    <div className="MainProduct-price-row">
                      <div className="MainProduct-product-prices">
                        <strong>{formatPrice(product.price)}</strong>
                        <del>{formatPrice(product.oldPrice)}</del>
                      </div>

                      <span className="MainProduct-discount">
                        {Math.round(
                          ((product.oldPrice - product.price) /
                            product.oldPrice) *
                            100
                        )}
                        % OFF
                      </span>
                    </div>

                    <button
                      type="button"
                      className={`MainProduct-add-cart ${
                        cart.includes(product.id)
                          ? "MainProduct-added-cart"
                          : ""
                      }`}
                      onClick={() => addToCart(product.id)}
                    >
                      {cart.includes(product.id) ? (
                        <>
                          <span>✓</span> Added to Cart
                        </>
                      ) : (
                        <>
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
                        </>
                      )}
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <div className="MainProduct-empty">
                <div className="MainProduct-empty-icon">⌕</div>
                <h3>No products found</h3>
                <p>
                  Try changing your search or adjusting the selected filters.
                </p>
                <button type="button" onClick={clearFilters}>
                  View All Products
                </button>
              </div>
            )}
          </div>

          <div className="MainProduct-bottom-note">
            <span>✓</span>
            Quality products • Trusted service • Reliable delivery
          </div>
        </main>
      </div>
    </section>
  );
};

export default MainProduct;
