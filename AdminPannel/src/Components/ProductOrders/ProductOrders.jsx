import React, { useEffect, useMemo, useState } from "react";
import {
  FiShoppingCart,
  FiSearch,
  FiCheckCircle,
  FiClock,
  FiTruck,
  FiXCircle,
  FiEye,
  FiRefreshCw,
  FiMapPin,
  FiPhone,
  FiMail,
  FiUser,
  FiCalendar,
  FiCheck,
  FiPackage,
  FiDollarSign,
  FiX,
  FiFileText,
} from "react-icons/fi";
import "./ProductOrders.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const ORDERS_API = `${API_URL}/orders`;

const formatINR = (num) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(num || 0);
};

const ProductOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [notice, setNotice] = useState("");

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(ORDERS_API);
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.data)) {
        // Strict filter: ONLY successful paid orders
        setOrders(data.data.filter((o) => o.paymentStatus === "paid"));
      } else {
        setNotice(data.message || "Failed to load orders");
      }
    } catch (err) {
      console.error("Error loading orders:", err);
      setNotice("Could not connect to backend server on port 5000.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // Update order fulfillment status
  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`${ORDERS_API}/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOrders((prev) =>
          prev.map((o) => (o.orderId === orderId || o._id === orderId ? data.data : o))
        );
        if (selectedOrder && (selectedOrder.orderId === orderId || selectedOrder._id === orderId)) {
          setSelectedOrder(data.data);
        }
        setNotice(`Order #${orderId} status updated to ${newStatus}`);
        setTimeout(() => setNotice(""), 3000);
      } else {
        alert(data.message || "Could not update order status");
      }
    } catch (err) {
      console.error("Status update error:", err);
      alert("Error updating order status");
    } finally {
      setUpdatingId(null);
    }
  };

  // Filtered orders based on search and status tabs
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchStatus =
        statusFilter === "All" || o.orderStatus === statusFilter;

      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        (o.orderId || "").toLowerCase().includes(q) ||
        (o.razorpayPaymentId || "").toLowerCase().includes(q) ||
        (o.user?.name || "").toLowerCase().includes(q) ||
        (o.user?.phone || "").toLowerCase().includes(q) ||
        (o.user?.email || "").toLowerCase().includes(q) ||
        (o.deliveryAddress?.name || "").toLowerCase().includes(q) ||
        (o.deliveryAddress?.district || "").toLowerCase().includes(q) ||
        (o.items || []).some((item) =>
          (item.title || "").toLowerCase().includes(q)
        );

      return matchStatus && matchSearch;
    });
  }, [orders, statusFilter, search]);

  // Statistics
  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);
    const confirmed = orders.filter((o) => o.orderStatus === "Confirmed").length;
    const processing = orders.filter((o) => o.orderStatus === "Processing").length;
    const delivered = orders.filter((o) => o.orderStatus === "Delivered").length;
    return {
      total: orders.length,
      revenue: totalRevenue,
      active: confirmed + processing,
      delivered,
    };
  }, [orders]);

  const getStatusBadge = (status) => {
    switch (status) {
      case "Confirmed":
        return <span className="ProductOrders-badge confirmed"><FiCheckCircle size={12} /> Confirmed</span>;
      case "Processing":
        return <span className="ProductOrders-badge processing"><FiClock size={12} /> Processing</span>;
      case "Dispatched":
        return <span className="ProductOrders-badge dispatched"><FiTruck size={12} /> Dispatched</span>;
      case "Delivered":
        return <span className="ProductOrders-badge delivered"><FiCheck size={12} /> Delivered</span>;
      case "Cancelled":
        return <span className="ProductOrders-badge cancelled"><FiXCircle size={12} /> Cancelled</span>;
      default:
        return <span className="ProductOrders-badge">{status}</span>;
    }
  };

  return (
    <div className="ProductOrders-page">
      {/* HEADER */}
      <div className="ProductOrders-header">
        <div className="ProductOrders-headerLeft">
          <div className="ProductOrders-headerIcon">
            <FiShoppingCart />
          </div>
          <div>
            <span className="ProductOrders-eyebrow">ORDER FULFILLMENT</span>
            <h1>Store Product Orders</h1>
            <p>
              Manage verified Razorpay paid customer orders for farm equipment and supplies.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={loadOrders}
          disabled={loading}
          className="ProductOrders-refreshBtn"
        >
          <FiRefreshCw className={loading ? "spin" : ""} />
          <span>Refresh Orders</span>
        </button>
      </div>

      {notice && (
        <div className="ProductOrders-notice">
          <FiCheckCircle size={16} />
          <span>{notice}</span>
        </div>
      )}

      {/* KPI METRIC CARDS */}
      <div className="ProductOrders-kpiGrid">
        <div className="ProductOrders-kpiCard">
          <div className="ProductOrders-kpiIcon green">
            <FiCheckCircle />
          </div>
          <div className="ProductOrders-kpiInfo">
            <span className="ProductOrders-kpiLabel">Total Paid Orders</span>
            <strong className="ProductOrders-kpiValue">{stats.total}</strong>
            <span className="ProductOrders-kpiSub">100% Verified Razorpay Payments</span>
          </div>
        </div>

        <div className="ProductOrders-kpiCard">
          <div className="ProductOrders-kpiIcon blue">
            <FiDollarSign />
          </div>
          <div className="ProductOrders-kpiInfo">
            <span className="ProductOrders-kpiLabel">Total Revenue (INR)</span>
            <strong className="ProductOrders-kpiValue">{formatINR(stats.revenue)}</strong>
            <span className="ProductOrders-kpiSub">Gross received across all orders</span>
          </div>
        </div>

        <div className="ProductOrders-kpiCard">
          <div className="ProductOrders-kpiIcon orange">
            <FiClock />
          </div>
          <div className="ProductOrders-kpiInfo">
            <span className="ProductOrders-kpiLabel">Pending Fulfillment</span>
            <strong className="ProductOrders-kpiValue">{stats.active}</strong>
            <span className="ProductOrders-kpiSub">Confirmed & In-Processing</span>
          </div>
        </div>

        <div className="ProductOrders-kpiCard">
          <div className="ProductOrders-kpiIcon emerald">
            <FiTruck />
          </div>
          <div className="ProductOrders-kpiInfo">
            <span className="ProductOrders-kpiLabel">Delivered Orders</span>
            <strong className="ProductOrders-kpiValue">{stats.delivered}</strong>
            <span className="ProductOrders-kpiSub">Successfully completed farm drop-offs</span>
          </div>
        </div>
      </div>

      {/* CONTROLS (SEARCH & STATUS TABS) */}
      <div className="ProductOrders-controlsCard">
        <div className="ProductOrders-searchWrap">
          <FiSearch className="ProductOrders-searchIcon" />
          <input
            type="text"
            placeholder="Search by Order ID, Razorpay ID, Customer Name, Phone, District..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ProductOrders-searchInput"
          />
          {search && (
            <button
              type="button"
              className="ProductOrders-searchClear"
              onClick={() => setSearch("")}
            >
              ✕
            </button>
          )}
        </div>

        <div className="ProductOrders-statusTabs">
          {["All", "Confirmed", "Processing", "Dispatched", "Delivered", "Cancelled"].map(
            (tab) => {
              const count =
                tab === "All"
                  ? orders.length
                  : orders.filter((o) => o.orderStatus === tab).length;

              return (
                <button
                  type="button"
                  key={tab}
                  className={`ProductOrders-tabBtn ${statusFilter === tab ? "active" : ""}`}
                  onClick={() => setStatusFilter(tab)}
                >
                  <span>{tab}</span>
                  <span className="ProductOrders-tabCount">{count}</span>
                </button>
              );
            }
          )}
        </div>
      </div>

      {/* ORDERS TABLE */}
      <div className="ProductOrders-tableCard">
        {loading && orders.length === 0 ? (
          <div className="ProductOrders-emptyState">
            <div className="ProductOrders-spinner" />
            <p>Loading verified orders from database...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="ProductOrders-emptyState">
            <FiPackage size={44} className="ProductOrders-emptyIcon" />
            <h3>No Orders Found</h3>
            <p>
              {search || statusFilter !== "All"
                ? "No paid orders match your current filters. Try resetting search."
                : "No successful paid orders have been placed yet. As customers complete Razorpay payments, they will appear here instantly."}
            </p>
          </div>
        ) : (
          <div className="ProductOrders-tableWrap">
            <table className="ProductOrders-table">
              <thead>
                <tr>
                  <th>Order ID & Date</th>
                  <th>Customer</th>
                  <th>Delivery Address</th>
                  <th>Products Purchased</th>
                  <th>Amount Paid</th>
                  <th>Order Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const dateStr = order.createdAt;
                  const formattedDate = dateStr
                    ? new Date(dateStr).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Recent";

                  return (
                    <tr key={order._id || order.orderId}>
                      {/* ORDER ID & DATE */}
                      <td>
                        <div className="ProductOrders-idWrap">
                          <strong className="ProductOrders-idText">
                            {order.orderId}
                          </strong>
                          <span className="ProductOrders-dateText">
                            <FiCalendar size={11} />
                            {formattedDate}
                          </span>
                        </div>
                      </td>

                      {/* CUSTOMER */}
                      <td>
                        <div className="ProductOrders-customerCell">
                          <strong className="ProductOrders-customerName">
                            {order.user?.name || order.deliveryAddress?.name || "Customer"}
                          </strong>
                          <span className="ProductOrders-customerPhone">
                            <FiPhone size={11} /> {order.user?.phone || order.deliveryAddress?.phone || "N/A"}
                          </span>
                          {order.user?.email && (
                            <span className="ProductOrders-customerEmail">
                              <FiMail size={11} /> {order.user.email}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* DELIVERY ADDRESS */}
                      <td>
                        <div className="ProductOrders-addressCell">
                          <span className="ProductOrders-addressType">
                            {order.deliveryAddress?.type || "Farm Delivery"}
                          </span>
                          <p className="ProductOrders-addressLine">
                            {order.deliveryAddress?.village}, {order.deliveryAddress?.district},{" "}
                            {order.deliveryAddress?.state} - <strong>{order.deliveryAddress?.pincode}</strong>
                          </p>
                        </div>
                      </td>

                      {/* PRODUCTS */}
                      <td>
                        <div className="ProductOrders-itemsCell">
                          <div className="ProductOrders-itemsThumbs">
                            {(order.items || []).slice(0, 3).map((item, idx) => (
                              <img
                                key={idx}
                                src={item.image || "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=100&q=80"}
                                alt={item.title}
                                className="ProductOrders-itemThumb"
                                title={`${item.title} (Qty: ${item.quantity})`}
                              />
                            ))}
                            {(order.items || []).length > 3 && (
                              <div className="ProductOrders-moreItems">
                                +{(order.items || []).length - 3}
                              </div>
                            )}
                          </div>
                          <span className="ProductOrders-itemsCount">
                            {(order.items || []).length} item(s) total
                          </span>
                        </div>
                      </td>

                      {/* AMOUNT PAID & RAZORPAY BADGE */}
                      <td>
                        <div className="ProductOrders-amountCell">
                          <strong className="ProductOrders-amountValue">
                            {formatINR(order.totalAmount)}
                          </strong>
                          <span className="ProductOrders-paidTag">
                            <FiCheck size={11} /> Paid (Razorpay)
                          </span>
                          <span
                            className="ProductOrders-rzpId"
                            title={order.razorpayPaymentId}
                          >
                            Ref: {order.razorpayPaymentId?.slice(-10) || "Success"}
                          </span>
                        </div>
                      </td>

                      {/* ORDER STATUS DROPDOWN */}
                      <td>
                        <div className="ProductOrders-statusCell">
                          {getStatusBadge(order.orderStatus)}
                          <select
                            value={order.orderStatus}
                            disabled={updatingId === order.orderId}
                            onChange={(e) =>
                              handleStatusChange(order.orderId, e.target.value)
                            }
                            className="ProductOrders-statusSelect"
                          >
                            <option value="Confirmed">Confirmed</option>
                            <option value="Processing">Processing</option>
                            <option value="Dispatched">Dispatched</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </div>
                      </td>

                      {/* ACTIONS */}
                      <td>
                        <button
                          type="button"
                          className="ProductOrders-viewBtn"
                          onClick={() => setSelectedOrder(order)}
                          title="View Order Details & Invoice"
                        >
                          <FiEye size={14} />
                          <span>Details</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ORDER DETAILS MODAL */}
      {selectedOrder && (
        <div
          className="ProductOrders-modalOverlay"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="ProductOrders-modal"
            onClick={(e) => e.stopPropagation()}
          >
            {/* MODAL HEADER */}
            <div className="ProductOrders-modalHeader">
              <div>
                <span className="ProductOrders-modalEyebrow">
                  ORDER DETAILS RECEIPT
                </span>
                <h2>{selectedOrder.orderId}</h2>
                <span className="ProductOrders-modalDate">
                  Placed on:{" "}
                  {new Date(selectedOrder.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <button
                type="button"
                className="ProductOrders-modalClose"
                onClick={() => setSelectedOrder(null)}
              >
                <FiX size={18} />
              </button>
            </div>

            {/* MODAL BODY */}
            <div className="ProductOrders-modalBody">
              {/* STATUS & PAYMENT ROW */}
              <div className="ProductOrders-modalSummaryRow">
                <div className="ProductOrders-modalSummaryBox">
                  <span className="ProductOrders-boxLabel">Payment Status</span>
                  <div className="ProductOrders-paidBadgeLarge">
                    <FiCheckCircle size={15} />
                    <span>PAID VIA RAZORPAY</span>
                  </div>
                  <span className="ProductOrders-paymentRef">
                    Payment ID: <strong>{selectedOrder.razorpayPaymentId}</strong>
                  </span>
                  <span className="ProductOrders-paymentRef">
                    Order ID: <strong>{selectedOrder.razorpayOrderId}</strong>
                  </span>
                </div>

                <div className="ProductOrders-modalSummaryBox">
                  <span className="ProductOrders-boxLabel">Fulfillment Status</span>
                  <div style={{ marginTop: "4px" }}>
                    {getStatusBadge(selectedOrder.orderStatus)}
                  </div>
                  <div style={{ marginTop: "10px" }}>
                    <label style={{ fontSize: "11px", color: "#64748b", display: "block", marginBottom: "4px" }}>
                      Change Status:
                    </label>
                    <select
                      value={selectedOrder.orderStatus}
                      onChange={(e) =>
                        handleStatusChange(selectedOrder.orderId, e.target.value)
                      }
                      className="ProductOrders-statusSelectLarge"
                    >
                      <option value="Confirmed">Confirmed</option>
                      <option value="Processing">Processing</option>
                      <option value="Dispatched">Dispatched</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* CUSTOMER & DELIVERY ADDRESS */}
              <div className="ProductOrders-modalInfoGrid">
                <div className="ProductOrders-modalInfoCard">
                  <h4>
                    <FiUser size={15} /> Customer Information
                  </h4>
                  <p>
                    <strong>Name:</strong>{" "}
                    {selectedOrder.user?.name || selectedOrder.deliveryAddress?.name}
                  </p>
                  <p>
                    <strong>Phone:</strong>{" "}
                    {selectedOrder.user?.phone || selectedOrder.deliveryAddress?.phone}
                  </p>
                  {selectedOrder.user?.email && (
                    <p>
                      <strong>Email:</strong> {selectedOrder.user.email}
                    </p>
                  )}
                </div>

                <div className="ProductOrders-modalInfoCard">
                  <h4>
                    <FiMapPin size={15} /> Delivery Address
                  </h4>
                  <span className="ProductOrders-addressTypeBadge">
                    {selectedOrder.deliveryAddress?.type || "Farm Delivery"}
                  </span>
                  <p className="ProductOrders-addressDetail">
                    {selectedOrder.deliveryAddress?.village},{" "}
                    {selectedOrder.deliveryAddress?.district},{" "}
                    {selectedOrder.deliveryAddress?.state} -{" "}
                    <strong>{selectedOrder.deliveryAddress?.pincode}</strong>
                  </p>
                </div>
              </div>

              {/* ITEMS LIST */}
              <div className="ProductOrders-modalItems">
                <h4>
                  <FiPackage size={15} /> Ordered Items ({selectedOrder.items?.length})
                </h4>
                <div className="ProductOrders-modalItemsList">
                  {(selectedOrder.items || []).map((item, idx) => (
                    <div key={idx} className="ProductOrders-modalItemRow">
                      <img
                        src={item.image || "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=120&q=80"}
                        alt={item.title}
                        className="ProductOrders-modalItemImg"
                      />
                      <div className="ProductOrders-modalItemDetails">
                        <strong>{item.title}</strong>
                        <span className="ProductOrders-modalItemCategory">
                          {item.category || "General Implement"}
                        </span>
                        <span className="ProductOrders-modalItemRate">
                          {formatINR(item.price)} × {item.quantity} Unit(s)
                        </span>
                      </div>
                      <div className="ProductOrders-modalItemTotal">
                        {formatINR((item.price || 0) * (item.quantity || 1))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* BILLING SUMMARY */}
              <div className="ProductOrders-modalBilling">
                <div className="ProductOrders-billingRow">
                  <span>Subtotal:</span>
                  <span>{formatINR(selectedOrder.subtotal || selectedOrder.totalAmount)}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="ProductOrders-billingRow discount">
                    <span>Discount Coupon ({selectedOrder.coupon || "Promotional"}):</span>
                    <span>- {formatINR(selectedOrder.discount)}</span>
                  </div>
                )}
                <div className="ProductOrders-billingRow">
                  <span>Farm Delivery / Shipping:</span>
                  <span style={{ color: "#166534", fontWeight: 700 }}>FREE Delivery</span>
                </div>
                <div className="ProductOrders-billingRow total">
                  <strong>Total Amount Paid:</strong>
                  <strong>{formatINR(selectedOrder.totalAmount)}</strong>
                </div>
              </div>
            </div>

            {/* MODAL FOOTER */}
            <div className="ProductOrders-modalFooter">
              <button
                type="button"
                className="ProductOrders-printBtn"
                onClick={() => window.print()}
              >
                <FiFileText size={15} />
                <span>Print Order / Receipt</span>
              </button>
              <button
                type="button"
                className="ProductOrders-closeBtn"
                onClick={() => setSelectedOrder(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductOrders;
