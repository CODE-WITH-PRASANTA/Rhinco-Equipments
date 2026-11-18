
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
import { useWishlist, useCart, getProductId } from "../../context/CartWishlistContext";
import { resolveImageUrl } from "../../utils/helpers";

const formatPrice = (price) =>
  Number(price || 0).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  });

const getImageUrl = (image, item) => {
  const raw =
    image ||
    (item &&
      ((Array.isArray(item.images) && item.images[0]) ||
        item.featuredImage?.data ||
        (Array.isArray(item.machineImages) && item.machineImages[0]) ||
        item.img)) ||
    "";
  return resolveImageUrl(raw, "/placeholder.png");
};

const WishlistMain = () => {
  const navigate = useNavigate();

  // Pure React Context state (Zero localStorage)
  const {
    wishlistItems,
    removeFromWishlist: contextRemoveFromWishlist,
    clearWishlist: contextClearWishlist,
  } = useWishlist();
  const { addToCart: contextAddToCart } = useCart();

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [showClearModal, setShowClearModal] = useState(false);
  const [toast, setToast] = useState("");

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
    contextRemoveFromWishlist(id);
    showToast("Product removed from wishlist");
  };

  // Clear wishlist
  const clearWishlist = () => {
    contextClearWishlist();
    setShowClearModal(false);
    showToast("Your wishlist has been cleared");
  };

  // Add product to cart
  const addToCart = (product) => {
    contextAddToCart(product, 1);
    showToast("Product added to cart");
  };

  // Move to cart and remove from wishlist
  const moveToCart = (product) => {
    contextAddToCart(product, 1);
    const pId = getProductId(product);
    contextRemoveFromWishlist(pId);
    showToast("Moved product to cart");
  };

  // Add all products to cart
  const addAllToCart = () => {
    if (!wishlistItems.length) return;
    wishlistItems.forEach((product) => {
      contextAddToCart(product, 1);
    });
    contextClearWishlist();
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
                        src={getImageUrl(product.image, product)}
                        alt={product.name}
                        loading="lazy"
                        onError={(event) => {
                          event.currentTarget.src = "/placeholder.png";
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
