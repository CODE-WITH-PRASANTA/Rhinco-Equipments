
import React, { useState } from "react";
import "./BlogMain.css";

const blogPosts = [
  {
    id: 1,
    category: "Modern Farming",
    date: "NOV 03, 2026",
    title: "How Modern Technology Is Transforming Indian Agriculture",
    description:
      "Discover how innovative farming techniques and modern equipment are helping farmers improve productivity and build a sustainable future.",
    author: "Rahul Sharma",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80",
    image:
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=900&q=85",
    readTime: "5 min read",
    slug: "modern-technology-indian-agriculture",
  },
  {
    id: 2,
    category: "Agricultural Equipment",
    date: "OCT 28, 2026",
    title: "Choosing the Right Agricultural Equipment for Your Farm",
    description:
      "Learn what to consider before investing in agricultural machinery, from farm size and crop type to performance and maintenance.",
    author: "Amit Kumar",
    avatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&q=80",
    image:
      "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=900&q=85",
    readTime: "7 min read",
    slug: "choosing-agricultural-equipment",
  },
  {
    id: 3,
    category: "Sustainable Farming",
    date: "OCT 21, 2026",
    title: "Simple Ways to Make Your Farm More Sustainable",
    description:
      "Explore practical approaches to soil health, water conservation, and responsible farming that can benefit your land for years.",
    author: "Priya Das",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80",
    image:
      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=900&q=85",
    readTime: "4 min read",
    slug: "sustainable-farming-methods",
  },
  {
    id: 4,
    category: "Crop Management",
    date: "OCT 15, 2026",
    title: "Smart Irrigation Techniques Every Farmer Should Know",
    description:
      "Understand how efficient irrigation systems can help reduce water waste and support healthier crop growth.",
    author: "Vikash Singh",
    avatar:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&q=80",
    image:
      "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=900&q=85",
    readTime: "6 min read",
    slug: "smart-irrigation-techniques",
  },
  {
    id: 5,
    category: "Organic Farming",
    date: "OCT 09, 2026",
    title: "A Beginner's Guide to Growing Organic Vegetables",
    description:
      "Start your organic farming journey with useful tips about soil preparation, natural fertilizers, and everyday crop care.",
    author: "Sneha Patel",
    avatar:
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100&q=80",
    image:
      "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=900&q=85",
    readTime: "5 min read",
    slug: "organic-vegetable-farming",
  },
  {
    id: 6,
    category: "Modern Farming",
    date: "OCT 02, 2026",
    title: "The Growing Role of Technology in Crop Monitoring",
    description:
      "From digital tools to smart sensors, discover how technology is making crop monitoring more informed and efficient.",
    author: "Rohit Verma",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80",
    image:
      "https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=900&q=85",
    readTime: "8 min read",
    slug: "technology-in-crop-monitoring",
  },
  {
    id: 7,
    category: "Agricultural Equipment",
    date: "SEP 25, 2026",
    title: "Essential Tools That Make Everyday Farming Easier",
    description:
      "Take a closer look at useful agricultural tools that can simplify regular farm activities and save valuable time.",
    author: "Neha Sahoo",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80",
    image:
      "https://images.unsplash.com/photo-1592982537447-6f2a6a0a6a8e?w=900&q=85",
    readTime: "5 min read",
    slug: "essential-farming-tools",
  },
  {
    id: 8,
    category: "Sustainable Farming",
    date: "SEP 18, 2026",
    title: "Why Healthy Soil Is the Foundation of Better Harvests",
    description:
      "Understand the importance of soil quality and explore practical ways to maintain healthy and productive farmland.",
    author: "Ananya Mohanty",
    avatar:
      "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=100&q=80",
    image:
      "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=900&q=85",
    readTime: "6 min read",
    slug: "healthy-soil-better-harvests",
  },
  {
    id: 9,
    category: "Crop Management",
    date: "SEP 10, 2026",
    title: "Practical Tips for Planning Your Next Growing Season",
    description:
      "Prepare for a successful growing season with thoughtful crop planning, timely preparation, and better resource management.",
    author: "Sanjay Das",
    avatar:
      "https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=100&q=80",
    image:
      "https://images.unsplash.com/photo-1472396961693-142e6e269027?w=900&q=85",
    readTime: "7 min read",
    slug: "planning-next-growing-season",
  },
];

const blogCategories = [
  "All",
  "Modern Farming",
  "Agricultural Equipment",
  "Sustainable Farming",
  "Crop Management",
  "Organic Farming",
];

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

