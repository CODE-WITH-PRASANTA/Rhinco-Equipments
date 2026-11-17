/**
 * Frontend Utilities & Helpers
 */

const BACKEND_ORIGIN = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

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
 * Generates a clean URL slug (e.g. "shaktiman-regular-plus-rotavator")
 * Replaces spaces, percent encodings, and special characters with hyphens.
 */
export const toMachinerySlug = (text) => {
  if (!text) return "";
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/%20/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

export default {
  resolveImageUrl,
  toMachinerySlug,
};
