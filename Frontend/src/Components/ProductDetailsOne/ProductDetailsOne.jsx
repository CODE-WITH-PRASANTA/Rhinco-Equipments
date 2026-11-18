import React, { useEffect, useState } from "react";
import { Link, useParams, useSearchParams, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Zap,
  Heart,
  Truck,
  RotateCcw,
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  Star,
  Layers,
  FileText,
  MessageSquare,
  Sparkles,
  ChevronRight,
  PackageCheck,
} from "lucide-react";
import "./ProductDetailsOne.css";
import drillImage from "../../assets/machine.jpg";
import { useCart, useWishlist } from "../../context/CartWishlistContext";
import { resolveImageUrl, toProductSlug } from "../../utils/helpers";
import { API_URL } from "../../utils/apiConfig";

const PRODUCTS_API = `${API_URL}/products`;
const REVIEWS_API = `${API_URL}/reviews`;

const ProductDetailsOne = () => {
  const { name: paramName } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const idParam = searchParams.get("id");
  const queryName = searchParams.get("name");

  // Automatically normalize URL slug to remove % and %20 and replace with clean hyphens
  useEffect(() => {
    if (paramName) {
      const cleanSlug = toProductSlug(paramName);
      if (cleanSlug && paramName !== cleanSlug) {
        navigate(`/product/${cleanSlug}`, { replace: true });
      }
    }
  }, [paramName, navigate]);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState("");
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [justAdded, setJustAdded] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

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

  // Fetch real product from database
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await fetch(PRODUCTS_API);
        const result = await res.json();
        if (res.ok && result.success && Array.isArray(result.data)) {
          const rawTarget = paramName || queryName || "";
          const targetSlug = toProductSlug(rawTarget);
          let targetDecoded = "";
          try {
            targetDecoded = decodeURIComponent(rawTarget).trim().toLowerCase();
          } catch (e) {
            targetDecoded = rawTarget.trim().toLowerCase();
          }

          const found = result.data.find((item) => {
            const pId = String(item._id || item.id || "");
            const title = String(item.title || item.name || "");
            const itemSlug = toProductSlug(title);

            if (idParam && pId === idParam) return true;
            if (targetSlug && itemSlug === targetSlug) return true;
            if (targetDecoded) {
              const lowerTitle = title.toLowerCase();
              if (lowerTitle === targetDecoded) return true;
              if (lowerTitle.includes(targetDecoded) || targetDecoded.includes(lowerTitle)) return true;
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
        const res = await fetch(`${REVIEWS_API}?product=${encodeURIComponent(pName)}`);
        const result = await res.json();
        if (res.ok && result.success && Array.isArray(result.data)) {
          setReviews(result.data);
        }
      } catch (err) {
        console.error("Could not fetch reviews:", err);
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchReviews();
  }, [product]);

  // Handle Review submission
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewForm.customerName || !reviewForm.comment) {
      alert("Please provide your name and review feedback.");
      return;
    }

    setReviewSubmitting(true);
    try {
      const pName = product?.title || product?.name || "Product";
      const payload = {
        ...reviewForm,
        productName: pName,
        productId: product?._id || product?.id || "",
        category: product?.category || "Equipment",
      };

      const res = await fetch(REVIEWS_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setReviewSuccessMessage("Thank you! Your verified review has been submitted.");
        setShowReviewModal(false);
        setReviewForm({
          customerName: "",
          customerEmail: "",
          customerPhone: "",
          rating: 5,
          title: "",
          comment: "",
        });
        if (data.data) {
          setReviews((prev) => [data.data, ...prev]);
        }
      } else {
        alert(data.message || "Failed to submit review. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error: Could not submit review.");
    } finally {
      setReviewSubmitting(false);
    }
  };

  const increaseQuantity = () => setQuantity((prev) => Math.min(prev + 1, 99));
  const decreaseQuantity = () => setQuantity((prev) => Math.max(prev - 1, 1));

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 3000);
  };

  const handleBuyNow = () => {
    if (!product) return;
    addToCart(product, quantity);
    navigate("/cart");
  };

  const formatPrice = (price) =>
    Number(price || 0).toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    });

  if (loading) {
    return (
      <section className="ProductDetailsOne-loading-wrap">
        <div className="ProductDetailsOne-spinner" />
        <p>Loading premium product details...</p>
      </section>
    );
  }

  if (!product) {
    return (
      <section className="ProductDetailsOne-empty-wrap">
        <h2>Product Not Found</h2>
        <p>The agricultural equipment you are looking for is currently unavailable or has been moved.</p>
        <Link to="/products" className="ProductDetailsOne-back-btn">
          Explore All Products
        </Link>
      </section>
    );
  }

  const productName = product.title || product.name || "Agricultural Equipment";
  const brandName = product.companyName || product.brand || "Rhinco Verified";
  const categoryName = product.category || "General Equipment";
  const salesPrice = Number(product.finalPrice || product.price || 0);
  const regularPrice = Number(product.oldPrice || product.price || 0);
  const discountPct =
    regularPrice > salesPrice && regularPrice > 0
      ? Math.round(((regularPrice - salesPrice) / regularPrice) * 100)
      : product.discount || 0;

  const imagesList =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : [product.image || drillImage];

  const inWishlist = isInWishlist(product._id || product.id);

  return (
    <section className="ProductDetailsOne">
      <div className="ProductDetailsOne-wrapper">
        {/* BREADCRUMB */}
        <nav className="ProductDetailsOne-breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <ChevronRight size={14} className="crumb-sep" />
          <Link to="/products">Store Products</Link>
          <ChevronRight size={14} className="crumb-sep" />
          <Link to={`/products?category=${encodeURIComponent(categoryName)}`}>{categoryName}</Link>
          <ChevronRight size={14} className="crumb-sep" />
          <span className="crumb-current">{productName}</span>
        </nav>

        {/* HERO TWO-COLUMN SHOWCASE */}
        <div className="ProductDetailsOne-hero">
          {/* LEFT: GALLERY */}
          <div className="ProductDetailsOne-galleryCard">
            <div className="ProductDetailsOne-mainViewport">
              {(product.badge || product.bestSeller) && (
                <span className="ProductDetailsOne-floatingBadge">
                  <Sparkles size={13} />
                  {product.badge || "Best Seller"}
                </span>
              )}

              <button
                type="button"
                className={`ProductDetailsOne-wishlistFloating ${inWishlist ? "active" : ""}`}
                onClick={() => toggleWishlist(product)}
                aria-label="Add to wishlist"
              >
                <Heart size={18} fill={inWishlist ? "#dc2626" : "none"} color={inWishlist ? "#dc2626" : "#475569"} />
              </button>

              <img
                src={resolveImageUrl(activeImage, drillImage)}
                alt={productName}
                className="ProductDetailsOne-heroImg"
                loading="eager"
              />
            </div>

            {/* THUMBNAILS STRIP */}
            {imagesList.length > 1 && (
              <div className="ProductDetailsOne-thumbnailsStrip">
                {imagesList.map((img, idx) => {
                  const src = typeof img === "string" ? img : img.preview || img.url;
                  const isActive = activeImage === src;
                  return (
                    <button
                      type="button"
                      key={idx}
                      className={`ProductDetailsOne-thumbBtn ${isActive ? "active" : ""}`}
                      onClick={() => setActiveImage(src)}
                      aria-label={`View image ${idx + 1}`}
                    >
                      <img src={resolveImageUrl(src, drillImage)} alt={`Thumbnail ${idx + 1}`} />
                    </button>
                  );
                })}
              </div>
            )}

            {/* TRUST HIGHLIGHTS BAR */}
            <div className="ProductDetailsOne-trustBar">
              <div className="ProductDetailsOne-trustItem">
                <Truck size={18} />
                <div>
                  <strong>Free Farm Delivery</strong>
                  <span>Direct to your field/store</span>
                </div>
              </div>
              <div className="ProductDetailsOne-trustItem">
                <ShieldCheck size={18} />
                <div>
                  <strong>1-Year Warranty</strong>
                  <span>100% Genuine OEM Part</span>
                </div>
              </div>
              <div className="ProductDetailsOne-trustItem">
                <RotateCcw size={18} />
                <div>
                  <strong>7-Day Replacement</strong>
                  <span>Hassle-free return policy</span>
                </div>
              </div>
              <div className="ProductDetailsOne-trustItem">
                <CreditCard size={18} />
                <div>
                  <strong>Cash on Delivery</strong>
                  <span>Pay upon field arrival</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: PRODUCT INFO & PURCHASE */}
          <div className="ProductDetailsOne-infoCard">
            <div className="ProductDetailsOne-metaHeader">
              <span className="ProductDetailsOne-brandPill">{brandName}</span>
              <span className="ProductDetailsOne-categoryPill">{categoryName}</span>
            </div>

            <h1 className="ProductDetailsOne-mainTitle">{productName}</h1>

            {/* RATINGS ROW */}
            <div className="ProductDetailsOne-ratingRow">
              <div className="ProductDetailsOne-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={16}
                    fill={star <= Math.floor(product.rating || 5) ? "#f59e0b" : "#e2e8f0"}
                    color={star <= Math.floor(product.rating || 5) ? "#f59e0b" : "#cbd5e1"}
                  />
                ))}
              </div>
              <span className="ProductDetailsOne-ratingScore">{product.rating || 4.8}</span>
              <span className="ProductDetailsOne-ratingDot">•</span>
              <button
                type="button"
                className="ProductDetailsOne-ratingCountLink"
                onClick={() => setActiveTab("reviews")}
              >
                {reviews.length || product.reviews || 12} Verified Customer Reviews
              </button>
            </div>

            {/* PRICE CARD */}
            <div className="ProductDetailsOne-priceCard">
              <div className="ProductDetailsOne-priceNumbers">
                <span className="ProductDetailsOne-currentPrice">{formatPrice(salesPrice)}</span>
                {regularPrice > salesPrice && (
                  <del className="ProductDetailsOne-oldPrice">{formatPrice(regularPrice)}</del>
                )}
                {discountPct > 0 && (
                  <span className="ProductDetailsOne-discountBadge">{discountPct}% OFF</span>
                )}
              </div>
              <p className="ProductDetailsOne-taxNote">
                Inclusive of all taxes & GST • Free Farm Shipping Across India
              </p>
            </div>

            {/* STOCK STATUS */}
            <div className="ProductDetailsOne-stockBadge">
              <span className="stock-dot" />
              <span>In Stock • Ready for Immediate Farm Dispatch</span>
            </div>

            {/* ACTION CONTROLS */}
            <div className="ProductDetailsOne-actionControls">
              <div className="ProductDetailsOne-stepper">
                <button
                  type="button"
                  onClick={decreaseQuantity}
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="ProductDetailsOne-stepperValue">{quantity}</span>
                <button
                  type="button"
                  onClick={increaseQuantity}
                  disabled={quantity >= 99}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                className={`ProductDetailsOne-addToCartBtn ${justAdded ? "added" : ""}`}
                onClick={handleAddToCart}
              >
                <ShoppingCart size={19} />
                <span>{justAdded ? "✓ Added to Cart!" : "Add to Cart"}</span>
              </button>

              <button
                type="button"
                className="ProductDetailsOne-buyNowBtn"
                onClick={handleBuyNow}
              >
                <Zap size={19} />
                <span>Buy Now</span>
              </button>
            </div>

            {/* TOAST FEEDBACK */}
            {justAdded && (
              <div className="ProductDetailsOne-toastAlert">
                <span>✓ Successfully added {quantity} unit(s) of "{productName}" to your cart.</span>
                <Link to="/cart">View Cart & Checkout →</Link>
              </div>
            )}
          </div>
        </div>

        {/* BOTTOM TABBED SECTION */}
        <div className="ProductDetailsOne-tabsCard">
          <div className="ProductDetailsOne-tabsHeader">
            <button
              type="button"
              className={`ProductDetailsOne-tabBtn ${activeTab === "overview" ? "active" : ""}`}
              onClick={() => setActiveTab("overview")}
            >
              <Layers size={18} />
              <span>Overview & Description</span>
            </button>
            <button
              type="button"
              className={`ProductDetailsOne-tabBtn ${activeTab === "specifications" ? "active" : ""}`}
              onClick={() => setActiveTab("specifications")}
            >
              <FileText size={18} />
              <span>Specifications</span>
            </button>
            <button
              type="button"
              className={`ProductDetailsOne-tabBtn ${activeTab === "reviews" ? "active" : ""}`}
              onClick={() => setActiveTab("reviews")}
            >
              <MessageSquare size={18} />
              <span>Customer Reviews ({reviews.length})</span>
            </button>
          </div>

          <div className="ProductDetailsOne-tabBody">
            {/* OVERVIEW TAB */}
            {activeTab === "overview" && (
              <div className="ProductDetailsOne-tabContent">
                <h3 className="ProductDetailsOne-tabHeading">Product Overview</h3>
                {product.description ? (
                  <div
                    className="ProductDetailsOne-richText"
                    dangerouslySetInnerHTML={{ __html: product.description }}
                  />
                ) : (
                  <p className="ProductDetailsOne-defaultDesc">
                    Engineered to the highest agricultural engineering standards, this implement delivers
                    exceptional durability, optimal soil treatment efficiency, and reduced tractor fuel consumption.
                  </p>
                )}

                <div className="ProductDetailsOne-highlightsGrid">
                  <div className="ProductDetailsOne-highlightCard">
                    <CheckCircle2 size={20} className="hl-icon" />
                    <div>
                      <h4>Industrial Grade Steel</h4>
                      <p>Built with heat-treated high tensile steel for resistance against rocky soil and heavy wear.</p>
                    </div>
                  </div>
                  <div className="ProductDetailsOne-highlightCard">
                    <CheckCircle2 size={20} className="hl-icon" />
                    <div>
                      <h4>Tractor Universal Hitch</h4>
                      <p>Compatible with Category 1 & Category 2 tractor three-point hitches across all major brands.</p>
                    </div>
                  </div>
                  <div className="ProductDetailsOne-highlightCard">
                    <CheckCircle2 size={20} className="hl-icon" />
                    <div>
                      <h4>Rhinco Quality Certified</h4>
                      <p>Field tested across multiple soil conditions for reliable operation season after season.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SPECIFICATIONS TAB */}
            {activeTab === "specifications" && (
              <div className="ProductDetailsOne-tabContent">
                <h3 className="ProductDetailsOne-tabHeading">Technical Specifications</h3>
                <div className="ProductDetailsOne-specsTable">
                  <div className="spec-row">
                    <span className="spec-key">Product Name</span>
                    <span className="spec-val">{productName}</span>
                  </div>
                  <div className="spec-row">
                    <span className="spec-key">Brand / Manufacturer</span>
                    <span className="spec-val">{brandName}</span>
                  </div>
                  <div className="spec-row">
                    <span className="spec-key">Category</span>
                    <span className="spec-val">{categoryName}</span>
                  </div>
                  <div className="spec-row">
                    <span className="spec-key">Availability</span>
                    <span className="spec-val">
                      {product.stockQuantity !== undefined
                        ? `${product.stockQuantity} Units In Stock`
                        : "Ready for Dispatch"}
                    </span>
                  </div>
                  <div className="spec-row">
                    <span className="spec-key">Warranty</span>
                    <span className="spec-val">1 Year Official Manufacturer Warranty</span>
                  </div>
                  <div className="spec-row">
                    <span className="spec-key">Country of Origin</span>
                    <span className="spec-val">India</span>
                  </div>
                </div>
              </div>
            )}

            {/* REVIEWS TAB */}
            {activeTab === "reviews" && (
              <div className="ProductDetailsOne-tabContent">
                <div className="ProductReviews-header">
                  <div>
                    <h3 className="ProductDetailsOne-tabHeading">Customer Reviews & Field Ratings</h3>
                    <p className="ProductReviews-subtitle">
                      Feedback from farmers and operators using {productName}.
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
                    <span>✓ {reviewSuccessMessage}</span>
                  </div>
                )}

                {reviewsLoading ? (
                  <div className="ProductReviews-loading">Loading reviews...</div>
                ) : reviews.length === 0 ? (
                  <div className="ProductReviews-empty">
                    <div className="ProductReviews-emptyStars">★★★★★</div>
                    <h4>No reviews published yet</h4>
                    <p>Be the first farmer to share your experience with this product!</p>
                    <button
                      type="button"
                      className="ProductReviews-writeBtn"
                      onClick={() => {
                        setReviewSuccessMessage("");
                        setShowReviewModal(true);
                      }}
                    >
                      Write First Review
                    </button>
                  </div>
                ) : (
                  <div className="ProductReviews-grid">
                    {reviews.map((rev) => (
                      <div key={rev._id || rev.id} className="ProductReviews-card">
                        <div className="ProductReviews-cardHeader">
                          <div className="ProductReviews-avatar">
                            {(rev.customerName || "F").slice(0, 1).toUpperCase()}
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
            )}
          </div>
        </div>
      </div>

      {/* WRITE REVIEW MODAL */}
      {showReviewModal && (
        <div className="ProductReviews-modalOverlay" onClick={() => setShowReviewModal(false)}>
          <div className="ProductReviews-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ProductReviews-modalHeader">
              <h3>Write a Product Review</h3>
              <button
                type="button"
                className="ProductReviews-closeBtn"
                onClick={() => setShowReviewModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="ProductReviews-form">
              <div className="form-group">
                <label>Your Rating *</label>
                <div className="star-rating-select">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button
                      type="button"
                      key={val}
                      className={val <= reviewForm.rating ? "star active" : "star"}
                      onClick={() => setReviewForm({ ...reviewForm, rating: val })}
                    >
                      ★
                    </button>
                  ))}
                  <span className="star-label">{reviewForm.rating} of 5 Stars</span>
                </div>
              </div>

              <div className="form-group">
                <label>Your Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Patel"
                  value={reviewForm.customerName}
                  onChange={(e) => setReviewForm({ ...reviewForm, customerName: e.target.value })}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Mobile Number (for verification)</label>
                  <input
                    type="tel"
                    placeholder="e.g. 9876543210"
                    value={reviewForm.customerPhone}
                    onChange={(e) => setReviewForm({ ...reviewForm, customerPhone: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    placeholder="e.g. ramesh@gmail.com"
                    value={reviewForm.customerEmail}
                    onChange={(e) => setReviewForm({ ...reviewForm, customerEmail: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Review Headline</label>
                <input
                  type="text"
                  placeholder="e.g. High build quality, very satisfied!"
                  value={reviewForm.title}
                  onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Your Review & Experience *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe your farming experience, performance, durability..."
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                />
              </div>

              <button type="submit" disabled={reviewSubmitting} className="ProductReviews-submitBtn">
                {reviewSubmitting ? "Submitting Review..." : "Submit Verified Review"}
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default ProductDetailsOne;