const BlogMain = () => {
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredPosts =
    activeCategory === "All"
      ? blogPosts
      : blogPosts.filter(
          (post) => post.category === activeCategory
        );

  return (
    <section className="BlogMain-section">
      <div className="BlogMain-container">

        {/* Heading */}
        <div className="BlogMain-header">
          <div className="BlogMain-heading-content">
            <span className="BlogMain-eyebrow">
              FARMTECH AGRO JOURNAL
            </span>

            <h2 className="BlogMain-heading">
              Ideas That Help <span>Farming Grow.</span>
            </h2>

            <p className="BlogMain-intro">
              Explore the latest farming insights, agricultural
              innovations, expert advice, and practical ideas
              for a better tomorrow.
            </p>
          </div>

          <div className="BlogMain-header-badge">
            <span className="BlogMain-badge-number">09</span>
            <span className="BlogMain-badge-text">Latest Articles</span>
          </div>
        </div>

        {/* Category Filters */}
        <div className="BlogMain-filter-area">
          <div className="BlogMain-filter-label">
            EXPLORE TOPICS
          </div>

          <div className="BlogMain-filters">
            {blogCategories.map((category) => (
              <button
                type="button"
                key={category}
                className={`BlogMain-filter ${
                  activeCategory === category
                    ? "BlogMain-filter-active"
                    : ""
                }`}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Blog Cards */}
        <div className="BlogMain-grid">
          {filteredPosts.map((post, index) => (
            <article className="BlogMain-card" key={post.id}>

              <a
                href={`/blog/${post.slug}`}
                className="BlogMain-image-link"
                aria-label={`Read ${post.title}`}
              >
                <div className="BlogMain-image-wrapper">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="BlogMain-image"
                    loading="lazy"
                    onError={(event) => {
                      event.currentTarget.src =
                        "https://placehold.co/900x600/eaf1df/356005?text=Farmtech+Agro";
                    }}
                  />

                  <span className="BlogMain-image-category">
                    {post.category}
                  </span>

                  <span className="BlogMain-image-number">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
              </a>

              <div className="BlogMain-card-content">

                <div className="BlogMain-meta">
                  <span className="BlogMain-meta-category">
                    {post.category}
                  </span>
                  <span className="BlogMain-meta-dot"></span>
                  <span className="BlogMain-date">{post.date}</span>
                </div>

                <h3 className="BlogMain-card-title">
                  <a href={`/blog/${post.slug}`}>
                    {post.title}
                  </a>
                </h3>

                <p className="BlogMain-description">
                  {post.description}
                </p>

                <div className="BlogMain-card-footer">
                  <div className="BlogMain-author">
                    <img
                      src={post.avatar}
                      alt={post.author}
                      className="BlogMain-author-image"
                      loading="lazy"
                    />

                    <div className="BlogMain-author-info">
                      <span className="BlogMain-author-label">
                        WRITTEN BY
                      </span>
                      <span className="BlogMain-author-name">
                        {post.author}
                      </span>
                    </div>
                  </div>

                  <div className="BlogMain-footer-right">
                    <span className="BlogMain-read-time">
                      {post.readTime}
                    </span>

                    <a
                      href={`/blog/${post.slug}`}
                      className="BlogMain-read-button"
                      aria-label={`Read ${post.title}`}
                    >
                      <ArrowIcon />
                    </a>
                  </div>
                </div>

              </div>
            </article>
          ))}
        </div>

        {/* Empty State */}
        {filteredPosts.length === 0 && (
          <div className="BlogMain-empty">
            <h3>No articles found</h3>
            <p>Try selecting another category.</p>
            <button
              type="button"
              onClick={() => setActiveCategory("All")}
            >
              View All Articles
            </button>
          </div>
        )}

        {/* Bottom Section */}
        <div className="BlogMain-bottom">
          <div className="BlogMain-bottom-decoration">
            <span></span>
            <span></span>
            <span></span>
          </div>

          <div className="BlogMain-bottom-content">
            <span className="BlogMain-bottom-eyebrow">
              KEEP LEARNING. KEEP GROWING.
            </span>

            <h3>Better Knowledge. Better Farming. Better Future.</h3>

            <p>
              Stay connected with Farmtech Agro for more useful
              agricultural knowledge and updates.
            </p>
          </div>

          <a href="/contact" className="BlogMain-bottom-button">
            Get In Touch
            <ArrowIcon />
          </a>
        </div>

      </div>
    </section>
  );
};

export default BlogMain;
