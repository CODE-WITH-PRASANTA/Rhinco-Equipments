import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FiGrid,
  FiList,
  FiSearch,
  FiFilter,
  FiChevronDown,
  FiMoreVertical,
  FiEye,
  FiEdit2,
  FiTrash2,
  FiCalendar,
  FiUser,
  FiPlus,
  FiArrowUpRight,
  FiCheckCircle,
  FiClock,
  FiFileText,
  FiX,
  FiImage,
  FiMapPin,
  FiTag,
  FiFolder,
  FiFile,
  FiMessageSquare,
} from "react-icons/fi";

import "./EquipmentManagement.css";
import { API_ENDPOINTS } from "../../config/api";

const MACHINERY_API = API_ENDPOINTS.MACHINERY;

const getItemId = (item) => item?._id || item?.id;

const equipmentCategories = [
  "Excavators",
  "Loaders",
  "Cranes & Lifting",
  "Road Construction",
  "Earthmoving",
  "Material Handling",
  "Generators & Compressors",
  "Attachments & Parts",
  "Agricultural Equipment",
];

const statusOptions = ["Available", "Reserved", "Sold"];

/* =========================================================
   HELPERS
========================================================= */

const getTags = (tags) => {
  if (Array.isArray(tags)) return tags;

  if (typeof tags === "string") {
    return tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  return [];
};

const getImage = (item) => {
  if (!item) return "";
  const images = item.machineImages || item.images || [];
  const first = images[0] || item.featuredImage || item.mainImage || item.image;

  if (!first) return "";
  if (typeof first === "string") return first;

  return first.data || first.preview || first.url || "";
};

const getAuthor = (item) =>
  item.brandName || item.postedBy || item.authorName || item.author || "Rhinco Equipment";

const getDescription = (item) => {
  const description = item.description || item.excerpt || "";

  return description
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 150);
};

const getDate = (item) =>
  item.createdAt || item.publishDate || item.date || "";

