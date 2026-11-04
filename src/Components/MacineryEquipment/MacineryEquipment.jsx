import React, { useState } from "react";
import Roater from '../../assets/Roater.png';
import "./MacineryEquipment.css";

const MacineryEquipment = () => {
  const [activeImage, setActiveImage] = useState(0);
  const [showContact, setShowContact] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const product = {
    title: "Fieldking Gold Rotary Tiller",
    brand: "Fieldking",
    model: "Gold Rotary Tiller",
    implementType: "Rotavator",
    category: "Tillage",
    power: "40-70 HP",
    price: "₹ 1.15 - 1.55 Lakh*",
  };

  // Replace these image URLs with your actual product images.
  const images = [
    "https://fieldking.com/wp-content/uploads/2023/08/Gold-Rotary-Tiller.png",
  ];

  const handleShare = async () => {
    const shareData = {
      title: product.title,
      text: "Check out this Fieldking Gold Rotary Tiller.",
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        if (error.name !== "AbortError") {
          setShowShare(true);
        }
      }
    } else {
      setShowShare(true);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert("Product link copied successfully!");
      setShowShare(false);
    } catch {
      alert("Unable to copy the link. Please copy it from your browser.");
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <section className="machinery-equipment">
      <div className="machinery-container">

        {/* Product Title */}
        <h1 className="machinery-title">
          {product.title}
        </h1>

        {/* Product Layout */}
        <div className="machinery-product-grid">

          {/* LEFT: Product Images */}
          <div className="machinery-gallery">

            {/* Main Image */}
            <div className="machinery-main-image">

              <div className="machinery-image-background">
                <img
                  src={Roater}
                  alt={product.title}
                  className="machinery-product-image"
                />
              </div>

              {/* Share Button */}
              <button
                type="button"
                className="machinery-share-button"
                onClick={handleShare}
                aria-label="Share product"
                title="Share product"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="22"
                  height="22"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <path d="m8.7 10.7 6.6-4.4M8.7 13.3l6.6 4.4" />
                </svg>
              </button>
            </div>

            {/* Thumbnail Section */}
            <div className="machinery-thumbnail-container">

              {images.map((image, index) => (
                <button
                  key={index}
                  type="button"
                  className={`machinery-thumbnail ${
                    activeImage === index ? "active" : ""
                  }`}
                  onClick={() => setActiveImage(index)}
                  aria-label={`View product image ${index + 1}`}
                >
                  <img
                    src={Roater}
                    alt={`${product.title} thumbnail`}
                  />
                </button>
              ))}

            </div>
          </div>

          {/* RIGHT: Product Details */}
          <div className="machinery-details">

            <div className="machinery-info-table">

              <div className="machinery-info-row">
                <div className="machinery-info-label">
                  Brand
                </div>
                <div className="machinery-info-value">
                  <a href="https://fieldking.com/">
                    {product.brand}
                  </a>
                </div>
              </div>

              <div className="machinery-info-row">
                <div className="machinery-info-label">
                  Model Name
                </div>
                <div className="machinery-info-value">
                  {product.model}
                </div>
              </div>

              <div className="machinery-info-row">
                <div className="machinery-info-label">
                  Implement Type
                </div>
                <div className="machinery-info-value">
                  <a href="#implement-type">
                    {product.implementType}
                  </a>
                </div>
              </div>

              <div className="machinery-info-row">
                <div className="machinery-info-label">
                  Category
                </div>
                <div className="machinery-info-value">
                  <a href="#category">
                    {product.category}
                  </a>
                </div>
              </div>

              <div className="machinery-info-row">
                <div className="machinery-info-label">
                  Implement Power
                </div>
                <div className="machinery-info-value">
                  {product.power}
                </div>
              </div>

              <div className="machinery-info-row">
                <div className="machinery-info-label">
                  Price
                </div>
                <div className="machinery-info-value">
                  {product.price}
                </div>
              </div>

            </div>

            {/* Dealer Button */}
            <button
              type="button"
              className="machinery-dealer-button"
              onClick={() => {
                setShowContact(true);
                setSubmitted(false);
              }}
            >
              Contact Dealer
            </button>

          </div>
        </div>
      </div>

      {/* Share Popup */}
      {showShare && (
        <div
          className="machinery-modal-overlay"
          onClick={() => setShowShare(false)}
        >
          <div
            className="machinery-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="machinery-modal-close"
              onClick={() => setShowShare(false)}
              aria-label="Close"
            >
              ×
            </button>

            <h2>Share Product</h2>

            <p>{product.title}</p>

            <button
              type="button"
              className="machinery-dealer-button"
              onClick={handleCopy}
            >
              Copy Product Link
            </button>
          </div>
        </div>
      )}

      {/* Contact Dealer Popup */}
      {showContact && (
        <div
          className="machinery-modal-overlay"
          onClick={() => setShowContact(false)}
        >
          <div
            className="machinery-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="machinery-modal-close"
              onClick={() => setShowContact(false)}
              aria-label="Close"
            >
              ×
            </button>

            {!submitted ? (
              <>
                <h2>Contact Dealer</h2>

                <p className="machinery-modal-product">
                  {product.title}
                </p>

                <form
                  className="machinery-contact-form"
                  onSubmit={handleSubmit}
                >
                  <input
                    type="text"
                    name="name"
                    placeholder="Your Name"
                    required
                  />

                  <input
                    type="tel"
                    name="phone"
                    placeholder="Mobile Number"
                    pattern="[0-9]{10}"
                    title="Enter a valid 10 digit mobile number"
                    required
                  />

                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    required
                  />

                  <textarea
                    name="message"
                    placeholder="Your Message"
                    defaultValue={`I am interested in ${product.title}.`}
                    rows="4"
                    required
                  />

                  <button
                    type="submit"
                    className="machinery-dealer-button"
                  >
                    Submit Enquiry
                  </button>
                </form>
              </>
            ) : (
              <div className="machinery-success-message">
                <h2>Enquiry Submitted!</h2>
                <p>
                  Your enquiry has been submitted successfully.
                </p>

                <button
                  type="button"
                  className="machinery-dealer-button"
                  onClick={() => setShowContact(false)}
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </section>
  );
};

export default MacineryEquipment;