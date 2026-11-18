/**
 * Frontend Utilities & Helpers
 */

import { API_URL, BACKEND_URL } from "./apiConfig.js";

export { API_URL, BACKEND_URL };

const BACKEND_ORIGIN = BACKEND_URL;

/**
 * Resolves an image URL:
 * - If image path starts with /uploads, prepends the backend origin
 * - If image is an object { url, data, preview, src }, extracts the string path
 * - If image is an external URL (http/https/blob/data), returns as is
 * - If empty or invalid, returns fallback
 */
export const resolveImageUrl = (path, fallback = "") => {
  if (!path) return fallback;
  let raw = path;
  if (typeof raw === "object" && raw !== null) {
    raw = raw.url || raw.data || raw.preview || raw.src || "";
  }
  if (!raw || typeof raw !== "string") return fallback;
  raw = raw.trim();

  // Guard against dead mock test server URLs (e.g. :37857, :7070, :7071)
  if (
    raw.startsWith(":") ||
    raw.includes("localhost:37857") ||
    raw.includes("localhost:7070") ||
    raw.includes("localhost:7071") ||
    raw.includes(":37857") ||
    raw.includes(":7070") ||
    raw.includes(":7071")
  ) {
    return fallback;
  }

  if (
    raw.startsWith("http://") ||
    raw.startsWith("https://") ||
    raw.startsWith("blob:") ||
    raw.startsWith("data:")
  ) {
    return raw;
  }
  if (raw.startsWith("//")) {
    return `https:${raw}`;
  }
  const cleanPath = raw.startsWith("/") ? raw : `/${raw}`;
  return `${BACKEND_ORIGIN}${cleanPath}`;
};

/**
 * Generates a clean URL slug (e.g. "shaktiman-regular-plus-rotavator")
 * Replaces spaces, percent encodings, and special characters with hyphens.
 */
export const toMachinerySlug = (input) => {
  if (!input) return "";
  let text = input;
  if (typeof input === "object") {
    text = input.slug || input.name || input.title || input.modelName || input._id || "";
  }
  let decoded = text;
  try {
    decoded = decodeURIComponent(text);
  } catch (e) {}
  return String(decoded)
    .toLowerCase()
    .trim()
    .replace(/%20/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

/**
 * Generates a clean URL slug for store products (e.g. "rhinco-hydraulic-trolley-5-ton")
 * Replaces spaces, percent encodings, and special characters with hyphens.
 */
export const toProductSlug = (input) => {
  if (!input) return "";
  let text = input;
  if (typeof input === "object") {
    text = input.slug || input.name || input.title || input.modelName || input._id || "";
  }
  let decoded = text;
  try {
    decoded = decodeURIComponent(text);
  } catch (e) {}
  return String(decoded)
    .toLowerCase()
    .trim()
    .replace(/%20/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

export default {
  resolveImageUrl,
  toMachinerySlug,
  toProductSlug,
};
