import React, { useEffect, useMemo, useRef, useState } from "react";
import "./TeamManagement.css";

const STORAGE_KEY = "rhino_team_members";
const MAX_FILE_SIZE = 2 * 1024 * 1024;
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"];

const initialTeam = [
  {
    id: 1,
    name: "Rahul Sharma",
    designation: "Managing Director",
    contact: "9876543210",
    email: "rahul@rhinoequipment.com",
    description:
      "Leads business operations, company strategy, and overall organizational growth.",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400",
  },
  {
    id: 2,
    name: "Priya Das",
    designation: "Sales Manager",
    contact: "9876543211",
    email: "priya@rhinoequipment.com",
    description:
      "Manages sales operations, customer relationships, and equipment enquiries.",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400",
  },
  {
    id: 3,
    name: "Amit Kumar",
    designation: "Technical Head",
    contact: "9876543212",
    email: "amit@rhinoequipment.com",
    description:
      "Oversees technical operations, machinery inspection, and maintenance services.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
  },
];

const emptyForm = {
  name: "",
  image: "",
  designation: "",
  contact: "",
  email: "",
  description: "",
};

/* =========================================
   ICONS
========================================= */

const Icon = ({ children, size = 20, stroke = 1.8 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={stroke}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
);

const UsersIcon = (p) => (
  <Icon {...p}>
    <circle cx="9" cy="8" r="3.5" />
    <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
    <path d="M16 4.6a3.5 3.5 0 0 1 0 6.8" />
    <path d="M18 14.2a6.5 6.5 0 0 1 3.5 5.8" />
  </Icon>
);

const PlusIcon = (p) => (
  <Icon {...p}>
    <path d="M12 5v14M5 12h14" />
  </Icon>
);

const UploadIcon = (p) => (
  <Icon {...p}>
    <path d="M12 16V4" />
    <path d="m7 9 5-5 5 5" />
    <path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
  </Icon>
);

const CameraIcon = (p) => (
  <Icon {...p}>
    <path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" />
    <circle cx="12" cy="13" r="3.4" />
  </Icon>
);

const SearchIcon = (p) => (
  <Icon {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </Icon>
);

const EditIcon = (p) => (
  <Icon {...p}>
    <path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4Z" />
    <path d="m13.5 6.5 4 4" />
  </Icon>
);

const TrashIcon = (p) => (
  <Icon {...p}>
    <path d="M4 7h16" />
    <path d="M9 7V4h6v3" />
    <path d="M6 7l1 13h10l1-13" />
    <path d="M10 11v5M14 11v5" />
  </Icon>
);

const CloseIcon = (p) => (
  <Icon {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Icon>
);

const PhoneIcon = (p) => (
  <Icon {...p}>
    <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1Z" />
  </Icon>
);

const MailIcon = (p) => (
  <Icon {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2.5" />
    <path d="m3.5 7 8.5 6 8.5-6" />
  </Icon>
);

const AlertIcon = (p) => (
  <Icon {...p}>
    <path d="M12 8v5" />
    <path d="M12 16.5v.01" />
    <path d="M10.3 3.9 2.6 17.5A2 2 0 0 0 4.3 20.5h15.4a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
  </Icon>
);

const CheckIcon = (p) => (
  <Icon {...p}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </Icon>
);

const UserIcon = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </Icon>
);

/* =========================================
   HELPERS
========================================= */

const validateFile = (file) => {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return "Please select a JPG, PNG or WEBP image.";
  }
  if (file.size > MAX_FILE_SIZE) {
    return "Image size must be less than 2MB.";
  }
  return "";
};

// Resizes the photo and returns a data URL so it survives page refresh
const readAndCompress = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error("read"));
    reader.onload = () => {
      const img = new Image();

      img.onerror = () => reject(new Error("decode"));
      img.onload = () => {
        const MAX_SIDE = 480;
        const scale = Math.min(1, MAX_SIDE / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");

        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);

        canvas
          .getContext("2d")
          .drawImage(img, 0, 0, canvas.width, canvas.height);

        resolve(canvas.toDataURL("image/webp", 0.85));
      };

      img.src = reader.result;
    };

    reader.readAsDataURL(file);
  });

const validateMember = (values, team, ignoreId = null) => {
  const errors = {};

  if (!values.name.trim()) errors.name = "Please enter team member name.";

  if (!values.designation.trim())
    errors.designation = "Please enter designation.";

  if (!values.contact.trim()) {
    errors.contact = "Please enter contact number.";
  } else if (!/^[0-9+\-\s()]{7,16}$/.test(values.contact.trim())) {
    errors.contact = "Please enter a valid contact number.";
  }

  if (!values.email.trim()) {
    errors.email = "Please enter email address.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = "Please enter a valid email address.";
  } else if (
    team.some(
      (m) =>
        m.id !== ignoreId &&
        m.email.trim().toLowerCase() === values.email.trim().toLowerCase()
    )
  ) {
    errors.email = "This email is already used by another member.";
  }

  if (!values.description.trim())
    errors.description = "Please enter a short description.";

  if (!values.image) errors.image = "Please upload a profile picture.";

  return errors;
};

