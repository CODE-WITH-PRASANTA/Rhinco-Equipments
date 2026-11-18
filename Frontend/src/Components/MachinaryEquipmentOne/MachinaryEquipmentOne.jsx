import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  Search,
  Filter,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Star,
  Check,
  HelpCircle,
  ArrowRight,
  Layers,
} from "lucide-react";
import "./MachinaryEquipmentOne.css";
import { toMachinerySlug, resolveImageUrl, API_URL } from "../../utils/helpers";

const MACHINERY_API = `${API_URL}/machinery`;
const ENQUIRIES_API = `${API_URL}/enquiries`;
const HELPLINE_PHONE = "+91 98765 43210";
const HELPLINE_TEL = "+919876543210";

const MachinaryEquipmentOne = () => {
  const navigate = useNavigate();
  const [machinery, setMachinery] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedHpRanges, setSelectedHpRanges] = useState([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState("relevance");

  // Mobile drawer filter toggle
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Collapsible sidebar sections (Flipkart/Facebook style)
  const [collapsedSections, setCollapsedSections] = useState({
    categories: false,
    brand: false,
    hp: false,
    availability: false,
    rating: false,
  });

  const toggleSection = (sectionKey) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  };

  // Brand search filter inside sidebar
  const [brandSearch, setBrandSearch] = useState("");

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

  // Compute category counts & brands counts dynamically
  const { categoryList, brandList } = useMemo(() => {
    const catMap = {};
    const brandMap = {};

    machinery.forEach((item) => {
      const c = (item.category || item.implementType || "Other").trim();
      catMap[c] = (catMap[c] || 0) + 1;

      const b = (item.brand || item.brandName || "Rhinco").trim();
      brandMap[b] = (brandMap[b] || 0) + 1;
    });

    const sortedCats = Object.keys(catMap)
      .sort((a, b) => a.localeCompare(b))
      .map((cat) => ({ name: cat, count: catMap[cat] }));

    const sortedBrands = Object.keys(brandMap)
      .sort((a, b) => a.localeCompare(b))
      .map((brand) => ({ name: brand, count: brandMap[brand] }));

    return {
      categoryList: sortedCats,
      brandList: sortedBrands,
    };
  }, [machinery]);

  // HP Range helpers
  const matchesHpRange = (itemHp, selectedRanges) => {
    if (!selectedRanges || selectedRanges.length === 0) return true;
    const num = parseInt(String(itemHp || "").replace(/[^\d]/g, ""), 10);
    if (!num) return selectedRanges.includes("other");

    return selectedRanges.some((range) => {
      if (range === "under35") return num <= 35;
      if (range === "36to50") return num >= 36 && num <= 50;
      if (range === "above50") return num > 50;
      return false;
    });
  };

  // Toggle brand selection
  const handleToggleBrand = (brandName) => {
    setSelectedBrands((prev) =>
      prev.includes(brandName)
        ? prev.filter((b) => b !== brandName)
        : [...prev, brandName]
    );
  };

  // Toggle HP range selection
  const handleToggleHp = (rangeKey) => {
    setSelectedHpRanges((prev) =>
      prev.includes(rangeKey)
        ? prev.filter((r) => r !== rangeKey)
        : [...prev, rangeKey]
    );
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearch("");
    setSelectedCategory("All");
    setSelectedBrands([]);
    setSelectedHpRanges([]);
    setInStockOnly(false);
    setMinRating(0);
    setSortBy("relevance");
  };

  const hasActiveFilters =
    search.trim() !== "" ||
    selectedCategory !== "All" ||
    selectedBrands.length > 0 ||
    selectedHpRanges.length > 0 ||
    inStockOnly ||
    minRating > 0;

  // Filtered & Sorted machinery list
  const filteredMachinery = useMemo(() => {
    let list = machinery.filter((item) => {
      const title = String(item.name || item.title || "").toLowerCase();
      const brand = String(item.brand || item.brandName || "").toLowerCase();
      const category = String(item.category || item.implementType || "").toLowerCase();
      const code = String(item.code || item.modelName || "").toLowerCase();
      const itemHp = item.powerRequirement || item.powerRequired || item.power || "";

      // Search match
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matches =
          title.includes(q) ||
          brand.includes(q) ||
          category.includes(q) ||
          code.includes(q);
        if (!matches) return false;
      }

      // Category filter
      if (
        selectedCategory !== "All" &&
        category !== selectedCategory.toLowerCase()
      ) {
        return false;
      }

      // Brand filter
      if (selectedBrands.length > 0) {
        const itemBrand = (item.brand || item.brandName || "Rhinco").trim();
        if (!selectedBrands.includes(itemBrand)) return false;
      }

      // HP Range filter
      if (!matchesHpRange(itemHp, selectedHpRanges)) {
        return false;
      }

      // Stock status filter
      if (inStockOnly) {
        const isAvail =
          item.status === "Available" ||
          item.availableAtStore === "Yes" ||
          item.stockQuantity > 0;
        if (!isAvail) return false;
      }

      // Rating filter
      if (minRating > 0) {
        const r = Number(item.rating || 4.8);
        if (r < minRating) return false;
      }

      return true;
    });

    // Sorting
    if (sortBy === "priceAsc") {
      list.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    } else if (sortBy === "priceDesc") {
      list.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    } else if (sortBy === "nameAsc") {
      list.sort((a, b) =>
        String(a.name || a.title || "").localeCompare(String(b.name || b.title || ""))
      );
    } else if (sortBy === "rating") {
      list.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
    }

    return list;
  }, [
    machinery,
    search,
    selectedCategory,
    selectedBrands,
    selectedHpRanges,
    inStockOnly,
    minRating,
    sortBy,
  ]);

  // Handle open contact dealer modal
  const handleOpenDealerModal = (item, e) => {
    if (e) e.stopPropagation();
    setSelectedProduct(item);
    setModalSuccess(false);
    setModalError("");

    let defaultName = "";
    let defaultPhone = "";
    let defaultEmail = "";
    try {
      const stored = localStorage.getItem("rhinco_user");
      if (stored) {
        const u = JSON.parse(stored);
        defaultName = u.name || "";
        defaultPhone = u.phone || "";
        defaultEmail = u.email || "";
      }
    } catch (err) {}

    setModalForm({
      name: defaultName,
      phone: defaultPhone,
      email: defaultEmail,
      location: "",
      intent: "Price Quotation",
      message: `I am interested in ${item.name || item.title || "this machinery"}. Please share quotation, subsidy options, and dealer delivery schedule.`,
    });
  };

  // Submit dealer quotation inquiry
  const handleModalSubmit = async (e) => {
    e.preventDefault();
    if (!modalForm.name.trim() || !modalForm.phone.trim()) {
      setModalError("Please provide your name and phone number.");
      return;
    }

    setModalSubmitting(true);
    setModalError("");

    try {
      const payload = {
        name: modalForm.name.trim(),
        phone: modalForm.phone.trim(),
        email: modalForm.email.trim(),
        location: modalForm.location.trim() || "District Buyer",
        product:
          selectedProduct?.name ||
          selectedProduct?.title ||
          "Machinery Equipment",
        source: "Machinery Catalogue Showcase",
        intent: modalForm.intent || "Price Quotation",
        message: modalForm.message.trim(),
      };

      const res = await fetch(ENQUIRIES_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setModalSuccess(true);
        window.dispatchEvent(
          new CustomEvent("rhinco_enquiry_submitted", { detail: payload })
        );
      } else {
        setModalError(
          data.message ||
            "Unable to submit inquiry at this moment. Please call our helpline."
        );
      }
    } catch (err) {
      console.error("Modal submission error:", err);
      setModalError(
        "Network connection issue. Please dial our helpline: +91 98765 43210"
      );
    } finally {
      setModalSubmitting(false);
    }
  };

  return (
    <div className="FkMachinery-wrapper">
      {/* Top Header & Breadcrumb Bar */}
      <div className="FkMachinery-topBar">
        <div className="FkMachinery-container">
          <nav className="FkMachinery-breadcrumb">
            <Link to="/">Home</Link>
            <span className="FkMachinery-breadcrumbDivider">/</span>
            <span className="FkMachinery-breadcrumbCurrent">
              Agricultural Machinery
            </span>
          </nav>
        </div>
      </div>

      <div className="FkMachinery-container FkMachinery-layout">
        {/* MOBILE FILTER TOGGLE BUTTON */}
        <div className="FkMachinery-mobileControls">
          <button
            type="button"
            className="FkMachinery-mobileFilterBtn"
            onClick={() => setMobileFilterOpen(true)}
          >
            <Filter size={16} />
            <span>Filters ({hasActiveFilters ? "Active" : "All"})</span>
          </button>
          <div className="FkMachinery-mobileResultsCount">
            {filteredMachinery.length} Machinery Found
          </div>
        </div>

        {/* ================= LEFT SIDEBAR (FLIPKART / FACEBOOK STYLE) ================= */}
        <aside
          className={`FkMachinery-sidebar ${
            mobileFilterOpen ? "FkMachinery-sidebar--mobileOpen" : ""
          }`}
        >
          <div className="FkMachinery-sidebarCard">
            {/* Sidebar Header */}
            <div className="FkMachinery-filterHeader">
              <div className="FkMachinery-filterTitleRow">
                <SlidersHorizontal size={18} className="FkMachinery-filterIcon" />
                <span className="FkMachinery-filterHeading">Filters</span>
              </div>
              {hasActiveFilters && (
                <button
                  type="button"
                  className="FkMachinery-clearBtn"
                  onClick={handleResetFilters}
                >
                  CLEAR ALL
                </button>
              )}
              {mobileFilterOpen && (
                <button
                  type="button"
                  className="FkMachinery-closeDrawerBtn"
                  onClick={() => setMobileFilterOpen(false)}
                  aria-label="Close filters"
                >
                  <X size={20} />
                </button>
              )}
            </div>

            {/* Active Filter Chips */}
            {hasActiveFilters && (
              <div className="FkMachinery-activeChips">
                {selectedCategory !== "All" && (
                  <span className="FkMachinery-chip">
                    {selectedCategory}
                    <button
                      type="button"
                      onClick={() => setSelectedCategory("All")}
                    >
                      ×
                    </button>
                  </span>
                )}
                {selectedBrands.map((b) => (
                  <span key={b} className="FkMachinery-chip">
                    {b}
                    <button type="button" onClick={() => handleToggleBrand(b)}>
                      ×
                    </button>
                  </span>
                ))}
                {selectedHpRanges.map((r) => (
                  <span key={r} className="FkMachinery-chip">
                    {r === "under35"
                      ? "≤35 HP"
                      : r === "36to50"
                      ? "36-50 HP"
                      : ">50 HP"}
                    <button type="button" onClick={() => handleToggleHp(r)}>
                      ×
                    </button>
                  </span>
                ))}
                {inStockOnly && (
                  <span className="FkMachinery-chip">
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
                  <span className="FkMachinery-chip">
                    {minRating}★ & above
                    <button type="button" onClick={() => setMinRating(0)}>
                      ×
                    </button>
                  </span>
                )}
              </div>
            )}

            {/* SECTION 1: CATEGORIES (FLIPKART STYLE) */}
            <div className="FkMachinery-section">
              <div
                className="FkMachinery-sectionHeader"
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
                <div className="FkMachinery-catList">
                  <button
                    type="button"
                    className={`FkMachinery-catItem ${
                      selectedCategory === "All" ? "active" : ""
                    }`}
                    onClick={() => setSelectedCategory("All")}
                  >
                    <span className="FkMachinery-catName">
                      All Equipment Types
                    </span>
                    <span className="FkMachinery-catCount">
                      {machinery.length}
                    </span>
                  </button>
                  {categoryList.map((cat) => (
                    <button
                      type="button"
                      key={cat.name}
                      className={`FkMachinery-catItem ${
                        selectedCategory === cat.name ? "active" : ""
                      }`}
                      onClick={() => setSelectedCategory(cat.name)}
                    >
                      <span className="FkMachinery-catName">{cat.name}</span>
                      <span className="FkMachinery-catCount">{cat.count}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* SECTION 2: BRAND FILTER */}
            <div className="FkMachinery-section">
              <div
                className="FkMachinery-sectionHeader"
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
                <div className="FkMachinery-sectionBody">
                  {brandList.length > 5 && (
                    <div className="FkMachinery-filterSearchBox">
                      <Search size={14} />
                      <input
                        type="text"
                        placeholder="Search Brand"
                        value={brandSearch}
                        onChange={(e) => setBrandSearch(e.target.value)}
                      />
                    </div>
                  )}
                  <div className="FkMachinery-checkboxList">
                    {brandList
                      .filter((b) =>
                        b.name.toLowerCase().includes(brandSearch.toLowerCase())
                      )
                      .map((b) => {
                        const isChecked = selectedBrands.includes(b.name);
                        return (
                          <label
                            key={b.name}
                            className={`FkMachinery-checkboxRow ${
                              isChecked ? "checked" : ""
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggleBrand(b.name)}
                            />
                            <span className="FkMachinery-customCheck">
                              {isChecked && <Check size={12} />}
                            </span>
                            <span className="FkMachinery-labelTxt">
                              {b.name}
                            </span>
                            <span className="FkMachinery-labelCount">
                              ({b.count})
                            </span>
                          </label>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 3: TRACTOR HP POWER REQUIREMENT */}
            <div className="FkMachinery-section">
              <div
                className="FkMachinery-sectionHeader"
                onClick={() => toggleSection("hp")}
              >
                <span>TRACTOR HP / POWER</span>
                {collapsedSections.hp ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronUp size={16} />
                )}
              </div>
              {!collapsedSections.hp && (
                <div className="FkMachinery-sectionBody">
                  <div className="FkMachinery-checkboxList">
                    {[
                      { key: "under35", label: "35 HP & Below" },
                      { key: "36to50", label: "36 HP - 50 HP" },
                      { key: "above50", label: "Above 50 HP (Heavy Duty)" },
                    ].map((hp) => {
                      const isChecked = selectedHpRanges.includes(hp.key);
                      return (
                        <label
                          key={hp.key}
                          className={`FkMachinery-checkboxRow ${
                            isChecked ? "checked" : ""
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleHp(hp.key)}
                          />
                          <span className="FkMachinery-customCheck">
                            {isChecked && <Check size={12} />}
                          </span>
                          <span className="FkMachinery-labelTxt">
                            {hp.label}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 4: AVAILABILITY */}
            <div className="FkMachinery-section">
              <div
                className="FkMachinery-sectionHeader"
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
                <div className="FkMachinery-sectionBody">
                  <label className="FkMachinery-checkboxRow">
                    <input
                      type="checkbox"
                      checked={inStockOnly}
                      onChange={(e) => setInStockOnly(e.target.checked)}
                    />
                    <span className="FkMachinery-customCheck">
                      {inStockOnly && <Check size={12} />}
                    </span>
                    <span className="FkMachinery-labelTxt">
                      Include In-Stock Only
                    </span>
                  </label>
                </div>
              )}
            </div>

            {/* SECTION 5: CUSTOMER RATINGS */}
            <div className="FkMachinery-section">
              <div
                className="FkMachinery-sectionHeader"
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
                <div className="FkMachinery-sectionBody">
                  <div className="FkMachinery-checkboxList">
                    {[4, 3].map((star) => (
                      <label key={star} className="FkMachinery-checkboxRow">
                        <input
                          type="radio"
                          name="ratingFilter"
                          checked={minRating === star}
                          onChange={() =>
                            setMinRating(minRating === star ? 0 : star)
                          }
                        />
                        <span className="FkMachinery-customRadio" />
                        <span className="FkMachinery-starRow">
                          <span>{star}★ & above</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* SIDEBAR HELPLINE CARD */}
            <div className="FkMachinery-sidebarHelpline">
              <div className="FkMachinery-helplineIcon">
                <Phone size={18} />
              </div>
              <div className="FkMachinery-helplineBody">
                <span className="FkMachinery-helplineLabel">
                  Dealer Helpline
                </span>
                <a
                  href={`tel:${HELPLINE_TEL}`}
                  className="FkMachinery-helplineNumber"
                >
                  {HELPLINE_PHONE}
                </a>
                <span className="FkMachinery-helplineSub">
                  Govt Subsidy & Quotation Support
                </span>
              </div>
            </div>
          </div>
        </aside>

        {/* ================= RIGHT MAIN AREA ================= */}
        <main className="FkMachinery-main">
          {/* Top Utility Bar (Search, Result Count, Sort By) */}
          <div className="FkMachinery-utilityBar">
            <div className="FkMachinery-searchWrap">
              <Search size={16} className="FkMachinery-searchIcon" />
              <input
                type="text"
                placeholder="Search by equipment name, implement type, brand, or model..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="FkMachinery-searchInput"
              />
              {search && (
                <button
                  type="button"
                  className="FkMachinery-searchClear"
                  onClick={() => setSearch("")}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="FkMachinery-utilityRight">
              <span className="FkMachinery-resultsCount">
                Showing <strong>{filteredMachinery.length}</strong> items
              </span>

              <div className="FkMachinery-sortWrap">
                <span className="FkMachinery-sortLabel">Sort By:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="FkMachinery-sortSelect"
                >
                  <option value="relevance">Relevance</option>
                  <option value="priceAsc">Price -- Low to High</option>
                  <option value="priceDesc">Price -- High to Low</option>
                  <option value="nameAsc">Name (A - Z)</option>
                  <option value="rating">Customer Rating</option>
                </select>
              </div>
            </div>
          </div>

          {/* Machinery Grid Area */}
          {loading ? (
            <div className="FkMachinery-loadingState">
              <div className="FkMachinery-spinner" />
              <p>Loading authorized machinery catalogue...</p>
            </div>
          ) : filteredMachinery.length === 0 ? (
            <div className="FkMachinery-emptyState">
              <Tractor size={48} strokeWidth={1.3} />
              <h3>No machinery equipment matches your current filters</h3>
              <p>
                Try clearing selected brands, category, or search keywords to view
                the full machinery catalogue.
              </p>
              <button
                type="button"
                className="FkMachinery-emptyResetBtn"
                onClick={handleResetFilters}
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="FkMachinery-grid">
              {filteredMachinery.map((item) => {
                const title = item.name || item.title || "Agricultural Machine";
                const brand = item.brand || item.brandName || "Rhinco";
                const category = item.category || item.implementType || "Farm Equipment";
                const slug = toMachinerySlug(item.name || item.title || "");
                const power =
                  item.powerRequirement ||
                  item.powerRequired ||
                  item.power ||
                  "35 - 50 HP";
                const price = item.price ? Number(item.price) : 0;

                const primaryImg =
                  item.image ||
                  (Array.isArray(item.images) && item.images[0]) ||
                  (Array.isArray(item.machineImages) && item.machineImages[0]) ||
                  "";

                return (
                  <article
                    key={item._id || item.id}
                    className="FkMachinery-card"
                    onClick={() => navigate(`/machinery/${slug}`)}
                    style={{ cursor: "pointer" }}
                  >
                    {/* CARD THUMBNAIL */}
                    <Link
                      to={`/machinery/${slug}`}
                      className="FkMachinery-cardMedia"
                    >
                      {primaryImg ? (
                        <img
                          src={resolveImageUrl(primaryImg)}
                          alt={title}
                          className="FkMachinery-cardImg"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="FkMachinery-cardImgFallback">
                          <Tractor size={40} strokeWidth={1.2} />
                        </div>
                      )}

                      <div className="FkMachinery-cardBadges">
                        <span className="FkMachinery-subsidyTag">
                          <Sparkles size={11} />
                          Subsidy Eligible
                        </span>
                      </div>
                    </Link>

                    {/* CARD CONTENT */}
                    <div className="FkMachinery-cardBody">
                      <div className="FkMachinery-cardMetaRow">
                        <span className="FkMachinery-brandPill">{brand}</span>
                        <span className="FkMachinery-categoryPill">
                          {category}
                        </span>
                      </div>

                      <h3 className="FkMachinery-cardTitle">
                        <Link to={`/machinery/${slug}`} title={title}>
                          {title}
                        </Link>
                      </h3>

                      {/* QUICK SPECS ROW */}
                      <div className="FkMachinery-specRow">
                        <div className="FkMachinery-specItem">
                          <span className="FkMachinery-specLabel">Power HP</span>
                          <strong className="FkMachinery-specVal">{power}</strong>
                        </div>
                        <div className="FkMachinery-specItem">
                          <span className="FkMachinery-specLabel">Warranty</span>
                          <strong className="FkMachinery-specVal">
                            {item.warranty || "1 Year Standard"}
                          </strong>
                        </div>
                      </div>

                      {/* RATING ROW */}
                      <div className="FkMachinery-ratingRow">
                        <div className="FkMachinery-stars">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              size={12}
                              fill={
                                s <= Math.floor(item.rating || 5)
                                  ? "#f59e0b"
                                  : "#e2e8f0"
                              }
                              color={
                                s <= Math.floor(item.rating || 5)
                                  ? "#f59e0b"
                                  : "#cbd5e1"
                              }
                            />
                          ))}
                        </div>
                        <span className="FkMachinery-ratingNum">
                          {item.rating || 4.8}
                        </span>
                      </div>

                      {/* PRICE & ACTIONS */}
                      <div className="FkMachinery-cardFooter">
                        <div className="FkMachinery-priceWrap">
                          <span className="FkMachinery-price">
                            {price > 0
                              ? `₹ ${price.toLocaleString("en-IN")}`
                              : "Price On Request"}
                          </span>
                          <span className="FkMachinery-subsidyNote">
                            Subsidy assistance available
                          </span>
                        </div>

                        <div className="FkMachinery-actions">
                          <Link
                            to={`/machinery/${slug}`}
                            className="FkMachinery-specsBtn"
                            title="View Full Specifications"
                          >
                            Full Specifications
                          </Link>

                          <button
                            type="button"
                            className="FkMachinery-dealerBtn"
                            onClick={(e) => handleOpenDealerModal(item, e)}
                            title="Connect with authorized dealer"
                          >
                            <Phone size={13} />
                            <span>Contact Dealer</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* ================= CONTACT DEALER MODAL ================= */}
      {selectedProduct && (
        <div
          className="FkMachinery-modalOverlay"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="FkMachinery-modalDialog"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="FkMachinery-modalHeader">
              <div>
                <h3>Connect With Authorized Dealer</h3>
                <p>Direct dealer quotation, subsidy claim & field trial</p>
              </div>
              <button
                type="button"
                className="FkMachinery-modalClose"
                onClick={() => setSelectedProduct(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="FkMachinery-modalContent">
              {modalSuccess ? (
                <div className="FkMachinery-modalSuccess">
                  <CheckCircle2 size={48} color="#059669" />
                  <h4>Inquiry Successfully Transmitted!</h4>
                  <p>
                    Thank you <strong>{modalForm.name}</strong>. Our authorized
                    district dealer has received your inquiry for{" "}
                    <strong>
                      {selectedProduct.name || selectedProduct.title}
                    </strong>{" "}
                    and will call you at <strong>{modalForm.phone}</strong> shortly.
                  </p>
                  <div className="FkMachinery-modalHelplineNotice">
                    <span>Direct Dealer Helpline: </span>
                    <a href={`tel:${HELPLINE_TEL}`}>{HELPLINE_PHONE}</a>
                  </div>
                  <button
                    type="button"
                    className="FkMachinery-modalDoneBtn"
                    onClick={() => setSelectedProduct(null)}
                  >
                    Done
                  </button>
                </div>
              ) : (
                <>
                  <div className="FkMachinery-modalItemCard">
                    <div className="FkMachinery-modalItemImg">
                      <Tractor size={30} color="#059669" />
                    </div>
                    <div>
                      <h4>
                        {selectedProduct.name || selectedProduct.title}
                      </h4>
                      <p>
                        {selectedProduct.brand || "Rhinco"} •{" "}
                        {selectedProduct.category || "Farm Machinery"}
                      </p>
                    </div>
                  </div>

                  {modalError && (
                    <div className="FkMachinery-modalError">
                      {modalError}
                    </div>
                  )}

                  <form
                    onSubmit={handleModalSubmit}
                    className="FkMachinery-modalForm"
                  >
                    <div className="FkMachinery-formRow">
                      <div className="FkMachinery-formField">
                        <label>Full Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Ramesh Patel"
                          value={modalForm.name}
                          onChange={(e) =>
                            setModalForm({ ...modalForm, name: e.target.value })
                          }
                        />
                      </div>
                      <div className="FkMachinery-formField">
                        <label>Mobile Number *</label>
                        <input
                          type="tel"
                          required
                          placeholder="e.g. 9876543210"
                          value={modalForm.phone}
                          onChange={(e) =>
                            setModalForm({
                              ...modalForm,
                              phone: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="FkMachinery-formRow">
                      <div className="FkMachinery-formField">
                        <label>District / Village</label>
                        <input
                          type="text"
                          placeholder="e.g. Cuttack, Odisha"
                          value={modalForm.location}
                          onChange={(e) =>
                            setModalForm({
                              ...modalForm,
                              location: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="FkMachinery-formField">
                        <label>Email (Optional)</label>
                        <input
                          type="email"
                          placeholder="e.g. ramesh@gmail.com"
                          value={modalForm.email}
                          onChange={(e) =>
                            setModalForm({
                              ...modalForm,
                              email: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="FkMachinery-formField">
                      <label>Inquiry Requirement</label>
                      <textarea
                        rows={3}
                        value={modalForm.message}
                        onChange={(e) =>
                          setModalForm({
                            ...modalForm,
                            message: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="FkMachinery-modalFooter">
                      <div className="FkMachinery-modalHelplineHint">
                        Helpline: <a href={`tel:${HELPLINE_TEL}`}>{HELPLINE_PHONE}</a>
                      </div>
                      <div className="FkMachinery-modalBtns">
                        <button
                          type="button"
                          className="FkMachinery-cancelBtn"
                          onClick={() => setSelectedProduct(null)}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={modalSubmitting}
                          className="FkMachinery-submitBtn"
                        >
                          {modalSubmitting ? "Submitting..." : "Submit Quotation Request →"}
                        </button>
                      </div>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MachinaryEquipmentOne;
