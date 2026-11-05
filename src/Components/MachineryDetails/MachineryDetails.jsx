
import React, { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./MachineryDetails.css";
import walsonImage from "../../assets/machine.jpg";

const farmerCategories = [
  { id: 1, name: "Male (General/OBC)", amount: "₹31,250" },
  { id: 2, name: "Male (SC/ST)", amount: "₹37,500" },
  { id: 3, name: "Female (General/OBC)", amount: "₹37,500" },
  { id: 4, name: "Female (SC/ST)", amount: "₹37,500" },
];

const tabs = [
  { id: "specifications", label: "Specifications", icon: "settings" },
  { id: "products", label: "Products with", icon: "layers" },
  { id: "documents", label: "Required Documents", icon: "document" },
];

const tabContent = {
  specifications: (
    <div className="MachineryDetails-tab-message">
      <h3>Product Specifications</h3>
      <p>
        Standard specifications available via authorized dealer catalogue.
      </p>
    </div>
  ),
  products: (
    <div className="MachineryDetails-tab-content">
      <h3>Products available with this machinery</h3>
      <div className="MachineryDetails-feature-grid">
        <div className="MachineryDetails-feature-item">
          <span>01</span>
          <h4>Rice Milling Unit</h4>
          <p>Rice processing and milling equipment.</p>
        </div>
        <div className="MachineryDetails-feature-item">
          <span>02</span>
          <h4>Grain Cleaning System</h4>
          <p>For cleaning and separating agricultural grains.</p>
        </div>
        <div className="MachineryDetails-feature-item">
          <span>03</span>
          <h4>Husk Separation</h4>
          <p>Equipment for separating husk during processing.</p>
        </div>
      </div>
    </div>
  ),
  documents: (
    <div className="MachineryDetails-tab-content">
      <h3>Documents Required for Subsidy</h3>
      <div className="MachineryDetails-document-list">
        {[
          "Aadhaar Card",
          "Bank Passbook",
          "Land Record / RoR",
          "Passport Size Photograph",
          "Caste Certificate (if applicable)",
          "Farmer Registration Details",
        ].map((document, index) => (
          <div className="MachineryDetails-document-item" key={index}>
            <span className="MachineryDetails-document-check">✓</span>
            {document}
          </div>
        ))}
      </div>
    </div>
  ),
};

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
  const categoryRef = useRef(null);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [activeTab, setActiveTab] = useState("specifications");

  const scrollCategories = () => {
    if (categoryRef.current) {
      categoryRef.current.scrollBy({
        left: 170,
        behavior: "smooth",
      });
    }
  };

  const handleApply = () => {
    if (!selectedCategory) return;

    const category = farmerCategories.find(
      (item) => item.id === selectedCategory
    );

    navigate(
      `/apply?product=walson-1rk190&category=${encodeURIComponent(
        category.name
      )}`
    );
  };

  return (
    <section className="MachineryDetails">
      <div className="MachineryDetails-container">
        {/* Breadcrumb */}

        <nav className="MachineryDetails-breadcrumb">
          <Link to="/">Home</Link>
          <span className="MachineryDetails-breadcrumb-arrow">›</span>
          <Link to="/products">Catalogue</Link>
          <span className="MachineryDetails-breadcrumb-arrow">›</span>
          <Link to="/products?category=rice-mill">Rice Mill</Link>
          <span className="MachineryDetails-breadcrumb-arrow">›</span>
          <span className="MachineryDetails-breadcrumb-current">
            Walson - 1RK190
          </span>
        </nav>

        {/* Main product section */}

        <div className="MachineryDetails-main">
          {/* Product image */}

          <div className="MachineryDetails-image-card">
            <div className="MachineryDetails-image-background">
              <img
                src={walsonImage}
                alt="Walson 1RK190 Rice Mill Machine"
                className="MachineryDetails-product-image"
              />
            </div>
          </div>

          {/* Product information */}

          <div className="MachineryDetails-info-card">
            <div className="MachineryDetails-brand">WALSON</div>

            <h1 className="MachineryDetails-product-title">
              Walson - 1RK190
            </h1>

            <div className="MachineryDetails-price">₹94,500</div>

            {/* Category selection */}

            <div className="MachineryDetails-category-section">
              <label className="MachineryDetails-category-label">
                Select category:
              </label>

              <div className="MachineryDetails-category-wrapper">
                <div
                  className="MachineryDetails-category-list"
                  ref={categoryRef}
                >
                  {farmerCategories.map((category) => (
                    <button
                      type="button"
                      key={category.id}
                      className={`MachineryDetails-category-card ${
                        selectedCategory === category.id
                          ? "MachineryDetails-category-active"
                          : ""
                      }`}
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      <span className="MachineryDetails-category-name">
                        {category.name}
                      </span>

                      <strong className="MachineryDetails-category-amount">
                        {category.amount}
                      </strong>
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

            {/* Apply button */}

            <button
              type="button"
              className={`MachineryDetails-apply-button ${
                selectedCategory
                  ? "MachineryDetails-apply-enabled"
                  : ""
              }`}
              disabled={!selectedCategory}
              onClick={handleApply}
            >
              Apply Now
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 12h14m-6-6 6 6-6 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <div className="MachineryDetails-apply-hint">
              {selectedCategory
                ? `Selected: ${
                    farmerCategories.find(
                      (item) => item.id === selectedCategory
                    ).name
                  }`
                : "Select your farmer category above to continue"}
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
                We route your application directly to an authorised machinery
                dealer in your district for subsidy paperwork and delivery.
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
            {tabContent[activeTab]}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MachineryDetails;
