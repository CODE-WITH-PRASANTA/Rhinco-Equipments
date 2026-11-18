import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Package,
  CheckCircle2,
  Truck,
  MapPin,
  FileText,
  Phone,
  Mail,
  ShieldCheck,
  Clock,
  ExternalLink,
  ChevronRight,
  ShoppingBag,
  HelpCircle,
  Tractor,
  LogOut,
} from "lucide-react";
import "./OrderDetails.css";
import { resolveImageUrl, toProductSlug } from "../../utils/helpers";
import { downloadOrderInvoicePdf } from "../../utils/invoicePdfGenerator";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const HELPLINE_PHONE = "+91 98765 43210";
const SUPPORT_EMAIL = "farmtechagroindia@gmail.com";

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  // User & sidebar counts
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem("rhinco_user");
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [ordersCount, setOrdersCount] = useState(1);
  const [addressesCount, setAddressesCount] = useState(1);
  const [enquiriesCount, setEnquiriesCount] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Fetch sidebar badge counts
  useEffect(() => {
    const fetchSidebarCounts = async () => {
      const userEmail = currentUser?.email || "";
      const userId = currentUser?._id || currentUser?.id || "";

      if (userEmail) {
        try {
          const res = await fetch(`${API_URL}/orders?userEmail=${encodeURIComponent(userEmail)}`);
          const data = await res.json();
          if (res.ok && data.success && Array.isArray(data.data)) {
            setOrdersCount(data.data.length);
          }
        } catch (e) {}

        try {
          const res = await fetch(`${API_URL}/machinery-orders?email=${encodeURIComponent(userEmail)}`);
          const data = await res.json();
          if (res.ok && data.success && Array.isArray(data.data)) {
            setEnquiriesCount(data.data.length);
          }
        } catch (e) {}
      }

      if (userId) {
        try {
          const res = await fetch(`${API_URL}/addresses?userId=${encodeURIComponent(userId)}`);
          const data = await res.json();
          if (res.ok && data.success && Array.isArray(data.data)) {
            setAddressesCount(data.data.length);
          }
        } catch (e) {}
      }
    };

    fetchSidebarCounts();
  }, [currentUser]);

  // Fetch the active order details
  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setError("Invalid order reference.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        // 1. Direct fetch from backend /api/orders/:id
        const res = await fetch(`${API_URL}/orders/${encodeURIComponent(orderId)}`);
        const data = await res.json();

        if (res.ok && data.success && data.data) {
          setOrder(data.data);
          // If user info is attached to order and not logged in, adopt it
          if (!currentUser && data.data.user) {
            setCurrentUser(data.data.user);
          }
          setLoading(false);
          return;
        }

        // 2. Fallback: Search in user's full orders list if direct lookup failed
        const userEmail = currentUser?.email || "";
        const allRes = await fetch(`${API_URL}/orders?userEmail=${encodeURIComponent(userEmail)}`);
        const allData = await allRes.json();

        if (allRes.ok && allData.success && Array.isArray(allData.data)) {
          const match = allData.data.find(
            (o) => o.orderId === orderId || o._id === orderId || o.id === orderId
          );
          if (match) {
            setOrder(match);
            setLoading(false);
            return;
          }
        }

        throw new Error(data.message || "Order not found");
      } catch (err) {
        console.error("Error fetching order details:", err);
        setError("We could not locate this order. It may have been moved or removed.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const handleDownloadPdf = async () => {
    if (!order) return;
    try {
      setDownloadingPdf(true);
      await downloadOrderInvoicePdf(order);
    } catch (e) {
      console.error("PDF generation error:", e);
      alert("Could not generate PDF invoice. Please try again.");
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("rhinco_user");
    localStorage.removeItem("rhinco_token");
    window.dispatchEvent(new CustomEvent("rhinco_auth_updated", { detail: null }));
    navigate("/login");
  };

  const userInitial = (currentUser?.name || order?.user?.name || "U").charAt(0).toUpperCase();
  const userName = currentUser?.name || order?.user?.name || order?.deliveryAddress?.name || "Farmer Account";
  const userEmail = currentUser?.email || order?.user?.email || "customer@rhinco.in";
  const userRole = currentUser?.role || "Farmer";

  return (
    <div className="OrderDetailsPage">
      <div className="OrderDetailsContainer">

        {/* ==================== LEFT SIDEBAR ==================== */}
        <aside className="OrderDetailsSidebar">
          <div className="OrderDetailsUserCard">
            <div className="OrderDetailsAvatarWrap">{userInitial}</div>
            <h3 className="OrderDetailsUserName">{userName}</h3>
            <p className="OrderDetailsUserEmail">{userEmail}</p>
            <span className="OrderDetailsRoleBadge">
              {userRole} Account
            </span>
          </div>

          <nav className="OrderDetailsNav">
            {/* 1. My Profile */}
            <Link
              to="/account?tab=profile"
              className="OrderDetailsNavItem"
            >
              <div className="OrderDetailsNavItemLeft">
                <User size={18} className="OrderDetailsNavIcon" />
                <span>My Profile</span>
              </div>
              <ChevronRight size={16} />
            </Link>

            {/* 2. My Orders - ACTIVE */}
            <Link
              to="/account?tab=orders"
              className="OrderDetailsNavItem active"
            >
              <div className="OrderDetailsNavItemLeft">
                <Package size={18} className="OrderDetailsNavIcon" />
                <span>My Orders</span>
              </div>
              <ChevronRight size={16} />
            </Link>

            {/* 3. My Address */}
            <Link
              to="/account?tab=address"
              className="OrderDetailsNavItem"
            >
              <div className="OrderDetailsNavItemLeft">
                <MapPin size={18} className="OrderDetailsNavIcon" />
                <span>My Address</span>
              </div>
              <ChevronRight size={16} />
            </Link>

            {/* 4. Machinery Enquiries */}
            <Link
              to="/account?tab=enquiries"
              className="OrderDetailsNavItem"
            >
              <div className="OrderDetailsNavItemLeft">
                <Tractor size={18} className="OrderDetailsNavIcon" />
                <span>Machinery Enquiries</span>
              </div>
              <ChevronRight size={16} />
            </Link>

            {/* 5. Help Center */}
            <Link
              to="/account?tab=help"
              className="OrderDetailsNavItem"
            >
              <div className="OrderDetailsNavItemLeft">
                <HelpCircle size={18} className="OrderDetailsNavIcon" />
                <span>Help Center</span>
              </div>
              <ChevronRight size={16} />
            </Link>
          </nav>

          <div className="OrderDetailsSignOutWrap">
            <button type="button" onClick={handleLogout} className="OrderDetailsSignOutBtn">
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* ==================== RIGHT CONTENT PANEL ==================== */}
        <main className="OrderDetailsContent">
          {loading ? (
            <div className="OrderDetailsStateBox">
              <div className="OrderDetailsSpinner" />
              <h3>Loading order details...</h3>
              <p>Retrieving shipment status and invoice information...</p>
            </div>
          ) : error || !order ? (
            <div className="OrderDetailsStateBox">
              <Package size={52} color="#94a3b8" />
              <h3>Order Not Found</h3>
              <p>{error || `We could not find an order matching "${orderId}".`}</p>
              <div style={{ marginTop: "18px", display: "flex", gap: "12px", justifyContent: "center" }}>
                <button
                  type="button"
                  onClick={() => navigate("/account?tab=orders")}
                  className="OrderDetailsPrimaryBtn"
                >
                  <ArrowLeft size={16} /> Back to My Orders
                </button>
                <Link to="/products" className="OrderDetailsSecondaryBtn">
                  Browse Products
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* BREADCRUMB & BACK BUTTON */}
              <div className="OrderDetailsNavRow">
                <nav className="OrderDetailsBreadcrumb" aria-label="Breadcrumb">
                  <Link to="/">Home</Link>
                  <ChevronRight size={14} className="OrderDetailsBreadcrumbArrow" />
                  <Link to="/account?tab=orders">My Account</Link>
                  <ChevronRight size={14} className="OrderDetailsBreadcrumbArrow" />
                  <Link to="/account?tab=orders">Orders</Link>
                  <ChevronRight size={14} className="OrderDetailsBreadcrumbArrow" />
                  <span className="OrderDetailsBreadcrumbCurrent">
                    #{order.orderId || order._id}
                  </span>
                </nav>

                <button
                  type="button"
                  onClick={() => navigate("/account?tab=orders")}
                  className="OrderDetailsBackBtn"
                >
                  <ArrowLeft size={15} />
                  <span>Back to All Orders</span>
                </button>
              </div>

              {/* ORDER HERO CARD */}
              {(() => {
                const orderRef = order.orderId || order._id || "ORDER";
                const orderStatus = order.orderStatus || order.statusText || order.status || "Confirmed";
                const statusLower = String(orderStatus).toLowerCase().replace(/\s+/g, "");

                const isDelivered = orderStatus === "Delivered";
                const isOutForDelivery = ["Out for Delivery", "Delivered"].includes(orderStatus);
                const isShipped = ["Shipped", "Dispatched", "Out for Delivery", "Delivered"].includes(orderStatus);

                const orderDate = order.createdAt
                  ? new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : order.date || "Recent";

                const totalAmount = Number(order.totalAmount || order.total || 0);
                const subtotal = Number(order.subtotal || totalAmount);
                const discount = Number(order.discount || 0);

                return (
                  <>
                    <div className="OrderDetailsHeroCard">
                      <div className="OrderDetailsHeroLeft">
                        <div className="OrderDetailsHeroTitleRow">
                          <h1 className="OrderDetailsTitle">Order #{orderRef}</h1>
                          <span className={`OrderDetailsStatusBadge ${statusLower}`}>
                            {orderStatus}
                          </span>
                          <span className="OrderDetailsPaymentBadge">
                            {order.paymentStatus === "paid" ? "Paid via Razorpay" : (order.paymentMethod || "Online Payment")}
                          </span>
                        </div>

                        <div className="OrderDetailsMetaRow">
                          <span className="OrderDetailsMetaItem">
                            <Clock size={14} /> Placed on {orderDate}
                          </span>
                          {order.invoiceNumber && (
                            <>
                              <span className="OrderDetailsMetaSep">•</span>
                              <span className="OrderDetailsMetaItem">
                                <FileText size={14} /> Invoice #{order.invoiceNumber}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="OrderDetailsHeroRight">
                        {isDelivered && (
                          <button
                            type="button"
                            onClick={handleDownloadPdf}
                            disabled={downloadingPdf}
                            className="OrderDetailsInvoiceBtn"
                            title="Download Official Tax Invoice PDF with Company Seal"
                          >
                            <FileText size={16} />
                            <span>{downloadingPdf ? "Generating PDF..." : "Download Invoice (PDF)"}</span>
                          </button>
                        )}

                        <a
                          href={`tel:${HELPLINE_PHONE.replace(/\s+/g, "")}`}
                          className="OrderDetailsHelplineBtn"
                          title="Call 24/7 Farmer Helpline"
                        >
                          <Phone size={15} />
                          <span>Need Help?</span>
                        </a>
                      </div>
                    </div>

                    {/* SHIPMENT PROGRESS STEPPER */}
                    <div className="OrderDetailsTrackerCard">
                      <div className="OrderDetailsTrackerHeader">
                        <div className="OrderDetailsTrackerHeading">
                          <Truck size={18} className="OrderDetailsTrackerIcon" />
                          <h3>Shipment Status & Farm Delivery Tracking</h3>
                        </div>
                        <span className="OrderDetailsTrackerUpdated">
                          Live carrier tracking
                        </span>
                      </div>

                      {/* Stepper Bar */}
                      <div className="OrderDetailsStepper">
                        <div className="OrderDetailsStep completed">
                          <div className="OrderDetailsStepCircle">
                            <CheckCircle2 size={16} />
                          </div>
                          <div className="OrderDetailsStepInfo">
                            <strong>Order Confirmed</strong>
                            <span>Payment Verified</span>
                          </div>
                        </div>

                        <div className={`OrderDetailsStepLine ${isShipped ? "active" : ""}`} />

                        <div className={`OrderDetailsStep ${isShipped ? "completed" : ""}`}>
                          <div className="OrderDetailsStepCircle">
                            <Truck size={16} />
                          </div>
                          <div className="OrderDetailsStepInfo">
                            <strong>Dispatched</strong>
                            <span>In Logistics Transit</span>
                          </div>
                        </div>

                        <div className={`OrderDetailsStepLine ${isOutForDelivery ? "active" : ""}`} />

                        <div className={`OrderDetailsStep ${isOutForDelivery ? "completed" : ""}`}>
                          <div className="OrderDetailsStepCircle">
                            <MapPin size={16} />
                          </div>
                          <div className="OrderDetailsStepInfo">
                            <strong>Out for Delivery</strong>
                            <span>With District Agent</span>
                          </div>
                        </div>

                        <div className={`OrderDetailsStepLine ${isDelivered ? "active" : ""}`} />

                        <div className={`OrderDetailsStep ${isDelivered ? "completed" : ""}`}>
                          <div className="OrderDetailsStepCircle">
                            <Package size={16} />
                          </div>
                          <div className="OrderDetailsStepInfo">
                            <strong>Delivered</strong>
                            <span>Handed to Farmer</span>
                          </div>
                        </div>
                      </div>

                      {/* Live Callouts */}
                      {isShipped && !isOutForDelivery && !isDelivered && (
                        <div className="OrderDetailsLiveBox in-transit">
                          <div className="OrderDetailsLiveBoxHeader">
                            <Truck size={17} />
                            <span>Shipment Dispatched & In Transit</span>
                          </div>
                          <div className="OrderDetailsLiveGrid">
                            <div>
                              <label>Current Logistics Hub:</label>
                              <strong>{order.currentCourierHub || order.currentHub || "Central Logistics Hub"}</strong>
                            </div>
                            <div>
                              <label>Expected Delivery Date:</label>
                              <strong className="text-green">{order.expectedDeliveryDate || "Within 2-3 business days"}</strong>
                            </div>
                            <div>
                              <label>Carrier Tracking ID:</label>
                              <strong className="font-mono">{order.trackingId || "RHN-EXP-IN-TRANSIT"}</strong>
                            </div>
                            <div>
                              <label>Courier Partner:</label>
                              <strong>{order.courierPartner || "Rhinco Express Logistics"}</strong>
                            </div>
                          </div>
                        </div>
                      )}

                      {isOutForDelivery && !isDelivered && (
                        <div className="OrderDetailsLiveBox out-for-delivery">
                          <div className="OrderDetailsLiveBoxHeader">
                            <MapPin size={17} />
                            <span>Order Out for Farm Delivery</span>
                          </div>
                          <div className="OrderDetailsLiveGrid">
                            <div>
                              <label>Delivery Agent Phone:</label>
                              {order.deliveryAgentNumber || order.agentNo ? (
                                <a href={`tel:${order.deliveryAgentNumber || order.agentNo}`} className="agent-tel-link">
                                  <Phone size={13} /> {order.deliveryAgentNumber || order.agentNo}
                                </a>
                              ) : (
                                <strong>+91 98765 43210 (Field Dispatch)</strong>
                              )}
                            </div>
                            <div>
                              <label>Current Local Hub:</label>
                              <strong>{order.currentHub || order.currentCourierHub || "Local District Hub"}</strong>
                            </div>
                            <div>
                              <label>Delivery Window:</label>
                              <strong className="text-green">{order.dateOfDelivery || order.expectedDeliveryDate || "Today"}</strong>
                            </div>
                            <div>
                              <label>Tracking Number:</label>
                              <strong className="font-mono">{order.trackingId || "RHN-LOCAL-DISPATCH"}</strong>
                            </div>
                          </div>
                        </div>
                      )}

                      {isDelivered && (
                        <div className="OrderDetailsLiveBox delivered">
                          <div className="OrderDetailsLiveBoxHeader">
                            <CheckCircle2 size={17} />
                            <span>Successfully Delivered to Destination Farm</span>
                          </div>
                          <div className="OrderDetailsDeliveredMeta">
                            <p>
                              Your equipment shipment has been received and verified. The official Tax Invoice is ready with full warranty documentation.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* MAIN TWO-COLUMN SECTION */}
                    <div className="OrderDetailsMainGrid">
                      {/* LEFT: ITEMS */}
                      <div className="OrderDetailsLeftCol">
                        <div className="OrderDetailsSectionCard">
                          <div className="OrderDetailsSectionCardHeader">
                            <div className="OrderDetailsSectionCardTitle">
                              <Package size={18} />
                              <h3>Ordered Items ({(order.items || []).length})</h3>
                            </div>
                            <span className="OrderDetailsItemCountHint">
                              All OEM inspected implements
                            </span>
                          </div>

                          <div className="OrderDetailsItemsList">
                            {(order.items || []).map((item, idx) => {
                              const itemImg =
                                item.image ||
                                item.primaryImage ||
                                item.img ||
                                (Array.isArray(item.images) && item.images[0]) ||
                                item.featuredImage ||
                                "";
                              const resolvedImg = resolveImageUrl(itemImg, "/placeholder.png");
                              const itemPrice = Number(item.price || 0);
                              const itemQty = Number(item.quantity || 1);
                              const lineTotal = itemPrice * itemQty;
                              const itemTitle = item.title || item.name || "Agricultural Implement";
                              const itemCategory = item.category || item.type || "Implement";
                              const productSlug = toProductSlug(itemTitle);

                              return (
                                <div className="OrderDetailsItemRow" key={idx}>
                                  <div className="OrderDetailsItemMedia">
                                    <img
                                      src={resolvedImg}
                                      alt={itemTitle}
                                      className="OrderDetailsItemImg"
                                      onError={(e) => {
                                        e.currentTarget.onerror = null;
                                        e.currentTarget.src = "/placeholder.png";
                                      }}
                                    />
                                  </div>

                                  <div className="OrderDetailsItemDetails">
                                    <span className="OrderDetailsItemCat">{itemCategory}</span>
                                    <h4 className="OrderDetailsItemTitle">
                                      <Link to={`/product/${productSlug}`}>{itemTitle}</Link>
                                    </h4>
                                    <div className="OrderDetailsItemPricing">
                                      <span>
                                        ₹{itemPrice.toLocaleString("en-IN")} × {itemQty} Unit{itemQty > 1 ? "s" : ""}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="OrderDetailsItemTotalCol">
                                    <strong className="OrderDetailsItemLineTotal">
                                      ₹{lineTotal.toLocaleString("en-IN")}
                                    </strong>
                                    <Link
                                      to={`/product/${productSlug}`}
                                      className="OrderDetailsBuyAgainLink"
                                    >
                                      View Product →
                                    </Link>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Guarantee banner */}
                        <div className="OrderDetailsGuaranteeBox">
                          <ShieldCheck size={28} className="OrderDetailsGuaranteeIcon" />
                          <div>
                            <strong>OEM Factory Certified Equipment</strong>
                            <p>
                              Every implement dispatched through Rhinco undergoes multi-point quality check, certified for safety and compatibility with modern tractor HP ranges.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* RIGHT: ADDRESS & SUMMARY */}
                      <div className="OrderDetailsRightCol">
                        {/* Address */}
                        <div className="OrderDetailsSideCard">
                          <div className="OrderDetailsSideCardHeader">
                            <MapPin size={17} />
                            <h3>Delivery Address</h3>
                          </div>

                          {order.deliveryAddress ? (
                            <div className="OrderDetailsAddressBody">
                              <div className="OrderDetailsAddressNameRow">
                                <strong>{order.deliveryAddress.name || order.user?.name || "Customer"}</strong>
                                {order.deliveryAddress.type && (
                                  <span className="OrderDetailsAddressTypeTag">
                                    {order.deliveryAddress.type}
                                  </span>
                                )}
                              </div>

                              <p className="OrderDetailsAddressLines">
                                {order.deliveryAddress.village && <span>{order.deliveryAddress.village}, </span>}
                                {order.deliveryAddress.district && <span>{order.deliveryAddress.district}, </span>}
                                {order.deliveryAddress.state && <span>{order.deliveryAddress.state}</span>}
                                {order.deliveryAddress.pincode && <span> - {order.deliveryAddress.pincode}</span>}
                              </p>

                              <div className="OrderDetailsAddressContact">
                                <Phone size={14} />
                                <span>{order.deliveryAddress.phone || order.user?.phone || HELPLINE_PHONE}</span>
                              </div>
                            </div>
                          ) : (
                            <p className="OrderDetailsNoAddress">
                              Address registered with customer profile.
                            </p>
                          )}
                        </div>

                        {/* Payment summary */}
                        <div className="OrderDetailsSideCard">
                          <div className="OrderDetailsSideCardHeader">
                            <FileText size={17} />
                            <h3>Payment Summary</h3>
                          </div>

                          <div className="OrderDetailsSummaryRows">
                            <div className="OrderDetailsSummaryRow">
                              <span>Items Subtotal</span>
                              <strong>₹{subtotal.toLocaleString("en-IN")}</strong>
                            </div>

                            {discount > 0 && (
                              <div className="OrderDetailsSummaryRow discount">
                                <span>Discount Applied</span>
                                <strong>-₹{discount.toLocaleString("en-IN")}</strong>
                              </div>
                            )}

                            <div className="OrderDetailsSummaryRow">
                              <span>Farm Delivery / Freight</span>
                              <strong className="text-green">FREE</strong>
                            </div>

                            <div className="OrderDetailsSummaryRow">
                              <span>Estimated Taxes (GST)</span>
                              <span style={{ fontSize: "12px", color: "#64748b" }}>Included</span>
                            </div>

                            <div className="OrderDetailsSummaryDivider" />

                            <div className="OrderDetailsSummaryRow total">
                              <span>Total Amount Paid</span>
                              <strong className="OrderDetailsGrandTotal">
                                ₹{totalAmount.toLocaleString("en-IN")}
                              </strong>
                            </div>
                          </div>

                          <div className="OrderDetailsPaymentFooter">
                            <div className="OrderDetailsPaymentMethodBadge">
                              <span className="dot" />
                              <span>{order.paymentMethod || "Razorpay Secure Online"}</span>
                            </div>

                            {order.razorpayPaymentId && (
                              <span className="OrderDetailsRazorpayRef">
                                Ref: {order.razorpayPaymentId}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Helpline */}
                        <div className="OrderDetailsHelpCard">
                          <HelpCircle size={20} className="OrderDetailsHelpIcon" />
                          <div>
                            <h4>Need assistance with this order?</h4>
                            <p>Call our direct farm helpline or write to customer support.</p>
                            <div className="OrderDetailsHelpActions">
                              <a href={`tel:${HELPLINE_PHONE.replace(/\s+/g, "")}`}>
                                <Phone size={13} /> {HELPLINE_PHONE}
                              </a>
                              <a href={`mailto:${SUPPORT_EMAIL}`}>
                                <Mail size={13} /> Email Support
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default OrderDetails;
