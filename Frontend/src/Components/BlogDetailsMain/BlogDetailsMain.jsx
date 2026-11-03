
import React, { useState } from "react";
import "./BlogDetailsMain.css";

const article = {
  category: "Agriculture",
  subcategories: ["Modern Farming", "Technology", "Equipment"],
  title: "Top 10 Reasons Why You Should Choose Modern Agriculture",
  date: "03 November, 2026",
  author: "Rahul Sharma",
  authorRole: "Agriculture Expert",
  authorImage:
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&q=85",
  heroImage:
    "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1400&q=90",
  readTime: "7 min read",
  intro:
    "Agriculture is changing every day. New ideas, better equipment, and smarter farming methods are helping farmers improve productivity while taking better care of the land.",
};

const categories = [
  { name: "Modern Farming", count: 6 },
  { name: "Agricultural Equipment", count: 2 },
  { name: "Agriculture", count: 8 },
  { name: "Organic Farming", count: 5 },
  { name: "Crop Management", count: 3 },
];

const latestPosts = [
  {
    title: "How Technology Is Changing Modern Agriculture",
    date: "NOVEMBER 03, 2026",
    image:
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=300&q=80",
    slug: "technology-modern-agriculture",
  },
  {
    title: "Choosing the Right Equipment for Your Farm",
    date: "OCTOBER 28, 2026",
    image:
      "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=300&q=80",
    slug: "choosing-farm-equipment",
  },
  {
    title: "Simple Ways to Improve Soil Health",
    date: "OCTOBER 21, 2026",
    image:
      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=300&q=80",
    slug: "improve-soil-health",
  },
];

const galleryImages = [
  "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=300&q=80",
  "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=300&q=80",
  "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=300&q=80",
  "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=300&q=80",
  "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=300&q=80",
  "https://images.unsplash.com/photo-1472396961693-142e6e269027?w=300&q=80",
];

const tags = [
  "Agriculture",
  "Farm Equipment",
  "Organic",
  "Technology",
  "Harvest",
  "Soil Health",
  "Irrigation",
  "Innovation",
  "Sustainability",
];

const articleTags = ["Agriculture", "Technology", "Modern Farming"];

