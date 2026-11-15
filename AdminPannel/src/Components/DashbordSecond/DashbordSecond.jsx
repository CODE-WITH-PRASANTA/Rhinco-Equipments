import React, { useEffect, useMemo, useState } from "react";
import {
  Package,
  ArrowRight,
  TrendingUp,
  Users,
  X,
  Search,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  CalendarDays,
  Tag,
  Tractor,
  Eye,
} from "lucide-react";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import "./DashbordSecond.css";

/* ==============================
   PRODUCT DATA
================================ */

const products = [
  {
    id: 1,
    name: "Rotavator (6 ft)",
    enquiries: 12,
    price: 125000,
    image:
      "https://images.unsplash.com/photo-1592982537447-6f2a6a0e7c14?w=150&h=100&fit=crop",
    category: "Agricultural Equipment",
    stock: 18,
    description:
      "Heavy-duty 6 feet rotavator designed for efficient soil preparation and modern farming.",
  },
  {
    id: 2,
    name: "Disc Harrow",
    enquiries: 9,
    price: 95000,
    image:
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=150&h=100&fit=crop",
    category: "Tillage Equipment",
    stock: 24,
    description:
      "Durable disc harrow for breaking soil clods and preparing agricultural fields.",
  },
  {
    id: 3,
    name: "Seed Drill",
    enquiries: 8,
    price: 140000,
    image:
      "https://images.unsplash.com/photo-1499529112087-3cb3b73cec95?w=150&h=100&fit=crop",
    category: "Planting Equipment",
    stock: 12,
    description:
      "Precision seed drill for uniform seed placement and efficient sowing.",
  },
  {
    id: 4,
    name: "Cultivator",
    enquiries: 7,
    price: 72000,
    image:
      "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=150&h=100&fit=crop",
    category: "Tillage Equipment",
    stock: 30,
    description:
      "Reliable cultivator for loosening soil and controlling weeds.",
  },
  {
    id: 5,
    name: "Power Tiller",
    enquiries: 6,
    price: 88000,
    image:
      "https://images.unsplash.com/photo-1472396961693-142e6e269027?w=150&h=100&fit=crop",
    category: "Farm Machinery",
    stock: 15,
    description:
      "Compact power tiller suitable for small and medium agricultural farms.",
  },
  {
    id: 6,
    name: "Tractor Attachments",
    enquiries: 5,
    price: 65000,
    image:
      "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=150&h=100&fit=crop",
    category: "Tractor Accessories",
    stock: 20,
    description:
      "Versatile tractor attachments for everyday farming operations.",
  },
];

/* ==============================
   ENQUIRY DATA
================================ */

const enquiries = [
  {
    id: 1,
    name: "Amit Pradhan",
    product: "Rotavator (6 ft)",
    date: "Nov 04, 2026",
    phone: "+91 98765 43210",
    email: "amit@example.com",
    status: "New",
    location: "Bhubaneswar, Odisha",
  },
  {
    id: 2,
    name: "Rakesh Das",
    product: "Disc Harrow",
    date: "Nov 04, 2026",
    phone: "+91 98765 12345",
    email: "rakesh@example.com",
    status: "Contacted",
    location: "Cuttack, Odisha",
  },
  {
    id: 3,
    name: "Suman Behera",
    product: "Tractor Attachments",
    date: "Nov 03, 2026",
    phone: "+91 98765 67890",
    email: "suman@example.com",
    status: "New",
    location: "Puri, Odisha",
  },
  {
    id: 4,
    name: "Jyoti Sahoo",
    product: "Seed Drill",
    date: "Nov 03, 2026",
    phone: "+91 98765 45678",
    email: "jyoti@example.com",
    status: "Pending",
    location: "Kendrapara, Odisha",
  },
  {
    id: 5,
    name: "Rahul Mohanty",
    product: "Cultivator",
    date: "Nov 02, 2026",
    phone: "+91 98765 11223",
    email: "rahul@example.com",
    status: "Contacted",
    location: "Jajpur, Odisha",
  },
  {
    id: 6,
    name: "Priya Das",
    product: "Power Tiller",
    date: "Nov 02, 2026",
    phone: "+91 98765 33445",
    email: "priya@example.com",
    status: "New",
    location: "Balasore, Odisha",
  },
  {
    id: 7,
    name: "Manoj Kumar",
    product: "Rotavator (6 ft)",
    date: "Nov 01, 2026",
    phone: "+91 98765 77889",
    email: "manoj@example.com",
    status: "Pending",
    location: "Angul, Odisha",
  },
];

