import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Tractor, FileText, CheckCircle2, ShieldCheck, Download, AlertCircle } from "lucide-react";
import "./MachineryDetails.css";
import { resolveImageUrl, toMachinerySlug } from "../../utils/helpers";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
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
  const [enquiryForm, setEnquiryForm] = useState({
    name: "",
    phone: "",
    email: "",
    district: "",
    message: "",
  });
  const [enquirySubmitting, setEnquirySubmitting] = useState(false);
  const [enquirySuccess, setEnquirySuccess] = useState(false);

  // Normalize URL - remove % or %20 or spaces and replace with -
  useEffect(() => {
    if (paramName) {
      const cleanSlug = toMachinerySlug(paramName);
      if (cleanSlug && paramName !== cleanSlug) {
        navigate(`/machinery/${cleanSlug}`, { replace: true });
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
        if (!found) {
          const res = await fetch(MACHINERY_API);
          const data = await res.json();
          if (res.ok && data.success && Array.isArray(data.data)) {
            const list = data.data;
            const targetLower = rawTerm.toLowerCase();

            found = list.find((m) => {
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
          } else {
            // Strictly NO dummy fallback to list[0]
            setMachine(null);
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
          "Thank you! Your review has been submitted for approval and will appear once published by our admin team."
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
    const title = machine?.title || machine?.name || "Machinery";
    const brand = machine?.brandName || machine?.brand || "Rhinco";
    setEnquiryForm((prev) => ({
      ...prev,
      message:
        customMsg ||
        `I am interested in getting quotation, pricing, and purchase details for ${title} (${brand}).`,
    }));
    setShowEnquiryModal(true);
  };

  const handleEnquirySubmit = async (e) => {
    e.preventDefault();
    if (!enquiryForm.name || !enquiryForm.phone) {
      alert("Please enter your name and contact phone number.");
      return;
    }

    setEnquirySubmitting(true);
    try {
      const payload = {
        name: enquiryForm.name,
        phone: enquiryForm.phone,
        email: enquiryForm.email || "",
        district: enquiryForm.district || "",
        subject: `Quotation & Machinery Enquiry for ${machine?.title || machine?.name}`,
        message: enquiryForm.message,
        machineName: machine?.title || machine?.name,
        machineId: machine?._id || machine?.id,
        category: machine?.category || "Machinery",
      };

      const res = await fetch(ENQUIRIES_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();
      if (res.ok && resData.success) {
        setEnquirySuccess(true);
        window.setTimeout(() => {
          setEnquirySuccess(false);
          setShowEnquiryModal(false);
          setEnquiryForm({
            name: "",
            phone: "",
            email: "",
            district: "",
            message: "",
          });
        }, 2200);
      } else {
        alert(resData.message || "Failed to submit enquiry. Please try again.");
      }
    } catch (err) {
      console.error("Enquiry submission error:", err);
      alert("Network error submitting enquiry. Please check your connection.");
    } finally {
      setEnquirySubmitting(false);
    }
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
        <div className="MachineryDetails-container" style={{ textAlign: "center", padding: "100px 20px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              border: "4px solid #e2e8f0",
              borderTopColor: "#166534",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 16px",
            }}
          />
          <h2 style={{ color: "#166534", fontSize: "20px", fontWeight: "600" }}>
            Loading machinery equipment details...
          </h2>
        </div>
      </section>
    );
  }

  if (!machine) {
    return (
      <section className="MachineryDetails">
        <div className="MachineryDetails-container" style={{ textAlign: "center", padding: "90px 20px" }}>
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              background: "#fee2e2",
              color: "#dc2626",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <AlertCircle size={32} />
          </div>
          <h2 style={{ color: "#0f172a", fontSize: "24px", marginBottom: "8px" }}>
            Machinery equipment not found
          </h2>
          <p style={{ color: "#64748b", margin: "0 auto 24px", maxWidth: "480px", lineHeight: "1.6" }}>
            No equipment found matching &ldquo;{paramName || "this product"}&rdquo;. Please verify the machine model or explore our complete machinery catalogue.
          </p>
          <Link
            to="/machinery"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 28px",
              backgroundColor: "#166534",
              color: "#fff",
              borderRadius: "10px",
              textDecoration: "none",
              fontWeight: 600,
              fontSize: "14px",
            }}
          >
            <Tractor size={18} />
            Back to Machinery Catalogue
          </Link>
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
          <div className="MachineryDetails-image-card" style={{ flexDirection: "column" }}>
            <div className="MachineryDetails-image-background">
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
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px", color: "#94a3b8" }}>
                  <Tractor size={70} strokeWidth={1.2} />
                  <span style={{ marginTop: "12px", fontSize: "14px", fontWeight: "600" }}>{title}</span>
                </div>
              )}
            </div>

            {imagesList.length > 1 && (
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  marginTop: "16px",
                  overflowX: "auto",
                  maxWidth: "100%",
                  padding: "4px 2px",
                }}
              >
                {imagesList.map((img, idx) => {
                  const src = typeof img === "string" ? img : img?.data || img?.preview || img?.url || "";
                  const isActive = activeImage === src;
                  return (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => setActiveImage(src)}
                      style={{
                        width: "60px",
                        height: "60px",
                        borderRadius: "8px",
                        border: isActive ? "2.5px solid #166534" : "1px solid #cbd5e1",
                        background: "#fff",
                        padding: "2px",
                        cursor: "pointer",
                        overflow: "hidden",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      aria-label={`Thumbnail ${idx + 1}`}
                    >
                      <img
                        src={resolveImageUrl(src)}
                        alt={`thumb-${idx}`}
                        style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "6px" }}
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Product information */}
          <div className="MachineryDetails-info-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
              <div className="MachineryDetails-brand">{brand.toUpperCase()}</div>
              {modelName && (
                <span
                  style={{
                    backgroundColor: "#f0fdf4",
                    color: "#166534",
                    fontSize: "12px",
                    fontWeight: 700,
                    padding: "3px 10px",
                    borderRadius: "20px",
                    border: "1px solid #bbf7d0",
                  }}
                >
                  Model: {modelName}
                </span>
              )}
            </div>

            <h1 className="MachineryDetails-product-title">{title}</h1>

            <div style={{ display: "flex", alignItems: "baseline", gap: "12px", margin: "14px 0", flexWrap: "wrap" }}>
              <div className="MachineryDetails-price">{formatPrice(currentPrice)}</div>
              {discountPercent > 0 && originalPrice > 0 && (
                <>
                  <del style={{ color: "#94a3b8", fontSize: "18px" }}>
                    {formatPrice(originalPrice)}
                  </del>
                  <span
                    style={{
                      background: "#fee2e2",
                      color: "#dc2626",
                      fontSize: "13px",
                      fontWeight: "700",
                      padding: "3px 8px",
                      borderRadius: "6px",
                    }}
                  >
                    {discountPercent}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Quick Specs Bar */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "10px",
                padding: "12px",
                background: "#f8fafc",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                margin: "12px 0 20px",
              }}
            >
              <div>
                <span style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", display: "block" }}>
                  Power / HP
                </span>
                <strong style={{ fontSize: "14px", color: "#0f172a" }}>{power}</strong>
              </div>
              <div>
                <span style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", display: "block" }}>
                  Implement Type
                </span>
                <strong style={{ fontSize: "14px", color: "#0f172a" }}>
                  {machine.implementType || category}
                </strong>
              </div>
              <div>
                <span style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", display: "block" }}>
                  Availability
                </span>
                <strong style={{ fontSize: "14px", color: machine.status === "Available" ? "#166534" : "#e11d48" }}>
                  {machine.status || (machine.availableAtStore === "Yes" ? "In Stock" : "Out of Stock")}
                </strong>
              </div>
            </div>

            {/* Action Buttons: Get Quotation & Contact Dealer */}
            <div style={{ display: "flex", gap: "14px", marginTop: "24px", flexWrap: "wrap" }}>
              <button
                type="button"
                className="MachineryDetails-apply-button MachineryDetails-apply-enabled"
                style={{ flex: 1, minWidth: "200px" }}
                onClick={() =>
                  handleOpenEnquiry(`Quotation and purchase enquiry requested for ${title} (${brand}).`)
                }
              >
                Get Best Quotation / Enquire
                <svg viewBox="0 0 24 24" fill="none" style={{ marginLeft: "8px" }}>
                  <path
                    d="M5 12h14m-6-6 6 6-6 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleOpenEnquiry(`Price inquiry and dealer contact requested for ${title} (${brand}).`)
                }
                style={{
                  padding: "0 24px",
                  borderRadius: "14px",
                  border: "2px solid #166534",
                  background: "#fff",
                  color: "#166534",
                  fontWeight: "700",
                  fontSize: "15px",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: "48px",
                  transition: "all 0.2s ease",
                }}
              >
                Contact Dealer
              </button>
            </div>

            <div className="MachineryDetails-info-divider" />

            <div className="MachineryDetails-dealer-note">
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
                <path
                  d="m9 12 2 2 4-4"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              <p>
                We route your application directly to an authorised machinery dealer in your
                district for subsidy paperwork, financing assistance, and on-farm delivery.
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
                className={`MachineryDetails-tab ${
                  activeTab === tab.id ? "MachineryDetails-tab-active" : ""
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
                      className="MachineryDetails-spec-value"
                      style={{ color: machine.status === "Available" ? "#166534" : "#e11d48" }}
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
                        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" strokeWidth="2" strokeLinecap="round"/>
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
                      className="MachineryDetails-tab-action-btn"
                      style={{ marginTop: "14px" }}
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
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
                  <div>
                    <h3 style={{ fontSize: "18px", color: "#166534", margin: "0 0 4px" }}>
                      Customer Reviews & Field Ratings
                    </h3>
                    <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>
                      Verified feedback from farmers and operators using {machine.title || machine.name}.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setReviewSuccessMessage("");
                      setShowReviewModal(true);
                    }}
                    style={{
                      background: "#166534",
                      color: "#fff",
                      border: "none",
                      borderRadius: "8px",
                      padding: "10px 18px",
                      fontWeight: "700",
                      fontSize: "14px",
                      cursor: "pointer",
                    }}
                  >
                    ★ Write a Review
                  </button>
                </div>

                {reviewSuccessMessage && (
                  <div
                    style={{
                      background: "#f0fdf4",
                      border: "1px solid #86efac",
                      borderRadius: "8px",
                      padding: "14px 18px",
                      color: "#15803d",
                      fontWeight: "600",
                      fontSize: "14px",
                      marginBottom: "16px",
                    }}
                  >
                    ✓ {reviewSuccessMessage}
                  </div>
                )}

                {reviewsLoading ? (
                  <div style={{ padding: "30px", textAlign: "center", color: "#64748b" }}>
                    Loading reviews...
                  </div>
                ) : reviews.length === 0 ? (
                  <div
                    style={{
                      padding: "40px 20px",
                      textAlign: "center",
                      background: "#f8fafc",
                      borderRadius: "12px",
                      border: "1.5px dashed #cbd5e1",
                    }}
                  >
                    <div style={{ fontSize: "28px", color: "#fbbf24", marginBottom: "8px" }}>★★★★★</div>
                    <h4 style={{ margin: "0 0 6px", fontSize: "16px", color: "#1e293b" }}>No published reviews yet</h4>
                    <p style={{ margin: "0 0 16px", fontSize: "13px", color: "#64748b" }}>
                      Be the first farmer to share your experience with this equipment.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setReviewSuccessMessage("");
                        setShowReviewModal(true);
                      }}
                      style={{
                        background: "#fff",
                        color: "#166534",
                        border: "1.5px solid #166534",
                        borderRadius: "8px",
                        padding: "8px 18px",
                        fontWeight: "700",
                        fontSize: "13px",
                        cursor: "pointer",
                      }}
                    >
                      Write First Review
                    </button>
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
                    {reviews.map((rev) => (
                      <div
                        key={rev._id || rev.id}
                        style={{
                          background: "#fff",
                          border: "1px solid #e2e8f0",
                          borderRadius: "10px",
                          padding: "18px",
                          display: "flex",
                          flexDirection: "column",
                          gap: "8px",
                          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div
                            style={{
                              width: "36px",
                              height: "36px",
                              borderRadius: "50%",
                              background: "#166534",
                              color: "#fff",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: "700",
                              fontSize: "14px",
                            }}
                          >
                            {(rev.customerName || "U").slice(0, 1).toUpperCase()}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: "700", fontSize: "14px", color: "#0f172a" }}>
                              {rev.customerName}
                            </div>
                            <div style={{ color: "#f59e0b", fontSize: "13px" }}>
                              {"★".repeat(Math.round(rev.rating || 5))}
                              {"☆".repeat(5 - Math.round(rev.rating || 5))}
                              <span style={{ color: "#64748b", fontSize: "11px", marginLeft: "4px" }}>
                                {rev.rating || 5}.0
                              </span>
                            </div>
                          </div>
                          {rev.verifiedPurchase && (
                            <span
                              style={{
                                background: "#f0fdf4",
                                color: "#166534",
                                fontSize: "11px",
                                fontWeight: "700",
                                padding: "2px 6px",
                                borderRadius: "4px",
                                border: "1px solid #bbf7d0",
                              }}
                            >
                              ✓ Verified
                            </span>
                          )}
                        </div>

                        {rev.title && (
                          <div style={{ fontWeight: "700", fontSize: "14px", color: "#1e293b" }}>
                            {rev.title}
                          </div>
                        )}

                        <p style={{ margin: 0, fontSize: "13px", color: "#475569", lineHeight: "1.6" }}>
                          {rev.comment}
                        </p>

                        <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "auto", paddingTop: "6px" }}>
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

      {/* ENQUIRY & SUBSIDY APPLICATION MODAL */}
      {showEnquiryModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.55)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
          }}
          onClick={() => !enquirySubmitting && setShowEnquiryModal(false)}
        >
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: "20px",
              width: "100%",
              maxWidth: "520px",
              padding: "32px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowEnquiryModal(false)}
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                background: "transparent",
                border: "none",
                fontSize: "22px",
                cursor: "pointer",
                color: "#64748b",
              }}
              aria-label="Close"
            >
              ×
            </button>

            {enquirySuccess ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "50%",
                    background: "#f0fdf4",
                    color: "#166534",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "28px",
                    margin: "0 auto 16px",
                  }}
                >
                  ✓
                </div>
                <h3 style={{ fontSize: "20px", color: "#166534", marginBottom: "8px" }}>
                  Enquiry Submitted Successfully!
                </h3>
                <p style={{ color: "#475569", fontSize: "14px", lineHeight: "1.5" }}>
                  Thank you! An authorized dealer in your district will contact you shortly
                  regarding <strong>{title}</strong>.
                </p>
              </div>
            ) : (
              <form onSubmit={handleEnquirySubmit}>
                <h3 style={{ fontSize: "20px", color: "#0f172a", marginBottom: "4px" }}>
                  Get Price Quotation
                </h3>
                <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "20px" }}>
                  Machine: <strong>{title}</strong> ({brand})
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#334155", marginBottom: "5px" }}>
                      Farmer / Customer Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Patil"
                      value={enquiryForm.name}
                      onChange={(e) => setEnquiryForm({ ...enquiryForm, name: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                        fontSize: "14px",
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#334155", marginBottom: "5px" }}>
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="10-digit mobile"
                        value={enquiryForm.phone}
                        onChange={(e) => setEnquiryForm({ ...enquiryForm, phone: e.target.value })}
                        style={{
                          width: "100%",
                          padding: "10px 14px",
                          borderRadius: "8px",
                          border: "1px solid #cbd5e1",
                          fontSize: "14px",
                          outline: "none",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#334155", marginBottom: "5px" }}>
                        District / City
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Cuttack, Odisha"
                        value={enquiryForm.district}
                        onChange={(e) => setEnquiryForm({ ...enquiryForm, district: e.target.value })}
                        style={{
                          width: "100%",
                          padding: "10px 14px",
                          borderRadius: "8px",
                          border: "1px solid #cbd5e1",
                          fontSize: "14px",
                          outline: "none",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#334155", marginBottom: "5px" }}>
                      Message or Specific Requirements
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Ask about price quotation, delivery schedule, attachments, or financing..."
                      value={enquiryForm.message}
                      onChange={(e) => setEnquiryForm({ ...enquiryForm, message: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                        fontSize: "14px",
                        outline: "none",
                        resize: "vertical",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={enquirySubmitting}
                    style={{
                      marginTop: "8px",
                      width: "100%",
                      padding: "12px",
                      borderRadius: "10px",
                      border: "none",
                      backgroundColor: "#166534",
                      color: "#fff",
                      fontSize: "15px",
                      fontWeight: 600,
                      cursor: enquirySubmitting ? "not-allowed" : "pointer",
                      opacity: enquirySubmitting ? 0.7 : 1,
                    }}
                  >
                    {enquirySubmitting ? "Submitting Quotation Request..." : "Submit Quotation Request"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* WRITE A REVIEW MODAL */}
      {showReviewModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
          }}
          onClick={() => setShowReviewModal(false)}
        >
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: "16px",
              maxWidth: "540px",
              width: "100%",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              overflow: "hidden",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: "20px 24px",
                borderBottom: "1px solid #f1f5f9",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: "#f8fafc",
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: "18px", color: "#0f172a", fontWeight: 700 }}>
                  Review Equipment
                </h3>
                <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#64748b" }}>
                  {machine?.title || "Machinery"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowReviewModal(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "18px",
                  cursor: "pointer",
                  color: "#94a3b8",
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} style={{ padding: "24px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                    Your Rating *
                  </label>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                        style={{
                          background: "none",
                          border: "none",
                          fontSize: "26px",
                          cursor: "pointer",
                          color: star <= reviewForm.rating ? "#f59e0b" : "#cbd5e1",
                          padding: 0,
                          lineHeight: 1,
                        }}
                      >
                        ★
                      </button>
                    ))}
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "#1e293b", marginLeft: "8px" }}>
                      {reviewForm.rating} / 5 Stars
                    </span>
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#334155", marginBottom: "5px" }}>
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar Patel"
                    value={reviewForm.customerName}
                    onChange={(e) => setReviewForm({ ...reviewForm, customerName: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      fontSize: "14px",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#334155", marginBottom: "5px" }}>
                      Phone (Optional)
                    </label>
                    <input
                      type="tel"
                      placeholder="10-digit mobile"
                      value={reviewForm.customerPhone}
                      onChange={(e) => setReviewForm({ ...reviewForm, customerPhone: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                        fontSize: "14px",
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#334155", marginBottom: "5px" }}>
                      Email (Optional)
                    </label>
                    <input
                      type="email"
                      placeholder="name@gmail.com"
                      value={reviewForm.customerEmail}
                      onChange={(e) => setReviewForm({ ...reviewForm, customerEmail: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                        fontSize: "14px",
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#334155", marginBottom: "5px" }}>
                    Review Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Robust structure and very low tractor load"
                    value={reviewForm.title}
                    onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      fontSize: "14px",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#334155", marginBottom: "5px" }}>
                    Your Detailed Review *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="How does this machine perform in your field? Share maintenance tips, fuel efficiency, etc."
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      fontSize: "14px",
                      outline: "none",
                      resize: "vertical",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div
                  style={{
                    backgroundColor: "#f8fafc",
                    borderRadius: "8px",
                    padding: "10px 14px",
                    fontSize: "12px",
                    color: "#64748b",
                  }}
                >
                  ℹ Reviews undergo verification by our admin team before being published on the platform.
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "4px" }}>
                  <button
                    type="button"
                    onClick={() => setShowReviewModal(false)}
                    style={{
                      padding: "10px 18px",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      backgroundColor: "#fff",
                      color: "#475569",
                      fontSize: "14px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={reviewSubmitting}
                    style={{
                      padding: "10px 22px",
                      borderRadius: "8px",
                      border: "none",
                      backgroundColor: "#166534",
                      color: "#fff",
                      fontSize: "14px",
                      fontWeight: 700,
                      cursor: reviewSubmitting ? "not-allowed" : "pointer",
                      opacity: reviewSubmitting ? 0.7 : 1,
                    }}
                  >
                    {reviewSubmitting ? "Submitting..." : "Submit Review for Approval"}
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