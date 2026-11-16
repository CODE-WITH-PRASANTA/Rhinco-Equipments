import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  User,
  Package,
  HelpCircle,
  LogOut,
  MapPin,
  Tractor,
  ChevronRight,
  CheckCircle2,
  Phone,
  Mail,
  ShieldCheck,
  Headphones,
  ShoppingBag,
  ShoppingCart,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  MessageSquare,
  Clock,
} from "lucide-react";
import "./Profile.css";
import { API_ENDPOINTS } from "../../config/api";

const ENQUIRIES_API = API_ENDPOINTS.ENQUIRIES;
const ADDRESSES_STORAGE_KEY = "rhinco_saved_addresses";
const DELIVERY_ADDRESS_KEY = "rhinco_delivery_address";

const Profile = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "profile";

  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("rhinco_user");
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phone: "",
    district: "",
    village: "",
    landSize: "5-10 Acres",
  });

  const [toast, setToast] = useState("");
  const [supportMessage, setSupportMessage] = useState("");
  const [supportSubmitting, setSupportSubmitting] = useState(false);
  const [supportSuccess, setSupportSuccess] = useState(false);

  const [orders, setOrders] = useState(() => {
    try {
      const stored = localStorage.getItem("rhinco_orders");
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  });

  // Fetch real orders from database when orders tab is active
  const fetchUserOrders = async () => {
    try {
      const res = await fetch(API_ENDPOINTS.ORDERS);
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.data)) {
        const userOrders = data.data.filter(
          (o) =>
            o.paymentStatus === "paid" &&
            (!user?.email ||
              o.user?.email === user.email ||
              o.user?.phone === user.phone ||
              o.deliveryAddress?.phone === user.phone)
        );
        if (userOrders.length > 0) {
          setOrders(userOrders);
          localStorage.setItem("rhinco_orders", JSON.stringify(userOrders));
          return;
        }
      }
    } catch (e) {}

    try {
      const stored = localStorage.getItem("rhinco_orders");
      if (stored) setOrders(JSON.parse(stored));
    } catch (e) {}
  };

  useEffect(() => {
    if (activeTab === "orders") {
      fetchUserOrders();
    }
  }, [activeTab, user]);

  // SAVED ADDRESSES STATE
  const [addresses, setAddresses] = useState(() => {
    try {
      const saved = localStorage.getItem(ADDRESSES_STORAGE_KEY);
      if (saved) return JSON.parse(saved);

      const delivery = localStorage.getItem(DELIVERY_ADDRESS_KEY);
      if (delivery) {
        const d = JSON.parse(delivery);
        return [{ ...d, id: "addr-1", isDefault: true }];
      }
    } catch (e) {}

    return [
      {
        id: "addr-1",
        name: user?.name || "Saroj Kumar",
        phone: user?.phone || "+91 98765 43210",
        village: "Plot 42, Krushi Nagar, Near Farmtech Hub",
        district: "Pune",
        state: "Maharashtra",
        pincode: "411001",
        type: "Farm Delivery",
        isDefault: true,
      },
    ];
  });

  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState({
    name: "",
    phone: "",
    village: "",
    district: "",
    state: "",
    pincode: "",
    type: "Farm Delivery",
  });

  // MACHINERY ENQUIRIES STATE
  const [enquiries, setEnquiries] = useState([]);
  const [enquiriesLoading, setEnquiriesLoading] = useState(false);

  // If not logged in, redirect to login page
  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true, state: { from: "/account" } });
    } else {
      setProfileForm({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "+91 98765 43210",
        district: user.district || "Pune, Maharashtra",
        village: user.village || "Haveli Taluka",
        landSize: user.landSize || "5-10 Acres",
      });
    }
  }, [user, navigate]);

  // Sync orders from storage
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const stored = localStorage.getItem("rhinco_orders");
        if (stored) setOrders(JSON.parse(stored));
      } catch (e) {}
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Fetch real machinery enquiries
  const fetchEnquiries = async () => {
    setEnquiriesLoading(true);
    try {
      const res = await fetch(ENQUIRIES_API);
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.data)) {
        const userEmail = (user?.email || "").toLowerCase().trim();
        const userName = (user?.name || "").toLowerCase().trim();
        const userPhone = (user?.phone || "").replace(/\D/g, "");

        // Match user's enquiries strictly - never fallback to all DB records
        const userEnqs = data.data.filter((item) => {
          const itemEmail = (item.email || "").toLowerCase().trim();
          const itemName = (item.name || "").toLowerCase().trim();
          const itemPhone = (item.phone || "").replace(/\D/g, "");
          return (
            (userEmail && itemEmail === userEmail) ||
            (userPhone && itemPhone && (itemPhone.includes(userPhone) || userPhone.includes(itemPhone))) ||
            (userName && itemName && (itemName === userName || itemName.includes(userName)))
          );
        });

        setEnquiries(userEnqs);
      } else {
        setEnquiries([]);
      }
    } catch (err) {
      console.error("Error loading enquiries:", err);
      setEnquiries([]);
    } finally {
      setEnquiriesLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "enquiries") {
      fetchEnquiries();
    }
    const handleEnqSubmitted = () => {
      fetchEnquiries();
    };
    window.addEventListener("rhinco_enquiry_submitted", handleEnqSubmitted);
    return () => window.removeEventListener("rhinco_enquiry_submitted", handleEnqSubmitted);
  }, [activeTab, user]);

  // Automatically open add address modal if navigated from cart with ?tab=address&action=new
  useEffect(() => {
    if (activeTab === "address" && searchParams.get("action") === "new") {
      handleOpenAddressModal();
      setSearchParams({ tab: "address" }, { replace: true });
    }
  }, [activeTab, searchParams]);

  const handleTabChange = (tab) => {
    setSearchParams({ tab });
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSave = (e) => {
    e.preventDefault();
    if (!user) return;

    const updatedUser = {
      ...user,
      name: profileForm.name,
      email: profileForm.email,
      phone: profileForm.phone,
      district: profileForm.district,
      village: profileForm.village,
      landSize: profileForm.landSize,
    };

    localStorage.setItem("rhinco_user", JSON.stringify(updatedUser));
    setUser(updatedUser);
    window.dispatchEvent(
      new CustomEvent("rhinco_auth_updated", { detail: updatedUser })
    );

    setToast("Profile details updated successfully!");
    setTimeout(() => setToast(""), 3000);
  };

  const handleSignOut = () => {
    localStorage.removeItem("rhinco_user");
    localStorage.removeItem("rhinco_token");
    window.dispatchEvent(
      new CustomEvent("rhinco_auth_updated", { detail: null })
    );
    navigate("/login", { replace: true });
  };

  // Open modal to add or edit address
  const handleOpenAddressModal = (addr = null) => {
    if (addr) {
      setEditingAddressId(addr.id);
      setAddressForm({
        name: addr.name || "",
        phone: addr.phone || "",
        village: addr.village || "",
        district: addr.district || "",
        state: addr.state || "",
        pincode: addr.pincode || "",
        type: addr.type || "Farm Delivery",
      });
    } else {
      setEditingAddressId(null);
      setAddressForm({
        name: user?.name || "",
        phone: user?.phone || "+91 98765 43210",
        village: "",
        district: "Pune",
        state: "Maharashtra",
        pincode: "",
        type: "Farm Delivery",
      });
    }
    setShowAddressModal(true);
  };

  const handleSaveAddress = (e) => {
    e.preventDefault();
    let updated = [...addresses];

    if (editingAddressId) {
      updated = updated.map((a) =>
        a.id === editingAddressId ? { ...a, ...addressForm } : a
      );
    } else {
      const newAddr = {
        ...addressForm,
        id: `addr-${Date.now()}`,
        isDefault: updated.length === 0,
      };
      updated.push(newAddr);
    }

    setAddresses(updated);
    localStorage.setItem(ADDRESSES_STORAGE_KEY, JSON.stringify(updated));

    // Update primary delivery address if it's default
    const def = updated.find((a) => a.isDefault) || updated[0];
    if (def) {
      localStorage.setItem(DELIVERY_ADDRESS_KEY, JSON.stringify(def));
    }

    setShowAddressModal(false);
    const cameFromCart = localStorage.getItem("rhinco_return_to_cart") === "true";
    if (cameFromCart) {
      const activeAddr = editingAddressId ? updated.find(a => a.id === editingAddressId) : updated[updated.length - 1];
      if (activeAddr) {
        localStorage.setItem(DELIVERY_ADDRESS_KEY, JSON.stringify(activeAddr));
      }
      setToast("Address saved! You can return to Cart to place your order.");
    } else {
      setToast("Address saved successfully!");
    }
    setTimeout(() => setToast(""), 3000);
  };

  const handleSetDefaultAddress = (id) => {
    const updated = addresses.map((a) => ({
      ...a,
      isDefault: a.id === id,
    }));
    setAddresses(updated);
    localStorage.setItem(ADDRESSES_STORAGE_KEY, JSON.stringify(updated));

    const def = updated.find((a) => a.id === id);
    if (def) {
      localStorage.setItem(DELIVERY_ADDRESS_KEY, JSON.stringify(def));
    }

    setToast("Default address updated!");
    setTimeout(() => setToast(""), 2000);
  };

  const handleDeleteAddress = (id) => {
    if (addresses.length <= 1) {
      alert("You must keep at least one delivery address.");
      return;
    }
    const updated = addresses.filter((a) => a.id !== id);
    if (updated.length > 0 && !updated.some((a) => a.isDefault)) {
      updated[0].isDefault = true;
      localStorage.setItem(DELIVERY_ADDRESS_KEY, JSON.stringify(updated[0]));
    }
    setAddresses(updated);
    localStorage.setItem(ADDRESSES_STORAGE_KEY, JSON.stringify(updated));
    setToast("Address removed");
    setTimeout(() => setToast(""), 2000);
  };

  const handleSupportSubmit = async (e) => {
    e.preventDefault();
    if (!supportMessage.trim()) return;

    setSupportSubmitting(true);
    try {
      const res = await fetch(ENQUIRIES_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: user?.name || "Customer",
          email: user?.email || "customer@rhinco.in",
          phone: user?.phone || "+91 98765 43210",
          district: profileForm.district || "Maharashtra",
          subject: "Help Center Support Ticket",
          message: supportMessage,
        }),
      });

      if (res.ok) {
        setSupportSuccess(true);
        setSupportMessage("");
        setTimeout(() => setSupportSuccess(false), 3500);
      }
    } catch (err) {
      console.error("Support error:", err);
    } finally {
      setSupportSubmitting(false);
    }
  };

  if (!user) return null;

  const userInitial = (user.name || "U").charAt(0).toUpperCase();

  return (
    <div className="ProfilePage">
      <div className="ProfileContainer">
        {/* ==================== LEFT SIDEBAR ==================== */}
        <aside className="ProfileSidebar">
          <div className="ProfileUserCard">
            <div className="ProfileAvatarWrap">{userInitial}</div>
            <h3 className="ProfileUserName">{user.name}</h3>
            <p className="ProfileUserEmail">{user.email}</p>
            <span className="ProfileRoleBadge">
              {user.role || "Farmer"} Account
            </span>
          </div>

          <nav className="ProfileNav">
            {/* 1. My Profile */}
            <button
              type="button"
              className={`ProfileNavItem ${activeTab === "profile" ? "active" : ""}`}
              onClick={() => handleTabChange("profile")}
            >
              <div className="ProfileNavItemLeft">
                <User size={18} className="ProfileNavIcon" />
                <span>My Profile</span>
              </div>
              <ChevronRight size={16} />
            </button>

            {/* 2. My Orders */}
            <button
              type="button"
              className={`ProfileNavItem ${activeTab === "orders" ? "active" : ""}`}
              onClick={() => handleTabChange("orders")}
            >
              <div className="ProfileNavItemLeft">
                <Package size={18} className="ProfileNavIcon" />
                <span>My Orders</span>
              </div>
              <span className="ProfileNavBadge">{orders.length}</span>
            </button>

            {/* 3. My Address */}
            <button
              type="button"
              className={`ProfileNavItem ${activeTab === "address" ? "active" : ""}`}
              onClick={() => handleTabChange("address")}
            >
              <div className="ProfileNavItemLeft">
                <MapPin size={18} className="ProfileNavIcon" />
                <span>My Address</span>
              </div>
              <span className="ProfileNavBadge" style={{ background: "#166534" }}>
                {addresses.length}
              </span>
            </button>

            {/* 4. Machinery Enquiries */}
            <button
              type="button"
              className={`ProfileNavItem ${activeTab === "enquiries" ? "active" : ""}`}
              onClick={() => handleTabChange("enquiries")}
            >
              <div className="ProfileNavItemLeft">
                <Tractor size={18} className="ProfileNavIcon" />
                <span>Machinery Enquiries</span>
              </div>
              <span className="ProfileNavBadge" style={{ background: "#2563eb" }}>
                {enquiries.length > 0 ? enquiries.length : "✦"}
              </span>
            </button>

            {/* 5. Help Center */}
            <button
              type="button"
              className={`ProfileNavItem ${activeTab === "help" ? "active" : ""}`}
              onClick={() => handleTabChange("help")}
            >
              <div className="ProfileNavItemLeft">
                <HelpCircle size={18} className="ProfileNavIcon" />
                <span>Help Center</span>
              </div>
              <ChevronRight size={16} />
            </button>
          </nav>

          <div className="ProfileSignOutBtn">
            <button type="button" onClick={handleSignOut}>
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* ==================== RIGHT CONTENT PANEL ==================== */}
        <main className="ProfileContent">
          {toast && (
            <div
              style={{
                padding: "12px 18px",
                background: "#f0fdf4",
                color: "#166534",
                border: "1px solid #bbf7d0",
                borderRadius: "10px",
                fontSize: "14px",
                fontWeight: 600,
                marginBottom: "24px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <CheckCircle2 size={18} />
              <span>{toast}</span>
            </div>
          )}

          {/* TAB 1: MY PROFILE */}
          {activeTab === "profile" && (
            <div>
              <div className="ProfileSectionHeader">
                <div>
                  <h2 className="ProfileSectionTitle">My Profile</h2>
                  <p className="ProfileSectionSubtitle">
                    Manage your personal details, contact number, and farming location.
                  </p>
                </div>
              </div>

              <form className="ProfileForm" onSubmit={handleProfileSave}>
                <div className="ProfileFormGrid">
                  <div className="ProfileFormField">
                    <label className="ProfileFormLabel" htmlFor="name">
                      Full Name
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      className="ProfileFormInput"
                      value={profileForm.name}
                      onChange={handleProfileChange}
                    />
                  </div>

                  <div className="ProfileFormField">
                    <label className="ProfileFormLabel" htmlFor="email">
                      Email Address
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      className="ProfileFormInput"
                      value={profileForm.email}
                      onChange={handleProfileChange}
                    />
                  </div>
                </div>

                <div className="ProfileFormGrid">
                  <div className="ProfileFormField">
                    <label className="ProfileFormLabel" htmlFor="phone">
                      Mobile Number
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      className="ProfileFormInput"
                      value={profileForm.phone}
                      onChange={handleProfileChange}
                    />
                  </div>

                  <div className="ProfileFormField">
                    <label className="ProfileFormLabel" htmlFor="district">
                      District / State
                    </label>
                    <input
                      id="district"
                      name="district"
                      type="text"
                      className="ProfileFormInput"
                      value={profileForm.district}
                      onChange={handleProfileChange}
                    />
                  </div>
                </div>

                <div className="ProfileFormGrid">
                  <div className="ProfileFormField">
                    <label className="ProfileFormLabel" htmlFor="village">
                      Village / Taluka
                    </label>
                    <input
                      id="village"
                      name="village"
                      type="text"
                      className="ProfileFormInput"
                      value={profileForm.village}
                      onChange={handleProfileChange}
                    />
                  </div>

                  <div className="ProfileFormField">
                    <label className="ProfileFormLabel" htmlFor="landSize">
                      Farm Land Size
                    </label>
                    <select
                      id="landSize"
                      name="landSize"
                      className="ProfileFormInput"
                      value={profileForm.landSize}
                      onChange={handleProfileChange}
                      style={{ backgroundColor: "#f8fafc" }}
                    >
                      <option value="1-5 Acres">1 - 5 Acres</option>
                      <option value="5-10 Acres">5 - 10 Acres</option>
                      <option value="10-25 Acres">10 - 25 Acres</option>
                      <option value="25+ Acres">25+ Acres</option>
                    </select>
                  </div>
                </div>

                <button type="submit" className="ProfileSaveBtn">
                  Save Changes
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: MY ORDERS */}
          {activeTab === "orders" && (
            <div>
              <div className="ProfileSectionHeader">
                <div>
                  <h2 className="ProfileSectionTitle">My Orders</h2>
                  <p className="ProfileSectionSubtitle">
                    Track equipment shipments, delivery schedules, and invoices.
                  </p>
                </div>
                <Link
                  to="/products"
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#166534",
                    textDecoration: "none",
                  }}
                >
                  Explore Implements →
                </Link>
              </div>

              {orders.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "60px 20px",
                    background: "#f8fafc",
                    borderRadius: "14px",
                    border: "1px dashed #cbd5e1",
                    marginTop: "20px",
                  }}
                >
                  <ShoppingBag size={48} color="#94a3b8" style={{ marginBottom: "12px" }} />
                  <h3 style={{ fontSize: "18px", color: "#1e293b", fontWeight: 700, margin: "0 0 6px" }}>
                    No Orders Placed Yet
                  </h3>
                  <p style={{ color: "#64748b", fontSize: "14px", margin: "0 0 20px" }}>
                    You have not placed any orders yet. Browse our verified products and agricultural machinery.
                  </p>
                  <Link
                    to="/products"
                    style={{
                      display: "inline-block",
                      padding: "10px 24px",
                      backgroundColor: "#166534",
                      color: "#fff",
                      borderRadius: "8px",
                      textDecoration: "none",
                      fontWeight: 600,
                      fontSize: "14px",
                    }}
                  >
                    Browse Products
                  </Link>
                </div>
              ) : (
                <div className="ProfileOrdersList">
                  {orders.map((order) => {
                    const orderRef = order.orderId || order.id || "ORDER";
                    const orderDate = order.createdAt
                      ? new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : order.date || "Recent";
                    const orderStatus = order.orderStatus || order.statusText || order.status || "Confirmed";
                    const orderTotal = order.totalAmount || order.total || 0;

                    return (
                      <div className="ProfileOrderCard" key={order._id || order.orderId || order.id}>
                        <div className="ProfileOrderHeader">
                          <div>
                            <span className="ProfileOrderId">Order #{orderRef}</span>
                            <span style={{ color: "#94a3b8", margin: "0 8px" }}>•</span>
                            <span style={{ color: "#64748b" }}>Placed on {orderDate}</span>
                          </div>
                          <span className={`ProfileOrderStatus confirmed`}>
                            {orderStatus}
                          </span>
                        </div>

                        {(order.items || []).map((item, idx) => (
                          <div className="ProfileOrderItem" key={idx}>
                            <img
                              src={item.image || "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=120&q=80"}
                              alt={item.title || item.name}
                              className="ProfileOrderImg"
                            />
                            <div className="ProfileOrderInfo">
                              <h4>{item.title || item.name}</h4>
                              <p>
                                {item.category || item.type || "Agricultural Implement"} • Qty: {item.quantity || 1}
                              </p>
                            </div>
                          </div>
                        ))}

                        {order.deliveryAddress && (
                          <div
                            style={{
                              background: "#f8fafc",
                              padding: "10px 14px",
                              borderRadius: "8px",
                              fontSize: "12.5px",
                              color: "#475569",
                              marginBottom: "12px",
                            }}
                          >
                            <span style={{ fontWeight: 700, color: "#1e293b" }}>Shipping Destination: </span>
                            {order.deliveryAddress.village}, {order.deliveryAddress.district},{" "}
                            {order.deliveryAddress.state} - {order.deliveryAddress.pincode}
                          </div>
                        )}

                        <div className="ProfileOrderFooter">
                          <div>
                            <span style={{ fontSize: "12px", color: "#64748b", display: "block" }}>
                              Total Amount Paid (via Razorpay)
                            </span>
                            <strong className="ProfileOrderTotal">
                              ₹{Number(orderTotal).toLocaleString("en-IN")}
                            </strong>
                          </div>

                          <div style={{ display: "flex", gap: "10px" }}>
                            <Link
                              to="/products"
                              style={{
                                padding: "8px 16px",
                                borderRadius: "8px",
                                backgroundColor: "#f0fdf4",
                                color: "#166534",
                                fontSize: "13px",
                                fontWeight: 600,
                                textDecoration: "none",
                                border: "1px solid #bbf7d0",
                              }}
                            >
                              Explore More
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: MY ADDRESS */}
          {activeTab === "address" && (
            <div>
              {localStorage.getItem("rhinco_return_to_cart") === "true" && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "13px 18px",
                    background: "#f0fdf4",
                    border: "1px solid #86efac",
                    borderRadius: "12px",
                    marginBottom: "20px",
                    gap: "12px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <ShoppingCart size={20} color="#166534" />
                    <div>
                      <strong style={{ fontSize: "13.5px", color: "#166534" }}>
                        Adding an address for your Cart order?
                      </strong>
                      <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#475569" }}>
                        After adding or selecting your address here, return to Cart to place your order.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      localStorage.removeItem("rhinco_return_to_cart");
                      navigate("/cart");
                    }}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "8px 16px",
                      background: "#166534",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "8px",
                      fontSize: "12.5px",
                      fontWeight: 700,
                      cursor: "pointer",
                      flexShrink: 0,
                    }}
                  >
                    <span>← Return to Cart</span>
                  </button>
                </div>
              )}

              <div className="ProfileSectionHeader">
                <div>
                  <h2 className="ProfileSectionTitle">My Addresses</h2>
                  <p className="ProfileSectionSubtitle">
                    Manage farm and delivery addresses for machinery shipments and farm supplies.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenAddressModal()}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "10px 18px",
                    background: "#166534",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "10px",
                    fontSize: "13px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  <Plus size={16} />
                  <span>Add New Address</span>
                </button>
              </div>

              <div className="ProfileAddressGrid">
                {addresses.map((addr) => (
                  <div
                    className={`ProfileAddressCard ${addr.isDefault ? "default" : ""}`}
                    key={addr.id}
                  >
                    <div>
                      <div className="ProfileAddressCardHeader">
                        <span className="ProfileAddressTypeBadge">
                          {addr.type || "Farm Delivery"}
                        </span>
                        {addr.isDefault && (
                          <span className="ProfileAddressDefaultBadge">Default</span>
                        )}
                      </div>

                      <h4 className="ProfileAddressRecipient">{addr.name}</h4>
                      <p className="ProfileAddressPhone">📞 {addr.phone}</p>
                      <p className="ProfileAddressText">
                        {addr.village}, {addr.district}, {addr.state} - <strong>{addr.pincode}</strong>
                      </p>
                    </div>

                    <div className="ProfileAddressActions">
                      <button
                        type="button"
                        className="ProfileAddressActionBtn"
                        onClick={() => handleOpenAddressModal(addr)}
                      >
                        <Edit2 size={13} style={{ marginRight: "4px" }} />
                        Edit
                      </button>

                      {!addr.isDefault && (
                        <button
                          type="button"
                          className="ProfileAddressActionBtn primary"
                          onClick={() => handleSetDefaultAddress(addr.id)}
                        >
                          Set as Default
                        </button>
                      )}

                      {addresses.length > 1 && (
                        <button
                          type="button"
                          className="ProfileAddressActionBtn danger"
                          onClick={() => handleDeleteAddress(addr.id)}
                        >
                          <Trash2 size={13} style={{ marginRight: "4px" }} />
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: MACHINERY ENQUIRIES */}
          {activeTab === "enquiries" && (
            <div>
              <div className="ProfileSectionHeader">
                <div>
                  <h2 className="ProfileSectionTitle">Machinery Enquiries</h2>
                  <p className="ProfileSectionSubtitle">
                    Track your equipment quotations, government subsidy requests, and dealer updates.
                  </p>
                </div>
                <Link
                  to="/machinery"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "9px 18px",
                    background: "#f0fdf4",
                    color: "#166534",
                    border: "1px solid #bbf7d0",
                    borderRadius: "10px",
                    fontSize: "13px",
                    fontWeight: 700,
                    textDecoration: "none",
                  }}
                >
                  <Tractor size={16} />
                  <span>Explore Machinery</span>
                </Link>
              </div>

              {enquiriesLoading ? (
                <div style={{ textAlign: "center", padding: "60px 0", color: "#64748b" }}>
                  <p>Loading your machinery enquiries...</p>
                </div>
              ) : enquiries.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "60px 20px",
                    background: "#f8fafc",
                    borderRadius: "14px",
                    border: "1px dashed #cbd5e1",
                  }}
                >
                  <Tractor size={48} color="#94a3b8" style={{ marginBottom: "12px" }} />
                  <h3 style={{ fontSize: "18px", color: "#1e293b", fontWeight: 700, margin: "0 0 6px" }}>
                    No Enquiries Found
                  </h3>
                  <p style={{ color: "#64748b", fontSize: "14px", margin: "0 0 20px" }}>
                    You have not submitted any machinery quotes or subsidy applications yet.
                  </p>
                  <Link
                    to="/machinery"
                    style={{
                      display: "inline-block",
                      padding: "10px 24px",
                      backgroundColor: "#166534",
                      color: "#fff",
                      borderRadius: "8px",
                      textDecoration: "none",
                      fontWeight: 600,
                      fontSize: "14px",
                    }}
                  >
                    Browse Machinery
                  </Link>
                </div>
              ) : (
                <div className="ProfileEnquiriesList">
                  {enquiries.map((enq) => {
                    const statusClass = (enq.status || "new").toLowerCase();
                    const dateFormatted = enq.createdAt
                      ? new Date(enq.createdAt).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "Recent";

                    return (
                      <div className="ProfileEnquiryCard" key={enq._id || enq.id}>
                        <div className="ProfileEnquiryHeader">
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            {enq.machineImage ? (
                              <img
                                src={enq.machineImage}
                                alt={enq.productOrEquipment}
                                style={{
                                  width: "44px",
                                  height: "44px",
                                  objectFit: "contain",
                                  borderRadius: "8px",
                                  border: "1px solid #e2e8f0",
                                  background: "#f8fafc",
                                  padding: "2px",
                                }}
                                onError={(e) => {
                                  e.target.style.display = "none";
                                }}
                              />
                            ) : null}
                            <h4 className="ProfileEnquiryMachineName" style={{ margin: 0 }}>
                              <Tractor size={20} color="#166534" />
                              {enq.productOrEquipment || enq.machineName || enq.subject || "Agricultural Machine"}
                            </h4>
                          </div>
                          <span className={`ProfileEnquiryStatusBadge ${statusClass}`}>
                            {enq.status || "Submitted"}
                          </span>
                        </div>

                        <div className="ProfileEnquiryMetaRow">
                          <span>
                            <Clock size={13} style={{ marginRight: "4px" }} />
                            Enquiry Date: <strong>{dateFormatted}</strong>
                          </span>
                          {enq.location && (
                            <span>
                              <MapPin size={13} style={{ marginRight: "4px" }} />
                              Location: {enq.location}
                            </span>
                          )}
                          {enq.category && (
                            <span>
                              Subsidy: <strong>{enq.category}</strong>
                            </span>
                          )}
                        </div>

                        {enq.message && (
                          <div className="ProfileEnquiryMessage">
                            <strong>Your Inquiry: </strong>
                            {enq.message}
                          </div>
                        )}

                        {enq.notes && (
                          <div className="ProfileEnquiryNotes">
                            <CheckCircle2 size={16} />
                            <span>
                              <strong>Dealer Note: </strong>
                              {enq.notes}
                            </span>
                          </div>
                        )}

                        <div className="ProfileEnquiryFooter">
                          <span style={{ fontSize: "12px", color: "#64748b" }}>
                            Ref ID: {enq._id ? `#${enq._id.slice(-6).toUpperCase()}` : "#ENQ"}
                          </span>
                          <Link
                            to={`/machinery/${encodeURIComponent(enq.productOrEquipment || enq.machineName || "")}`}
                            style={{
                              fontSize: "13px",
                              fontWeight: 700,
                              color: "#166534",
                              textDecoration: "none",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            <span>View Machine Specs</span>
                            <ExternalLink size={13} />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: HELP CENTER */}
          {activeTab === "help" && (
            <div>
              <div className="ProfileSectionHeader">
                <div>
                  <h2 className="ProfileSectionTitle">Help Center</h2>
                  <p className="ProfileSectionSubtitle">
                    Need assistance with tractor implements, dealer delivery, or subsidies? We are here to help.
                  </p>
                </div>
              </div>

              <div className="HelpCardsGrid">
                <div className="HelpCard">
                  <div className="HelpCardIcon">
                    <Phone size={22} />
                  </div>
                  <h3>Customer Helpline</h3>
                  <p>Speak directly to our agricultural equipment specialist.</p>
                  <strong>+91 98765 43210</strong>
                </div>

                <div className="HelpCard">
                  <div className="HelpCardIcon">
                    <Mail size={22} />
                  </div>
                  <h3>Email Support</h3>
                  <p>Send technical questions or purchase enquiry via email.</p>
                  <strong>support@rhinco.in</strong>
                </div>

                <div className="HelpCard">
                  <div className="HelpCardIcon">
                    <ShieldCheck size={22} />
                  </div>
                  <h3>Subsidy Assistance</h3>
                  <p>Guidance for state &amp; central farm mechanization subsidies.</p>
                  <strong>subsidy@rhinco.in</strong>
                </div>
              </div>

              <div className="HelpContactForm">
                <h3>Submit a Support Request</h3>
                <p>Describe your issue or inquiry, and our support team will get in touch within 24 hours.</p>

                {supportSuccess && (
                  <div
                    style={{
                      padding: "12px 18px",
                      background: "#f0fdf4",
                      color: "#166534",
                      border: "1px solid #bbf7d0",
                      borderRadius: "10px",
                      fontSize: "14px",
                      fontWeight: 600,
                      marginBottom: "16px",
                    }}
                  >
                    ✓ Thank you! Your support request has been submitted.
                  </div>
                )}

                <form onSubmit={handleSupportSubmit}>
                  <textarea
                    rows={4}
                    placeholder="Enter your question or issue in detail..."
                    value={supportMessage}
                    onChange={(e) => setSupportMessage(e.target.value)}
                    required
                    style={{
                      width: "100%",
                      padding: "14px",
                      borderRadius: "12px",
                      border: "1px solid #cbd5e1",
                      fontSize: "14px",
                      fontFamily: "inherit",
                      boxSizing: "border-box",
                      marginBottom: "14px",
                      outline: "none",
                    }}
                  />
                  <button
                    type="submit"
                    className="ProfileSaveBtn"
                    disabled={supportSubmitting}
                  >
                    {supportSubmitting ? "Submitting..." : "Send Request"}
                  </button>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ADD / EDIT ADDRESS MODAL */}
      {showAddressModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
          }}
          onClick={() => setShowAddressModal(false)}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "20px",
              padding: "28px",
              width: "100%",
              maxWidth: "520px",
              boxShadow: "0 20px 50px rgba(0, 0, 0, 0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingBottom: "16px",
                borderBottom: "1px solid #f1f5f9",
                marginBottom: "20px",
              }}
            >
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 800, color: "#0f172a" }}>
                {editingAddressId ? "Edit Address" : "Add New Delivery Address"}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddressModal(false)}
                style={{
                  background: "#f1f5f9",
                  border: "none",
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAddress} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "12.5px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "6px" }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.name}
                    onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                    style={{ width: "100%", padding: "10px", border: "1px solid #cbd5e1", borderRadius: "8px", boxSizing: "border-box" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "12.5px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "6px" }}>
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={addressForm.phone}
                    onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                    style={{ width: "100%", padding: "10px", border: "1px solid #cbd5e1", borderRadius: "8px", boxSizing: "border-box" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: "12.5px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "6px" }}>
                  Village / Taluka / Plot No. *
                </label>
                <input
                  type="text"
                  required
                  value={addressForm.village}
                  onChange={(e) => setAddressForm({ ...addressForm, village: e.target.value })}
                  placeholder="e.g. Plot 42, Krushi Nagar"
                  style={{ width: "100%", padding: "10px", border: "1px solid #cbd5e1", borderRadius: "8px", boxSizing: "border-box" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "12.5px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "6px" }}>
                    District *
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.district}
                    onChange={(e) => setAddressForm({ ...addressForm, district: e.target.value })}
                    style={{ width: "100%", padding: "10px", border: "1px solid #cbd5e1", borderRadius: "8px", boxSizing: "border-box" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "12.5px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "6px" }}>
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                    style={{ width: "100%", padding: "10px", border: "1px solid #cbd5e1", borderRadius: "8px", boxSizing: "border-box" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "12.5px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "6px" }}>
                    PIN Code *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={addressForm.pincode}
                    onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                    style={{ width: "100%", padding: "10px", border: "1px solid #cbd5e1", borderRadius: "8px", boxSizing: "border-box" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "12.5px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "6px" }}>
                    Address Type
                  </label>
                  <select
                    value={addressForm.type}
                    onChange={(e) => setAddressForm({ ...addressForm, type: e.target.value })}
                    style={{ width: "100%", padding: "10px", border: "1px solid #cbd5e1", borderRadius: "8px", boxSizing: "border-box", background: "#ffffff" }}
                  >
                    <option value="Farm Delivery">Farm Delivery</option>
                    <option value="Home Delivery">Home Delivery</option>
                    <option value="Dealer Hub Pickup">Dealer Hub Pickup</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  style={{
                    padding: "10px 18px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    background: "#f8fafc",
                    color: "#475569",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "10px 22px",
                    borderRadius: "8px",
                    border: "none",
                    background: "#166534",
                    color: "#ffffff",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
