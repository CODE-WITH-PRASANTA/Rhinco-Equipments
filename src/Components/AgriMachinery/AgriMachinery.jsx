
import React from "react";
import { Link } from "react-router-dom";
import "./AgriMachinery.css";

const commonsImage = (filename) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(
    filename
  )}?width=700`;

const fallbackImage = commonsImage("Agriculture Machinery Harvester.jpg");

const machineryProducts = [
  {
    id: "honda-f300",
    brand: "HONDA",
    name: "F300",
    price: "₹54,000",
    subsidy: "₹10,500",
    image: commonsImage(
      "Agricultural tiller at Feeringbury Manor, Feering Essex England 2.jpg"
    ),
  },
  {
    id: "walson-1rk190",
    brand: "WALSON",
    name: "Walson - 1RK190",
    price: "₹94,500",
    subsidy: "₹46,875",
    image: commonsImage("Saatgut-Reinigungsanlage 3786.JPG"),
  },
  {
    id: "rico-ri2000",
    brand: "RICO ITALY",
    name: "Rico Italy - RI 2000",
    price: "₹1,52,500",
    subsidy: "₹87,600",
    image: commonsImage("A Twenty-Four Horse Power Harvester (NBY 9002).jpg"),
  },
  {
    id: "indoxen-105p",
    brand: "INDOXEN",
    name: "Indoxen 105P",
    price: "₹61,000",
    subsidy: "₹23,250",
    image: commonsImage("Agricultural Equipment (1).jpg"),
  },
  {
    id: "vst-234md",
    brand: "VST",
    name: "234MD",
    price: "₹30,000",
    subsidy: "₹5,850",
    image: commonsImage("Aerosolni generator 33.jpg"),
  },
  {
    id: "riddish-mt-kishan",
    brand: "Riddish",
    name: "Riddish - MT KISHAN 001",
    price: "₹48,000",
    subsidy: "₹23,250",
    image: commonsImage("Chaff cutter machine at work.jpg"),
  },
  {
    id: "kamco-kmb200",
    brand: "KAMCO",
    name: "KMB 200",
    price: "₹2,14,800",
    subsidy: "₹1,27,500",
    image: commonsImage("Mc Cormick-by-RaBoe-07.jpg"),
  },
  {
    id: "agrineer-an205p",
    brand: "Agrineer",
    name: "AN 205P 9HP",
    price: "₹58,100",
    subsidy: "₹23,250",
    image: commonsImage("Agricultural Equipment (2).jpg"),
  },
];

const SubsidyIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M12 2.8 15 4.4l3.4.2.2 3.4 1.6 3-1.6 3-.2 3.4-3.4.2-3 1.6-3-1.6-3.4-.2-.2-3.4-1.6-3 1.6-3 .2-3.4 3.4-.2 3-1.6Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinejoin="round"
    />
    <path
      d="m9 12 2 2 4-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M5 12h14m-6-6 6 6-6 6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M6.6 3.8h3l1.5 4-2 1.7a15.4 15.4 0 0 0 5.4 5.4l1.7-2 4 1.5v3c0 1.1-.9 2-2 2A15.5 15.5 0 0 1 4.6 5.8c0-1.1.9-2 2-2Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M14 4.5a5.5 5.5 0 0 1 5.5 5.5M14 7.5a2.5 2.5 0 0 1 2.5 2.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
);

const AgriMachinery = () => {
  const handleImageError = (event) => {
    const image = event.currentTarget;

    if (image.dataset.fallbackApplied) return;

    image.dataset.fallbackApplied = "true";
    image.src = fallbackImage;
  };

  return (
    <section className="AgriMachinery">
      <div className="AgriMachinery-container">
        <div className="AgriMachinery-heading">
          <div className="AgriMachinery-heading-left">
            <span className="AgriMachinery-heading-line" />
            <h2>Agri Machinery</h2>
          </div>

          <Link to="/machine-catalogue" className="AgriMachinery-view-all">
            View All (67)
            <ArrowIcon />
          </Link>
        </div>

        <div className="AgriMachinery-grid">
          {machineryProducts.map((product, index) => (
            <Link
              to={`/product/${product.id}`}
              className={`AgriMachinery-card ${
                index === 1 || index === 5 ? "AgriMachinery-card-featured" : ""
              }`}
              key={product.id}
            >
              <div className="AgriMachinery-image-area">
                <div className="AgriMachinery-brand-logo">
                  {product.brand}
                </div>

                <span className="AgriMachinery-subsidy-badge">
                  <SubsidyIcon />
                  Subsidy
                </span>

                <img
                  src={product.image}
                  alt={`${product.brand} ${product.name}`}
                  className="AgriMachinery-product-image"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onError={handleImageError}
                />
              </div>

              <div className="AgriMachinery-card-content">
                <div className="AgriMachinery-product-info">
                  <span className="AgriMachinery-brand-name">
                    {product.brand}
                  </span>
                  <h3>{product.name}</h3>
                </div>

                <div className="AgriMachinery-card-divider" />

                <div className="AgriMachinery-price-area">
                  <div className="AgriMachinery-price-details">
                    <span className="AgriMachinery-price-label">
                      BASE PRICE
                    </span>

                    <strong className="AgriMachinery-price">
                      {product.price}
                    </strong>

                    <span className="AgriMachinery-subsidy-text">
                      <SubsidyIcon />
                      Subsidy upto {product.subsidy}
                    </span>
                  </div>

                  <span className="AgriMachinery-arrow-button">
                    <ArrowIcon />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="AgriMachinery-support">
          <div className="AgriMachinery-support-left">
            <div className="AgriMachinery-support-icon">
              <PhoneIcon />
            </div>

            <div className="AgriMachinery-support-text">
              <h3>We're here to help</h3>
              <p>Everyday 10:00am – 6:00pm</p>
            </div>
          </div>

          <a
            href="tel:+919776779711"
            className="AgriMachinery-support-button"
          >
            <PhoneIcon />
            <span>+91 9776779711</span>
          </a>
        </div>
      </div>
    </section>
  );
};

export default AgriMachinery;
