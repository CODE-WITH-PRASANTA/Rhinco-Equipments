
import React, { useEffect, useMemo, useState } from "react";
import {
  Heart,
  ShoppingBag,
  ShoppingCart,
  Trash2,
  Search,
  ArrowRight,
  ArrowLeft,
  X,
  Check,
  HeartOff,
  SlidersHorizontal,
  Package,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./WishlistMain.css";

const WISHLIST_KEY = "healthy_heaven_wishlist";
const CART_KEY = "healthy_heaven_cart";
const DEMO_VERSION_KEY = "healthy_heaven_wishlist_demo_version";
const DEMO_VERSION = "2";

// 15 demo products
const dummyProducts = [
  {
    productId: "demo-honey-001",
    name: "Organic Forest Honey",
    category: "Natural Sweeteners",
    description: "Pure natural honey with a rich taste and golden texture.",
    price: 349,
    image: "https://images.unsplash.com/photo-1587049352851-8d4e89133924?w=800&auto=format&fit=crop",
  },
  {
    productId: "demo-almond-002",
    name: "Premium California Almonds",
    category: "Dry Fruits",
    description: "Crunchy premium almonds for everyday snacking.",
    price: 599,
    image: "https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=800&auto=format&fit=crop",
  },
  {
    productId: "demo-green-tea-003",
    name: "Organic Green Tea",
    category: "Beverages",
    description: "Refreshing green tea for a relaxing daily routine.",
    price: 249,
    image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&auto=format&fit=crop",
  },
  {
    productId: "demo-dates-004",
    name: "Premium Seedless Dates",
    category: "Dry Fruits",
    description: "Naturally sweet and soft dates for healthy snacking.",
    price: 399,
    image: "https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=800&auto=format&fit=crop",
  },
  {
    productId: "demo-cookies-005",
    name: "Healthy Millet Cookies",
    category: "Healthy Snacks",
    description: "Delicious cookies made for wholesome snacking.",
    price: 199,
    image: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800&auto=format&fit=crop",
  },
  {
    productId: "demo-moringa-006",
    name: "Organic Moringa Powder",
    category: "Organic Products",
    description: "Versatile moringa powder for everyday recipes.",
    price: 299,
    image: "https://images.unsplash.com/photo-1547592180-85f173990554?w=800&auto=format&fit=crop",
  },
  {
    productId: "demo-cashew-007",
    name: "Premium Whole Cashews",
    category: "Dry Fruits",
    description: "Rich and creamy whole cashews for delicious snacking.",
    price: 699,
    image: "https://images.unsplash.com/photo-1563412885-1394d5b8f9e6?w=800&auto=format&fit=crop",
  },
  {
    productId: "demo-oats-008",
    name: "Rolled Wholegrain Oats",
    category: "Healthy Breakfast",
    description: "A versatile breakfast ingredient for busy mornings.",
    price: 179,
    image: "https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=800&auto=format&fit=crop",
  },
  {
    productId: "demo-seeds-009",
    name: "Mixed Super Seeds",
    category: "Seeds",
    description: "A convenient mix of seeds for meals and smoothies.",
    price: 279,
    image: "https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=800&auto=format&fit=crop",
  },
  {
    productId: "demo-peanut-010",
    name: "Natural Peanut Butter",
    category: "Healthy Spreads",
    description: "A creamy spread for toast, snacks, and smoothies.",
    price: 329,
    image: "https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?w=800&auto=format&fit=crop",
  },
  {
    productId: "demo-coconut-011",
    name: "Cold Pressed Coconut Oil",
    category: "Natural Oils",
    description: "A versatile coconut oil for everyday use.",
    price: 449,
    image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&auto=format&fit=crop",
  },
  {
    productId: "demo-granola-012",
    name: "Crunchy Fruit Granola",
    category: "Healthy Breakfast",
    description: "Crunchy granola with a delicious fruity combination.",
    price: 389,
    image: "https://images.unsplash.com/photo-1517093157656-b9eccef91cb1?w=800&auto=format&fit=crop",
  },
  {
    productId: "demo-pistachio-013",
    name: "Premium Salted Pistachios",
    category: "Dry Fruits",
    description: "Tasty pistachios for a satisfying snack.",
    price: 749,
    image: "https://images.unsplash.com/photo-1579532467592-3f1f4a5a8c64?w=800&auto=format&fit=crop",
  },
  {
    productId: "demo-chia-014",
    name: "Organic Chia Seeds",
    category: "Seeds",
    description: "Small versatile seeds for puddings and smoothies.",
    price: 229,
    image: "https://images.unsplash.com/photo-1515543904379-3d757afe72e4?w=800&auto=format&fit=crop",
  },
  {
    productId: "demo-raisins-015",
    name: "Natural Golden Raisins",
    category: "Dry Fruits",
    description: "Naturally sweet raisins for snacks and baking.",
    price: 259,
    image: "https://images.unsplash.com/photo-1596591606975-97ee5cef3a1e?w=800&auto=format&fit=crop",
  },
];

const getProductId = (item) =>
  String(item.productId || item.id || item._id || "");

const formatPrice = (price) =>
  Number(price || 0).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  });