const formatDate = (date) => {
  if (!date) return "—";

  try {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return String(date);
  }
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

const EquipmentManagement = () => {
  const navigate = useNavigate();

  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All Equipment Types");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [openMenu, setOpenMenu] = useState(null);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [notice, setNotice] = useState("");

  const itemsPerPage = 6;

  /* =====================================================
     LOAD REAL DATA FROM MONGODB
  ===================================================== */

  const loadEquipment = async () => {
    setLoading(true);
    try {
      const res = await fetch(MACHINERY_API);
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.data)) {
        setEquipment(data.data);
      }
    } catch (err) {
      console.error("Error fetching machinery equipment:", err);
      setNotice("Could not connect to database. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEquipment();
  }, []);

  // CLOSE DROPDOWN MENU WHEN CLICKING OUTSIDE
  useEffect(() => {
    if (!openMenu) return;

    const handlePointerDown = (e) => {
      if (e.target && e.target.closest && e.target.closest(".EquipmentManagement-cardMenu")) {
        return;
      }
      setOpenMenu(null);
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [openMenu]);

  /* =====================================================
     CREATE EQUIPMENT
  ===================================================== */

  const handleCreate = () => {
    setOpenMenu(null);
    navigate("/machinery-equipment/add");
  };

  /* =====================================================
     EDIT EQUIPMENT
  ===================================================== */

  const handleEdit = (item) => {
    setOpenMenu(null);
    setSelectedEquipment(null);
    const id = getItemId(item);

    navigate(`/machinery-equipment/add?edit=${id}`, {
      state: {
        equipment: item,
        isEditing: true,
      },
    });
  };

  /* =====================================================
     EQUIPMENT TYPE FILTERS
  ===================================================== */

  const availableEquipmentCategories = useMemo(
    () => [
      "All Equipment Types",
      ...new Set(
        equipment
          .map((item) => item.category)
          .filter(Boolean)
      ),
    ],
    [equipment]
  );

  /* =====================================================
     FILTER AND SORT
  ===================================================== */

  const filteredEquipment = useMemo(() => {
    const query = search.trim().toLowerCase();

    return equipment
      .filter((item) => {
        const tags = getTags(item.tags);

        const matchesSearch =
          !query ||
          (item.title || "").toLowerCase().includes(query) ||
          getAuthor(item).toLowerCase().includes(query) ||
          (item.category || "").toLowerCase().includes(query) ||
          (item.code || item.equipmentCode || "")
            .toLowerCase()
            .includes(query) ||
          (item.location || "").toLowerCase().includes(query) ||
          tags.some((tag) =>
            tag.toLowerCase().includes(query)
          );

        const matchesCategory =
          typeFilter === "All Equipment Types" ||
          item.category === typeFilter;

        const matchesStatus =
          statusFilter === "All Status" ||
          (item.status || "Available") === statusFilter;

        return (
          matchesSearch &&
          matchesCategory &&
          matchesStatus
        );
      })
      .sort((a, b) => {
        if (sortBy === "oldest") {
          return (
            new Date(getDate(a)) -
            new Date(getDate(b))
          );
        }

        if (sortBy === "title") {
          return (a.title || "").localeCompare(
            b.title || ""
          );
        }

        if (sortBy === "mostViewed") {
          return (b.enquiries || 0) - (a.enquiries || 0);
        }

        return (
          new Date(getDate(b)) -
          new Date(getDate(a))
        );
      });
  }, [
    equipment,
    search,
    typeFilter,
    statusFilter,
    sortBy,
  ]);

  /* =====================================================
     PAGINATION
  ===================================================== */

  const totalPages = Math.max(
    1,
    Math.ceil(filteredEquipment.length / itemsPerPage)
  );

  const safePage = Math.min(currentPage, totalPages);

  const startIndex = (safePage - 1) * itemsPerPage;

  const visibleEquipment = filteredEquipment.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  /* =====================================================
     STATISTICS
  ===================================================== */

  const availableCount = equipment.filter(
    (item) => item.status === "Available"
  ).length;

  const reservedCount = equipment.filter(
    (item) => item.status === "Reserved"
  ).length;

  const soldCount = equipment.filter(
    (item) => item.status === "Sold"
  ).length;

  const totalEnquiries = equipment.reduce(
    (sum, item) => sum + (Number(item.enquiries) || 0),
    0
  );

  /* =====================================================
     FILTER HANDLERS
  ===================================================== */

  const changeFilter = (setter, value) => {
    setter(value);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setTypeFilter("All Equipment Types");
    setStatusFilter("All Status");
    setSortBy("newest");
    setCurrentPage(1);
  };

  const showNotice = (message) => {
    setNotice(message);
    setOpenMenu(null);
  };

  /* =====================================================
     DELETE EQUIPMENT FROM DATABASE
  ===================================================== */

  const handleDelete = async () => {
    if (deleteId === null) return;

    try {
      const res = await fetch(`${MACHINERY_API}/${deleteId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to delete equipment.");
      }

      showNotice("Equipment post deleted successfully from database.");
      await loadEquipment();

      if (selectedEquipment && getItemId(selectedEquipment) === deleteId) {
        setSelectedEquipment(null);
      }
    } catch (err) {
      console.error("Delete error:", err);
      showNotice(err.message || "Could not delete equipment.");
    } finally {
      setDeleteId(null);
    }
  };

  /* =====================================================
     CHANGE STATUS IN DATABASE
  ===================================================== */

  const handleStatusChange = async (item) => {
    const nextStatus = item.status === "Available" ? "Reserved" : "Available";
    const id = getItemId(item);

    try {
      const res = await fetch(`${MACHINERY_API}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update status.");
      }

      showNotice(`Equipment status changed to ${nextStatus}.`);
      await loadEquipment();

      if (selectedEquipment && getItemId(selectedEquipment) === id) {
        setSelectedEquipment((previous) => ({
          ...previous,
          status: nextStatus,
        }));
      }
    } catch (err) {
      console.error("Status update error:", err);
      showNotice(err.message || "Could not update status.");
    }
  };

  /* =====================================================
     STATUS COMPONENT
  ===================================================== */

  const renderStatus = (status = "Available") => (
    <span
      className={`EquipmentManagement-status EquipmentManagement-status--${status.toLowerCase()}`}
    >
      <span className="EquipmentManagement-statusDot" />
      {status}
    </span>
  );

  /* =====================================================
     ACTION MENU
  ===================================================== */

  const renderActions = (item) => {
    const id = getItemId(item);

    return (
      <div className="EquipmentManagement-cardMenu" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="EquipmentManagement-menuTrigger"
          onClick={(e) => {
            e.stopPropagation();
            setOpenMenu(openMenu === id ? null : id);
          }}
          aria-label={`Actions for ${item.title}`}
          aria-expanded={openMenu === id}
        >
          <FiMoreVertical />
        </button>

        {openMenu === id && (
          <div
            className="EquipmentManagement-menuDropdown"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedEquipment(item);
                setOpenMenu(null);
              }}
            >
              <FiEye />
              View equipment
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(item);
              }}
            >
              <FiEdit2 />
              Edit equipment
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleStatusChange(item);
                setOpenMenu(null);
              }}
            >
              {item.status === "Available" ? (
                <FiClock />
              ) : (
                <FiCheckCircle />
              )}

              {item.status === "Available"
                ? "Mark as reserved"
                : "Mark as available"}
            </button>

            <button
              type="button"
              className="EquipmentManagement-menuDelete"
              onClick={(e) => {
                e.stopPropagation();
                setDeleteId(id);
                setOpenMenu(null);
              }}
            >
              <FiTrash2 />
              Delete item
            </button>
          </div>
        )}
      </div>
    );
  };

  /* =====================================================
     MAIN JSX
  ===================================================== */

  return (
    <div className="EquipmentManagement">

      {/* HEADER */}

      <div className="EquipmentManagement-header">

        <div className="EquipmentManagement-heading">

          <span className="EquipmentManagement-headingIcon">
            <FiFileText />
          </span>

          <div>
            <span className="EquipmentManagement-eyebrow">
              RHINO'S EQUIPMENT
            </span>

            <h1>Equipment Management</h1>

            <p>
              Manage industry insights, machinery updates
              and company news.
            </p>
          </div>

        </div>

        <button
          type="button"
          className="EquipmentManagement-createButton"
          onClick={handleCreate}
        >
          <FiPlus />
          Add Equipment
        </button>

      </div>

      {/* NOTIFICATION */}

      {notice && (
        <div className="EquipmentManagement-notice" role="status">

          <FiCheckCircle />

          <span>{notice}</span>

          <button
            type="button"
            aria-label="Dismiss message"
            onClick={() => setNotice("")}
          >
            <FiX />
          </button>

        </div>
      )}

      {/* STATISTICS */}

      <div className="EquipmentManagement-stats">

        <div className="EquipmentManagement-statCard">
          <span className="EquipmentManagement-statIcon">
            <FiFileText />
          </span>

          <div>
            <span>Total Equipment</span>
            <strong>{equipment.length}</strong>
            <small>All equipment listings</small>
          </div>
        </div>

        <div className="EquipmentManagement-statCard">
          <span className="EquipmentManagement-statIcon EquipmentManagement-statIcon--green">
            <FiCheckCircle />
          </span>

          <div>
            <span>Available</span>
            <strong>{availableCount}</strong>
            <small>Ready for enquiry</small>
          </div>
        </div>

        <div className="EquipmentManagement-statCard">
          <span className="EquipmentManagement-statIcon EquipmentManagement-statIcon--amber">
            <FiFileText />
          </span>

          <div>
            <span>Reserved</span>
            <strong>{reservedCount}</strong>
            <small>Awaiting confirmation</small>
          </div>
        </div>

        <div className="EquipmentManagement-statCard">
          <span className="EquipmentManagement-statIcon EquipmentManagement-statIcon--blue">
            <FiEye />
          </span>

          <div>
            <span>Total Enquiries</span>
            <strong>{totalEnquiries.toLocaleString("en-IN")}</strong>
            <small>{soldCount} sold listings</small>
          </div>
        </div>

      </div>

      {/* EQUIPMENT COLLECTION */}

      <section className="EquipmentManagement-panel">

        <div className="EquipmentManagement-panelHeader">

          <div>
            <h2>Your Equipment Collection</h2>
            <p>
              Browse, edit and organize your equipment listings.
            </p>
          </div>

          <div
            className="EquipmentManagement-viewToggle"
            aria-label="View mode"
          >

            <button
              type="button"
              className={
                viewMode === "grid"
                  ? "EquipmentManagement-viewButton EquipmentManagement-viewButton--active"
                  : "EquipmentManagement-viewButton"
              }
              onClick={() => setViewMode("grid")}
              aria-label="Grid view"
              aria-pressed={viewMode === "grid"}
            >
              <FiGrid />
            </button>

            <button
              type="button"
              className={
                viewMode === "list"
                  ? "EquipmentManagement-viewButton EquipmentManagement-viewButton--active"
                  : "EquipmentManagement-viewButton"
              }
              onClick={() => setViewMode("list")}
              aria-label="List view"
              aria-pressed={viewMode === "list"}
            >
              <FiList />
            </button>

          </div>

        </div>

        {/* SEARCH AND FILTERS */}

        <div className="EquipmentManagement-toolbar">

          <label className="EquipmentManagement-search">

            <FiSearch />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                changeFilter(setSearch, event.target.value)
              }
              placeholder="Search equipment, brand, model, location..."
              aria-label="Search equipment listings"
            />

            {search && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => changeFilter(setSearch, "")}
              >
                <FiX />
              </button>
            )}

          </label>

          <label className="EquipmentManagement-selectWrap">

            <FiFilter />

            <select
              value={typeFilter}
              onChange={(event) =>
                changeFilter(
                  setTypeFilter,
                  event.target.value
                )
              }
              aria-label="Filter by equipment type"
            >
              {availableEquipmentCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <FiChevronDown className="EquipmentManagement-selectArrow" />

          </label>

          <label className="EquipmentManagement-selectWrap">

            <select
              value={statusFilter}
              onChange={(event) =>
                changeFilter(
                  setStatusFilter,
                  event.target.value
                )
              }
              aria-label="Filter by status"
            >
              <option value="All Status">All Status</option>

              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>

            <FiChevronDown className="EquipmentManagement-selectArrow" />

          </label>

          <label className="EquipmentManagement-selectWrap EquipmentManagement-sortSelect">

            <select
              value={sortBy}
              onChange={(event) =>
                changeFilter(setSortBy, event.target.value)
              }
              aria-label="Sort equipment listings"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title">Title A–Z</option>
              <option value="mostViewed">Most Enquiries</option>
            </select>

            <FiChevronDown className="EquipmentManagement-selectArrow" />

          </label>

        </div>

        {/* RESULTS COUNT */}

        <div className="EquipmentManagement-resultsBar">

          <p>
            Showing <strong>{filteredEquipment.length}</strong> item{" "}
            {filteredEquipment.length === 1 ? "listing" : "listings"}
          </p>

          {(search ||
            typeFilter !== "All Equipment Types" ||
            statusFilter !== "All Status" ||
            sortBy !== "newest") && (
            <button
              type="button"
              onClick={clearFilters}
            >
              <FiX />
              Clear filters
            </button>
          )}

        </div>

        {/* GRID VIEW */}

        {viewMode === "grid" && filteredEquipment.length > 0 && (
          <div className="EquipmentManagement-grid">

            {visibleEquipment.map((item) => {
              const id = getItemId(item);
              return (
                <article
                  className={`EquipmentManagement-card ${openMenu === id ? "EquipmentManagement-card--activeMenu" : ""}`}
                  key={id}
                >

                  <div className="EquipmentManagement-cardImage">

                    {getImage(item) ? (
                      <img
                        src={getImage(item)}
                        alt={item.title}
                        loading="lazy"
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="EquipmentManagement-noImage">
                        <FiImage />
                      </div>
                    )}

                    <span className="EquipmentManagement-equipmentCode">
                      {item.code || `EQP-${String(id).slice(-4)}`}
                    </span>

                    {renderActions(item)}

                    <div className="EquipmentManagement-imageStatus">
                      {renderStatus(item.status)}
                    </div>

                  </div>

                  <div className="EquipmentManagement-cardBody">

                    <span className="EquipmentManagement-category">
                      {item.category || "Uncategorized"}
                    </span>

                    <h3>{item.title}</h3>

                    <p className="EquipmentManagement-excerpt">
                      {getDescription(item)}
                    </p>

                    <div className="EquipmentManagement-author">
                      <FiUser />
                      <span>{getAuthor(item)}</span>
                    </div>

                    <div className="EquipmentManagement-cardFooter">

                      <div className="EquipmentManagement-cardMeta">

                        <span>
                          <FiCalendar />
                          {formatDate(getDate(item))}
                        </span>

                        <span>
                          <FiEye />
                          {(item.enquiries || 0).toLocaleString("en-IN")} enquiries
                        </span>

                      </div>

                      <button
                        type="button"
                        className="EquipmentManagement-viewLink"
                        onClick={() => setSelectedEquipment(item)}
                      >
                        View <FiArrowUpRight />
                      </button>

                    </div>

                  </div>

                </article>
              );
            })}
          </div>
        )}

        {/* LIST VIEW */}

        {viewMode === "list" && filteredEquipment.length > 0 && (
          <div className="EquipmentManagement-listWrap">

            <table className="EquipmentManagement-table">

              <thead>
                <tr>
                  <th>Equipment Post</th>
                  <th>Equipment Type</th>
                  <th>Added By</th>
                  <th>Status</th>
                  <th>Enquiries</th>
                  <th>Listed Date</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>

                {visibleEquipment.map((item) => {
                  const id = getItemId(item);
                  return (
                    <tr key={id}>

                      <td>
                        <div className="EquipmentManagement-listPost">

                          {getImage(item) ? (
                            <img
                              src={getImage(item)}
                              alt={item.title}
                              loading="lazy"
                            />
                          ) : (
                            <div className="EquipmentManagement-noImage">
                              <FiImage />
                            </div>
                          )}

                          <div>
                            <strong>{item.title}</strong>

                            <span>
                              {item.code || `EQP-${String(id).slice(-4)}`}
                            </span>

                            <small>{getDescription(item)}</small>
                          </div>

                        </div>
                      </td>

                      <td>
                        <span className="EquipmentManagement-category">
                          {item.category}
                        </span>
                      </td>

                      <td>
                        <span className="EquipmentManagement-listAuthor">
                          <FiUser />
                          {getAuthor(item)}
                        </span>
                      </td>

                      <td>
                        {renderStatus(item.status)}
                      </td>

                      <td>
                        {(item.enquiries || 0).toLocaleString("en-IN")}
                      </td>

                      <td>
                        {formatDate(getDate(item))}
                      </td>

                      <td>
                        <div className="EquipmentManagement-listActions">

                          <button
                            type="button"
                            aria-label={`View ${item.title}`}
                            title="View"
                            onClick={() => setSelectedEquipment(item)}
                          >
                            <FiEye />
                          </button>

                          <button
                            type="button"
                            aria-label={`Edit ${item.title}`}
                            title="Edit"
                            onClick={() => handleEdit(item)}
                          >
                            <FiEdit2 />
                          </button>

                          <button
                            type="button"
                            className="EquipmentManagement-listDelete"
                            aria-label={`Delete ${item.title}`}
                            title="Delete"
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

          </div>
        )}

        {/* EMPTY STATE */}

        {filteredEquipment.length === 0 && (
          <div className="EquipmentManagement-empty">

            <span>
              <FiImage />
            </span>

            <h3>No equipment listings found</h3>

            <p>
              Try changing your search or filters to find equipment.
            </p>

            <button
              type="button"
              onClick={clearFilters}
            >
              Clear all filters
            </button>

          </div>
        )}

        {/* PAGINATION */}

        {filteredEquipment.length > 0 && (
          <div className="EquipmentManagement-pagination">

            <span>
              Showing {startIndex + 1}–
              {Math.min(
                startIndex + itemsPerPage,
                filteredEquipment.length
              )}{" "}
              of {filteredEquipment.length} listings
            </span>

            <div className="EquipmentManagement-pageButtons">

              <button
                type="button"
                disabled={safePage === 1}
                onClick={() => setCurrentPage(safePage - 1)}
                aria-label="Previous page"
              >
                ‹
              </button>

              {Array.from(
                { length: totalPages },
                (_, index) => index + 1
              ).map((page) => (
                <button
                  type="button"
                  key={page}
                  className={
                    page === safePage
                      ? "EquipmentManagement-pageButton--active"
                      : ""
                  }
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                disabled={safePage === totalPages}
                onClick={() => setCurrentPage(safePage + 1)}
                aria-label="Next page"
              >
                ›
              </button>

            </div>

          </div>
        )}

      </section>

      {/* =================================================
         EQUIPMENT PREVIEW MODAL
      ================================================= */}

      {selectedEquipment && (
        <div
          className="EquipmentManagement-modalBackdrop"
          onClick={() => setSelectedEquipment(null)}
        >

          <section
            className="EquipmentManagement-detailModal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="EquipmentManagement-detailTitle"
            onClick={(event) => event.stopPropagation()}
          >

            <div className="EquipmentManagement-modalHeader">

              <div>
                <span className="EquipmentManagement-eyebrow">
                  RHINO'S EQUIPMENT
                </span>

                <h2 id="EquipmentManagement-detailTitle">
                  Equipment Details
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedEquipment(null)}
                aria-label="Close details"
              >
                <FiX />
              </button>

            </div>

            {getImage(selectedEquipment) && (
              <img
                className="EquipmentManagement-detailImage"
                src={getImage(selectedEquipment)}
                alt={selectedEquipment.title}
              />
            )}

            <div className="EquipmentManagement-detailBody">

              <div className="EquipmentManagement-detailMeta">

                {renderStatus(selectedEquipment.status)}

                <span className="EquipmentManagement-category">
                  {selectedEquipment.category}
                </span>

                <span>
                  <FiCalendar />
                  {formatDate(getDate(selectedEquipment))}
                </span>

              </div>

              <h3>{selectedEquipment.title}</h3>

              <div className="EquipmentManagement-detailAuthor">
                <FiUser />
                Added by {getAuthor(selectedEquipment)}
              </div>

              {selectedEquipment.location && (
                <div className="EquipmentManagement-detailAuthor">
                  <FiMapPin />
                  {selectedEquipment.location}
                </div>
              )}
              <div className="EquipmentManagement-detailSpecs">
                {[
                  ["Manufacturer", selectedEquipment.manufacturer],
                  ["Model", selectedEquipment.model],
                  ["Year", selectedEquipment.year],
                  ["Operating Hours", selectedEquipment.operatingHours],
                  ["Condition", selectedEquipment.condition],
                  ["Asking Price", selectedEquipment.price],
                ].filter(([, value]) => value).map(([label, value]) => (
                  <div key={label}>
                    <span>{label}</span>
                    <strong>{value}</strong>
                  </div>
                ))}
              </div>

              <div
                className="EquipmentManagement-detailDescription"
                dangerouslySetInnerHTML={{
                  __html:
                    selectedEquipment.description ||
                    `<p>${selectedEquipment.excerpt || ""}</p>`,
                }}
              />

             {selectedEquipment.quote && (
  <blockquote className="EquipmentManagement-detailQuote">
    <FiMessageSquare />
    {selectedEquipment.quote}
  </blockquote>
)}

              {selectedEquipment.otherImages?.length > 0 && (
                <div className="EquipmentManagement-detailImages">

                  <h4>Additional Images</h4>

                  <div>
                    {selectedEquipment.otherImages.map((image, index) => (
                      <img
                        key={index}
                        src={
                          typeof image === "string"
                            ? image
                            : image.data || image.preview
                        }
                        alt={image.name || `Equipment image ${index + 1}`}
                      />
                    ))}
                  </div>

                </div>
              )}

              {getTags(selectedEquipment.tags).length > 0 && (
                <div className="EquipmentManagement-detailTags">

                  {getTags(selectedEquipment.tags).map((tag) => (
                    <span key={tag}>#{tag}</span>
                  ))}

                </div>
              )}

              {(selectedEquipment.seoTitle ||
                selectedEquipment.seoDescription) && (
                <div className="EquipmentManagement-detailSEO">

                  <h4>SEO Information</h4>

                  {selectedEquipment.seoTitle && (
                    <p>
                      <strong>SEO Title:</strong>{" "}
                      {selectedEquipment.seoTitle}
                    </p>
                  )}

                  {selectedEquipment.seoDescription && (
                    <p>{selectedEquipment.seoDescription}</p>
                  )}

                </div>
              )}

              {selectedEquipment.documents?.length > 0 && (
                <div className="EquipmentManagement-detailDocuments">

                  <h4>Attached Documents</h4>

                  {selectedEquipment.documents.map((document, index) => (
                    <div
                      key={index}
                      className="EquipmentManagement-detailDocument"
                    >
                      <FiFile />

                      <span>
                        {document.name || `Document ${index + 1}`}
                      </span>
                    </div>
                  ))}

                </div>
              )}

            </div>

            <div className="EquipmentManagement-modalFooter">

              <button
                type="button"
                className="EquipmentManagement-modalSecondary"
                onClick={() => setSelectedEquipment(null)}
              >
                Close
              </button>

              <button
                type="button"
                className="EquipmentManagement-createButton"
                onClick={() => handleEdit(selectedEquipment)}
              >
                <FiEdit2 />
                Edit Equipment
              </button>

            </div>

          </section>

        </div>
      )}

      {/* =================================================
         DELETE CONFIRMATION
      ================================================= */}

      {deleteId !== null && (
        <div
          className="EquipmentManagement-modalBackdrop"
          onClick={() => setDeleteId(null)}
        >

          <section
            className="EquipmentManagement-confirmModal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="EquipmentManagement-deleteTitle"
            onClick={(event) => event.stopPropagation()}
          >

            <span className="EquipmentManagement-deleteIcon">
              <FiTrash2 />
            </span>

            <h2 id="EquipmentManagement-deleteTitle">
              Delete item post?
            </h2>

            <p>
              This item will be removed from your local
              item collection. This action cannot be undone.
            </p>

            <div className="EquipmentManagement-confirmActions">

              <button
                type="button"
                className="EquipmentManagement-modalSecondary"
                onClick={() => setDeleteId(null)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="EquipmentManagement-confirmDelete"
                onClick={handleDelete}
              >
                <FiTrash2 />
                Delete Equipment
              </button>

            </div>

          </section>

        </div>
      )}

    </div>
  );
};

export default EquipmentManagement;