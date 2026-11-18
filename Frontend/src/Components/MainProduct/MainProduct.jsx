import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ShoppingCart,
  Heart,
  Star,
  Search,
  RotateCcw,
  Sparkles,
  Truck,
  ShieldCheck,
  RotateCcw as ReturnIcon,
  CreditCard,
  SlidersHorizontal,
  ChevronDown,
  Check,
} from "lucide-react";
import "./MainProduct.css";
import {
  getCart,
  addToCart,
  getCartItemQuantity,
  getWishlist,
  toggleWishlist,
  isInWishlist,
} from "../../utils/cartWishlist";
import { resolveImageUrl, toProductSlug } from "../../utils/helpers";
import { API_URL } from "../../utils/apiConfig";

const PRODUCTS_API = `${API_URL}/products`;

const getProductId = (product) => product?._id || product?.id;

const formatPrice = (price) =>
  `₹ ${Number(price || 0).toLocaleString("en-IN")}`;

const MainProduct = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All Products");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [wishlist, setWishlist] = useState(getWishlist);
  const [cart, setCart] = useState(getCart);
  const [addedItemNotice, setAddedItemNotice] = useState("");

  const [searchParams] = useSearchParams();

  useEffect(() => {
    const cat = searchParams.get("category");
    const q = searchParams.get("search");
    if (cat) setActiveCategory(cat);
    if (q) setSearch(q);
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

  // Fetch real products from backend database
  useEffect(() => {
    let isMounted = true;
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await fetch(PRODUCTS_API);
        const result = await res.json();
        if (res.ok && result.success && Array.isArray(result.data)) {
          if (isMounted) setAllProducts(result.data);
        }
      } catch (err) {
        console.error("Error fetching store products:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProducts();
    return () => {
      isMounted = false;
    };
  }, []);

  // Extract categories dynamically from products
  const categoriesList = useMemo(() => {
    const set = new Set();
    allProducts.forEach((p) => {
      if (p.category) set.add(p.category.trim());
    });
    return ["All Products", ...Array.from(set).sort()];
  }, [allProducts]);

  // Filter & sort products
  const filteredProducts = useMemo(() => {
    let list = allProducts.filter((product) => {
      const title = String(product.title || product.name || "").toLowerCase();
      const cat = String(product.category || "").toLowerCase();
      const brand = String(product.companyName || product.brand || "").toLowerCase();
      const desc = String(product.description || "").toLowerCase();
      const q = search.trim().toLowerCase();

      const matchesSearch =
        !q ||
        title.includes(q) ||
        cat.includes(q) ||
        brand.includes(q) ||
        desc.includes(q);

      const matchesCat =
        activeCategory === "All Products" ||
        cat === activeCategory.toLowerCase();

      return matchesSearch && matchesCat;
    });

    if (sortBy === "price-low") {
      list.sort((a, b) => Number(a.finalPrice || a.price || 0) - Number(b.finalPrice || b.price || 0));
    } else if (sortBy === "price-high") {
      list.sort((a, b) => Number(b.finalPrice || b.price || 0) - Number(a.finalPrice || a.price || 0));
    } else if (sortBy === "rating") {
      list.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
    } else if (sortBy === "name") {
      list.sort((a, b) => String(a.title || a.name || "").localeCompare(String(b.title || b.name || "")));
    }

    return list;
  }, [allProducts, search, activeCategory, sortBy]);

  const handleAddToCart = (product, e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    const title = product.title || product.name || "Product";
    setAddedItemNotice(`✓ Added "${title}" to your cart!`);
    setTimeout(() => setAddedItemNotice(""), 2800);
  };

  const handleToggleWishlist = (product, e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const clearFilters = () => {
    setSearch("");
    setActiveCategory("All Products");
    setSortBy("featured");
  };

  return (
    <section className="StoreShowcase">
      {/* HERO BANNER */}
      <div className="StoreShowcase-hero">
        <div className="StoreShowcase-heroContainer">
          <div className="StoreShowcase-heroBadge">
            <Sparkles size={13} />
            <span>OFFICIAL FACTORY STORE • LIVE INVENTORY</span>
          </div>

          <h1 className="StoreShowcase-heroTitle">
            Agricultural Equipment & Implements Store
          </h1>

          <p className="StoreShowcase-heroSubtitle">
            Order verified tractor implements, soil preparation machinery, crop sprayers, and genuine spare parts direct from factory inventory with nationwide farm delivery.
          </p>

          {/* 4 STORE TRUST PILLARS */}
          <div className="StoreShowcase-pillars">
            <div className="StoreShowcase-pillar">
              <Truck size={20} />
              <div>
                <strong>Free Farm Delivery</strong>
                <span>Doorstep field delivery</span>
              </div>
            </div>
            <div className="StoreShowcase-pillar">
              <ShieldCheck size={20} />
              <div>
                <strong>1-Year Warranty</strong>
                <span>100% Genuine OEM parts</span>
              </div>
            </div>
            <div className="StoreShowcase-pillar">
              <ReturnIcon size={20} />
              <div>
                <strong>7-Day Replacement</strong>
                <span>Hassle-free guarantee</span>
              </div>
            </div>
            <div className="StoreShowcase-pillar">
              <CreditCard size={20} />
              <div>
                <strong>Cash on Delivery</strong>
                <span>Pay upon arrival</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TOAST ALERT */}
      {addedItemNotice && (
        <div className="StoreShowcase-toastNotice">
          <span>{addedItemNotice}</span>
          <Link to="/cart">View Cart & Checkout →</Link>
        </div>
      )}

      {/* STORE CONTAINER */}
      <div className="StoreShowcase-container">
        {/* INTERACTIVE CONTROLS BAR */}
        <div className="StoreShowcase-controlsBar">
          <div className="StoreShowcase-searchBox">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search store products by name, category, or brand..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                type="button"
                className="search-clear"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          <div className="StoreShowcase-dropdowns">
            <div className="StoreShowcase-selectWrap">
              <label>Sort By:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="featured">Featured (Best Sellers)</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Customer Rated</option>
                <option value="name">Name: A to Z</option>
              </select>
            </div>

            {(search || activeCategory !== "All Products") && (
              <button
                type="button"
                className="StoreShowcase-clearBtn"
                onClick={clearFilters}
              >
                <RotateCcw size={14} />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* CATEGORY PILLS ROW */}
        <div className="StoreShowcase-pillsRow">
          {categoriesList.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                type="button"
                key={cat}
                className={`StoreShowcase-catPill ${isActive ? "active" : ""}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* RESULTS HEADER */}
        <div className="StoreShowcase-resultsHeader">
          <div>
            <h3>{activeCategory}</h3>
            <p>
              Showing <strong>{filteredProducts.length}</strong> products ready for farm delivery
            </p>
          </div>
          <span className="StoreShowcase-resultsTag">
            ● Quality Verified & Tested for Indian Soil Conditions
          </span>
        </div>

        {/* PRODUCT GRID */}
        {loading ? (
          <div className="StoreShowcase-loading">
            <div className="StoreShowcase-spinner" />
            <p>Loading real store inventory...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="StoreShowcase-empty">
            <ShoppingCart size={48} strokeWidth={1.3} />
            <h3>No products found matching your criteria</h3>
            <p>Try clearing your search query or choosing another category.</p>
            <button
              type="button"
              className="StoreShowcase-resetBtn"
              onClick={clearFilters}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="StoreShowcase-grid">
            {filteredProducts.map((product) => {
              const pId = getProductId(product);
              const inWish = isInWishlist(pId);
              const cartQty = getCartItemQuantity(pId);
              const title = product.title || product.name || "Product";
              const brand = product.companyName || product.brand || "Rhinco Verified";
              const category = product.category || "Equipment";

              const rawImg =
                (Array.isArray(product.images) && product.images[0]) ||
                product.image ||
                "";
              const displayImg = resolveImageUrl(rawImg, "/placeholder.png");

              const regularPrice = Number(product.price || product.oldPrice || 0);
              const salesPrice = Number(product.finalPrice || product.price || 0);
              const discountPct =
                product.discount ||
                (regularPrice > salesPrice && regularPrice > 0
                  ? Math.round(((regularPrice - salesPrice) / regularPrice) * 100)
                  : 0);

              return (
                <article key={pId} className="StoreCard">
                  {/* CARD IMAGE */}
                  <div className="StoreCard-imageArea">
                    {(product.badge || product.bestSeller || discountPct > 0) && (
                      <span className="StoreCard-badge">
                        {product.badge || (discountPct > 0 ? `${discountPct}% OFF` : "Best Seller")}
                      </span>
                    )}

                    <button
                      type="button"
                      className={`StoreCard-wishlistBtn ${inWish ? "active" : ""}`}
                      onClick={(e) => handleToggleWishlist(product, e)}
                      aria-label="Wishlist toggle"
                    >
                      <Heart size={16} fill={inWish ? "#dc2626" : "none"} color={inWish ? "#dc2626" : "#64748b"} />
                    </button>

                    <Link
                      to={`/product/${toProductSlug(title)}`}
                      className="StoreCard-imageLink"
                    >
                      <img
                        src={displayImg}
                        alt={title}
                        loading="lazy"
                        className="StoreCard-img"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.png";
                        }}
                      />
                    </Link>
                  </div>

                  {/* CARD BODY */}
                  <div className="StoreCard-body">
                    <div className="StoreCard-metaRow">
                      <span className="StoreCard-category">{category}</span>
                      <span className="StoreCard-brand">{brand}</span>
                    </div>

                    <h3 className="StoreCard-title">
                      <Link to={`/product/${toProductSlug(title)}`}>
                        {title}
                      </Link>
                    </h3>

                    {/* RATINGS */}
                    <div className="StoreCard-ratingRow">
                      <div className="StoreCard-stars">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={14}
                            fill={star <= Math.floor(product.rating || 5) ? "#f59e0b" : "#e2e8f0"}
                            color={star <= Math.floor(product.rating || 5) ? "#f59e0b" : "#cbd5e1"}
                          />
                        ))}
                      </div>
                      <span className="StoreCard-ratingScore">{product.rating || 4.8}</span>
                      <span className="StoreCard-ratingCount">({product.reviews || 12})</span>
                    </div>

                    {/* PRICE & ADD TO CART */}
                    <div className="StoreCard-footer">
                      <div className="StoreCard-priceArea">
                        <div className="StoreCard-prices">
                          <span className="StoreCard-currentPrice">{formatPrice(salesPrice)}</span>
                          {regularPrice > salesPrice && (
                            <del className="StoreCard-oldPrice">{formatPrice(regularPrice)}</del>
                          )}
                        </div>
                        <span className="StoreCard-taxTag">Incl. of GST & Delivery</span>
                      </div>

                      <button
                        type="button"
                        className={`StoreCard-addBtn ${cartQty > 0 ? "in-cart" : ""}`}
                        onClick={(e) => handleAddToCart(product, e)}
                        title="Add to cart"
                      >
                        <ShoppingCart size={16} />
                        <span>{cartQty > 0 ? `Added (${cartQty})` : "Add"}</span>
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default MainProduct;
