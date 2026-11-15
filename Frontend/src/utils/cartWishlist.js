// Unified Cart & Wishlist Storage & Event Helper for Rhinco Equipments

const CART_KEY = "rhinco_cart";
const LEGACY_CART_KEY = "healthy_heaven_cart";
const WISHLIST_KEY = "rhinco_wishlist";
const LEGACY_WISHLIST_KEY = "healthy_heaven_wishlist";

// Helper to get consistent product ID
export const getProductId = (item) => {
  if (!item) return "";
  return String(item._id || item.id || item.productId || "");
};

// ---------------------- CART HELPERS ----------------------

export const getCart = () => {
  try {
    const raw = localStorage.getItem(CART_KEY) || localStorage.getItem(LEGACY_CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => ({
      ...item,
      productId: getProductId(item),
      id: getProductId(item),
      name: item.name || item.title || "Product",
      price: Number(item.price || item.finalPrice || 0),
      originalPrice: Number(item.oldPrice || item.price || 0),
      image: item.image || (Array.isArray(item.images) && item.images[0]) || "",
      category: item.category || "General",
      quantity: Math.max(1, Number(item.quantity) || 1),
    }));
  } catch (err) {
    console.error("Error reading cart from localStorage:", err);
    return [];
  }
};

export const saveCart = (cart) => {
  try {
    const normalized = Array.isArray(cart) ? cart : [];
    localStorage.setItem(CART_KEY, JSON.stringify(normalized));
    localStorage.setItem(LEGACY_CART_KEY, JSON.stringify(normalized));
    window.dispatchEvent(new CustomEvent("rhinco_cart_updated", { detail: normalized }));
    window.dispatchEvent(new Event("storage"));
  } catch (err) {
    console.error("Error saving cart to localStorage:", err);
  }
};

export const addToCart = (product, quantity = 1) => {
  const pId = getProductId(product);
  if (!pId) return getCart();

  const cart = getCart();
  const existingIndex = cart.findIndex((item) => getProductId(item) === pId);

  const effectivePrice = Number(product.finalPrice || product.price || 0);
  const originalPrice = Number(product.oldPrice || product.price || effectivePrice);
  const primaryImage = product.image || (Array.isArray(product.images) && product.images[0]) || "";

  if (existingIndex > -1) {
    cart[existingIndex].quantity += quantity;
  } else {
    cart.push({
      productId: pId,
      id: pId,
      name: product.name || product.title || "Product",
      price: effectivePrice,
      originalPrice: originalPrice,
      image: primaryImage,
      category: product.category || "General",
      stockQuantity: product.stockQuantity || 10,
      quantity: Math.max(1, quantity),
    });
  }

  saveCart(cart);
  return cart;
};

export const updateCartQuantity = (productId, delta) => {
  const pId = String(productId);
  const cart = getCart();
  const existingIndex = cart.findIndex((item) => getProductId(item) === pId);

  if (existingIndex === -1) return cart;

  const newQty = cart[existingIndex].quantity + delta;
  if (newQty <= 0) {
    cart.splice(existingIndex, 1);
  } else {
    cart[existingIndex].quantity = newQty;
  }

  saveCart(cart);
  return cart;
};

export const removeFromCart = (productId) => {
  const pId = String(productId);
  const cart = getCart().filter((item) => getProductId(item) !== pId);
  saveCart(cart);
  return cart;
};

export const clearCart = () => {
  saveCart([]);
  return [];
};

export const getCartItemQuantity = (productId) => {
  const pId = String(productId);
  const cart = getCart();
  const item = cart.find((i) => getProductId(i) === pId);
  return item ? item.quantity : 0;
};

export const getCartCount = () => {
  const cart = getCart();
  return cart.reduce((total, item) => total + (Number(item.quantity) || 1), 0);
};

export const getCartTotal = () => {
  const cart = getCart();
  return cart.reduce((total, item) => total + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);
};

// ---------------------- WISHLIST HELPERS ----------------------

export const getWishlist = () => {
  try {
    const raw = localStorage.getItem(WISHLIST_KEY) || localStorage.getItem(LEGACY_WISHLIST_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Filter out old demo products from earlier templates (e.g. demo-honey, demo-almond)
    return parsed
      .filter((item) => {
        const pId = getProductId(item);
        return !pId.startsWith("demo-") && item.name !== "Organic Forest Honey";
      })
      .map((item) => ({
        ...item,
        productId: getProductId(item),
        id: getProductId(item),
        name: item.name || item.title || "Product",
        price: Number(item.price || item.finalPrice || 0),
        image: item.image || (Array.isArray(item.images) && item.images[0]) || "",
        category: item.category || "General",
        inStock: item.stockQuantity === undefined || item.stockQuantity > 0,
      }));
  } catch (err) {
    console.error("Error reading wishlist:", err);
    return [];
  }
};

export const saveWishlist = (wishlist) => {
  try {
    const normalized = Array.isArray(wishlist) ? wishlist : [];
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(normalized));
    localStorage.setItem(LEGACY_WISHLIST_KEY, JSON.stringify(normalized));
    window.dispatchEvent(new CustomEvent("rhinco_wishlist_updated", { detail: normalized }));
    window.dispatchEvent(new Event("storage"));
  } catch (err) {
    console.error("Error saving wishlist:", err);
  }
};

export const toggleWishlist = (product) => {
  const pId = getProductId(product);
  if (!pId) return false;

  const wishlist = getWishlist();
  const existingIndex = wishlist.findIndex((item) => getProductId(item) === pId);

  let isNowInWishlist = false;
  if (existingIndex > -1) {
    wishlist.splice(existingIndex, 1);
    isNowInWishlist = false;
  } else {
    wishlist.push({
      productId: pId,
      id: pId,
      name: product.name || product.title || "Product",
      price: Number(product.finalPrice || product.price || 0),
      oldPrice: Number(product.oldPrice || product.price || 0),
      image: product.image || (Array.isArray(product.images) && product.images[0]) || "",
      category: product.category || "General",
      description: product.description || "",
      stockQuantity: product.stockQuantity || 10,
      inStock: true,
    });
    isNowInWishlist = true;
  }

  saveWishlist(wishlist);
  return isNowInWishlist;
};

export const isInWishlist = (productId) => {
  const pId = String(productId);
  const wishlist = getWishlist();
  return wishlist.some((item) => getProductId(item) === pId);
};

export const removeFromWishlist = (productId) => {
  const pId = String(productId);
  const wishlist = getWishlist().filter((item) => getProductId(item) !== pId);
  saveWishlist(wishlist);
  return wishlist;
};

export const getWishlistCount = () => {
  return getWishlist().length;
};
