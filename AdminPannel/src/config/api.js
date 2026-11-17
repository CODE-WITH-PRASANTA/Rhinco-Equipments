/**
 * Rhinco Equipments Admin Panel - Dynamic API Configuration
 * Single source of truth for all admin panel API endpoints.
 * Dynamically resolves backend host in development, LAN, or production environments.
 */

const resolveBaseUrl = () => {
  // 1. Environment variable override (Vite)
  if (import.meta.env?.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL.replace(/\/+$/, "");
  }
  if (import.meta.env?.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/+$/, "");
  }

  // 2. Dynamic browser hostname fallback
  if (typeof window !== "undefined" && window.location?.hostname) {
    const host = window.location.hostname;
    return `http://${host}:5000/api`;
  }

  // 3. Default fallback
  return "http://localhost:5000/api";
};

export const API_BASE_URL = resolveBaseUrl();
export const BACKEND_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

export const API_ENDPOINTS = {
  BASE: API_BASE_URL,
  ORIGIN: BACKEND_ORIGIN,
  UPLOAD: `${API_BASE_URL}/upload`,
  UPLOAD_MULTIPLE: `${API_BASE_URL}/upload/multiple`,
  PRODUCTS: `${API_BASE_URL}/products`,
  CATEGORIES: `${API_BASE_URL}/categories`,
  MACHINERY: `${API_BASE_URL}/machinery`,
  BLOGS: `${API_BASE_URL}/blogs`,
  BLOG_CATEGORIES: `${API_BASE_URL}/blog-categories`,
  ENQUIRIES: `${API_BASE_URL}/enquiries`,
  ORDERS: `${API_BASE_URL}/orders`,
  REVIEWS: `${API_BASE_URL}/reviews`,
  TEAM: `${API_BASE_URL}/team`,
  PROFILES: `${API_BASE_URL}/profiles`,
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
    REGISTER: `${API_BASE_URL}/auth/register`,
  },
};

/**
 * Resolves an image URL:
 * - If image path starts with /uploads, prepends the backend origin
 * - If image is an external URL (http/https/blob/data), returns as is
 * - If empty, returns fallback
 */
export const resolveImageUrl = (path, fallback = "") => {
  if (!path) return fallback;
  if (typeof path !== "string") return fallback;
  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("blob:") ||
    path.startsWith("data:")
  ) {
    return path;
  }
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${BACKEND_ORIGIN}${cleanPath}`;
};

/**
 * Uploads a single image file directly to the backend /uploads folder.
 * Returns the relative server path: "/uploads/<filename>".
 */
export const uploadImage = async (file) => {
  if (!file) throw new Error("No file provided for upload");

  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch(API_ENDPOINTS.UPLOAD, {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || "Failed to upload image");
  }

  return data.url; // e.g. "/uploads/img-1740000000.jpg"
};

/**
 * Uploads multiple image files directly to the backend /uploads folder.
 * Returns an array of relative server paths: ["/uploads/img1.jpg", ...]
 */
export const uploadMultipleImages = async (files) => {
  if (!files || files.length === 0) return [];

  const formData = new FormData();
  for (const file of files) {
    formData.append("images", file);
  }

  const res = await fetch(API_ENDPOINTS.UPLOAD_MULTIPLE, {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || "Failed to upload images");
  }

  return data.urls || [];
};

/**
 * Dynamic fetch wrapper for Admin Panel with JSON serialization and auth headers
 */
export const apiFetch = async (endpointOrPath, options = {}) => {
  let url = endpointOrPath;

  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    const cleanPath = url.startsWith("/") ? url : `/${url}`;
    url = `${API_BASE_URL}${cleanPath}`;
  }

  const config = { ...options };
  const headers = { ...config.headers };

  // Auto-serialize JSON body if an object is passed
  if (config.body && typeof config.body === "object" && !(config.body instanceof FormData)) {
    headers["Content-Type"] = headers["Content-Type"] || "application/json";
    config.body = JSON.stringify(config.body);
  }

  config.headers = headers;

  return fetch(url, config);
};

export default {
  BASE_URL: API_BASE_URL,
  ORIGIN: BACKEND_ORIGIN,
  ENDPOINTS: API_ENDPOINTS,
  fetch: apiFetch,
};