const BlogDetailsMain = () => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("");
  const [activeTag, setActiveTag] = useState("");
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(18);
  const [selectedImage, setSelectedImage] = useState(null);

  const handleLike = () => {
    setLiked((previous) => {
      setLikes((count) => count + (previous ? -1 : 1));
      return !previous;
    });
  };

  const filteredPosts = latestPosts.filter((post) =>
    post.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section className="BlogDetailsMain-section">
      <div className="BlogDetailsMain-container">

        {/* Main Article Column */}
        <main className="BlogDetailsMain-content">

          {/* Article Header */}
          <header className="BlogDetailsMain-article-header">
            <div className="BlogDetailsMain-author-top">
              <img
                src={article.authorImage}
                alt={article.author}
                className="BlogDetailsMain-author-avatar"
              />

              <div className="BlogDetailsMain-author-top-info">
                <span className="BlogDetailsMain-author-label">
                  ARTICLE BY
                </span>
                <strong>{article.author}</strong>
                <span>{article.authorRole}</span>
              </div>
            </div>

            <div className="BlogDetailsMain-title-area">
              <div className="BlogDetailsMain-breadcrumb">
                <span>Home</span>
                <span className="BlogDetailsMain-breadcrumb-separator">/</span>
                <span>Blog</span>
                <span className="BlogDetailsMain-breadcrumb-separator">/</span>
                <span>{article.category}</span>
              </div>

              <div className="BlogDetailsMain-category-line">
                <span className="BlogDetailsMain-category-icon">✦</span>
                {article.subcategories.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>

              <h1 className="BlogDetailsMain-title">
                {article.title}
              </h1>

              <div className="BlogDetailsMain-published">
                <span>{article.date}</span>
                <span className="BlogDetailsMain-published-dot"></span>
                <span>{article.readTime}</span>
              </div>
            </div>
          </header>

          {/* Featured Image */}
          <div className="BlogDetailsMain-featured-image">
            <img src={article.heroImage} alt="Agricultural landscape" />
            <span className="BlogDetailsMain-featured-label">
              FARMTECH AGRO JOURNAL
            </span>
          </div>

          {/* Article Body */}
          <div className="BlogDetailsMain-article-body">
            <p className="BlogDetailsMain-lead">
              {article.intro}
            </p>

            <h2>Why modern agriculture matters</h2>

            <p>
              Farming is more than growing crops. It is a combination of
              knowledge, planning, experience, and hard work. As farming
              needs continue to evolve, farmers can benefit from adopting
              practical methods and choosing the right tools for their land.
            </p>

            <p>
              Modern agricultural solutions can help make everyday farm
              activities more efficient. From preparing the soil to managing
              irrigation and harvesting crops, the right approach can save
              time and support more consistent results.
            </p>

            <h2>Benefits of choosing better farming solutions</h2>

            <p>
              Every farm has different requirements. Soil conditions, crop
              varieties, weather, available resources, and farm size all play
              an important role in selecting suitable farming methods.
              Understanding these factors helps farmers make informed choices.
            </p>

            <p>
              Investing in quality equipment and learning improved farming
              practices can also help reduce unnecessary effort. The goal is
              not simply to use more technology, but to use the right
              technology in the right place.
            </p>

            {/* Quote */}
            <blockquote className="BlogDetailsMain-quote">
              <span className="BlogDetailsMain-quote-mark">“</span>
              <p>
                Healthy soil, thoughtful planning, and the right tools
                create the foundation for productive and sustainable farming.
              </p>
              <div className="BlogDetailsMain-quote-line"></div>
              <strong>Farmtech Agro Editorial Team</strong>
              <span className="BlogDetailsMain-quote-role">
                Agriculture Knowledge & Innovation
              </span>
            </blockquote>

            <h2>Building a smarter farming future</h2>

            <p>
              Sustainable agriculture begins with small, consistent
              improvements. Responsible water use, suitable crop planning,
              soil care, and timely farm maintenance can make a meaningful
              difference over time.
            </p>

            <p>
              Farmers should evaluate their needs before choosing products
              or adopting a new process. Reliable information and practical
              guidance can make the decision-making process easier.
            </p>

            {/* Image with Text */}
            <div className="BlogDetailsMain-image-content">
              <div className="BlogDetailsMain-inline-image">
                <img
                  src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=900&q=85"
                  alt="Farmland and crop cultivation"
                  loading="lazy"
                />
              </div>

              <div className="BlogDetailsMain-inline-text">
                <h3>Growing with knowledge and innovation</h3>
                <p>
                  Understanding your farm's requirements is the first step
                  toward better results. Farmers can explore suitable tools,
                  crop management practices, and efficient irrigation
                  techniques to support their daily work.
                </p>
                <p>
                  With continuous learning and responsible decisions,
                  agriculture can become more productive and resilient.
                </p>
              </div>
            </div>

            <h2>Final thoughts</h2>

            <p>
              A better agricultural future is built through informed
              decisions, dependable products, and a commitment to improving
              farming practices. Keep learning, keep exploring, and choose
              solutions that genuinely support your farming goals.
            </p>
          </div>

          {/* Article Engagement */}
          <div className="BlogDetailsMain-engagement">
            <div className="BlogDetailsMain-engagement-actions">
              <button
                type="button"
                className={`BlogDetailsMain-like ${
                  liked ? "BlogDetailsMain-like-active" : ""
                }`}
                onClick={handleLike}
                aria-label={liked ? "Unlike article" : "Like article"}
                aria-pressed={liked}
              >
                <svg viewBox="0 0 24 24">
                  <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />
                </svg>
                <span>{likes}</span>
              </button>

              <a
                href="#BlogDetailsMain-comments"
                className="BlogDetailsMain-comment-link"
              >
                <svg viewBox="0 0 24 24">
                  <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z" />
                </svg>
                <span>6</span>
              </a>
            </div>

            <div className="BlogDetailsMain-article-tags">
              <strong>Tags:</strong>
              {articleTags.map((tag) => (
                <button
                  type="button"
                  key={tag}
                  onClick={() => setActiveTag(tag)}
                  className={
                    activeTag === tag
                      ? "BlogDetailsMain-article-tag-active"
                      : ""
                  }
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* About Author */}
          <section className="BlogDetailsMain-about-author">
            <div className="BlogDetailsMain-section-heading">
              <span>ABOUT THE AUTHOR</span>
              <h2>Meet the Writer</h2>
            </div>

            <div className="BlogDetailsMain-author-card">
              <img
                src={article.authorImage}
                alt={article.author}
                className="BlogDetailsMain-about-avatar"
              />

              <div className="BlogDetailsMain-about-info">
                <span className="BlogDetailsMain-about-label">
                  {article.authorRole}
                </span>
                <h3>{article.author}</h3>
                <p>
                  Passionate about agriculture, farming knowledge, and
                  practical solutions that help farmers make informed
                  decisions and grow with confidence.
                </p>
                <a href="mailto:rahul@farmtechagro.com">
                  Contact Author
                  <span>↗</span>
                </a>
              </div>
            </div>
          </section>

          {/* Comments Anchor */}
          <div
            id="BlogDetailsMain-comments"
            className="BlogDetailsMain-comments-note"
          >
            <h3>Join the Conversation</h3>
            <p>
              Have a question or an idea about this article? Contact our team
              and share your thoughts.
            </p>
            <a href="/contact">Share Your Thoughts</a>
          </div>
        </main>

        {/* Sidebar */}
        <aside className="BlogDetailsMain-sidebar">

          {/* Search */}
          <div className="BlogDetailsMain-widget BlogDetailsMain-search-widget">
            <h3 className="BlogDetailsMain-widget-title">Search Articles</h3>

            <form
              className="BlogDetailsMain-search"
              onSubmit={(event) => event.preventDefault()}
            >
              <input
                type="search"
                placeholder="Enter search keywords..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                aria-label="Search latest articles"
              />
              <button type="submit" aria-label="Search">
                <svg viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m16 16 5 5" />
                </svg>
              </button>
            </form>
          </div>

          {/* Categories */}
          <div className="BlogDetailsMain-widget">
            <div className="BlogDetailsMain-widget-heading">
              <span>EXPLORE</span>
              <h3>Categories</h3>
            </div>

            <div className="BlogDetailsMain-category-list">
              {categories.map((category) => (
                <button
                  type="button"
                  key={category.name}
                  className={`BlogDetailsMain-category-item ${
                    activeCategory === category.name
                      ? "BlogDetailsMain-category-active"
                      : ""
                  }`}
                  onClick={() =>
                    setActiveCategory(
                      activeCategory === category.name ? "" : category.name
                    )
                  }
                >
                  <span>{category.name}</span>
                  <span className="BlogDetailsMain-category-count">
                    {category.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Latest Blog */}
          <div className="BlogDetailsMain-widget">
            <div className="BlogDetailsMain-widget-heading">
              <span>RECENT STORIES</span>
              <h3>Latest From Blog</h3>
            </div>

            <div className="BlogDetailsMain-latest-list">
              {filteredPosts.length > 0 ? (
                filteredPosts.map((post) => (
                  <a
                    href={`/blog/${post.slug}`}
                    className="BlogDetailsMain-latest-item"
                    key={post.slug}
                  >
                    <img src={post.image} alt={post.title} loading="lazy" />
                    <div>
                      <span>{post.date}</span>
                      <h4>{post.title}</h4>
                    </div>
                  </a>
                ))
              ) : (
                <p className="BlogDetailsMain-no-results">
                  No matching articles found.
                </p>
              )}
            </div>
          </div>

          {/* Gallery */}
          <div className="BlogDetailsMain-widget">
            <div className="BlogDetailsMain-widget-heading">
              <span>VISUAL STORIES</span>
              <h3>Farm Gallery</h3>
            </div>

            <div className="BlogDetailsMain-gallery">
              {galleryImages.map((image, index) => (
                <button
                  type="button"
                  key={image}
                  onClick={() => setSelectedImage(image)}
                  aria-label={`Open gallery image ${index + 1}`}
                >
                  <img src={image} alt={`Agriculture gallery ${index + 1}`} loading="lazy" />
                  <span>↗</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tag Cloud */}
          <div className="BlogDetailsMain-widget">
            <div className="BlogDetailsMain-widget-heading">
              <span>DISCOVER MORE</span>
              <h3>Popular Tags</h3>
            </div>

            <div className="BlogDetailsMain-tag-cloud">
              {tags.map((tag) => (
                <button
                  type="button"
                  key={tag}
                  onClick={() => setActiveTag(tag)}
                  className={
                    activeTag === tag
                      ? "BlogDetailsMain-tag-active"
                      : ""
                  }
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Sidebar CTA */}
          <div className="BlogDetailsMain-sidebar-cta">
            <span>FARMTECH AGRO</span>
            <h3>Let's grow a better tomorrow.</h3>
            <p>
              Explore practical products and solutions for your farming needs.
            </p>
            <a href="/products">
              Explore Products <span>↗</span>
            </a>
          </div>
        </aside>
      </div>

      {/* Gallery Lightbox */}
      {selectedImage && (
        <div
          className="BlogDetailsMain-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Gallery image preview"
          onClick={() => setSelectedImage(null)}
        >
          <button
            type="button"
            className="BlogDetailsMain-lightbox-close"
            onClick={() => setSelectedImage(null)}
            aria-label="Close image preview"
          >
            ×
          </button>
          <img
            src={selectedImage}
            alt="Selected agriculture gallery"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </section>
  );
};

export default BlogDetailsMain;
