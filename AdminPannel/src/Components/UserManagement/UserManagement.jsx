import React, { useEffect, useMemo, useState } from "react";
import {
  FiUsers,
  FiSearch,
  FiRefreshCw,
  FiCheckCircle,
  FiSlash,
  FiTrash2,
  FiEdit2,
  FiX,
  FiMail,
  FiCalendar,
  FiClock,
  FiShield,
  FiSmartphone,
} from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { API_URL } from "../../utils/apiConfig";
import "./UserManagement.css";

const USERS_API = `${API_URL}/auth/users`;

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [providerFilter, setProviderFilter] = useState("All Providers");
  const [roleFilter, setRoleFilter] = useState("All Roles");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [notice, setNotice] = useState("");

  // Modals
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", phone: "", role: "user", status: "Active" });
  const [deleteId, setDeleteId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch Users from MongoDB
  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(USERS_API);
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.data)) {
        setUsers(data.data);
      }
    } catch (err) {
      console.error("Error loading users:", err);
      setNotice("Could not load users. Please check backend connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Filter & Search
  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      const matchesSearch =
        !q ||
        (u.name || "").toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q) ||
        (u.phone || "").toLowerCase().includes(q);

      const matchesProvider =
        providerFilter === "All Providers" ||
        (providerFilter === "Google" && u.authProvider === "google") ||
        (providerFilter === "Email" && u.authProvider !== "google");

      const matchesRole =
        roleFilter === "All Roles" || (u.role || "user").toLowerCase() === roleFilter.toLowerCase();

      const matchesStatus =
        statusFilter === "All Status" || (u.status || "Active") === statusFilter;

      return matchesSearch && matchesProvider && matchesRole && matchesStatus;
    });
  }, [users, search, providerFilter, roleFilter, statusFilter]);

  // Statistics
  const totalUsers = users.length;
  const googleUsers = users.filter((u) => u.authProvider === "google").length;
  const emailUsers = users.filter((u) => u.authProvider !== "google").length;
  const activeUsers = users.filter((u) => (u.status || "Active") === "Active").length;

  // Toggle user active / blocked status
  const handleToggleStatus = async (user) => {
    const nextStatus = user.status === "Blocked" ? "Active" : "Blocked";
    try {
      const res = await fetch(`${USERS_API}/${user._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setNotice(`User ${user.name} marked as ${nextStatus}.`);
        loadUsers();
      } else {
        throw new Error(data.message || "Failed to update status");
      }
    } catch (err) {
      console.error(err);
      setNotice(err.message || "Error updating user status");
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setEditForm({
      name: user.name || "",
      phone: user.phone || "",
      role: user.role || "user",
      status: user.status || "Active",
    });
  };

  // Submit Edit Form
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;

    setSubmitting(true);
    try {
      const res = await fetch(`${USERS_API}/${editingUser._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setNotice(`User details updated successfully.`);
        setEditingUser(null);
        loadUsers();
      } else {
        throw new Error(data.message || "Failed to update user");
      }
    } catch (err) {
      console.error(err);
      setNotice(err.message || "Error saving user changes");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete User
  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const res = await fetch(`${USERS_API}/${deleteId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setNotice("User permanently deleted from database.");
        setDeleteId(null);
        loadUsers();
      } else {
        throw new Error(data.message || "Failed to delete user");
      }
    } catch (err) {
      console.error(err);
      setNotice(err.message || "Could not delete user.");
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
    <div className="UserManagement-page">
      {/* HEADER */}
      <header className="UserManagement-header">
        <div className="UserManagement-headerLeft">
          <div className="UserManagement-headerIcon">
            <FiUsers />
          </div>
          <div>
            <span className="UserManagement-eyebrow">CUSTOMER & ACCOUNT MANAGEMENT</span>
            <h1>Registered Users & Customers</h1>
            <p>
              Manage farmer accounts, Google OAuth logins, access roles, and activity records.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="UserManagement-refreshBtn"
          onClick={loadUsers}
          disabled={loading}
        >
          <FiRefreshCw className={loading ? "spin" : ""} /> Refresh
        </button>
      </header>

      {/* NOTICE */}
      {notice && (
        <div className="UserManagement-notice">
          <FiCheckCircle />
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice("")}>
            <FiX />
          </button>
        </div>
      )}

      {/* KPI METRICS */}
      <div className="UserManagement-statsGrid">
        <div className="UserManagement-statCard">
          <div className="UserManagement-statIcon green">
            <FiUsers />
          </div>
          <div>
            <span>Total Customers</span>
            <strong>{totalUsers}</strong>
            <small>Registered in MongoDB</small>
          </div>
        </div>

        <div className="UserManagement-statCard">
          <div className="UserManagement-statIcon blue">
            <FcGoogle />
          </div>
          <div>
            <span>Google Accounts</span>
            <strong>{googleUsers}</strong>
            <small>Signed in via Google OAuth</small>
          </div>
        </div>

        <div className="UserManagement-statCard">
          <div className="UserManagement-statIcon purple">
            <FiMail />
          </div>
          <div>
            <span>Email Sign-ups</span>
            <strong>{emailUsers}</strong>
            <small>Direct password accounts</small>
          </div>
        </div>

        <div className="UserManagement-statCard">
          <div className="UserManagement-statIcon amber">
            <FiShield />
          </div>
          <div>
            <span>Active Status</span>
            <strong>{activeUsers}</strong>
            <small>Operational accounts</small>
          </div>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="UserManagement-toolbar">
        <div className="UserManagement-search">
          <FiSearch />
          <input
            type="text"
            placeholder="Search by customer name, email, or mobile..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button type="button" onClick={() => setSearch("")}>
              <FiX />
            </button>
          )}
        </div>

        <div className="UserManagement-filters">
          <select
            value={providerFilter}
            onChange={(e) => setProviderFilter(e.target.value)}
            className="UserManagement-select"
          >
            <option value="All Providers">All Providers</option>
            <option value="Google">Google OAuth</option>
            <option value="Email">Email / Password</option>
          </select>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="UserManagement-select"
          >
            <option value="All Roles">All Roles</option>
            <option value="user">User / Customer</option>
            <option value="farmer">Farmer</option>
            <option value="dealer">Dealer</option>
            <option value="admin">Admin</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="UserManagement-select"
          >
            <option value="All Status">All Status</option>
            <option value="Active">Active</option>
            <option value="Blocked">Blocked</option>
          </select>
        </div>
      </div>

      {/* TABLE */}
      {filteredUsers.length > 0 ? (
        <div className="UserManagement-tableWrap">
          <table className="UserManagement-table">
            <thead>
              <tr>
                <th>Customer / User</th>
                <th>Provider</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined Date</th>
                <th>Last Login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => {
                const isGoogle = u.authProvider === "google";
                const isBlocked = u.status === "Blocked";

                return (
                  <tr key={u._id}>
                    <td>
                      <div className="UserManagement-userCell">
                        {u.avatar ? (
                          <img
                            src={u.avatar}
                            alt={u.name}
                            className="UserManagement-avatar"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="UserManagement-avatarFallback">
                            {(u.name || "U").slice(0, 1).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="UserManagement-userName">{u.name}</div>
                          <div className="UserManagement-userEmail">{u.email}</div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span
                        className={`UserManagement-providerBadge ${
                          isGoogle ? "google" : "email"
                        }`}
                      >
                        {isGoogle ? <FcGoogle size={14} /> : <FiMail size={13} />}
                        {isGoogle ? "Google Account" : "Email & Password"}
                      </span>
                    </td>

                    <td>{u.phone || "—"}</td>

                    <td>
                      <span className="UserManagement-roleBadge">{u.role || "user"}</span>
                    </td>

                    <td>
                      <span
                        className={`UserManagement-statusBadge ${
                          isBlocked ? "blocked" : "active"
                        }`}
                      >
                        {isBlocked ? "Blocked" : "Active"}
                      </span>
                    </td>

                    <td>{formatDate(u.createdAt)}</td>

                    <td>{formatDate(u.lastLogin || u.createdAt)}</td>

                    <td>
                      <div className="UserManagement-actions">
                        <button
                          type="button"
                          title={isBlocked ? "Unblock User" : "Block User"}
                          className="UserManagement-actionBtn toggle-block"
                          onClick={() => handleToggleStatus(u)}
                        >
                          {isBlocked ? <FiCheckCircle color="#16a34a" /> : <FiSlash />}
                        </button>

                        <button
                          type="button"
                          title="Edit User"
                          className="UserManagement-actionBtn"
                          onClick={() => handleOpenEdit(u)}
                        >
                          <FiEdit2 />
                        </button>

                        <button
                          type="button"
                          title="Delete User"
                          className="UserManagement-actionBtn delete"
                          onClick={() => setDeleteId(u._id)}
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
      ) : (
        !loading && (
          <div className="UserManagement-empty">
            <div className="UserManagement-emptyIcon">
              <FiUsers />
            </div>
            <h3>No Users Found</h3>
            <p>
              {search || providerFilter !== "All Providers" || statusFilter !== "All Status"
                ? "No customer accounts match your search filters."
                : "No customer accounts registered yet in MongoDB."}
            </p>
            {(search || providerFilter !== "All Providers" || statusFilter !== "All Status") && (
              <button
                type="button"
                className="UserManagement-refreshBtn"
                onClick={() => {
                  setSearch("");
                  setProviderFilter("All Providers");
                  setStatusFilter("All Status");
                  setRoleFilter("All Roles");
                }}
              >
                Clear Search & Filters
              </button>
            )}
          </div>
        )
      )}

      {/* EDIT MODAL */}
      {editingUser && (
        <div className="UserManagement-modalOverlay" onClick={() => setEditingUser(null)}>
          <div className="UserManagement-modal" onClick={(e) => e.stopPropagation()}>
            <div className="UserManagement-modalHeader">
              <h3>Edit User Details</h3>
              <button
                type="button"
                className="UserManagement-modalClose"
                onClick={() => setEditingUser(null)}
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="UserManagement-modalForm">
              <div className="UserManagement-field">
                <label>Customer Full Name</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
              </div>

              <div className="UserManagement-field">
                <label>Mobile Number</label>
                <input
                  type="text"
                  placeholder="e.g. +91 9876543210"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                />
              </div>

              <div className="UserManagement-field">
                <label>Account Role</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                >
                  <option value="user">User / Standard Customer</option>
                  <option value="farmer">Farmer</option>
                  <option value="dealer">Machinery Dealer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="UserManagement-field">
                <label>Account Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                >
                  <option value="Active">Active (Permitted to Login)</option>
                  <option value="Blocked">Blocked (Login Denied)</option>
                </select>
              </div>

              <div className="UserManagement-modalActions">
                <button
                  type="button"
                  className="UserManagement-cancelBtn"
                  onClick={() => setEditingUser(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="UserManagement-submitBtn"
                >
                  {submitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteId && (
        <div className="UserManagement-modalOverlay" onClick={() => setDeleteId(null)}>
          <div className="UserManagement-modal" onClick={(e) => e.stopPropagation()}>
            <div className="UserManagement-modalHeader">
              <h3>Delete Customer Account?</h3>
              <button
                type="button"
                className="UserManagement-modalClose"
                onClick={() => setDeleteId(null)}
              >
                <FiX />
              </button>
            </div>

            <div style={{ padding: "1.5rem" }}>
              <p style={{ margin: "0 0 1.25rem 0", color: "#64748b" }}>
                Are you sure you want to delete this user? This action cannot be undone and will
                permanently erase their customer record from MongoDB.
              </p>
              <div className="UserManagement-modalActions">
                <button
                  type="button"
                  className="UserManagement-cancelBtn"
                  onClick={() => setDeleteId(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="UserManagement-deleteConfirmBtn"
                  onClick={handleDelete}
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