/* =========================================
   MEMBER FIELDS (shared by form + edit popup)
========================================= */

const MemberFields = ({ values, errors, onChange, onImage, onRemoveImage, idPrefix }) => {
  const fileInputRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (file) onImage(file);
    e.target.value = "";
  };

  return (
    <>
      {/* IMAGE UPLOAD */}
      <div className="TeamManagement-imageUpload">
        <div
          className={`TeamManagement-imagePreview ${
            errors.image ? "has-error" : ""
          } ${values.image ? "has-image" : ""}`}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          aria-label="Choose profile picture"
        >
          {values.image ? (
            <>
              <img src={values.image} alt="Team member preview" />
              <span className="TeamManagement-imageHover">
                <CameraIcon size={20} />
              </span>
            </>
          ) : (
            <span className="TeamManagement-imagePlaceholder">
              <CameraIcon size={26} />
              <small>Photo</small>
            </span>
          )}
        </div>

        <div className="TeamManagement-imageDetails">
          <h4>Profile Picture</h4>
          <p>Upload a professional profile image.</p>

          <div className="TeamManagement-imageButtons">
            <button
              type="button"
              className="TeamManagement-uploadButton"
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadIcon size={15} stroke={2.2} />
              {values.image ? "Change Image" : "Upload Image"}
            </button>

            {values.image && (
              <button
                type="button"
                className="TeamManagement-removePhoto"
                onClick={onRemoveImage}
              >
                Remove
              </button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleFile}
            hidden
          />

          <small>JPG, PNG or WEBP · Maximum 2MB</small>

          {errors.image && (
            <span className="TeamManagement-error">{errors.image}</span>
          )}
        </div>
      </div>

      <div className="TeamManagement-formDivider" />

      {/* NAME */}
      <div className="TeamManagement-field">
        <label htmlFor={`${idPrefix}-name`}>
          Full Name <span>*</span>
        </label>
        <input
          id={`${idPrefix}-name`}
          type="text"
          name="name"
          placeholder="Enter full name"
          value={values.name}
          onChange={onChange}
          className={errors.name ? "has-error" : ""}
        />
        {errors.name && <small className="TeamManagement-error">{errors.name}</small>}
      </div>

      {/* DESIGNATION */}
      <div className="TeamManagement-field">
        <label htmlFor={`${idPrefix}-designation`}>
          Designation <span>*</span>
        </label>
        <input
          id={`${idPrefix}-designation`}
          type="text"
          name="designation"
          placeholder="e.g. Sales Manager"
          value={values.designation}
          onChange={onChange}
          className={errors.designation ? "has-error" : ""}
        />
        {errors.designation && (
          <small className="TeamManagement-error">{errors.designation}</small>
        )}
      </div>

      {/* CONTACT + EMAIL */}
      <div className="TeamManagement-formRow">
        <div className="TeamManagement-field">
          <label htmlFor={`${idPrefix}-contact`}>
            Contact Number <span>*</span>
          </label>
          <input
            id={`${idPrefix}-contact`}
            type="tel"
            name="contact"
            placeholder="Enter phone number"
            value={values.contact}
            onChange={onChange}
            className={errors.contact ? "has-error" : ""}
          />
          {errors.contact && (
            <small className="TeamManagement-error">{errors.contact}</small>
          )}
        </div>

        <div className="TeamManagement-field">
          <label htmlFor={`${idPrefix}-email`}>
            Email Address <span>*</span>
          </label>
          <input
            id={`${idPrefix}-email`}
            type="email"
            name="email"
            placeholder="Enter email address"
            value={values.email}
            onChange={onChange}
            className={errors.email ? "has-error" : ""}
          />
          {errors.email && (
            <small className="TeamManagement-error">{errors.email}</small>
          )}
        </div>
      </div>

      {/* DESCRIPTION */}
      <div className="TeamManagement-field">
        <label htmlFor={`${idPrefix}-description`}>
          Description <span>*</span>
        </label>
        <textarea
          id={`${idPrefix}-description`}
          name="description"
          rows="4"
          placeholder="Write a short description about this team member..."
          value={values.description}
          onChange={onChange}
          className={errors.description ? "has-error" : ""}
        />
        {errors.description && (
          <small className="TeamManagement-error">{errors.description}</small>
        )}
      </div>
    </>
  );
};

/* =========================================
   MAIN COMPONENT
========================================= */

