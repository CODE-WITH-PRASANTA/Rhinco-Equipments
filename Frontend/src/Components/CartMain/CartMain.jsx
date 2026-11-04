
import React, { useEffect, useMemo, useState } from "react";
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Truck,
  PackageCheck,
  ShoppingCart,
  X,
  Check,
  Tag,
  RefreshCw,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import "./CartMain.css";

const CART_STORAGE_KEY = "healthy_heaven_cart";
const CHECKOUT_STORAGE_KEY = "healthy_heaven_checkout";

// Get product ID
const getProductId = (item) => {
  return String(item.productId || item.id || item._id || "");
};

// Format Indian currency
const formatPrice = (price) => {
  return Number(price || 0).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  });
};

// Get image URL
const getImageUrl = (image) => {
  if (!image) return "/placeholder.png";

  if (
    image.startsWith("http://") ||
    image.startsWith("https://") ||
    image.startsWith("data:")
  ) {
    return image;
  }

  return image.startsWith("/") ? image : `/${image}`;
};

// Read cart from localStorage
const getStoredCart = () => {
  try {
    const storedCart = localStorage.getItem(CART_STORAGE_KEY);

    if (!storedCart) return [];

    const parsedCart = JSON.parse(storedCart);

    if (!Array.isArray(parsedCart)) return [];

    return parsedCart.map((item) => ({
      ...item,
      productId: getProductId(item),
      price: Number(item.price) || 0,
      quantity: Math.max(1, Number(item.quantity) || 1),
      name: item.name || item.productName || "Product",
    }));
  } catch (error) {
    console.error("Unable to read cart:", error);
    return [];
  }
};

