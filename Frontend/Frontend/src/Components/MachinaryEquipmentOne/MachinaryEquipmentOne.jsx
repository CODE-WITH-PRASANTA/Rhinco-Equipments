import React, { useMemo, useState } from "react";
import "./MachinaryEquipmentOne.css";

const machineryData = [
  {
    id: 1,
    name: "Fieldking Gold Rotary Tiller",
    brand: "Fieldking",
    power: "40-70 HP",
    category: "Tillage",
    type: "Rotavator",
    price: "₹ 1.15 - 1.55 Lakh*",
    image:
      "https://kubota.com.mm/en/products/implements/rx220g/images/img_hero.png",
    sponsored: true,
  },
  {
    id: 2,
    name: "Shaktiman Regular Plus Series",
    brand: "Shaktiman",
    power: "30-75 HP",
    category: "Tillage",
    type: "Rotavator",
    price: "₹ 93000 - 1.21 Lakh*",
    image:
      "https://image.makewebeasy.net/makeweb/m_1920x0/vwSRPSHKb/ROTARYTILLER/RT_F160SS_002.png?v=202405291424",
  },
  {
    id: 3,
    name: "Punni Paddy Multi Thresher 4603",
    brand: "Punni",
    power: "40 HP",
    category: "Post Harvest",
    type: "Thresher",
    price: null,
    image:
      "https://cpimg.tistatic.com/5519198/b/4/power-tiller-operated-paddy-thresher-machine.jpg",
  },
  {
    id: 4,
    name: "Sonalika Prima Rotary Tiller",
    brand: "Sonalika",
    power: "N/A",
    category: "Tillage",
    type: "Rotavator",
    price: null,
    image:
      "https://acimotors-bd.com/assets/images/product/power-tiller/r-28.jpg",
  },
  {
    id: 5,
    name: "Mahindra Supervator",
    brand: "Mahindra",
    power: "45-60 HP",
    category: "Tillage",
    type: "Rotavator",
    price: null,
    image:
      "https://lemken.com/fileadmin/_processed_/4/3/csm_Kyanite-75_1133fb8858.jpg",
  },
  {
    id: 6,
    name: "Shaktiman Semi Champion Series",
    brand: "Shaktiman",
    power: "40-90 HP",
    category: "Tillage",
    type: "Rotavator",
    price: "₹ 1.05 - 1.28 Lakh*",
    image:
      "https://image.makewebeasy.net/makeweb/m_1920x0/vwSRPSHKb/ROTARYTILLER/RT_F160SS_002.png?v=202405291424",
  },
  {
    id: 7,
    name: "KSA Paddy Straw Chopper",
    brand: "KSA",
    power: "35-60 HP",
    category: "Crop Protection",
    type: "Straw Chopper",
    price: "₹ 1.25 - 1.60 Lakh*",
    image:
      "https://d91ztqmtx7u1k.cloudfront.net/ClientContent/Images/Catalogue/56-inch-ksa-paddy-straw-choppe-20240916134212791.jpg",
  },
  {
    id: 8,
    name: "BEW Super Seeder 4-in-1",
    brand: "BEW",
    power: "50-75 HP",
    category: "Seeding And Planting",
    type: "Seeder",
    price: "₹ 2.10 - 2.80 Lakh*",
    image:
      "https://www.bewindia.co/storage/2023/09/Super-Seeder-4-in-1-.jpg",
  },
];

const filterGroups = [
  {
    title: "Brands",
    key: "brand",
    items: [
      ["Fieldking", 100],
      ["Maschio Gaspardo", 89],
      ["Farmpower", 14],
      ["Shaktiman", 80],
      ["Sonalika", 72],
      ["Mahindra", 65],
      ["Punni", 24],
      ["KSA", 18],
      ["BEW", 12],
    ],
  },
  {
    title: "Categories",
    key: "category",
    items: [
      ["Tillage", 533],
      ["Post Harvest", 135],
      ["Seeding And Planting", 130],
      ["Crop Protection", 127],
      ["Landscaping", 71],
    ],
  },
  {
    title: "Types",
    key: "type",
    items: [
      ["Rotavator", 217],
      ["Tractor Mounted Sprayer", 86],
      ["Plough", 70],
      ["Cultivator", 66],
      ["Thresher", 52],
      ["Straw Chopper", 32],
      ["Seeder", 28],
    ],
  },
];

