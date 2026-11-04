
import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./ProductDetailsTwo.css";

const products = [
  {
    id: 1,
    name: "Professional Impact Driver",
    price: 3499,
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=700&q=85",
  },
  {
    id: 2,
    name: "Agriculture Safety Helmet",
    price: 899,
    rating: 4.6,
    image:
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=700&q=85",
  },
  {
    id: 3,
    name: "Electric Cutting Machine",
    price: 2499,
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=700&q=85",
  },
  {
    id: 4,
    name: "Garden Power Tool",
    price: 1899,
    rating: 4.5,
    image:
      "https://images.unsplash.com/photo-1599685315640-6ec5f1f2f6d7?w=700&q=85",
  },
  {
    id: 5,
    name: "Digital Soil Testing Meter",
    price: 1299,
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=700&q=85",
  },
  {
    id: 6,
    name: "Cordless Power Drill",
    price: 4599,
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1581147036324-c1c9b4f6a7b4?w=700&q=85",
  },
  {
    id: 7,
    name: "Professional Garden Tools",
    price: 799,
    rating: 4.6,
    image:
      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=700&q=85",
  },
  {
    id: 8,
    name: "Heavy Duty Hand Tool Kit",
    price: 2199,
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=700&q=85",
  },
];

const formatPrice = (price) =>
  `₹${Number(price).toLocaleString("en-IN")}`;

const ProductDetailsTwo = () => {
  const [wishlist, setWishlist] = useState([]);
  const [cart, setCart] = useState([]);

  const toggleWishlist = (id) => {
    setWishlist((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id]
    );
  };

  const addToCart = (id) => {
    setCart((previous) =>
      previous.includes(id) ? previous : [...previous, id]
    );
  };

  const renderProduct = (product, copy = false) => (
    <article
      className="ProductDetailsTwo-card"
      key={`${copy ? "duplicate-" : ""}${product.id}`}
      aria-hidden={copy ? "true" : undefined}
    >
      <div className="ProductDetailsTwo-image-wrapper">
        <Link
          to={`/product/${product.id}`}
          className="ProductDetailsTwo-image-link"
          tabIndex={copy ? -1 : 0}
        >
          <img
            src={product.image}
            alt={product.name}
            className="ProductDetailsTwo-image"
            loading="lazy"
          />
        </Link>

        <div className="ProductDetailsTwo-hover-actions">
          <button
            type="button"
            className="ProductDetailsTwo-action-button"
            onClick={() => addToCart(product.id)}
            aria-label={`Add ${product.name} to cart`}
            tabIndex={copy ? -1 : 0}
          >
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M3 4h2l2.2 11.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 2-1.6L21 8H6"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="10" cy="20" r="1.3" fill="currentColor" />
              <circle cx="18" cy="20" r="1.3" fill="currentColor" />
            </svg>
          </button>

          <button
            type="button"
            className={`ProductDetailsTwo-action-button ${
              wishlist.includes(product.id)
                ? "ProductDetailsTwo-wishlisted"
                : ""
            }`}
            onClick={() => toggleWishlist(product.id)}
            aria-label={`Add ${product.name} to wishlist`}
            tabIndex={copy ? -1 : 0}
          >
            {wishlist.includes(product.id) ? "♥" : "♡"}
          </button>
        </div>
      </div>

      <div className="ProductDetailsTwo-card-info">
        <Link
          to={`/product/${product.id}`}
          className="ProductDetailsTwo-product-name"
          tabIndex={copy ? -1 : 0}
        >
          {product.name}
        </Link>

        <div className="ProductDetailsTwo-rating">
          <span className="ProductDetailsTwo-stars" aria-label={`${product.rating} out of 5 stars`}>
            ★★★★★
          </span>
          <span className="ProductDetailsTwo-rating-number">
            {product.rating}
          </span>
        </div>

        <div className="ProductDetailsTwo-price">
          {formatPrice(product.price)}
        </div>
      </div>
    </article>
  );

  return (
    <section className="ProductDetailsTwo">
      <div className="ProductDetailsTwo-container">
        <div className="ProductDetailsTwo-heading">
          <span className="ProductDetailsTwo-heading-line" />
          <div className="ProductDetailsTwo-heading-row">
            <div>
              <span className="ProductDetailsTwo-eyebrow">
                YOU MAY ALSO LIKE
              </span>
              <h2>Related Products</h2>
            </div>

            <Link
              to="/products"
              className="ProductDetailsTwo-view-all"
            >
              View All Products
              <span>→</span>
            </Link>
          </div>
        </div>

        <div
          className="ProductDetailsTwo-carousel"
          aria-label="Related products"
        >
          <div className="ProductDetailsTwo-track">
            <div className="ProductDetailsTwo-group">
              {products.map((product) => renderProduct(product))}
            </div>

            <div className="ProductDetailsTwo-group" aria-hidden="true">
              {products.map((product) => renderProduct(product, true))}
            </div>
          </div>
        </div>

        <div className="ProductDetailsTwo-bottom">
          <span className="ProductDetailsTwo-bottom-icon">✦</span>
          Discover more quality products for your farm and garden.
          <Link to="/products">Explore Catalogue →</Link>
        </div>
      </div>
    </section>
  );
};

export default ProductDetailsTwo;
