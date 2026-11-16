import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import BlogDetailsBreadcrumb from "../../Components/BlogDetailsBreadcrumb/BlogDetailsBreadcrumb";
import BlogDetailsMain from "../../Components/BlogDetailsMain/BlogDetailsMain";

const BLOGS_API = "http://localhost:5000/api/blogs";

const BlogDetails = () => {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const idParam = searchParams.get("id");
  const querySlug = searchParams.get("slug");

  const [article, setArticle] = useState(null);
  const [allBlogs, setAllBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchArticleData = async () => {
      setLoading(true);
      try {
        const target = (slug || querySlug || idParam || "").trim();

        // 1. If target slug or id provided, fetch single blog directly
        if (target) {
          try {
            const singleRes = await fetch(`${BLOGS_API}/${encodeURIComponent(target)}?view=true`);
            const singleData = await singleRes.json();
            if (singleRes.ok && singleData.success && singleData.data) {
              if (isMounted) {
                setArticle(singleData.data);
              }
            }
          } catch (e) {
            console.error("Single blog fetch failed, falling back to all:", e);
          }
        }

        // 2. Fetch all blogs for related articles and fallback
        const allRes = await fetch(BLOGS_API);
        const allData = await allRes.json();
        if (allRes.ok && allData.success && Array.isArray(allData.data)) {
          if (isMounted) {
            setAllBlogs(allData.data);

            // If single lookup didn't match yet, find inside allData
            setArticle((prev) => {
              if (prev) return prev;
              if (target) {
                const matched = allData.data.find(
                  (b) =>
                    (b._id && b._id.toLowerCase() === target.toLowerCase()) ||
                    (b.slug && b.slug.toLowerCase() === target.toLowerCase()) ||
                    (b.title && b.title.toLowerCase().includes(target.toLowerCase()))
                );
                return matched || allData.data[0] || null;
              }
              return allData.data[0] || null;
            });
          }
        }
      } catch (err) {
        console.error("Error loading blog details page:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchArticleData();
    window.scrollTo({ top: 0, behavior: "smooth" });
    return () => {
      isMounted = false;
    };
  }, [slug, querySlug, idParam]);

  return (
    <div>
      <BlogDetailsBreadcrumb article={article} />
      <BlogDetailsMain article={article} allBlogs={allBlogs} loading={loading} />
    </div>
  );
};

export default BlogDetails;
