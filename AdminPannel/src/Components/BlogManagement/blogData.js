// Blog API Endpoints & Dynamic Database Helpers
import { API_URL, BACKEND_URL } from "../../utils/apiConfig";

export const API_BASE_URL = BACKEND_URL;
export const BLOGS_API = `${API_URL}/blogs`;
export const CATEGORIES_API = `${API_URL}/blog-categories`;

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
