import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  Calendar,
  Clock,
  User,
  Eye,
  Share2,
  Tag,
  ArrowLeft,
  ArrowRight,
  Search,
  BookOpen,
  Check,
  Heart,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import "./BlogDetailsMain.css";
import { API_ENDPOINTS, resolveImageUrl } from "../../config/api";

const BLOGS_API = API_ENDPOINTS.BLOGS;
const BLOG_CATEGORIES_API = API_ENDPOINTS.BLOG_CATEGORIES;

const fallbackHero =
  "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1400&q=90";

const BlogDetailsMain = ({
  article: propArticle = null,
  allBlogs: propAllBlogs = [],
  loading: propLoading = false,
}) => {
  const navigate = useNavigate();
  const { slug: paramSlug } = useParams();
  const [searchParams] = useSearchParams();
  const idParam = searchParams.get("id");
  const querySlug = searchParams.get("slug");

  const [article, setArticle] = useState(propArticle);
  const [allBlogs, setAllBlogs] = useState(propAllBlogs);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(propLoading);
  const [search, setSearch] = useState("");
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [copied, setCopied] = useState(false);

  // Sync state if props change
  useEffect(() => {
    if (propArticle) {
      setArticle(propArticle);
      setLikes(propArticle.views ? Math.floor(propArticle.views / 20) + 12 : 18);
    }
  }, [propArticle]);

  useEffect(() => {
    if (propAllBlogs && propAllBlogs.length > 0) {
      setAllBlogs(propAllBlogs);
    }
  }, [propAllBlogs]);

  useEffect(() => {
    setLoading(propLoading);
  }, [propLoading]);

  // Fetch data if standalone or missing
  useEffect(() => {
    let isMounted = true;
    const fetchMissingData = async () => {
      try {
        // Fetch categories for sidebar
        const catRes = await fetch(BLOG_CATEGORIES_API).catch(() => null);
        if (catRes && catRes.ok) {
          const catData = await catRes.json();
          if (catData.success && Array.isArray(catData.data) && isMounted) {
            setCategories(catData.data);
          }
        }

        // If no allBlogs passed
        if (!propAllBlogs || propAllBlogs.length === 0) {
          const bRes = await fetch(BLOGS_API).catch(() => null);
          if (bRes && bRes.ok) {
            const bData = await bRes.json();
            if (bData.success && Array.isArray(bData.data) && isMounted) {
              setAllBlogs(bData.data);
              if (!propArticle) {
                const target = (paramSlug || querySlug || idParam || "").toLowerCase().trim();
                const matched = bData.data.find(
                  (b) =>
                    (b._id && b._id.toLowerCase() === target) ||
                    (b.slug && b.slug.toLowerCase() === target) ||
                    (b.title && b.title.toLowerCase().includes(target))
                );
                const chosen = matched || bData.data[0] || null;
                setArticle(chosen);
                if (chosen) {
                  setLikes(chosen.views ? Math.floor(chosen.views / 20) + 12 : 18);
                }
              }
            }
          }
        }
      } catch (err) {
        console.error("Error fetching supplementary blog data:", err);
      } finally {
        if (isMounted && !propArticle) setLoading(false);
      }
    };

    fetchMissingData();
    return () => {
      isMounted = false;
    };
  }, [paramSlug, querySlug, idParam, propArticle, propAllBlogs]);

  // Handle Likes
  const handleLike = () => {
    setLiked((prev) => {
      setLikes((c) => c + (prev ? -1 : 1));
      return !prev;
    });
  };

  // Handle Share / Copy Link
  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // Derive categories from allBlogs if API returns empty
  const activeCategories = useMemo(() => {
    if (categories.length > 0) {
      return categories.filter((c) => c.status !== "Inactive").slice(0, 10);
    }
    // Fallback: derive dynamically from allBlogs
    const map = {};
    allBlogs.forEach((b) => {
      if (b.category) {
        map[b.category] = (map[b.category] || 0) + 1;
      }
    });
    return Object.entries(map).map(([name, postCount]) => ({
      _id: name,
      name,
      postCount,
    }));
  }, [categories, allBlogs]);

  // Related / Latest stories (excluding current article)
  const relatedStories = useMemo(() => {
    if (!article) return allBlogs.slice(0, 5);
    const others = allBlogs.filter(
      (b) => b._id !== article._id && b.slug !== article.slug
    );

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      return others.filter(
        (b) =>
          (b.title || "").toLowerCase().includes(q) ||
          (b.category || "").toLowerCase().includes(q) ||
          (b.author || "").toLowerCase().includes(q)
      );
    }

    return others.slice(0, 5);
  }, [allBlogs, article, search]);

  // Previous & Next Articles
  const { prevArticle, nextArticle } = useMemo(() => {
    if (!article || allBlogs.length < 2) return { prevArticle: null, nextArticle: null };
    const currentIndex = allBlogs.findIndex(
      (b) => b._id === article._id || b.slug === article.slug
    );
    if (currentIndex === -1) return { prevArticle: null, nextArticle: null };

    const prev = currentIndex > 0 ? allBlogs[currentIndex - 1] : null;
    const next = currentIndex < allBlogs.length - 1 ? allBlogs[currentIndex + 1] : null;
    return { prevArticle: prev, nextArticle: next };
  }, [allBlogs, article]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "100px 20px", color: "#166534" }}>
        <div
          style={{
            width: "42px",
            height: "42px",
            border: "3px solid #e2e8f0",
            borderTopColor: "#166534",
            borderRadius: "50%",
            margin: "0 auto 16px",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <p style={{ fontWeight: 600, fontSize: "15px" }}>Loading article from database...</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div style={{ textAlign: "center", padding: "100px 20px" }}>
        <BookOpen size={48} color="#94a3b8" style={{ marginBottom: "16px" }} />
        <h2 style={{ fontSize: "22px", color: "#0f172a", margin: "0 0 10px" }}>Article Not Found</h2>
        <p style={{ color: "#64748b", margin: "0 0 24px" }}>
          The requested farming guide or article could not be located in our database.
        </p>
        <Link
          to="/blog"
          style={{
            display: "inline-block",
            padding: "10px 24px",
            backgroundColor: "#166534",
            color: "#fff",
            borderRadius: "8px",
            textDecoration: "none",
            fontWeight: 700,
            fontSize: "14px",
          }}
        >
          ← Return to All Articles
        </Link>
      </div>
    );
  }

  const formattedDate = article.publishDate || article.createdAt
    ? new Date(article.publishDate || article.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Recent";

  const tags = Array.isArray(article.tags) ? article.tags : [];
  const heroImg = resolveImageUrl(article.image, fallbackHero);
  const authorInitial = (article.author || "R").charAt(0).toUpperCase();

  return (
    <section className="BlogDetailsMain-section">
      <div className="BlogDetailsMain-container">

        {/* Main Article Column */}
        <main className="BlogDetailsMain-content">

          {/* Article Header (Full Width Clean Editorial Layout) */}
          <header className="BlogDetailsMain-article-header">
            <div className="BlogDetailsMain-title-area">
              <div className="BlogDetailsMain-breadcrumb">
                <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>Home</Link>
                <span className="BlogDetailsMain-breadcrumb-separator">/</span>
                <Link to="/blog" style={{ textDecoration: "none", color: "inherit" }}>Blog</Link>
                {article.category && (
                  <>
                    <span className="BlogDetailsMain-breadcrumb-separator">/</span>
                    <Link
                      to={`/blog`}
                      style={{ textDecoration: "none", color: "#166534", fontWeight: 700 }}
                    >
                      {article.category}
                    </Link>
                  </>
                )}
              </div>

              {article.category && (
                <div className="BlogDetailsMain-category-line">
                  <span className="BlogDetailsMain-category-icon">✦</span>
                  <span>{article.category}</span>
                </div>
              )}

              <h1 className="BlogDetailsMain-title">
                {article.title}
              </h1>

              {/* Byline with Author, Date, Read Time, and Views */}
              <div className="BlogDetailsMain-byline-bar">
                <div className="BlogDetailsMain-author-inline">
                  {article.authorAvatar ? (
                    <img
                      src={resolveImageUrl(article.authorAvatar)}
                      alt={article.author}
                      className="BlogDetailsMain-author-mini-avatar"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="BlogDetailsMain-author-mini-fallback">
                      {authorInitial}
                    </div>
                  )}
                  <div className="BlogDetailsMain-author-inline-info">
                    <span className="BlogDetailsMain-author-inline-name">
                      {article.author || "Rhinco Specialist"}
                    </span>
                    {article.authorRole && (
                      <span className="BlogDetailsMain-author-inline-role">
                        ({article.authorRole})
                      </span>
                    )}
                  </div>
                </div>

                <div className="BlogDetailsMain-published">
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                    <Calendar size={13} color="#166534" />
                    {formattedDate}
                  </span>
                  <span className="BlogDetailsMain-published-dot"></span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                    <Clock size={13} color="#166534" />
                    {article.readTime || "5 min read"}
                  </span>
                  {article.views ? (
                    <>
                      <span className="BlogDetailsMain-published-dot"></span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                        <Eye size={13} color="#166534" />
                        {Number(article.views).toLocaleString("en-IN")} views
                      </span>
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          </header>

          {/* Featured Hero Image */}
          <div className="BlogDetailsMain-featured-image">
            <img src={heroImg} alt={article.title} />
            <span className="BlogDetailsMain-featured-label">
              RHINCO KNOWLEDGE HUB
            </span>
          </div>

          {/* Article Body */}
          <div className="BlogDetailsMain-article-body">
            {article.excerpt && (
              <p className="BlogDetailsMain-lead">
                {article.excerpt}
              </p>
            )}

            {article.content ? (
              <div
                dangerouslySetInnerHTML={{ __html: article.content }}
                style={{
                  lineHeight: "1.85",
                  color: "#334155",
                  fontSize: "16px",
                }}
              />
            ) : (
              <p>No content provided for this article.</p>
            )}
          </div>

          {/* Article Engagement & Tags */}
          <div className="BlogDetailsMain-engagement">
            <div className="BlogDetailsMain-engagement-actions" style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <button
                type="button"
                className={`BlogDetailsMain-like ${liked ? "BlogDetailsMain-like-active" : ""}`}
                onClick={handleLike}
                aria-label={liked ? "Unlike article" : "Like article"}
                title="Like this article"
              >
                <Heart size={16} fill={liked ? "#166534" : "none"} color={liked ? "#166534" : "currentColor"} />
                <span>{likes} Helpful</span>
              </button>

              <button
                type="button"
                className="BlogDetailsMain-like"
                onClick={handleCopyLink}
                title="Share or copy article link"
              >
                {copied ? <Check size={16} color="#166534" /> : <Share2 size={16} />}
                <span>{copied ? "Link Copied!" : "Share Guide"}</span>
              </button>
            </div>

            {tags.length > 0 && (
              <div className="BlogDetailsMain-article-tags">
                <Tag size={14} color="#166534" />
                <strong>Tags:</strong>
                {tags.map((tag) => (
                  <Link
                    key={tag}
                    to={`/blog`}
                    style={{
                      padding: "4px 10px",
                      background: "#f1f5f9",
                      borderRadius: "6px",
                      color: "#334155",
                      fontSize: "12px",
                      fontWeight: 600,
                      textDecoration: "none",
                      display: "inline-block",
                    }}
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Previous / Next Article Navigation */}
          {(prevArticle || nextArticle) && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: prevArticle && nextArticle ? "1fr 1fr" : "1fr",
                gap: "16px",
                margin: "40px 0 20px",
                padding: "20px 0",
                borderTop: "1px solid #e2e8f0",
                borderBottom: "1px solid #e2e8f0",
              }}
            >
              {prevArticle && (
                <Link
                  to={`/blog/${prevArticle.slug || prevArticle._id}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "14px 18px",
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    textDecoration: "none",
                    color: "inherit",
                    transition: "all 0.2s ease",
                  }}
                >
                  <ArrowLeft size={20} color="#166534" style={{ flexShrink: 0 }} />
                  <div>
                    <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>
                      Previous Guide
                    </span>
                    <h4 style={{ margin: "2px 0 0", fontSize: "13.5px", color: "#0f172a", fontWeight: 700, lineHeight: 1.3 }}>
                      {prevArticle.title}
                    </h4>
                  </div>
                </Link>
              )}

              {nextArticle && (
                <Link
                  to={`/blog/${nextArticle.slug || nextArticle._id}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    textAlign: "right",
                    gap: "12px",
                    padding: "14px 18px",
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    textDecoration: "none",
                    color: "inherit",
                    transition: "all 0.2s ease",
                  }}
                >
                  <div>
                    <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>
                      Next Guide
                    </span>
                    <h4 style={{ margin: "2px 0 0", fontSize: "13.5px", color: "#0f172a", fontWeight: 700, lineHeight: 1.3 }}>
                      {nextArticle.title}
                    </h4>
                  </div>
                  <ArrowRight size={20} color="#166534" style={{ flexShrink: 0 }} />
                </Link>
              )}
            </div>
          )}

          {/* About Author */}
          <section className="BlogDetailsMain-about-author">
            <div className="BlogDetailsMain-section-heading">
              <span>CONTRIBUTOR PROFILE</span>
              <h2>About the Specialist</h2>
            </div>

            <div className="BlogDetailsMain-author-card">
              {article.authorAvatar ? (
                <img
                  src={resolveImageUrl(article.authorAvatar)}
                  alt={article.author}
                  className="BlogDetailsMain-about-avatar"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    backgroundColor: "#166534",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    fontSize: "28px",
                    flexShrink: 0,
                  }}
                >
                  {authorInitial}
                </div>
              )}

              <div className="BlogDetailsMain-about-info">
                <span className="BlogDetailsMain-about-label">
                  {article.authorRole || "Agronomist & Farm Equipment Specialist"}
                </span>
                <h3>{article.author || "Rhinco Specialist Team"}</h3>
                <p>
                  Specializing in agricultural mechanization, harvest loss reduction, and tractor implement engineering. Dedicated to empowering Indian farmers with verified field insights and modern machinery best practices.
                </p>
                <Link to="/contact">
                  Consult With Our Specialists ↗
                </Link>
              </div>
            </div>
          </section>

          {/* Question / Contact Banner */}
          <div
            id="BlogDetailsMain-comments"
            className="BlogDetailsMain-comments-note"
          >
            <h3>Need Guidance on Farm Machinery?</h3>
            <p>
              Looking for exact tractor compatibility, government subsidies, or machinery specifications discussed in this article? Our team of agricultural specialists is here to assist you.
            </p>
            <Link to="/contact">Get Expert Assistance</Link>
          </div>
        </main>

        {/* Sidebar */}
        <aside className="BlogDetailsMain-sidebar">

          {/* Search Articles */}
          <div className="BlogDetailsMain-widget BlogDetailsMain-search-widget">
            <h3 className="BlogDetailsMain-widget-title">Search Guides</h3>

            <form
              className="BlogDetailsMain-search"
              onSubmit={(event) => {
                event.preventDefault();
                if (search.trim()) {
                  navigate(`/blog?search=${encodeURIComponent(search.trim())}`);
                }
              }}
            >
              <input
                type="search"
                placeholder="Search articles & topics..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                aria-label="Search articles"
              />
              <button type="submit" aria-label="Search">
                <Search size={16} />
              </button>
            </form>
          </div>

          {/* Real Blog Categories from Database */}
          {activeCategories.length > 0 && (
            <div className="BlogDetailsMain-widget">
              <div className="BlogDetailsMain-widget-heading">
                <span>TOPICS</span>
                <h3>Article Categories</h3>
              </div>

              <div className="BlogDetailsMain-category-list">
                {activeCategories.map((category) => (
                  <Link
                    to={`/blog`}
                    key={category._id || category.name}
                    className="BlogDetailsMain-category-item"
                    style={{ textDecoration: "none" }}
                  >
                    <span>{category.name}</span>
                    {category.postCount !== undefined && category.postCount > 0 && (
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          background: "#e2e8f0",
                          color: "#475569",
                          padding: "2px 7px",
                          borderRadius: "999px",
                        }}
                      >
                        {category.postCount}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Real Latest Stories from Database (excluding current) */}
          <div className="BlogDetailsMain-widget">
            <div className="BlogDetailsMain-widget-heading">
              <span>EXPLORE MORE</span>
              <h3>Related Articles</h3>
            </div>

            <div className="BlogDetailsMain-latest-list">
              {relatedStories.length > 0 ? (
                relatedStories.map((post) => {
                  const pDate = post.publishDate || post.createdAt;
                  const dateLabel = pDate
                    ? new Date(pDate).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "Recent";

                  return (
                    <Link
                      to={`/blog/${post.slug || post._id}`}
                      className="BlogDetailsMain-latest-item"
                      key={post._id || post.slug}
                    >
                      <img
                        src={resolveImageUrl(post.image, fallbackHero)}
                        alt={post.title}
                        loading="lazy"
                        onError={(e) => {
                          e.target.src = fallbackHero;
                        }}
                      />
                      <div>
                        <span>{dateLabel.toUpperCase()}</span>
                        <h4>{post.title}</h4>
                      </div>
                    </Link>
                  );
                })
              ) : (
                <p className="BlogDetailsMain-no-results">
                  No other articles found.
                </p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
};

export default BlogDetailsMain;
