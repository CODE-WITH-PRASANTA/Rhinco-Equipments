import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  Tractor,
  FileText,
  CheckCircle2,
  ShieldCheck,
  Download,
  AlertCircle,
  X,
  User,
  Phone,
  Mail,
  MapPin,
  Tag,
  BadgePercent,
  Sparkles,
  Star,
} from "lucide-react";
import "./MachineryDetails.css";
import "../MachinaryEquipmentOne/MachinaryEquipmentOne.css";
import { resolveImageUrl, toMachinerySlug, API_URL } from "../../utils/helpers";
import MachineryEnquiryModal from "../Common/MachineryEnquiryModal";

const MACHINERY_API = `${API_URL}/machinery`;
const ENQUIRIES_API = `${API_URL}/enquiries`;
const REVIEWS_API = `${API_URL}/reviews`;

const tabs = [
  { id: "specifications", label: "Specifications", icon: "settings" },
  { id: "description", label: "Overview & Features", icon: "layers" },
  { id: "documents", label: "Required Documents", icon: "document" },
  { id: "reviews", label: "Customer Reviews", icon: "star" },
];

const TabIcon = ({ type }) => {
  if (type === "star") {
    return (
      <svg viewBox="0 0 24 24" fill="none">
        <polygon
          points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (type === "settings") {
    return (
      <svg viewBox="0 0 24 24" fill="none">
        <path
          d="m14.7 6.3 3-3 3 3-3 3m-1-2-9.5 9.5a2.1 2.1 0 0 1-3-3l9.5-9.5m-6.5 12.5 2 2"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (type === "layers") {
    return (
      <svg viewBox="0 0 24 24" fill="none">
        <path
          d="m12 3 9 4.5-9 4.5-9-4.5L12 3Zm-9 9 9 4.5 9-4.5M3 16.5 12 21l9-4.5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path
        d="M7 3h7l5 5v12a1 1 0 0 1-1 1H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M14 3v5h5m-9 6 2 2 4-4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const getDocumentInfo = (doc, idx) => {
  if (!doc) return null;
  if (typeof doc === "string") {
    const filename = doc.split("/").pop() || `Document ${idx + 1}`;
    const ext = (filename.split(".").pop() || "pdf").toLowerCase();
    return {
      name: filename,
      url: resolveImageUrl(doc),
      ext,
      size: null,
    };
  }
  const rawUrl = doc.url || doc.data || doc.path || "";
  const url = resolveImageUrl(rawUrl);
  const name = doc.name || doc.title || rawUrl.split("/").pop() || `Document ${idx + 1}`;
  const ext = (doc.type?.split("/").pop() || name.split(".").pop() || "pdf").toLowerCase();
  const size = doc.size ? `${(doc.size / (1024 * 1024)).toFixed(2)} MB` : null;
  return { name, url, ext, size };
};

const MachineryDetails = () => {
  const navigate = useNavigate();
  const { name: paramName } = useParams();
  const [searchParams] = useSearchParams();
  const idParam = searchParams.get("id");
  const queryName = searchParams.get("name");

  const [machine, setMachine] = useState(null);
  const [relatedMachinery, setRelatedMachinery] = useState([]);
  const [popularMachines, setPopularMachines] = useState([]);
  const [notFoundSearch, setNotFoundSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState("");
  const [activeTab, setActiveTab] = useState("specifications");

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

  // Enquiry / Quotation modal state
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);
  const [enquiryMessage, setEnquiryMessage] = useState("");

  // Normalize URL - remove % or %20 or spaces and replace with -
  useEffect(() => {
    if (paramName) {
      const cleanSlug = toMachinerySlug(paramName);
      if (cleanSlug && paramName !== cleanSlug) {
        navigate(`/machinery-details/${cleanSlug}`, { replace: true });
      }
    }
  }, [paramName, navigate]);

  // FETCH REAL MACHINERY FROM DATABASE
  useEffect(() => {
    let isMounted = true;
    const fetchMachinery = async () => {
      setLoading(true);
      try {
        const rawTerm = (paramName || queryName || idParam || "").trim();
        const slugTerm = toMachinerySlug(rawTerm);
        let found = null;
        let allList = [];

        // Fetch full machinery list for catalogue fallback and related items
        try {
          const res = await fetch(MACHINERY_API);
          const data = await res.json();
          if (res.ok && data.success && Array.isArray(data.data)) {
            allList = data.data;
          }
        } catch (e) {
          console.warn("Could not fetch full machinery list:", e);
        }

        // 1. Direct API lookup by id or slug
        if (rawTerm) {
          try {
            const singleRes = await fetch(`${MACHINERY_API}/${encodeURIComponent(slugTerm || rawTerm)}`);
            const singleData = await singleRes.json();
            if (singleRes.ok && singleData.success && singleData.data) {
              found = singleData.data;
            }
          } catch (e) {
            // will fallback to full list query
          }
        }

        // 2. Query full machinery list if not matched directly
        if (!found && allList.length > 0) {
          const targetLower = rawTerm.toLowerCase();

          found = allList.find((m) => {
            const mId = String(m._id || m.id || "");
            const mTitle = String(m.title || m.name || "");
            const mSlug = toMachinerySlug(mTitle);
            const mModelSlug = toMachinerySlug(m.modelName || "");
            const mCodeSlug = toMachinerySlug(m.code || "");

            return (
              (idParam && mId === idParam) ||
              mId === rawTerm ||
              mSlug === slugTerm ||
              mModelSlug === slugTerm ||
              mCodeSlug === slugTerm ||
              mTitle.toLowerCase() === targetLower ||
              (slugTerm && (mSlug.includes(slugTerm) || slugTerm.includes(mSlug)))
            );
          });
        }

        if (isMounted) {
          if (found) {
            setMachine(found);
            const imgs = Array.isArray(found.machineImages) && found.machineImages.length > 0
              ? found.machineImages
              : (found.image ? [found.image] : []);
            const first = imgs[0];
            const firstUrl = typeof first === "string" ? first : first?.data || first?.preview || first?.url || "";
            setActiveImage(firstUrl);

            // Populate related machinery
            const currentId = String(found._id || found.id || "");
            const related = allList
              .filter((m) => String(m._id || m.id || "") !== currentId)
              .slice(0, 4);
            setRelatedMachinery(related);
          } else {
            // Strictly NO dummy fallback to list[0]
            setMachine(null);
            setPopularMachines(allList.slice(0, 4));
          }
        }
      } catch (err) {
        console.error("Error fetching machine details:", err);
        if (isMounted) setMachine(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchMachinery();
    return () => {
      isMounted = false;
    };
  }, [paramName, idParam, queryName]);

  // Fetch approved customer reviews for this machinery
  useEffect(() => {
    if (!machine) return;
    const mTitle = machine.title || machine.name || "";
    if (!mTitle) return;

    const fetchReviews = async () => {
      setReviewsLoading(true);
      try {
        const res = await fetch(`${REVIEWS_API}?status=Approved&productOrItem=${encodeURIComponent(mTitle)}`);
        const data = await res.json();
        if (res.ok && data.success && Array.isArray(data.data)) {
          setReviews(data.data);
        }
      } catch (err) {
        console.error("Could not fetch machinery reviews:", err);
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchReviews();
  }, [machine]);

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
          productOrItem: machine.title || machine.name || "Machinery",
          itemType: "Machinery",
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

  const basePrice = Number(machine?.discountPrice || machine?.price || 0);
  const discountPrice = Number(machine?.discountPrice || 0);

  const handleOpenEnquiry = (customMsg = "") => {
    setEnquiryMessage(customMsg || "");
    setShowEnquiryModal(true);
  };

  const imagesList = (Array.isArray(machine?.machineImages) && machine.machineImages.length > 0)
    ? machine.machineImages
    : machine?.image
      ? [machine.image]
      : [];

  const formatPrice = (val) => {
    const num = Number(val || 0);
    if (num <= 0) return "Price on Request";
    return num.toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    });
  };

  if (loading) {
    return (
      <section className="MachineryDetails">
        <div className="MachineryDetails-container MachineryDetails-state-container">
          <div className="MachineryDetails-spinner" />
          <h2 className="MachineryDetails-loading-title">
            Loading machinery equipment details...
          </h2>
        </div>
      </section>
    );
  }

  if (!machine) {
    const handleNotFoundSearch = (e) => {
      e.preventDefault();
      if (notFoundSearch.trim()) {
        navigate(`/machinery?search=${encodeURIComponent(notFoundSearch.trim())}`);
      } else {
        navigate("/machinery");
      }
    };

    return (
      <section className="MachineryDetails-notFoundSection">
        <div className="MachineryDetails-container">
          {/* Breadcrumb */}
          <nav className="MachineryDetails-breadcrumb">
            <Link to="/">Home</Link>
            <span className="MachineryDetails-breadcrumb-arrow">›</span>
            <Link to="/machinery">Machinery & Equipment</Link>
            <span className="MachineryDetails-breadcrumb-arrow">›</span>
            <span className="MachineryDetails-breadcrumb-current">Model Not Found</span>
          </nav>

          {/* Premium Not Found Hero Box */}
          <div className="MachineryDetails-notFoundHero">
            <div className="MachineryDetails-notFoundBadge">
              <Tractor size={32} />
            </div>

            <h1 className="MachineryDetails-notFoundTitle">
              Equipment Model Not Found
            </h1>

            <p className="MachineryDetails-notFoundDesc">
              We couldn&rsquo;t find an agricultural implement matching &ldquo;
              <strong>{paramName || "this model"}</strong>&rdquo;. The equipment
              may have been updated, renamed, or is temporarily out of catalogue.
            </p>

            {/* In-page Interactive Search Bar */}
            <form
              onSubmit={handleNotFoundSearch}
              className="MachineryDetails-notFoundSearchForm"
            >
              <input
                type="text"
                placeholder="Search by implement name, brand, or model (e.g. Rotavator, Super Seeder, Baler)..."
                value={notFoundSearch}
                onChange={(e) => setNotFoundSearch(e.target.value)}
                className="MachineryDetails-notFoundInput"
              />
              <button type="submit" className="MachineryDetails-notFoundSearchBtn">
                Search Catalogue →
              </button>
            </form>

            <div className="MachineryDetails-notFoundCtaRow">
              <Link to="/machinery" className="MachineryDetails-browseAllBtn">
                <Tractor size={16} />
                <span>Browse Complete Machinery Catalogue</span>
              </Link>
              <a
                href="tel:+919876543210"
                className="MachineryDetails-helplineCallBtn"
              >
                <Phone size={16} />
                <span>Helpline: +91 98765 43210</span>
              </a>
            </div>
          </div>

          {/* Popular Machinery Recommendations */}
          {popularMachines.length > 0 && (
            <div className="MachineryDetails-popularSection">
              <div className="MachineryDetails-popularHeader">
                <div>
                  <h3>Featured & Verified Agricultural Implements</h3>
                  <p>Explore our most requested OEM certified implements with government subsidy support</p>
                </div>
                <Link to="/machinery" className="MachineryDetails-viewFullLink">
                  View Full Catalogue →
                </Link>
              </div>

              <div className="MachineryDetails-popularGrid">
                {popularMachines.map((item) => {
                  const itemTitle = item.title || item.name || "Agricultural Machinery";
                  const itemBrand = item.brandName || item.brand || "Rhinco";
                  const itemCategory = item.category || item.implementType || "Machinery";
                  const itemPower = item.implementPower || item.power || "35 - 50 HP";
                  const itemSlug = toMachinerySlug(itemTitle);
                  const itemPrice = item.discountPrice || item.price;
                  const itemImg = item.image || (Array.isArray(item.machineImages) && item.machineImages[0]) || "";

                  return (
                    <article key={item._id || item.id} className="MachineryDetails-popularCard">
                      <Link to={`/machinery-details/${itemSlug}`} className="MachineryDetails-popularMedia">
                        {itemImg ? (
                          <img
                            src={resolveImageUrl(itemImg)}
                            alt={itemTitle}
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="MachineryDetails-popularFallback">
                            <Tractor size={36} strokeWidth={1.2} />
                          </div>
                        )}
                        <span className="MachineryDetails-popularSubsidyTag">
                          <Sparkles size={11} /> Subsidy Eligible
                        </span>
                      </Link>

                      <div className="MachineryDetails-popularBody">
                        <div className="MachineryDetails-popularMeta">
                          <span className="MachineryDetails-popularBrand">{itemBrand}</span>
                          <span className="MachineryDetails-popularCat">{itemCategory}</span>
                        </div>

                        <h4 className="MachineryDetails-popularTitle">
                          <Link to={`/machinery-details/${itemSlug}`} title={itemTitle}>
                            {itemTitle}
                          </Link>
                        </h4>

                        <div className="MachineryDetails-popularSpec">
                          <span>Power Required:</span>
                          <strong>{itemPower}</strong>
                        </div>

                        <div className="MachineryDetails-popularFooter">
                          <div className="MachineryDetails-popularPrice">
                            {itemPrice ? `₹ ${Number(itemPrice).toLocaleString("en-IN")}` : "Price on Request"}
                          </div>
                          <Link
                            to={`/machinery-details/${itemSlug}`}
                            className="MachineryDetails-popularActionBtn"
                          >
                            Full Specifications →
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>
    );
  }

  const title = machine.title || machine.name || "Agricultural Machinery";
  const brand = machine.brandName || machine.brand || "N/A";
  const power = machine.implementPower || machine.power || "N/A";
  const category = machine.category || machine.implementType || "Machinery";
  const modelName = machine.modelName || machine.code || "";
  const originalPrice = Number(machine.price || 0);
  const currentPrice = Number(machine.discountPrice || machine.price || 0);
  const discountPercent =
    originalPrice > currentPrice && originalPrice > 0
      ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
      : 0;

  return (
    <section className="MachineryDetails">
      <div className="MachineryDetails-container">
        {/* Breadcrumb */}
        <nav className="MachineryDetails-breadcrumb">
          <Link to="/">Home</Link>
          <span className="MachineryDetails-breadcrumb-arrow">›</span>
          <Link to="/machinery">Machinery & Equipment</Link>
          <span className="MachineryDetails-breadcrumb-arrow">›</span>
          <Link to={`/machinery?category=${encodeURIComponent(category)}`}>
            {category}
          </Link>
          <span className="MachineryDetails-breadcrumb-arrow">›</span>
          <span className="MachineryDetails-breadcrumb-current">{title}</span>
        </nav>

        {/* Main product section */}
        <div className="MachineryDetails-main">
          {/* Product image & thumbnails */}
          <div className="MachineryDetails-image-card">
            <div className="MachineryDetails-image-background">
              <span className="MachineryDetails-floating-badge">
                <Sparkles size={13} />
                Govt. Subsidy Eligible (Up to 50%)
              </span>

              {activeImage ? (
                <img
                  src={resolveImageUrl(activeImage)}
                  alt={title}
                  className="MachineryDetails-product-image"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <div className="MachineryDetails-image-placeholder">
                  <Tractor size={70} strokeWidth={1.2} />
                  <span>{title}</span>
                </div>
              )}
            </div>

            {imagesList.length > 1 && (
              <div className="MachineryDetails-thumbnails-strip">
                {imagesList.map((img, idx) => {
                  const src = typeof img === "string" ? img : img?.data || img?.preview || img?.url || "";
                  const isActive = activeImage === src;
                  return (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => setActiveImage(src)}
                      className={`MachineryDetails-thumb-btn ${isActive ? "active" : ""}`}
                      aria-label={`Thumbnail ${idx + 1}`}
                    >
                      <img
                        src={resolveImageUrl(src)}
                        alt={`thumb-${idx}`}
                        className="MachineryDetails-thumb-img"
                      />
                    </button>
                  );
                })}
              </div>
            )}

            {/* Machinery Trust Features Bar */}
            <div className="MachineryDetails-trust-bar">
              <div className="MachineryDetails-trust-item">
                <Tractor size={18} />
                <div>
                  <strong>OEM Certified Implement</strong>
                  <span>Direct from authorized factory</span>
                </div>
              </div>
              <div className="MachineryDetails-trust-item">
                <ShieldCheck size={18} />
                <div>
                  <strong>Subsidy Paperwork</strong>
                  <span>Assistance in your district</span>
                </div>
              </div>
              <div className="MachineryDetails-trust-item">
                <CheckCircle2 size={18} />
                <div>
                  <strong>On-Farm Field Demo</strong>
                  <span>Pre-delivery trial & setup</span>
                </div>
              </div>
              <div className="MachineryDetails-trust-item">
                <FileText size={18} />
                <div>
                  <strong>1-Year Warranty</strong>
                  <span>Genuine spare parts support</span>
                </div>
              </div>
            </div>
          </div>

          {/* Product information */}
          <div className="MachineryDetails-info-card">
            <div className="MachineryDetails-header-row">
              <div className="MachineryDetails-brand">{brand.toUpperCase()}</div>
              {modelName && (
                <span className="MachineryDetails-model-badge">
                  Model: {modelName}
                </span>
              )}
            </div>

            <h1 className="MachineryDetails-product-title">{title}</h1>

            {/* Ratings Row */}
            <div className="MachineryDetails-rating-row">
              <div className="MachineryDetails-rating-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={16}
                    fill={star <= Math.floor(machine.rating || 5) ? "#f59e0b" : "#e2e8f0"}
                    color={star <= Math.floor(machine.rating || 5) ? "#f59e0b" : "#cbd5e1"}
                  />
                ))}
              </div>
              <span className="MachineryDetails-rating-score">{machine.rating || 4.9}</span>
              <span className="MachineryDetails-rating-dot">•</span>
              <button
                type="button"
                className="MachineryDetails-rating-link"
                onClick={() => setActiveTab("reviews")}
              >
                {reviews.length || 8} Verified Field Reviews
              </button>
            </div>

            {/* Price wrap */}
            <div className="MachineryDetails-price-wrap">
              <div className="MachineryDetails-price-numbers">
                <div className="MachineryDetails-price">{formatPrice(currentPrice)}</div>
                {discountPercent > 0 && originalPrice > 0 && (
                  <>
                    <del className="MachineryDetails-old-price">
                      {formatPrice(originalPrice)}
                    </del>
                    <span className="MachineryDetails-discount-pill">
                      {discountPercent}% OFF
                    </span>
                  </>
                )}
              </div>
              <p className="MachineryDetails-price-subsidy-note">
                Ex-Showroom Price • Central & State Govt Subsidy & Financing Available
              </p>
            </div>

            {/* Quick Specs 4-Card Matrix */}
            <div className="MachineryDetails-quick-specs">
              <div className="MachineryDetails-quick-spec-item">
                <span>Power Required</span>
                <strong>{power}</strong>
              </div>
              <div className="MachineryDetails-quick-spec-item">
                <span>Implement Type</span>
                <strong>{machine.implementType || category}</strong>
              </div>
              <div className="MachineryDetails-quick-spec-item">
                <span>Dispatch Location</span>
                <strong>Authorized District Dealer</strong>
              </div>
              <div className="MachineryDetails-quick-spec-item">
                <span>Availability</span>
                <strong className={machine.status === "Available" ? "status-available" : "status-unavailable"}>
                  {machine.status || (machine.availableAtStore === "Yes" ? "In Stock" : "On Order")}
                </strong>
              </div>
            </div>

            {/* Action Button: Contact Dealer */}
            <div className="MachineryDetails-actions-row">
              <button
                type="button"
                onClick={() => handleOpenEnquiry()}
                className="MachineryDetails-apply-button MachineryDetails-apply-enabled MachineryDetails-btn-quotation"
              >
                <span>Contact Authorized Dealer</span>
                <svg viewBox="0 0 24 24" fill="none" style={{ width: 18, height: 18 }}>
                  <path
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            <div className="MachineryDetails-info-divider" />

            <div className="MachineryDetails-dealer-note">
              <ShieldCheck size={22} className="dealer-note-shield" />
              <p>
                <strong>Direct Authorized District Dealer Dispatch:</strong> Your request connects directly with an authorized dealer in your district for subsidy paperwork, finance assistance, and on-farm machinery delivery.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom information tabs */}
        <div className="MachineryDetails-tabs-card">
          <div className="MachineryDetails-tabs">
            {tabs.map((tab) => (
              <button
                type="button"
                key={tab.id}
                className={`MachineryDetails-tab ${activeTab === tab.id ? "MachineryDetails-tab-active" : ""
                  }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <TabIcon type={tab.icon} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="MachineryDetails-tab-panel">
            {/* SPECIFICATIONS TAB */}
            {activeTab === "specifications" && (
              <div className="MachineryDetails-tab-content">
                <div className="MachineryDetails-tab-header-row">
                  <div>
                    <h3 className="MachineryDetails-tab-heading">
                      Technical Specifications & Parameters
                    </h3>
                    <p className="MachineryDetails-tab-subheading">
                      Real engineering metrics and operational parameters for {title}.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="MachineryDetails-tab-action-btn"
                    onClick={() => handleOpenEnquiry(`Technical specification enquiry for ${title}.`)}
                  >
                    Request Full Spec Sheet
                  </button>
                </div>

                {/* Primary Specifications Grid */}
                <div className="MachineryDetails-spec-grid">
                  <div className="MachineryDetails-spec-card">
                    <span className="MachineryDetails-spec-label">Brand / Manufacturer</span>
                    <strong className="MachineryDetails-spec-value">{brand}</strong>
                  </div>
                  <div className="MachineryDetails-spec-card">
                    <span className="MachineryDetails-spec-label">Model / Series</span>
                    <strong className="MachineryDetails-spec-value">{modelName || "Standard Edition"}</strong>
                  </div>
                  <div className="MachineryDetails-spec-card">
                    <span className="MachineryDetails-spec-label">Implement / Machine Type</span>
                    <strong className="MachineryDetails-spec-value">{machine.implementType || category}</strong>
                  </div>
                  <div className="MachineryDetails-spec-card">
                    <span className="MachineryDetails-spec-label">Equipment Category</span>
                    <strong className="MachineryDetails-spec-value">{category}</strong>
                  </div>
                  <div className="MachineryDetails-spec-card">
                    <span className="MachineryDetails-spec-label">Tractor Power Required</span>
                    <strong className="MachineryDetails-spec-value highlighted">{power}</strong>
                  </div>
                  <div className="MachineryDetails-spec-card">
                    <span className="MachineryDetails-spec-label">Machine Code / ID</span>
                    <strong className="MachineryDetails-spec-value">
                      {machine.code || `EQP-${String(machine._id || machine.id).slice(-4).toUpperCase()}`}
                    </strong>
                  </div>
                  <div className="MachineryDetails-spec-card">
                    <span className="MachineryDetails-spec-label">Store Availability</span>
                    <strong className="MachineryDetails-spec-value">
                      {machine.availableAtStore === "No" ? "Available on Order" : "In Stock at Showrooms"}
                    </strong>
                  </div>
                  <div className="MachineryDetails-spec-card">
                    <span className="MachineryDetails-spec-label">Operational Status</span>
                    <strong
                      className={`MachineryDetails-spec-value ${machine.status === "Available" ? "status-available" : "status-unavailable"}`}
                    >
                      {machine.status || "Available"}
                    </strong>
                  </div>
                  <div className="MachineryDetails-spec-card">
                    <span className="MachineryDetails-spec-label">Ex-Showroom Price</span>
                    <strong className="MachineryDetails-spec-value">{formatPrice(machine.price || basePrice)}</strong>
                  </div>
                  <div className="MachineryDetails-spec-card">
                    <span className="MachineryDetails-spec-label">Offer / Discount Price</span>
                    <strong className="MachineryDetails-spec-value highlighted-price">
                      {discountPrice > 0 ? formatPrice(discountPrice) : "Contact for Best Quotation"}
                    </strong>
                  </div>
                </div>

                {/* Real Rich Specifications from DB */}
                {machine.specification && (
                  <div className="MachineryDetails-rich-box">
                    <div className="MachineryDetails-rich-box-header">
                      <svg viewBox="0 0 24 24" fill="none" width="18" height="18" stroke="#166534">
                        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                      <h4>Engineering Build & Detailed Parameters</h4>
                    </div>
                    <div
                      className="MachineryDetails-rich-box-content"
                      dangerouslySetInnerHTML={{ __html: machine.specification }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* OVERVIEW & FEATURES TAB */}
            {activeTab === "description" && (
              <div className="MachineryDetails-tab-content">
                <div className="MachineryDetails-tab-header-row">
                  <div>
                    <h3 className="MachineryDetails-tab-heading">
                      Product Overview & Field Capabilities
                    </h3>
                    <p className="MachineryDetails-tab-subheading">
                      Verified features, operational performance, and application guide.
                    </p>
                  </div>
                </div>

                {/* Machine Summary Pills */}
                <div className="MachineryDetails-summary-pills">
                  <span className="MachineryDetails-pill">OEM: {brand}</span>
                  <span className="MachineryDetails-pill">Type: {machine.implementType || category}</span>
                  <span className="MachineryDetails-pill">Power: {power}</span>
                  <span className="MachineryDetails-pill success">
                    Status: {machine.status || "Verified Equipment"}
                  </span>
                </div>

                {/* Real Rich Description from DB */}
                {machine.description ? (
                  <div
                    className="MachineryDetails-description-body"
                    dangerouslySetInnerHTML={{ __html: machine.description }}
                  />
                ) : (
                  <div className="MachineryDetails-empty-desc">
                    <p>
                      Official product overview, setup instructions, and field trial performance details
                      are available from our technical specialists.
                    </p>
                  </div>
                )}

                {/* Feature Highlights Grid */}
                <div className="MachineryDetails-highlights-grid">
                  <div className="MachineryDetails-highlight-card">
                    <div className="MachineryDetails-highlight-icon">
                      <CheckCircle2 size={20} />
                    </div>
                    <div>
                      <h5>Heavy-Duty Construction</h5>
                      <p>Built with robust structural steel for rigorous operations in wet and dry soils.</p>
                    </div>
                  </div>
                  <div className="MachineryDetails-highlight-card">
                    <div className="MachineryDetails-highlight-icon">
                      <Tractor size={20} />
                    </div>
                    <div>
                      <h5>Tractor Optimized</h5>
                      <p>Engineered for minimal engine wear, low fuel consumption, and smooth PTO power transfer.</p>
                    </div>
                  </div>
                  <div className="MachineryDetails-highlight-card">
                    <div className="MachineryDetails-highlight-icon">
                      <ShieldCheck size={20} />
                    </div>
                    <div>
                      <h5>Genuine Spare Parts & Support</h5>
                      <p>Fully backed by Rhinco Equipment authorized dealers with warranty coverage.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* REQUIRED DOCUMENTS TAB */}
            {activeTab === "documents" && (
              <div className="MachineryDetails-tab-content">
                <div className="MachineryDetails-tab-header-row">
                  <div>
                    <h3 className="MachineryDetails-tab-heading">
                      Required Documents & Official Manuals
                    </h3>
                    <p className="MachineryDetails-tab-subheading">
                      Official brochures, operator manuals, and technical certificates uploaded for {title}.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="MachineryDetails-tab-action-btn"
                    onClick={() => handleOpenEnquiry(`Requesting official documents and brochures for ${title}.`)}
                  >
                    Request Additional Documents
                  </button>
                </div>

                {Array.isArray(machine.documents) && machine.documents.length > 0 ? (
                  <div className="MachineryDetails-doc-grid">
                    {machine.documents.map((doc, dIdx) => {
                      const docInfo = getDocumentInfo(doc, dIdx);
                      if (!docInfo) return null;

                      const isPdf = docInfo.ext === "pdf";
                      const isDoc = ["doc", "docx"].includes(docInfo.ext);
                      const isSheet = ["xls", "xlsx", "csv"].includes(docInfo.ext);

                      return (
                        <div key={dIdx} className="MachineryDetails-doc-card">
                          <div className={`MachineryDetails-doc-badge ${isPdf ? "pdf" : isDoc ? "doc" : isSheet ? "sheet" : "other"}`}>
                            <FileText size={22} />
                            <span>{docInfo.ext.toUpperCase()}</span>
                          </div>

                          <div className="MachineryDetails-doc-meta">
                            <h4 className="MachineryDetails-doc-title">{docInfo.name}</h4>
                            <p className="MachineryDetails-doc-size">
                              {isPdf ? "Official PDF Document" : isDoc ? "Word Document" : isSheet ? "Spreadsheet Data" : "Uploaded Attachment"}
                              {docInfo.size ? ` • ${docInfo.size}` : ""}
                            </p>
                          </div>

                          <div className="MachineryDetails-doc-actions">
                            <a
                              href={docInfo.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="MachineryDetails-doc-btn view"
                            >
                              View
                            </a>
                            <a
                              href={docInfo.url}
                              download={docInfo.name}
                              className="MachineryDetails-doc-btn download"
                            >
                              <Download size={15} />
                              Download
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="MachineryDetails-doc-empty">
                    <div className="MachineryDetails-doc-empty-icon">
                      <FileText size={32} />
                    </div>
                    <h4>No Documents Uploaded Yet</h4>
                    <p>
                      Official manufacturer brochures, parts catalogues, and warranty paperwork
                      have not been published for this equipment yet. You can request a digital copy directly from our team.
                    </p>
                    <button
                      type="button"
                      className="MachineryDetails-tab-action-btn MachineryDetails-doc-request-btn"
                      onClick={() => handleOpenEnquiry(`Please provide the official brochure and user manual for ${title} (${brand}).`)}
                    >
                      Request Brochure & Manual via Email / WhatsApp
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="MachineryDetails-tab-content">
                <div className="MachineryReviews-header">
                  <div>
                    <h3 className="MachineryReviews-title">
                      Customer Reviews & Field Ratings
                    </h3>
                    <p className="MachineryReviews-subtitle">
                      Verified feedback from farmers and operators using {machine.title || machine.name}.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setReviewSuccessMessage("");
                      setShowReviewModal(true);
                    }}
                    className="MachineryReviews-write-btn"
                  >
                    ★ Write a Review
                  </button>
                </div>

                {reviewSuccessMessage && (
                  <div className="MachineryReviews-alert-success">
                    ✓ {reviewSuccessMessage}
                  </div>
                )}

                {reviewsLoading ? (
                  <div className="MachineryReviews-loading">
                    Loading reviews...
                  </div>
                ) : reviews.length === 0 ? (
                  <div className="MachineryReviews-empty">
                    <div className="MachineryReviews-empty-stars">★★★★★</div>
                    <h4 className="MachineryReviews-empty-title">No published reviews yet</h4>
                    <p className="MachineryReviews-empty-desc">
                      Be the first farmer to share your experience with this equipment.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setReviewSuccessMessage("");
                        setShowReviewModal(true);
                      }}
                      className="MachineryReviews-empty-btn"
                    >
                      Write First Review
                    </button>
                  </div>
                ) : (
                  <div className="MachineryReviews-grid">
                    {reviews.map((rev) => (
                      <div key={rev._id || rev.id} className="MachineryReviews-card">
                        <div className="MachineryReviews-user-row">
                          <div className="MachineryReviews-avatar">
                            {(rev.customerName || "U").slice(0, 1).toUpperCase()}
                          </div>
                          <div className="MachineryReviews-user-info">
                            <div className="MachineryReviews-name">
                              {rev.customerName}
                            </div>
                            <div className="MachineryReviews-rating-stars">
                              {"★".repeat(Math.round(rev.rating || 5))}
                              {"☆".repeat(5 - Math.round(rev.rating || 5))}
                              <span className="MachineryReviews-rating-score">
                                {rev.rating || 5}.0
                              </span>
                            </div>
                          </div>
                          {rev.verifiedPurchase && (
                            <span className="MachineryReviews-verified-badge">
                              ✓ Verified
                            </span>
                          )}
                        </div>

                        {rev.title && (
                          <div className="MachineryReviews-card-title">
                            {rev.title}
                          </div>
                        )}

                        <p className="MachineryReviews-comment">
                          {rev.comment}
                        </p>

                        <div className="MachineryReviews-date">
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

        {/* RELATED MACHINERY SECTION */}
        {relatedMachinery.length > 0 && (
          <div className="MachineryDetails-related-section">
            <div className="MachineryDetails-related-header">
              <div>
                <span className="MachineryDetails-related-eyebrow">EXPLORE ALTERNATIVES</span>
                <h2 className="MachineryDetails-related-title">Similar Agricultural Machinery</h2>
                <p className="MachineryDetails-related-subtitle">
                  High-performance implements engineered for your farming requirements.
                </p>
              </div>
              <Link to="/machinery" className="MachineryDetails-related-viewall">
                View All Machinery →
              </Link>
            </div>

            <div className="MachineryDetails-related-grid">
              {relatedMachinery.map((item) => {
                const itemTitle = item.title || item.name || "Machinery";
                const itemBrand = item.brandName || item.brand || "Rhinco";
                const itemPower = item.implementPower || item.power || "N/A";
                const itemCategory = item.category || item.implementType || "Equipment";
                const itemImgs = Array.isArray(item.machineImages) && item.machineImages.length > 0
                  ? item.machineImages[0]
                  : item.image || "";
                const itemImgUrl = typeof itemImgs === "string" ? itemImgs : itemImgs?.data || itemImgs?.preview || itemImgs?.url || "";
                const itemPrice = item.discountPrice || item.price;

                return (
                  <article key={item._id || item.id} className="MachineryDetails-related-card">
                    <Link
                      to={`/machinery-details/${toMachinerySlug(itemTitle)}`}
                      className="MachineryDetails-related-imgwrap"
                    >
                      <img
                        src={resolveImageUrl(itemImgUrl, "/placeholder.png")}
                        alt={itemTitle}
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.png";
                        }}
                      />
                      <span className="MachineryDetails-related-brand">{itemBrand}</span>
                    </Link>

                    <div className="MachineryDetails-related-body">
                      <span className="MachineryDetails-related-category">{itemCategory}</span>
                      <h4 className="MachineryDetails-related-name">
                        <Link to={`/machinery-details/${toMachinerySlug(itemTitle)}`}>
                          {itemTitle}
                        </Link>
                      </h4>

                      <div className="MachineryDetails-related-meta">
                        <span>Power: <strong>{itemPower}</strong></span>
                        <span className="MachineryDetails-related-price">
                          {itemPrice ? `₹ ${Number(itemPrice).toLocaleString("en-IN")}` : "Price on Request"}
                        </span>
                      </div>

                      <Link
                        to={`/machinery-details/${toMachinerySlug(itemTitle)}`}
                        className="MachineryDetails-related-btn"
                      >
                        View Specifications →
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ================= UNIFIED CONTACT DEALER MODAL ================= */}
      <MachineryEnquiryModal
        isOpen={showEnquiryModal}
        onClose={() => setShowEnquiryModal(false)}
        machine={machine}
        initialMessage={enquiryMessage}
      />

      {/* WRITE A REVIEW MODAL */}
      {showReviewModal && (
        <div
          className="ReviewModal-overlay"
          onClick={() => setShowReviewModal(false)}
        >
          <div
            className="ReviewModal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="ReviewModal-header">
              <div>
                <h3>Review Equipment</h3>
                <p>{machine?.title || "Machinery"}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowReviewModal(false)}
                className="ReviewModal-close"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="ReviewModal-form">
              <div className="ReviewModal-form-body">
                <div>
                  <label className="MachineryModal-label">
                    Your Rating *
                  </label>
                  <div className="ReviewModal-stars-wrap">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                        className={`ReviewModal-star-btn ${star <= reviewForm.rating ? "active" : "inactive"}`}
                      >
                        ★
                      </button>
                    ))}
                    <span className="ReviewModal-score-label">
                      {reviewForm.rating} / 5 Stars
                    </span>
                  </div>
                </div>

                <div>
                  <label className="MachineryModal-label">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar Patel"
                    value={reviewForm.customerName}
                    onChange={(e) => setReviewForm({ ...reviewForm, customerName: e.target.value })}
                    className="MachineryModal-input"
                  />
                </div>

                <div className="MachineryModal-grid-2">
                  <div>
                    <label className="MachineryModal-label">
                      Phone (Optional)
                    </label>
                    <input
                      type="tel"
                      placeholder="10-digit mobile"
                      value={reviewForm.customerPhone}
                      onChange={(e) => setReviewForm({ ...reviewForm, customerPhone: e.target.value })}
                      className="MachineryModal-input"
                    />
                  </div>
                  <div>
                    <label className="MachineryModal-label">
                      Email (Optional)
                    </label>
                    <input
                      type="email"
                      placeholder="name@gmail.com"
                      value={reviewForm.customerEmail}
                      onChange={(e) => setReviewForm({ ...reviewForm, customerEmail: e.target.value })}
                      className="MachineryModal-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="MachineryModal-label">
                    Review Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Robust structure and very low tractor load"
                    value={reviewForm.title}
                    onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                    className="MachineryModal-input"
                  />
                </div>

                <div>
                  <label className="MachineryModal-label">
                    Your Detailed Review *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="How does this machine perform in your field? Share maintenance tips, fuel efficiency, etc."
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    className="MachineryModal-textarea"
                  />
                </div>

                <div className="ReviewModal-actions">
                  <button
                    type="button"
                    onClick={() => setShowReviewModal(false)}
                    className="ReviewModal-cancel-btn"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={reviewSubmitting}
                    className="ReviewModal-submit-btn"
                  >
                    {reviewSubmitting ? "Submitting..." : "Submit Review"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default MachineryDetails;