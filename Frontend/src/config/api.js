/**
 * Rhinco Equipments - Dynamic API Configuration
 * Single source of truth for all frontend API calls.
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

  // 2. Dynamic browser hostname fallback (useful for testing on LAN IP / mobile)
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
  PRODUCTS: `${API_BASE_URL}/products`,
  CATEGORIES: `${API_BASE_URL}/categories`,
  MACHINERY: `${API_BASE_URL}/machinery`,
  BLOGS: `${API_BASE_URL}/blogs`,
  BLOG_CATEGORIES: `${API_BASE_URL}/blog-categories`,
  ENQUIRIES: `${API_BASE_URL}/enquiries`,
  ORDERS: `${API_BASE_URL}/orders`,
  REVIEWS: `${API_BASE_URL}/reviews`,
  TEAM: `${API_BASE_URL}/team`,
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
    REGISTER: `${API_BASE_URL}/auth/register`,
  },
};

/**
 * Dynamic fetch wrapper that automatically prefixes API_BASE_URL for relative paths
 * and sets default headers.
 * 
 * Usage:
 *   apiFetch('/products')
 *   apiFetch(API_ENDPOINTS.BLOGS)
 *   apiFetch('/orders/verify-payment', { method: 'POST', body: { ... } })
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
