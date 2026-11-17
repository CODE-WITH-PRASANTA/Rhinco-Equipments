import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronRight,
  X,
  Sparkles,
  Check,
} from "lucide-react";

import "./BrowsbyCategory.css";
import { resolveImageUrl } from "../../utils/helpers";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const CATEGORIES_API = `${API_URL}/categories`;

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=500&q=80";

// Wikimedia Commons helper for high-quality implement visuals
const commonsImage = (filename) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(
    filename
  )}?width=500`;

// Rich subcategories mapping for implements when database item doesn't specify explicit subcategories
const SUBCATEGORY_DEFAULTS = {
  tractor: [
    { name: "Mini Tractor", image: commonsImage("A tractor.jpg") },
    { name: "Utility Tractor", image: commonsImage("John Deere 8320.jpg") },
    { name: "4WD Tractor", image: commonsImage("Mc Cormick-by-RaBoe-07.jpg") },
    { name: "Farm Tractor", image: commonsImage("Photo A working machine tractor 1963 - Touring Club Italiano 2 6042.jpg") },
  ],
  "power-tiller": [
    { name: "Diesel Power Tiller", image: commonsImage("Agricultural tiller at Feeringbury Manor, Feering Essex England 2.jpg") },
    { name: "Petrol Power Tiller", image: commonsImage("Maly neseny prekopavac.jpg") },
    { name: "Mini Power Tiller", image: commonsImage("Samojizdny mostovy prekopavac.jpg") },
  ],
  weeder: [
    { name: "Electric Weeder", image: commonsImage("Agricultural Equipment (1).jpg") },
    { name: "Back Rotary Weeder", image: commonsImage("Maly neseny prekopavac.jpg") },
    { name: "Front Rotary Weeder", image: commonsImage("Agricultural Equipment (2).jpg") },
    { name: "Weeder", image: commonsImage("Agricultural Equipment (3).jpg") },
  ],
  transplanter: [
    { name: "Rice Transplanter", image: commonsImage("Rotor poplar and willow cuttings planter, planting a new nursery of poplar for biomass with short rotation..JPG") },
    { name: "Vegetable Transplanter", image: commonsImage("Agricultural Equipment (4).jpg") },
    { name: "Manual Transplanter", image: commonsImage("Agricultural Equipment (3).jpg") },
  ],
  reaper: [
    { name: "Self Propelled Reaper", image: commonsImage("Ridley's reapers at work.jpg") },
    { name: "Tractor Mounted Reaper", image: commonsImage("Carrot Digger on a tractor.jpg") },
    { name: "Mini Reaper", image: commonsImage("A Twenty-Four Horse Power Harvester (NBY 9002).jpg") },
  ],
  harvester: [
    { name: "Combine Harvester", image: commonsImage("Agriculture Machinery Harvester.jpg") },
    { name: "Mini Harvester", image: commonsImage("A Twenty-Four Horse Power Harvester (NBY 9002).jpg") },
    { name: "Paddy Harvester", image: commonsImage("Maehdrescher1 hg.jpg") },
  ],
  rotavator: [
    { name: "Mini Rotavator", image: commonsImage("Maly neseny prekopavac.jpg") },
    { name: "Heavy Duty Rotavator", image: commonsImage("Agricultural tiller at Feeringbury Manor, Feering Essex England 2.jpg") },
    { name: "Tractor Rotavator", image: commonsImage("Agricultural Equipment (2).jpg") },
  ],
  thresher: [
    { name: "Multi Crop Thresher", image: commonsImage("Somewhere in Bihar 06 threshing (32126379105).jpg") },
    { name: "Wheat Thresher", image: commonsImage("Somewhere in Bihar 07 threshing (31285110604).jpg") },
    { name: "Paddy Thresher", image: commonsImage("Threshing machines.jpg") },
  ],
  pumpset: [
    { name: "Diesel Pump Set", image: commonsImage("Agricultural irrigation pump set with borewell, Vrindavan, Uttar Pradesh, India.jpg") },
    { name: "Electric Pump Set", image: commonsImage("Agricultural irrigation pump set with borewell, Vrindavan, Uttar Pradesh, India 02.jpg") },
    { name: "Portable Pump", image: commonsImage("New pump for the well (4679681019).jpg") },
  ],
  "brush-cutter": [
    { name: "Petrol Brush Cutter", image: commonsImage("Aerosolni generator 33.jpg") },
    { name: "Electric Brush Cutter", image: commonsImage("Aerosolni generator egipat.jpg") },
    { name: "Backpack Brush Cutter", image: commonsImage("Aerosolni generator1.jpg") },
  ],
  sprayer: [
    { name: "Battery Sprayer", image: commonsImage("Atomizador agrícola.jpg") },
    { name: "Power Sprayer", image: commonsImage("Aerosolni generator egipat.jpg") },
    { name: "Knapsack Sprayer", image: commonsImage("Aerosolni generator 33.jpg") },
  ],
  "chaff-cutter": [
    { name: "Electric Chaff Cutter", image: commonsImage("Chaff cutter machine at work.jpg") },
    { name: "Manual Chaff Cutter", image: commonsImage("Січкарня у стодолі 03.jpg") },
    { name: "Heavy Duty Chaff Cutter", image: commonsImage("Food cuter machine.jpg") },
  ],
  pulverizer: [
    { name: "Mini Pulverizer", image: commonsImage("Agricultural Equipment (3).jpg") },
    { name: "Commercial Pulverizer", image: commonsImage("Agricultural Equipment (4).jpg") },
    { name: "Impact Pulverizer", image: commonsImage("Noe mobile grinder.jpg") },
  ],
  "rice-mill": [
    { name: "Mini Rice Mill", image: commonsImage("Machines agricoles 01.jpg") },
    { name: "Commercial Rice Mill", image: commonsImage("Machines agricoles 02.jpg") },
    { name: "Rice Huller", image: commonsImage("Machines agricoles 03.jpg") },
  ],
  "dal-mill": [
    { name: "Mini Dal Mill", image: commonsImage("Machines agricoles 04.jpg") },
    { name: "Commercial Dal Mill", image: commonsImage("Machines agricoles 05.jpg") },
    { name: "Automatic Dal Mill", image: commonsImage("Machines agricoles 06.jpg") },
  ],
  "oil-mill": [
    { name: "Mini Oil Mill", image: commonsImage("Machine for making mustard oil, Jaura 2.jpg") },
    { name: "Commercial Oil Mill", image: commonsImage("Machine for making mustard oil, Jaura 3.jpg") },
    { name: "Automatic Oil Mill", image: commonsImage("Machine for making mustard oil, Jaura, 2.jpg") },
  ],
  "cleaner-cum-grader": [
    { name: "Seed Cleaner", image: commonsImage("Electronic seed colour separator.jpg") },
    { name: "Grain Grader", image: commonsImage("Saatgut-Reinigungsanlage 3786.JPG") },
    { name: "Multi Crop Cleaner", image: commonsImage("Saatgut-Reinigungsanlage 3787.jpg") },
  ],
  "ragi-thresher": [
    { name: "Mini Ragi Thresher", image: commonsImage("Somewhere in Bihar 06 threshing (32126379105).jpg") },
    { name: "Power Ragi Thresher", image: commonsImage("Somewhere in Bihar 07 threshing (31285110604).jpg") },
    { name: "Multi Crop Ragi Thresher", image: commonsImage("Agriculture Machinery Harvester.jpg") },
  ],
};

const normalizeKey = (str) =>
  (str || "").toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");

const resolveSubcategories = (cat) => {
  if (Array.isArray(cat.subcategories) && cat.subcategories.length > 0) {
    return cat.subcategories.map((sub) => {
      if (typeof sub === "string") {
        return {
          name: sub,
          slug: normalizeKey(sub),
          image: cat.image || FALLBACK_IMAGE,
        };
      }
      return {
        name: sub.name || "Subcategory",
        slug: sub.slug || normalizeKey(sub.name),
        image: sub.image || cat.image || FALLBACK_IMAGE,
      };
    });
  }

  const key = normalizeKey(cat.slug || cat.name);
  const defaults = SUBCATEGORY_DEFAULTS[key];
  if (defaults && defaults.length > 0) {
    return defaults.map((item) => ({
      name: item.name,
      slug: normalizeKey(item.name),
      image: item.image || cat.image || FALLBACK_IMAGE,
    }));
  }

  return [];
};

const BrowsbyCategory = () => {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isClosing, setIsClosing] = useState(false);

  // Dynamically fetch categories from the database API
  useEffect(() => {
    let isMounted = true;

    const fetchCategories = async () => {
      try {
        setLoading(true);
        const res = await fetch(CATEGORIES_API);
        const result = await res.json();

        if (isMounted && res.ok && result.success && Array.isArray(result.data)) {
          // Filter out Inactive categories if marked as such
          const activeCategories = result.data.filter(
            (c) => c.status !== "Inactive"
          );
          setCategories(activeCategories);
        }
      } catch (err) {
        console.error("Error loading categories from database:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  const closePopup = () => {
    if (!selectedCategory || isClosing) return;

    setIsClosing(true);

    window.setTimeout(() => {
      setSelectedCategory(null);
      setIsClosing(false);
    }, 250);
  };

  useEffect(() => {
    if (!selectedCategory) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") closePopup();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [selectedCategory, isClosing]);

  const openCategory = (category) => {
    const subcategories = resolveSubcategories(category);

    // If category has no subcategories, navigate directly to that category
    if (!subcategories || subcategories.length === 0) {
      goToCategory(category);
      return;
    }

    setIsClosing(false);
    setSelectedCategory({
      ...category,
      subcategories,
    });
  };

  const goToCategory = (category, subcategory = null) => {
    closePopup();

    const categoryParam = encodeURIComponent(category.name);

    if (subcategory) {
      const subcategoryParam = encodeURIComponent(subcategory.name);
      navigate(
        `/machinery?category=${categoryParam}&subcategory=${subcategoryParam}`
      );
      return;
    }

    navigate(`/machinery?category=${categoryParam}`);
  };

  return (
    <section className="BrowsbyCategory">
      <div className="BrowsbyCategory-container">

        <div className="BrowsbyCategory-header">
          <div className="BrowsbyCategory-heading-group">
            <h2 className="BrowsbyCategory-title">
              Browse by Category
            </h2>

            <p className="BrowsbyCategory-subtitle">
              Find the right implement for your farm
            </p>
          </div>

          <button
            type="button"
            className="BrowsbyCategory-all-button"
            onClick={() => navigate("/machinery")}
          >
            All Categories
            <ChevronRight size={19} />
          </button>
        </div>

        <div className="BrowsbyCategory-grid">
          {loading ? (
            Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className="BrowsbyCategory-card BrowsbyCategory-card-skeleton"
              >
                <div className="BrowsbyCategory-image-wrap BrowsbyCategory-skeleton-shimmer" />
                <span className="BrowsbyCategory-skeleton-line" />
              </div>
            ))
          ) : categories.length === 0 ? (
            <p className="BrowsbyCategory-empty">
              No categories available at the moment.
            </p>
          ) : (
            categories.map((category) => {
              const catKey = category._id || category.slug || category.name;
              const catImage = resolveImageUrl(category.image, FALLBACK_IMAGE);

              return (
                <button
                  type="button"
                  key={catKey}
                  className="BrowsbyCategory-card"
                  onClick={() => openCategory(category)}
                  aria-label={`View ${category.name} subcategories`}
                >
                  <div className="BrowsbyCategory-image-wrap">
                    <img
                      src={catImage}
                      alt={category.name}
                      className="BrowsbyCategory-image"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = FALLBACK_IMAGE;
                      }}
                    />
                  </div>

                  <span className="BrowsbyCategory-card-name">
                    {category.name}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>

      {selectedCategory && (
        <div
          className={`BrowsbyCategory-modal-overlay ${
            isClosing ? "is-closing" : ""
          }`}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closePopup();
          }}
        >
          <div
            className={`BrowsbyCategory-modal ${
              isClosing ? "is-closing" : ""
            }`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="BrowsbyCategory-modal-title"
          >
            <div className="BrowsbyCategory-modal-header">
              <div>
                <div className="BrowsbyCategory-modal-title-row">
                  <h3
                    className="BrowsbyCategory-modal-title"
                    id="BrowsbyCategory-modal-title"
                  >
                    Select Subcategory
                  </h3>

                  <span className="BrowsbyCategory-count">
                    {selectedCategory.subcategories ? selectedCategory.subcategories.length : 0}
                  </span>
                </div>

                <p className="BrowsbyCategory-modal-subtitle">
                  Choose a type of {selectedCategory.name}
                </p>
              </div>

              <button
                type="button"
                className="BrowsbyCategory-close"
                onClick={closePopup}
                aria-label="Close popup"
              >
                <X size={23} />
              </button>
            </div>

            <div className="BrowsbyCategory-modal-body">
              <button
                type="button"
                className="BrowsbyCategory-all-subcategories"
                onClick={() => goToCategory(selectedCategory)}
              >
                <span className="BrowsbyCategory-all-icon">
                  <Sparkles size={22} />
                </span>

                <span className="BrowsbyCategory-all-text">
                  <strong>All Subcategories</strong>
                  <small>
                    Show every model under {selectedCategory.name}
                  </small>
                </span>

                <Check
                  className="BrowsbyCategory-all-check"
                  size={21}
                />
              </button>

              <div className="BrowsbyCategory-subcategory-grid">
                {(selectedCategory.subcategories || []).map((subcategory) => (
                  <button
                    type="button"
                    key={subcategory.slug || subcategory.name}
                    className="BrowsbyCategory-subcategory-card"
                    onClick={() =>
                      goToCategory(selectedCategory, subcategory)
                    }
                  >
                    <div className="BrowsbyCategory-subcategory-image-wrap">
                      <img
                        src={subcategory.image || FALLBACK_IMAGE}
                        alt={subcategory.name}
                        className="BrowsbyCategory-subcategory-image"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = FALLBACK_IMAGE;
                        }}
                      />
                    </div>

                    <span className="BrowsbyCategory-subcategory-name">
                      {subcategory.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="BrowsbyCategory-modal-footer">
              <span>
                {selectedCategory.subcategories ? selectedCategory.subcategories.length : 0} options
              </span>

              <button
                type="button"
                className="BrowsbyCategory-cancel"
                onClick={closePopup}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default BrowsbyCategory;
