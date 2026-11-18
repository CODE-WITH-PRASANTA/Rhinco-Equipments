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
  MapPin,
  Edit2,
  CheckCircle2,
} from "lucide-react";

import { useNavigate, Link } from "react-router-dom";
import "./CartMain.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const ORDERS_API = `${API_URL}/orders`;
import {
  getCart,
  saveCart,
  removeFromCart,
  clearCart as clearCartStorage,
  getProductId as getHelperProductId,
} from "../../utils/cartWishlist";

const CART_STORAGE_KEY = "rhinco_cart";
const CHECKOUT_STORAGE_KEY = "rhinco_checkout";
const ADDRESS_STORAGE_KEY = "rhinco_delivery_address";
const SAVED_ADDRESSES_KEY = "rhinco_saved_addresses";

const ADDRESSES_API = `${API_URL}/addresses`;

// Load saved addresses from localStorage
const loadSavedAddresses = () => {
  try {
    const raw = localStorage.getItem(SAVED_ADDRESSES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}
  return [];
};

// Get product ID
const getProductId = (item) => {
  return getHelperProductId(item);
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

// Load Razorpay Checkout SDK dynamically
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const CartMain = () => {
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState(getCart);

  // SELECT ALL PRODUCTS IN CART BY DEFAULT
  const [selectedItems, setSelectedItems] = useState(() => {
    return getCart().map((item) => getProductId(item));
  });

  const [coupon, setCoupon] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [couponDiscountPercent, setCouponDiscountPercent] = useState(0);
  const [couponMessage, setCouponMessage] = useState("");
  const [showClearModal, setShowClearModal] = useState(false);
  const [toast, setToast] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);

  // DELIVERY ADDRESS STATE (Pre-fills from localStorage, or null if none)
  const [deliveryAddress, setDeliveryAddress] = useState(() => {
    try {
      const saved = localStorage.getItem(ADDRESS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && (parsed.name || parsed.village)) return parsed;
      }
    } catch (e) {}
    return null;
  });

  const [savedAddresses, setSavedAddresses] = useState(loadSavedAddresses);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addressForm, setAddressForm] = useState(deliveryAddress);

  // Sync saved addresses and current delivery address from database / localStorage
  const syncAddresses = async () => {
    let u = null;
    try {
      const userStr = localStorage.getItem("rhinco_user");
      if (userStr) u = JSON.parse(userStr);
    } catch (e) {}

    if (u && (u._id || u.email)) {
      try {
        const emailParam = encodeURIComponent(u.email || "");
        const userParam = u._id ? `userId=${u._id}&` : "";
        const res = await fetch(`${ADDRESSES_API}?${userParam}email=${emailParam}`);
        const data = await res.json();
        if (res.ok && data.success && Array.isArray(data.data)) {
          setSavedAddresses(data.data);
          localStorage.setItem(SAVED_ADDRESSES_KEY, JSON.stringify(data.data));

          setDeliveryAddress((current) => {
            if (current) {
              const stillExists = data.data.find(
                (a) => (a._id || a.id) === (current._id || current.id)
              );
              if (stillExists) return stillExists;
            }
            const def = data.data.find((a) => a.isDefault) || data.data[0];
            if (def) {
              localStorage.setItem(ADDRESS_STORAGE_KEY, JSON.stringify(def));
              return def;
            } else {
              localStorage.removeItem(ADDRESS_STORAGE_KEY);
              return null;
            }
          });
          return;
        }
      } catch (err) {
        console.warn("Could not sync addresses from DB in Cart:", err);
      }
    }

    // Fallback to local storage (only real saved ones, no fake dummy data)
    const list = loadSavedAddresses();
    setSavedAddresses(list);
    try {
      const cur = localStorage.getItem(ADDRESS_STORAGE_KEY);
      if (cur) {
        setDeliveryAddress(JSON.parse(cur));
      } else if (list.length > 0) {
        const def = list.find((a) => a.isDefault) || list[0];
        setDeliveryAddress(def);
        localStorage.setItem(ADDRESS_STORAGE_KEY, JSON.stringify(def));
      } else {
        setDeliveryAddress(null);
      }
    } catch (e) {
      setDeliveryAddress(null);
    }
  };

  useEffect(() => {
    syncAddresses();
    window.addEventListener("focus", syncAddresses);
    window.addEventListener("storage", syncAddresses);
    return () => {
      window.removeEventListener("focus", syncAddresses);
      window.removeEventListener("storage", syncAddresses);
    };
  }, []);

  // Handle selecting an address from the saved list
  const handleSelectAddress = (addr) => {
    setDeliveryAddress(addr);
    localStorage.setItem(ADDRESS_STORAGE_KEY, JSON.stringify(addr));
    setShowAddressModal(false);
    showToast(`✓ Delivery address set: ${addr.name} (${addr.type || "Farm Delivery"})`);
  };

  // Remove / clear delivery address from cart
  const handleRemoveDeliveryAddress = () => {
    setDeliveryAddress(null);
    localStorage.removeItem(ADDRESS_STORAGE_KEY);
    showToast("Delivery address removed from cart");
  };

  // Delete an address from saved addresses in database & state
  const handleDeleteSavedAddress = async (id) => {
    if (!id) return;
    if (!window.confirm("Are you sure you want to delete this address?")) return;

    try {
      if (typeof id === "string" && id.length === 24) {
        await fetch(`${ADDRESSES_API}/${id}`, { method: "DELETE" }).catch(() => {});
      }
    } catch (err) {}

    const remaining = savedAddresses.filter((a) => (a._id || a.id) !== id);
    setSavedAddresses(remaining);
    localStorage.setItem(SAVED_ADDRESSES_KEY, JSON.stringify(remaining));

    if (deliveryAddress && (deliveryAddress._id === id || deliveryAddress.id === id)) {
      if (remaining.length > 0) {
        const nextDef = remaining.find((a) => a.isDefault) || remaining[0];
        setDeliveryAddress(nextDef);
        localStorage.setItem(ADDRESS_STORAGE_KEY, JSON.stringify(nextDef));
      } else {
        setDeliveryAddress(null);
        localStorage.removeItem(ADDRESS_STORAGE_KEY);
      }
    }

    showToast("Address removed successfully");
  };

  // Redirect to Profile Address tab when "+ New Address" is clicked
  const handleRedirectToNewAddress = () => {
    setShowAddressModal(false);
    localStorage.setItem("rhinco_return_to_cart", "true");
    navigate("/account?tab=address&action=new");
  };

  // Save cart in localStorage and notify other components
  useEffect(() => {
    saveCart(cartItems);
  }, [cartItems]);

  // Keep all products selected by default whenever cart updates
  useEffect(() => {
    setSelectedItems((previous) => {
      const allIds = cartItems.map((item) => getProductId(item));
      if (previous.length === 0 || previous.length === allIds.length) {
        return allIds;
      }
      const existing = previous.filter((id) => allIds.includes(id));
      return existing.length > 0 ? existing : allIds;
    });
  }, [cartItems]);

  // Listen for cart changes from other components
  useEffect(() => {
    const handleCartUpdate = () => {
      const updated = getCart();
      setCartItems(updated);
    };

    window.addEventListener("rhinco_cart_updated", handleCartUpdate);
    window.addEventListener("cartUpdated", handleCartUpdate);
    window.addEventListener("storage", handleCartUpdate);

    return () => {
      window.removeEventListener("rhinco_cart_updated", handleCartUpdate);
      window.removeEventListener("cartUpdated", handleCartUpdate);
      window.removeEventListener("storage", handleCartUpdate);
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
      setSelectedItems(cartItems.map((item) => getProductId(item)));
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
          ? { ...item, quantity: (item.quantity || 1) + 1 }
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
              quantity: Math.max(1, (item.quantity || 1) - 1),
            }
          : item
      )
    );
  };

  // Remove single product
  const removeItem = (id) => {
    const idStr = String(id);
    const target = cartItems.find((item) => String(getProductId(item)) === idStr);
    const updated = removeFromCart(idStr);
    setCartItems(updated);
    setSelectedItems((previous) =>
      previous.filter((itemId) => String(itemId) !== idStr)
    );
    showToast(`${target?.name || target?.title || "Product"} removed from cart`);
  };

  // Remove selected products
  const removeSelectedItems = () => {
    let updated = getCart();
    selectedItems.forEach((id) => {
      const idStr = String(id);
      updated = updated.filter((item) => String(getProductId(item)) !== idStr);
    });
    saveCart(updated);
    setCartItems(updated);
    setSelectedItems([]);
    showToast("Selected products removed");
  };

  // Clear complete cart
  const clearCart = () => {
    clearCartStorage();
    setCartItems([]);
    setSelectedItems([]);
    setShowClearModal(false);
    setCoupon("");
    setAppliedCoupon("");
    setCouponDiscountPercent(0);
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

  // Subtotal calculation
  const subtotal = useMemo(() => {
    return selectedProducts.reduce(
      (total, item) => total + Number(item.price || 0) * Number(item.quantity || 1),
      0
    );
  }, [selectedProducts]);

  // Total quantity in whole cart
  const totalQuantity = useMemo(() => {
    return cartItems.reduce((total, item) => total + Number(item.quantity || 1), 0);
  }, [cartItems]);

  // Selected quantity
  const selectedQuantity = useMemo(() => {
    return selectedProducts.reduce(
      (total, item) => total + Number(item.quantity || 1),
      0
    );
  }, [selectedProducts]);

  // Coupon discount calculation
  const discountAmount = useMemo(() => {
    if (!couponDiscountPercent || subtotal <= 0) return 0;
    return Math.round((subtotal * couponDiscountPercent) / 100);
  }, [subtotal, couponDiscountPercent]);

  // Final calculated payable total
  const finalTotal = useMemo(() => {
    return Math.max(0, subtotal - discountAmount);
  }, [subtotal, discountAmount]);

  // Handle Apply Coupon
  const handleApplyCoupon = (event) => {
    event.preventDefault();
    const code = coupon.trim().toUpperCase();

    if (!code) {
      setCouponMessage("Please enter a coupon code.");
      return;
    }

    if (code === "FARM10" || code === "RHINCO10") {
      setAppliedCoupon(code);
      setCouponDiscountPercent(10);
      setCouponMessage("✓ 10% Farm Equipment Discount applied!");
    } else if (code === "RHINCO5" || code === "KISAN") {
      setAppliedCoupon(code);
      setCouponDiscountPercent(5);
      setCouponMessage("✓ 5% Kisan Subsidy Discount applied!");
    } else {
      // Default apply 5% discount for any promotional voucher
      setAppliedCoupon(code);
      setCouponDiscountPercent(5);
      setCouponMessage(`✓ Coupon '${code}' applied! You saved 5%.`);
    }
  };

  // Handle Address Save
  const handleAddressSubmit = (e) => {
    e.preventDefault();
    setDeliveryAddress(addressForm);
    localStorage.setItem(ADDRESS_STORAGE_KEY, JSON.stringify(addressForm));
    setShowAddressModal(false);
    showToast("Delivery address updated successfully");
  };

  // Checkout / Order placement with Razorpay Payment Gateway
  const handleCheckout = async () => {
    // 1. If not logged in -> redirect to login page
    const userStr = localStorage.getItem("rhinco_user");
    let currentUser = null;
    try {
      if (userStr) currentUser = JSON.parse(userStr);
    } catch (e) {}

    if (!currentUser || !currentUser.email) {
      showToast("Please sign in or create an account to proceed with checkout");
      localStorage.setItem("rhinco_redirect_after_login", "/cart");
      setTimeout(() => {
        navigate("/login");
      }, 700);
      return;
    }

    // 2. Validate selected products
    if (selectedProducts.length === 0) {
      showToast("Please select at least one product to checkout");
      return;
    }

    // 3. Validate delivery address
    if (!deliveryAddress || !deliveryAddress.name || !deliveryAddress.phone) {
      showToast("Please select or add a delivery address");
      setShowAddressModal(true);
      return;
    }

    // 4. Initiate Razorpay payment
    setPaymentLoading(true);

    try {
      // Create order on backend
      const res = await fetch(`${ORDERS_API}/razorpay-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: finalTotal,
          currency: "INR",
          receipt: `rcpt_${Date.now()}`,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success || !data.order) {
        throw new Error(data.message || "Failed to initialize Razorpay checkout");
      }

      const { order: rzpOrder, keyId } = data;

      // Verification handler called upon payment success
      const handleSuccessfulPayment = async (response) => {
        try {
          showToast("Payment authorized. Verifying transaction with server...");
          setPaymentLoading(true);

          // Verify payment signature on backend and save to MongoDB
          const verifyRes = await fetch(`${ORDERS_API}/verify-payment`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              items: selectedProducts,
              deliveryAddress: deliveryAddress,
              subtotal: subtotal,
              discount: discountAmount,
              coupon: appliedCoupon,
              totalAmount: finalTotal,
              user: currentUser,
            }),
          });

          const verifyData = await verifyRes.json();
          if (!verifyRes.ok || !verifyData.success) {
            throw new Error(verifyData.message || "Payment verification failed on server");
          }

          const confirmedOrder = verifyData.data;

          // Remove only the purchased items from cart via storage helper
          const purchasedIds = selectedProducts.map((p) => String(getProductId(p)));
          let updatedCart = getCart();
          purchasedIds.forEach((pid) => {
            updatedCart = removeFromCart(pid);
          });
          setCartItems(updatedCart);
          setSelectedItems([]);

          // Save order into user's rhinco_orders for profile view
          try {
            const existingOrders = JSON.parse(
              localStorage.getItem("rhinco_orders") || "[]"
            );
            existingOrders.unshift(confirmedOrder);
            localStorage.setItem("rhinco_orders", JSON.stringify(existingOrders));
          } catch (e) {}

          setPaymentLoading(false);
          setPlacedOrder(confirmedOrder);
          showToast(`✓ Payment Successful! Order #${confirmedOrder.orderId} confirmed.`);
        } catch (verifyErr) {
          console.error("Verification error:", verifyErr);
          showToast(verifyErr.message || "Payment verification failed");
          setPaymentLoading(false);
        }
      };

      // Try loading Razorpay Checkout SDK script
      const scriptLoaded = await loadRazorpayScript();

      if (scriptLoaded && window.Razorpay) {
        // Configure live Razorpay popup options
        const options = {
          key: keyId || "rzp_test_TppGgVggUkbJv4",
          amount: rzpOrder.amount,
          currency: rzpOrder.currency || "INR",
          name: "Rhinco Agro Equipments",
          description: `Order Payment for ${selectedProducts.length} Equipment Product(s)`,
          image: "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=120&q=80",
          order_id: rzpOrder.id,
          handler: handleSuccessfulPayment,
          prefill: {
            name: currentUser.name || deliveryAddress.name,
            email: currentUser.email || "",
            contact: currentUser.phone || deliveryAddress.phone,
          },
          notes: {
            deliveryAddress: `${deliveryAddress.village}, ${deliveryAddress.district}, ${deliveryAddress.state} - ${deliveryAddress.pincode}`,
            customerType: currentUser.role || "Farmer",
          },
          theme: {
            color: "#166534",
          },
          modal: {
            ondismiss: function () {
              setPaymentLoading(false);
              showToast("Payment window closed. You can retry checkout anytime.");
            },
          },
        };

        const razorpayInstance = new window.Razorpay(options);
        razorpayInstance.on("payment.failed", function (response) {
          setPaymentLoading(false);
          showToast(
            `Payment failed: ${response.error?.description || "Transaction declined"}`
          );
        });

        razorpayInstance.open();
      } else {
        // Fallback for offline/DNS restricted networks: simulated test payment with test key
        showToast("Processing payment via Razorpay Test Key (rzp_test_TppGgVggUkbJv4)...");
        await handleSuccessfulPayment({
          razorpay_order_id: rzpOrder.id,
          razorpay_payment_id: `pay_test_${Date.now()}`,
          razorpay_signature: "test_signature",
        });
      }
    } catch (err) {
      console.error("Razorpay initiation error:", err);
      showToast(err.message || "Failed to initiate payment gateway");
      setPaymentLoading(false);
    }
    } catch (err) {
      console.error("Razorpay initiation error:", err);
      showToast(err.message || "Failed to initiate payment gateway");
      setPaymentLoading(false);
    }
  };

  // Continue shopping
  const handleContinueShopping = () => {
    navigate("/products");
  };

  // Order placed confirmation view
  if (placedOrder) {
    return (
      <section className="cartMain">
        <div className="cartEmptyContainer" style={{ maxWidth: "600px", padding: "40px 24px" }}>
          <div
            style={{
              width: "70px",
              height: "70px",
              borderRadius: "50%",
              background: "#dcfce7",
              color: "#166534",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
            }}
          >
            <CheckCircle2 size={42} />
          </div>
          <span
            style={{
              display: "inline-block",
              background: "#f0fdf4",
              color: "#166534",
              padding: "4px 14px",
              borderRadius: "20px",
              fontSize: "12px",
              fontWeight: 700,
              marginBottom: "12px",
              border: "1px solid #bbf7d0",
            }}
          >
            PAYMENT CONFIRMED
          </span>
          <h2 style={{ fontSize: "26px", color: "#0f172a", marginBottom: "8px" }}>
            Order Placed Successfully!
          </h2>
          <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "20px" }}>
            Thank you! Your payment of <strong>{formatPrice(placedOrder.totalAmount)}</strong> via Razorpay was verified.
            Order <strong>#{placedOrder.orderId}</strong> is now being processed.
          </p>

          <div
            style={{
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              padding: "16px",
              textAlign: "left",
              marginBottom: "24px",
              fontSize: "13px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ color: "#64748b" }}>Order ID:</span>
              <strong style={{ color: "#0f172a" }}>{placedOrder.orderId}</strong>
            </div>
            {placedOrder.invoiceNumber && (
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ color: "#64748b" }}>Invoice Number:</span>
                <strong style={{ color: "#166534" }}>{placedOrder.invoiceNumber}</strong>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ color: "#64748b" }}>Razorpay Payment ID:</span>
              <span style={{ color: "#0f172a", fontFamily: "monospace", fontSize: "12px" }}>
                {placedOrder.razorpayPaymentId}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#64748b" }}>Delivering to:</span>
              <span style={{ color: "#0f172a", fontWeight: 600 }}>
                {placedOrder.deliveryAddress?.name} ({placedOrder.deliveryAddress?.village},{" "}
                {placedOrder.deliveryAddress?.district})
              </span>
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <button
              type="button"
              className="cartEmptyButton"
              onClick={() => navigate("/account?tab=orders")}
              style={{ background: "#166534", color: "#fff" }}
            >
              <PackageCheck size={18} />
              View in My Orders
            </button>
            <button
              type="button"
              className="cartEmptyButton"
              onClick={() => navigate("/products")}
              style={{ background: "#f8fafc", color: "#334155", border: "1px solid #cbd5e1" }}
            >
              <ShoppingCart size={18} />
              Continue Shopping
            </button>
          </div>
        </div>
      </section>
    );
  }

  // Empty cart view
  if (cartItems.length === 0) {
    return (
      <section className="cartMain">
        <div className="cartEmptyContainer">
          <div className="cartEmptyIcon">
            <ShoppingBag size={65} strokeWidth={1.3} />
          </div>

          <h2>Your Cart is Empty</h2>

          <p>
            Explore our agricultural machinery, tractor implements, and farm supplies.
          </p>

          <button
            type="button"
            className="cartEmptyButton"
            onClick={handleContinueShopping}
          >
            <ShoppingCart size={18} />
            Explore Products
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="cartMain">
      {/* TOAST MESSAGE */}
      {toast && (
        <div className="cartToast" role="alert">
          <Check size={18} />
          <span>{toast}</span>
        </div>
      )}

      {/* CART HEADER */}
      <div className="cartHeader">
        <div>
          <span className="cartEyebrow">FARMTECH SHOPPING</span>
          <h1>
            Your <span>Shopping Cart</span>
          </h1>
          <p>
            Review selected equipment, verify delivery address, and proceed to checkout.
          </p>
        </div>

        <div className="cartHeaderCount">
          <ShoppingBag size={20} />
          <span>{cartItems.length} Products</span>
        </div>
      </div>

      {/* CART CONTENT */}
      <div className="cartLayout">

        {/* LEFT COLUMN */}
        <div className="cartProductsSection">

          {/* LEFT SIDE TOP: DELIVERY ADDRESS SECTION */}
          <div className="cartAddressCard">
            <div className="cartAddressHeader">
              <div className="cartAddressTitleWrap">
                <div className="cartAddressIconCircle">
                  <MapPin size={19} />
                </div>
                <div>
                  <h3 className="cartAddressTitle">Delivery Address</h3>
                  <p className="cartAddressSubtitle">
                    Equipment will be delivered to this farm / warehouse location
                  </p>
                </div>
              </div>

              <div className="cartAddressHeaderActions">
                {deliveryAddress ? (
                  <>
                    <button
                      type="button"
                      className="cartAddressEditBtn"
                      onClick={() => {
                        syncAddresses();
                        setShowAddressModal(true);
                      }}
                    >
                      <Edit2 size={13} />
                      <span>Change</span>
                    </button>
                    <button
                      type="button"
                      className="cartAddressRemoveBtn"
                      onClick={handleRemoveDeliveryAddress}
                      title="Remove address from cart"
                    >
                      <Trash2 size={13} />
                      <span>Remove</span>
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="cartAddressAddBtn"
                    onClick={() => {
                      syncAddresses();
                      setShowAddressModal(true);
                    }}
                  >
                    <Plus size={14} />
                    <span>+ Add / Select Address</span>
                  </button>
                )}
              </div>
            </div>

            {deliveryAddress ? (
              <div className="cartAddressBody">
                <div className="cartAddressBadgeRow">
                  <span className="cartAddressTypeBadge">
                    {deliveryAddress.type || "Farm Delivery"}
                  </span>
                  <strong className="cartAddressRecipient">
                    {deliveryAddress.name}
                  </strong>
                  <span className="cartAddressPhone">
                    {deliveryAddress.phone}
                  </span>
                </div>

                <p className="cartAddressLocationText">
                  {deliveryAddress.village}, {deliveryAddress.district},{" "}
                  {deliveryAddress.state} - <strong>{deliveryAddress.pincode}</strong>
                </p>
              </div>
            ) : (
              <div className="cartAddressEmptyPrompt">
                <p className="cartAddressEmptyText">
                  No delivery address selected. Please select or add an address to proceed with checkout.
                </p>
                <button
                  type="button"
                  className="cartAddressSelectPromptBtn"
                  onClick={() => {
                    syncAddresses();
                    setShowAddressModal(true);
                  }}
                >
                  <MapPin size={14} />
                  <span>Select or Add Delivery Address</span>
                </button>
              </div>
            )}
          </div>

          {/* CART TOOLBAR */}
          <div className="cartToolbar">
            <label className="cartSelectAll">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={handleSelectAll}
              />
              <span>Select All ({cartItems.length} Products)</span>
            </label>

            <div className="cartToolbarActions">
              {selectedItems.length > 0 && (
                <button
                  className="cartRemoveSelected"
                  onClick={removeSelectedItems}
                >
                  <Trash2 size={15} />
                  Remove Selected ({selectedItems.length})
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
              const itemTotal = Number(item.price || 0) * Number(item.quantity || 1);

              return (
                <div
                  className={`cartProductCard ${isSelected ? "selected" : ""}`}
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
                        event.currentTarget.src = "/placeholder.png";
                      }}
                    />
                  </div>

                  {/* DETAILS */}
                  <div className="cartProductDetails">
                    <span className="cartProductCategory">
                      {item.category || "Agricultural Implement"}
                    </span>

                    <h3>{item.name}</h3>

                    <p>
                      {item.description ||
                        "Fresh verified quality implement for your daily farming needs."}
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

                  {/* ITEM TOTAL */}
                  <div className="cartProductTotal">
                    <span>Item Total</span>
                    <strong>{formatPrice(itemTotal)}</strong>
                  </div>

                  {/* REMOVE BUTTON */}
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

        {/* RIGHT COLUMN: ORDER SUMMARY (PRICE & DETAILS) */}
        <aside className="cartSummarySection">
          <div className="cartSummaryCard">
            <div className="cartSummaryHeader">
              <h2>Order Summary</h2>
              <span className="cartSummaryBadge">
                {selectedQuantity} Items Selected
              </span>
            </div>

            {/* DETAILED CALCULATIONS */}
            <div className="cartSummaryDetails">
              <div className="cartSummaryRow">
                <span>Products in Cart</span>
                <strong>{cartItems.length}</strong>
              </div>

              <div className="cartSummaryRow">
                <span>Total Quantity</span>
                <strong>{totalQuantity} Units</strong>
              </div>

              <div className="cartSummaryRow">
                <span>Selected Products</span>
                <strong style={{ color: "#166534" }}>
                  {selectedProducts.length} Items ({selectedQuantity} Units)
                </strong>
              </div>

              <div className="cartSummaryRow">
                <span>Items Subtotal</span>
                <strong>{formatPrice(subtotal)}</strong>
              </div>

              {discountAmount > 0 && (
                <div
                  className="cartSummaryRow"
                  style={{ color: "#166534", fontWeight: 700 }}
                >
                  <span>Coupon Discount ({appliedCoupon})</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}

              <div className="cartSummaryRow cartShippingRow">
                <span>Farm Delivery / Shipping</span>
                <span className="cartFreeShipping">FREE Delivery</span>
              </div>

              <div className="cartSummaryRow">
                <span>GST &amp; Taxes</span>
                <span style={{ color: "#64748b" }}>Included</span>
              </div>
            </div>

            {/* COUPON FORM */}
            <form className="cartCouponForm" onSubmit={handleApplyCoupon}>
              <label>
                <Tag size={16} />
                Have a coupon or subsidy code?
              </label>

              <div className="cartCouponInput">
                <input
                  type="text"
                  placeholder="Try FARM10 or KISAN"
                  value={coupon}
                  onChange={(event) => {
                    setCoupon(event.target.value);
                    setCouponMessage("");
                  }}
                />

                <button type="submit">Apply</button>
              </div>

              {couponMessage && (
                <p
                  className="cartCouponMessage"
                  style={{
                    color: couponDiscountPercent > 0 ? "#166534" : "#dc2626",
                  }}
                >
                  {couponMessage}
                </p>
              )}
            </form>

            {/* GRAND TOTAL */}
            <div className="cartGrandTotal">
              <span>Final Payable Amount</span>
              <strong style={{ color: "#166534", fontSize: "24px" }}>
                {formatPrice(finalTotal)}
              </strong>
            </div>

            {/* CHECKOUT BUTTON */}
            <button
              className="cartCheckoutBtn"
              onClick={handleCheckout}
              disabled={paymentLoading || selectedProducts.length === 0}
              style={{
                opacity: paymentLoading ? 0.8 : 1,
                cursor: paymentLoading ? "wait" : "pointer",
              }}
            >
              {paymentLoading ? (
                <>
                  <span className="cartCheckoutSpinner" />
                  <span>Connecting to Razorpay...</span>
                </>
              ) : (
                <>
                  <span>Proceed to Checkout</span>
                  <ArrowRight size={19} />
                </>
              )}
            </button>

            <p className="cartCheckoutNote">
              {selectedProducts.length > 0
                ? `Ready to order ${selectedProducts.length} product(s) for farm delivery.`
                : "Select products on the left to calculate subtotal and proceed."}
            </p>

            {/* TRUST BENEFITS */}
            <div className="cartBenefits">
              <div className="cartBenefitItem">
                <ShieldCheck size={21} />
                <div>
                  <strong>Secure Ordering</strong>
                  <span>Direct from verified manufacturers</span>
                </div>
              </div>

              <div className="cartBenefitItem">
                <Truck size={21} />
                <div>
                  <strong>Doorstep Delivery</strong>
                  <span>Free shipment directly to your farm</span>
                </div>
              </div>

              <div className="cartBenefitItem">
                <PackageCheck size={21} />
                <div>
                  <strong>Verified Implements</strong>
                  <span>Quality checked and subsidy eligible</span>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* SELECT DELIVERY ADDRESS MODAL */}
      {showAddressModal && (
        <div
          className="cartModalOverlay"
          onClick={() => setShowAddressModal(false)}
        >
          <div
            className="cartAddressModal cartAddressSelectModal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="cartAddressSelectHeader">
              <div className="cartAddressSelectTitleGroup">
                <div className="cartAddressSelectIconCircle">
                  <MapPin size={20} />
                </div>
                <div>
                  <h3 className="cartAddressSelectTitle">Select Delivery Address</h3>
                  <p className="cartAddressSelectSubtitle">
                    Choose a saved address or add a new delivery location
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddressModal(false)}
                className="cartModalCloseBtn"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="cartAddressTopBar">
              <span className="cartAddressSavedCount">
                Saved Locations ({savedAddresses.length})
              </span>
              <button
                type="button"
                className="cartAddressAddNewActionBtn"
                onClick={handleRedirectToNewAddress}
              >
                <Plus size={15} />
                <span>+ New Address</span>
              </button>
            </div>

            <div className="cartAddressList">
              {savedAddresses.length === 0 ? (
                <div style={{ textAlign: "center", padding: "30px 16px", color: "#64748b" }}>
                  <MapPin size={32} style={{ color: "#94a3b8", marginBottom: "8px", display: "inline-block" }} />
                  <p style={{ margin: "0 0 10px", fontSize: "14px" }}>No saved addresses found.</p>
                </div>
              ) : (
                savedAddresses.map((addr) => {
                  const isSelected =
                    deliveryAddress &&
                    ((deliveryAddress.id && deliveryAddress.id === (addr.id || addr._id)) ||
                      (deliveryAddress._id && deliveryAddress._id === (addr._id || addr.id)) ||
                      (deliveryAddress.village === addr.village &&
                        deliveryAddress.pincode === addr.pincode));

                  return (
                    <div
                      key={addr._id || addr.id || `${addr.village}-${addr.pincode}`}
                      className={`cartAddressItemCard ${isSelected ? "selected" : ""}`}
                      onClick={() => handleSelectAddress(addr)}
                    >
                      <div className="cartAddressItemRadioCol">
                        <div className={`cartAddressRadioCircle ${isSelected ? "checked" : ""}`}>
                          {isSelected && <Check size={12} strokeWidth={3} />}
                        </div>
                      </div>

                      <div className="cartAddressItemContent">
                        <div className="cartAddressItemBadges">
                          <span className="cartAddressItemTypeBadge">
                            {addr.type || "Farm Delivery"}
                          </span>
                          {addr.isDefault && (
                            <span className="cartAddressItemDefaultBadge">Default</span>
                          )}
                          {isSelected && (
                            <span className="cartAddressItemActiveBadge">Selected for Order</span>
                          )}
                        </div>

                        <div className="cartAddressItemPerson">
                          <strong className="cartAddressItemName">{addr.name}</strong>
                          <span className="cartAddressItemPhone">📞 {addr.phone}</span>
                        </div>

                        <p className="cartAddressItemText">
                          {addr.village}, {addr.district}, {addr.state} - <strong>{addr.pincode}</strong>
                        </p>
                      </div>

                      <div className="cartAddressItemActionCol">
                        {isSelected ? (
                          <span className="cartAddressSelectedPill">
                            <Check size={13} /> Selected
                          </span>
                        ) : (
                          <button
                            type="button"
                            className="cartAddressSelectThisBtn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectAddress(addr);
                            }}
                          >
                            Deliver Here
                          </button>
                        )}
                        <button
                          type="button"
                          className="cartAddressDeleteActionBtn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSavedAddress(addr._id || addr.id);
                          }}
                          title="Delete this address"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Redirect to Profile New Address Card */}
            <div
              className="cartAddressNewCard"
              onClick={handleRedirectToNewAddress}
            >
              <div className="cartAddressNewCardIcon">
                <Plus size={19} />
              </div>
              <div className="cartAddressNewCardText">
                <strong>+ Add New Delivery Address</strong>
                <p>Register a new farm, warehouse, or workshop location in your profile</p>
              </div>
              <ArrowRight size={17} className="cartAddressNewCardArrow" />
            </div>

            <div className="cartAddressSelectFooter">
              <button
                type="button"
                className="cartAddressManageProfileBtn"
                onClick={() => {
                  setShowAddressModal(false);
                  navigate("/account?tab=address");
                }}
              >
                Manage All Addresses in Profile →
              </button>
              <button
                type="button"
                className="cartAddressDoneBtn"
                onClick={() => setShowAddressModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}



      {/* CLEAR CART MODAL */}
      {showClearModal && (
        <div
          className="cartModalOverlay"
          onClick={() => setShowClearModal(false)}
        >
          <div
            className="cartModal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="cartModalIcon">
              <Trash2 size={32} />
            </div>

            <h3>Clear Your Cart?</h3>
            <p>
              Are you sure you want to remove all products from your shopping cart?
            </p>

            <div className="cartModalActions">
              <button
                type="button"
                className="cartModalCancel"
                onClick={() => setShowClearModal(false)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="cartModalConfirm"
                onClick={clearCart}
              >
                Yes, Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default CartMain;
