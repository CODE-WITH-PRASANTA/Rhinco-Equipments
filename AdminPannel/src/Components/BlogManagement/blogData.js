// Blog API Endpoints & Dynamic Database Helpers

export const API_BASE_URL = "http://localhost:5000";
export const BLOGS_API = `${API_BASE_URL}/api/blogs`;
export const CATEGORIES_API = `${API_BASE_URL}/api/blog-categories`;

// Dynamic Category Fetcher
export const fetchDynamicCategories = async () => {
  try {
    const res = await fetch(CATEGORIES_API);
    const result = await res.json();
    if (result.success && Array.isArray(result.data)) {
      return result.data;
    }
  } catch (err) {
    console.warn("Could not fetch categories from backend database:", err.message);
  }
  return [];
};

// Dynamic Blogs Fetcher
export const fetchDynamicBlogs = async (params = {}) => {
  try {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${BLOGS_API}?${query}` : BLOGS_API;
    const res = await fetch(url);
    const result = await res.json();
    if (result.success && Array.isArray(result.data)) {
      return result.data;
    }
  } catch (err) {
    console.warn("Could not fetch blogs from backend database:", err.message);
  }
  return [];
};
