import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  ShoppingCart,
  Heart,
  Star,
  Search,
  RotateCcw,
  Sparkles,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  Filter,
  Phone,
  Package,
  Plus,
  Minus,
} from "lucide-react";
import "./MainProduct.css";
import { useCart, useWishlist } from "../../context/CartWishlistContext";
import { resolveImageUrl, toProductSlug } from "../../utils/helpers";
import { API_URL } from "../../utils/apiConfig";

const PRODUCTS_API = `${API_URL}/products`;
const HELPLINE_PHONE = "+91 98765 43210";
const HELPLINE_TEL = "+919876543210";

const getProductId = (product) => product?._id || product?.id;

const formatPrice = (price) =>
  `₹ ${Number(price || 0).toLocaleString("en-IN")}`;

const MainProduct = () => {
  const navigate = useNavigate();
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter States
  const [activeCategory, setActiveCategory] = useState("All Products");
  const [search, setSearch] = useState("");
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [priceRange, setPriceRange] = useState("all");
  const [minDiscount, setMinDiscount] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState("relevance");

  // Mobile Filter Drawer State
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Collapsible Sections State (Flipkart style)
  const [collapsedSections, setCollapsedSections] = useState({
    categories: false,
    brand: false,
    price: false,
    discount: false,
    availability: false,
    rating: false,
  });

  const toggleSection = (key) => {
    setCollapsedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const [brandSearch, setBrandSearch] = useState("");
  const { addToCart, updateCartQuantity, getCartItemQuantity } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [addedItemNotice, setAddedItemNotice] = useState("");

  const [searchParams] = useSearchParams();

  useEffect(() => {
    const cat = searchParams.get("category");
    const q = searchParams.get("search");
    if (cat) setActiveCategory(cat);
    if (q) setSearch(q);
  }, [searchParams]);

  // Fetch real products from backend database
  useEffect(() => {
    let isMounted = true;
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await fetch(PRODUCTS_API);
        const data = await res.json();
        if (res.ok && data.success && Array.isArray(data.data)) {
          if (isMounted) setAllProducts(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch products:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProducts();
    return () => {
      isMounted = false;
    };
  }, []);

  // Compute categories and brands with counts dynamically
  const { categoryList, brandList } = useMemo(() => {
    const catMap = {};
    const brandMap = {};

    allProducts.forEach((p) => {
      const cat = (p.category || "General").trim();
      catMap[cat] = (catMap[cat] || 0) + 1;

      const b = (p.brand || "Rhinco").trim();
      brandMap[b] = (brandMap[b] || 0) + 1;
    });

    const sortedCats = Object.keys(catMap)
      .sort((a, b) => a.localeCompare(b))
      .map((c) => ({ name: c, count: catMap[c] }));

    const sortedBrands = Object.keys(brandMap)
      .sort((a, b) => a.localeCompare(b))
      .map((b) => ({ name: b, count: brandMap[b] }));

    return {
      categoryList: sortedCats,
      brandList: sortedBrands,
    };
  }, [allProducts]);

  // Toggle brand selection
  const handleToggleBrand = (brandName) => {
    setSelectedBrands((prev) =>
      prev.includes(brandName)
        ? prev.filter((b) => b !== brandName)
        : [...prev, brandName]
    );
  };

  // Reset all filters
  const handleResetFilters = () => {
    setActiveCategory("All Products");
    setSearch("");
    setSelectedBrands([]);
    setPriceRange("all");
    setMinDiscount(0);
    setInStockOnly(false);
    setMinRating(0);
    setSortBy("relevance");
  };

  const hasActiveFilters =
    search.trim() !== "" ||
    activeCategory !== "All Products" ||
    selectedBrands.length > 0 ||
    priceRange !== "all" ||
    minDiscount > 0 ||
    inStockOnly ||
    minRating > 0;

  // Filter & Sort Products
  const filteredProducts = useMemo(() => {
    let list = allProducts.filter((product) => {
      const name = (product.name || product.title || "").toLowerCase();
      const desc = (product.description || "").toLowerCase();
      const cat = (product.category || "").toLowerCase();
      const brand = (product.brand || "").toLowerCase();

      // Search keyword filter
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matches =
          name.includes(q) ||
          desc.includes(q) ||
          cat.includes(q) ||
          brand.includes(q);
        if (!matches) return false;
      }

      // Category filter
      if (
        activeCategory !== "All Products" &&
        cat !== activeCategory.toLowerCase()
      ) {
        return false;
      }

      // Brand filter
      if (selectedBrands.length > 0) {
        const itemBrand = (product.brand || "Rhinco").trim();
        if (!selectedBrands.includes(itemBrand)) return false;
      }

      // Price range filter
      const price = Number(product.salesPrice || product.price || 0);
      if (priceRange === "under500" && price >= 500) return false;
      if (priceRange === "500to2000" && (price < 500 || price > 2000))
        return false;
      if (priceRange === "2000to5000" && (price < 2000 || price > 5000))
        return false;
      if (priceRange === "above5000" && price <= 5000) return false;

      // Discount filter
      const reg = Number(product.regularPrice || product.mrp || price);
      const disc = reg > price ? Math.round(((reg - price) / reg) * 100) : 0;
      if (minDiscount > 0 && disc < minDiscount) return false;

      // Stock availability filter
      if (inStockOnly) {
        const inStock =
          product.stockStatus === "In Stock" ||
          product.inStock === true ||
          Number(product.stockQuantity || 1) > 0;
        if (!inStock) return false;
      }

      // Rating filter
      if (minRating > 0) {
        const r = Number(product.rating || 4.8);
        if (r < minRating) return false;
      }

      return true;
    });

    // Sorting
    if (sortBy === "priceAsc") {
      list.sort(
        (a, b) =>
          Number(a.salesPrice || a.price || 0) -
          Number(b.salesPrice || b.price || 0)
      );
    } else if (sortBy === "priceDesc") {
      list.sort(
        (a, b) =>
          Number(b.salesPrice || b.price || 0) -
          Number(a.salesPrice || a.price || 0)
      );
    } else if (sortBy === "rating") {
      list.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
    } else if (sortBy === "discount") {
      list.sort((a, b) => {
        const discA =
          Number(a.regularPrice || a.price || 0) -
          Number(a.salesPrice || a.price || 0);
        const discB =
          Number(b.regularPrice || b.price || 0) -
          Number(b.salesPrice || b.price || 0);
        return discB - discA;
      });
    }

    return list;
  }, [
    allProducts,
    search,
    activeCategory,
    selectedBrands,
    priceRange,
    minDiscount,
    inStockOnly,
    minRating,
    sortBy,
  ]);

  // Add to cart handler
  const handleAddToCart = (product, e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);

    const title = product.name || product.title || "Item";
    setAddedItemNotice(`Added "${title}" to your cart`);
    setTimeout(() => setAddedItemNotice(""), 3000);
  };

  // Quantity increment/decrement handler
  const handleUpdateQuantity = (productId, delta, e) => {
    e.preventDefault();
    e.stopPropagation();
    updateCartQuantity(productId, delta);
  };

  // Toggle wishlist handler
  const handleToggleWishlist = (product, e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <div className="FkProducts-wrapper">
      {/* Toast Notice */}
      {addedItemNotice && (
        <div className="FkProducts-toast">
          <Check size={16} />
          <span>{addedItemNotice}</span>
        </div>
      )}

      <div className="FkProducts-container FkProducts-layout">
        {/* MOBILE CONTROLS BAR */}
        <div className="FkProducts-mobileControls">
          <button
            type="button"
            className="FkProducts-mobileFilterBtn"
            onClick={() => setMobileFilterOpen(true)}
          >
            <Filter size={16} />
            <span>Filters ({hasActiveFilters ? "Active" : "All"})</span>
          </button>
          <div className="FkProducts-mobileResultsCount">
            {filteredProducts.length} Products Found
          </div>
        </div>

        {/* Backdrop for mobile drawer */}
        {mobileFilterOpen && (
          <div
            className="FkProducts-sidebarOverlay"
            onClick={() => setMobileFilterOpen(false)}
            aria-label="Close filters backdrop"
          />
        )}

        {/* ================= LEFT SIDEBAR (FLIPKART / FACEBOOK STYLE) ================= */}
        <aside
          className={`FkProducts-sidebar ${
            mobileFilterOpen ? "FkProducts-sidebar--mobileOpen" : ""
          }`}
        >
          <div className="FkProducts-sidebarCard">
            {/* Header */}
            <div className="FkProducts-filterHeader">
              <div className="FkProducts-filterTitleRow">
                <SlidersHorizontal size={18} className="FkProducts-filterIcon" />
                <span className="FkProducts-filterHeading">Filters</span>
              </div>
              {hasActiveFilters && (
                <button
                  type="button"
                  className="FkProducts-clearBtn"
                  onClick={handleResetFilters}
                >
                  CLEAR ALL
                </button>
              )}
              {mobileFilterOpen && (
                <button
                  type="button"
                  className="FkProducts-closeDrawerBtn"
                  onClick={() => setMobileFilterOpen(false)}
                  aria-label="Close filters"
                >
                  <X size={20} />
                </button>
              )}
            </div>

            {/* Active Chips */}
            {hasActiveFilters && (
              <div className="FkProducts-activeChips">
                {activeCategory !== "All Products" && (
                  <span className="FkProducts-chip">
                    {activeCategory}
                    <button
                      type="button"
                      onClick={() => setActiveCategory("All Products")}
                    >
                      ×
                    </button>
                  </span>
                )}
                {selectedBrands.map((b) => (
                  <span key={b} className="FkProducts-chip">
                    {b}
                    <button type="button" onClick={() => handleToggleBrand(b)}>
                      ×
                    </button>
                  </span>
                ))}
                {priceRange !== "all" && (
                  <span className="FkProducts-chip">
                    {priceRange === "under500"
                      ? "Under ₹500"
                      : priceRange === "500to2000"
                      ? "₹500 - ₹2,000"
                      : priceRange === "2000to5000"
                      ? "₹2,000 - ₹5,000"
                      : "Above ₹5,000"}
                    <button
                      type="button"
                      onClick={() => setPriceRange("all")}
                    >
                      ×
                    </button>
                  </span>
                )}
                {minDiscount > 0 && (
                  <span className="FkProducts-chip">
                    {minDiscount}%+ Off
                    <button
                      type="button"
                      onClick={() => setMinDiscount(0)}
                    >
                      ×
                    </button>
                  </span>
                )}
                {inStockOnly && (
                  <span className="FkProducts-chip">
                    In Stock
                    <button
                      type="button"
                      onClick={() => setInStockOnly(false)}
                    >
                      ×
                    </button>
                  </span>
                )}
                {minRating > 0 && (
                  <span className="FkProducts-chip">
                    {minRating}★ & above
                    <button type="button" onClick={() => setMinRating(0)}>
                      ×
                    </button>
                  </span>
                )}
              </div>
            )}

            {/* SECTION 1: CATEGORIES (FLIPKART STYLE) */}
            <div className="FkProducts-section">
              <div
                className="FkProducts-sectionHeader"
                onClick={() => toggleSection("categories")}
              >
                <span>CATEGORIES</span>
                {collapsedSections.categories ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronUp size={16} />
                )}
              </div>
              {!collapsedSections.categories && (
                <div className="FkProducts-catList">
                  <button
                    type="button"
                    className={`FkProducts-catItem ${
                      activeCategory === "All Products" ? "active" : ""
                    }`}
                    onClick={() => setActiveCategory("All Products")}
                  >
                    <span className="FkProducts-catName">All Products</span>
                    <span className="FkProducts-catCount">
                      {allProducts.length}
                    </span>
                  </button>
                  {categoryList.map((cat) => (
                    <button
                      type="button"
                      key={cat.name}
                      className={`FkProducts-catItem ${
                        activeCategory === cat.name ? "active" : ""
                      }`}
                      onClick={() => setActiveCategory(cat.name)}
                    >
                      <span className="FkProducts-catName">{cat.name}</span>
                      <span className="FkProducts-catCount">{cat.count}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* SECTION 2: BRAND */}
            <div className="FkProducts-section">
              <div
                className="FkProducts-sectionHeader"
                onClick={() => toggleSection("brand")}
              >
                <span>BRAND</span>
                {collapsedSections.brand ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronUp size={16} />
                )}
              </div>
              {!collapsedSections.brand && (
                <div className="FkProducts-sectionBody">
                  {brandList.length > 5 && (
                    <div className="FkProducts-filterSearchBox">
                      <Search size={14} />
                      <input
                        type="text"
                        placeholder="Search Brand"
                        value={brandSearch}
                        onChange={(e) => setBrandSearch(e.target.value)}
                      />
                    </div>
                  )}
                  <div className="FkProducts-checkboxList">
                    {brandList
                      .filter((b) =>
                        b.name.toLowerCase().includes(brandSearch.toLowerCase())
                      )
                      .map((b) => {
                        const isChecked = selectedBrands.includes(b.name);
                        return (
                          <label
                            key={b.name}
                            className={`FkProducts-checkboxRow ${
                              isChecked ? "checked" : ""
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggleBrand(b.name)}
                            />
                            <span className="FkProducts-customCheck">
                              {isChecked && <Check size={12} />}
                            </span>
                            <span className="FkProducts-labelTxt">{b.name}</span>
                            <span className="FkProducts-labelCount">
                              ({b.count})
                            </span>
                          </label>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 3: PRICE RANGE */}
            <div className="FkProducts-section">
              <div
                className="FkProducts-sectionHeader"
                onClick={() => toggleSection("price")}
              >
                <span>PRICE</span>
                {collapsedSections.price ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronUp size={16} />
                )}
              </div>
              {!collapsedSections.price && (
                <div className="FkProducts-sectionBody">
                  <div className="FkProducts-checkboxList">
                    {[
                      { key: "all", label: "Any Price" },
                      { key: "under500", label: "Under ₹500" },
                      { key: "500to2000", label: "₹500 - ₹2,000" },
                      { key: "2000to5000", label: "₹2,000 - ₹5,000" },
                      { key: "above5000", label: "Above ₹5,000" },
                    ].map((pr) => (
                      <label key={pr.key} className="FkProducts-checkboxRow">
                        <input
                          type="radio"
                          name="priceFilter"
                          checked={priceRange === pr.key}
                          onChange={() => setPriceRange(pr.key)}
                        />
                        <span className="FkProducts-customRadio" />
                        <span className="FkProducts-labelTxt">{pr.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 4: DISCOUNT */}
            <div className="FkProducts-section">
              <div
                className="FkProducts-sectionHeader"
                onClick={() => toggleSection("discount")}
              >
                <span>DISCOUNT</span>
                {collapsedSections.discount ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronUp size={16} />
                )}
              </div>
              {!collapsedSections.discount && (
                <div className="FkProducts-sectionBody">
                  <div className="FkProducts-checkboxList">
                    {[10, 20, 30].map((d) => (
                      <label key={d} className="FkProducts-checkboxRow">
                        <input
                          type="radio"
                          name="discountFilter"
                          checked={minDiscount === d}
                          onChange={() =>
                            setMinDiscount(minDiscount === d ? 0 : d)
                          }
                        />
                        <span className="FkProducts-customRadio" />
                        <span className="FkProducts-labelTxt">
                          {d}% or more
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 5: AVAILABILITY */}
            <div className="FkProducts-section">
              <div
                className="FkProducts-sectionHeader"
                onClick={() => toggleSection("availability")}
              >
                <span>AVAILABILITY</span>
                {collapsedSections.availability ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronUp size={16} />
                )}
              </div>
              {!collapsedSections.availability && (
                <div className="FkProducts-sectionBody">
                  <label className="FkProducts-checkboxRow">
                    <input
                      type="checkbox"
                      checked={inStockOnly}
                      onChange={(e) => setInStockOnly(e.target.checked)}
                    />
                    <span className="FkProducts-customCheck">
                      {inStockOnly && <Check size={12} />}
                    </span>
                    <span className="FkProducts-labelTxt">
                      In Stock Only
                    </span>
                  </label>
                </div>
              )}
            </div>

            {/* SECTION 6: CUSTOMER RATINGS */}
            <div className="FkProducts-section">
              <div
                className="FkProducts-sectionHeader"
                onClick={() => toggleSection("rating")}
              >
                <span>CUSTOMER RATINGS</span>
                {collapsedSections.rating ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronUp size={16} />
                )}
              </div>
              {!collapsedSections.rating && (
                <div className="FkProducts-sectionBody">
                  <div className="FkProducts-checkboxList">
                    {[4, 3].map((star) => (
                      <label key={star} className="FkProducts-checkboxRow">
                        <input
                          type="radio"
                          name="prodRatingFilter"
                          checked={minRating === star}
                          onChange={() =>
                            setMinRating(minRating === star ? 0 : star)
                          }
                        />
                        <span className="FkProducts-customRadio" />
                        <span className="FkProducts-starRow">
                          <span>{star}★ & above</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* SIDEBAR HELPLINE CARD */}
            <div className="FkProducts-sidebarHelpline">
              <div className="FkProducts-helplineIcon">
                <Phone size={18} />
              </div>
              <div className="FkProducts-helplineBody">
                <span className="FkProducts-helplineLabel">
                  Order & Support Helpline
                </span>
                <a
                  href={`tel:${HELPLINE_TEL}`}
                  className="FkProducts-helplineNumber"
                >
                  {HELPLINE_PHONE}
                </a>
                <span className="FkProducts-helplineSub">
                  Farm Equipment & Spare Parts
                </span>
              </div>
            </div>
          </div>
        </aside>

        {/* ================= RIGHT MAIN AREA ================= */}
        <main className="FkProducts-main">
          {/* Top Utility Bar (Search, Result Count, Sort By) */}
          <div className="FkProducts-utilityBar">
            <div className="FkProducts-searchWrap">
              <Search size={16} className="FkProducts-searchIcon" />
              <input
                type="text"
                placeholder="Search products, spares, brands, or categories..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="FkProducts-searchInput"
              />
              {search && (
                <button
                  type="button"
                  className="FkProducts-searchClear"
                  onClick={() => setSearch("")}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="FkProducts-utilityRight">
              <span className="FkProducts-resultsCount">
                Showing <strong>{filteredProducts.length}</strong> items
              </span>

              <div className="FkProducts-sortWrap">
                <span className="FkProducts-sortLabel">Sort By:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="FkProducts-sortSelect"
                >
                  <option value="relevance">Relevance</option>
                  <option value="priceAsc">Price -- Low to High</option>
                  <option value="priceDesc">Price -- High to Low</option>
                  <option value="discount">Biggest Discount</option>
                  <option value="rating">Customer Rating</option>
                </select>
              </div>
            </div>
          </div>

          {/* Products Grid Area */}
          {loading ? (
            <div className="FkProducts-loadingState">
              <div className="FkProducts-spinner" />
              <p>Loading farm products and spare parts...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="FkProducts-emptyState">
              <Package size={48} strokeWidth={1.3} />
              <h3>No products match your current filters</h3>
              <p>
                Try changing your category selection, removing brand filters, or
                resetting all filters.
              </p>
              <button
                type="button"
                className="FkProducts-emptyResetBtn"
                onClick={handleResetFilters}
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="FkProducts-grid">
              {filteredProducts.map((product) => {
                const id = getProductId(product);
                const title = product.name || product.title || "Agri Equipment";
                const brand = product.brand || "Rhinco";
                const category = product.category || "Farm Gear";
                const slug = toProductSlug(product);

                const salesPrice = Number(product.salesPrice || product.price || 0);
                const regularPrice = Number(
                  product.regularPrice || product.mrp || salesPrice
                );
                const discount =
                  regularPrice > salesPrice
                    ? Math.round(((regularPrice - salesPrice) / regularPrice) * 100)
                    : 0;

                const primaryImg =
                  product.image ||
                  product.featuredImage ||
                  (Array.isArray(product.images) && product.images[0]) ||
                  "";

                const inWish = isInWishlist(id);
                const cartQty = getCartItemQuantity(id);

                return (
                  <article
                    key={id}
                    className="FkProducts-card"
                    onClick={() => navigate(`/product/${slug}`)}
                    style={{ cursor: "pointer" }}
                  >
                    {/* Media */}
                    <div className="FkProducts-cardMedia">
                      <Link to={`/product/${slug}`} className="FkProducts-imgLink">
                        {primaryImg ? (
                          <img
                            src={resolveImageUrl(primaryImg)}
                            alt={title}
                            className="FkProducts-img"
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="FkProducts-imgFallback">
                            <Package size={40} strokeWidth={1.2} />
                          </div>
                        )}
                      </Link>

                      {discount > 0 && (
                        <span className="FkProducts-discountBadge">
                          {discount}% OFF
                        </span>
                      )}

                      <button
                        type="button"
                        className={`FkProducts-wishlistBtn ${inWish ? "active" : ""}`}
                        onClick={(e) => handleToggleWishlist(product, e)}
                        title={inWish ? "Remove from wishlist" : "Add to wishlist"}
                      >
                        <Heart
                          size={16}
                          fill={inWish ? "#ef4444" : "none"}
                          color={inWish ? "#ef4444" : "#64748b"}
                        />
                      </button>
                    </div>

                    {/* Body */}
                    <div className="FkProducts-cardBody">
                      <div className="FkProducts-metaRow">
                        <span className="FkProducts-brandPill">{brand}</span>
                        <span className="FkProducts-categoryPill">{category}</span>
                      </div>

                      <h3 className="FkProducts-cardTitle">
                        <Link to={`/product/${slug}`} title={title}>
                          {title}
                        </Link>
                      </h3>

                      {/* Ratings */}
                      <div className="FkProducts-ratingRow">
                        <div className="FkProducts-stars">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              size={12}
                              fill={
                                s <= Math.floor(product.rating || 5)
                                  ? "#f59e0b"
                                  : "#e2e8f0"
                              }
                              color={
                                s <= Math.floor(product.rating || 5)
                                  ? "#f59e0b"
                                  : "#cbd5e1"
                              }
                            />
                          ))}
                        </div>
                        <span className="FkProducts-ratingNum">
                          {product.rating || 4.8}
                        </span>
                        <span className="FkProducts-reviewCount">
                          ({product.reviews || 12})
                        </span>
                      </div>

                      {/* Footer */}
                      <div className="FkProducts-cardFooter">
                        <div className="FkProducts-priceArea">
                          <div className="FkProducts-prices">
                            <span className="FkProducts-currentPrice">
                              {formatPrice(salesPrice)}
                            </span>
                            {regularPrice > salesPrice && (
                              <del className="FkProducts-oldPrice">
                                {formatPrice(regularPrice)}
                              </del>
                            )}
                          </div>
                          <span className="FkProducts-taxTag">
                            Incl. GST & Pan-India Delivery
                          </span>
                        </div>

                        {cartQty > 0 ? (
                          <div
                            className="FkProducts-qtyControl"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                          >
                            <button
                              type="button"
                              className="FkProducts-qtyBtn FkProducts-qtyMinus"
                              onClick={(e) => handleUpdateQuantity(id, -1, e)}
                              aria-label="Decrease quantity"
                              title="Decrease quantity"
                            >
                              <Minus size={13} strokeWidth={2.5} />
                            </button>
                            <span className="FkProducts-qtyCount">{cartQty}</span>
                            <button
                              type="button"
                              className="FkProducts-qtyBtn FkProducts-qtyPlus"
                              onClick={(e) => handleUpdateQuantity(id, 1, e)}
                              aria-label="Increase quantity"
                              title="Increase quantity"
                            >
                              <Plus size={13} strokeWidth={2.5} />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="FkProducts-addBtn"
                            onClick={(e) => handleAddToCart(product, e)}
                            title="Add to cart"
                          >
                            <ShoppingCart size={15} />
                            <span>Add</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default MainProduct;