const getImageUrl = (image) => {
  if (!image) return "/images/product-placeholder.png";

  if (
    image.startsWith("http://") ||
    image.startsWith("https://") ||
    image.startsWith("data:")
  ) {
    return image;
  }

  return image.startsWith("/") ? image : `/${image}`;
};

// Load saved wishlist and add new demo products only once.
const getInitialWishlist = () => {
  try {
    const stored = localStorage.getItem(WISHLIST_KEY);
    const parsed = stored ? JSON.parse(stored) : [];
    const existingItems = Array.isArray(parsed) ? parsed : [];

    const currentVersion = localStorage.getItem(DEMO_VERSION_KEY);

    if (currentVersion !== DEMO_VERSION) {
      const existingIds = new Set(
        existingItems.map((item) => getProductId(item))
      );

      const newDemoProducts = dummyProducts.filter(
        (product) => !existingIds.has(getProductId(product))
      );

      const updatedWishlist = [
        ...existingItems,
        ...newDemoProducts,
      ];

      localStorage.setItem(
        WISHLIST_KEY,
        JSON.stringify(updatedWishlist)
      );

      localStorage.setItem(DEMO_VERSION_KEY, DEMO_VERSION);

      return updatedWishlist;
    }

    return existingItems;
  } catch (error) {
    console.error("Unable to load wishlist:", error);
    return [];
  }
};

