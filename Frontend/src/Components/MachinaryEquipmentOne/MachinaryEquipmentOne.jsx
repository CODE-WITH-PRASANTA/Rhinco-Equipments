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
  Search,
  Filter,
  RotateCcw,
  SlidersHorizontal,
  ChevronDown,
} from "lucide-react";
import "./MachinaryEquipmentOne.css";
import { toMachinerySlug, resolveImageUrl, API_URL } from "../../utils/helpers";

const MACHINERY_API = `${API_URL}/machinery`;
const ENQUIRIES_API = `${API_URL}/enquiries`;

const MachinaryEquipmentOne = () => {
  const [machinery, setMachinery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("featured");

  // Contact dealer modal states
  const [selectedProduct, setSelectedProduct] = useState(null);
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

  // Load real machinery from database
  useEffect(() => {
    let isMounted = true;
    const loadMachinery = async () => {
      setLoading(true);
      try {
        const res = await fetch(MACHINERY_API);
        const data = await res.json();
        if (res.ok && data.success && Array.isArray(data.data)) {
          if (isMounted) setMachinery(data.data);
        }
      } catch (err) {
        console.error("Error loading machinery from database:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadMachinery();
    return () => {
      isMounted = false;
    };
  }, []);

  // Compute brand and category filter lists
  const { brands, categories } = useMemo(() => {
    const bSet = new Set();
    const cSet = new Set();

    machinery.forEach((item) => {
      const b = item.brand || item.brandName;
      if (b) bSet.add(b.trim());

      const c = item.category || item.implementType;
      if (c) cSet.add(c.trim());
    });

    return {
      brands: ["All", ...Array.from(bSet).sort()],
      categories: ["All", ...Array.from(cSet).sort()],
    };
  }, [machinery]);

  // Filter & sort machinery
  const filteredMachinery = useMemo(() => {
    let list = machinery.filter((item) => {
      const title = String(item.name || item.title || "").toLowerCase();
      const brand = String(item.brand || item.brandName || "").toLowerCase();
      const category = String(item.category || item.implementType || "").toLowerCase();
      const code = String(item.code || item.modelName || "").toLowerCase();
      const q = search.trim().toLowerCase();

      const matchesSearch =
        !q ||
        title.includes(q) ||
        brand.includes(q) ||
        category.includes(q) ||
        code.includes(q);

      const matchesBrand =
        selectedBrand === "All" ||
        brand === selectedBrand.toLowerCase();

      const matchesCategory =
        selectedCategory === "All" ||
        category === selectedCategory.toLowerCase();

      return matchesSearch && matchesBrand && matchesCategory;
    });

    if (sortBy === "price-low") {
      list.sort((a, b) => Number(a.discountPrice || a.price || 0) - Number(b.discountPrice || b.price || 0));
    } else if (sortBy === "price-high") {
      list.sort((a, b) => Number(b.discountPrice || b.price || 0) - Number(a.discountPrice || a.price || 0));
    } else if (sortBy === "name") {
      list.sort((a, b) => String(a.title || a.name || "").localeCompare(String(b.title || b.name || "")));
    }

    return list;
  }, [machinery, search, selectedBrand, selectedCategory, sortBy]);

  // Handle Contact Dealer
  const handleContactDealer = (item) => {
    setSelectedProduct(item);
    setModalSuccess(false);
    setModalError("");

    let loggedUser = null;
    try {
      const u = localStorage.getItem("rhinco_user");
      if (u) loggedUser = JSON.parse(u);
    } catch (e) {}

    const title = item.name || item.title || "Agricultural Machinery";
    const brand = item.brand || item.brandName || "Rhinco";

    setModalForm({
      name: loggedUser?.name || "",
      phone: loggedUser?.phone || "",
      email: loggedUser?.email || "",
      location: "",
      intent: "Price Quotation",
      message: `I am interested in getting quotation, subsidy paperwork, and dealer contact for ${title} (${brand}).`,
    });
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    if (!modalForm.name.trim() || !modalForm.phone.trim()) {
      setModalError("Please provide your full name and valid phone number.");
      return;
    }

    setModalSubmitting(true);
    setModalError("");
    try {
      const prodName = selectedProduct?.name || selectedProduct?.title || "Machinery Equipment";
      const rawImg = selectedProduct?.image || selectedProduct?.machineImages?.[0] || selectedProduct?.images?.[0] || "";
      const prodImg = typeof rawImg === "string" ? rawImg : rawImg?.url || rawImg?.data || rawImg?.preview || "";
      const prodPrice = selectedProduct?.formattedPrice || (selectedProduct?.price ? `₹ ${Number(selectedProduct.price).toLocaleString("en-IN")}` : "Price on Request");

      let loggedUser = null;
      try {
        const u = localStorage.getItem("rhinco_user");
        if (u) loggedUser = JSON.parse(u);
      } catch (err) {}

      const intentText = modalForm.intent ? `[${modalForm.intent}] ` : "";
      const fullMessage = (intentText + (modalForm.message || `Customer requested quotation for ${prodName}`)).trim();

      const res = await fetch(ENQUIRIES_API, {
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
          const stored = JSON.parse(localStorage.getItem("rhinco_user_enquiries") || "[]");
          stored.unshift(data.data);
          localStorage.setItem("rhinco_user_enquiries", JSON.stringify(stored));
        } catch (e) {}

        setModalSuccess(true);
        window.dispatchEvent(new Event("rhinco_enquiry_submitted"));
        setTimeout(() => {
          setSelectedProduct(null);
          setModalSuccess(false);
        }, 2600);
      } else {
        setModalError(data.message || "Failed to submit enquiry.");
      }
    } catch (err) {
      console.error(err);
      setModalError("Network error: Could not reach server.");
    } finally {
      setModalSubmitting(false);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedBrand("All");
    setSelectedCategory("All");
    setSortBy("featured");
  };

  return (
    <section className="MachineryShowcase">
      {/* HERO BANNER */}
      <div className="MachineryShowcase-hero">
        <div className="MachineryShowcase-heroContainer">
          <div className="MachineryShowcase-heroBadge">
            <Sparkles size={13} />
            <span>DIRECT OEM & AUTHORIZED DEALERSHIP NETWORK</span>
          </div>

          <h1 className="MachineryShowcase-heroTitle">
            Agricultural Machinery & Heavy Implements
          </h1>

          <p className="MachineryShowcase-heroSubtitle">
            Explore high-performance rotavators, multi-crop seeders, laser levellers, and tractor attachments
            with complete government subsidy paperwork and authorized district dealer delivery.
          </p>

          {/* 4 HERO HIGHLIGHT PILLARS */}
          <div className="MachineryShowcase-pillars">
            <div className="MachineryShowcase-pillar">
              <Tractor size={20} />
              <div>
                <strong>{machinery.length || 15}+ Heavy Implements</strong>
                <span>Certified OEM brands</span>
              </div>
            </div>
            <div className="MachineryShowcase-pillar">
              <ShieldCheck size={20} />
              <div>
                <strong>Up to 50% Subsidy Support</strong>
                <span>Assistance in your district</span>
              </div>
            </div>
            <div className="MachineryShowcase-pillar">
              <CheckCircle2 size={20} />
              <div>
                <strong>Field Trial & Demo</strong>
                <span>Pre-delivery verification</span>
              </div>
            </div>
            <div className="MachineryShowcase-pillar">
              <FileText size={20} />
              <div>
                <strong>1-Year Warranty</strong>
                <span>Genuine spare parts support</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FILTER & SHOWCASE CONTAINER */}
      <div className="MachineryShowcase-container">
        {/* INTERACTIVE CONTROLS BAR */}
        <div className="MachineryShowcase-controlsBar">
          {/* SEARCH BOX */}
          <div className="MachineryShowcase-searchBox">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search by implement name, brand, or model..."
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

          {/* DROPDOWN FILTERS */}
          <div className="MachineryShowcase-dropdowns">
            <div className="MachineryShowcase-selectWrap">
              <label>Brand:</label>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
              >
                {brands.map((b) => (
                  <option key={b} value={b}>
                    {b === "All" ? "All Brands" : b}
                  </option>
                ))}
              </select>
            </div>

            <div className="MachineryShowcase-selectWrap">
              <label>Category:</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c === "All" ? "All Categories" : c}
                  </option>
                ))}
              </select>
            </div>

            <div className="MachineryShowcase-selectWrap">
              <label>Sort:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="featured">Featured Implements</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
              </select>
            </div>

            {(search || selectedBrand !== "All" || selectedCategory !== "All") && (
              <button
                type="button"
                className="MachineryShowcase-clearBtn"
                onClick={clearFilters}
              >
                <RotateCcw size={14} />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* CATEGORY QUICK FILTER PILLS */}
        <div className="MachineryShowcase-pillsRow">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                type="button"
                key={cat}
                className={`MachineryShowcase-catPill ${isActive ? "active" : ""}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat === "All" ? "All Equipment Types" : cat}
              </button>
            );
          })}
        </div>

        {/* RESULTS HEADER */}
        <div className="MachineryShowcase-resultsHeader">
          <div>
            <h3>
              {selectedCategory === "All" ? "All Agricultural Machinery" : selectedCategory}
            </h3>
            <p>
              Showing <strong>{filteredMachinery.length}</strong> verified equipment implements
              {selectedBrand !== "All" && ` from ${selectedBrand}`}
            </p>
          </div>
          <span className="MachineryShowcase-resultsTag">
            ● Quality Agricultural Inventory Direct from Factory
          </span>
        </div>

        {/* MACHINERY GRID */}
        {loading ? (
          <div className="MachineryShowcase-loading">
            <div className="MachineryShowcase-spinner" />
            <p>Loading real machinery catalogue...</p>
          </div>
        ) : filteredMachinery.length === 0 ? (
          <div className="MachineryShowcase-empty">
            <Tractor size={48} strokeWidth={1.3} />
            <h3>No machinery matches your filters</h3>
            <p>Try resetting the search terms or selecting another category.</p>
            <button
              type="button"
              className="MachineryShowcase-resetBtn"
              onClick={clearFilters}
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="MachineryShowcase-grid">
            {filteredMachinery.map((item) => {
              const title = item.name || item.title || "Equipment";
              const brand = item.brand || item.brandName || "Rhinco";
              const power = item.power || item.implementPower || "Standard HP";
              const category = item.category || item.implementType || "Machinery";
              const model = item.modelName || item.code || "";
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
                <article key={item._id || item.id} className="MachineryCard">
                  {/* CARD IMAGE */}
                  <div className="MachineryCard-imageArea">
                    <span className="MachineryCard-brandBadge">{brand}</span>

                    {item.sponsored && (
                      <span className="MachineryCard-sponsoredBadge">★ Sponsored</span>
                    )}

                    <Link
                      to={`/machinery/${toMachinerySlug(title)}`}
                      className="MachineryCard-imageLink"
                    >
                      <img
                        src={imgSrc}
                        alt={title}
                        loading="lazy"
                        className="MachineryCard-img"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.png";
                        }}
                      />
                    </Link>
                  </div>

                  {/* CARD BODY */}
                  <div className="MachineryCard-body">
                    <div className="MachineryCard-categoryRow">
                      <span className="MachineryCard-category">{category}</span>
                      {model && <span className="MachineryCard-model">Model: {model}</span>}
                    </div>

                    <h3 className="MachineryCard-title">
                      <Link to={`/machinery/${toMachinerySlug(title)}`}>
                        {title}
                      </Link>
                    </h3>

                    {/* SPECS ROW */}
                    <div className="MachineryCard-specsRow">
                      <div className="MachineryCard-spec">
                        <span>Power</span>
                        <strong>{power}</strong>
                      </div>
                      <div className="MachineryCard-specDivider" />
                      <div className="MachineryCard-spec">
                        <span>Availability</span>
                        <strong className="status-in-stock">
                          {item.status || "In Stock"}
                        </strong>
                      </div>
                    </div>

                    {/* PRICE & ACTIONS */}
                    <div className="MachineryCard-footer">
                      <div className="MachineryCard-priceArea">
                        <span className="MachineryCard-priceLabel">Estimated Price</span>
                        <span className="MachineryCard-price">
                          {priceText || "Price on Request"}
                        </span>
                      </div>

                      <div className="MachineryCard-actions">
                        <Link
                          to={`/machinery/${toMachinerySlug(title)}`}
                          className="MachineryCard-viewBtn"
                          title="View Specifications"
                        >
                          Specs →
                        </Link>
                        <button
                          type="button"
                          className="MachineryCard-contactBtn"
                          onClick={() => handleContactDealer(item)}
                        >
                          Contact Dealer
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* UNIFIED CONTACT DEALER MODAL */}
      {selectedProduct && (
        <div
          className="MachinaryEquipmentOne-modalOverlay"
          onClick={() => !modalSubmitting && setSelectedProduct(null)}
        >
          <div
            className="MachinaryEquipmentOne-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="MachinaryEquipmentOne-modalHead">
              <div>
                <span className="MachinaryEquipmentOne-modalBadge">
                  <Tractor size={13} />
                  <span>OFFICIAL FACTORY DEALER INQUIRY</span>
                </span>
                <h3>Connect with Authorized Dealer</h3>
                <p>
                  Get direct factory quotations, tractor compatibility verification & government subsidy support.
                </p>
              </div>

              <button
                type="button"
                className="MachinaryEquipmentOne-modalCloseBtn"
                onClick={() => setSelectedProduct(null)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="MachinaryEquipmentOne-modalBody">
              {modalSuccess ? (
                <div className="MachinaryEquipmentOne-successCard">
                  <div className="MachinaryEquipmentOne-successIconWrap">
                    <CheckCircle2 size={36} />
                  </div>
                  <h4>Inquiry Sent Successfully!</h4>
                  <p>
                    Thank you, <strong>{modalForm.name}</strong>. Our authorized equipment dealer has received your quotation request for{" "}
                    <strong>{selectedProduct.name || selectedProduct.title}</strong> and will contact you at <strong>{modalForm.phone}</strong> shortly.
                  </p>
                </div>
              ) : (
                <>
                  <div className="MachinaryEquipmentOne-spotlight">
                    <div className="MachinaryEquipmentOne-spotlightImg">
                      <img
                        src={resolveImageUrl(
                          selectedProduct.image || selectedProduct.machineImages?.[0],
                          "/placeholder.png"
                        )}
                        alt={selectedProduct.name || selectedProduct.title}
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.png";
                        }}
                      />
                    </div>
                    <div className="MachinaryEquipmentOne-spotlightMeta">
                      <span className="MachinaryEquipmentOne-spotlightBrand">
                        {selectedProduct.brand || selectedProduct.brandName || "Rhinco Implements"}
                      </span>
                      <h4>{selectedProduct.name || selectedProduct.title}</h4>
                      <div className="MachinaryEquipmentOne-spotlightTags">
                        <span>Power: {selectedProduct.power || selectedProduct.implementPower || "Standard HP"}</span>
                        <span>
                          Price:{" "}
                          {selectedProduct.formattedPrice ||
                            (selectedProduct.price
                              ? `₹ ${Number(selectedProduct.price).toLocaleString("en-IN")}`
                              : "On Request")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {modalError && (
                    <div className="MachinaryEquipmentOne-errorNotice">
                      {modalError}
                    </div>
                  )}

                  <form onSubmit={handleModalSubmit} className="MachinaryEquipmentOne-form">
                    <div className="MachinaryEquipmentOne-formGrid">
                      <div className="MachinaryEquipmentOne-field">
                        <label>
                          <User size={14} />
                          <span>Full Name *</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Ramesh Patel"
                          value={modalForm.name}
                          onChange={(e) => setModalForm({ ...modalForm, name: e.target.value })}
                        />
                      </div>

                      <div className="MachinaryEquipmentOne-field">
                        <label>
                          <Phone size={14} />
                          <span>Mobile Number *</span>
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder="e.g. 9876543210"
                          value={modalForm.phone}
                          onChange={(e) => setModalForm({ ...modalForm, phone: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="MachinaryEquipmentOne-formGrid">
                      <div className="MachinaryEquipmentOne-field">
                        <label>
                          <MapPin size={14} />
                          <span>District / Village (for dealer matching)</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Cuttack, Odisha"
                          value={modalForm.location}
                          onChange={(e) => setModalForm({ ...modalForm, location: e.target.value })}
                        />
                      </div>

                      <div className="MachinaryEquipmentOne-field">
                        <label>
                          <Mail size={14} />
                          <span>Email (optional)</span>
                        </label>
                        <input
                          type="email"
                          placeholder="e.g. ramesh@gmail.com"
                          value={modalForm.email}
                          onChange={(e) => setModalForm({ ...modalForm, email: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="MachinaryEquipmentOne-field">
                      <label>
                        <span>Inquiry Message / Requirement</span>
                      </label>
                      <textarea
                        rows={3}
                        value={modalForm.message}
                        onChange={(e) => setModalForm({ ...modalForm, message: e.target.value })}
                      />
                    </div>

                    <div className="MachinaryEquipmentOne-modalActions">
                      <button
                        type="button"
                        className="MachinaryEquipmentOne-cancelBtn"
                        onClick={() => setSelectedProduct(null)}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={modalSubmitting}
                        className="MachinaryEquipmentOne-submitBtn"
                      >
                        {modalSubmitting ? "Connecting Dealer..." : "Submit Quotation Request →"}
                      </button>
                    </div>
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
