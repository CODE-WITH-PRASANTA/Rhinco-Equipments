
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiGrid,
  FiList,
  FiSearch,
  FiFilter,
  FiChevronDown,
  FiMoreVertical,
  FiEye,
  FiEdit2,
  FiTrash2,
  FiCalendar,
  FiPlus,
  FiArrowUpRight,
  FiCheckCircle,
  FiX,
  FiImage,
  FiPackage,
  FiDollarSign,
  FiTrendingUp,
  FiBox,
  FiTag,
  FiStar,
  FiRotateCcw,
} from "react-icons/fi";
import "./ManageProduct.css";
import { API_ENDPOINTS, resolveImageUrl } from "../../config/api";

const PRODUCTS_API = API_ENDPOINTS.PRODUCTS;

const getProductId = (p) => p?._id || p?.id;

const getProductImage = (product) => {
  const images = product?.images || product?.otherImages || [];
  const firstImage = images[0] || product?.image;

  if (!firstImage) return "";

  const raw = typeof firstImage === "string" ? firstImage : firstImage.data || firstImage.preview || firstImage.url || "";
  return resolveImageUrl(raw);
};

const getProductDescription = (product) =>
  (product.description || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 145);

const formatCurrency = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`;

const formatDate = (date) => {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const ManageProduct = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [stockFilter, setStockFilter] = useState("All Stock");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [openMenu, setOpenMenu] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [notice, setNotice] = useState("");

  const itemsPerPage = 6;

  // LOAD REAL PRODUCTS FROM DATABASE
  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(PRODUCTS_API);
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.data)) {
        setProducts(data.data);
      }
    } catch (err) {
      console.error("Error loading products from database:", err);
      setNotice("Could not connect to database. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // CLOSE DROPDOWN MENU WHEN CLICKING OUTSIDE
  useEffect(() => {
    if (!openMenu) return;

    const handlePointerDown = (e) => {
      if (e.target && e.target.closest && e.target.closest(".ManageProduct-cardMenu")) {
        return;
      }
      setOpenMenu(null);
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [openMenu]);

  const availableCategories = useMemo(
    () => [
      "All Categories",
      ...new Set(products.map((product) => product.category).filter(Boolean)),
    ],
    [products]
  );

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products
      .filter((product) => {
        const matchesSearch =
          !query ||
          (product.title || product.name || "").toLowerCase().includes(query) ||
          (product.code || "").toLowerCase().includes(query) ||
          (product.category || "").toLowerCase().includes(query) ||
          (product.companyName || "").toLowerCase().includes(query);

        const matchesCategory =
          categoryFilter === "All Categories" ||
          product.category === categoryFilter;

        const quantity = Number(product.stockQuantity) || 0;

        const matchesStock =
          stockFilter === "All Stock" ||
          (stockFilter === "In Stock" && quantity > 5) ||
          (stockFilter === "Low Stock" && quantity > 0 && quantity <= 5) ||
          (stockFilter === "Out of Stock" && quantity === 0);

        return matchesSearch && matchesCategory && matchesStock;
      })
      .sort((a, b) => {
        if (sortBy === "oldest") {
          return new Date(a.createdAt) - new Date(b.createdAt);
        }

        if (sortBy === "title") {
          return (a.title || a.name || "").localeCompare(b.title || b.name || "");
        }

        if (sortBy === "priceLow") {
          return Number(a.finalPrice || a.price) - Number(b.finalPrice || b.price);
        }

        if (sortBy === "priceHigh") {
          return Number(b.finalPrice || b.price) - Number(a.finalPrice || a.price);
        }

        return new Date(b.createdAt) - new Date(a.createdAt);
      });
  }, [products, search, categoryFilter, stockFilter, sortBy]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / itemsPerPage)
  );

  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * itemsPerPage;

  const visibleProducts = filteredProducts.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const totalValue = products.reduce(
    (sum, product) =>
      sum +
      Number(product.finalPrice || product.price || 0) *
        Number(product.stockQuantity || 0),
    0
  );

  const totalStock = products.reduce(
    (sum, product) => sum + Number(product.stockQuantity || 0),
    0
  );

  const lowStockCount = products.filter(
    (product) =>
      Number(product.stockQuantity) > 0 &&
      Number(product.stockQuantity) <= 5
  ).length;

  const bestSellerCount = products.filter(
    (product) => product.bestSeller
  ).length;

  const changeFilter = (setter, value) => {
    setter(value);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setCategoryFilter("All Categories");
    setStockFilter("All Stock");
    setSortBy("newest");
    setCurrentPage(1);
  };

  const showNotice = (message) => {
    setNotice(message);
    setOpenMenu(null);
  };

  const handleCreate = () => {
    setOpenMenu(null);
    navigate("/products/add");
  };

  const handleEdit = (product) => {
    setOpenMenu(null);
    setSelectedProduct(null);

    const prodId = getProductId(product);
    navigate(prodId ? `/products/add?edit=${prodId}` : "/products/add", {
      state: {
        product,
        isEditing: true,
      },
    });
  };

  const handleDelete = async () => {
    if (deleteId === null) return;

    try {
      const res = await fetch(`${PRODUCTS_API}/${deleteId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to delete product.");
      }

      showNotice("Product deleted successfully from database.");

      if (
        selectedProduct &&
        getProductId(selectedProduct) === deleteId
      ) {
        setSelectedProduct(null);
      }

      await loadProducts();
    } catch (err) {
      console.error("Delete error:", err);
      showNotice(err.message || "Could not delete product.");
    } finally {
      setDeleteId(null);
    }
  };

  const renderStock = (quantity) => {
    const stock = Number(quantity) || 0;

    let className = "ManageProduct-stock ManageProduct-stock--available";
    let label = `${stock} Units`;

    if (stock === 0) {
      className = "ManageProduct-stock ManageProduct-stock--out";
      label = "Out of Stock";
    } else if (stock <= 5) {
      className = "ManageProduct-stock ManageProduct-stock--low";
      label = `${stock} Units Left`;
    }

    return <span className={className}>{label}</span>;
  };

  const renderActions = (product) => {
    const pId = getProductId(product);

    return (
      <div className="ManageProduct-cardMenu" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="ManageProduct-menuTrigger"
          onClick={(e) => {
            e.stopPropagation();
            setOpenMenu(openMenu === pId ? null : pId);
          }}
          aria-label={`Actions for ${product.title || product.name}`}
          aria-expanded={openMenu === pId}
        >
          <FiMoreVertical />
        </button>

        {openMenu === pId && (
          <div
            className="ManageProduct-menuDropdown"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedProduct(product);
                setOpenMenu(null);
              }}
            >
              <FiEye />
              View details
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(product);
              }}
            >
              <FiEdit2 />
              Edit product
            </button>

            <button
              type="button"
              className="ManageProduct-menuDelete"
              onClick={(e) => {
                e.stopPropagation();
                setDeleteId(pId);
                setOpenMenu(null);
              }}
            >
              <FiTrash2 />
              Delete product
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="ManageProduct">
      {/* HEADER */}
      <div className="ManageProduct-header">
        <div className="ManageProduct-heading">
          <span className="ManageProduct-headingIcon">
            <FiPackage />
          </span>

          <div>
            <span className="ManageProduct-eyebrow">
              RHINO'S EQUIPMENT
            </span>
            <h1>Product Management</h1>
            <p>
              Manage your machinery catalogue, product details and inventory.
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button
            type="button"
            className="ManageProduct-createButton"
            style={{ background: "#ffffff", color: "#1c2c20", border: "1px solid #d0d7de" }}
            onClick={loadProducts}
            title="Refresh from MongoDB"
          >
            <FiRotateCcw className={loading ? "spin" : ""} /> Sync
          </button>
          <button
            type="button"
            className="ManageProduct-createButton"
            onClick={handleCreate}
          >
            <FiPlus />
            Add New Product
          </button>
        </div>
      </div>

      {/* NOTIFICATION */}
      {notice && (
        <div className="ManageProduct-notice" role="status">
          <FiCheckCircle />
          <span>{notice}</span>
          <button
            type="button"
            aria-label="Dismiss notification"
            onClick={() => setNotice("")}
          >
            <FiX />
          </button>
        </div>
      )}

      {/* STATISTICS */}
      <div className="ManageProduct-stats">
        <div className="ManageProduct-statCard">
          <span className="ManageProduct-statIcon">
            <FiPackage />
          </span>
          <div>
            <span>Total Products</span>
            <strong>{products.length}</strong>
            <small>All catalogue products</small>
          </div>
        </div>

        <div className="ManageProduct-statCard">
          <span className="ManageProduct-statIcon ManageProduct-statIcon--green">
            <FiBox />
          </span>
          <div>
            <span>Total Stock</span>
            <strong>{totalStock.toLocaleString("en-IN")}</strong>
            <small>Units available in inventory</small>
          </div>
        </div>

        <div className="ManageProduct-statCard">
          <span className="ManageProduct-statIcon ManageProduct-statIcon--amber">
            <FiTrendingUp />
          </span>
          <div>
            <span>Low Stock Items</span>
            <strong>{lowStockCount}</strong>
            <small>Products needing attention</small>
          </div>
        </div>

        <div className="ManageProduct-statCard">
          <span className="ManageProduct-statIcon ManageProduct-statIcon--blue">
            <FiDollarSign />
          </span>
          <div>
            <span>Stock Value</span>
            <strong className="ManageProduct-statValue">
              {formatCurrency(totalValue)}
            </strong>
            <small>Estimated inventory value</small>
          </div>
        </div>
      </div>

      {/* PRODUCT COLLECTION */}
      <section className="ManageProduct-panel">
        <div className="ManageProduct-panelHeader">
          <div>
            <span className="ManageProduct-sectionLabel">
              INVENTORY OVERVIEW
            </span>
            <h2>Your Product Collection</h2>
            <p>
              Browse, organize and manage all your machinery and equipment
              products.
            </p>
          </div>

          <div className="ManageProduct-viewToggle" aria-label="View mode">
            <button
              type="button"
              className={
                viewMode === "grid"
                  ? "ManageProduct-viewButton ManageProduct-viewButton--active"
                  : "ManageProduct-viewButton"
              }
              onClick={() => setViewMode("grid")}
              aria-label="Grid view"
              aria-pressed={viewMode === "grid"}
            >
              <FiGrid />
            </button>

            <button
              type="button"
              className={
                viewMode === "list"
                  ? "ManageProduct-viewButton ManageProduct-viewButton--active"
                  : "ManageProduct-viewButton"
              }
              onClick={() => setViewMode("list")}
              aria-label="List view"
              aria-pressed={viewMode === "list"}
            >
              <FiList />
            </button>
          </div>
        </div>

        {/* SEARCH AND FILTERS */}
        <div className="ManageProduct-toolbar">
          <label className="ManageProduct-search">
            <FiSearch />
            <input
              type="search"
              value={search}
              onChange={(event) =>
                changeFilter(setSearch, event.target.value)
              }
              placeholder="Search product, code, company..."
              aria-label="Search products"
            />

            {search && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => changeFilter(setSearch, "")}
              >
                <FiX />
              </button>
            )}
          </label>

          <label className="ManageProduct-selectWrap">
            <FiFilter />
            <select
              value={categoryFilter}
              onChange={(event) =>
                changeFilter(setCategoryFilter, event.target.value)
              }
              aria-label="Filter by category"
            >
              {availableCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <FiChevronDown className="ManageProduct-selectArrow" />
          </label>

          <label className="ManageProduct-selectWrap">
            <select
              value={stockFilter}
              onChange={(event) =>
                changeFilter(setStockFilter, event.target.value)
              }
              aria-label="Filter by stock"
            >
              <option value="All Stock">All Stock</option>
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
            <FiChevronDown className="ManageProduct-selectArrow" />
          </label>

          <label className="ManageProduct-selectWrap ManageProduct-sortSelect">
            <select
              value={sortBy}
              onChange={(event) =>
                changeFilter(setSortBy, event.target.value)
              }
              aria-label="Sort products"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title">Name A–Z</option>
              <option value="priceLow">Price: Low to High</option>
              <option value="priceHigh">Price: High to Low</option>
            </select>
            <FiChevronDown className="ManageProduct-selectArrow" />
          </label>
        </div>

        {/* RESULTS BAR */}
        <div className="ManageProduct-resultsBar">
          <p>
            Showing <strong>{filteredProducts.length}</strong> product
            {filteredProducts.length === 1 ? "" : "s"}
          </p>

          {(search ||
            categoryFilter !== "All Categories" ||
            stockFilter !== "All Stock" ||
            sortBy !== "newest") && (
            <button type="button" onClick={clearFilters}>
              <FiX />
              Clear filters
            </button>
          )}
        </div>

        {/* GRID VIEW */}
        {viewMode === "grid" && filteredProducts.length > 0 && (
          <div className="ManageProduct-grid">
            {visibleProducts.map((product) => {
              const pId = getProductId(product);
              return (
                <article
                  className={`ManageProduct-card ${openMenu === pId ? "ManageProduct-card--activeMenu" : ""}`}
                  key={pId}
                >
                <div className="ManageProduct-cardImage">
                  {getProductImage(product) ? (
                    <img
                      src={getProductImage(product)}
                      alt={product.title || product.name}
                      loading="lazy"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="ManageProduct-noImage">
                      <FiImage />
                    </div>
                  )}

                  <span className="ManageProduct-productCode">
                    {product.code || `RHE-${String(getProductId(product)).slice(-4)}`}
                  </span>

                  {product.bestSeller && (
                    <span className="ManageProduct-bestSellerBadge">
                      <FiStar /> Best Seller
                    </span>
                  )}

                  {renderActions(product)}
                </div>

                <div className="ManageProduct-cardBody">
                  <span className="ManageProduct-category">
                    {product.category || "Uncategorized"}
                  </span>

                  <h3>{product.title || product.name}</h3>

                  <p className="ManageProduct-excerpt">
                    {getProductDescription(product) ||
                      "No product description available."}
                  </p>

                  <div className="ManageProduct-cardCompany">
                    <FiTag />
                    <span>{product.companyName || "Rhino's Equipment"}</span>
                  </div>

                  <div className="ManageProduct-priceRow">
                    <div>
                      <strong>{formatCurrency(product.finalPrice || product.price)}</strong>
                      {Number(product.discount) > 0 && (
                        <del>{formatCurrency(product.price || product.oldPrice)}</del>
                      )}
                    </div>

                    {Number(product.discount) > 0 && (
                      <span className="ManageProduct-discount">
                        {product.discount}% OFF
                      </span>
                    )}
                  </div>

                  <div className="ManageProduct-cardFooter">
                    <div className="ManageProduct-cardMeta">
                      {renderStock(product.stockQuantity)}
                    </div>

                    <button
                      type="button"
                      className="ManageProduct-viewLink"
                      onClick={() => setSelectedProduct(product)}
                    >
                      View <FiArrowUpRight />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
          </div>
        )}

        {/* LIST VIEW */}
        {viewMode === "list" && filteredProducts.length > 0 && (
          <div className="ManageProduct-listWrap">
            <table className="ManageProduct-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Company</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Best Seller</th>
                  <th>Date Added</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {visibleProducts.map((product) => (
                  <tr key={getProductId(product)}>
                    <td>
                      <div className="ManageProduct-listProduct">
                        {getProductImage(product) ? (
                          <img
                            src={getProductImage(product)}
                            alt={product.title || product.name}
                            loading="lazy"
                          />
                        ) : (
                          <div className="ManageProduct-noImage">
                            <FiImage />
                          </div>
                        )}

                        <div>
                          <strong>{product.title || product.name}</strong>
                          <span>{product.code || `RHE-${String(getProductId(product)).slice(-4)}`}</span>
                          <small>{getProductDescription(product)}</small>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="ManageProduct-category">
                        {product.category}
                      </span>
                    </td>

                    <td>{product.companyName || "—"}</td>

                    <td>
                      <div className="ManageProduct-listPrice">
                        <strong>{formatCurrency(product.finalPrice || product.price)}</strong>
                        {Number(product.discount) > 0 && (
                          <del>{formatCurrency(product.price || product.oldPrice)}</del>
                        )}
                      </div>
                    </td>

                    <td>{renderStock(product.stockQuantity)}</td>

                    <td>
                      {product.bestSeller ? (
                        <span className="ManageProduct-featured">
                          <FiStar /> Yes
                        </span>
                      ) : (
                        <span className="ManageProduct-notFeatured">No</span>
                      )}
                    </td>

                    <td>{formatDate(product.createdAt)}</td>

                    <td>
                      <div className="ManageProduct-listActions">
                        <button
                          type="button"
                          title="View product"
                          aria-label={`View ${product.title || product.name}`}
                          onClick={() => setSelectedProduct(product)}
                        >
                          <FiEye />
                        </button>

                        <button
                          type="button"
                          title="Edit product"
                          aria-label={`Edit ${product.title || product.name}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(product);
                          }}
                        >
                          <FiEdit2 />
                        </button>

                        <button
                          type="button"
                          title="Delete product"
                          aria-label={`Delete ${product.title || product.name}`}
                          className="ManageProduct-listDelete"
                          onClick={() => setDeleteId(getProductId(product))}
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* EMPTY STATE */}
        {filteredProducts.length === 0 && (
          <div className="ManageProduct-empty">
            <span>
              <FiPackage />
            </span>
            <h3>No products found</h3>
            <p>
              Try changing your search or filters to find a product in your
              machinery catalogue.
            </p>
            <button type="button" onClick={clearFilters}>
              Clear all filters
            </button>
          </div>
        )}

        {/* PAGINATION */}
        {filteredProducts.length > 0 && (
          <div className="ManageProduct-pagination">
            <span>
              Showing {startIndex + 1}–
              {Math.min(startIndex + itemsPerPage, filteredProducts.length)} of{" "}
              {filteredProducts.length} products
            </span>

            <div className="ManageProduct-pageButtons">
              <button
                type="button"
                disabled={safePage === 1}
                onClick={() => setCurrentPage(safePage - 1)}
                aria-label="Previous page"
              >
                ‹
              </button>

              {Array.from(
                { length: totalPages },
                (_, index) => index + 1
              ).map((page) => (
                <button
                  type="button"
                  key={page}
                  className={
                    page === safePage
                      ? "ManageProduct-pageButton--active"
                      : ""
                  }
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                disabled={safePage === totalPages}
                onClick={() => setCurrentPage(safePage + 1)}
                aria-label="Next page"
              >
                ›
              </button>
            </div>
          </div>
        )}
      </section>

      {/* PRODUCT DETAILS MODAL */}
      {selectedProduct && (
        <div
          className="ManageProduct-modalBackdrop"
          onClick={() => setSelectedProduct(null)}
        >
          <section
            className="ManageProduct-detailModal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ManageProduct-detailTitle"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="ManageProduct-modalHeader">
              <div>
                <span className="ManageProduct-eyebrow">
                  RHINO'S EQUIPMENT
                </span>
                <h2>Product Details</h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                aria-label="Close details"
              >
                <FiX />
              </button>
            </div>

            {getProductImage(selectedProduct) && (
              <img
                className="ManageProduct-detailImage"
                src={getProductImage(selectedProduct)}
                alt={selectedProduct.title}
              />
            )}

            <div className="ManageProduct-detailBody">
              <div className="ManageProduct-detailMeta">
                <span className="ManageProduct-category">
                  {selectedProduct.category}
                </span>
                {renderStock(selectedProduct.stockQuantity)}
              </div>

              <h3 id="ManageProduct-detailTitle">
                {selectedProduct.title}
              </h3>

              <p>{selectedProduct.code}</p>

              <div className="ManageProduct-detailGrid">
                <div>
                  <span>Company</span>
                  <strong>{selectedProduct.companyName || "—"}</strong>
                </div>
                <div>
                  <span>Regular Price</span>
                  <strong>{formatCurrency(selectedProduct.price)}</strong>
                </div>
                <div>
                  <span>Discount</span>
                  <strong>{selectedProduct.discount || 0}%</strong>
                </div>
                <div>
                  <span>Final Price</span>
                  <strong>{formatCurrency(selectedProduct.finalPrice)}</strong>
                </div>
                <div>
                  <span>Stock Quantity</span>
                  <strong>{selectedProduct.stockQuantity} Units</strong>
                </div>
                <div>
                  <span>Added On</span>
                  <strong>{formatDate(selectedProduct.createdAt)}</strong>
                </div>
              </div>

              <div className="ManageProduct-detailDescription">
                <h4>Product Description</h4>
                <p>
                  {getProductDescription(selectedProduct) ||
                    "No product description available."}
                </p>
              </div>

              {selectedProduct.bestSeller && (
                <span className="ManageProduct-featured">
                  <FiStar /> Best Seller Product
                </span>
              )}
            </div>

            <div className="ManageProduct-modalFooter">
              <button
                type="button"
                className="ManageProduct-modalSecondary"
                onClick={() => setSelectedProduct(null)}
              >
                Close
              </button>

              <button
                type="button"
                className="ManageProduct-modalEdit"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(selectedProduct);
                }}
              >
                <FiEdit2 />
                Edit Product
              </button>
            </div>
          </section>
        </div>
      )}

      {/* DELETE CONFIRMATION */}
      {deleteId !== null && (
        <div
          className="ManageProduct-modalBackdrop"
          onClick={() => setDeleteId(null)}
        >
          <section
            className="ManageProduct-confirmModal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ManageProduct-deleteTitle"
            onClick={(event) => event.stopPropagation()}
          >
            <span className="ManageProduct-deleteIcon">
              <FiTrash2 />
            </span>

            <h2 id="ManageProduct-deleteTitle">Delete product?</h2>

            <p>
              This product will be removed from your local product collection.
              This action cannot be undone.
            </p>

            <div className="ManageProduct-confirmActions">
              <button
                type="button"
                className="ManageProduct-modalSecondary"
                onClick={() => setDeleteId(null)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="ManageProduct-confirmDelete"
                onClick={handleDelete}
              >
                <FiTrash2 />
                Delete Product
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default ManageProduct;
