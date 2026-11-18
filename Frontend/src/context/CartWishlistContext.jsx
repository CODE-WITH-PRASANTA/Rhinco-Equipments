import React, { createContext, useContext, useState, useMemo, useCallback } from "react";

// -------------------------------------------------------------
// HELPER: Consistent Product ID Resolution
// -------------------------------------------------------------
export const getProductId = (item) => {
  if (!item) return "";
  return String(item._id || item.id || item.productId || "");
};

// -------------------------------------------------------------
// CONTEXTS
// -------------------------------------------------------------
const CartContext = createContext(null);
const WishlistContext = createContext(null);

// -------------------------------------------------------------
// CART PROVIDER (Pure React Context State — No localStorage)
// -------------------------------------------------------------
export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // Check if an item is already in cart
  const isInCart = useCallback(
    (productId) => {
      const pId = String(productId || "");
      if (!pId) return false;
      return cartItems.some((item) => getProductId(item) === pId);
    },
    [cartItems]
  );

  // Get quantity of a specific item in cart
  const getCartItemQuantity = useCallback(
    (productId) => {
      const pId = String(productId || "");
      if (!pId) return 0;
      const found = cartItems.find((item) => getProductId(item) === pId);
      return found ? Number(found.quantity) || 1 : 0;
    },
    [cartItems]
  );

  // Add product to cart
  const addToCart = useCallback((product, quantity = 1) => {
    if (!product) return;
    const pId = getProductId(product);
    if (!pId) return;

    const qtyToAdd = Math.max(1, Number(quantity) || 1);
    const effectivePrice = Number(product.finalPrice ?? product.price ?? 0);
    const originalPrice = Number(product.oldPrice ?? product.regularPrice ?? product.price ?? effectivePrice);
    const primaryImage =
      product.image ||
      (Array.isArray(product.images) && product.images[0]) ||
      product.featuredImage?.data ||
      "";

    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => getProductId(item) === pId);
      let updated;

      if (existingIndex > -1) {
        updated = prevItems.map((item, idx) =>
          idx === existingIndex
            ? { ...item, quantity: (Number(item.quantity) || 1) + qtyToAdd }
            : item
        );
      } else {
        const newItem = {
          productId: pId,
          id: pId,
          _id: pId,
          name: product.name || product.title || product.modelName || "Product",
          price: effectivePrice,
          originalPrice: originalPrice,
          image: primaryImage,
          category: product.category || "General",
          stockQuantity: product.stockQuantity ?? 10,
          quantity: qtyToAdd,
        };
        updated = [...prevItems, newItem];
      }

      // Fire custom event for any listeners
      try {
        window.dispatchEvent(new CustomEvent("rhinco_cart_updated", { detail: updated }));
      } catch (e) {}

      return updated;
    });
  }, []);

  // Update item quantity by delta (+1, -1, etc.)
  const updateCartQuantity = useCallback((productId, delta) => {
    const pId = String(productId || "");
    if (!pId) return;

    setCartItems((prevItems) => {
      const existing = prevItems.find((item) => getProductId(item) === pId);
      if (!existing) return prevItems;

      const newQty = (Number(existing.quantity) || 1) + Number(delta);
      let updated;

      if (newQty <= 0) {
        updated = prevItems.filter((item) => getProductId(item) !== pId);
      } else {
        updated = prevItems.map((item) =>
          getProductId(item) === pId ? { ...item, quantity: newQty } : item
        );
      }

      try {
        window.dispatchEvent(new CustomEvent("rhinco_cart_updated", { detail: updated }));
      } catch (e) {}

      return updated;
    });
  }, []);

  // Directly set item quantity
  const setCartQuantity = useCallback((productId, newQty) => {
    const pId = String(productId || "");
    if (!pId) return;

    const qty = Number(newQty);
    setCartItems((prevItems) => {
      let updated;
      if (qty <= 0) {
        updated = prevItems.filter((item) => getProductId(item) !== pId);
      } else {
        updated = prevItems.map((item) =>
          getProductId(item) === pId ? { ...item, quantity: qty } : item
        );
      }

      try {
        window.dispatchEvent(new CustomEvent("rhinco_cart_updated", { detail: updated }));
      } catch (e) {}

      return updated;
    });
  }, []);

  // Remove single item from cart
  const removeFromCart = useCallback((productId) => {
    const pId = String(productId || "");
    if (!pId) return;

    setCartItems((prevItems) => {
      const updated = prevItems.filter((item) => getProductId(item) !== pId);
      try {
        window.dispatchEvent(new CustomEvent("rhinco_cart_updated", { detail: updated }));
      } catch (e) {}
      return updated;
    });
  }, []);

  // Remove multiple items from cart
  const removeMultipleFromCart = useCallback((productIds) => {
    if (!Array.isArray(productIds) || productIds.length === 0) return;
    const idSet = new Set(productIds.map((id) => String(id)));

    setCartItems((prevItems) => {
      const updated = prevItems.filter((item) => !idSet.has(String(getProductId(item))));
      try {
        window.dispatchEvent(new CustomEvent("rhinco_cart_updated", { detail: updated }));
      } catch (e) {}
      return updated;
    });
  }, []);

  // Clear entire cart
  const clearCart = useCallback(() => {
    setCartItems([]);
    try {
      window.dispatchEvent(new CustomEvent("rhinco_cart_updated", { detail: [] }));
    } catch (e) {}
  }, []);

  // Total quantity count across all items in cart
  const cartCount = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + (Number(item.quantity) || 1), 0);
  }, [cartItems]);

  // Total cart monetary value
  const cartTotal = useMemo(() => {
    return cartItems.reduce(
      (acc, item) => acc + (Number(item.price) || 0) * (Number(item.quantity) || 1),
      0
    );
  }, [cartItems]);

  const value = useMemo(
    () => ({
      cartItems,
      cartCount,
      cartTotal,
      addToCart,
      updateCartQuantity,
      setCartQuantity,
      removeFromCart,
      removeMultipleFromCart,
      clearCart,
      isInCart,
      getCartItemQuantity,
      setCartItems, // Available if custom bulk update needed
    }),
    [
      cartItems,
      cartCount,
      cartTotal,
      addToCart,
      updateCartQuantity,
      setCartQuantity,
      removeFromCart,
      removeMultipleFromCart,
      clearCart,
      isInCart,
      getCartItemQuantity,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// -------------------------------------------------------------
// WISHLIST PROVIDER (Pure React Context State — No localStorage)
// -------------------------------------------------------------
export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);

  // Check if an item is in wishlist
  const isInWishlist = useCallback(
    (productId) => {
      const pId = String(productId || "");
      if (!pId) return false;
      return wishlistItems.some((item) => getProductId(item) === pId);
    },
    [wishlistItems]
  );

  // Add product to wishlist
  const addToWishlist = useCallback((product) => {
    if (!product) return;
    const pId = getProductId(product);
    if (!pId) return;

    setWishlistItems((prevItems) => {
      if (prevItems.some((item) => getProductId(item) === pId)) {
        return prevItems; // already exists
      }

      const effectivePrice = Number(product.finalPrice ?? product.price ?? 0);
      const originalPrice = Number(product.oldPrice ?? product.regularPrice ?? product.price ?? effectivePrice);
      const primaryImage =
        product.image ||
        (Array.isArray(product.images) && product.images[0]) ||
        product.featuredImage?.data ||
        "";

      const newItem = {
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
      };

      const updated = [...prevItems, newItem];
      try {
        window.dispatchEvent(new CustomEvent("rhinco_wishlist_updated", { detail: updated }));
      } catch (e) {}
      return updated;
    });
  }, []);

  // Remove product from wishlist
  const removeFromWishlist = useCallback((productId) => {
    const pId = String(productId || "");
    if (!pId) return;

    setWishlistItems((prevItems) => {
      const updated = prevItems.filter((item) => getProductId(item) !== pId);
      try {
        window.dispatchEvent(new CustomEvent("rhinco_wishlist_updated", { detail: updated }));
      } catch (e) {}
      return updated;
    });
  }, []);

  // Toggle product in wishlist (adds if not present, removes if present)
  // Returns boolean: true if added, false if removed
  const toggleWishlist = useCallback((product) => {
    if (!product) return false;
    const pId = getProductId(product);
    if (!pId) return false;

    let isAdded = false;
    setWishlistItems((prevItems) => {
      const exists = prevItems.some((item) => getProductId(item) === pId);
      let updated;
      if (exists) {
        updated = prevItems.filter((item) => getProductId(item) !== pId);
        isAdded = false;
      } else {
        const effectivePrice = Number(product.finalPrice ?? product.price ?? 0);
        const originalPrice = Number(product.oldPrice ?? product.regularPrice ?? product.price ?? effectivePrice);
        const primaryImage =
          product.image ||
          (Array.isArray(product.images) && product.images[0]) ||
          product.featuredImage?.data ||
          "";

        const newItem = {
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
        };
        updated = [...prevItems, newItem];
        isAdded = true;
      }

      try {
        window.dispatchEvent(new CustomEvent("rhinco_wishlist_updated", { detail: updated }));
      } catch (e) {}

      return updated;
    });

    return isAdded;
  }, []);

  // Clear wishlist
  const clearWishlist = useCallback(() => {
    setWishlistItems([]);
    try {
      window.dispatchEvent(new CustomEvent("rhinco_wishlist_updated", { detail: [] }));
    } catch (e) {}
  }, []);

  // Total wishlist count
  const wishlistCount = useMemo(() => {
    return wishlistItems.length;
  }, [wishlistItems]);

  const value = useMemo(
    () => ({
      wishlistItems,
      wishlistCount,
      addToWishlist,
      removeFromWishlist,
      toggleWishlist,
      isInWishlist,
      clearWishlist,
      setWishlistItems,
    }),
    [
      wishlistItems,
      wishlistCount,
      addToWishlist,
      removeFromWishlist,
      toggleWishlist,
      isInWishlist,
      clearWishlist,
    ]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};

// -------------------------------------------------------------
// COMBINED PROVIDER (CartWishlistProvider)
// -------------------------------------------------------------
export const CartWishlistProvider = ({ children }) => {
  return (
    <CartProvider>
      <WishlistProvider>{children}</WishlistProvider>
    </CartProvider>
  );
};

// -------------------------------------------------------------
// CUSTOM HOOKS (With Fallback Grace to Prevent Breakpoints)
// -------------------------------------------------------------
const defaultCartContext = {
  cartItems: [],
  cartCount: 0,
  cartTotal: 0,
  addToCart: () => {},
  updateCartQuantity: () => {},
  setCartQuantity: () => {},
  removeFromCart: () => {},
  removeMultipleFromCart: () => {},
  clearCart: () => {},
  isInCart: () => false,
  getCartItemQuantity: () => 0,
  setCartItems: () => {},
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    console.warn("useCart was used outside of <CartProvider>. Fallback dummy context returned to prevent breakpoint.");
    return defaultCartContext;
  }
  return context;
};

const defaultWishlistContext = {
  wishlistItems: [],
  wishlistCount: 0,
  addToWishlist: () => {},
  removeFromWishlist: () => {},
  toggleWishlist: () => false,
  isInWishlist: () => false,
  clearWishlist: () => {},
  setWishlistItems: () => {},
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    console.warn("useWishlist was used outside of <WishlistProvider>. Fallback dummy context returned to prevent breakpoint.");
    return defaultWishlistContext;
  }
  return context;
};

export default CartWishlistProvider;
