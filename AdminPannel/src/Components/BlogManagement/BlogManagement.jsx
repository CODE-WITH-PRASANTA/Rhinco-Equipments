import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiEdit3,
  FiPlus,
  FiSearch,
  FiFilter,
  FiGrid,
  FiList,
  FiEye,
  FiEdit2,
  FiTrash2,
  FiCheckCircle,
  FiClock,
  FiCalendar,
  FiEyeOff,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiTrendingUp,
  FiFileText,
  FiCheck,
  FiAlertTriangle,
  FiStar,
  FiRefreshCw,
  FiLayers,
} from "react-icons/fi";
import {
  BLOGS_API,
  fetchDynamicBlogs,
  fetchDynamicCategories,
} from "./blogData";
import "./BlogManagement.css";

const ITEMS_PER_PAGE = 8;

const BlogManagement = () => {
  const navigate = useNavigate();

  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'table'

  // Selection for bulk actions
  const [selectedIds, setSelectedIds] = useState([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Modals
  const [previewBlog, setPreviewBlog] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null); // blog or 'bulk'
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 3500);
  };

  // Fetch blogs and categories dynamically from MongoDB
  const loadData = async () => {
    setLoading(true);
    try {
      const [fetchedBlogs, fetchedCategories] = await Promise.all([
        fetchDynamicBlogs(),
        fetchDynamicCategories(),
      ]);
      setBlogs(fetchedBlogs);
      setCategories(fetchedCategories);
    } catch (err) {
      console.error("Failed to load blog data:", err);
      showToast("Failed to connect to backend server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Listen for category updates from Category Manager
    window.addEventListener("blog_categories_updated", loadData);
    return () => window.removeEventListener("blog_categories_updated", loadData);
  }, []);

  // Stats
  const stats = useMemo(() => {
    const total = blogs.length;
    const published = blogs.filter((b) => b.status === "Published").length;
    const drafts = blogs.filter((b) => b.status === "Draft").length;
    const totalViews = blogs.reduce((acc, curr) => acc + (Number(curr.views) || 0), 0);
    return { total, published, drafts, totalViews };
  }, [blogs]);

  // Categories list dynamically derived from backend database categories
  const categoriesList = useMemo(() => {
    const catNames = categories.map((c) => c.name);
    return ["ALL", ...catNames];
  }, [categories]);

  // Filtering & Sorting
  const filteredBlogs = useMemo(() => {
    let result = [...blogs];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (b) =>
          b.title?.toLowerCase().includes(q) ||
          b.author?.toLowerCase().includes(q) ||
          b.category?.toLowerCase().includes(q) ||
          b.tags?.some((t) => t.toLowerCase().includes(q)) ||
          b.excerpt?.toLowerCase().includes(q)
      );
    }

    if (selectedCategory !== "ALL") {
      result = result.filter((b) => b.category === selectedCategory);
    }

    if (selectedStatus !== "ALL") {
      result = result.filter((b) => b.status === selectedStatus);
    }

    // Sort
    if (sortBy === "newest") {
      result.sort((a, b) => new Date(b.createdAt || b.publishDate || 0) - new Date(a.createdAt || a.publishDate || 0));
    } else if (sortBy === "oldest") {
      result.sort((a, b) => new Date(a.createdAt || a.publishDate || 0) - new Date(b.createdAt || b.publishDate || 0));
    } else if (sortBy === "views") {
      result.sort((a, b) => (b.views || 0) - (a.views || 0));
    } else if (sortBy === "title") {
      result.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    }

    return result;
  }, [blogs, search, selectedCategory, selectedStatus, sortBy]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredBlogs.length / ITEMS_PER_PAGE) || 1;
  const paginatedBlogs = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredBlogs.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredBlogs, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  // Selection handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(paginatedBlogs.map((b) => b._id || b.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Toggle single status via Backend API
  const handleToggleStatus = async (blog) => {
    const id = blog._id || blog.id;
    const nextStatus = blog.status === "Published" ? "Draft" : "Published";
    try {
      const res = await fetch(`${BLOGS_API}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setBlogs((prev) =>
          prev.map((b) => ((b._id || b.id) === id ? { ...b, status: nextStatus } : b))
        );
        showToast(`Article status updated to ${nextStatus}.`);
      }
    } catch (err) {
      console.error("Status toggle error:", err);
      showToast("Failed to update status on server.");
    }
  };

  // Toggle featured via Backend API
  const handleToggleFeatured = async (blog) => {
    const id = blog._id || blog.id;
    const nextFeatured = !blog.featured;
    try {
      const res = await fetch(`${BLOGS_API}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: nextFeatured }),
      });
      const data = await res.json();
      if (data.success) {
        setBlogs((prev) =>
          prev.map((b) => ((b._id || b.id) === id ? { ...b, featured: nextFeatured } : b))
        );
        showToast("Featured status updated.");
      }
    } catch (err) {
      console.error("Featured toggle error:", err);
      showToast("Failed to update featured flag.");
    }
  };

  // Confirm delete via Backend API
  const handleDeleteConfirm = async () => {
    if (deleteTarget === "bulk") {
      try {
        const res = await fetch(`${BLOGS_API}/bulk-delete`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: selectedIds }),
        });
        const data = await res.json();
        if (data.success) {
          setBlogs((prev) => prev.filter((b) => !selectedIds.includes(b._id || b.id)));
          setSelectedIds([]);
          showToast(`Deleted ${selectedIds.length} article(s).`);
        }
      } catch (err) {
        console.error("Bulk delete error:", err);
        showToast("Failed to delete selected articles.");
      }
    } else if (deleteTarget) {
      const id = deleteTarget._id || deleteTarget.id;
      try {
        const res = await fetch(`${BLOGS_API}/${id}`, {
          method: "DELETE",
        });
        const data = await res.json();
        if (data.success) {
          setBlogs((prev) => prev.filter((b) => (b._id || b.id) !== id));
          showToast(`"${deleteTarget.title}" deleted.`);
        }
      } catch (err) {
        console.error("Delete article error:", err);
        showToast("Failed to delete article.");
      }
    }
    setDeleteTarget(null);
  };

  // Bulk status update via Backend API
  const handleBulkStatusChange = async (newStatus) => {
    try {
      const res = await fetch(`${BLOGS_API}/bulk-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setBlogs((prev) =>
          prev.map((b) =>
            selectedIds.includes(b._id || b.id) ? { ...b, status: newStatus } : b
          )
        );
        setSelectedIds([]);
        showToast(`Updated status of ${selectedIds.length} post(s) to ${newStatus}.`);
      }
    } catch (err) {
      console.error("Bulk status error:", err);
      showToast("Failed to update status for selected articles.");
    }
  };

  return (
    <div className="BlogManagement">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="BlogManagement-toast">
          <FiCheckCircle size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="BlogManagement-header">
        <div className="BlogManagement-headerLeft">
          <div className="BlogManagement-iconWrapper">
            <FiEdit3 size={26} />
          </div>
          <div>
            <span className="BlogManagement-eyebrow">BLOG & ARTICLES / CMS</span>
            <h2>Blog Management</h2>
            <p>Manage all blog articles stored dynamically in your MongoDB database.</p>
          </div>
        </div>

        <div className="BlogManagement-headerActions">
          <button
            type="button"
            className="BlogManagement-btnSecondary"
            onClick={loadData}
            title="Refresh articles from database"
          >
            <FiRefreshCw size={15} className={loading ? "spin" : ""} />
            <span>Sync</span>
          </button>
          <Link to="/category" className="BlogManagement-btnSecondary">
            <FiLayers size={16} />
            <span>Categories</span>
          </Link>
          <Link to="/blog/new" className="BlogManagement-btnPrimary">
            <FiPlus size={18} />
            <span>Create New Blog</span>
          </Link>
        </div>
      </div>

      {/* STATS OVERVIEW CARDS */}
      <div className="BlogManagement-statsGrid">
        <div className="BlogManagement-statCard">
          <div className="BlogManagement-statIcon statIcon--total">
            <FiFileText size={22} />
          </div>
          <div className="BlogManagement-statInfo">
            <span className="BlogManagement-statLabel">Total Articles</span>
            <h3 className="BlogManagement-statValue">{stats.total}</h3>
            <span className="BlogManagement-statMeta">Stored in database</span>
          </div>
        </div>

        <div className="BlogManagement-statCard">
          <div className="BlogManagement-statIcon statIcon--published">
            <FiCheckCircle size={22} />
          </div>
          <div className="BlogManagement-statInfo">
            <span className="BlogManagement-statLabel">Published</span>
            <h3 className="BlogManagement-statValue">{stats.published}</h3>
            <span className="BlogManagement-statMeta">Live on website</span>
          </div>
        </div>

        <div className="BlogManagement-statCard">
          <div className="BlogManagement-statIcon statIcon--drafts">
            <FiClock size={22} />
          </div>
          <div className="BlogManagement-statInfo">
            <span className="BlogManagement-statLabel">Drafts / Review</span>
            <h3 className="BlogManagement-statValue">{stats.drafts}</h3>
            <span className="BlogManagement-statMeta">Unpublished posts</span>
          </div>
        </div>

        <div className="BlogManagement-statCard">
          <div className="BlogManagement-statIcon statIcon--views">
            <FiTrendingUp size={22} />
          </div>
          <div className="BlogManagement-statInfo">
            <span className="BlogManagement-statLabel">Total Readers</span>
            <h3 className="BlogManagement-statValue">
              {stats.totalViews > 999
                ? `${(stats.totalViews / 1000).toFixed(1)}k`
                : stats.totalViews}
            </h3>
            <span className="BlogManagement-statMeta">Total views counter</span>
          </div>
        </div>
      </div>

      {/* FILTER & TOOLBAR BAR */}
      <div className="BlogManagement-toolbar">
        <div className="BlogManagement-searchBox">
          <FiSearch size={18} className="BlogManagement-searchIcon" />
          <input
            type="text"
            placeholder="Search by title, author, category, or tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              type="button"
              className="BlogManagement-searchClear"
              onClick={() => setSearch("")}
            >
              <FiX size={16} />
            </button>
          )}
        </div>

        <div className="BlogManagement-filterGroup">
          {/* Dynamic Categories Dropdown */}
          <div className="BlogManagement-selectWrapper">
            <FiFilter size={14} className="BlogManagement-selectIcon" />
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
            >
              {categoriesList.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === "ALL" ? "All Categories" : cat}
                </option>
              ))}
            </select>
          </div>

          <div className="BlogManagement-selectWrapper">
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="ALL">All Status</option>
              <option value="Published">Published</option>
              <option value="Draft">Draft</option>
            </select>
          </div>

          <div className="BlogManagement-selectWrapper">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="views">Most Viewed</option>
              <option value="title">Title (A-Z)</option>
            </select>
          </div>

          {/* View mode toggle */}
          <div className="BlogManagement-viewToggle">
            <button
              type="button"
              className={`BlogManagement-toggleBtn ${viewMode === "grid" ? "active" : ""}`}
              onClick={() => setViewMode("grid")}
              title="Grid View"
            >
              <FiGrid size={17} />
            </button>
            <button
              type="button"
              className={`BlogManagement-toggleBtn ${viewMode === "table" ? "active" : ""}`}
              onClick={() => setViewMode("table")}
              title="Table View"
            >
              <FiList size={17} />
            </button>
          </div>
        </div>
      </div>

      {/* BULK ACTIONS BAR */}
      {selectedIds.length > 0 && (
        <div className="BlogManagement-bulkBar">
          <div className="BlogManagement-bulkInfo">
            <FiCheck size={18} />
            <span>
              <strong>{selectedIds.length}</strong> article(s) selected
            </span>
          </div>

          <div className="BlogManagement-bulkActions">
            <button
              type="button"
              className="BlogManagement-bulkBtn bulkPublish"
              onClick={() => handleBulkStatusChange("Published")}
            >
              <FiCheckCircle size={15} />
              <span>Mark as Published</span>
            </button>

            <button
              type="button"
              className="BlogManagement-bulkBtn bulkDraft"
              onClick={() => handleBulkStatusChange("Draft")}
            >
              <FiClock size={15} />
              <span>Move to Draft</span>
            </button>

            <button
              type="button"
              className="BlogManagement-bulkBtn bulkDelete"
              onClick={() => setDeleteTarget("bulk")}
            >
              <FiTrash2 size={15} />
              <span>Delete Selected</span>
            </button>

            <button
              type="button"
              className="BlogManagement-bulkClear"
              onClick={() => setSelectedIds([])}
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* CONTENT: EMPTY STATE OR GRID OR TABLE */}
      {loading ? (
        <div className="BlogManagement-empty">
          <p>Loading articles from database...</p>
        </div>
      ) : paginatedBlogs.length === 0 ? (
        <div className="BlogManagement-empty">
          <div className="BlogManagement-emptyIcon">
            <FiFileText size={44} />
          </div>
          <h3>No Blog Articles Found</h3>
          <p>
            {search || selectedCategory !== "ALL" || selectedStatus !== "ALL"
              ? "Try adjusting your search filters or clearing filters."
              : "No dummy content exists. Publish your first real blog article to store it in the database!"}
          </p>
          {search || selectedCategory !== "ALL" || selectedStatus !== "ALL" ? (
            <button
              type="button"
              className="BlogManagement-btnSecondary"
              onClick={() => {
                setSearch("");
                setSelectedCategory("ALL");
                setSelectedStatus("ALL");
              }}
            >
              Reset Filters
            </button>
          ) : (
            <Link to="/blog/new" className="BlogManagement-btnPrimary">
              <FiPlus size={16} />
              <span>Create Blog Post</span>
            </Link>
          )}
        </div>
      ) : viewMode === "grid" ? (
        /* GRID VIEW */
        <div className="BlogManagement-grid">
          {paginatedBlogs.map((blog) => {
            const id = blog._id || blog.id;
            const isSelected = selectedIds.includes(id);
            return (
              <div
                key={id}
                className={`BlogManagement-card ${isSelected ? "is-selected" : ""}`}
              >
                {/* Select Checkbox */}
                <label className="BlogManagement-cardCheckbox" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleToggleSelect(id)}
                  />
                  <span className="BlogManagement-customCheck"></span>
                </label>

                {/* Card Media Banner */}
                <div className="BlogManagement-cardImageWrapper">
                  <img
                    src={blog.image || "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&q=80"}
                    alt={blog.title}
                    loading="lazy"
                  />
                  <div className="BlogManagement-cardBadges">
                    <span className="BlogManagement-categoryBadge">
                      {blog.category || "General"}
                    </span>
                    <span
                      className={`BlogManagement-statusBadge ${
                        blog.status === "Published" ? "status--published" : "status--draft"
                      }`}
                    >
                      {blog.status}
                    </span>
                  </div>

                  {blog.featured && (
                    <button
                      type="button"
                      className="BlogManagement-featuredBadge"
                      title="Featured Article"
                      onClick={() => handleToggleFeatured(blog)}
                    >
                      <FiStar size={13} />
                      <span>Featured</span>
                    </button>
                  )}
                </div>

                {/* Card Body */}
                <div className="BlogManagement-cardBody">
                  <div className="BlogManagement-cardMeta">
                    <span className="BlogManagement-cardDate">
                      <FiCalendar size={13} />
                      {blog.publishDate || "Recent"}
                    </span>
                    <span className="BlogManagement-cardReadTime">
                      <FiClock size={13} />
                      {blog.readTime || "5 min read"}
                    </span>
                  </div>

                  <h4 className="BlogManagement-cardTitle" title={blog.title}>
                    {blog.title}
                  </h4>

                  <p className="BlogManagement-cardExcerpt">
                    {blog.excerpt || "No summary provided for this article."}
                  </p>

                  {/* Tags */}
                  {blog.tags && blog.tags.length > 0 && (
                    <div className="BlogManagement-cardTags">
                      {blog.tags.slice(0, 3).map((tag, i) => (
                        <span key={i} className="BlogManagement-tagPill">
                          #{tag}
                        </span>
                      ))}
                      {blog.tags.length > 3 && (
                        <span className="BlogManagement-tagMore">
                          +{blog.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Author Row */}
                  <div className="BlogManagement-cardAuthorRow">
                    <div className="BlogManagement-authorInfo">
                      <img
                        src={
                          blog.authorAvatar ||
                          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                        }
                        alt={blog.author || "Author"}
                      />
                      <div>
                        <strong>{blog.author || "Admin User"}</strong>
                        <small>{blog.authorRole || "Author"}</small>
                      </div>
                    </div>

                    <div className="BlogManagement-cardViews">
                      <FiEye size={13} />
                      <span>{blog.views || 0}</span>
                    </div>
                  </div>

                  {/* Action Footer */}
                  <div className="BlogManagement-cardActions">
                    <button
                      type="button"
                      className="BlogManagement-actionBtn"
                      title="Quick Preview"
                      onClick={() => setPreviewBlog(blog)}
                    >
                      <FiEye size={15} />
                      <span>Preview</span>
                    </button>

                    <button
                      type="button"
                      className="BlogManagement-actionBtn"
                      title="Edit Blog"
                      onClick={() => navigate(`/blog/new?edit=${id}`)}
                    >
                      <FiEdit2 size={15} />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      className="BlogManagement-actionBtn"
                      title={blog.status === "Published" ? "Unpublish to Draft" : "Publish Article"}
                      onClick={() => handleToggleStatus(blog)}
                    >
                      {blog.status === "Published" ? <FiEyeOff size={15} /> : <FiCheckCircle size={15} />}
                      <span>{blog.status === "Published" ? "Draft" : "Publish"}</span>
                    </button>

                    <button
                      type="button"
                      className="BlogManagement-actionBtn actionBtn--danger"
                      title="Delete Blog"
                      onClick={() => setDeleteTarget(blog)}
                    >
                      <FiTrash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="BlogManagement-tableCard">
          <div className="BlogManagement-tableWrapper">
            <table className="BlogManagement-table">
              <thead>
                <tr>
                  <th style={{ width: "42px" }}>
                    <input
                      type="checkbox"
                      checked={
                        paginatedBlogs.length > 0 &&
                        paginatedBlogs.every((b) => selectedIds.includes(b._id || b.id))
                      }
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th>Article</th>
                  <th>Category</th>
                  <th>Author</th>
                  <th>Status</th>
                  <th>Views</th>
                  <th>Published Date</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedBlogs.map((blog) => {
                  const id = blog._id || blog.id;
                  const isSelected = selectedIds.includes(id);
                  return (
                    <tr key={id} className={isSelected ? "row--selected" : ""}>
                      <td>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(id)}
                        />
                      </td>

                      <td>
                        <div className="BlogManagement-tableArticle">
                          <img
                            src={blog.image || "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=200&q=80"}
                            alt={blog.title}
                            className="BlogManagement-tableThumb"
                          />
                          <div>
                            <div className="BlogManagement-tableTitleRow">
                              <span className="BlogManagement-tableTitle" title={blog.title}>
                                {blog.title}
                              </span>
                              {blog.featured && (
                                <span className="BlogManagement-tableStar" title="Featured Post">
                                  <FiStar size={12} />
                                </span>
                              )}
                            </div>
                            <span className="BlogManagement-tableSlug">
                              /blog/{blog.slug}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="BlogManagement-categoryBadge">
                          {blog.category || "General"}
                        </span>
                      </td>

                      <td>
                        <div className="BlogManagement-tableAuthor">
                          <img
                            src={
                              blog.authorAvatar ||
                              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&auto=format&fit=crop&q=80"
                            }
                            alt=""
                          />
                          <span>{blog.author || "Admin User"}</span>
                        </div>
                      </td>

                      <td>
                        <button
                          type="button"
                          className={`BlogManagement-statusBadge statusBtn ${
                            blog.status === "Published" ? "status--published" : "status--draft"
                          }`}
                          onClick={() => handleToggleStatus(blog)}
                          title="Click to toggle status"
                        >
                          {blog.status}
                        </button>
                      </td>

                      <td>
                        <span className="BlogManagement-tableViews">
                          <FiEye size={13} />
                          {blog.views || 0}
                        </span>
                      </td>

                      <td>
                        <span className="BlogManagement-tableDate">
                          {blog.publishDate || "—"}
                        </span>
                      </td>

                      <td>
                        <div className="BlogManagement-tableActions">
                          <button
                            type="button"
                            className="BlogManagement-iconBtn"
                            title="Preview"
                            onClick={() => setPreviewBlog(blog)}
                          >
                            <FiEye size={15} />
                          </button>
                          <button
                            type="button"
                            className="BlogManagement-iconBtn"
                            title="Edit"
                            onClick={() => navigate(`/blog/new?edit=${id}`)}
                          >
                            <FiEdit2 size={15} />
                          </button>
                          <button
                            type="button"
                            className="BlogManagement-iconBtn iconBtn--delete"
                            title="Delete"
                            onClick={() => setDeleteTarget(blog)}
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
          </div>
        </div>
      )}

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="BlogManagement-pagination">
          <span className="BlogManagement-pageInfo">
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
            {Math.min(currentPage * ITEMS_PER_PAGE, filteredBlogs.length)} of{" "}
            {filteredBlogs.length} articles
          </span>

          <div className="BlogManagement-pageControls">
            <button
              type="button"
              className="BlogManagement-pageBtn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              <FiChevronLeft size={16} />
              <span>Previous</span>
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                type="button"
                className={`BlogManagement-pageNumber ${currentPage === page ? "active" : ""}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}

            <button
              type="button"
              className="BlogManagement-pageBtn"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              <span>Next</span>
              <FiChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ARTICLE PREVIEW MODAL */}
      {previewBlog && (
        <div className="BlogManagement-modalOverlay" onClick={() => setPreviewBlog(null)}>
          <div
            className="BlogManagement-previewModal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="BlogManagement-modalHeader">
              <div className="BlogManagement-modalHeaderTitle">
                <span className="BlogManagement-categoryBadge">
                  {previewBlog.category}
                </span>
                <span
                  className={`BlogManagement-statusBadge ${
                    previewBlog.status === "Published" ? "status--published" : "status--draft"
                  }`}
                >
                  {previewBlog.status}
                </span>
              </div>
              <button
                type="button"
                className="BlogManagement-modalClose"
                onClick={() => setPreviewBlog(null)}
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="BlogManagement-modalContent">
              <div className="BlogManagement-previewHero">
                <img
                  src={previewBlog.image}
                  alt={previewBlog.title}
                />
              </div>

              <div className="BlogManagement-previewMetaRow">
                <div className="BlogManagement-previewAuthor">
                  <img src={previewBlog.authorAvatar} alt="" />
                  <div>
                    <strong>{previewBlog.author}</strong>
                    <span>{previewBlog.authorRole || "Author"}</span>
                  </div>
                </div>

                <div className="BlogManagement-previewStats">
                  <span>
                    <FiCalendar size={14} /> {previewBlog.publishDate}
                  </span>
                  <span>
                    <FiClock size={14} /> {previewBlog.readTime}
                  </span>
                  <span>
                    <FiEye size={14} /> {previewBlog.views || 0} views
                  </span>
                </div>
              </div>

              <h2 className="BlogManagement-previewTitle">{previewBlog.title}</h2>

              {previewBlog.excerpt && (
                <div className="BlogManagement-previewExcerpt">
                  {previewBlog.excerpt}
                </div>
              )}

              {/* Formatted Content */}
              <div
                className="BlogManagement-previewArticleBody"
                dangerouslySetInnerHTML={{ __html: previewBlog.content || "<p>No content provided.</p>" }}
              />

              {previewBlog.tags && previewBlog.tags.length > 0 && (
                <div className="BlogManagement-previewTags">
                  <strong>Tags:</strong>
                  {previewBlog.tags.map((t, idx) => (
                    <span key={idx} className="BlogManagement-tagPill">
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="BlogManagement-modalFooter">
              <button
                type="button"
                className="BlogManagement-btnSecondary"
                onClick={() => setPreviewBlog(null)}
              >
                Close Preview
              </button>
              <button
                type="button"
                className="BlogManagement-btnPrimary"
                onClick={() => {
                  const id = previewBlog._id || previewBlog.id;
                  setPreviewBlog(null);
                  navigate(`/blog/new?edit=${id}`);
                }}
              >
                <FiEdit2 size={16} />
                <span>Edit Article</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteTarget && (
        <div className="BlogManagement-modalOverlay" onClick={() => setDeleteTarget(null)}>
          <div
            className="BlogManagement-confirmModal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="BlogManagement-confirmIcon">
              <FiAlertTriangle size={30} />
            </div>
            <h3>
              {deleteTarget === "bulk"
                ? `Delete ${selectedIds.length} Selected Articles?`
                : "Delete Blog Post?"}
            </h3>
            <p>
              {deleteTarget === "bulk"
                ? `Are you sure you want to delete these ${selectedIds.length} selected articles from the database?`
                : `Are you sure you want to permanently delete "${deleteTarget.title}" from the database?`}
            </p>
            <div className="BlogManagement-confirmActions">
              <button
                type="button"
                className="BlogManagement-btnSecondary"
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="BlogManagement-btnDanger"
                onClick={handleDeleteConfirm}
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

export default BlogManagement;