const TOTAL_ENQUIRIES = 129;

const sourceData = [
  { name: "Website Form", value: 52, color: "#22a447" },
  { name: "Product Page", value: 28, color: "#2f7fd6" },
  { name: "Contact Page", value: 12, color: "#f0a41c" },
  { name: "Others", value: 8, color: "#9560d8" },
];

const maxEnquiries = Math.max(...products.map((product) => product.enquiries));

/* ==============================
   HELPERS
================================ */

const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);

const statusClass = (status) => String(status).toLowerCase();

const sourceCount = (source) =>
  Math.round((TOTAL_ENQUIRIES * source.value) / 100);

/* ==============================
   CUSTOM CHART TOOLTIP
================================ */

const SourceTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload;

    return (
      <div className="Dashboard-Second--tooltip">
        <span
          className="Dashboard-Second--tooltip-dot"
          style={{ background: item.color }}
        />
        <span>{item.name}</span>
        <strong>{item.value}%</strong>
      </div>
    );
  }

  return null;
};

/* ==============================
   SMALL REUSABLE PIECES
================================ */

const StatusBadge = ({ status }) => (
  <span
    className={`Dashboard-Second--badge Dashboard-Second--badge-${statusClass(
      status
    )}`}
  >
    <span className="Dashboard-Second--badge-dot" />
    {status}
  </span>
);

const ProductThumb = ({ src, alt, className }) => (
  <div className={className}>
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={(e) => {
        e.currentTarget.style.display = "none";
      }}
    />
    <Tractor />
  </div>
);

/* ==============================
   MAIN COMPONENT
================================ */