const TeamManagement = () => {
  const [team, setTeam] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : initialTeam;
    } catch {
      return initialTeam;
    }
  });

  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [search, setSearch] = useState("");

  const [editItem, setEditItem] = useState(null);
  const [editErrors, setEditErrors] = useState({});
  const [deleteItem, setDeleteItem] = useState(null);

  const [toast, setToast] = useState(null);

  /* ---------- persistence ---------- */

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(team));
    } catch {
      setToast({
        type: "error",
        message: "Storage is full. Please remove some members.",
      });
    }
  }, [team]);

  /* ---------- toast auto hide ---------- */

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(timer);
  }, [toast]);

  /* ---------- modal: Esc key + body scroll lock ---------- */

  const modalOpen = Boolean(editItem || deleteItem);

  useEffect(() => {
    if (!modalOpen) return undefined;

    const onKey = (e) => {
      if (e.key === "Escape") {
        setEditItem(null);
        setDeleteItem(null);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [modalOpen]);

  /* ---------- search ---------- */

  const filteredTeam = useMemo(() => {
    const text = search.trim().toLowerCase();
    if (!text) return team;

    return team.filter(
      (member) =>
        member.name.toLowerCase().includes(text) ||
        member.designation.toLowerCase().includes(text) ||
        member.email.toLowerCase().includes(text) ||
        member.contact.includes(text)
    );
  }, [team, search]);

  /* ---------- image handler ---------- */

  const handleImage = async (file, setValues, setErrs) => {
    const problem = validateFile(file);

    if (problem) {
      setErrs((prev) => ({ ...prev, image: problem }));
      return;
    }

    try {
      const dataUrl = await readAndCompress(file);
      setValues((prev) => ({ ...prev, image: dataUrl }));
      setErrs((prev) => ({ ...prev, image: "" }));
    } catch {
      setErrs((prev) => ({
        ...prev,
        image: "Could not process this image. Try another one.",
      }));
    }
  };

  /* ---------- add ---------- */

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setErrors({});
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = validateMember(formData, team);
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setTeam((prev) => [
      {
        ...formData,
        name: formData.name.trim(),
        designation: formData.designation.trim(),
        contact: formData.contact.trim(),
        email: formData.email.trim(),
        description: formData.description.trim(),
        id: Date.now(),
      },
      ...prev,
    ]);

    resetForm();
    setToast({ type: "success", message: "Team member added successfully." });
  };

  /* ---------- edit ---------- */

  const openEdit = (member) => {
    setEditErrors({});
    setEditItem({ ...member });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditItem((prev) => ({ ...prev, [name]: value }));
    setEditErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleUpdate = (e) => {
    e.preventDefault();

    const newErrors = validateMember(editItem, team, editItem.id);
    setEditErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setTeam((prev) =>
      prev.map((member) =>
        member.id === editItem.id
          ? {
              ...editItem,
              name: editItem.name.trim(),
              designation: editItem.designation.trim(),
              contact: editItem.contact.trim(),
              email: editItem.email.trim(),
              description: editItem.description.trim(),
            }
          : member
      )
    );

    setEditItem(null);
    setToast({ type: "success", message: "Team member updated successfully." });
  };

  /* ---------- delete ---------- */

  const handleDelete = () => {
    setTeam((prev) => prev.filter((member) => member.id !== deleteItem.id));
    setDeleteItem(null);
    setToast({ type: "success", message: "Team member deleted." });
  };

  /* =========================================
     RENDER
  ========================================= */

  return (
    <div className="TeamManagement">
      {/* HEADER */}
      <div className="TeamManagement-header">
        <div className="TeamManagement-headerLeft">
          <span className="TeamManagement-headerIcon">
            <UsersIcon size={26} />
          </span>

          <div>
            <span className="TeamManagement-subtitle">RHINO'S EQUIPMENT</span>
            <h2>Team Management</h2>
            <p>Manage your team members and their information.</p>
          </div>
        </div>

        <div className="TeamManagement-headerCount">
          <span>Total Members</span>
          <strong>{team.length}</strong>
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
              <h3>Add New Member</h3>
              <p>Fill in the details to add a team member.</p>
            </div>

            <span className="TeamManagement-headingIcon">
              <PlusIcon size={20} stroke={2.2} />
            </span>
          </div>

          <form className="TeamManagement-form" onSubmit={handleSubmit} noValidate>
            <MemberFields
              idPrefix="add"
              values={formData}
              errors={errors}
              onChange={handleInputChange}
              onImage={(file) => handleImage(file, setFormData, setErrors)}
              onRemoveImage={() => setFormData((prev) => ({ ...prev, image: "" }))}
            />

            <div className="TeamManagement-formActions">
              <button
                type="button"
                className="TeamManagement-resetButton"
                onClick={resetForm}
              >
                Reset
              </button>

              <button type="submit" className="TeamManagement-submitButton">
                <PlusIcon size={17} stroke={2.4} />
                Add Member
              </button>
            </div>
          </form>
        </section>

        {/* RIGHT TABLE */}
        <section className="TeamManagement-tablePanel">
          <div className="TeamManagement-panelHeading">
            <div>
              <span className="TeamManagement-sectionLabel">TEAM DIRECTORY</span>
              <h3>All Team Members</h3>
              <p>{team.length} members registered</p>
            </div>

            <span className="TeamManagement-tableCount">{team.length} Total</span>
          </div>

          {/* SEARCH */}
          <div className="TeamManagement-searchBox">
            <SearchIcon size={18} />
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
                <CloseIcon size={15} />
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
                  <th className="is-right">ACTIONS</th>
                </tr>
              </thead>

              <tbody>
                {filteredTeam.length > 0 ? (
                  filteredTeam.map((member) => (
                    <tr key={member.id}>
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
                              {member.description.length > 55
                                ? `${member.description.slice(0, 55)}...`
                                : member.description}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="TeamManagement-contactInfo">
                          <span>
                            <PhoneIcon size={14} /> {member.contact}
                          </span>
                          <span>
                            <MailIcon size={14} /> {member.email}
                          </span>
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
                            onClick={() => openEdit(member)}
                            title="Edit member"
                            aria-label={`Edit ${member.name}`}
                          >
                            <EditIcon size={17} />
                          </button>

                          <button
                            type="button"
                            className="TeamManagement-deleteButton"
                            onClick={() => setDeleteItem(member)}
                            title="Delete member"
                            aria-label={`Delete ${member.name}`}
                          >
                            <TrashIcon size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4">
                      <div className="TeamManagement-emptyState">
                        <span>
                          <UserIcon size={26} />
                        </span>
                        <h4>No team members found</h4>
                        <p>
                          {search
                            ? "Try searching with another keyword."
                            : "Add your first team member using the form."}
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

      {/* EDIT POPUP */}
      {editItem && (
        <div
          className="TeamManagement-modalOverlay"
          onClick={() => setEditItem(null)}
        >
          <form
            className="TeamManagement-modal TeamManagement-editModal"
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleUpdate}
            noValidate
            role="dialog"
            aria-modal="true"
            aria-label="Edit team member"
          >
            <div className="TeamManagement-modalHeader">
              <div>
                <span className="TeamManagement-sectionLabel">UPDATE MEMBER</span>
                <h3>Edit Team Member</h3>
              </div>

              <button
                type="button"
                className="TeamManagement-modalClose"
                aria-label="Close"
                onClick={() => setEditItem(null)}
              >
                <CloseIcon size={18} />
              </button>
            </div>

            <div className="TeamManagement-modalBody">
              <MemberFields
                idPrefix="edit"
                values={editItem}
                errors={editErrors}
                onChange={handleEditChange}
                onImage={(file) => handleImage(file, setEditItem, setEditErrors)}
                onRemoveImage={() =>
                  setEditItem((prev) => ({ ...prev, image: "" }))
                }
              />
            </div>

            <div className="TeamManagement-modalFooter">
              <button
                type="button"
                className="TeamManagement-cancelButton"
                onClick={() => setEditItem(null)}
              >
                Cancel
              </button>

              <button type="submit" className="TeamManagement-submitButton">
                <CheckIcon size={17} stroke={2.4} />
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* DELETE POPUP */}
      {deleteItem && (
        <div
          className="TeamManagement-modalOverlay"
          onClick={() => setDeleteItem(null)}
        >
          <div
            className="TeamManagement-modal TeamManagement-deleteModal"
            onClick={(e) => e.stopPropagation()}
            role="alertdialog"
            aria-modal="true"
            aria-label="Delete team member"
          >
            <div className="TeamManagement-deleteIcon">
              <AlertIcon size={26} />
            </div>

            <h3>Delete Team Member?</h3>
            <p>
              You are about to delete this team member. This action cannot be
              undone.
            </p>

            <div className="TeamManagement-deletePreview">
              <img
                src={deleteItem.image}
                alt={deleteItem.name}
                onError={(e) => {
                  e.currentTarget.src = "https://placehold.co/100x100?text=User";
                }}
              />
              <div>
                <strong>{deleteItem.name}</strong>
                <span>{deleteItem.designation}</span>
              </div>
            </div>

            <div className="TeamManagement-modalActions">
              <button
                type="button"
                className="TeamManagement-cancelButton"
                onClick={() => setDeleteItem(null)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="TeamManagement-confirmDelete"
                onClick={handleDelete}
              >
                <TrashIcon size={16} />
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div className={`TeamManagement-toast is-${toast.type}`} role="status">
          <span className="TeamManagement-toastIcon">
            {toast.type === "success" ? (
              <CheckIcon size={15} stroke={2.6} />
            ) : (
              <AlertIcon size={15} />
            )}
          </span>
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default TeamManagement;