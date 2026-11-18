import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Tractor,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  User,
  Sparkles,
  X,
  ShieldCheck,
  Tag,
  ArrowRight,
  FileText,
  BadgePercent,
  Check,
} from "lucide-react";
import "./MachinaryEquipmentOne.css";
import { toMachinerySlug, resolveImageUrl } from "../../utils/helpers";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const MACHINERY_API = `${API_URL}/machinery`;

const MachinaryEquipmentOne = ({
  dealerPhone = "",
  dealerEmail = "",
  onContactDealer,
}) => {
  const [machinery, setMachinery] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    brand: [],
    category: [],
    type: [],
  });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // LOAD REAL MACHINERY DATA FROM DATABASE
  const loadMachinery = async () => {
    setLoading(true);
    try {
      const res = await fetch(MACHINERY_API);
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.data)) {
        setMachinery(data.data);
      }
    } catch (err) {
      console.error("Error loading machinery from database:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMachinery();
  }, []);

  // DYNAMICALLY GENERATE FILTER GROUPS BASED ON REAL DATABASE MACHINERY
  const filterGroups = useMemo(() => {
    const brandCounts = {};
    const categoryCounts = {};
    const typeCounts = {};

    machinery.forEach((item) => {
      const b = item.brand || item.brandName;
      if (b) brandCounts[b] = (brandCounts[b] || 0) + 1;

      const c = item.category;
      if (c) categoryCounts[c] = (categoryCounts[c] || 0) + 1;

      const t = item.type || item.implementType;
      if (t) typeCounts[t] = (typeCounts[t] || 0) + 1;
    });

    const groups = [];
    if (Object.keys(brandCounts).length > 0) {
      groups.push({
        title: "Brands",
        key: "brand",
        items: Object.entries(brandCounts),
      });
    }
    if (Object.keys(categoryCounts).length > 0) {
      groups.push({
        title: "Categories",
        key: "category",
        items: Object.entries(categoryCounts),
      });
    }
    if (Object.keys(typeCounts).length > 0) {
      groups.push({
        title: "Types",
        key: "type",
        items: Object.entries(typeCounts),
      });
    }

    return groups;
  }, [machinery]);

  const filteredMachinery = useMemo(() => {
    return machinery.filter((item) => {
      const name = (item.name || item.title || "").toLowerCase();
      const brand = (item.brand || item.brandName || "").toLowerCase();
      const category = (item.category || "").toLowerCase();
      const q = search.trim().toLowerCase();

      const searchMatch =
        !q ||
        name.includes(q) ||
        brand.includes(q) ||
        category.includes(q);

      const itemBrand = item.brand || item.brandName || "";
      const itemCategory = item.category || "";
      const itemType = item.type || item.implementType || "";

      const brandMatch =
        filters.brand.length === 0 || filters.brand.includes(itemBrand);

      const categoryMatch =
        filters.category.length === 0 ||
        filters.category.includes(itemCategory);

      const typeMatch =
        filters.type.length === 0 || filters.type.includes(itemType);

      return searchMatch && brandMatch && categoryMatch && typeMatch;
    });
  }, [machinery, search, filters]);

  const toggleFilter = (key, value) => {
    setFilters((previous) => ({
      ...previous,
      [key]: previous[key].includes(value)
        ? previous[key].filter((item) => item !== value)
        : [...previous[key], value],
    }));
  };

  const clearFilters = () => {
    setFilters({ brand: [], category: [], type: [] });
    setSearch("");
  };

  const [modalForm, setModalForm] = useState({
    name: "",
    phone: "",
    email: "",
    location: "",
    intent: "Price Quotation",
    message: "",
  });
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [modalSuccess, setModalSuccess] = useState(false);
  const [modalError, setModalError] = useState("");

  const handleContactDealer = (product) => {
    if (onContactDealer) {
      onContactDealer(product);
      return;
    }

    // Auto-prefill logged-in user information if present
    let initialName = "";
    let initialPhone = "";
    let initialEmail = "";
    let initialLocation = "";

    try {
      const storedUser = localStorage.getItem("rhinco_user");
      if (storedUser) {
        const u = JSON.parse(storedUser);
        initialName = u.name || "";
        initialPhone = u.phone || "";
        initialEmail = u.email || "";
      }
      const storedAddresses = localStorage.getItem("rhinco_addresses");
      if (storedAddresses) {
        const addrs = JSON.parse(storedAddresses);
        if (Array.isArray(addrs) && addrs.length > 0) {
          const def = addrs.find((a) => a.isDefault) || addrs[0];
          initialLocation = [def.village, def.district, def.state].filter(Boolean).join(", ");
        }
      }
    } catch (e) {
      console.error("Error reading stored user:", e);
    }

    setModalForm({
      name: initialName,
      phone: initialPhone,
      email: initialEmail,
      location: initialLocation,
      intent: "Price Quotation",
      message: "",
    });
    setModalSuccess(false);
    setModalError("");
    setSelectedProduct(product);
  };

  const closeContactModal = () => {
    setSelectedProduct(null);
    setModalSuccess(false);
    setModalError("");
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    if (!modalForm.name || !modalForm.phone) {
      setModalError("Please provide your name and contact phone number.");
      return;
    }
    setModalSubmitting(true);
    setModalError("");
    try {
      const prodName = selectedProduct?.name || selectedProduct?.title || "Machinery Equipment";
      const rawImg = selectedProduct?.image || selectedProduct?.machineImages?.[0] || selectedProduct?.images?.[0] || "";
      const prodImg = typeof rawImg === "string" ? rawImg : rawImg?.url || rawImg?.data || rawImg?.preview || "";
      const prodPrice = selectedProduct?.formattedPrice || (selectedProduct?.price ? `₹${Number(selectedProduct.price).toLocaleString("en-IN")}` : "Price on Request");

      let loggedUser = null;
      try {
        const u = localStorage.getItem("rhinco_user");
        if (u) loggedUser = JSON.parse(u);
      } catch (err) {}

      const intentText = modalForm.intent ? `[${modalForm.intent}] ` : "";
      const fullMessage = (intentText + (modalForm.message || `Customer requested enquiry and price quote for ${prodName}`)).trim();

      const res = await fetch(API_ENDPOINTS.ENQUIRIES, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: modalForm.name.trim(),
          phone: modalForm.phone.trim(),
          email: (modalForm.email || loggedUser?.email || "").trim(),
          productOrEquipment: prodName,
          machineName: prodName,
          machineImage: prodImg,
          price: prodPrice,
          location: (modalForm.location || "").trim(),
          district: (modalForm.location || "").trim(),
          enquiryType: "Machinery Enquiry",
          subject: `${modalForm.intent || "Dealer Inquiry"} - ${prodName}`,
          message: fullMessage,
          userId: loggedUser?._id || loggedUser?.id || "",
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        try {
          const stored = JSON.parse(
            localStorage.getItem("rhinco_user_enquiries") || "[]"
          );
          stored.unshift(data.data);
          localStorage.setItem("rhinco_user_enquiries", JSON.stringify(stored));
        } catch (e) {}

        setModalSuccess(true);
        window.dispatchEvent(new Event("rhinco_enquiry_submitted"));
        setTimeout(() => {
          setModalSuccess(false);
          closeContactModal();
        }, 2200);
      } else {
        setModalError(data.message || "Failed to submit enquiry.");
      }
    } catch (err) {
      console.error(err);
      setModalError("Network error: Could not reach the server.");
    } finally {
      setModalSubmitting(false);
    }
  };

  return (
    <section className="MachinaryEquipmentOne">
      <div className="MachinaryEquipmentOne-container">

        {/* MOBILE FILTER BUTTON */}
        <div className="MachinaryEquipmentOne-mobileTop">
          <button
            className="MachinaryEquipmentOne-filterToggle"
            onClick={() => setShowFilters(!showFilters)}
          >
            <span>☷</span>
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>

          <span className="MachinaryEquipmentOne-mobileCount">
            {filteredMachinery.length} Products
          </span>
        </div>

        {/* SIDEBAR */}
        <aside
          className={`MachinaryEquipmentOne-sidebar ${
            showFilters ? "MachinaryEquipmentOne-sidebarOpen" : ""
          }`}
        >
          <div className="MachinaryEquipmentOne-sidebarHeader">
            <div>
              <span className="MachinaryEquipmentOne-sidebarEyebrow">
                EXPLORE EQUIPMENT
              </span>
              <h3>Find Machinery</h3>
            </div>

            <button
              className="MachinaryEquipmentOne-clearButton"
              onClick={clearFilters}
            >
              Clear All
            </button>
          </div>

          {filterGroups.map((group) => (
            <div
              className="MachinaryEquipmentOne-filterGroup"
              key={group.key}
            >
              <div className="MachinaryEquipmentOne-filterHeading">
                <h4>{group.title}</h4>
                <span>{group.items.length}</span>
              </div>

              <div className="MachinaryEquipmentOne-filterOptions">
                {group.items.map(([label, count]) => (
                  <label
                    className="MachinaryEquipmentOne-filterOption"
                    key={label}
                  >
                    <input
                      type="checkbox"
                      checked={filters[group.key].includes(label)}
                      onChange={() => toggleFilter(group.key, label)}
                    />

                    <span className="MachinaryEquipmentOne-customCheckbox"></span>

                    <span className="MachinaryEquipmentOne-filterName">
                      {label}
                    </span>

                    <span className="MachinaryEquipmentOne-filterCount">
                      ({count})
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          <div className="MachinaryEquipmentOne-sidebarNote">
            <span className="MachinaryEquipmentOne-sidebarNoteIcon">✦</span>
            <div>
              <strong>Need help choosing?</strong>
              <p>Contact our team to find the right equipment.</p>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="MachinaryEquipmentOne-main">
          <div className="MachinaryEquipmentOne-topbar">
            <div className="MachinaryEquipmentOne-heading">
              <span className="MachinaryEquipmentOne-sectionTag">
                AGRICULTURAL EQUIPMENT
              </span>
              <h2>Tractor Implements</h2>
              <p>
                Explore reliable machinery for every stage of farming.
              </p>
            </div>

            <div className="MachinaryEquipmentOne-searchBox">
              <span className="MachinaryEquipmentOne-searchIcon">⌕</span>
              <input
                type="text"
                placeholder="Search machinery..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  className="MachinaryEquipmentOne-searchClear"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          <div className="MachinaryEquipmentOne-resultsBar">
            <div>
              Showing{" "}
              <strong>{filteredMachinery.length}</strong> machinery products
            </div>

            <div className="MachinaryEquipmentOne-resultsRight">
              <span className="MachinaryEquipmentOne-resultsDot"></span>
              Quality agricultural equipment
            </div>
          </div>

          {/* PRODUCT GRID */}
          {filteredMachinery.length > 0 ? (
            <div className="MachinaryEquipmentOne-grid">
              {filteredMachinery.map((item) => {
                const title = item.name || item.title;
                const brand = item.brand || item.brandName || "Rhinco";
                const power = item.power || item.implementPower || "N/A";
                const category = item.category || "General";
                const priceText =
                  item.formattedPrice ||
                  (item.discountPrice || item.price
                    ? `₹ ${Number(item.discountPrice || item.price).toLocaleString("en-IN")}`
                    : null);

                let rawImg = item.image;
                if (!rawImg && Array.isArray(item.machineImages) && item.machineImages.length > 0) {
                  const first = item.machineImages[0];
                  rawImg = typeof first === "string" ? first : first?.data || first?.url || first?.preview || "";
                }
                if (!rawImg) {
                  rawImg = item.featuredImage?.data || "";
                }
                const imgSrc = resolveImageUrl(rawImg, "/placeholder.png");

                return (
                  <article
                    className="MachinaryEquipmentOne-card"
                    key={item._id || item.id}
                  >
                    <Link
                      to={`/machinery/${toMachinerySlug(title)}`}
                      className="MachinaryEquipmentOne-imageArea"
                      style={{ textDecoration: "none", display: "block" }}
                    >
                      {item.sponsored && (
                        <span className="MachinaryEquipmentOne-sponsored">
                          ★ Sponsored
                        </span>
                      )}

                      <img
                        src={imgSrc}
                        alt={title}
                        className="MachinaryEquipmentOne-productImage"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.png";
                        }}
                      />

                      <span className="MachinaryEquipmentOne-imageLabel">
                        {brand}
                      </span>
                    </Link>

                    <div className="MachinaryEquipmentOne-cardContent">
                      <h3 className="MachinaryEquipmentOne-productName">
                        <Link
                          to={`/machinery/${toMachinerySlug(title)}`}
                          style={{ color: "inherit", textDecoration: "none" }}
                        >
                          {title}
                        </Link>
                      </h3>

                      <div className="MachinaryEquipmentOne-specifications">
                        <div className="MachinaryEquipmentOne-specItem">
                          <span>Power</span>
                          <strong>{power}</strong>
                        </div>

                        <div className="MachinaryEquipmentOne-specDivider"></div>

                        <div className="MachinaryEquipmentOne-specItem">
                          <span>Category</span>
                          <strong>{category}</strong>
                        </div>
                      </div>

                      <div className="MachinaryEquipmentOne-priceArea">
                        {priceText ? (
                          <span className="MachinaryEquipmentOne-price">
                            {priceText}
                          </span>
                        ) : (
                          <div className="MachinaryEquipmentOne-priceInquiry">
                            <span>For Price</span>
                            <button
                              onClick={() => handleContactDealer(item)}
                            >
                              Click Here
                            </button>
                          </div>
                        )}
                      </div>

                      <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                        <Link
                          to={`/machinery/${toMachinerySlug(title)}`}
                          style={{
                            flex: 1,
                            padding: "9px 12px",
                            borderRadius: "8px",
                            backgroundColor: "#f0fdf4",
                            color: "#166534",
                            border: "1px solid #bbf7d0",
                            fontWeight: "600",
                            fontSize: "13px",
                            textAlign: "center",
                            textDecoration: "none",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          View Details
                        </Link>

                        <button
                          className="MachinaryEquipmentOne-contactButton"
                          style={{ flex: 1, margin: 0 }}
                          onClick={() => handleContactDealer(item)}
                        >
                          Contact Dealer
                          <span>↗</span>
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="MachinaryEquipmentOne-emptyState">
              <div className="MachinaryEquipmentOne-emptyIcon">⌕</div>
              <h3>No machinery found</h3>
              <p>
                {loading
                  ? "Loading machinery equipment from database..."
                  : "No machinery equipment currently listed. Please check back soon or add items in the admin panel."}
              </p>
              {search && <button onClick={clearFilters}>Clear Search & Filters</button>}
            </div>
          )}
        </main>
      </div>

      {/* PREMIUM CONTACT DEALER MODAL */}
      {selectedProduct && (
        <div
          className="MachinaryEquipmentOne-modalOverlay"
          onClick={closeContactModal}
        >
          <div
            className="MachinaryEquipmentOne-modal"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="MachinaryEquipmentOne-modalHead">
              <div>
                <span className="MachinaryEquipmentOne-modalBadge">
                  <Tractor size={13} />
                  <span>OFFICIAL DEALER INQUIRY</span>
                </span>
                <h3>Connect with Authorized Dealer</h3>
                <p>
                  Get direct factory quotations, tractor compatibility verification & government subsidy support.
                </p>
              </div>

              <button
                className="MachinaryEquipmentOne-modalCloseBtn"
                onClick={closeContactModal}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="MachinaryEquipmentOne-modalBody">
              {modalSuccess ? (
                <div className="MachinaryEquipmentOne-successCard">
                  <div className="MachinaryEquipmentOne-successIconWrap">
                    <CheckCircle2 size={36} />
                  </div>
                  <h4>Inquiry Sent Successfully!</h4>
                  <p>
                    Thank you, <strong>{modalForm.name || "Customer"}</strong>. Our authorized equipment dealer has received your inquiry for <strong>{selectedProduct.name || selectedProduct.title}</strong> and will contact you at <strong>{modalForm.phone}</strong> shortly.
                  </p>
                  <div className="MachinaryEquipmentOne-successMeta">
                    ✓ Tracked in your Profile under <strong>Machinery Enquiries</strong>
                  </div>
                  <button
                    type="button"
                    className="MachinaryEquipmentOne-submitBtn"
                    style={{ maxWidth: "200px" }}
                    onClick={closeContactModal}
                  >
                    Done
                  </button>
                </div>
              ) : (
                <>
                  {/* Spotlight Machine Card */}
                  <div className="MachinaryEquipmentOne-spotlightCard">
                    {selectedProduct.image || selectedProduct.images?.[0] ? (
                      <img
                        src={resolveImageUrl(selectedProduct.image || selectedProduct.images?.[0], "/placeholder.png")}
                        alt={selectedProduct.name || selectedProduct.title}
                        className="MachinaryEquipmentOne-spotlightImg"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="MachinaryEquipmentOne-spotlightImgFallback">
                        <Tractor size={28} />
                      </div>
                    )}

                    <div className="MachinaryEquipmentOne-spotlightInfo">
                      <h4 className="MachinaryEquipmentOne-spotlightTitle">
                        {selectedProduct.name || selectedProduct.title}
                      </h4>
                      <div className="MachinaryEquipmentOne-spotlightMeta">
                        {selectedProduct.brand && <span>Brand: {selectedProduct.brand}</span>}
                        {selectedProduct.category && <span>• {selectedProduct.category}</span>}
                        {(selectedProduct.implementPower || selectedProduct.power) && (
                          <span>• {selectedProduct.implementPower || selectedProduct.power}</span>
                        )}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                        <span className="MachinaryEquipmentOne-spotlightPrice">
                          {selectedProduct.formattedPrice ||
                            (selectedProduct.price
                              ? `₹${Number(selectedProduct.price).toLocaleString("en-IN")}`
                              : "Price on Request")}
                        </span>
                        <span className="MachinaryEquipmentOne-verifiedTag">
                          <ShieldCheck size={14} />
                          <span>Verified Rhinco Partner</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Intent Selection Chips */}
                  <div className="MachinaryEquipmentOne-intentSection">
                    <span className="MachinaryEquipmentOne-intentLabel">What would you like assistance with?</span>
                    <div className="MachinaryEquipmentOne-intentChips">
                      {[
                        { id: "Price Quotation", label: "Request Best Price", icon: <Tag size={13} /> },
                        { id: "Govt Subsidy Check", label: "Subsidy Eligibility", icon: <BadgePercent size={13} /> },
                        { id: "Book Farm Demo", label: "Book Farm Demo", icon: <Tractor size={13} /> },
                        { id: "Financing / EMI", label: "EMI & Finance", icon: <FileText size={13} /> },
                      ].map((chip) => (
                        <button
                          key={chip.id}
                          type="button"
                          className={`MachinaryEquipmentOne-intentChip ${
                            modalForm.intent === chip.id ? "active" : ""
                          }`}
                          onClick={() => setModalForm((prev) => ({ ...prev, intent: chip.id }))}
                        >
                          {chip.icon}
                          <span>{chip.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {modalError && (
                    <div
                      style={{
                        background: "#fef2f2",
                        color: "#b91c1c",
                        padding: "10px 14px",
                        borderRadius: "8px",
                        fontSize: "13px",
                        border: "1px solid #fecaca",
                      }}
                    >
                      {modalError}
                    </div>
                  )}

                  {/* Inquiry Form */}
                  <form onSubmit={handleModalSubmit} className="MachinaryEquipmentOne-formGrid">
                    <div className="MachinaryEquipmentOne-formRow">
                      <div className="MachinaryEquipmentOne-inputWrap">
                        <User size={16} className="MachinaryEquipmentOne-inputIcon" />
                        <input
                          type="text"
                          placeholder="Your Full Name *"
                          value={modalForm.name}
                          onChange={(e) => setModalForm({ ...modalForm, name: e.target.value })}
                          required
                        />
                      </div>

                      <div className="MachinaryEquipmentOne-inputWrap">
                        <Phone size={16} className="MachinaryEquipmentOne-inputIcon" />
                        <input
                          type="tel"
                          placeholder="Phone / WhatsApp Number *"
                          value={modalForm.phone}
                          onChange={(e) => setModalForm({ ...modalForm, phone: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="MachinaryEquipmentOne-formRow">
                      <div className="MachinaryEquipmentOne-inputWrap">
                        <Mail size={16} className="MachinaryEquipmentOne-inputIcon" />
                        <input
                          type="email"
                          placeholder="Email Address (Optional)"
                          value={modalForm.email}
                          onChange={(e) => setModalForm({ ...modalForm, email: e.target.value })}
                        />
                      </div>

                      <div className="MachinaryEquipmentOne-inputWrap">
                        <MapPin size={16} className="MachinaryEquipmentOne-inputIcon" />
                        <input
                          type="text"
                          placeholder="Farm District / City (e.g. Pune, MH)"
                          value={modalForm.location}
                          onChange={(e) => setModalForm({ ...modalForm, location: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="MachinaryEquipmentOne-textareaWrap">
                      <FileText size={16} className="MachinaryEquipmentOne-inputIcon" style={{ marginTop: "2px" }} />
                      <textarea
                        rows={2}
                        placeholder="Any specific requirement or tractor model? (e.g., 45 HP Swaraj tractor, need 7ft rotavator...)"
                        value={modalForm.message}
                        onChange={(e) => setModalForm({ ...modalForm, message: e.target.value })}
                      />
                    </div>

                    {/* Direct Contact Options */}
                    {(dealerPhone || dealerEmail) && (
                      <div className="MachinaryEquipmentOne-dealerDirectBar">
                        <span>Prefer to connect right away?</span>
                        <div style={{ display: "flex", gap: "12px" }}>
                          {dealerPhone && (
                            <a href={`tel:${dealerPhone}`} className="MachinaryEquipmentOne-dealerDirectLink">
                              <Phone size={13} />
                              <span>Call {dealerPhone}</span>
                            </a>
                          )}
                          {dealerEmail && (
                            <a
                              href={`mailto:${dealerEmail}?subject=Inquiry for ${selectedProduct.name || selectedProduct.title}`}
                              className="MachinaryEquipmentOne-dealerDirectLink"
                            >
                              <Mail size={13} />
                              <span>Email</span>
                            </a>
                          )}
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={modalSubmitting}
                      className="MachinaryEquipmentOne-submitBtn"
                    >
                      {modalSubmitting ? (
                        <span>Submitting Inquiry...</span>
                      ) : (
                        <>
                          <span>Submit Equipment Inquiry</span>
                          <ArrowRight size={17} />
                        </>
                      )}
                    </button>

                    <p className="MachinaryEquipmentOne-trustNote">
                      <ShieldCheck size={14} color="#059669" />
                      <span>Free & non-binding quotation. Your details are secured with Rhinco Equipments.</span>
                    </p>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default MachinaryEquipmentOne;