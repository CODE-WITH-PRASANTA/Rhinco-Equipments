import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Tractor, FileText, CheckCircle2, ShieldCheck, Download, AlertCircle } from "lucide-react";
import "./MachineryDetails.css";
import { API_ENDPOINTS, resolveImageUrl, toMachinerySlug } from "../../config/api";

const MACHINERY_API = API_ENDPOINTS.MACHINERY;
const ENQUIRIES_API = API_ENDPOINTS.ENQUIRIES;

const tabs = [
  { id: "specifications", label: "Specifications", icon: "settings" },
  { id: "description", label: "Overview & Features", icon: "layers" },
  { id: "documents", label: "Required Documents", icon: "document" },
];

const TabIcon = ({ type }) => {
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

const MachineryDetails = () => {
  const navigate = useNavigate();
  const { name: paramName } = useParams();
  const [searchParams] = useSearchParams();
  const idParam = searchParams.get("id");
  const queryName = searchParams.get("name");

  const categoryRef = useRef(null);

  const [machine, setMachine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [activeTab, setActiveTab] = useState("specifications");

  // Enquiry / Apply modal state
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);
  const [enquiryForm, setEnquiryForm] = useState({
    name: "",
    phone: "",
    email: "",
    district: "",
    farmerType: "Male (General/OBC)",
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

  const scrollCategories = () => {
    if (categoryRef.current) {
      categoryRef.current.scrollBy({
        left: 170,
        behavior: "smooth",
      });
    }
  };

  // Dynamic farmer subsidy calculations based on real machine price from DB
  const basePrice = Number(machine?.discountPrice || machine?.price || 0);

  const farmerCategories = [
    {
      id: 1,
      name: "Male (General/OBC)",
      subsidyPercent: 35,
      subsidyAmount: Math.round(basePrice * 0.35),
      farmerContribution: Math.round(basePrice * 0.65),
    },
    {
      id: 2,
      name: "Male (SC/ST)",
      subsidyPercent: 50,
      subsidyAmount: Math.round(basePrice * 0.5),
      farmerContribution: Math.round(basePrice * 0.5),
    },
    {
      id: 3,
      name: "Female (General/OBC)",
      subsidyPercent: 45,
      subsidyAmount: Math.round(basePrice * 0.45),
      farmerContribution: Math.round(basePrice * 0.55),
    },
    {
      id: 4,
      name: "Female (SC/ST)",
      subsidyPercent: 50,
      subsidyAmount: Math.round(basePrice * 0.5),
      farmerContribution: Math.round(basePrice * 0.5),
    },
  ];

  const handleApply = () => {
    const cat = farmerCategories.find((c) => c.id === selectedCategory);
    setEnquiryForm((prev) => ({
      ...prev,
      farmerType: cat ? cat.name : "Male (General/OBC)",
      message: `Enquiry / Subsidy application for ${machine?.title || machine?.name || "Machinery"}. Selected Subsidy: ${cat ? cat.name : "General"}.`,
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
        subject: `Subsidy Application for ${machine?.title || machine?.name}`,
        message: enquiryForm.message,
        machineName: machine?.title || machine?.name,
        machineId: machine?._id || machine?.id,
        category: enquiryForm.farmerType,
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
            farmerType: "Male (General/OBC)",
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

            {/* Category selection */}
            {basePrice > 0 && (
              <div className="MachineryDetails-category-section">
                <label className="MachineryDetails-category-label">
                  Select your Farmer Category to view Subsidy:
                </label>

                <div className="MachineryDetails-category-wrapper">
                  <div className="MachineryDetails-category-list" ref={categoryRef}>
                    {farmerCategories.map((cat) => (
                      <button
                        type="button"
                        key={cat.id}
                        className={`MachineryDetails-category-card ${
                          selectedCategory === cat.id ? "MachineryDetails-category-active" : ""
                        }`}
                        onClick={() => setSelectedCategory(cat.id)}
                      >
                        <span className="MachineryDetails-category-name">{cat.name}</span>
                        <strong className="MachineryDetails-category-amount">
                          Subsidy: {formatPrice(cat.subsidyAmount)}
                        </strong>
                        <span style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
                          Pay: {formatPrice(cat.farmerContribution)}
                        </span>
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    className="MachineryDetails-category-next"
                    onClick={scrollCategories}
                    aria-label="Show more categories"
                  >
                    <svg viewBox="0 0 24 24" fill="none">
                      <path
                        d="m9 18 6-6-6-6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons: Apply Now & Contact Dealer */}
            <div style={{ display: "flex", gap: "12px", marginTop: "18px", flexWrap: "wrap" }}>
              <button
                type="button"
                className={`MachineryDetails-apply-button ${
                  selectedCategory ? "MachineryDetails-apply-enabled" : ""
                }`}
                style={{ flex: 1, minWidth: "180px" }}
                onClick={handleApply}
              >
                Apply for Subsidy
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
                onClick={() => {
                  setEnquiryForm((prev) => ({
                    ...prev,
                    message: `Price inquiry and dealer quotation requested for ${title} (${brand}).`,
                  }));
                  setShowEnquiryModal(true);
                }}
                style={{
                  padding: "0 22px",
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

            {basePrice > 0 && (
              <div className="MachineryDetails-apply-hint">
                {selectedCategory
                  ? `Selected: ${farmerCategories.find((item) => item.id === selectedCategory).name} (Approx. ${
                      farmerCategories.find((item) => item.id === selectedCategory).subsidyPercent
                    }% Gov Subsidy)`
                  : "Select your farmer category above to calculate exact subsidy benefit"}
              </div>
            )}

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
            {activeTab === "specifications" && (
              <div className="MachineryDetails-tab-message">
                <h3 style={{ fontSize: "18px", color: "#166534", marginBottom: "14px" }}>
                  Detailed Technical Specifications
                </h3>

                {machine.specification && (
                  <div
                    dangerouslySetInnerHTML={{ __html: machine.specification }}
                    style={{ lineHeight: "1.7", color: "#334155", marginBottom: "20px" }}
                  />
                )}

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "14px",
                  }}
                >
                  <div style={{ padding: "14px", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                    <strong style={{ fontSize: "12px", color: "#64748b", textTransform: "uppercase" }}>Brand / Manufacturer</strong>
                    <p style={{ margin: "4px 0 0", color: "#0f172a", fontWeight: "600", fontSize: "15px" }}>{brand}</p>
                  </div>
                  <div style={{ padding: "14px", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                    <strong style={{ fontSize: "12px", color: "#64748b", textTransform: "uppercase" }}>Model Name</strong>
                    <p style={{ margin: "4px 0 0", color: "#0f172a", fontWeight: "600", fontSize: "15px" }}>{modelName || "Standard"}</p>
                  </div>
                  <div style={{ padding: "14px", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                    <strong style={{ fontSize: "12px", color: "#64748b", textTransform: "uppercase" }}>Required Power</strong>
                    <p style={{ margin: "4px 0 0", color: "#0f172a", fontWeight: "600", fontSize: "15px" }}>{power}</p>
                  </div>
                  <div style={{ padding: "14px", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                    <strong style={{ fontSize: "12px", color: "#64748b", textTransform: "uppercase" }}>Implement Type</strong>
                    <p style={{ margin: "4px 0 0", color: "#0f172a", fontWeight: "600", fontSize: "15px" }}>{machine.implementType || category}</p>
                  </div>
                  <div style={{ padding: "14px", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                    <strong style={{ fontSize: "12px", color: "#64748b", textTransform: "uppercase" }}>Equipment Category</strong>
                    <p style={{ margin: "4px 0 0", color: "#0f172a", fontWeight: "600", fontSize: "15px" }}>{category}</p>
                  </div>
                  <div style={{ padding: "14px", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                    <strong style={{ fontSize: "12px", color: "#64748b", textTransform: "uppercase" }}>Machine Code</strong>
                    <p style={{ margin: "4px 0 0", color: "#0f172a", fontWeight: "600", fontSize: "15px" }}>{machine.code || "N/A"}</p>
                  </div>
                  <div style={{ padding: "14px", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                    <strong style={{ fontSize: "12px", color: "#64748b", textTransform: "uppercase" }}>Store Availability</strong>
                    <p style={{ margin: "4px 0 0", color: "#0f172a", fontWeight: "600", fontSize: "15px" }}>{machine.availableAtStore || "Yes"}</p>
                  </div>
                  <div style={{ padding: "14px", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                    <strong style={{ fontSize: "12px", color: "#64748b", textTransform: "uppercase" }}>Status</strong>
                    <p style={{ margin: "4px 0 0", color: machine.status === "Available" ? "#166534" : "#e11d48", fontWeight: "600", fontSize: "15px" }}>
                      {machine.status || "Available"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "description" && (
              <div className="MachineryDetails-tab-content">
                <h3 style={{ fontSize: "18px", color: "#166534", marginBottom: "14px" }}>
                  Product Overview & Key Features
                </h3>
                {machine.description ? (
                  <div
                    dangerouslySetInnerHTML={{ __html: machine.description }}
                    style={{ lineHeight: "1.7", color: "#334155" }}
                  />
                ) : (
                  <p style={{ lineHeight: "1.7", color: "#64748b" }}>
                    Detailed overview and operational specifications will be provided upon dealer enquiry.
                  </p>
                )}
              </div>
            )}

            {activeTab === "documents" && (
              <div className="MachineryDetails-tab-content">
                <h3 style={{ fontSize: "18px", color: "#166534", marginBottom: "14px" }}>
                  Documents & Verification Requirements
                </h3>

                {Array.isArray(machine.documents) && machine.documents.length > 0 && (
                  <div style={{ marginBottom: "24px" }}>
                    <h4 style={{ fontSize: "14px", color: "#334155", marginBottom: "10px", fontWeight: "700" }}>
                      Machine Specification Documents & Manuals
                    </h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {machine.documents.map((doc, dIdx) => {
                        const docUrl = typeof doc === "string" ? doc : doc?.url || doc?.path || "";
                        const docName = typeof doc === "object" ? doc?.name || `Document ${dIdx + 1}` : `Document ${dIdx + 1}`;
                        return (
                          <a
                            key={dIdx}
                            href={resolveImageUrl(docUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "10px",
                              padding: "10px 16px",
                              background: "#f0fdf4",
                              border: "1px solid #bbf7d0",
                              borderRadius: "8px",
                              color: "#166534",
                              fontWeight: "600",
                              fontSize: "13px",
                              textDecoration: "none",
                              width: "fit-content",
                            }}
                          >
                            <FileText size={16} />
                            <span>{docName}</span>
                            <Download size={14} style={{ marginLeft: "4px" }} />
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}

                <h4 style={{ fontSize: "14px", color: "#334155", marginBottom: "10px", fontWeight: "700" }}>
                  Government DBT Subsidy Verification Checklist
                </h4>
                <div className="MachineryDetails-document-list">
                  {[
                    "Farmer Aadhaar Card (Linked to Mobile & DBT Portal)",
                    "Active Bank Passbook / Cancelled Cheque with IFSC",
                    "Land Record Certificate (7/12 & 8A / RoR Khatauni)",
                    "Recent Passport Size Photograph of the Beneficiary",
                    "Caste Certificate (Applicable for SC/ST subsidy categories)",
                    "Farmer Registration ID from the State Agriculture Portal",
                  ].map((document, index) => (
                    <div className="MachineryDetails-document-item" key={index}>
                      <span className="MachineryDetails-document-check">✓</span>
                      {document}
                    </div>
                  ))}
                </div>
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
                  Enquire & Apply for Subsidy
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
                        placeholder="e.g. Pune, Maharashtra"
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
                      Farmer Category
                    </label>
                    <select
                      value={enquiryForm.farmerType}
                      onChange={(e) => setEnquiryForm({ ...enquiryForm, farmerType: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                        fontSize: "14px",
                        outline: "none",
                        backgroundColor: "#fff",
                        boxSizing: "border-box",
                      }}
                    >
                      <option value="Male (General/OBC)">Male (General/OBC)</option>
                      <option value="Male (SC/ST)">Male (SC/ST)</option>
                      <option value="Female (General/OBC)">Female (General/OBC)</option>
                      <option value="Female (SC/ST)">Female (SC/ST)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#334155", marginBottom: "5px" }}>
                      Message or Specific Requirements
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Ask about price quotation, delivery, or subsidy paperwork..."
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
                    {enquirySubmitting ? "Submitting Enquiry..." : "Submit Enquiry & Apply"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default MachineryDetails;