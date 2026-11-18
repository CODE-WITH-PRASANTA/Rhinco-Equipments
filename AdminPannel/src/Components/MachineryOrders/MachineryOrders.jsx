import React, { useEffect, useMemo, useState } from "react";
import {
  FiTruck,
  FiSearch,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiEye,
  FiRefreshCw,
  FiMapPin,
  FiPhone,
  FiMail,
  FiUser,
  FiCalendar,
  FiDollarSign,
  FiX,
  FiFileText,
  FiTrash2,
  FiCheck,
  FiMessageSquare,
} from "react-icons/fi";
import "./MachineryOrders.css";
import { API_URL, BACKEND_URL, resolveImageUrl } from "../../utils/apiConfig";

const ENQUIRIES_API = `${API_URL}/enquiries`;

const MachineryOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [notice, setNotice] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(ENQUIRIES_API);
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.data)) {
        // Filter machinery enquiries / orders
        const machOrders = data.data.filter(
          (item) => !item.enquiryType || item.enquiryType === "Machinery Enquiry" || item.productOrEquipment
        );
        setOrders(machOrders);
      } else {
        setNotice(data.message || "Failed to load machinery orders");
      }
    } catch (err) {
      console.error("Error loading machinery orders:", err);
      setNotice("Could not connect to backend server on port 5000.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // Update status (New, Contacted, Pending, Resolved, Closed)
  const handleStatusChange = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`${ENQUIRIES_API}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOrders((prev) =>
          prev.map((o) => (o._id === id ? { ...o, status: newStatus } : o))
        );
        if (selectedOrder && selectedOrder._id === id) {
          setSelectedOrder((prev) => ({ ...prev, status: newStatus }));
        }
        setNotice(`Order status updated to ${newStatus}`);
        setTimeout(() => setNotice(""), 3000);
      } else {
        alert(data.message || "Could not update status");
      }
    } catch (err) {
      console.error("Status update error:", err);
      alert("Error updating order status");
    } finally {
      setUpdatingId(null);
    }
  };

  // Save admin notes
  const handleSaveNotes = async () => {
    if (!selectedOrder) return;
    setSavingNote(true);
    try {
      const res = await fetch(`${ENQUIRIES_API}/${selectedOrder._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: adminNote }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOrders((prev) =>
          prev.map((o) => (o._id === selectedOrder._id ? { ...o, notes: adminNote } : o))
        );
        setSelectedOrder((prev) => ({ ...prev, notes: adminNote }));
        setNotice("Dealer notes saved successfully!");
        setTimeout(() => setNotice(""), 3000);
      }
    } catch (err) {
      console.error("Error saving note:", err);
    } finally {
      setSavingNote(false);
    }
  };

  // Delete enquiry/order
  const handleDeleteOrder = async (id) => {
    if (!window.confirm("Are you sure you want to delete this machinery order inquiry?")) {
      return;
    }
    try {
      const res = await fetch(`${ENQUIRIES_API}/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOrders((prev) => prev.filter((o) => o._id !== id));
        if (selectedOrder && selectedOrder._id === id) {
          setSelectedOrder(null);
        }
        setNotice("Machinery order inquiry deleted.");
        setTimeout(() => setNotice(""), 3000);
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const openDetails = (order) => {
    setSelectedOrder(order);
    setAdminNote(order.notes || "");
  };

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchStatus =
        statusFilter === "All" ||
        (o.status || "New").toLowerCase() === statusFilter.toLowerCase();

      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        (o.productOrEquipment || "").toLowerCase().includes(q) ||
        (o.name || "").toLowerCase().includes(q) ||
        (o.phone || "").toLowerCase().includes(q) ||
        (o.email || "").toLowerCase().includes(q) ||
        (o.location || "").toLowerCase().includes(q) ||
        (o.message || "").toLowerCase().includes(q);

      return matchStatus && matchSearch;
    });
  }, [orders, statusFilter, search]);

  // Counts for KPI tabs
  const counts = useMemo(() => {
    return {
      all: orders.length,
      new: orders.filter((o) => (o.status || "New").toLowerCase() === "new").length,
      contacted: orders.filter((o) => (o.status || "").toLowerCase() === "contacted").length,
      pending: orders.filter((o) => (o.status || "").toLowerCase() === "pending").length,
      resolved: orders.filter((o) => (o.status || "").toLowerCase() === "resolved").length,
      closed: orders.filter((o) => (o.status || "").toLowerCase() === "closed").length,
    };
  }, [orders]);

  return (
    <div className="MachineryOrdersPage">
      {/* Top Banner Header */}
      <div className="MachineryOrdersHeader">
        <div>
          <div className="MachineryOrdersBadge">
            <FiTruck size={15} />
            <span>DIRECT DEALER LEADS & MACHINERY INQUIRIES</span>
          </div>
          <h1>Machinery Orders & Quotes</h1>
          <p>
            Real customer enquiries submitted via "Contact Dealer" from the agricultural machinery catalog.
          </p>
        </div>

        <button className="MachineryOrdersRefreshBtn" onClick={loadOrders} disabled={loading}>
          <FiRefreshCw className={loading ? "spin" : ""} size={16} />
          <span>{loading ? "Refreshing..." : "Refresh Orders"}</span>
        </button>
      </div>

      {notice && (
        <div className="MachineryOrdersNotice">
          <FiCheck size={16} />
          <span>{notice}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="MachineryOrdersKpiGrid">
        <div className="MachineryOrdersKpiCard primary">
          <div className="MachineryOrdersKpiIcon">
            <FiTruck size={24} />
          </div>
          <div className="MachineryOrdersKpiContent">
            <span className="MachineryOrdersKpiLabel">Total Machinery Inquiries</span>
            <strong className="MachineryOrdersKpiValue">{counts.all}</strong>
          </div>
        </div>

        <div className="MachineryOrdersKpiCard new">
          <div className="MachineryOrdersKpiIcon">
            <FiClock size={24} />
          </div>
          <div className="MachineryOrdersKpiContent">
            <span className="MachineryOrdersKpiLabel">New / Uncontacted</span>
            <strong className="MachineryOrdersKpiValue">{counts.new}</strong>
          </div>
        </div>

        <div className="MachineryOrdersKpiCard contacted">
          <div className="MachineryOrdersKpiIcon">
            <FiPhone size={24} />
          </div>
          <div className="MachineryOrdersKpiContent">
            <span className="MachineryOrdersKpiLabel">Contacted / In Discussion</span>
            <strong className="MachineryOrdersKpiValue">{counts.contacted}</strong>
          </div>
        </div>

        <div className="MachineryOrdersKpiCard resolved">
          <div className="MachineryOrdersKpiIcon">
            <FiCheckCircle size={24} />
          </div>
          <div className="MachineryOrdersKpiContent">
            <span className="MachineryOrdersKpiLabel">Orders Closed / Resolved</span>
            <strong className="MachineryOrdersKpiValue">{counts.resolved}</strong>
          </div>
        </div>
      </div>

      {/* Search & Tabs Toolbar */}
      <div className="MachineryOrdersToolbar">
        <div className="MachineryOrdersTabs">
          {[
            { id: "All", label: "All Inquiries", count: counts.all },
            { id: "New", label: "New", count: counts.new },
            { id: "Contacted", label: "Contacted", count: counts.contacted },
            { id: "Pending", label: "Pending", count: counts.pending },
            { id: "Resolved", label: "Resolved", count: counts.resolved },
            { id: "Closed", label: "Closed", count: counts.closed },
          ].map((tab) => (
            <button
              key={tab.id}
              className={`MachineryOrdersTab ${statusFilter === tab.id ? "active" : ""}`}
              onClick={() => setStatusFilter(tab.id)}
            >
              <span>{tab.label}</span>
              <span className="MachineryOrdersTabCount">{tab.count}</span>
            </button>
          ))}
        </div>

        <div className="MachineryOrdersSearchBox">
          <FiSearch size={16} />
          <input
            type="text"
            placeholder="Search by customer, machine, phone, location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="MachineryOrdersClearSearch" onClick={() => setSearch("")}>
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Table Container */}
      <div className="MachineryOrdersTableWrap">
        {loading ? (
          <div className="MachineryOrdersEmptyState">
            <div className="MachineryOrdersSpinner"></div>
            <p>Loading real machinery orders from MongoDB database...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="MachineryOrdersEmptyState">
            <FiTruck size={48} color="#94a3b8" />
            <h3>No Machinery Orders Found</h3>
            <p>
              {search || statusFilter !== "All"
                ? "No inquiries match your current filters. Try resetting search or tab."
                : "No customer machinery inquiries have been submitted yet. Submissions from 'Contact Dealer' on the frontend will appear here instantly."}
            </p>
          </div>
        ) : (
          <table className="MachineryOrdersTable">
            <thead>
              <tr>
                <th>Equipment / Machine</th>
                <th>Customer Details</th>
                <th>Location / Farm</th>
                <th>Inquiry Date</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => {
                const machineName = order.productOrEquipment || order.machineName || "Machinery Equipment";
                const dateStr = order.createdAt
                  ? new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Recent";

                const currentStatus = order.status || "New";

                return (
                  <tr key={order._id}>
                    <td>
                      <div className="MachineryOrdersMachineCell">
                        {order.machineImage ? (
                          <img
                            src={order.machineImage}
                            alt={machineName}
                            className="MachineryOrdersMachineThumb"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="MachineryOrdersMachineIcon">
                            <FiTruck size={20} />
                          </div>
                        )}
                        <div>
                          <strong className="MachineryOrdersMachineTitle">{machineName}</strong>
                          {order.price && (
                            <span className="MachineryOrdersMachinePrice">{order.price}</span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="MachineryOrdersCustomerCell">
                        <strong className="MachineryOrdersCustomerName">{order.name}</strong>
                        <div className="MachineryOrdersContactRow">
                          <a href={`tel:${order.phone}`} className="MachineryOrdersPhoneLink">
                            <FiPhone size={12} />
                            <span>{order.phone}</span>
                          </a>
                        </div>
                        {order.email && (
                          <div className="MachineryOrdersContactRow">
                            <a href={`mailto:${order.email}`} className="MachineryOrdersEmailLink">
                              <FiMail size={12} />
                              <span>{order.email}</span>
                            </a>
                          </div>
                        )}
                      </div>
                    </td>

                    <td>
                      <div className="MachineryOrdersLocationCell">
                        <FiMapPin size={14} color="#166534" />
                        <span>{order.location || "Location not provided"}</span>
                      </div>
                    </td>

                    <td>
                      <div className="MachineryOrdersDateCell">
                        <FiCalendar size={13} />
                        <span>{dateStr}</span>
                      </div>
                    </td>

                    <td>
                      <select
                        className={`MachineryOrdersStatusSelect ${currentStatus.toLowerCase()}`}
                        value={currentStatus}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        disabled={updatingId === order._id}
                      >
                        <option value="New">● New</option>
                        <option value="Contacted">● Contacted</option>
                        <option value="Pending">● Pending</option>
                        <option value="Resolved">● Resolved</option>
                        <option value="Closed">● Closed</option>
                      </select>
                    </td>

                    <td style={{ textAlign: "right" }}>
                      <div className="MachineryOrdersActionBtns">
                        <button
                          className="MachineryOrdersViewBtn"
                          onClick={() => openDetails(order)}
                          title="View Inquiry Details"
                        >
                          <FiEye size={15} />
                          <span>View</span>
                        </button>

                        <button
                          className="MachineryOrdersDeleteBtn"
                          onClick={() => handleDeleteOrder(order._id)}
                          title="Delete Order"
                        >
                          <FiTrash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* DETAIL MODAL */}
      {selectedOrder && (
        <div className="MachineryOrdersModalOverlay" onClick={() => setSelectedOrder(null)}>
          <div className="MachineryOrdersModal" onClick={(e) => e.stopPropagation()}>
            <div className="MachineryOrdersModalHeader">
              <div>
                <span className="MachineryOrdersModalTag">MACHINERY DEALER INQUIRY</span>
                <h2>{selectedOrder.productOrEquipment || "Machinery Order"}</h2>
                <span className="MachineryOrdersModalDate">
                  Inquiry submitted on{" "}
                  {selectedOrder.createdAt
                    ? new Date(selectedOrder.createdAt).toLocaleString("en-IN")
                    : "Recent"}
                </span>
              </div>
              <button
                className="MachineryOrdersModalClose"
                onClick={() => setSelectedOrder(null)}
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="MachineryOrdersModalBody">
              {/* Left Column: Equipment & Inquiry */}
              <div className="MachineryOrdersModalCol">
                <div className="MachineryOrdersSectionBox">
                  <h4 className="MachineryOrdersSectionTitle">
                    <FiTruck size={16} />
                    <span>Equipment Information</span>
                  </h4>

                  {selectedOrder.machineImage && (
                    <div className="MachineryOrdersModalImgWrap">
                      <img
                        src={selectedOrder.machineImage}
                        alt={selectedOrder.productOrEquipment}
                      />
                    </div>
                  )}

                  <div className="MachineryOrdersInfoRow">
                    <span className="label">Product / Model:</span>
                    <strong className="val">{selectedOrder.productOrEquipment}</strong>
                  </div>

                  {selectedOrder.price && (
                    <div className="MachineryOrdersInfoRow">
                      <span className="label">Pricing / Subsidy:</span>
                      <strong className="val price">{selectedOrder.price}</strong>
                    </div>
                  )}

                  <div className="MachineryOrdersInfoRow">
                    <span className="label">Enquiry Type:</span>
                    <span className="val">{selectedOrder.enquiryType || "Machinery Enquiry"}</span>
                  </div>

                  {selectedOrder.subject && (
                    <div className="MachineryOrdersInfoRow">
                      <span className="label">Subject:</span>
                      <span className="val">{selectedOrder.subject}</span>
                    </div>
                  )}
                </div>

                <div className="MachineryOrdersSectionBox">
                  <h4 className="MachineryOrdersSectionTitle">
                    <FiMessageSquare size={16} />
                    <span>Customer Requirement / Message</span>
                  </h4>
                  <div className="MachineryOrdersMessageBox">
                    {selectedOrder.message || "No specific message provided by customer."}
                  </div>
                </div>
              </div>

              {/* Right Column: Customer Info & Status Action */}
              <div className="MachineryOrdersModalCol">
                <div className="MachineryOrdersSectionBox">
                  <h4 className="MachineryOrdersSectionTitle">
                    <FiUser size={16} />
                    <span>Customer Contact Details</span>
                  </h4>

                  <div className="MachineryOrdersInfoRow">
                    <span className="label">Name:</span>
                    <strong className="val">{selectedOrder.name}</strong>
                  </div>

                  <div className="MachineryOrdersInfoRow">
                    <span className="label">Phone:</span>
                    <a href={`tel:${selectedOrder.phone}`} className="val phone">
                      <FiPhone size={13} /> {selectedOrder.phone}
                    </a>
                  </div>

                  {selectedOrder.email && (
                    <div className="MachineryOrdersInfoRow">
                      <span className="label">Email:</span>
                      <a href={`mailto:${selectedOrder.email}`} className="val email">
                        <FiMail size={13} /> {selectedOrder.email}
                      </a>
                    </div>
                  )}

                  <div className="MachineryOrdersInfoRow">
                    <span className="label">Location / Farm:</span>
                    <span className="val">{selectedOrder.location || "Not specified"}</span>
                  </div>

                  <div className="MachineryOrdersCallBar">
                    <a
                      href={`tel:${selectedOrder.phone}`}
                      className="MachineryOrdersDirectCallBtn"
                    >
                      <FiPhone size={15} />
                      <span>Call Customer Now</span>
                    </a>
                    {selectedOrder.email && (
                      <a
                        href={`mailto:${selectedOrder.email}?subject=Regarding your enquiry for ${selectedOrder.productOrEquipment}`}
                        className="MachineryOrdersDirectMailBtn"
                      >
                        <FiMail size={15} />
                        <span>Send Email</span>
                      </a>
                    )}
                  </div>
                </div>

                <div className="MachineryOrdersSectionBox">
                  <h4 className="MachineryOrdersSectionTitle">
                    <FiClock size={16} />
                    <span>Update Status & Dealer Notes</span>
                  </h4>

                  <div style={{ marginBottom: "14px" }}>
                    <label style={{ fontSize: "12px", color: "#64748b", fontWeight: 600, display: "block", marginBottom: "6px" }}>
                      Inquiry Lead Status:
                    </label>
                    <select
                      className={`MachineryOrdersStatusSelect ${(selectedOrder.status || "New").toLowerCase()}`}
                      style={{ width: "100%", padding: "10px 14px", fontSize: "14px" }}
                      value={selectedOrder.status || "New"}
                      onChange={(e) => handleStatusChange(selectedOrder._id, e.target.value)}
                    >
                      <option value="New">● New (Awaiting Contact)</option>
                      <option value="Contacted">● Contacted (Dealer called customer)</option>
                      <option value="Pending">● Pending (Awaiting quotation / subsidy approval)</option>
                      <option value="Resolved">● Resolved (Order / Deal finalized)</option>
                      <option value="Closed">● Closed (Canceled / No interest)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: "12px", color: "#64748b", fontWeight: 600, display: "block", marginBottom: "6px" }}>
                      Internal Dealer Notes:
                    </label>
                    <textarea
                      rows={3}
                      value={adminNote}
                      onChange={(e) => setAdminNote(e.target.value)}
                      placeholder="Add notes e.g., Quotation sent via WhatsApp, Farm inspection scheduled..."
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                        fontSize: "13px",
                        resize: "vertical",
                        boxSizing: "border-box",
                      }}
                    />
                    <button
                      type="button"
                      className="MachineryOrdersSaveNoteBtn"
                      onClick={handleSaveNotes}
                      disabled={savingNote}
                    >
                      {savingNote ? "Saving Notes..." : "Save Dealer Notes"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MachineryOrders;
