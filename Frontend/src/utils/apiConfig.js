/**
 * Universal API & Backend URL Normalizer for Frontend
 * Adapts to all development and live environment variable formats:
 * - VITE_API_URL (with or without /api, with or without trailing slash)
 * - VITE_BACKEND_URL (base origin)
 * - Auto-resolves endpoints so /api/upload and media URLs never break
 */
const getEnv = (key) => {
  try {
    return (import.meta.env && import.meta.env[key]) || "";
  } catch (e) {
    return "";
  }
};

const sanitize = (url = "") =>
  typeof url === "string" ? url.trim().replace(/\/+$/, "") : "";

const rawApi = sanitize(getEnv("VITE_API_URL") || getEnv("VITE_BACKEND_API_URL"));
const rawBackend = sanitize(getEnv("VITE_BACKEND_URL") || getEnv("VITE_SERVER_URL"));

let backendUrl = rawBackend;
let apiUrl = rawApi;

if (apiUrl && !backendUrl) {
  backendUrl = apiUrl.endsWith("/api") ? apiUrl.slice(0, -4) : apiUrl;
}

if (!backendUrl) {
  backendUrl =
    typeof window !== "undefined" && window.location.hostname !== "localhost" && !window.location.port
      ? window.location.origin
      : "http://localhost:5000";
}

if (!apiUrl) {
  apiUrl = `${backendUrl}/api`;
} else if (!apiUrl.endsWith("/api")) {
  apiUrl = `${apiUrl}/api`;
}

export const BACKEND_URL = backendUrl;
export const API_URL = apiUrl;

export default { API_URL, BACKEND_URL };