const CartMain = () => {
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState(getStoredCart);
  const [selectedItems, setSelectedItems] = useState([]);
  const [coupon, setCoupon] = useState("");
  const [couponMessage, setCouponMessage] = useState("");
  const [showClearModal, setShowClearModal] = useState(false);
  const [toast, setToast] = useState("");

  // Save cart in localStorage
  useEffect(() => {
    localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify(cartItems)
    );
  }, [cartItems]);

  // Select newly added products by default
  useEffect(() => {
    setSelectedItems((previous) => {
      const existingIds = cartItems.map((item) =>
        getProductId(item)
      );

      return previous.filter((id) => existingIds.includes(id));
    });
  }, [cartItems]);

  // Listen for cart changes from other components
  useEffect(() => {
    const handleCartUpdate = () => {
      setCartItems(getStoredCart());
    };

    const handleStorageUpdate = (event) => {
      if (event.key === CART_STORAGE_KEY) {
        setCartItems(getStoredCart());
      }
    };

    window.addEventListener("cartUpdated", handleCartUpdate);
    window.addEventListener("storage", handleStorageUpdate);

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate);
      window.removeEventListener("storage", handleStorageUpdate);
    };
  }, []);

  // Toast notification
  const showToast = (message) => {
    setToast(message);

    window.clearTimeout(showToast.timer);

    showToast.timer = window.setTimeout(() => {
      setToast("");
    }, 2500);
  };

  // Select all products
  const allSelected =
    cartItems.length > 0 &&
    cartItems.every((item) =>
      selectedItems.includes(getProductId(item))
    );

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedItems([]);
    } else {
      setSelectedItems(
        cartItems.map((item) => getProductId(item))
      );
    }
  };

  // Select individual product
  const handleSelectItem = (id) => {
    setSelectedItems((previous) =>
      previous.includes(id)
        ? previous.filter((itemId) => itemId !== id)
        : [...previous, id]
    );
  };

  // Increase quantity
  const increaseQuantity = (id) => {
    setCartItems((previous) =>
      previous.map((item) =>
        getProductId(item) === id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  // Decrease quantity
  const decreaseQuantity = (id) => {
    setCartItems((previous) =>
      previous.map((item) =>
        getProductId(item) === id
          ? {
              ...item,
              quantity: Math.max(1, item.quantity - 1),
            }
          : item
      )
    );
  };

  // Remove single product
  const removeItem = (id) => {
    setCartItems((previous) =>
      previous.filter(
        (item) => getProductId(item) !== id
      )
    );

    setSelectedItems((previous) =>
      previous.filter((itemId) => itemId !== id)
    );

    showToast("Product removed from cart");
  };

  // Remove selected products
  const removeSelectedItems = () => {
    if (selectedItems.length === 0) {
      showToast("Please select products first");
      return;
    }

    setCartItems((previous) =>
      previous.filter(
        (item) => !selectedItems.includes(getProductId(item))
      )
    );

    setSelectedItems([]);
    showToast("Selected products removed");
  };

  // Clear complete cart
  const clearCart = () => {
    setCartItems([]);
    setSelectedItems([]);
    setShowClearModal(false);
    setCoupon("");
    setCouponMessage("");

    localStorage.removeItem(CHECKOUT_STORAGE_KEY);

    showToast("Your cart has been cleared");
  };

  // Selected products
  const selectedProducts = useMemo(() => {
    return cartItems.filter((item) =>
      selectedItems.includes(getProductId(item))
    );
  }, [cartItems, selectedItems]);

  // Subtotal
  const subtotal = useMemo(() => {
    return selectedProducts.reduce(
      (total, item) =>
        total + item.price * item.quantity,
      0
    );
  }, [selectedProducts]);

  // Total quantity
  const totalQuantity = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  // Selected quantity
  const selectedQuantity = selectedProducts.reduce(
    (total, item) => total + item.quantity,
    0
  );

  // Coupon demonstration
  const handleApplyCoupon = (event) => {
    event.preventDefault();

    if (!coupon.trim()) {
      setCouponMessage("Please enter a coupon code.");
      return;
    }

    setCouponMessage(
      "Coupon validation requires a configured coupon system."
    );
  };

  // Checkout
  const handleCheckout = () => {
    if (selectedProducts.length === 0) {
      showToast("Please select at least one product");
      return;
    }

    localStorage.setItem(
      CHECKOUT_STORAGE_KEY,
      JSON.stringify(selectedProducts)
    );

    navigate("/checkout");
  };

  // Continue shopping
  const handleContinueShopping = () => {
    navigate("/shop");
  };

  // Empty cart
  if (cartItems.length === 0) {
    return (
      <section className="cartMain">
        <div className="cartEmptyContainer">
          <div className="cartEmptyIcon">
            <ShoppingBag size={65} strokeWidth={1.3} />
          </div>

          <h2>Your Cart is Empty</h2>

          <p>
            Looks like you haven't added anything to your
            cart yet. Explore our healthy collection and
            find something you love.
          </p>

          <button
            className="cartContinueBtn"
            onClick={handleContinueShopping}
          >
            <ArrowLeft size={18} />
            Continue Shopping
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="cartMain">

      {/* HEADER */}
      <div className="cartHeader">
        <div>
          <span className="cartEyebrow">
            YOUR SHOPPING BAG
          </span>

          <h1>
            Shopping <span>Cart</span>
          </h1>

          <p>
            Review your selected products before checkout.
          </p>
        </div>

        <div className="cartHeaderCount">
          <ShoppingBag size={20} />

          <span>
            {cartItems.length} Products
          </span>
        </div>
      </div>

      {/* CART CONTENT */}
      <div className="cartLayout">

        {/* LEFT CONTENT */}
        <div className="cartProductsSection">

          {/* CART TOOLBAR */}
          <div className="cartToolbar">

            <label className="cartSelectAll">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={handleSelectAll}
              />

              <span>Select All ({cartItems.length})</span>
            </label>

            <div className="cartToolbarActions">
              {selectedItems.length > 0 && (
                <button
                  className="cartRemoveSelected"
                  onClick={removeSelectedItems}
                >
                  <Trash2 size={15} />
                  Remove Selected
                </button>
              )}

              <button
                className="cartClearBtn"
                onClick={() => setShowClearModal(true)}
              >
                Clear Cart
              </button>
            </div>
          </div>

          {/* PRODUCT LIST */}
          <div className="cartProductsList">

            {cartItems.map((item) => {
              const id = getProductId(item);
              const isSelected = selectedItems.includes(id);

              return (
                <div
                  className={`cartProductCard ${
                    isSelected ? "selected" : ""
                  }`}
                  key={id}
                >

                  {/* CHECKBOX */}
                  <div className="cartProductCheckbox">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleSelectItem(id)}
                    />
                  </div>

                  {/* IMAGE */}
                  <div className="cartProductImage">
                    <img
                      src={getImageUrl(item.image)}
                      alt={item.name}
                      onError={(event) => {
                        event.currentTarget.src =
                          "/placeholder.png";
                      }}
                    />
                  </div>

                  {/* DETAILS */}
                  <div className="cartProductDetails">

                    <span className="cartProductCategory">
                      {item.category || "Healthy Products"}
                    </span>

                    <h3>{item.name}</h3>

                    <p>
                      {item.description ||
                        "Fresh quality product for your daily needs."}
                    </p>

                    <div className="cartProductPrice">
                      {formatPrice(item.price)}
                    </div>
                  </div>

                  {/* QUANTITY */}
                  <div className="cartQuantityWrapper">
                    <span>Quantity</span>

                    <div className="cartQuantityControl">

                      <button
                        type="button"
                        onClick={() => decreaseQuantity(id)}
                        disabled={item.quantity <= 1}
                        aria-label="Decrease quantity"
                      >
                        <Minus size={15} />
                      </button>

                      <span>{item.quantity}</span>

                      <button
                        type="button"
                        onClick={() => increaseQuantity(id)}
                        aria-label="Increase quantity"
                      >
                        <Plus size={15} />
                      </button>

                    </div>
                  </div>

                  {/* TOTAL */}
                  <div className="cartProductTotal">
                    <span>Item Total</span>

                    <strong>
                      {formatPrice(
                        item.price * item.quantity
                      )}
                    </strong>
                  </div>

                  {/* REMOVE */}
                  <button
                    className="cartRemoveItem"
                    onClick={() => removeItem(id)}
                    aria-label="Remove product"
                    title="Remove product"
                  >
                    <Trash2 size={18} />
                  </button>

                </div>
              );
            })}

          </div>

          {/* CONTINUE SHOPPING */}
          <button
            className="cartBackToShop"
            onClick={handleContinueShopping}
          >
            <ArrowLeft size={17} />
            Continue Shopping
          </button>

        </div>

        {/* RIGHT SUMMARY */}
        <aside className="cartSummarySection">

          <div className="cartSummaryCard">

            <div className="cartSummaryHeader">
              <h2>Order Summary</h2>

              <span>
                {selectedQuantity} Items
              </span>
            </div>

            {/* SUMMARY */}
            <div className="cartSummaryDetails">

              <div className="cartSummaryRow">
                <span>Products in Cart</span>
                <span>{cartItems.length}</span>
              </div>

              <div className="cartSummaryRow">
                <span>Total Quantity</span>
                <span>{totalQuantity}</span>
              </div>

              <div className="cartSummaryRow">
                <span>Selected Products</span>
                <span>{selectedProducts.length}</span>
              </div>

              <div className="cartSummaryRow">
                <span>Subtotal</span>
                <strong>{formatPrice(subtotal)}</strong>
              </div>

              <div className="cartSummaryRow cartShippingRow">
                <span>Shipping</span>
                <span className="cartFreeShipping">
                  Calculated at checkout
                </span>
              </div>

            </div>

            {/* COUPON */}
            <form
              className="cartCouponForm"
              onSubmit={handleApplyCoupon}
            >
              <label>
                <Tag size={16} />
                Have a coupon?
              </label>

              <div className="cartCouponInput">
                <input
                  type="text"
                  placeholder="Enter coupon code"
                  value={coupon}
                  onChange={(event) => {
                    setCoupon(event.target.value);
                    setCouponMessage("");
                  }}
                />

                <button type="submit">
                  Apply
                </button>
              </div>

              {couponMessage && (
                <p className="cartCouponMessage">
                  {couponMessage}
                </p>
              )}
            </form>

            {/* TOTAL */}
            <div className="cartGrandTotal">
              <span>Estimated Subtotal</span>

              <strong>{formatPrice(subtotal)}</strong>
            </div>

            {/* CHECKOUT */}
            <button
              className="cartCheckoutBtn"
              onClick={handleCheckout}
              disabled={selectedProducts.length === 0}
            >
              Proceed to Checkout
              <ArrowRight size={19} />
            </button>

            <p className="cartCheckoutNote">
              Your selected products will be saved for checkout.
            </p>

            {/* BENEFITS */}
            <div className="cartBenefits">

              <div className="cartBenefitItem">
                <ShieldCheck size={21} />

                <div>
                  <strong>Secure Shopping</strong>
                  <span>Safe shopping experience</span>
                </div>
              </div>

              <div className="cartBenefitItem">
                <Truck size={21} />

                <div>
                  <strong>Delivery Information</strong>
                  <span>Shipping calculated at checkout</span>
                </div>
              </div>

              <div className="cartBenefitItem">
                <PackageCheck size={21} />

                <div>
                  <strong>Quality Products</strong>
                  <span>Carefully selected products</span>
                </div>
              </div>

              <div className="cartBenefitItem">
                <RefreshCw size={21} />

                <div>
                  <strong>Easy Shopping</strong>
                  <span>Manage your cart anytime</span>
                </div>
              </div>

            </div>

          </div>

        </aside>

      </div>

      {/* CLEAR CART MODAL */}
      {showClearModal && (
        <div
          className="cartModalOverlay"
          onClick={() => setShowClearModal(false)}
        >
          <div
            className="cartConfirmModal"
            onClick={(event) => event.stopPropagation()}
          >

            <button
              className="cartModalClose"
              onClick={() => setShowClearModal(false)}
            >
              <X size={20} />
            </button>

            <div className="cartModalIcon">
              <Trash2 size={30} />
            </div>

            <h3>Clear Your Cart?</h3>

            <p>
              Are you sure you want to remove all products
              from your shopping cart? This action cannot
              be undone.
            </p>

            <div className="cartModalActions">

              <button
                className="cartModalCancel"
                onClick={() => setShowClearModal(false)}
              >
                Cancel
              </button>

              <button
                className="cartModalConfirm"
                onClick={clearCart}
              >
                <Check size={17} />
                Yes, Clear Cart
              </button>

            </div>

          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div className="cartToast">
          <Check size={18} />
          <span>{toast}</span>
        </div>
      )}

    </section>
  );
};

export default CartMain;