const DashbordSecond = () => {
  const [modalType, setModalType] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedSource, setSelectedSource] = useState(null);

  /* ---------- modal: Esc key + body scroll lock ---------- */

  useEffect(() => {
    if (!modalType) return undefined;

    const onKey = (e) => {
      if (e.key === "Escape") {
        setModalType(null);
        setSelectedItem(null);
        setSearch("");
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [modalType]);

  /* ---------- derived ---------- */

  const filteredProducts = useMemo(() => {
    const text = search.trim().toLowerCase();
    return products.filter((product) =>
      product.name.toLowerCase().includes(text)
    );
  }, [search]);

  const filteredEnquiries = useMemo(() => {
    const text = search.trim().toLowerCase();
    return enquiries.filter(
      (item) =>
        item.name.toLowerCase().includes(text) ||
        item.product.toLowerCase().includes(text)
    );
  }, [search]);

  /* ---------- handlers ---------- */

  const openAll = (type) => {
    setSearch("");
    setSelectedItem(null);
    setModalType(type);
  };

  const openDetails = (type, item) => {
    setSelectedItem(item);
    setModalType(type);
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedItem(null);
    setSearch("");
  };

  const handleSourceClick = (entry) => {
    setSelectedSource((previous) =>
      previous === entry.name ? null : entry.name
    );
  };

  const displayedProducts = products.slice(0, 4);
  const displayedEnquiries = enquiries.slice(0, 5);

  const currentSource = sourceData.find((item) => item.name === selectedSource);

  return (
    <section className="Dashboard-Second--wrapper">
      <div className="Dashboard-Second--container">
        <div className="Dashboard-Second--grid">
          {/* =========================
              TOP PRODUCTS
          ========================== */}

          <div className="Dashboard-Second--card Dashboard-Second--products">
            <div className="Dashboard-Second--card-header">
              <div className="Dashboard-Second--heading">
                <div className="Dashboard-Second--heading-icon">
                  <Package size={20} strokeWidth={2.3} />
                </div>

                <div>
                  <h3>Top Products</h3>
                  <p>Most enquired equipment</p>
                </div>
              </div>

              <button
                type="button"
                className="Dashboard-Second--view-all"
                onClick={() => openAll("products")}
              >
                View All
                <ArrowRight size={15} />
              </button>
            </div>

            <div className="Dashboard-Second--product-list">
              {displayedProducts.map((product, index) => (
                <button
                  type="button"
                  className="Dashboard-Second--product-row"
                  key={product.id}
                  onClick={() => openDetails("product-detail", product)}
                  title={`View ${product.name} details`}
                >
                  <span
                    className={`Dashboard-Second--rank rank-${index + 1}`}
                  >
                    {index + 1}
                  </span>

                  <ProductThumb
                    src={product.image}
                    alt={product.name}
                    className="Dashboard-Second--product-image"
                  />

                  <div className="Dashboard-Second--product-info">
                    <strong>{product.name}</strong>

                    <div className="Dashboard-Second--meter">
                      <span
                        style={{
                          width: `${(product.enquiries / maxEnquiries) * 100}%`,
                        }}
                      />
                    </div>

                    <span>{product.enquiries} Enquiries</span>
                  </div>

                  <div className="Dashboard-Second--product-price">
                    {formatPrice(product.price)}
                  </div>
                </button>
              ))}
            </div>

            <div className="Dashboard-Second--card-footer">
              <span>
                <TrendingUp size={15} />
                Most enquired products
              </span>
              <span className="Dashboard-Second--pill">Top 4</span>
            </div>
          </div>

          {/* =========================
              ENQUIRIES BY SOURCE
          ========================== */}

          <div className="Dashboard-Second--card Dashboard-Second--sources">
            <div className="Dashboard-Second--card-header">
              <div className="Dashboard-Second--heading">
                <div className="Dashboard-Second--heading-icon">
                  <TrendingUp size={20} strokeWidth={2.3} />
                </div>

                <div>
                  <h3>Enquiries by Source</h3>
                  <p>Where customers find you</p>
                </div>
              </div>

              <span className="Dashboard-Second--source-period">
                All Sources
              </span>
            </div>

            <div className="Dashboard-Second--source-content">
              <div className="Dashboard-Second--donut-wrap">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sourceData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius="62%"
                      outerRadius="92%"
                      paddingAngle={2}
                      stroke="#ffffff"
                      strokeWidth={3}
                      startAngle={90}
                      endAngle={-270}
                      onClick={(data) => handleSourceClick(data)}
                      animationDuration={850}
                    >
                      {sourceData.map((entry) => (
                        <Cell
                          key={entry.name}
                          fill={entry.color}
                          opacity={
                            selectedSource && selectedSource !== entry.name
                              ? 0.3
                              : 1
                          }
                          style={{ cursor: "pointer", outline: "none" }}
                        />
                      ))}
                    </Pie>

                    <Tooltip content={<SourceTooltip />} />
                  </PieChart>
                </ResponsiveContainer>

                <div className="Dashboard-Second--donut-center">
                  <strong>
                    {currentSource
                      ? sourceCount(currentSource)
                      : TOTAL_ENQUIRIES}
                  </strong>
                  <span>{currentSource ? currentSource.name : "Total"}</span>
                </div>
              </div>

              <div className="Dashboard-Second--legend">
                {sourceData.map((source) => (
                  <button
                    type="button"
                    key={source.name}
                    className={`Dashboard-Second--legend-item ${
                      selectedSource === source.name ? "selected" : ""
                    }`}
                    onClick={() => handleSourceClick(source)}
                  >
                    <span
                      className="Dashboard-Second--legend-dot"
                      style={{ background: source.color }}
                    />

                    <span className="Dashboard-Second--legend-name">
                      {source.name}
                    </span>

                    <strong>{source.value}%</strong>
                  </button>
                ))}
              </div>
            </div>

            <div className="Dashboard-Second--source-insight">
              {currentSource ? (
                <>
                  <span
                    className="Dashboard-Second--insight-dot"
                    style={{ background: currentSource.color }}
                  />
                  <span>
                    {currentSource.name}:{" "}
                    <strong>{sourceCount(currentSource)} enquiries</strong>
                  </span>
                  <button type="button" onClick={() => setSelectedSource(null)}>
                    Clear
                  </button>
                </>
              ) : (
                <>
                  <span className="Dashboard-Second--insight-dot" />
                  Click a source to explore its share
                </>
              )}
            </div>
          </div>

          {/* =========================
              RECENT ENQUIRIES
          ========================== */}

          <div className="Dashboard-Second--card Dashboard-Second--recent">
            <div className="Dashboard-Second--card-header">
              <div className="Dashboard-Second--heading">
                <div className="Dashboard-Second--heading-icon">
                  <Users size={20} strokeWidth={2.3} />
                </div>

                <div>
                  <h3>Recent Enquiries</h3>
                  <p>Latest customer requests</p>
                </div>
              </div>

              <button
                type="button"
                className="Dashboard-Second--view-all"
                onClick={() => openAll("enquiries")}
              >
                View All
                <ArrowRight size={15} />
              </button>
            </div>

            <div className="Dashboard-Second--table-wrap">
              <table className="Dashboard-Second--table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Product / Interest</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {displayedEnquiries.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => openDetails("enquiry-detail", item)}
                      title={`View ${item.name}'s enquiry`}
                    >
                      <td>
                        <div className="Dashboard-Second--customer">
                          <span className="Dashboard-Second--avatar">
                            {item.name.charAt(0)}
                          </span>

                          <div>
                            <strong>{item.name}</strong>
                            <span>{item.date}</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="Dashboard-Second--interest">
                          {item.product}
                        </span>
                      </td>

                      <td>
                        <StatusBadge status={item.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="Dashboard-Second--recent-footer">
              <span>Latest customer enquiries</span>
              <span className="Dashboard-Second--pill">
                {enquiries.length} records
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ==============================
          FUNCTIONAL MODAL
      ================================= */}

      {modalType && (
        <div className="Dashboard-Second--modal-overlay" onClick={closeModal}>
          <div
            className="Dashboard-Second--modal"
            role="dialog"
            aria-modal="true"
            aria-label="Dashboard details"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="Dashboard-Second--modal-header">
              <div>
                <span className="Dashboard-Second--modal-eyebrow">
                  RHINO'S EQUIPMENT / DASHBOARD
                </span>

                <h2>
                  {modalType === "products" && "All Products"}
                  {modalType === "enquiries" && "All Recent Enquiries"}
                  {modalType === "product-detail" && "Product Details"}
                  {modalType === "enquiry-detail" && "Enquiry Details"}
                </h2>
              </div>

              <button
                type="button"
                className="Dashboard-Second--modal-close"
                onClick={closeModal}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            {/* PRODUCT LIST MODAL */}

            {modalType === "products" && (
              <>
                <div className="Dashboard-Second--modal-search">
                  <Search size={18} />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    autoFocus
                  />
                </div>

                <div className="Dashboard-Second--modal-list">
                  {filteredProducts.map((product) => (
                    <button
                      type="button"
                      key={product.id}
                      className="Dashboard-Second--modal-product"
                      onClick={() => openDetails("product-detail", product)}
                    >
                      <ProductThumb
                        src={product.image}
                        alt={product.name}
                        className="Dashboard-Second--modal-product-image"
                      />

                      <div className="Dashboard-Second--modal-item-info">
                        <strong>{product.name}</strong>
                        <span>{product.enquiries} Enquiries</span>
                      </div>

                      <strong className="Dashboard-Second--modal-price">
                        {formatPrice(product.price)}
                      </strong>

                      <ChevronRight size={18} />
                    </button>
                  ))}

                  {filteredProducts.length === 0 && (
                    <p className="Dashboard-Second--empty">
                      No matching products found.
                    </p>
                  )}
                </div>
              </>
            )}

            {/* ENQUIRY LIST MODAL */}

            {modalType === "enquiries" && (
              <>
                <div className="Dashboard-Second--modal-search">
                  <Search size={18} />
                  <input
                    type="text"
                    placeholder="Search name or product..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    autoFocus
                  />
                </div>

                <div className="Dashboard-Second--modal-list">
                  {filteredEnquiries.map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      className="Dashboard-Second--modal-enquiry"
                      onClick={() => openDetails("enquiry-detail", item)}
                    >
                      <span className="Dashboard-Second--avatar large">
                        {item.name.charAt(0)}
                      </span>

                      <div className="Dashboard-Second--modal-item-info">
                        <strong>{item.name}</strong>
                        <span>{item.product}</span>
                      </div>

                      <div className="Dashboard-Second--modal-enquiry-side">
                        <StatusBadge status={item.status} />
                        <span>{item.date}</span>
                      </div>

                      <ChevronRight size={18} />
                    </button>
                  ))}

                  {filteredEnquiries.length === 0 && (
                    <p className="Dashboard-Second--empty">
                      No matching enquiries found.
                    </p>
                  )}
                </div>
              </>
            )}

            {/* PRODUCT DETAILS */}

            {modalType === "product-detail" && selectedItem && (
              <div className="Dashboard-Second--detail-content">
                <ProductThumb
                  src={selectedItem.image}
                  alt={selectedItem.name}
                  className="Dashboard-Second--detail-image"
                />

                <div className="Dashboard-Second--detail-title">
                  <span className="Dashboard-Second--category">
                    <Tag size={13} />
                    {selectedItem.category}
                  </span>
                  <h3>{selectedItem.name}</h3>
                  <strong>{formatPrice(selectedItem.price)}</strong>
                </div>

                <p>{selectedItem.description}</p>

                <div className="Dashboard-Second--detail-stats">
                  <div>
                    <span>Total Enquiries</span>
                    <strong>{selectedItem.enquiries}</strong>
                  </div>

                  <div>
                    <span>Available Stock</span>
                    <strong>{selectedItem.stock} Units</strong>
                  </div>
                </div>
              </div>
            )}

            {/* ENQUIRY DETAILS */}

            {modalType === "enquiry-detail" && selectedItem && (
              <div className="Dashboard-Second--detail-content">
                <div className="Dashboard-Second--customer-detail">
                  <span className="Dashboard-Second--avatar detail-avatar">
                    {selectedItem.name.charAt(0)}
                  </span>

                  <div>
                    <h3>{selectedItem.name}</h3>
                    <StatusBadge status={selectedItem.status} />
                  </div>
                </div>

                <div className="Dashboard-Second--detail-fields">
                  <div>
                    <span>
                      <Package size={14} />
                      Product Interest
                    </span>
                    <strong>{selectedItem.product}</strong>
                  </div>

                  <div>
                    <span>
                      <CalendarDays size={14} />
                      Enquiry Date
                    </span>
                    <strong>{selectedItem.date}</strong>
                  </div>

                  <div>
                    <span>
                      <Phone size={14} />
                      Phone Number
                    </span>
                    <strong>{selectedItem.phone}</strong>
                  </div>

                  <div>
                    <span>
                      <Mail size={14} />
                      Email Address
                    </span>
                    <strong>{selectedItem.email}</strong>
                  </div>

                  <div className="wide">
                    <span>
                      <MapPin size={14} />
                      Location
                    </span>
                    <strong>{selectedItem.location}</strong>
                  </div>
                </div>

                <div className="Dashboard-Second--contact-row">
                  <a
                    className="Dashboard-Second--contact-button"
                    href={`tel:${selectedItem.phone.replace(/\s/g, "")}`}
                  >
                    <Phone size={17} />
                    Call Customer
                  </a>

                  <a
                    className="Dashboard-Second--contact-button secondary"
                    href={`mailto:${selectedItem.email}`}
                  >
                    <Mail size={17} />
                    Send Email
                  </a>
                </div>
              </div>
            )}

            <div className="Dashboard-Second--modal-footer">
              <span>
                <Eye size={16} />
                Dashboard information
              </span>

              <button type="button" onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default DashbordSecond;