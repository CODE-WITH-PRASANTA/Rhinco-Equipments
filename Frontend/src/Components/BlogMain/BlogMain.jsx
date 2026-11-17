import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  Clock,
  User,
  ArrowRight,
  Search,
  BookOpen,
  Sparkles,
  Tag,
  Share2,
} from "lucide-react";
import "./BlogMain.css";
import { resolveImageUrl } from "../../utils/helpers";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const BLOGS_API = `${API_URL}/blogs`;

const BlogMain = () => {
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    let isMounted = true;
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const res = await fetch(BLOGS_API);
        const data = await res.json();
        if (res.ok && data.success && Array.isArray(data.data)) {
          if (isMounted) {
            setBlogPosts(data.data);
          }
        }
      } catch (err) {
        console.error("Error fetching blogs in BlogMain:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchBlogs();
    return () => {
      isMounted = false;
    };
  }, []);

  // Derive categories dynamically from database
  const blogCategories = useMemo(() => {
    const set = new Set(["All"]);
    blogPosts.forEach((post) => {
      if (post.category) set.add(post.category);
    });
    return Array.from(set);
  }, [blogPosts]);

  // Filtered posts based on active category and search query
  const filteredPosts = useMemo(() => {
    let posts = blogPosts;

    if (activeCategory !== "All") {
      posts = posts.filter(
        (post) =>
          (post.category || "").toLowerCase() === activeCategory.toLowerCase()
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      posts = posts.filter(
        (post) =>
          (post.title || "").toLowerCase().includes(q) ||
          (post.excerpt || "").toLowerCase().includes(q) ||
          (post.category || "").toLowerCase().includes(q) ||
          (post.author || "").toLowerCase().includes(q)
      );
    }

    return posts;
  }, [blogPosts, activeCategory, searchQuery]);

  return (
    <section className="BlogMain-section">
      <div className="BlogMain-container">

        {/* HEADER SECTION */}
        <div className="BlogMain-header">
          <div className="BlogMain-heading-content">
            <div className="BlogMain-eyebrow-wrap">
              <Sparkles size={14} className="BlogMain-eyebrow-icon" />
              <span className="BlogMain-eyebrow">RHINCO AGRO KNOWLEDGE HUB</span>
            </div>

            <h1 className="BlogMain-heading">
              Innovations & Insights for <span>Modern Agriculture</span>
            </h1>

            <p className="BlogMain-intro">
              Explore expert guides, machinery maintenance tips, precision farming techniques,
              and crop protection strategies curated by Rhinco farm engineers.
            </p>
          </div>

          <div className="BlogMain-header-stats">
            <div className="BlogMain-stat-item">
              <span className="BlogMain-stat-number">
                {String(blogPosts.length).padStart(2, "0")}
              </span>
              <span className="BlogMain-stat-label">Published Articles</span>
            </div>
            <div className="BlogMain-stat-divider" />
            <div className="BlogMain-stat-item">
              <span className="BlogMain-stat-number">
                {String(blogCategories.length - 1).padStart(2, "0")}
              </span>
              <span className="BlogMain-stat-label">Topic Categories</span>
            </div>
          </div>
        </div>

        {/* SEARCH & CATEGORY FILTER BAR */}
        <div className="BlogMain-controls-bar">
          <div className="BlogMain-search-wrap">
            <Search size={17} className="BlogMain-search-icon" />
            <input
              type="text"
              placeholder="Search guides by keyword, machine, crop..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="BlogMain-search-input"
            />
            {searchQuery && (
              <button
                type="button"
                className="BlogMain-search-clear"
                onClick={() => setSearchQuery("")}
              >
                ✕
              </button>
            )}
          </div>

          <div className="BlogMain-categories-scroll">
            {blogCategories.map((cat) => {
              const count =
                cat === "All"
                  ? blogPosts.length
                  : blogPosts.filter(
                      (p) => (p.category || "").toLowerCase() === cat.toLowerCase()
                    ).length;

              return (
                <button
                  type="button"
                  key={cat}
                  className={`BlogMain-cat-btn ${activeCategory === cat ? "active" : ""}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  <span>{cat}</span>
                  <span className="BlogMain-cat-count">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ARTICLES GRID */}
        {loading ? (
          <div className="BlogMain-loading">
            <div className="BlogMain-spinner" />
            <p>Loading Rhinco articles...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="BlogMain-empty">
            <BookOpen size={48} className="BlogMain-empty-icon" />
            <h3>No articles found</h3>
            <p>Try searching with another keyword or select "All" topics.</p>
            <button
              type="button"
              className="BlogMain-reset-btn"
              onClick={() => {
                setActiveCategory("All");
                setSearchQuery("");
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="BlogMain-grid">
            {filteredPosts.map((post, idx) => {
              const postSlug = post.slug || post._id;
              const dateStr = post.publishDate || post.createdAt;
              const formattedDate = dateStr
                ? new Date(dateStr).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "Recent";

              return (
                <article className="BlogMain-card" key={post._id || idx}>
                  <div className="BlogMain-card-media">
                    <Link to={`/blog/${postSlug}`} tabIndex={-1}>
                      <img
                        src={resolveImageUrl(post.image, "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80")}
                        alt={post.title}
                        className="BlogMain-card-img"
                        loading="lazy"
                      />
                    </Link>

                    {post.category && (
                      <span className="BlogMain-card-category">
                        {post.category}
                      </span>
                    )}

                    <span className="BlogMain-card-readtime">
                      <Clock size={11} />
                      {post.readTime || "5 min"}
                    </span>
                  </div>

                  <div className="BlogMain-card-body">
                    <div className="BlogMain-card-meta">
                      <span className="BlogMain-card-date">
                        <Calendar size={12} />
                        {formattedDate}
                      </span>
                    </div>

                    <h3 className="BlogMain-card-title">
                      <Link to={`/blog/${postSlug}`}>{post.title}</Link>
                    </h3>

                    <p className="BlogMain-card-excerpt">
                      {post.excerpt || (post.content ? post.content.replace(/<[^>]+>/g, "").slice(0, 130) + "..." : "")}
                    </p>

                    <div className="BlogMain-card-footer">
                      <div className="BlogMain-card-author">
                        {post.authorAvatar ? (
                          <img
                            src={resolveImageUrl(post.authorAvatar)}
                            alt={post.author}
                            className="BlogMain-card-avatar"
                          />
                        ) : (
                          <div className="BlogMain-card-avatar-fallback">
                            <User size={13} />
                          </div>
                        )}
                        <span className="BlogMain-card-author-name">
                          {post.author || "Rhinco Specialist"}
                        </span>
                      </div>

                      <Link
                        to={`/blog/${postSlug}`}
                        className="BlogMain-card-link"
                      >
                        <span>Read</span>
                        <ArrowRight size={13} />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* BOTTOM CTA: MACHINERY ADVISORY */}
        <div className="BlogMain-advisory-banner">
          <div className="BlogMain-advisory-content">
            <span className="BlogMain-advisory-pill">FARMER SUPPORT NETWORK</span>
            <h3 className="BlogMain-advisory-title">
              Need Expert Advice for Your Crop & Land Size?
            </h3>
            <p className="BlogMain-advisory-text">
              Our agricultural engineers provide tailored machinery recommendations,
              field demonstrations, and subsidy guidance for your exact regional requirements.
            </p>
          </div>
          <div className="BlogMain-advisory-actions">
            <Link to="/machinery" className="BlogMain-advisory-primary-btn">
              Explore Machinery Catalogue
            </Link>
            <Link to="/contact" className="BlogMain-advisory-secondary-btn">
              Contact an Engineer
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
};

export default BlogMain;
