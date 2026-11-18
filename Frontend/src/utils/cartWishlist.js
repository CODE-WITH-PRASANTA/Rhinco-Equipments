// Unified In-Memory Cart & Wishlist Helper for Rhinco Equipments
// NOTE: localStorage integration has been TOTALLY REMOVED as requested.
// All state is managed purely in-memory and synchronized with React Context API.

export const getProductId = (item) => {
  if (!item) return "";
  return String(item._id || item.id || item.productId || "");
};

// Pure in-memory stores (NO localStorage)
let memoryCart = [];
let memoryWishlist = [];

// Listen to context events if running in browser
if (typeof window !== "undefined") {
  window.addEventListener("rhinco_cart_updated", (e) => {
    if (e.detail && Array.isArray(e.detail)) {
      memoryCart = e.detail;
    }
  });

  window.addEventListener("rhinco_wishlist_updated", (e) => {
    if (e.detail && Array.isArray(e.detail)) {
      memoryWishlist = e.detail;
    }
  });
}

// ---------------------- CART HELPERS (NO LOCALSTORAGE) ----------------------

export const getCart = () => {
  return [...memoryCart];
};

export const saveCart = (cart) => {
  memoryCart = Array.isArray(cart) ? [...cart] : [];
  if (typeof window !== "undefined") {
    try {
      window.dispatchEvent(new CustomEvent("rhinco_cart_updated", { detail: memoryCart }));
    } catch (e) {}
  }
};

export const addToCart = (product, quantity = 1) => {
  const pId = getProductId(product);
  if (!pId) return getCart();

  const cart = [...memoryCart];
  const existingIndex = cart.findIndex((item) => getProductId(item) === pId);

  const effectivePrice = Number(product.finalPrice ?? product.price ?? 0);
  const originalPrice = Number(product.oldPrice ?? product.regularPrice ?? product.price ?? effectivePrice);
  const primaryImage =
    product.image ||
    (Array.isArray(product.images) && product.images[0]) ||
    product.featuredImage?.data ||
    "";

  if (existingIndex > -1) {
    cart[existingIndex] = {
      ...cart[existingIndex],
      quantity: (Number(cart[existingIndex].quantity) || 1) + Math.max(1, Number(quantity) || 1),
    };
  } else {
    cart.push({
      productId: pId,
      id: pId,
      _id: pId,
      name: product.name || product.title || product.modelName || "Product",
      price: effectivePrice,
      originalPrice: originalPrice,
      image: primaryImage,
      category: product.category || "General",
      stockQuantity: product.stockQuantity ?? 10,
      quantity: Math.max(1, Number(quantity) || 1),
    });
  }

  saveCart(cart);
  return cart;
};

export const updateCartQuantity = (productId, delta) => {
  const pId = String(productId || "");
  let cart = [...memoryCart];
  const existingIndex = cart.findIndex((item) => getProductId(item) === pId);

  if (existingIndex === -1) return cart;

  const newQty = (Number(cart[existingIndex].quantity) || 1) + Number(delta);
  if (newQty <= 0) {
    cart.splice(existingIndex, 1);
  } else {
    cart[existingIndex] = {
      ...cart[existingIndex],
      quantity: newQty,
    };
  }

  saveCart(cart);
  return cart;
};

export const removeFromCart = (productId) => {
  const pId = String(productId || "");
  const cart = memoryCart.filter((item) => getProductId(item) !== pId);
  saveCart(cart);
  return cart;
};

export const clearCart = () => {
  saveCart([]);
  return [];
};

export const getCartItemQuantity = (productId) => {
  const pId = String(productId || "");
  const item = memoryCart.find((i) => getProductId(i) === pId);
  return item ? Number(item.quantity) || 1 : 0;
};

export const getCartCount = () => {
  return memoryCart.reduce((total, item) => total + (Number(item.quantity) || 1), 0);
};

export const getCartTotal = () => {
  return memoryCart.reduce(
    (total, item) => total + (Number(item.price) || 0) * (Number(item.quantity) || 1),
    0
  );
};

// ---------------------- WISHLIST HELPERS (NO LOCALSTORAGE) ----------------------

export const getWishlist = () => {
  return [...memoryWishlist];
};

export const saveWishlist = (wishlist) => {
  memoryWishlist = Array.isArray(wishlist) ? [...wishlist] : [];
  if (typeof window !== "undefined") {
    try {
      window.dispatchEvent(new CustomEvent("rhinco_wishlist_updated", { detail: memoryWishlist }));
    } catch (e) {}
  }
};

export const toggleWishlist = (product) => {
  const pId = getProductId(product);
  if (!pId) return false;

  let wishlist = [...memoryWishlist];
  const existingIndex = wishlist.findIndex((item) => getProductId(item) === pId);

  let isNowInWishlist = false;
  if (existingIndex > -1) {
    wishlist.splice(existingIndex, 1);
    isNowInWishlist = false;
  } else {
    const effectivePrice = Number(product.finalPrice ?? product.price ?? 0);
    const originalPrice = Number(product.oldPrice ?? product.regularPrice ?? product.price ?? effectivePrice);
    const primaryImage =
      product.image ||
      (Array.isArray(product.images) && product.images[0]) ||
      product.featuredImage?.data ||
      "";

    wishlist.push({
      productId: pId,
      id: pId,
      _id: pId,
      name: product.name || product.title || product.modelName || "Product",
      price: effectivePrice,
      oldPrice: originalPrice,
      image: primaryImage,
      category: product.category || "General",
      description: product.description || "",
      stockQuantity: product.stockQuantity ?? 10,
      inStock: product.stockQuantity === undefined || product.stockQuantity > 0,
    });
    isNowInWishlist = true;
  }

  saveWishlist(wishlist);
  return isNowInWishlist;
};

export const isInWishlist = (productId) => {
  const pId = String(productId || "");
  return memoryWishlist.some((item) => getProductId(item) === pId);
};

export const removeFromWishlist = (productId) => {
  const pId = String(productId || "");
  const wishlist = memoryWishlist.filter((item) => getProductId(item) !== pId);
  saveWishlist(wishlist);
  return wishlist;
};

export const getWishlistCount = () => {
  return memoryWishlist.length;
};
