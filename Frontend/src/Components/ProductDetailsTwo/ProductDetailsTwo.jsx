import React, { useEffect, useState, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { ShoppingCart, Heart, Star, ChevronLeft, ChevronRight } from "lucide-react";
import "./ProductDetailsTwo.css";
import { useCart, useWishlist } from "../../context/CartWishlistContext";
import { resolveImageUrl, toProductSlug } from "../../utils/helpers";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const PRODUCTS_API = `${API_URL}/products`;

const ProductDetailsTwo = () => {
  const { name: currentParam } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartAlert, setCartAlert] = useState("");
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const sliderRef = useRef(null);

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

    return () => {
      isMounted = false;
    };
  }, []);

  const handleAddToCart = (product, e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    const title = product.title || product.name || "Product";
    setCartAlert(`✓ Added "${title}" to cart`);
    setTimeout(() => setCartAlert(""), 2500);
  };

  const handleToggleWishlist = (product, e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const scrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -320, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 320, behavior: "smooth" });
    }
  };

  // Filter out the current active product
  const currentSlug = toProductSlug(currentParam || "");
  const relatedProducts = products.filter((p) => {
    const pSlug = toProductSlug(p.title || p.name || "");
    return !currentSlug || pSlug !== currentSlug;
  });

  if (loading && relatedProducts.length === 0) {
    return null;
  }

  if (!loading && relatedProducts.length === 0) {
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

          <div className="ProductDetailsTwo-header-actions">
            <div className="ProductDetailsTwo-nav-buttons">
              <button
                type="button"
                className="ProductDetailsTwo-nav-btn"
                onClick={scrollLeft}
                aria-label="Previous products"
                title="Previous products"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                className="ProductDetailsTwo-nav-btn"
                onClick={scrollRight}
                aria-label="Next products"
                title="Next products"
              >
                <ChevronRight size={20} />
              </button>
            </div>
            <Link to="/products" className="ProductDetailsTwo-view-all">
              View All Products
            </Link>
          </div>
        </div>

        <div className="ProductDetailsTwo-slider" ref={sliderRef}>
          <div className="ProductDetailsTwo-track">
            {relatedProducts.map((product) => {
              const pId = product._id || product.id;
              const title = product.title || product.name || "Agricultural Equipment";
              const price = Number(product.finalPrice || product.price || 0);
              const rating = Number(product.rating || 4.8);
              const imageSrc = resolveImageUrl(
                product.image ||
                  (Array.isArray(product.images) && product.images[0]) ||
                  (Array.isArray(product.otherImages) && product.otherImages[0]),
                "/placeholder.png"
              );

              const inWish = isInWishlist(pId);
              const productUrl = `/product/${toProductSlug(title)}`;

              return (
                <div className="ProductDetailsTwo-card" key={pId}>
                  <div className="ProductDetailsTwo-image-wrapper">
                    <Link to={productUrl} className="ProductDetailsTwo-image-link">
                      <img
                        src={imageSrc}
                        alt={title}
                        className="ProductDetailsTwo-image"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.png";
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
                      >
                        <ShoppingCart size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
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
