import React, { useEffect, useRef, useState } from "react";
import "./TeamManagement.css";

const TEAM_API = "http://localhost:5000/api/team";

const emptyForm = {
  name: "",
  image: "",
  designation: "",
  contact: "",
  email: "",
  description: "",
};

const TeamManagement = () => {
  const [team, setTeam] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [preview, setPreview] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [errors, setErrors] = useState({});
  const [showDeleteId, setShowDeleteId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const fileInputRef = useRef(null);

  // Toast Notification Helper
  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3500);
  };

  // FETCH REAL TEAM MEMBERS FROM DATABASE
  const loadTeamMembers = async () => {
    setLoading(true);
    try {
      const res = await fetch(TEAM_API);
      const result = await res.json();
      if (res.ok && result.success && Array.isArray(result.data)) {
        setTeam(result.data);
      }
    } catch (err) {
      console.error("Error loading team members from database:", err);
      showToast("Could not connect to database. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeamMembers();
  }, []);

  const filteredTeam = team.filter((member) => {
    const searchText = search.toLowerCase();
    return (
      (member.name || "").toLowerCase().includes(searchText) ||
      (member.designation || "").toLowerCase().includes(searchText) ||
      (member.email || "").toLowerCase().includes(searchText) ||
      (member.contact || "").includes(searchText)
    );
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  // Convert uploaded image to Base64 for permanent MongoDB storage
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({
        ...prev,
        image: "Please select a valid image.",
      }));
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        image: "Image size must be less than 5MB.",
      }));
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64Url = reader.result;
      setFormData((prev) => ({
        ...prev,
        image: base64Url,
      }));
      setPreview(base64Url);
      setErrors((prev) => ({
        ...prev,
        image: "",
      }));
    };
    reader.readAsDataURL(file);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Please enter team member name.";
    }

    if (!formData.designation.trim()) {
      newErrors.designation = "Please enter designation.";
    }

    if (!formData.contact.trim()) {
      newErrors.contact = "Please enter contact number.";
    } else if (!/^[0-9+\-\s()]{7,16}$/.test(formData.contact.trim())) {
      newErrors.contact = "Please enter a valid contact number.";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Please enter email address.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Please enter a short description.";
    }

    if (!formData.image) {
      newErrors.image = "Please upload a profile picture.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setErrors({});
    setPreview("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // SUBMIT FORM TO DATABASE (CREATE OR UPDATE)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSubmitting(true);
    try {
      if (editingId) {
        const res = await fetch(`${TEAM_API}/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || "Failed to update team member.");
        }

        showToast(`Team member "${formData.name}" updated successfully in database!`);
      } else {
        const res = await fetch(TEAM_API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || "Failed to add team member.");
        }

        showToast(`Team member "${formData.name}" saved to database successfully!`);
      }

      resetForm();
      await loadTeamMembers();
    } catch (err) {
      console.error("Submit error:", err);
      showToast(err.message || "Could not save team member.");
    } finally {
      setSubmitting(false);
    }
  };

  // EDIT TEAM MEMBER
  const handleEdit = (member) => {
    setEditingId(member._id || member.id);

    setFormData({
      name: member.name || "",
      image: member.image || "",
      designation: member.designation || "",
      contact: member.contact || "",
      email: member.email || "",
      description: member.description || "",
    });

    setPreview(member.image || "");
    setErrors({});

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    document
      .querySelector(".TeamManagement-formPanel")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // DELETE TEAM MEMBER FROM DATABASE
  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${TEAM_API}/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to delete team member.");
      }

      showToast("Team member deleted successfully from database!");

      if (editingId === id) {
        resetForm();
      }

      await loadTeamMembers();
    } catch (err) {
      console.error("Delete error:", err);
      showToast(err.message || "Could not delete team member.");
    } finally {
      setShowDeleteId(null);
    }
  };

  return (
    <div className="TeamManagement">
      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className="TeamManagement-toast">
          <span>✓</span>
          <span>{toast}</span>
        </div>
      )}

      {/* HEADER */}
      <div className="TeamManagement-header">
        <div>
          <span className="TeamManagement-subtitle">
            RHINO'S EQUIPMENT
          </span>
          <h2>Team Management</h2>
          <p>Manage your team members and their information in MongoDB database.</p>
        </div>

        <div className="TeamManagement-headerActions">
          <button
            type="button"
            className="TeamManagement-syncButton"
            onClick={loadTeamMembers}
            title="Sync team with database"
          >
            <span className={loading ? "spin" : ""}>↻</span>
            <span>Sync</span>
          </button>

          <div className="TeamManagement-headerCount">
            <span>Total Members</span>
            <strong>{team.length}</strong>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="TeamManagement-layout">
        {/* LEFT FORM */}
        <section className="TeamManagement-formPanel">
          <div className="TeamManagement-panelHeading">
            <div>
              <span className="TeamManagement-sectionLabel">
                TEAM INFORMATION
              </span>
              <h3>{editingId ? "Edit Team Member" : "Add New Member"}</h3>
            </div>

            <span className="TeamManagement-headingIcon">
              {editingId ? "✎" : "+"}
            </span>
          </div>

          <form
            className="TeamManagement-form"
            onSubmit={handleSubmit}
            noValidate
          >
            {/* IMAGE UPLOAD */}
            <div className="TeamManagement-imageUpload">
              <div className="TeamManagement-imagePreview">
                {preview ? (
                  <img src={preview} alt="Team member preview" />
                ) : (
                  <span className="TeamManagement-imagePlaceholder">
                    <span>+</span>
                    <small>Photo</small>
                  </span>
                )}
              </div>

              <div className="TeamManagement-imageDetails">
                <h4>Profile Picture</h4>
                <p>Upload a professional profile image.</p>

                <button
                  type="button"
                  className="TeamManagement-uploadButton"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <span>↑</span> Upload Image
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  hidden
                />

                <small>JPG, PNG or WEBP · Maximum 5MB</small>
                {errors.image && (
                  <span className="TeamManagement-error">
                    {errors.image}
                  </span>
                )}
              </div>
            </div>

            <div className="TeamManagement-formDivider" />

            {/* NAME */}
            <div className="TeamManagement-field">
              <label>
                Full Name <span>*</span>
              </label>

              <input
                type="text"
                name="name"
                placeholder="Enter full name"
                value={formData.name}
                onChange={handleInputChange}
              />

              {errors.name && (
                <small className="TeamManagement-error">
                  {errors.name}
                </small>
              )}
            </div>

            {/* DESIGNATION */}
            <div className="TeamManagement-field">
              <label>
                Designation <span>*</span>
              </label>

              <input
                type="text"
                name="designation"
                placeholder="e.g. Sales Manager"
                value={formData.designation}
                onChange={handleInputChange}
              />

              {errors.designation && (
                <small className="TeamManagement-error">
                  {errors.designation}
                </small>
              )}
            </div>

            {/* CONTACT AND EMAIL */}
            <div className="TeamManagement-formRow">
              <div className="TeamManagement-field">
                <label>
                  Contact Number <span>*</span>
                </label>

                <input
                  type="tel"
                  name="contact"
                  placeholder="Enter phone number"
                  value={formData.contact}
                  onChange={handleInputChange}
                />

                {errors.contact && (
                  <small className="TeamManagement-error">
                    {errors.contact}
                  </small>
                )}
              </div>

              <div className="TeamManagement-field">
                <label>
                  Email Address <span>*</span>
                </label>

                <input
                  type="email"
                  name="email"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={handleInputChange}
                />

                {errors.email && (
                  <small className="TeamManagement-error">
                    {errors.email}
                  </small>
                )}
              </div>
            </div>

            {/* DESCRIPTION */}
            <div className="TeamManagement-field">
              <label>
                Description <span>*</span>
              </label>

              <textarea
                name="description"
                rows="5"
                placeholder="Write a short description about this team member..."
                value={formData.description}
                onChange={handleInputChange}
              />

              {errors.description && (
                <small className="TeamManagement-error">
                  {errors.description}
                </small>
              )}
            </div>

            {/* FORM ACTIONS */}
            <div className="TeamManagement-formActions">
              <button
                type="button"
                className="TeamManagement-resetButton"
                onClick={resetForm}
                disabled={submitting}
              >
                Reset
              </button>

              <button
                type="submit"
                className="TeamManagement-submitButton"
                disabled={submitting}
              >
                {submitting ? "Saving..." : editingId ? "Update Member" : "+ Add Member"}
              </button>
            </div>
          </form>
        </section>

        {/* RIGHT TABLE */}
        <section className="TeamManagement-tablePanel">
          <div className="TeamManagement-panelHeading TeamManagement-tableHeading">
            <div>
              <span className="TeamManagement-sectionLabel">
                TEAM DIRECTORY
              </span>
              <h3>All Team Members</h3>
              <p>{team.length} members registered in database</p>
            </div>

            <span className="TeamManagement-tableCount">
              {team.length} Total
            </span>
          </div>

          {/* SEARCH */}
          <div className="TeamManagement-searchBox">
            <span>⌕</span>
            <input
              type="text"
              placeholder="Search name, designation, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>

          {/* TABLE */}
          <div className="TeamManagement-tableWrapper">
            <table className="TeamManagement-table">
              <thead>
                <tr>
                  <th>TEAM MEMBER</th>
                  <th>CONTACT DETAILS</th>
                  <th>DESIGNATION</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>

              <tbody>
                {loading && team.length === 0 ? (
                  <tr>
                    <td colSpan="4">
                      <div className="TeamManagement-emptyState">
                        <span className="spin">↻</span>
                        <h4>Loading Database Records...</h4>
                        <p>Fetching team members from MongoDB.</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredTeam.length > 0 ? (
                  filteredTeam.map((member) => (
                    <tr key={member._id || member.id}>
                      <td>
                        <div className="TeamManagement-memberInfo">
                          <img
                            src={member.image}
                            alt={member.name}
                            onError={(e) => {
                              e.currentTarget.src =
                                "https://placehold.co/100x100?text=User";
                            }}
                          />

                          <div>
                            <strong>{member.name}</strong>
                            <span>
                              {member.description && member.description.length > 55
                                ? `${member.description.slice(0, 55)}...`
                                : member.description}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="TeamManagement-contactInfo">
                          <span>☎ {member.contact}</span>
                          <span>✉ {member.email}</span>
                        </div>
                      </td>

                      <td>
                        <span className="TeamManagement-designation">
                          {member.designation}
                        </span>
                      </td>

                      <td>
                        <div className="TeamManagement-actions">
                          <button
                            type="button"
                            className="TeamManagement-editButton"
                            onClick={() => handleEdit(member)}
                            title="Edit member"
                          >
                            ✎
                          </button>

                          <button
                            type="button"
                            className="TeamManagement-deleteButton"
                            onClick={() => setShowDeleteId(member._id || member.id)}
                            title="Delete member"
                          >
                            ×
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4">
                      <div className="TeamManagement-emptyState">
                        <span>♙</span>
                        <h4>No team members found</h4>
                        <p>
                          {search
                            ? "Try searching with another keyword."
                            : "No team members in database yet. Add your first team member using the form."}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="TeamManagement-tableFooter">
            <span>
              Showing {filteredTeam.length} of {team.length} members
            </span>
            <span>Team Directory</span>
          </div>
        </section>
      </div>

      {/* DELETE CONFIRMATION */}
      {showDeleteId !== null && (
        <div
          className="TeamManagement-modalOverlay"
          onClick={() => setShowDeleteId(null)}
        >
          <div
            className="TeamManagement-deleteModal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="TeamManagement-deleteIcon">!</div>
            <h3>Delete Team Member?</h3>
            <p>
              Are you sure you want to delete this team member from the database? This action
              cannot be undone.
            </p>

            <div className="TeamManagement-modalActions">
              <button
                type="button"
                onClick={() => setShowDeleteId(null)}
                className="TeamManagement-cancelDelete"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => handleDelete(showDeleteId)}
                className="TeamManagement-confirmDelete"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamManagement;
