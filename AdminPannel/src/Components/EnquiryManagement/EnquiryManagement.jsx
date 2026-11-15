import React, { useEffect, useMemo, useState } from "react";
import {
  FiMail,
  FiSearch,
  FiFilter,
  FiPhone,
  FiUser,
  FiCalendar,
  FiMapPin,
  FiCheckCircle,
  FiClock,
  FiEye,
  FiTrash2,
  FiEdit3,
  FiPlus,
  FiX,
  FiSend,
  FiMessageSquare,
  FiTag,
  FiFileText,
  FiAlertCircle,
  FiCheck,
} from "react-icons/fi";
import "./EnquiryManagement.css";

const ENQUIRIES_API = "http://localhost:5000/api/enquiries";

const emptyEnquiryForm = () => ({
  name: "",
  email: "",
  phone: "",
  productOrEquipment: "",
  enquiryType: "Machinery Enquiry",
  location: "",
  subject: "",
  message: "",
  status: "New",
  notes: "",
});

const EnquiryManagement = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [statusTab, setStatusTab] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [notice, setNotice] = useState("");

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [form, setForm] = useState(emptyEnquiryForm());
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Load enquiries from MongoDB
  const loadEnquiries = async () => {
    setLoading(true);
    try {
      const res = await fetch(ENQUIRIES_API);
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.data)) {
        setEnquiries(data.data);
      }
    } catch (err) {
      console.error("Error loading enquiries:", err);
      setNotice("Could not load enquiries. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEnquiries();
  }, []);

  // Filter & Sort
  const filteredEnquiries = useMemo(() => {
    const q = search.trim().toLowerCase();

    return enquiries
      .filter((item) => {
        const matchesSearch =
          !q ||
          (item.name || "").toLowerCase().includes(q) ||
          (item.email || "").toLowerCase().includes(q) ||
          (item.phone || "").toLowerCase().includes(q) ||
          (item.productOrEquipment || "").toLowerCase().includes(q) ||
          (item.location || "").toLowerCase().includes(q) ||
          (item.message || "").toLowerCase().includes(q);

        const matchesType =
          typeFilter === "All Types" || item.enquiryType === typeFilter;

        const matchesStatus =
          statusTab === "All" || item.status === statusTab;

        return matchesSearch && matchesType && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === "oldest") {
          return new Date(a.createdAt) - new Date(b.createdAt);
        }
        if (sortBy === "name") {
          return (a.name || "").localeCompare(b.name || "");
        }
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
  }, [enquiries, search, typeFilter, statusTab, sortBy]);

  // KPI Metrics
  const totalCount = enquiries.length;
  const newCount = enquiries.filter((e) => e.status === "New").length;
  const contactedCount = enquiries.filter((e) => e.status === "Contacted").length;
  const resolvedCount = enquiries.filter((e) => e.status === "Resolved").length;

  // Status Change
  const handleStatusChange = async (item, newStatus) => {
    const id = item._id || item.id;
    try {
      const res = await fetch(`${ENQUIRIES_API}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update status.");
      }

      setNotice(`Enquiry status updated to ${newStatus}.`);
      await loadEnquiries();
      if (selectedEnquiry && (selectedEnquiry._id || selectedEnquiry.id) === id) {
        setSelectedEnquiry((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error("Status error:", err);
      setNotice(err.message || "Could not update status.");
    }
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setForm(emptyEnquiryForm());
    setEditingId(null);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (item) => {
    setForm({
      name: item.name || "",
      email: item.email || "",
      phone: item.phone || "",
      productOrEquipment: item.productOrEquipment || "",
      enquiryType: item.enquiryType || "Machinery Enquiry",
      location: item.location || "",
      subject: item.subject || "",
      message: item.message || "",
      status: item.status || "New",
      notes: item.notes || "",
    });
    setEditingId(item._id || item.id);
    setIsModalOpen(true);
  };

  // Submit Enquiry
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.phone.trim() || !form.message.trim()) {
      setNotice("Please fill in customer name, phone number, and message.");
      return;
    }

    try {
      setSubmitting(true);
      const url = editingId ? `${ENQUIRIES_API}/${editingId}` : ENQUIRIES_API;
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to save enquiry.");
      }

      setNotice(
        editingId
          ? "Enquiry lead updated successfully in database."
          : "New customer enquiry added successfully to database."
      );
      setIsModalOpen(false);
      setEditingId(null);
      setForm(emptyEnquiryForm());
      await loadEnquiries();
    } catch (err) {
      console.error("Save error:", err);
      setNotice(err.message || "Could not save enquiry.");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Enquiry
  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const res = await fetch(`${ENQUIRIES_API}/${deleteId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to delete enquiry.");
      }

      setNotice("Enquiry deleted successfully from database.");
      setDeleteId(null);
      if (selectedEnquiry && (selectedEnquiry._id || selectedEnquiry.id) === deleteId) {
        setSelectedEnquiry(null);
      }
      await loadEnquiries();
    } catch (err) {
      console.error("Delete error:", err);
      setNotice(err.message || "Could not delete enquiry.");
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="EnquiryManagement-page">
      {/* HEADER */}
      <header className="EnquiryManagement-header">
        <div className="EnquiryManagement-headerLeft">
          <div className="EnquiryManagement-headerIcon">
            <FiMail />
          </div>
          <div>
            <span className="EnquiryManagement-eyebrow">CUSTOMER LEADS</span>
            <h1>Enquiry & Lead Management</h1>
            <p>
              Track customer machinery inquiries, quote requests, and website contact submissions.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="EnquiryManagement-createBtn"
          onClick={handleOpenCreate}
        >
          <FiPlus /> New Enquiry Lead
        </button>
      </header>

      {/* ALERT NOTICE */}
      {notice && (
        <div className={`EnquiryManagement-notice ${notice.includes("successfully") ? "success" : ""}`}>
          <FiCheckCircle />
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice("")}>
            <FiX />
          </button>
        </div>
      )}

      {/* KPI METRICS */}
      <div className="EnquiryManagement-statsGrid">
        <div className="EnquiryManagement-statCard">
          <div className="EnquiryManagement-statIcon blue">
            <FiMail />
          </div>
          <div>
            <span>Total Inquiries</span>
            <strong>{totalCount}</strong>
            <small>All customer leads</small>
          </div>
        </div>

        <div className="EnquiryManagement-statCard">
          <div className="EnquiryManagement-statIcon amber">
            <FiAlertCircle />
          </div>
          <div>
            <span>New Leads</span>
            <strong>{newCount}</strong>
            <small>Awaiting response</small>
          </div>
        </div>

        <div className="EnquiryManagement-statCard">
          <div className="EnquiryManagement-statIcon purple">
            <FiPhone />
          </div>
          <div>
            <span>In Contact</span>
            <strong>{contactedCount}</strong>
            <small>Follow-up in progress</small>
          </div>
        </div>

        <div className="EnquiryManagement-statCard">
          <div className="EnquiryManagement-statIcon green">
            <FiCheck />
          </div>
          <div>
            <span>Resolved / Closed</span>
            <strong>{resolvedCount}</strong>
            <small>Completed enquiries</small>
          </div>
        </div>
      </div>

      {/* STATUS TABS */}
      <div className="EnquiryManagement-tabBar">
        {["All", "New", "Contacted", "Pending", "Resolved", "Closed"].map((tab) => (
          <button
            key={tab}
            type="button"
            className={`EnquiryManagement-tabBtn ${statusTab === tab ? "active" : ""}`}
            onClick={() => setStatusTab(tab)}
          >
            {tab}
            {tab === "New" && newCount > 0 && (
              <span className="EnquiryManagement-tabBadge">{newCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* TOOLBAR */}
      <div className="EnquiryManagement-toolbar">
        <div className="EnquiryManagement-search">
          <FiSearch />
          <input
            type="text"
            placeholder="Search by customer name, phone, product, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button type="button" onClick={() => setSearch("")}>
              <FiX />
            </button>
          )}
        </div>

        <div className="EnquiryManagement-filters">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="EnquiryManagement-select"
          >
            <option value="All Types">All Enquiry Types</option>
            <option value="Machinery Enquiry">Machinery Enquiry</option>
            <option value="Product Enquiry">Product Enquiry</option>
            <option value="Service Request">Service Request</option>
            <option value="General Contact">General Contact</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="EnquiryManagement-select"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name">Customer Name A–Z</option>
          </select>
        </div>
      </div>

      {/* ENQUIRIES TABLE */}
      <div className="EnquiryManagement-tableWrap">
        <table className="EnquiryManagement-table">
          <thead>
            <tr>
              <th>Customer Lead</th>
              <th>Contact Details</th>
              <th>Equipment / Request</th>
              <th>Enquiry Type</th>
              <th>Location</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEnquiries.map((item) => {
              const id = item._id || item.id;
              return (
                <tr key={id}>
                  <td>
                    <div className="EnquiryManagement-customerCell">
                      <div className="EnquiryManagement-avatar">
                        {(item.name || "U").slice(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <strong>{item.name}</strong>
                        {item.subject && <small>{item.subject}</small>}
                      </div>
                    </div>
                  </td>

                  <td>
                    <div className="EnquiryManagement-contactCell">
                      <a href={`tel:${item.phone}`} className="phoneLink">
                        <FiPhone size={13} /> {item.phone}
                      </a>
                      {item.email && (
                        <a href={`mailto:${item.email}`} className="emailLink">
                          <FiMail size={13} /> {item.email}
                        </a>
                      )}
                    </div>
                  </td>

                  <td>
                    <span className="EnquiryManagement-equipmentTag">
                      {item.productOrEquipment || "General Equipment"}
                    </span>
                  </td>

                  <td>
                    <span className="EnquiryManagement-typeBadge">
                      {item.enquiryType || "Machinery Enquiry"}
                    </span>
                  </td>

                  <td>
                    <span className="EnquiryManagement-location">
                      {item.location ? (
                        <>
                          <FiMapPin size={12} /> {item.location}
                        </>
                      ) : (
                        "—"
                      )}
                    </span>
                  </td>

                  <td>
                    <select
                      value={item.status || "New"}
                      onChange={(e) => handleStatusChange(item, e.target.value)}
                      className={`EnquiryManagement-statusSelect status--${(
                        item.status || "New"
                      ).toLowerCase()}`}
                    >
                      <option value="New">New</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Pending">Pending</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </td>

                  <td>{formatDate(item.createdAt)}</td>

                  <td>
                    <div className="EnquiryManagement-actions">
                      <button
                        type="button"
                        title="View Enquiry Message"
                        onClick={() => setSelectedEnquiry(item)}
                      >
                        <FiEye />
                      </button>
                      <button
                        type="button"
                        title="Edit Details / Notes"
                        onClick={() => handleOpenEdit(item)}
                      >
                        <FiEdit3 />
                      </button>
                      <button
                        type="button"
                        title="Delete Enquiry"
                        className="delete"
                        onClick={() => setDeleteId(id)}
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredEnquiries.length === 0 && !loading && (
          <div className="EnquiryManagement-emptyState">
            <div className="EnquiryManagement-emptyIcon">
              <FiMail />
            </div>
            <h3>No Customer Inquiries Found</h3>
            <p>No customer leads match your selected filters.</p>
            <button
              type="button"
              className="EnquiryManagement-createBtn"
              onClick={handleOpenCreate}
            >
              <FiPlus /> Add Manual Lead
            </button>
          </div>
        )}
      </div>

      {/* VIEW DETAILS MODAL */}
      {selectedEnquiry && (
        <div className="EnquiryManagement-modalOverlay" onClick={() => setSelectedEnquiry(null)}>
          <div className="EnquiryManagement-viewModal" onClick={(e) => e.stopPropagation()}>
            <div className="EnquiryManagement-modalHeader">
              <div>
                <span className="EnquiryManagement-eyebrow">ENQUIRY DETAILS</span>
                <h3>{selectedEnquiry.name}</h3>
              </div>
              <button
                type="button"
                className="EnquiryManagement-modalClose"
                onClick={() => setSelectedEnquiry(null)}
              >
                <FiX />
              </button>
            </div>

            <div className="EnquiryManagement-viewContent">
              <div className="EnquiryManagement-viewGrid">
                <div>
                  <span>Phone Number</span>
                  <strong>
                    <a href={`tel:${selectedEnquiry.phone}`}>{selectedEnquiry.phone}</a>
                  </strong>
                </div>
                <div>
                  <span>Email Address</span>
                  <strong>
                    {selectedEnquiry.email ? (
                      <a href={`mailto:${selectedEnquiry.email}`}>{selectedEnquiry.email}</a>
                    ) : (
                      "—"
                    )}
                  </strong>
                </div>
                <div>
                  <span>Equipment Requested</span>
                  <strong>{selectedEnquiry.productOrEquipment || "—"}</strong>
                </div>
                <div>
                  <span>Enquiry Type</span>
                  <strong>{selectedEnquiry.enquiryType || "Machinery Enquiry"}</strong>
                </div>
                <div>
                  <span>Location</span>
                  <strong>{selectedEnquiry.location || "—"}</strong>
                </div>
                <div>
                  <span>Date Received</span>
                  <strong>{formatDate(selectedEnquiry.createdAt)}</strong>
                </div>
              </div>

              <div className="EnquiryManagement-viewMessage">
                <h4>Customer Message / Request</h4>
                <p>{selectedEnquiry.message}</p>
              </div>

              {selectedEnquiry.notes && (
                <div className="EnquiryManagement-viewNotes">
                  <h4>Internal Admin Follow-Up Notes</h4>
                  <p>{selectedEnquiry.notes}</p>
                </div>
              )}

              <div className="EnquiryManagement-viewStatusRow">
                <span>Update Status:</span>
                <div className="EnquiryManagement-statusButtons">
                  {["New", "Contacted", "Pending", "Resolved", "Closed"].map((st) => (
                    <button
                      key={st}
                      type="button"
                      className={`EnquiryManagement-statusPill ${
                        selectedEnquiry.status === st ? "active" : ""
                      }`}
                      onClick={() => handleStatusChange(selectedEnquiry, st)}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div className="EnquiryManagement-viewActions">
                <a
                  href={`tel:${selectedEnquiry.phone}`}
                  className="EnquiryManagement-callBtn"
                >
                  <FiPhone /> Call Customer
                </a>
                {selectedEnquiry.email && (
                  <a
                    href={`mailto:${selectedEnquiry.email}?subject=${encodeURIComponent(
                      `Response to your inquiry: ${selectedEnquiry.productOrEquipment || ""}`
                    )}`}
                    className="EnquiryManagement-emailBtn"
                  >
                    <FiMail /> Send Email
                  </a>
                )}
                <button
                  type="button"
                  className="EnquiryManagement-editLeadBtn"
                  onClick={() => {
                    handleOpenEdit(selectedEnquiry);
                    setSelectedEnquiry(null);
                  }}
                >
                  <FiEdit3 /> Edit Lead / Notes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT LEAD MODAL */}
      {isModalOpen && (
        <div className="EnquiryManagement-modalOverlay" onClick={() => setIsModalOpen(false)}>
          <div className="EnquiryManagement-modal" onClick={(e) => e.stopPropagation()}>
            <div className="EnquiryManagement-modalHeader">
              <h3>{editingId ? "Edit Enquiry Lead" : "Add New Customer Lead"}</h3>
              <button
                type="button"
                className="EnquiryManagement-modalClose"
                onClick={() => setIsModalOpen(false)}
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="EnquiryManagement-modalForm">
              <div className="EnquiryManagement-formRow">
                <div className="EnquiryManagement-field">
                  <label>Customer Name <span>*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Birendra Kumar"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>

                <div className="EnquiryManagement-field">
                  <label>Phone Number <span>*</span></label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +91 98765 43210"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="EnquiryManagement-formRow">
                <div className="EnquiryManagement-field">
                  <label>Email Address</label>
                  <input
                    type="email"
                    placeholder="e.g. birendra@gmail.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>

                <div className="EnquiryManagement-field">
                  <label>Location / City</label>
                  <input
                    type="text"
                    placeholder="e.g. Bhubaneswar, Odisha"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                  />
                </div>
              </div>

              <div className="EnquiryManagement-formRow">
                <div className="EnquiryManagement-field">
                  <label>Equipment / Product</label>
                  <input
                    type="text"
                    placeholder="e.g. Rotavator 7 Feet"
                    value={form.productOrEquipment}
                    onChange={(e) => setForm({ ...form, productOrEquipment: e.target.value })}
                  />
                </div>

                <div className="EnquiryManagement-field">
                  <label>Enquiry Category</label>
                  <select
                    value={form.enquiryType}
                    onChange={(e) => setForm({ ...form, enquiryType: e.target.value })}
                  >
                    <option value="Machinery Enquiry">Machinery Enquiry</option>
                    <option value="Product Enquiry">Product Enquiry</option>
                    <option value="Service Request">Service Request</option>
                    <option value="General Contact">General Contact</option>
                  </select>
                </div>
              </div>

              <div className="EnquiryManagement-field">
                <label>Subject / Headline</label>
                <input
                  type="text"
                  placeholder="e.g. Subsidy and pricing enquiry"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                />
              </div>

              <div className="EnquiryManagement-field">
                <label>Enquiry Message <span>*</span></label>
                <textarea
                  rows={3}
                  required
                  placeholder="Enter details of customer request..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                />
              </div>

              <div className="EnquiryManagement-formRow">
                <div className="EnquiryManagement-field">
                  <label>Lead Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Pending">Pending</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>

                <div className="EnquiryManagement-field">
                  <label>Admin Notes / Remarks</label>
                  <input
                    type="text"
                    placeholder="e.g. Call scheduled for Monday"
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  />
                </div>
              </div>

              <div className="EnquiryManagement-modalActions">
                <button
                  type="button"
                  className="EnquiryManagement-cancelBtn"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="EnquiryManagement-submitBtn"
                >
                  {submitting ? "Saving..." : editingId ? "Update Lead" : "Save Lead to Database"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION */}
      {deleteId && (
        <div className="EnquiryManagement-modalOverlay" onClick={() => setDeleteId(null)}>
          <div className="EnquiryManagement-confirmModal" onClick={(e) => e.stopPropagation()}>
            <div className="EnquiryManagement-confirmIcon">
              <FiTrash2 />
            </div>
            <h3>Delete this customer inquiry?</h3>
            <p>This action cannot be undone. The enquiry record will be permanently deleted from MongoDB.</p>
            <div className="EnquiryManagement-confirmActions">
              <button
                type="button"
                className="EnquiryManagement-cancelBtn"
                onClick={() => setDeleteId(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="EnquiryManagement-deleteBtn"
                onClick={handleDelete}
              >
                Delete Enquiry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnquiryManagement;
