
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronRight,
  X,
  Sparkles,
  Check,
} from "lucide-react";

import "./BrowsbyCategory.css";

// Wikimedia Commons direct image URLs
const commonsImage = (filename) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(
    filename
  )}?width=500`;

// Reliable fallback image
const fallbackImage = commonsImage("Agriculture Machinery Harvester.jpg");

const makeSubcategories = (items) =>
  items.map(([name, image]) => ({
    name,
    slug: name.toLowerCase().replace(/\s+/g, "-"),
    image: commonsImage(image),
  }));

const categories = [
  {
    name: "Tractor",
    slug: "tractor",
    image: commonsImage("John Deere 8320.jpg"),
    subcategories: makeSubcategories([
      ["Mini Tractor", "A tractor.jpg"],
      ["Utility Tractor", "John Deere 8320.jpg"],
      ["4WD Tractor", "Mc Cormick-by-RaBoe-07.jpg"],
      ["Farm Tractor", "Photo A working machine tractor 1963 - Touring Club Italiano 2 6042.jpg"],
    ]),
  },
  {
    name: "Power Tiller",
    slug: "power-tiller",
    image: commonsImage("Agricultural tiller at Feeringbury Manor, Feering Essex England 2.jpg"),
    subcategories: makeSubcategories([
      ["Diesel Power Tiller", "Agricultural tiller at Feeringbury Manor, Feering Essex England 2.jpg"],
      ["Petrol Power Tiller", "Maly neseny prekopavac.jpg"],
      ["Mini Power Tiller", "Samojizdny mostovy prekopavac.jpg"],
    ]),
  },
  {
    name: "Weeder",
    slug: "weeder",
    image: commonsImage("Agricultural Equipment (1).jpg"),
    subcategories: makeSubcategories([
      ["Electric Weeder", "Agricultural Equipment (1).jpg"],
      ["Back Rotary Weeder", "Maly neseny prekopavac.jpg"],
      ["Front Rotary Weeder", "Agricultural Equipment (2).jpg"],
      ["Weeder", "Agricultural Equipment (3).jpg"],
    ]),
  },
  {
    name: "Transplanter",
    slug: "transplanter",
    image: commonsImage("Rotor poplar and willow cuttings planter, planting a new nursery of poplar for biomass with short rotation..JPG"),
    subcategories: makeSubcategories([
      ["Rice Transplanter", "Rotor poplar and willow cuttings planter, planting a new nursery of poplar for biomass with short rotation..JPG"],
      ["Vegetable Transplanter", "Agricultural Equipment (4).jpg"],
      ["Manual Transplanter", "Agricultural Equipment (3).jpg"],
    ]),
  },
  {
    name: "Reaper",
    slug: "reaper",
    image: commonsImage("Ridley's reapers at work.jpg"),
    subcategories: makeSubcategories([
      ["Self Propelled Reaper", "Ridley's reapers at work.jpg"],
      ["Tractor Mounted Reaper", "Carrot Digger on a tractor.jpg"],
      ["Mini Reaper", "A Twenty-Four Horse Power Harvester (NBY 9002).jpg"],
    ]),
  },
  {
    name: "Harvester",
    slug: "harvester",
    image: commonsImage("Agriculture Machinery Harvester.jpg"),
    subcategories: makeSubcategories([
      ["Combine Harvester", "Agriculture Machinery Harvester.jpg"],
      ["Mini Harvester", "A Twenty-Four Horse Power Harvester (NBY 9002).jpg"],
      ["Paddy Harvester", "Maehdrescher1 hg.jpg"],
    ]),
  },
  {
    name: "Rotavator",
    slug: "rotavator",
    image: commonsImage("Maly neseny prekopavac.jpg"),
    subcategories: makeSubcategories([
      ["Mini Rotavator", "Maly neseny prekopavac.jpg"],
      ["Heavy Duty Rotavator", "Agricultural tiller at Feeringbury Manor, Feering Essex England 2.jpg"],
      ["Tractor Rotavator", "Agricultural Equipment (2).jpg"],
    ]),
  },
  {
    name: "Thresher",
    slug: "thresher",
    image: commonsImage("Somewhere in Bihar 06 threshing (32126379105).jpg"),
    subcategories: makeSubcategories([
      ["Multi Crop Thresher", "Somewhere in Bihar 06 threshing (32126379105).jpg"],
      ["Wheat Thresher", "Somewhere in Bihar 07 threshing (31285110604).jpg"],
      ["Paddy Thresher", "Threshing machines.jpg"],
    ]),
  },
  {
    name: "PumpSet",
    slug: "pumpset",
    image: commonsImage("Agricultural irrigation pump set with borewell, Vrindavan, Uttar Pradesh, India.jpg"),
    subcategories: makeSubcategories([
      ["Diesel Pump Set", "Agricultural irrigation pump set with borewell, Vrindavan, Uttar Pradesh, India.jpg"],
      ["Electric Pump Set", "Agricultural irrigation pump set with borewell, Vrindavan, Uttar Pradesh, India 02.jpg"],
      ["Portable Pump", "New pump for the well (4679681019).jpg"],
    ]),
  },
  {
    name: "Brush Cutter",
    slug: "brush-cutter",
    image: commonsImage("Aerosolni generator 33.jpg"),
    subcategories: makeSubcategories([
      ["Petrol Brush Cutter", "Aerosolni generator 33.jpg"],
      ["Electric Brush Cutter", "Aerosolni generator egipat.jpg"],
      ["Backpack Brush Cutter", "Aerosolni generator1.jpg"],
    ]),
  },
  {
    name: "Sprayer",
    slug: "sprayer",
    image: commonsImage("Atomizador agrícola.jpg"),
    subcategories: makeSubcategories([
      ["Battery Sprayer", "Atomizador agrícola.jpg"],
      ["Power Sprayer", "Aerosolni generator egipat.jpg"],
      ["Knapsack Sprayer", "Aerosolni generator 33.jpg"],
    ]),
  },
  {
    name: "Chaff Cutter",
    slug: "chaff-cutter",
    image: commonsImage("Chaff cutter machine at work.jpg"),
    subcategories: makeSubcategories([
      ["Electric Chaff Cutter", "Chaff cutter machine at work.jpg"],
      ["Manual Chaff Cutter", "Січкарня у стодолі 03.jpg"],
      ["Heavy Duty Chaff Cutter", "Food cuter machine.jpg"],
    ]),
  },
  {
    name: "Pulverizer",
    slug: "pulverizer",
    image: commonsImage("Agricultural Equipment (3).jpg"),
    subcategories: makeSubcategories([
      ["Mini Pulverizer", "Agricultural Equipment (3).jpg"],
      ["Commercial Pulverizer", "Agricultural Equipment (4).jpg"],
      ["Impact Pulverizer", "Noe mobile grinder.jpg"],
    ]),
  },
  {
    name: "Rice Mill",
    slug: "rice-mill",
    image: commonsImage("Machines agricoles 01.jpg"),
    subcategories: makeSubcategories([
      ["Mini Rice Mill", "Machines agricoles 01.jpg"],
      ["Commercial Rice Mill", "Machines agricoles 02.jpg"],
      ["Rice Huller", "Machines agricoles 03.jpg"],
    ]),
  },
  {
    name: "Dal Mill",
    slug: "dal-mill",
    image: commonsImage("Machines agricoles 04.jpg"),
    subcategories: makeSubcategories([
      ["Mini Dal Mill", "Machines agricoles 04.jpg"],
      ["Commercial Dal Mill", "Machines agricoles 05.jpg"],
      ["Automatic Dal Mill", "Machines agricoles 06.jpg"],
    ]),
  },
  {
    name: "Oil Mill",
    slug: "oil-mill",
    image: commonsImage("Machine for making mustard oil, Jaura 2.jpg"),
    subcategories: makeSubcategories([
      ["Mini Oil Mill", "Machine for making mustard oil, Jaura 2.jpg"],
      ["Commercial Oil Mill", "Machine for making mustard oil, Jaura 3.jpg"],
      ["Automatic Oil Mill", "Machine for making mustard oil, Jaura, 2.jpg"],
    ]),
  },
  {
    name: "Cleaner Cum Grader",
    slug: "cleaner-cum-grader",
    image: commonsImage("Electronic seed colour separator.jpg"),
    subcategories: makeSubcategories([
      ["Seed Cleaner", "Electronic seed colour separator.jpg"],
      ["Grain Grader", "Saatgut-Reinigungsanlage 3786.JPG"],
      ["Multi Crop Cleaner", "Saatgut-Reinigungsanlage 3787.jpg"],
    ]),
  },
  {
    name: "Ragi Thresher",
    slug: "ragi-thresher",
    image: commonsImage("Somewhere in Bihar 07 threshing (31285110604).jpg"),
    subcategories: makeSubcategories([
      ["Mini Ragi Thresher", "Somewhere in Bihar 06 threshing (32126379105).jpg"],
      ["Power Ragi Thresher", "Somewhere in Bihar 07 threshing (31285110604).jpg"],
      ["Multi Crop Ragi Thresher", "Agriculture Machinery Harvester.jpg"],
    ]),
  },
];

const BrowsbyCategory = () => {
  const navigate = useNavigate();

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isClosing, setIsClosing] = useState(false);

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
    setIsClosing(false);
    setSelectedCategory(category);
  };

  const goToCategory = (category, subcategory = null) => {
    const path = subcategory
      ? `/machine-catalogue/${category.slug}/${subcategory.slug}`
      : `/machine-catalogue/${category.slug}`;

    setSelectedCategory(null);
    setIsClosing(false);
    navigate(path);
  };

  // Fallback if an external image fails to load
  const handleImageError = (event) => {
    const image = event.currentTarget;

    if (image.dataset.fallbackApplied) return;

    image.dataset.fallbackApplied = "true";
    image.src = fallbackImage;
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
            onClick={() => navigate("/machine-catalogue")}
          >
            All Categories
            <ChevronRight size={19} />
          </button>
        </div>

        <div className="BrowsbyCategory-grid">
          {categories.map((category) => (
            <button
              type="button"
              key={category.slug}
              className="BrowsbyCategory-card"
              onClick={() => openCategory(category)}
              aria-label={`View ${category.name} subcategories`}
            >
              <div className="BrowsbyCategory-image-wrap">
                <img
                  src={category.image}
                  alt={category.name}
                  className="BrowsbyCategory-image"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onError={handleImageError}
                />
              </div>

              <span className="BrowsbyCategory-card-name">
                {category.name}
              </span>
            </button>
          ))}
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
                    {selectedCategory.subcategories.length}
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
                {selectedCategory.subcategories.map((subcategory) => (
                  <button
                    type="button"
                    key={subcategory.slug}
                    className="BrowsbyCategory-subcategory-card"
                    onClick={() =>
                      goToCategory(selectedCategory, subcategory)
                    }
                  >
                    <div className="BrowsbyCategory-subcategory-image-wrap">
                      <img
                        src={subcategory.image}
                        alt={subcategory.name}
                        className="BrowsbyCategory-subcategory-image"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        onError={handleImageError}
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
                {selectedCategory.subcategories.length} options
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
