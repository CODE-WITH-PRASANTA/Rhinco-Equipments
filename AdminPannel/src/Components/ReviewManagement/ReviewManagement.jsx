import React, { useEffect, useMemo, useState } from "react";
import {
  FiStar,
  FiSearch,
  FiFilter,
  FiCheckCircle,
  FiXCircle,
  FiTrash2,
  FiEye,
  FiEdit2,
  FiPlus,
  FiX,
  FiGrid,
  FiList,
  FiClock,
  FiMessageSquare,
  FiUser,
  FiTag,
  FiCalendar,
  FiCheck,
} from "react-icons/fi";
import "./ReviewManagement.css";

const REVIEWS_API = "http://localhost:5000/api/reviews";

const emptyReviewForm = () => ({
  customerName: "",
  customerEmail: "",
  customerPhone: "",
  productOrItem: "",
  itemType: "Product",
  rating: 5,
  title: "",
  comment: "",
  status: "Approved",
  verifiedPurchase: true,
});

const ReviewManagement = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState("All Ratings");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [sortBy, setSortBy] = useState("newest");
  const [notice, setNotice] = useState("");

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(emptyReviewForm());
  const [editingId, setEditingId] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Load reviews from MongoDB
  const loadReviews = async () => {
    setLoading(true);
    try {
      const res = await fetch(REVIEWS_API);
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.data)) {
        setReviews(data.data);
      }
    } catch (err) {
      console.error("Error loading reviews:", err);
      setNotice("Could not load reviews. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  // Filter & Sort
  const filteredReviews = useMemo(() => {
    const q = search.trim().toLowerCase();

    return reviews
      .filter((r) => {
        const matchesSearch =
          !q ||
          (r.customerName || "").toLowerCase().includes(q) ||
          (r.productOrItem || "").toLowerCase().includes(q) ||
          (r.title || "").toLowerCase().includes(q) ||
          (r.comment || "").toLowerCase().includes(q);

        const matchesRating =
          ratingFilter === "All Ratings" ||
          Number(r.rating) === Number(ratingFilter);

        const matchesStatus =
          statusFilter === "All Status" || r.status === statusFilter;

        return matchesSearch && matchesRating && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === "oldest") {
          return new Date(a.createdAt) - new Date(b.createdAt);
        }
        if (sortBy === "ratingHigh") {
          return Number(b.rating) - Number(a.rating);
        }
        if (sortBy === "ratingLow") {
          return Number(a.rating) - Number(b.rating);
        }
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
  }, [reviews, search, ratingFilter, statusFilter, sortBy]);

  // Statistics
  const totalReviews = reviews.length;
  const avgRating =
    totalReviews > 0
      ? (
          reviews.reduce((sum, r) => sum + (Number(r.rating) || 5), 0) /
          totalReviews
        ).toFixed(1)
      : "5.0";
  const fiveStarCount = reviews.filter((r) => Number(r.rating) === 5).length;
  const pendingCount = reviews.filter((r) => r.status === "Pending").length;

  // Open modal for Create
  const handleOpenCreate = () => {
    setForm(emptyReviewForm());
    setEditingId(null);
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (rev) => {
    setForm({
      customerName: rev.customerName || "",
      customerEmail: rev.customerEmail || "",
      customerPhone: rev.customerPhone || "",
      productOrItem: rev.productOrItem || "",
      itemType: rev.itemType || "Product",
      rating: Number(rev.rating) || 5,
      title: rev.title || "",
      comment: rev.comment || "",
      status: rev.status || "Approved",
      verifiedPurchase: Boolean(rev.verifiedPurchase),
    });
    setEditingId(rev._id || rev.id);
    setIsModalOpen(true);
  };

  // Submit Review Form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.customerName.trim() || !form.productOrItem.trim() || !form.comment.trim()) {
      setNotice("Please fill in customer name, product, and review comment.");
      return;
    }

    try {
      setSubmitting(true);
      const url = editingId ? `${REVIEWS_API}/${editingId}` : REVIEWS_API;
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to save review.");
      }

      setNotice(
        editingId
          ? "Review updated successfully in database."
          : "Review created successfully in database."
      );
      setIsModalOpen(false);
      setEditingId(null);
      setForm(emptyReviewForm());
      await loadReviews();
    } catch (err) {
      console.error("Save error:", err);
      setNotice(err.message || "Could not save review.");
    } finally {
      setSubmitting(false);
    }
  };

  // Quick Status Toggle
  const handleToggleStatus = async (rev) => {
    const nextStatus = rev.status === "Approved" ? "Rejected" : "Approved";
    const revId = rev._id || rev.id;

    try {
      const res = await fetch(`${REVIEWS_API}/${revId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update review status.");
      }

      setNotice(`Review marked as ${nextStatus}.`);
      await loadReviews();
    } catch (err) {
      console.error("Status error:", err);
      setNotice(err.message || "Could not update status.");
    }
  };

  // Delete Review
  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const res = await fetch(`${REVIEWS_API}/${deleteId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to delete review.");
      }

      setNotice("Review deleted successfully from database.");
      setDeleteId(null);
      await loadReviews();
    } catch (err) {
      console.error("Delete error:", err);
      setNotice(err.message || "Could not delete review.");
    }
  };

  const renderStars = (rating = 5) => {
    const num = Math.min(5, Math.max(1, Math.round(Number(rating) || 5)));
    return (
      <div className="ReviewManagement-starRow" aria-label={`${num} out of 5 stars`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <FiStar
            key={star}
            className={`ReviewManagement-star ${star <= num ? "filled" : ""}`}
          />
        ))}
        <span className="ReviewManagement-starValue">{num}.0</span>
      </div>
    );
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
    <div className="ReviewManagement-page">
      {/* HEADER */}
      <header className="ReviewManagement-header">
        <div className="ReviewManagement-headerLeft">
          <div className="ReviewManagement-headerIcon">
            <FiStar />
          </div>
          <div>
            <span className="ReviewManagement-eyebrow">CUSTOMER FEEDBACK</span>
            <h1>Review & Rating Management</h1>
            <p>
              Manage ratings, customer testimonials, and verified reviews across your store and machinery.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="ReviewManagement-createBtn"
          onClick={handleOpenCreate}
        >
          <FiPlus /> Add Customer Review
        </button>
      </header>

      {/* ALERT NOTICE */}
      {notice && (
        <div className={`ReviewManagement-notice ${notice.includes("successfully") ? "success" : ""}`}>
          <FiCheckCircle />
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice("")}>
            <FiX />
          </button>
        </div>
      )}

      {/* KPI METRICS */}
      <div className="ReviewManagement-statsGrid">
        <div className="ReviewManagement-statCard">
          <div className="ReviewManagement-statIcon green">
            <FiMessageSquare />
          </div>
          <div>
            <span>Total Reviews</span>
            <strong>{totalReviews}</strong>
            <small>Stored in database</small>
          </div>
        </div>

        <div className="ReviewManagement-statCard">
          <div className="ReviewManagement-statIcon amber">
            <FiStar />
          </div>
          <div>
            <span>Average Rating</span>
            <strong>{avgRating} / 5.0</strong>
            <small>Across all feedback</small>
          </div>
        </div>

        <div className="ReviewManagement-statCard">
          <div className="ReviewManagement-statIcon purple">
            <FiCheckCircle />
          </div>
          <div>
            <span>5-Star Reviews</span>
            <strong>{fiveStarCount}</strong>
            <small>Top rated experiences</small>
          </div>
        </div>

        <div className="ReviewManagement-statCard">
          <div className="ReviewManagement-statIcon red">
            <FiClock />
          </div>
          <div>
            <span>Pending Moderation</span>
            <strong>{pendingCount}</strong>
            <small>Requires review</small>
          </div>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="ReviewManagement-toolbar">
        <div className="ReviewManagement-search">
          <FiSearch />
          <input
            type="text"
            placeholder="Search by customer, product, or review text..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button type="button" onClick={() => setSearch("")}>
              <FiX />
            </button>
          )}
        </div>

        <div className="ReviewManagement-filters">
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="ReviewManagement-select"
          >
            <option value="All Ratings">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="ReviewManagement-select"
          >
            <option value="All Status">All Status</option>
            <option value="Approved">Approved</option>
            <option value="Pending">Pending</option>
            <option value="Rejected">Rejected</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="ReviewManagement-select"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="ratingHigh">Rating: High to Low</option>
            <option value="ratingLow">Rating: Low to High</option>
          </select>

          <div className="ReviewManagement-viewToggle">
            <button
              type="button"
              className={viewMode === "grid" ? "active" : ""}
              onClick={() => setViewMode("grid")}
              title="Grid View"
            >
              <FiGrid />
            </button>
            <button
              type="button"
              className={viewMode === "list" ? "active" : ""}
              onClick={() => setViewMode("list")}
              title="List View"
            >
              <FiList />
            </button>
          </div>
        </div>
      </div>

      {/* RESULTS COUNT */}
      <div className="ReviewManagement-countBar">
        <span>
          Showing <strong>{filteredReviews.length}</strong> customer reviews
        </span>
        {(search || ratingFilter !== "All Ratings" || statusFilter !== "All Status") && (
          <button
            type="button"
            className="ReviewManagement-clearBtn"
            onClick={() => {
              setSearch("");
              setRatingFilter("All Ratings");
              setStatusFilter("All Status");
            }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* GRID VIEW */}
      {viewMode === "grid" && (
        <div className="ReviewManagement-grid">
          {filteredReviews.map((rev) => {
            const revId = rev._id || rev.id;
            return (
              <article key={revId} className="ReviewManagement-card">
                <div className="ReviewManagement-cardHeader">
                  <div className="ReviewManagement-avatar">
                    {(rev.customerName || "U").slice(0, 1).toUpperCase()}
                  </div>
                  <div className="ReviewManagement-customerInfo">
                    <h3>{rev.customerName}</h3>
                    <small>{rev.customerEmail || rev.customerPhone || "Verified Customer"}</small>
                  </div>
                  <span
                    className={`ReviewManagement-statusBadge status--${(
                      rev.status || "Approved"
                    ).toLowerCase()}`}
                  >
                    {rev.status || "Approved"}
                  </span>
                </div>

                <div className="ReviewManagement-ratingBlock">
                  {renderStars(rev.rating)}
                  {rev.verifiedPurchase && (
                    <span className="ReviewManagement-verifiedBadge">
                      <FiCheck /> Verified Purchase
                    </span>
                  )}
                </div>

                <div className="ReviewManagement-itemTag">
                  <FiTag /> {rev.productOrItem} ({rev.itemType || "Product"})
                </div>

                {rev.title && (
                  <h4 className="ReviewManagement-reviewTitle">{rev.title}</h4>
                )}

                <p className="ReviewManagement-comment">{rev.comment}</p>

                <div className="ReviewManagement-cardFooter">
                  <span className="ReviewManagement-date">
                    <FiCalendar /> {formatDate(rev.createdAt)}
                  </span>

                  <div className="ReviewManagement-cardActions">
                    <button
                      type="button"
                      title={rev.status === "Approved" ? "Reject Review" : "Approve Review"}
                      onClick={() => handleToggleStatus(rev)}
                      className="ReviewManagement-actionBtn"
                    >
                      {rev.status === "Approved" ? <FiXCircle /> : <FiCheckCircle />}
                    </button>
                    <button
                      type="button"
                      title="Edit Review"
                      onClick={() => handleOpenEdit(rev)}
                      className="ReviewManagement-actionBtn"
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      type="button"
                      title="Delete Review"
                      onClick={() => setDeleteId(revId)}
                      className="ReviewManagement-actionBtn delete"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* TABLE VIEW */}
      {viewMode === "list" && (
        <div className="ReviewManagement-tableWrap">
          <table className="ReviewManagement-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Product / Equipment</th>
                <th>Rating</th>
                <th>Review Comment</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReviews.map((rev) => {
                const revId = rev._id || rev.id;
                return (
                  <tr key={revId}>
                    <td>
                      <div className="ReviewManagement-tableCustomer">
                        <div className="ReviewManagement-tableAvatar">
                          {(rev.customerName || "U").slice(0, 1).toUpperCase()}
                        </div>
                        <div>
                          <strong>{rev.customerName}</strong>
                          <small>{rev.customerEmail || rev.customerPhone || "—"}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="ReviewManagement-tableProduct">
                        {rev.productOrItem}
                      </span>
                    </td>
                    <td>{renderStars(rev.rating)}</td>
                    <td>
                      <div className="ReviewManagement-tableComment">
                        {rev.title && <strong>{rev.title} - </strong>}
                        <span>{rev.comment}</span>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`ReviewManagement-statusBadge status--${(
                          rev.status || "Approved"
                        ).toLowerCase()}`}
                      >
                        {rev.status || "Approved"}
                      </span>
                    </td>
                    <td>{formatDate(rev.createdAt)}</td>
                    <td>
                      <div className="ReviewManagement-tableActions">
                        <button
                          type="button"
                          title={rev.status === "Approved" ? "Reject" : "Approve"}
                          onClick={() => handleToggleStatus(rev)}
                        >
                          {rev.status === "Approved" ? <FiXCircle /> : <FiCheckCircle />}
                        </button>
                        <button
                          type="button"
                          title="Edit"
                          onClick={() => handleOpenEdit(rev)}
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          type="button"
                          title="Delete"
                          className="delete"
                          onClick={() => setDeleteId(revId)}
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
        </div>
      )}

      {/* EMPTY STATE */}
      {filteredReviews.length === 0 && !loading && (
        <div className="ReviewManagement-emptyState">
          <div className="ReviewManagement-emptyIcon">
            <FiStar />
          </div>
          <h3>No Reviews Found</h3>
          <p>There are no reviews matching your filter criteria. Try resetting filters.</p>
          <button
            type="button"
            className="ReviewManagement-createBtn"
            onClick={handleOpenCreate}
          >
            <FiPlus /> Add First Review
          </button>
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="ReviewManagement-modalOverlay" onClick={() => setIsModalOpen(false)}>
          <div
            className="ReviewManagement-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="ReviewManagement-modalHeader">
              <h3>{editingId ? "Edit Customer Review" : "Add New Customer Review"}</h3>
              <button
                type="button"
                className="ReviewManagement-modalClose"
                onClick={() => setIsModalOpen(false)}
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="ReviewManagement-modalForm">
              <div className="ReviewManagement-formRow">
                <div className="ReviewManagement-field">
                  <label>Customer Name <span>*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Chandra Das"
                    value={form.customerName}
                    onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                  />
                </div>

                <div className="ReviewManagement-field">
                  <label>Customer Email</label>
                  <input
                    type="email"
                    placeholder="e.g. ramesh@gmail.com"
                    value={form.customerEmail}
                    onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
                  />
                </div>
              </div>

              <div className="ReviewManagement-formRow">
                <div className="ReviewManagement-field">
                  <label>Product or Equipment <span>*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rhinco Rotavator 7 Feet"
                    value={form.productOrItem}
                    onChange={(e) => setForm({ ...form, productOrItem: e.target.value })}
                  />
                </div>

                <div className="ReviewManagement-field">
                  <label>Category Type</label>
                  <select
                    value={form.itemType}
                    onChange={(e) => setForm({ ...form, itemType: e.target.value })}
                  >
                    <option value="Product">Product</option>
                    <option value="Machinery">Machinery</option>
                    <option value="General Service">General Service</option>
                  </select>
                </div>
              </div>

              <div className="ReviewManagement-formRow">
                <div className="ReviewManagement-field">
                  <label>Star Rating (1 - 5) <span>*</span></label>
                  <div className="ReviewManagement-ratingPicker">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        className={`ReviewManagement-pickerStar ${star <= form.rating ? "active" : ""}`}
                        onClick={() => setForm({ ...form, rating: star })}
                      >
                        <FiStar />
                      </button>
                    ))}
                    <span>{form.rating} out of 5 Stars</span>
                  </div>
                </div>

                <div className="ReviewManagement-field">
                  <label>Approval Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    <option value="Approved">Approved (Visible)</option>
                    <option value="Pending">Pending Moderation</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="ReviewManagement-field">
                <label>Review Headline / Title</label>
                <input
                  type="text"
                  placeholder="e.g. Excellent build quality and durability!"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>

              <div className="ReviewManagement-field">
                <label>Review Comment <span>*</span></label>
                <textarea
                  rows={4}
                  required
                  placeholder="Enter detailed customer feedback..."
                  value={form.comment}
                  onChange={(e) => setForm({ ...form, comment: e.target.value })}
                />
              </div>

              <div className="ReviewManagement-checkboxRow">
                <label>
                  <input
                    type="checkbox"
                    checked={form.verifiedPurchase}
                    onChange={(e) => setForm({ ...form, verifiedPurchase: e.target.checked })}
                  />
                  <span>Mark as Verified Purchase Customer</span>
                </label>
              </div>

              <div className="ReviewManagement-modalActions">
                <button
                  type="button"
                  className="ReviewManagement-cancelBtn"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="ReviewManagement-submitBtn"
                >
                  {submitting ? "Saving..." : editingId ? "Update Review" : "Save Review to Database"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteId && (
        <div className="ReviewManagement-modalOverlay" onClick={() => setDeleteId(null)}>
          <div
            className="ReviewManagement-confirmModal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="ReviewManagement-confirmIcon">
              <FiTrash2 />
            </div>
            <h3>Delete this customer review?</h3>
            <p>This action cannot be undone. The review will be permanently removed from MongoDB.</p>
            <div className="ReviewManagement-confirmActions">
              <button
                type="button"
                className="ReviewManagement-cancelBtn"
                onClick={() => setDeleteId(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="ReviewManagement-deleteBtn"
                onClick={handleDelete}
              >
                Delete Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewManagement;
