import React, { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import "./ProductDetailsOne.css";
import drillImage from "../../assets/machine.jpg";
import { addToCart, toggleWishlist, isInWishlist } from "../../utils/cartWishlist";
import { resolveImageUrl } from "../../utils/helpers";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const PRODUCTS_API = `${API_URL}/products`;
const REVIEWS_API = `${API_URL}/reviews`;

const categories = [
  "Tillage & Cultivation",
  "Harvesting & Threshing",
  "Seeding & Planting",
  "Earthmoving & Levelling",
  "Tractor Attachments",
  "Crop Protection & Sprayers",
];

const ProductDetailsOne = () => {
  const { name: paramName } = useParams();
  const [searchParams] = useSearchParams();
  const idParam = searchParams.get("id");
  const queryName = searchParams.get("name");

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [pincode, setPincode] = useState("");
  const [deliveryMessage, setDeliveryMessage] = useState(
    "Expected Delivery in 4–10 Days"
  );
  const [deliveryStatus, setDeliveryStatus] = useState("default");
  const [activeImage, setActiveImage] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [justAdded, setJustAdded] = useState(false);
  const [minPrice, setMinPrice] = useState(5000);
  const [maxPrice, setMaxPrice] = useState(500000);

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    rating: 5,
    title: "",
    comment: "",
  });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccessMessage, setReviewSuccessMessage] = useState("");

  // FETCH REAL PRODUCT BY NAME OR ID
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await fetch(PRODUCTS_API);
        const result = await res.json();
        if (res.ok && result.success && Array.isArray(result.data)) {
          const rawTarget = paramName || queryName || "";
          const targetName = decodeURIComponent(rawTarget).trim().toLowerCase();

          const found = result.data.find((item) => {
            const pId = String(item._id || item.id || "");
            const title = String(item.title || item.name || "").toLowerCase();

            if (idParam && pId === idParam) return true;
            if (targetName) {
              if (title === targetName) return true;
              if (title.replace(/\s+/g, "-") === targetName.replace(/\s+/g, "-")) return true;
              if (title.includes(targetName) || targetName.includes(title)) return true;
            }
            return false;
          });

          if (found) {
            setProduct(found);
            const primary =
              found.image ||
              (Array.isArray(found.images) && found.images[0]) ||
              drillImage;
            setActiveImage(primary);
          } else if (result.data.length > 0) {
            // Default to first product if not matched
            setProduct(result.data[0]);
            const primary =
              result.data[0].image ||
              (Array.isArray(result.data[0].images) && result.data[0].images[0]) ||
              drillImage;
            setActiveImage(primary);
          }
        }
      } catch (err) {
        console.error("Could not fetch product details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [paramName, idParam, queryName]);

  // Fetch approved customer reviews for this product
  useEffect(() => {
    if (!product) return;
    const pName = product.title || product.name || "";
    if (!pName) return;

    const fetchReviews = async () => {
      setReviewsLoading(true);
      try {
        const res = await fetch(`${REVIEWS_API}?status=Approved&productOrItem=${encodeURIComponent(pName)}`);
        const data = await res.json();
        if (res.ok && data.success && Array.isArray(data.data)) {
          setReviews(data.data);
        }
      } catch (err) {
        console.error("Could not fetch reviews:", err);
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchReviews();
  }, [product]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewForm.customerName.trim() || !reviewForm.comment.trim()) {
      alert("Please fill in your name and comment.");
      return;
    }

    try {
      setReviewSubmitting(true);
      const res = await fetch(REVIEWS_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: reviewForm.customerName.trim(),
          customerEmail: reviewForm.customerEmail.trim(),
          customerPhone: reviewForm.customerPhone.trim(),
          productOrItem: product.title || product.name || "Product",
          itemType: "Product",
          rating: Number(reviewForm.rating) || 5,
          title: reviewForm.title.trim(),
          comment: reviewForm.comment.trim(),
          status: "Pending",
          verifiedPurchase: true,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setReviewSuccessMessage(
          "Thank you for your valuable review!"
        );
        setShowReviewModal(false);
        setReviewForm({
          customerName: "",
          customerEmail: "",
          customerPhone: "",
          rating: 5,
          title: "",
          comment: "",
        });
      } else {
        alert(data.message || "Could not submit review.");
      }
    } catch (err) {
      console.error("Error submitting review:", err);
      alert("Could not submit review. Please try again.");
    } finally {
      setReviewSubmitting(false);
    }
  };

  const formatPrice = (price) =>
    `₹${Number(price || 0).toLocaleString("en-IN")}`;

  const handleDeliveryCheck = (event) => {
    event.preventDefault();

    if (!/^[1-9][0-9]{5}$/.test(pincode)) {
      setDeliveryStatus("error");
      setDeliveryMessage("Please enter a valid 6-digit PIN code.");
      return;
    }

    setDeliveryStatus("success");
    setDeliveryMessage(
      `Delivery available to ${pincode}. Expected delivery in 4–10 days.`
    );
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity);
    setCartCount((previous) => previous + quantity);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 3000);
  };

  const decreaseQuantity = () => {
    setQuantity((previous) => Math.max(1, previous - 1));
  };

  const increaseQuantity = () => {
    setQuantity((previous) => Math.min(99, previous + 1));
  };

  if (loading) {
    return (
      <section className="ProductDetailsOne" style={{ padding: "80px 0", textAlign: "center" }}>
        <div style={{ color: "#166534", fontSize: "16px", fontWeight: 600 }}>
          Loading product details...
        </div>
      </section>
    );
  }

  if (!product) {
    return (
      <section className="ProductDetailsOne" style={{ padding: "80px 0", textAlign: "center" }}>
        <h2>Product Not Found</h2>
        <p style={{ color: "#64748b", margin: "16px 0 24px" }}>
          The requested product could not be found.
        </p>
        <Link
          to="/products"
          style={{
            background: "#166534",
            color: "#fff",
            padding: "10px 20px",
            borderRadius: "6px",
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          Explore All Products
        </Link>
      </section>
    );
  }

  const productName = product.title || product.name || "Product";
  const brandName = product.companyName || product.brand || "Rhinco Equipments";
  const salesPrice = Number(product.finalPrice || product.price || 0);
  const regularPrice = Number(product.oldPrice || product.price || salesPrice);
  const discountPct =
    product.discount ||
    (regularPrice > salesPrice
      ? Math.round(((regularPrice - salesPrice) / regularPrice) * 100)
      : 0);

  const imagesList =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : product.image
      ? [product.image]
      : [drillImage];

  return (
    <section className="ProductDetailsOne">
      <div className="ProductDetailsOne-container">
        {/* Left sidebar */}
        <aside className="ProductDetailsOne-sidebar">
          <form
            className="ProductDetailsOne-search"
            onSubmit={(event) => event.preventDefault()}
          >
            <input
              type="search"
              placeholder="Search..."
              aria-label="Search products"
            />
            <button type="submit" aria-label="Search">
              <svg viewBox="0 0 24 24" fill="none">
                <circle
                  cx="11"
                  cy="11"
                  r="7"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="m16 16 4 4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </form>

          <div className="ProductDetailsOne-categories">
            <h3>Categories</h3>
            <ul>
              {categories.map((category) => (
                <li key={category}>
                  <Link to={`/products?category=${encodeURIComponent(category)}`}>
                    {category}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="ProductDetailsOne-filter-price">
            <h3>Filter by price</h3>
            <div className="ProductDetailsOne-price-slider">
              <input
                type="range"
                min="5000"
                max="500000"
                step="5000"
                value={maxPrice}
                onChange={(event) => setMaxPrice(Number(event.target.value))}
                aria-label="Filter by maximum price"
              />
            </div>
            <div className="ProductDetailsOne-price-row">
              <Link
                to={`/products?minPrice=${minPrice}&maxPrice=${maxPrice}`}
                className="ProductDetailsOne-filter-button"
                style={{ textDecoration: "none", textAlign: "center", lineHeight: "34px" }}
              >
                Filter
              </Link>
              <span>
                {formatPrice(minPrice)} – {formatPrice(maxPrice)}
              </span>
            </div>
          </div>
        </aside>

        {/* Main product image gallery */}
        <div className="ProductDetailsOne-gallery">
          <div className="ProductDetailsOne-main-image">
            <img src={resolveImageUrl(activeImage, drillImage)} alt={productName} />
            {(product.badge || product.bestSeller) && (
              <span className="ProductDetailsOne-image-badge">
                {product.badge || "Best Seller"}
              </span>
            )}
          </div>

          {imagesList.length > 1 && (
            <div className="ProductDetailsOne-thumbnails">
              {imagesList.map((img, idx) => {
                const src = typeof img === "string" ? img : img.preview || img.url;
                return (
                  <button
                    type="button"
                    key={idx}
                    className={`ProductDetailsOne-thumbnail ${
                      activeImage === src ? "ProductDetailsOne-thumbnail-active" : ""
                    }`}
                    onClick={() => setActiveImage(src)}
                    aria-label={`Show product image ${idx + 1}`}
                  >
                    <img src={resolveImageUrl(src, drillImage)} alt={`${productName} view ${idx + 1}`} />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Product information */}
        <div className="ProductDetailsOne-information">
          <span className="ProductDetailsOne-brand">{brandName}</span>

          <h1 className="ProductDetailsOne-title">{productName}</h1>

          <div className="ProductDetailsOne-rating">
            <span className="ProductDetailsOne-stars">
              {"★".repeat(Math.floor(product.rating || 5))}
              {"☆".repeat(5 - Math.floor(product.rating || 5))}
            </span>
            <span className="ProductDetailsOne-rating-number">
              {product.rating || 4.8}
            </span>
            <span className="ProductDetailsOne-review-count">
              ({product.reviews || 12} reviews)
            </span>
          </div>

          <div className="ProductDetailsOne-price">
            <strong>{formatPrice(salesPrice)}</strong>
            {regularPrice > salesPrice && <del>{formatPrice(regularPrice)}</del>}
            {discountPct > 0 && <span>{discountPct}% OFF</span>}
          </div>

          {product.description && (
            <div
              className="ProductDetailsOne-description"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          )}

          <div className="ProductDetailsOne-delivery">
            <h3>Check Delivery Option at Your Location:</h3>

            <form
              className="ProductDetailsOne-pincode-form"
              onSubmit={handleDeliveryCheck}
            >
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="Pincode"
                value={pincode}
                onChange={(event) =>
                  setPincode(event.target.value.replace(/\D/g, ""))
                }
                aria-label="Delivery PIN code"
              />

              <button type="submit">CHECK</button>
            </form>

            <p
              className={`ProductDetailsOne-delivery-message ProductDetailsOne-delivery-${deliveryStatus}`}
              aria-live="polite"
            >
              {deliveryMessage}
            </p>
          </div>

          <div className="ProductDetailsOne-purchase">
            <div className="ProductDetailsOne-quantity">
              <button
                type="button"
                onClick={decreaseQuantity}
                aria-label="Decrease quantity"
                disabled={quantity <= 1}
              >
                −
              </button>

              <input
                type="number"
                min="1"
                max="99"
                value={quantity}
                onChange={(event) => {
                  const value = Number(event.target.value);
                  setQuantity(Math.min(99, Math.max(1, value || 1)));
                }}
                aria-label="Quantity"
              />

              <button
                type="button"
                onClick={increaseQuantity}
                aria-label="Increase quantity"
                disabled={quantity >= 99}
              >
                +
              </button>
            </div>

            <button
              type="button"
              className="ProductDetailsOne-add-cart"
              onClick={handleAddToCart}
              style={
                justAdded || cartCount > 0
                  ? {
                      backgroundColor: "#f0fdf4",
                      color: "#166534",
                      border: "2px solid #0f172a",
                      borderRadius: "10px",
                      fontWeight: 600,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      padding: "10px 24px",
                    }
                  : undefined
              }
            >
              {justAdded || cartCount > 0 ? (
                <>✓ Added to Cart</>
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
                    <circle cx="10" cy="20" r="1.4" fill="currentColor" />
                    <circle cx="18" cy="20" r="1.4" fill="currentColor" />
                  </svg>
                  Add To Cart
                </>
              )}
            </button>

            <button
              type="button"
              style={{
                background: isInWishlist(product._id || product.id) ? "#fef2f2" : "#f0fdf4",
                border: "1.5px solid #166534",
                borderRadius: "8px",
                padding: "0 16px",
                color: isInWishlist(product._id || product.id) ? "#dc2626" : "#166534",
                fontSize: "20px",
                cursor: "pointer",
                height: "44px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s ease",
              }}
              onClick={() => toggleWishlist(product)}
              title={isInWishlist(product._id || product.id) ? "In Wishlist" : "Add to Wishlist"}
              aria-label="Wishlist toggle"
            >
              {isInWishlist(product._id || product.id) ? "♥" : "♡"}
            </button>
          </div>

          <div className="ProductDetailsOne-trust">
            <div>
              <span>✓</span>
              Quality checked products
            </div>
            <div>
              <span>✓</span>
              Secure shopping
            </div>
            <div>
              <span>✓</span>
              Customer support
            </div>
          </div>

          <div className="ProductDetailsOne-cart-note" aria-live="polite">
            {cartCount > 0 && (
              <>
                ✓ {cartCount} item(s) added to cart!
                <Link to="/cart"> View Cart</Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* CUSTOMER REVIEWS & RATINGS SECTION */}
      <div className="ProductReviews-section">
        <div className="ProductReviews-container">
          <div className="ProductReviews-header">
            <div>
              <span className="ProductReviews-eyebrow">VERIFIED FEEDBACK</span>
              <h2 className="ProductReviews-title">Customer Reviews & Ratings</h2>
              <p className="ProductReviews-subtitle">
                Real feedback from verified farmers and equipment owners.
              </p>
            </div>

            <button
              type="button"
              className="ProductReviews-writeBtn"
              onClick={() => {
                setReviewSuccessMessage("");
                setShowReviewModal(true);
              }}
            >
              ★ Write a Review
            </button>
          </div>

          {reviewSuccessMessage && (
            <div className="ProductReviews-successNotice">
              <span className="ProductReviews-successIcon">✓</span>
              <span>{reviewSuccessMessage}</span>
            </div>
          )}

          {reviewsLoading ? (
            <div className="ProductReviews-loading">Loading reviews...</div>
          ) : reviews.length === 0 ? (
            <div className="ProductReviews-empty">
              <div className="ProductReviews-emptyStars">★★★★★</div>
              <h3>No reviews published yet</h3>
              <p>Be the first to share your experience with {productName}!</p>
              <button
                type="button"
                className="ProductReviews-writeBtn outline"
                onClick={() => {
                  setReviewSuccessMessage("");
                  setShowReviewModal(true);
                }}
              >
                Be the first to review
              </button>
            </div>
          ) : (
            <div className="ProductReviews-grid">
              {reviews.map((rev) => (
                <div key={rev._id || rev.id} className="ProductReviews-card">
                  <div className="ProductReviews-cardHeader">
                    <div className="ProductReviews-avatar">
                      {(rev.customerName || "U").slice(0, 1).toUpperCase()}
                    </div>
                    <div className="ProductReviews-customerInfo">
                      <h4>{rev.customerName}</h4>
                      <div className="ProductReviews-starsRow">
                        {"★".repeat(Math.round(rev.rating || 5))}
                        {"☆".repeat(5 - Math.round(rev.rating || 5))}
                        <span className="ProductReviews-ratingScore">{rev.rating || 5}.0</span>
                      </div>
                    </div>
                    {rev.verifiedPurchase && (
                      <span className="ProductReviews-verifiedBadge">✓ Verified Purchase</span>
                    )}
                  </div>

                  {rev.title && <h5 className="ProductReviews-reviewTitle">{rev.title}</h5>}
                  <p className="ProductReviews-comment">{rev.comment}</p>

                  <div className="ProductReviews-date">
                    {new Date(rev.createdAt || Date.now()).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* WRITE A REVIEW MODAL */}
      {showReviewModal && (
        <div className="ProductReviews-modalOverlay" onClick={() => setShowReviewModal(false)}>
          <div className="ProductReviews-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ProductReviews-modalHeader">
              <div>
                <h3>Write a Review</h3>
                <p>Reviewing: <strong>{productName}</strong></p>
              </div>
              <button
                type="button"
                className="ProductReviews-modalClose"
                onClick={() => setShowReviewModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="ProductReviews-modalForm">
              <div className="ProductReviews-ratingSelect">
                <label>Your Overall Rating *</label>
                <div className="ProductReviews-interactiveStars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      className={`ProductReviews-starBtn ${star <= reviewForm.rating ? "active" : ""}`}
                      onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                    >
                      ★
                    </button>
                  ))}
                  <span className="ProductReviews-ratingLabel">
                    {reviewForm.rating} / 5 Stars
                  </span>
                </div>
              </div>

              <div className="ProductReviews-inputGroup">
                <label>Your Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={reviewForm.customerName}
                  onChange={(e) =>
                    setReviewForm({ ...reviewForm, customerName: e.target.value })
                  }
                />
              </div>

              <div className="ProductReviews-formRow">
                <div className="ProductReviews-inputGroup">
                  <label>Email (Optional)</label>
                  <input
                    type="email"
                    placeholder="e.g. ramesh@gmail.com"
                    value={reviewForm.customerEmail}
                    onChange={(e) =>
                      setReviewForm({ ...reviewForm, customerEmail: e.target.value })
                    }
                  />
                </div>
                <div className="ProductReviews-inputGroup">
                  <label>Phone (Optional)</label>
                  <input
                    type="tel"
                    placeholder="e.g. +91 98765 43210"
                    value={reviewForm.customerPhone}
                    onChange={(e) =>
                      setReviewForm({ ...reviewForm, customerPhone: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="ProductReviews-inputGroup">
                <label>Review Headline / Title</label>
                <input
                  type="text"
                  placeholder="e.g. Excellent build quality, performs very well!"
                  value={reviewForm.title}
                  onChange={(e) =>
                    setReviewForm({ ...reviewForm, title: e.target.value })
                  }
                />
              </div>

              <div className="ProductReviews-inputGroup">
                <label>Your Review *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Share details about performance, durability, fuel efficiency, etc."
                  value={reviewForm.comment}
                  onChange={(e) =>
                    setReviewForm({ ...reviewForm, comment: e.target.value })
                  }
                />
              </div>

              <div className="ProductReviews-modalActions">
                <button
                  type="button"
                  className="ProductReviews-cancelBtn"
                  onClick={() => setShowReviewModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reviewSubmitting}
                  className="ProductReviews-submitBtn"
                >
                  {reviewSubmitting ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default ProductDetailsOne;
