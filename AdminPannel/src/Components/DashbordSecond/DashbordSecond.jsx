
import React, { useMemo, useState } from "react";
import {
  Package,
  ArrowRight,
  TrendingUp,
  Users,
  X,
  Search,
  ExternalLink,
  CalendarDays,
  IndianRupee,
  Eye,
  Tractor,
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

const sourceData = [
  { name: "Website Form", value: 52, color: "#20a735" },
  { name: "Product Page", value: 28, color: "#2695f5" },
  { name: "Contact Page", value: 12, color: "#f5a623" },
  { name: "Others", value: 8, color: "#9560d8" },
];

/* ==============================
   FORMAT CURRENCY
================================ */

const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);

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
   MAIN COMPONENT
================================ */

const DashbordSecond = () => {
  const [modalType, setModalType] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedSource, setSelectedSource] = useState(null);

  const filteredProducts = useMemo(() => {
    return products.filter((product) =>
      product.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const filteredEnquiries = useMemo(() => {
    return enquiries.filter(
      (item) =>
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.product.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

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
  const displayedEnquiries = enquiries.slice(0, 4);

  const currentSource = sourceData.find(
    (item) => item.name === selectedSource
  );

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
                <div className="Dashboard-Second--heading-icon green">
                  <Package size={19} strokeWidth={2.5} />
                </div>

                <h3>Top Products</h3>
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

              {displayedProducts.map((product) => (
                <button
                  type="button"
                  className="Dashboard-Second--product-row"
                  key={product.id}
                  onClick={() => openDetails("product-detail", product)}
                  title={`View ${product.name} details`}
                >

                  <div className="Dashboard-Second--product-image">
                    <img
                      src={product.image}
                      alt={product.name}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                    <Tractor size={23} />
                  </div>

                  <div className="Dashboard-Second--product-info">
                    <strong>{product.name}</strong>
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
                <TrendingUp size={14} />
                Most enquired products
              </span>
              <span>Top 4</span>
            </div>

          </div>

          {/* =========================
              ENQUIRIES BY SOURCE
          ========================== */}

          <div className="Dashboard-Second--card Dashboard-Second--sources">

            <div className="Dashboard-Second--card-header">

              <div className="Dashboard-Second--heading">
                <div className="Dashboard-Second--heading-icon green">
                  <TrendingUp size={19} strokeWidth={2.5} />
                </div>

                <h3>Enquiries by Source</h3>
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
                      innerRadius="59%"
                      outerRadius="88%"
                      paddingAngle={1}
                      stroke="#ffffff"
                      strokeWidth={2}
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
                              ? 0.35
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
                  <strong>129</strong>
                  <span>Total</span>
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
                    <strong>
                      {Math.round(129 * currentSource.value / 100)} enquiries
                    </strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedSource(null)}
                  >
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
                <div className="Dashboard-Second--heading-icon green">
                  <Users size={19} strokeWidth={2.5} />
                </div>

                <h3>Recent Enquiries</h3>
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
                    <th>Name</th>
                    <th>Product / Interest</th>
                    <th>Date</th>
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
                          <strong>{item.name}</strong>
                        </div>
                      </td>

                      <td>
                        <span className="Dashboard-Second--interest">
                          {item.product}
                        </span>
                      </td>

                      <td>
                        <span className="Dashboard-Second--date">
                          {item.date}
                        </span>
                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>

            </div>

            <div className="Dashboard-Second--recent-footer">
              <span>Latest customer enquiries</span>
              <span>{enquiries.length} records</span>
            </div>

          </div>

        </div>

      </div>

      {/* ==============================
          FUNCTIONAL MODAL
      ================================= */}

      {modalType && (
        <div
          className="Dashboard-Second--modal-overlay"
          onClick={closeModal}
        >
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
                  DASHBOARD MANAGEMENT
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
                      onClick={() =>
                        openDetails("product-detail", product)
                      }
                    >
                      <div className="Dashboard-Second--modal-product-image">
                        <img
                          src={product.image}
                          alt={product.name}
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                        <Tractor size={22} />
                      </div>

                      <div className="Dashboard-Second--modal-item-info">
                        <strong>{product.name}</strong>
                        <span>{product.enquiries} Enquiries</span>
                      </div>

                      <strong className="Dashboard-Second--modal-price">
                        {formatPrice(product.price)}
                      </strong>

                      <ExternalLink size={16} />
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
                      onClick={() =>
                        openDetails("enquiry-detail", item)
                      }
                    >
                      <span className="Dashboard-Second--avatar large">
                        {item.name.charAt(0)}
                      </span>

                      <div className="Dashboard-Second--modal-item-info">
                        <strong>{item.name}</strong>
                        <span>{item.product}</span>
                      </div>

                      <div className="Dashboard-Second--modal-enquiry-date">
                        {item.date}
                      </div>

                      <ExternalLink size={16} />
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

                <div className="Dashboard-Second--detail-image">
                  <img
                    src={selectedItem.image}
                    alt={selectedItem.name}
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                  <Tractor size={38} />
                </div>

                <div className="Dashboard-Second--detail-title">
                  <span>{selectedItem.category}</span>
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
                    <span>Customer enquiry</span>
                  </div>
                </div>

                <div className="Dashboard-Second--detail-fields">

                  <div>
                    <span>Product Interest</span>
                    <strong>{selectedItem.product}</strong>
                  </div>

                  <div>
                    <span>Enquiry Date</span>
                    <strong>{selectedItem.date}</strong>
                  </div>

                  <div>
                    <span>Phone Number</span>
                    <strong>{selectedItem.phone}</strong>
                  </div>

                  <div>
                    <span>Email Address</span>
                    <strong>{selectedItem.email}</strong>
                  </div>

                  <div>
                    <span>Location</span>
                    <strong>{selectedItem.location}</strong>
                  </div>

                  <div>
                    <span>Enquiry Status</span>
                    <strong className="Dashboard-Second--status">
                      {selectedItem.status}
                    </strong>
                  </div>

                </div>

                <a
                  className="Dashboard-Second--contact-button"
                  href={`tel:${selectedItem.phone.replace(/\s/g, "")}`}
                >
                  <Users size={17} />
                  Contact Customer
                </a>

              </div>
            )}

            <div className="Dashboard-Second--modal-footer">
              <span>
                <Eye size={15} />
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
