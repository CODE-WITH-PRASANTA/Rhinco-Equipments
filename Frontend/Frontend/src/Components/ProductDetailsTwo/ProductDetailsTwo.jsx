
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Heart, Star } from "lucide-react";
import "./ProductDetailsTwo.css";

const products = [
  {
    id: 1,
    name: "Professional Impact Driver",
    price: 3499,
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&q=85",
  },
  {
    id: 2,
    name: "Agriculture Safety Helmet",
    price: 899,
    rating: 4.6,
    image:
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=85",
  },
  {
    id: 3,
    name: "Electric Cutting Machine",
    price: 2499,
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=600&q=85",
  },
  {
    id: 4,
    name: "Garden Power Tool",
    price: 1899,
    rating: 4.5,
    image:
      "https://images.unsplash.com/photo-1599685315640-8ec6b6a5d9e6?w=600&q=85",
  },
  {
    id: 5,
    name: "Digital Soil Testing Meter",
    price: 1299,
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=600&q=85",
  },
  {
    id: 6,
    name: "Cordless Power Drill",
    price: 4599,
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=600&q=85",
  },
  {
    id: 7,
    name: "Professional Garden Tools",
    price: 799,
    rating: 4.6,
    image:
      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=85",
  },
  {
    id: 8,
    name: "Heavy Duty Hand Tool Kit",
    price: 2199,
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1581147036324-c1c89c2c8b5c?w=600&q=85",
  },
  {
    id: 9,
    name: "Premium Garden Sprayer",
    price: 1599,
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=600&q=85",
  },
  {
    id: 10,
    name: "Farming Equipment Set",
    price: 2799,
    rating: 4.6,
    image:
      "https://images.unsplash.com/photo-1592982537447-6f2a6a0a6a8e?w=600&q=85",
  },
];

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

  const addToCart = (product) => {
    setCart((previous) => [...previous, product]);
  };

  const renderProduct = (product, duplicate = false) => (
    <div
      className="ProductDetailsTwo-card"
      key={`${duplicate ? "duplicate-" : ""}${product.id}`}
    >
      <div className="ProductDetailsTwo-image-wrapper">
        <Link
          to={`/product/${product.id}`}
          className="ProductDetailsTwo-image-link"
          tabIndex={duplicate ? -1 : 0}
        >
          <img
            src={product.image}
            alt={product.name}
            className="ProductDetailsTwo-image"
            loading="lazy"
          />
        </Link>

        <div className="ProductDetailsTwo-overlay">
          <button
            type="button"
            className="ProductDetailsTwo-action"
            onClick={() => addToCart(product)}
            aria-label={`Add ${product.name} to cart`}
            tabIndex={duplicate ? -1 : 0}
          >
            <ShoppingCart size={17} />
          </button>

          <button
            type="button"
            className={`ProductDetailsTwo-action ${
              wishlist.includes(product.id)
                ? "ProductDetailsTwo-action-active"
                : ""
            }`}
            onClick={() => toggleWishlist(product.id)}
            aria-label={`Add ${product.name} to wishlist`}
            tabIndex={duplicate ? -1 : 0}
          >
            <Heart
              size={17}
              fill={
                wishlist.includes(product.id) ? "currentColor" : "none"
              }
            />
          </button>
        </div>
      </div>

      <div className="ProductDetailsTwo-info">
        <Link
          to={`/product/${product.id}`}
          className="ProductDetailsTwo-name"
          tabIndex={duplicate ? -1 : 0}
        >
          {product.name}
        </Link>

        <div className="ProductDetailsTwo-rating">
          <div className="ProductDetailsTwo-stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={13}
                fill={star <= Math.round(product.rating) ? "#f5b72e" : "none"}
                color="#f5b72e"
              />
            ))}
          </div>
          <span>({product.rating})</span>
        </div>

        <div className="ProductDetailsTwo-bottom">
          <span className="ProductDetailsTwo-price">
            ₹{product.price.toLocaleString("en-IN")}
          </span>
          <button
            type="button"
            className="ProductDetailsTwo-cart-button"
            onClick={() => addToCart(product)}
            aria-label={`Add ${product.name} to cart`}
            tabIndex={duplicate ? -1 : 0}
          >
            <ShoppingCart size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <section className="ProductDetailsTwo">
      <div className="ProductDetailsTwo-container">
        <div className="ProductDetailsTwo-heading">
          <div>
            <span className="ProductDetailsTwo-subtitle">
              FARMTECH AGRO
            </span>
            <h2>Related Products</h2>
            <p>Explore more quality products for your farming needs.</p>
          </div>

          <Link to="/products" className="ProductDetailsTwo-view-all">
            View All Products
          </Link>
        </div>

        <div className="ProductDetailsTwo-slider">
          <div className="ProductDetailsTwo-track">
            <div className="ProductDetailsTwo-group">
              {products.map((product) => renderProduct(product))}
            </div>

            <div
              className="ProductDetailsTwo-group"
              aria-hidden="true"
              inert=""
            >
              {products.map((product) => renderProduct(product, true))}
            </div>
          </div>
        </div>

        {cart.length > 0 && (
          <div className="ProductDetailsTwo-cart-status" aria-live="polite">
            <ShoppingCart size={16} />
            {cart.length} {cart.length === 1 ? "product" : "products"} added
            to cart
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductDetailsTwo;