const MachinaryEquipmentOne = ({
  dealerPhone = "",
  dealerEmail = "",
  onContactDealer,
}) => {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    brand: [],
    category: [],
    type: [],
  });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const filteredMachinery = useMemo(() => {
    return machineryData.filter((item) => {
      const searchMatch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.brand.toLowerCase().includes(search.toLowerCase()) ||
        item.category.toLowerCase().includes(search.toLowerCase());

      const brandMatch =
        filters.brand.length === 0 || filters.brand.includes(item.brand);

      const categoryMatch =
        filters.category.length === 0 ||
        filters.category.includes(item.category);

      const typeMatch =
        filters.type.length === 0 || filters.type.includes(item.type);

      return searchMatch && brandMatch && categoryMatch && typeMatch;
    });
  }, [search, filters]);

  const toggleFilter = (key, value) => {
    setFilters((previous) => ({
      ...previous,
      [key]: previous[key].includes(value)
        ? previous[key].filter((item) => item !== value)
        : [...previous[key], value],
    }));
  };

  const clearFilters = () => {
    setFilters({ brand: [], category: [], type: [] });
    setSearch("");
  };

  const handleContactDealer = (product) => {
    if (onContactDealer) {
      onContactDealer(product);
      return;
    }

    setSelectedProduct(product);
  };

  const closeContactModal = () => setSelectedProduct(null);

  return (
    <section className="MachinaryEquipmentOne">
      <div className="MachinaryEquipmentOne-container">

        {/* MOBILE FILTER BUTTON */}
        <div className="MachinaryEquipmentOne-mobileTop">
          <button
            className="MachinaryEquipmentOne-filterToggle"
            onClick={() => setShowFilters(!showFilters)}
          >
            <span>☷</span>
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>

          <span className="MachinaryEquipmentOne-mobileCount">
            {filteredMachinery.length} Products
          </span>
        </div>

        {/* SIDEBAR */}
        <aside
          className={`MachinaryEquipmentOne-sidebar ${
            showFilters ? "MachinaryEquipmentOne-sidebarOpen" : ""
          }`}
        >
          <div className="MachinaryEquipmentOne-sidebarHeader">
            <div>
              <span className="MachinaryEquipmentOne-sidebarEyebrow">
                EXPLORE EQUIPMENT
              </span>
              <h3>Find Machinery</h3>
            </div>

            <button
              className="MachinaryEquipmentOne-clearButton"
              onClick={clearFilters}
            >
              Clear All
            </button>
          </div>

          {filterGroups.map((group) => (
            <div
              className="MachinaryEquipmentOne-filterGroup"
              key={group.key}
            >
              <div className="MachinaryEquipmentOne-filterHeading">
                <h4>{group.title}</h4>
                <span>{group.items.length}</span>
              </div>

              <div className="MachinaryEquipmentOne-filterOptions">
                {group.items.map(([label, count]) => (
                  <label
                    className="MachinaryEquipmentOne-filterOption"
                    key={label}
                  >
                    <input
                      type="checkbox"
                      checked={filters[group.key].includes(label)}
                      onChange={() => toggleFilter(group.key, label)}
                    />

                    <span className="MachinaryEquipmentOne-customCheckbox"></span>

                    <span className="MachinaryEquipmentOne-filterName">
                      {label}
                    </span>

                    <span className="MachinaryEquipmentOne-filterCount">
                      ({count})
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          <div className="MachinaryEquipmentOne-sidebarNote">
            <span className="MachinaryEquipmentOne-sidebarNoteIcon">✦</span>
            <div>
              <strong>Need help choosing?</strong>
              <p>Contact our team to find the right equipment.</p>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="MachinaryEquipmentOne-main">
          <div className="MachinaryEquipmentOne-topbar">
            <div className="MachinaryEquipmentOne-heading">
              <span className="MachinaryEquipmentOne-sectionTag">
                AGRICULTURAL EQUIPMENT
              </span>
              <h2>Tractor Implements</h2>
              <p>
                Explore reliable machinery for every stage of farming.
              </p>
            </div>

            <div className="MachinaryEquipmentOne-searchBox">
              <span className="MachinaryEquipmentOne-searchIcon">⌕</span>
              <input
                type="text"
                placeholder="Search machinery..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  className="MachinaryEquipmentOne-searchClear"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          <div className="MachinaryEquipmentOne-resultsBar">
            <div>
              Showing{" "}
              <strong>{filteredMachinery.length}</strong> machinery products
            </div>

            <div className="MachinaryEquipmentOne-resultsRight">
              <span className="MachinaryEquipmentOne-resultsDot"></span>
              Quality agricultural equipment
            </div>
          </div>

          {/* PRODUCT GRID */}
          {filteredMachinery.length > 0 ? (
            <div className="MachinaryEquipmentOne-grid">
              {filteredMachinery.map((item) => (
                <article
                  className="MachinaryEquipmentOne-card"
                  key={item.id}
                >
                  <div className="MachinaryEquipmentOne-imageArea">
                    {item.sponsored && (
                      <span className="MachinaryEquipmentOne-sponsored">
                        ★ Sponsored
                      </span>
                    )}

                    <img
                      src={item.image}
                      alt={item.name}
                      className="MachinaryEquipmentOne-productImage"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://placehold.co/600x400/f2f5f1/315b42?text=Machinery+Image";
                      }}
                    />

                    <span className="MachinaryEquipmentOne-imageLabel">
                      {item.brand}
                    </span>
                  </div>

                  <div className="MachinaryEquipmentOne-cardContent">
                    <h3 className="MachinaryEquipmentOne-productName">
                      {item.name}
                    </h3>

                    <div className="MachinaryEquipmentOne-specifications">
                      <div className="MachinaryEquipmentOne-specItem">
                        <span>Power</span>
                        <strong>{item.power}</strong>
                      </div>

                      <div className="MachinaryEquipmentOne-specDivider"></div>

                      <div className="MachinaryEquipmentOne-specItem">
                        <span>Category</span>
                        <strong>{item.category}</strong>
                      </div>
                    </div>

                    <div className="MachinaryEquipmentOne-priceArea">
                      {item.price ? (
                        <span className="MachinaryEquipmentOne-price">
                          {item.price}
                        </span>
                      ) : (
                        <div className="MachinaryEquipmentOne-priceInquiry">
                          <span>For Price</span>
                          <button
                            onClick={() => handleContactDealer(item)}
                          >
                            Click Here
                          </button>
                        </div>
                      )}
                    </div>

                    <button
                      className="MachinaryEquipmentOne-contactButton"
                      onClick={() => handleContactDealer(item)}
                    >
                      Contact Dealer
                      <span>↗</span>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="MachinaryEquipmentOne-emptyState">
              <div className="MachinaryEquipmentOne-emptyIcon">⌕</div>
              <h3>No machinery found</h3>
              <p>
                Try another search or remove some filters to see more products.
              </p>
              <button onClick={clearFilters}>Clear Filters</button>
            </div>
          )}
        </main>
      </div>

      {/* CONTACT DEALER MODAL */}
      {selectedProduct && (
        <div
          className="MachinaryEquipmentOne-modalOverlay"
          onClick={closeContactModal}
        >
          <div
            className="MachinaryEquipmentOne-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="MachinaryEquipmentOne-modalClose"
              onClick={closeContactModal}
              aria-label="Close"
            >
              ×
            </button>

            <div className="MachinaryEquipmentOne-modalIcon">✦</div>

            <span className="MachinaryEquipmentOne-modalEyebrow">
              DEALER ENQUIRY
            </span>

            <h3>Interested in this machinery?</h3>
            <p className="MachinaryEquipmentOne-modalProduct">
              {selectedProduct.name}
            </p>

            <p className="MachinaryEquipmentOne-modalDescription">
              Contact our dealer to get product details, availability and
              pricing information.
            </p>

            <div className="MachinaryEquipmentOne-modalActions">
              {dealerPhone && (
                <a href={`tel:${dealerPhone}`}>
                  Call Dealer
                </a>
              )}

              {dealerEmail && (
                <a
                  href={`mailto:${dealerEmail}?subject=${encodeURIComponent(
                    `Enquiry about ${selectedProduct.name}`
                  )}&body=${encodeURIComponent(
                    `Hello, I am interested in ${selectedProduct.name}. Please share more details.`
                  )}`}
                >
                  Email Dealer
                </a>
              )}

              {!dealerPhone && !dealerEmail && (
                <p className="MachinaryEquipmentOne-noContact">
                  Please configure dealerPhone or dealerEmail to enable direct
                  contact.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default MachinaryEquipmentOne;