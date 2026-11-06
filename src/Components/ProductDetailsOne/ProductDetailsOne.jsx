
import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./ProductDetailsOne.css";
import drillImage from "../../assets/machine.jpg";

const categories = [
  "Power Tools",
  "Agricultural Machinery",
  "Garden Equipment",
  "Safety Equipment",
  "Irrigation Tools",
  "Hand Tools",
  "Farm Accessories",
];

const ProductDetailsOne = () => {
  const [quantity, setQuantity] = useState(1);
  const [pincode, setPincode] = useState("");
  const [deliveryMessage, setDeliveryMessage] = useState(
    "Expected Delivery in 4–10 Days"
  );
  const [deliveryStatus, setDeliveryStatus] = useState("default");
  const [activeImage, setActiveImage] = useState(drillImage);
  const [cartCount, setCartCount] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("Power Tools");
  const [minPrice, setMinPrice] = useState(500);
  const [maxPrice, setMaxPrice] = useState(10000);

  const product = {
    name: "Professional Cordless Impact Driver",
    brand: "FARMTECH AGRO",
    price: 3499,
    oldPrice: 4299,
    rating: 4.8,
    reviews: 124,
    description:
      "Make your everyday farm maintenance and repair work easier with this powerful cordless impact driver. Designed for convenient handling, reliable performance and comfortable operation, it is a useful addition to your agricultural tool collection.",
    delivery: "Expected Delivery in 4–10 Days",
  };

  const formatPrice = (price) =>
    `₹${Number(price).toLocaleString("en-IN")}`;

  const handleDeliveryCheck = (event) => {
    event.preventDefault();

    if (!/^[1-9][0-9]{5}$/.test(pincode)) {
      setDeliveryStatus("error");
      setDeliveryMessage("Please enter a valid 6-digit PIN code.");
      return;
    }

    setDeliveryStatus("success");
    setDeliveryMessage(
      `Delivery available to ${pincode}. Expected delivery in 4–10 days.`
    );
  };

  const handleAddToCart = () => {
    setCartCount((previous) => previous + quantity);
  };

  const decreaseQuantity = () => {
    setQuantity((previous) => Math.max(1, previous - 1));
  };

  const increaseQuantity = () => {
    setQuantity((previous) => Math.min(99, previous + 1));
  };

  return (
    <section className="ProductDetailsOne">
      <div className="ProductDetailsOne-container">
        {/* Left sidebar */}

        <aside className="ProductDetailsOne-sidebar">
          <form
            className="ProductDetailsOne-search"
            onSubmit={(event) => event.preventDefault()}
          >
            <input
              type="search"
              placeholder="Search..."
              aria-label="Search products"
            />
            <button type="submit" aria-label="Search">
              <svg viewBox="0 0 24 24" fill="none">
                <circle
                  cx="11"
                  cy="11"
                  r="7"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="m16 16 4 4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </form>

          <div className="ProductDetailsOne-sidebar-section">
            <h2>Categories</h2>

            <div className="ProductDetailsOne-category-box">
              {categories.map((category) => (
                <button
                  type="button"
                  key={category}
                  className={`ProductDetailsOne-category-item ${
                    selectedCategory === category
                      ? "ProductDetailsOne-category-active"
                      : ""
                  }`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {selectedCategory === category && (
                    <span className="ProductDetailsOne-category-arrow">
                      →
                    </span>
                  )}
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="ProductDetailsOne-sidebar-section ProductDetailsOne-price-filter">
            <h2>Filter By Price</h2>

            <div className="ProductDetailsOne-range-values">
              <span>{formatPrice(minPrice)}</span>
              <span>{formatPrice(maxPrice)}</span>
            </div>

            <div className="ProductDetailsOne-range-control">
              <input
                type="range"
                min="0"
                max="10000"
                step="100"
                value={minPrice}
                onChange={(event) =>
                  setMinPrice(
                    Math.min(Number(event.target.value), maxPrice)
                  )
                }
                aria-label="Minimum price"
              />
              <input
                type="range"
                min="0"
                max="10000"
                step="100"
                value={maxPrice}
                onChange={(event) =>
                  setMaxPrice(
                    Math.max(Number(event.target.value), minPrice)
                  )
                }
                aria-label="Maximum price"
              />
            </div>

            <div className="ProductDetailsOne-filter-bottom">
              <button
                type="button"
                onClick={() => {
                  setDeliveryStatus("default");
                  setDeliveryMessage(
                    `Showing products between ${formatPrice(minPrice)} and ${formatPrice(maxPrice)}`
                  );
                }}
              >
                Filter
              </button>
              <span>
                {formatPrice(minPrice)} – {formatPrice(maxPrice)}
              </span>
            </div>
          </div>
        </aside>

        {/* Main product image */}

        <div className="ProductDetailsOne-gallery">
          <div className="ProductDetailsOne-main-image">
            <img src={activeImage} alt={product.name} />
            <span className="ProductDetailsOne-image-badge">
              Quality Checked
            </span>
          </div>

          <div className="ProductDetailsOne-thumbnails">
            <button
              type="button"
              className="ProductDetailsOne-thumbnail ProductDetailsOne-thumbnail-active"
              onClick={() => setActiveImage(drillImage)}
              aria-label="Show product image"
            >
              <img src={drillImage} alt="Product view" />
            </button>
          </div>
        </div>

        {/* Product information */}

        <div className="ProductDetailsOne-information">
          <span className="ProductDetailsOne-brand">{product.brand}</span>

          <h1 className="ProductDetailsOne-title">{product.name}</h1>

          <div className="ProductDetailsOne-rating">
            <span className="ProductDetailsOne-stars">★★★★★</span>
            <span className="ProductDetailsOne-rating-number">
              {product.rating}
            </span>
            <span className="ProductDetailsOne-review-count">
              ({product.reviews} reviews)
            </span>
          </div>

          <div className="ProductDetailsOne-price">
            <strong>{formatPrice(product.price)}</strong>
            <del>{formatPrice(product.oldPrice)}</del>
            <span>
              {Math.round(
                ((product.oldPrice - product.price) / product.oldPrice) *
                  100
              )}
              % OFF
            </span>
          </div>

          <p className="ProductDetailsOne-description">
            {product.description}
          </p>

          <div className="ProductDetailsOne-delivery">
            <h3>Check Delivery Option at Your Location:</h3>

            <form
              className="ProductDetailsOne-pincode-form"
              onSubmit={handleDeliveryCheck}
            >
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="Pincode"
                value={pincode}
                onChange={(event) =>
                  setPincode(event.target.value.replace(/\D/g, ""))
                }
                aria-label="Delivery PIN code"
              />

              <button type="submit">CHECK</button>
            </form>

            <p
              className={`ProductDetailsOne-delivery-message ProductDetailsOne-delivery-${deliveryStatus}`}
              aria-live="polite"
            >
              {deliveryMessage}
            </p>
          </div>

          <div className="ProductDetailsOne-purchase">
            <div className="ProductDetailsOne-quantity">
              <button
                type="button"
                onClick={decreaseQuantity}
                aria-label="Decrease quantity"
                disabled={quantity <= 1}
              >
                −
              </button>

              <input
                type="number"
                min="1"
                max="99"
                value={quantity}
                onChange={(event) => {
                  const value = Number(event.target.value);
                  setQuantity(
                    Math.min(99, Math.max(1, value || 1))
                  );
                }}
                aria-label="Quantity"
              />

              <button
                type="button"
                onClick={increaseQuantity}
                aria-label="Increase quantity"
                disabled={quantity >= 99}
              >
                +
              </button>
            </div>

            <button
              type="button"
              className="ProductDetailsOne-add-cart"
              onClick={handleAddToCart}
            >
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M3 4h2l2.2 11.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 2-1.6L21 8H6"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="10" cy="20" r="1.4" fill="currentColor" />
                <circle cx="18" cy="20" r="1.4" fill="currentColor" />
              </svg>
              {cartCount > 0 ? `Added (${cartCount})` : "Add To Cart"}
            </button>
          </div>

          <div className="ProductDetailsOne-trust">
            <div>
              <span>✓</span>
              Quality checked products
            </div>
            <div>
              <span>✓</span>
              Secure shopping
            </div>
            <div>
              <span>✓</span>
              Customer support
            </div>
          </div>

          <div className="ProductDetailsOne-cart-note" aria-live="polite">
            {cartCount > 0 && (
              <>
                {cartCount} item(s) added locally. Connect this button to your
                cart API or context for a persistent cart.
                <Link to="/cart"> View Cart</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductDetailsOne;
