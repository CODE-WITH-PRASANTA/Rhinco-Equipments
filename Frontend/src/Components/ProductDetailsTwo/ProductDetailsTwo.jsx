import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Heart, Star } from "lucide-react";
import "./ProductDetailsTwo.css";
import {
  addToCart as helperAddToCart,
  toggleWishlist as helperToggleWishlist,
  isInWishlist as helperIsInWishlist,
} from "../../utils/cartWishlist";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const PRODUCTS_API = `${API_URL}/products`;
const fallbackProductImg =
  "https://images.unsplash.com/photo-1589923188900-85dae523342b?w=600&auto=format&fit=crop&q=80";

const ProductDetailsTwo = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartAlert, setCartAlert] = useState("");
  const [, setWishlistTick] = useState(0);

  // FETCH REAL PRODUCTS FROM DATABASE
  useEffect(() => {
    let isMounted = true;
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await fetch(PRODUCTS_API);
        const result = await res.json();
        if (res.ok && result.success && Array.isArray(result.data)) {
          if (isMounted) setProducts(result.data);
        }
      } catch (err) {
        console.error("Error fetching real related products:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProducts();

    const handleWishlistUpdate = () => setWishlistTick((t) => t + 1);
    window.addEventListener("rhinco_wishlist_updated", handleWishlistUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener("rhinco_wishlist_updated", handleWishlistUpdate);
    };
  }, []);

  const handleAddToCart = (product, e) => {
    e.preventDefault();
    e.stopPropagation();
    helperAddToCart(product, 1);
    const title = product.title || product.name || "Product";
    setCartAlert(`✓ Added "${title}" to cart`);
    setTimeout(() => setCartAlert(""), 2500);
  };

  const handleToggleWishlist = (product, e) => {
    e.preventDefault();
    e.stopPropagation();
    helperToggleWishlist(product);
    setWishlistTick((t) => t + 1);
  };

  const renderProduct = (product, duplicate = false) => {
    const pId = product._id || product.id;
    const title = product.title || product.name || "Agricultural Equipment";
    const price = Number(product.finalPrice || product.price || 0);
    const rating = Number(product.rating || 4.7);
    const imageSrc =
      product.image ||
      (Array.isArray(product.images) && product.images[0]) ||
      (Array.isArray(product.otherImages) && product.otherImages[0]) ||
      fallbackProductImg;

    const inWish = helperIsInWishlist(pId);
    const productUrl = `/product/${encodeURIComponent(title)}`;

    return (
      <div
        className="ProductDetailsTwo-card"
        key={`${duplicate ? "duplicate-" : ""}${pId}`}
      >
        <div className="ProductDetailsTwo-image-wrapper">
          <Link
            to={productUrl}
            className="ProductDetailsTwo-image-link"
            tabIndex={duplicate ? -1 : 0}
          >
            <img
              src={imageSrc}
              alt={title}
              className="ProductDetailsTwo-image"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.src = fallbackProductImg;
              }}
            />
          </Link>

          <div className="ProductDetailsTwo-overlay">
            <button
              type="button"
              className="ProductDetailsTwo-action"
              onClick={(e) => handleAddToCart(product, e)}
              aria-label={`Add ${title} to cart`}
              title="Add to cart"
              tabIndex={duplicate ? -1 : 0}
            >
              <ShoppingCart size={17} />
            </button>

            <button
              type="button"
              className={`ProductDetailsTwo-action ${
                inWish ? "ProductDetailsTwo-action-active" : ""
              }`}
              onClick={(e) => handleToggleWishlist(product, e)}
              aria-label={inWish ? "Remove from wishlist" : "Add to wishlist"}
              title={inWish ? "In Wishlist" : "Add to Wishlist"}
              tabIndex={duplicate ? -1 : 0}
            >
              <Heart
                size={17}
                fill={inWish ? "currentColor" : "none"}
                color={inWish ? "#dc2626" : "currentColor"}
              />
            </button>
          </div>
        </div>

        <div className="ProductDetailsTwo-info">
          <Link
            to={productUrl}
            className="ProductDetailsTwo-name"
            title={title}
            tabIndex={duplicate ? -1 : 0}
          >
            {title}
          </Link>

          <div className="ProductDetailsTwo-rating">
            <div className="ProductDetailsTwo-stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={13}
                  fill={star <= Math.round(rating) ? "#f5b72e" : "none"}
                  color="#f5b72e"
                />
              ))}
            </div>
            <span>({rating.toFixed(1)})</span>
          </div>

          <div className="ProductDetailsTwo-bottom">
            <span className="ProductDetailsTwo-price">
              ₹{price.toLocaleString("en-IN")}
            </span>
            <button
              type="button"
              className="ProductDetailsTwo-cart-button"
              onClick={(e) => handleAddToCart(product, e)}
              aria-label={`Add ${title} to cart`}
              title="Add to cart"
              tabIndex={duplicate ? -1 : 0}
            >
              <ShoppingCart size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading && products.length === 0) {
    return null;
  }

  if (!loading && products.length === 0) {
    return null;
  }

  return (
    <section className="ProductDetailsTwo">
      <div className="ProductDetailsTwo-container">
        <div className="ProductDetailsTwo-heading">
          <div>
            <span className="ProductDetailsTwo-subtitle">
              RHINCO AGRO EQUIPMENTS
            </span>
            <h2>Related Products</h2>
            <p>Explore more high-performance implements for your farm.</p>
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

        {cartAlert && (
          <div className="ProductDetailsTwo-cart-status" aria-live="polite">
            <ShoppingCart size={16} />
            {cartAlert}
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductDetailsTwo;