const getStoredWishlist = () => {
  try {
    const stored = localStorage.getItem(WISHLIST_KEY);
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const getStoredCart = () => {
  try {
    const stored = localStorage.getItem(CART_KEY);
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const WishlistMain = () => {
  const navigate = useNavigate();

  const [wishlistItems, setWishlistItems] = useState(getInitialWishlist);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [showClearModal, setShowClearModal] = useState(false);
  const [toast, setToast] = useState("");

  // Save wishlist
  useEffect(() => {
    localStorage.setItem(
      WISHLIST_KEY,
      JSON.stringify(wishlistItems)
    );
  }, [wishlistItems]);

  // Listen for updates
  useEffect(() => {
    const handleWishlistUpdate = () => {
      setWishlistItems(getStoredWishlist());
    };

    const handleStorage = (event) => {
      if (event.key === WISHLIST_KEY) {
        setWishlistItems(getStoredWishlist());
      }
    };

    window.addEventListener("wishlistUpdated", handleWishlistUpdate);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("wishlistUpdated", handleWishlistUpdate);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  // Toast
  const showToast = (message) => {
    setToast(message);
    window.clearTimeout(showToast.timer);

    showToast.timer = window.setTimeout(() => {
      setToast("");
    }, 2500);
  };

  // Search and sorting
  const filteredItems = useMemo(() => {
    let items = [...wishlistItems];

    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();

      items = items.filter((item) =>
        [item.name, item.category, item.description]
          .filter(Boolean)
          .some((value) =>
            String(value).toLowerCase().includes(search)
          )
      );
    }

    switch (sortBy) {
      case "price-low":
        items.sort((a, b) => Number(a.price) - Number(b.price));
        break;

      case "price-high":
        items.sort((a, b) => Number(b.price) - Number(a.price));
        break;

      case "name":
        items.sort((a, b) => a.name.localeCompare(b.name));
        break;

      default:
        break;
    }

    return items;
  }, [wishlistItems, searchTerm, sortBy]);

  // Remove product
  const removeFromWishlist = (id) => {
    setWishlistItems((previous) =>
      previous.filter((item) => getProductId(item) !== id)
    );

    showToast("Product removed from wishlist");
  };

  // Clear wishlist
  const clearWishlist = () => {
    setWishlistItems([]);
    setShowClearModal(false);
    showToast("Your wishlist has been cleared");
  };

  // Add product to cart
  const addToCart = (product) => {
    const productId = getProductId(product);

    if (!productId) {
      showToast("Unable to identify this product");
      return;
    }

    const cart = getStoredCart();

    const existingIndex = cart.findIndex(
      (item) => getProductId(item) === productId
    );

    let updatedCart;

    if (existingIndex !== -1) {
      updatedCart = cart.map((item, index) =>
        index === existingIndex
          ? {
              ...item,
              quantity: (Number(item.quantity) || 1) + 1,
            }
          : item
      );
    } else {
      updatedCart = [
        ...cart,
        {
          productId,
          name: product.name,
          description: product.description || "",
          price: Number(product.price) || 0,
          image: product.image || "",
          category: product.category || "",
          quantity: 1,
        },
      ];
    }

    localStorage.setItem(CART_KEY, JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("cartUpdated"));

    showToast("Product added to cart");
  };

  // Move to cart and remove from wishlist
  const moveToCart = (product) => {
    addToCart(product);
    removeFromWishlist(getProductId(product));
  };

  // Add all products to cart
  const addAllToCart = () => {
    if (!wishlistItems.length) return;

    const updatedCart = [...getStoredCart()];

    wishlistItems.forEach((product) => {
      const productId = getProductId(product);

      if (!productId) return;

      const existingIndex = updatedCart.findIndex(
        (item) => getProductId(item) === productId
      );

      if (existingIndex !== -1) {
        updatedCart[existingIndex] = {
          ...updatedCart[existingIndex],
          quantity:
            (Number(updatedCart[existingIndex].quantity) || 1) + 1,
        };
      } else {
        updatedCart.push({
          productId,
          name: product.name,
          description: product.description || "",
          price: Number(product.price) || 0,
          image: product.image || "",
          category: product.category || "",
          quantity: 1,
        });
      }
    });

    localStorage.setItem(CART_KEY, JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("cartUpdated"));

    showToast("All wishlist products added to cart");
  };

  // Navigation
  const handleContinueShopping = () => navigate("/products");
  const handleGoToCart = () => navigate("/cart");

  const totalWishlistValue = wishlistItems.reduce(
    (total, item) => total + Number(item.price || 0),
    0
  );

  return (
    <section className="wishlistMain">

      {/* HEADER */}
      <div className="wishlistMainHeader">
        <div>
          <span className="wishlistMainEyebrow">
            YOUR FAVORITES
          </span>

          <h1>
            My <span>Wishlist</span>
          </h1>

          <p>
            Keep your favorite products close and shop
            whenever you are ready.
          </p>
        </div>

        <div className="wishlistMainHeaderActions">
          <button
            className="wishlistMainCartButton"
            onClick={handleGoToCart}
          >
            <ShoppingCart size={18} />
            View Cart
          </button>

          <div className="wishlistMainCount">
            <Heart size={19} fill="currentColor" />
            <span>{wishlistItems.length} Saved</span>
          </div>
        </div>
      </div>

      {wishlistItems.length === 0 ? (
        /* EMPTY STATE */
        <div className="wishlistMainEmpty">
          <div className="wishlistMainEmptyImage">
            <img
              src="/images/wishlist-empty.png"
              alt="Empty wishlist illustration"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />

            <div className="wishlistMainEmptyFallback">
              <HeartOff size={55} strokeWidth={1.4} />
            </div>
          </div>

          <span className="wishlistMainEmptyTag">
            NOTHING SAVED YET
          </span>

          <h2>Your wishlist is waiting for love!</h2>

          <p>
            You haven't saved any products yet. Explore our
            collection and tap the heart icon on products
            you love.
          </p>

          <button
            className="wishlistMainShopButton"
            onClick={handleContinueShopping}
          >
            <ShoppingBag size={18} />
            Go to Products
            <ArrowRight size={17} />
          </button>

          <div className="wishlistMainEmptyNote">
            <Heart size={15} />
            Your favorite products will appear here.
          </div>
        </div>
      ) : (
        <>
          {/* SUMMARY */}
          <div className="wishlistMainSummary">
            <div className="wishlistMainSummaryIcon">
              <Heart size={24} fill="currentColor" />
            </div>

            <div className="wishlistMainSummaryText">
              <strong>
                {wishlistItems.length} Favorite Products
              </strong>
              <span>Total value of your saved products</span>
            </div>

            <div className="wishlistMainSummaryValue">
              {formatPrice(totalWishlistValue)}
            </div>
          </div>

          {/* TOOLBAR */}
          <div className="wishlistMainToolbar">
            <div className="wishlistMainSearch">
              <Search size={18} />

              <input
                type="text"
                placeholder="Search your wishlist..."
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
              />

              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="wishlistMainToolbarRight">
              <div className="wishlistMainSort">
                <SlidersHorizontal size={16} />

                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                  aria-label="Sort wishlist"
                >
                  <option value="recent">Recently Added</option>
                  <option value="name">Name: A to Z</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>

              <button
                className="wishlistMainClearButton"
                onClick={() => setShowClearModal(true)}
              >
                <Trash2 size={16} />
                Clear All
              </button>
            </div>
          </div>

          {/* RESULTS */}
          <div className="wishlistMainResults">
            <div>
              <h2>Saved Products</h2>
              <span>
                Showing {filteredItems.length} of {wishlistItems.length} products
              </span>
            </div>

            <button
              className="wishlistMainAddAllButton"
              onClick={addAllToCart}
            >
              <ShoppingCart size={17} />
              Add All to Cart
            </button>
          </div>

          {/* PRODUCT GRID */}
          {filteredItems.length > 0 ? (
            <div className="wishlistMainGrid">
              {filteredItems.map((product) => {
                const id = getProductId(product);

                return (
                  <article className="wishlistMainCard" key={id}>
                    <div className="wishlistMainCardImage">
                      <img
                        src={getImageUrl(product.image)}
                        alt={product.name}
                        loading="lazy"
                        onError={(event) => {
                          event.currentTarget.src =
                            "/images/product-placeholder.png";
                        }}
                      />

                      <span className="wishlistMainSavedBadge">
                        <Heart size={13} fill="currentColor" />
                        Saved
                      </span>

                      <button
                        className="wishlistMainRemoveButton"
                        onClick={() => removeFromWishlist(id)}
                        title="Remove from wishlist"
                        aria-label={`Remove ${product.name} from wishlist`}
                      >
                        <HeartOff size={17} />
                      </button>
                    </div>

                    <div className="wishlistMainCardContent">
                      <span className="wishlistMainCardCategory">
                        {product.category || "Healthy Products"}
                      </span>

                      <h3>{product.name}</h3>

                      <p>
                        {product.description ||
                          "A quality product selected for you."}
                      </p>

                      <div className="wishlistMainCardBottom">
                        <strong>
                          {formatPrice(product.price)}
                        </strong>

                        <span>
                          <Package size={13} />
                          Saved item
                        </span>
                      </div>

                      <div className="wishlistMainCardActions">
                        <button
                          className="wishlistMainAddButton"
                          onClick={() => addToCart(product)}
                        >
                          <ShoppingCart size={16} />
                          Add to Cart
                        </button>

                        <button
                          className="wishlistMainMoveButton"
                          onClick={() => moveToCart(product)}
                          title="Move to cart"
                          aria-label="Move to cart"
                        >
                          <ArrowRight size={18} />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="wishlistMainNoResults">
              <Search size={38} />
              <h3>No matching products found</h3>
              <p>Try another product name or category.</p>

              <button onClick={() => setSearchTerm("")}>
                Clear Search
              </button>
            </div>
          )}

          {/* BOTTOM */}
          <div className="wishlistMainBottom">
            <button
              className="wishlistMainContinueButton"
              onClick={handleContinueShopping}
            >
              <ArrowLeft size={17} />
              Go to Products
            </button>

            <span>
              <Heart size={14} fill="currentColor" />
              Made for your favorites
            </span>
          </div>
        </>
      )}

      {/* CLEAR MODAL */}
      {showClearModal && (
        <div
          className="wishlistMainModalOverlay"
          onClick={() => setShowClearModal(false)}
        >
          <div
            className="wishlistMainModal"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="wishlistMainModalClose"
              onClick={() => setShowClearModal(false)}
              aria-label="Close modal"
            >
              <X size={20} />
            </button>

            <div className="wishlistMainModalIcon">
              <Trash2 size={29} />
            </div>

            <h3>Clear Your Wishlist?</h3>

            <p>
              Are you sure you want to remove all saved
              products? This action cannot be undone.
            </p>

            <div className="wishlistMainModalActions">
              <button
                className="wishlistMainModalCancel"
                onClick={() => setShowClearModal(false)}
              >
                Keep Products
              </button>

              <button
                className="wishlistMainModalConfirm"
                onClick={clearWishlist}
              >
                <Check size={16} />
                Clear Wishlist
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div className="wishlistMainToast">
          <Check size={18} />
          <span>{toast}</span>
        </div>
      )}

    </section>
  );
};

export default WishlistMain;
