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
  FiUser,
  FiPlus,
  FiArrowUpRight,
  FiCheckCircle,
  FiClock,
  FiFileText,
  FiX,
  FiImage,
  FiMapPin,
  FiTag,
  FiFolder,
  FiFile,
  FiMessageSquare,
} from "react-icons/fi";

import "./EquipmentManagement.css";

/* =========================================================
   LOCAL STORAGE CONFIGURATION
   Must match EquipmentPosting.jsx
========================================================= */

const STORAGE_KEY = "rhino_equipment_posts";

const equipmentCategories = [
  "Excavators",
  "Loaders",
  "Cranes & Lifting",
  "Road Construction",
  "Earthmoving",
  "Material Handling",
  "Generators & Compressors",
  "Attachments & Parts",
];

const statusOptions = ["Available", "Reserved", "Sold"];

const initialEquipment = [
  {
    id: 2001,
    code: "EQP-0001",
    title: "CAT 320D2 Hydraulic Excavator",
    category: "Excavators",
    postedBy: "Equipment Sales Team",
    authorName: "Equipment Sales Team",
    location: "Bhubaneswar, Odisha",
    description: `<h2>CAT 320D2 Hydraulic Excavator</h2><p>A dependable 20-ton class excavator designed for earthmoving, site preparation and general construction work. The machine offers a practical balance of digging performance, operator comfort and serviceability.</p><h3>Equipment Highlights</h3><ul><li>Powerful hydraulic digging performance</li><li>Comfortable enclosed operator cabin</li><li>Heavy-duty undercarriage</li><li>Suitable for construction and excavation projects</li></ul><p>Contact our team to arrange an inspection and discuss delivery options.</p>`,
    excerpt: "Reliable 20-ton hydraulic excavator for earthmoving, site preparation and construction projects.",
    quote: "Built to move more material with confidence and control.",
    tags: "CAT, Excavator, 20 Ton, Earthmoving, Construction",
    seoTitle: "CAT 320D2 Hydraulic Excavator | Rhino's Equipment",
    seoDescription: "Explore the CAT 320D2 hydraulic excavator available at Rhino's Equipment in Odisha.",
    featuredImage: { name: "cat-320d2-excavator.jpg", data: "https://images.unsplash.com/photo-1580901368919-7738efb0f87e?auto=format&fit=crop&w=1200&q=85" },
    otherImages: [], documents: [],
    status: "Available", enquiries: 1280,
    createdAt: "2026-11-02T10:00:00.000Z", updatedAt: "2026-11-02T10:00:00.000Z",
    manufacturer: "Caterpillar", model: "320D2", year: 2021, operatingHours: "4,250 hrs", condition: "Used - Excellent", price: "₹48,50,000",
  },
  {
    id: 2002,
    code: "EQP-0002",
    title: "JCB 3DX Backhoe Loader",
    category: "Loaders",
    postedBy: "Sales Department",
    authorName: "Sales Department",
    location: "Cuttack, Odisha",
    description: `<h2>JCB 3DX Backhoe Loader</h2><p>A versatile backhoe loader for road work, utility trenching, material loading and small-to-medium construction sites. Its front loader and rear excavator configuration make it a flexible choice for multiple applications.</p><h3>Key Features</h3><ul><li>Dual-purpose loader and excavator configuration</li><li>Suitable for road and utility projects</li><li>Operator-friendly controls</li><li>Practical machine for contractors and rental fleets</li></ul>`,
    excerpt: "Versatile backhoe loader for road construction, trenching and material handling.",
    quote: "One machine, multiple jobs, better site productivity.",
    tags: "JCB, Backhoe Loader, 3DX, Road Work",
    seoTitle: "JCB 3DX Backhoe Loader | Rhino's Equipment",
    seoDescription: "Check the JCB 3DX backhoe loader listing, condition and availability at Rhino's Equipment.",
    featuredImage: { name: "jcb-3dx.jpg", data: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=85" },
    otherImages: [], documents: [],
    status: "Available", enquiries: 965,
    createdAt: "2026-10-30T09:30:00.000Z", updatedAt: "2026-10-30T09:30:00.000Z",
    manufacturer: "JCB", model: "3DX", year: 2022, operatingHours: "2,900 hrs", condition: "Used - Very Good", price: "₹29,75,000",
  },
  {
    id: 2003,
    code: "EQP-0003",
    title: "Tata Hitachi ZAXIS 200 Excavator",
    category: "Excavators",
    postedBy: "Equipment Sales Team",
    authorName: "Equipment Sales Team",
    location: "Rourkela, Odisha",
    description: `<h2>Tata Hitachi ZAXIS 200</h2><p>A heavy-duty hydraulic excavator suited to demanding excavation, quarry support and infrastructure work. Its robust build makes it a practical option for contractors looking for dependable site equipment.</p><h3>Inspection Notes</h3><ul><li>Machine inspection can be arranged by appointment</li><li>Hydraulic and engine checks recommended before purchase</li><li>Transport assistance available on request</li></ul>`,
    excerpt: "Heavy-duty excavator suitable for infrastructure, quarry support and demanding earthmoving work.",
    quote: "Dependable equipment for demanding work sites.",
    tags: "Tata Hitachi, ZAXIS 200, Excavator, Infrastructure",
    seoTitle: "Tata Hitachi ZAXIS 200 Excavator | Rhino's Equipment",
    seoDescription: "View equipment for the Tata Hitachi ZAXIS 200 excavator listed by Rhino's Equipment.",
    featuredImage: { name: "zaxis-200.jpg", data: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=1200&q=85" },
    otherImages: [], documents: [],
    status: "Reserved", enquiries: 742,
    createdAt: "2026-10-27T11:15:00.000Z", updatedAt: "2026-11-03T08:00:00.000Z",
    manufacturer: "Tata Hitachi", model: "ZAXIS 200", year: 2020, operatingHours: "5,100 hrs", condition: "Used - Good", price: "₹39,00,000",
  },
  {
    id: 2004,
    code: "EQP-0004",
    title: "ACE 12XW Pick & Carry Crane",
    category: "Cranes & Lifting",
    postedBy: "Heavy Equipment Desk",
    authorName: "Heavy Equipment Desk",
    location: "Bhubaneswar, Odisha",
    description: `<h2>ACE 12XW Pick & Carry Crane</h2><p>A compact pick-and-carry crane for material lifting and movement within industrial yards, warehouses and construction sites. Its mobility makes it useful for short-distance lifting operations.</p><h3>Applications</h3><ul><li>Industrial material shifting</li><li>Construction-site lifting</li><li>Equipment loading and unloading</li></ul>`,
    excerpt: "Mobile pick-and-carry crane for industrial yards and construction-site lifting.",
    quote: "Move heavy loads around your site with greater flexibility.",
    tags: "ACE, Crane, Pick and Carry, Lifting",
    seoTitle: "ACE 12XW Pick & Carry Crane | Rhino's Equipment",
    seoDescription: "Explore the ACE 12XW pick and carry crane listing and enquire about availability.",
    featuredImage: { name: "ace-crane.jpg", data: "https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=1200&q=85" },
    otherImages: [], documents: [],
    status: "Available", enquiries: 610,
    createdAt: "2026-10-24T08:45:00.000Z", updatedAt: "2026-10-24T08:45:00.000Z",
    manufacturer: "ACE", model: "12XW", year: 2023, operatingHours: "1,450 hrs", condition: "Used - Excellent", price: "₹22,00,000",
  },
  {
    id: 2005,
    code: "EQP-0005",
    title: "Komatsu WA200 Wheel Loader",
    category: "Loaders",
    postedBy: "Equipment Sales Team",
    authorName: "Equipment Sales Team",
    location: "Sambalpur, Odisha",
    description: `<h2>Komatsu WA200 Wheel Loader</h2><p>A wheel loader designed for loading, stockpile management and material movement. Suitable for aggregate yards, industrial facilities and construction operations.</p><h3>Equipment Benefits</h3><ul><li>Efficient bucket loading workflow</li><li>Strong manoeuvrability around yards</li><li>Useful for aggregate and bulk material handling</li></ul>`,
    excerpt: "Wheel loader for aggregate yards, stockpile management and bulk material handling.",
    quote: "Keep material moving and your operation productive.",
    tags: "Komatsu, Wheel Loader, WA200, Material Handling",
    seoTitle: "Komatsu WA200 Wheel Loader | Rhino's Equipment",
    seoDescription: "Find details and enquire about the Komatsu WA200 wheel loader at Rhino's Equipment.",
    featuredImage: { name: "komatsu-wheel-loader.jpg", data: "https://images.unsplash.com/photo-1580901368919-7738efb0f87e?auto=format&fit=crop&w=1200&q=85" },
    otherImages: [], documents: [],
    status: "Available", enquiries: 1540,
    createdAt: "2026-10-20T10:20:00.000Z", updatedAt: "2026-10-20T10:20:00.000Z",
    manufacturer: "Komatsu", model: "WA200", year: 2019, operatingHours: "6,300 hrs", condition: "Used - Good", price: "₹31,50,000",
  },
  {
    id: 2006,
    code: "EQP-0006",
    title: "Dynapac CC1200 Tandem Roller",
    category: "Road Construction",
    postedBy: "Road Equipment Team",
    authorName: "Road Equipment Team",
    location: "Berhampur, Odisha",
    description: `<h2>Dynapac CC1200 Tandem Roller</h2><p>A compact tandem roller for asphalt compaction and finishing work on roads, parking areas and other paved surfaces.</p><h3>Suitable For</h3><ul><li>Road resurfacing projects</li><li>Parking and paved areas</li><li>Compaction work on smaller sites</li></ul>`,
    excerpt: "Compact tandem roller for asphalt compaction, road resurfacing and paved areas.",
    quote: "A consistent finish starts with reliable compaction.",
    tags: "Dynapac, Tandem Roller, Road Construction, Compaction",
    seoTitle: "Dynapac CC1200 Tandem Roller | Rhino's Equipment",
    seoDescription: "Enquire about the Dynapac CC1200 tandem roller for road construction and compaction.",
    featuredImage: { name: "dynapac-roller.jpg", data: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1200&q=85" },
    otherImages: [], documents: [],
    status: "Sold", enquiries: 520,
    createdAt: "2026-10-17T07:50:00.000Z", updatedAt: "2026-10-29T12:00:00.000Z",
    manufacturer: "Dynapac", model: "CC1200", year: 2018, operatingHours: "3,800 hrs", condition: "Used - Good", price: "₹14,25,000",
  },
  {
    id: 2007,
    code: "EQP-0007",
    title: "Kirloskar  Kirloskar 125 kVA Diesel Generator",
    category: "Generators & Compressors",
    postedBy: "Power Solutions Team",
    authorName: "Power Solutions Team",
    location: "Cuttack, Odisha",
    description: `<h2>Kirloskar 125 kVA Diesel Generator</h2><p>A diesel generator set intended for backup power at commercial sites, workshops and construction locations. Confirm electrical specifications and service history during inspection.</p><h3>Before You Enquire</h3><ul><li>Verify output rating and phase configuration</li><li>Review running hours and maintenance records</li><li>Confirm installation and delivery requirements</li></ul>`,
    excerpt: "125 kVA diesel generator set for backup power at commercial and construction sites.",
    quote: "Reliable backup power keeps essential work moving.",
    tags: "Kirloskar, Generator, 125 kVA, Power Backup",
    seoTitle: "Kirloskar 125 kVA Diesel Generator | Rhino's Equipment",
    seoDescription: "View the Kirloskar 125 kVA diesel generator listing and request equipment details.",
    featuredImage: { name: "diesel-generator.jpg", data: "https://images.unsplash.com/photo-1473341304170-971ystd?auto=format&fit=crop&w=1200&q=85" },
    otherImages: [], documents: [],
    status: "Available", enquiries: 890,
    createdAt: "2026-10-14T09:00:00.000Z", updatedAt: "2026-10-14T09:00:00.000Z",
    manufacturer: "Kirloskar", model: "125 kVA", year: 2022, operatingHours: "820 hrs", condition: "Used - Excellent", price: "₹8,75,000",
  },
  {
    id: 2008,
    code: "EQP-0008",
    title: "JCB Hydraulic Rock Breaker Attachment",
    category: "Attachments & Parts",
    postedBy: "Parts & Attachments Team",
    authorName: "Parts & Attachments Team",
    location: "Odisha, India",
    description: `<h2>Hydraulic Rock Breaker Attachment</h2><p>A hydraulic breaker attachment for compatible excavators, designed for breaking rock, concrete and other hard materials. Confirm carrier-machine compatibility before purchase.</p><h3>Compatibility Checklist</h3><ul><li>Carrier machine operating weight</li><li>Hydraulic flow and pressure requirements</li><li>Mounting bracket and pin dimensions</li></ul>`,
    excerpt: "Hydraulic breaker attachment for compatible excavators and demolition applications.",
    quote: "The right attachment expands what your machine can do.",
    tags: "Hydraulic Breaker, Attachment, Excavator, Demolition",
    seoTitle: "Hydraulic Rock Breaker Attachment | Rhino's Equipment",
    seoDescription: "Enquire about hydraulic rock breaker attachments and compatibility with your excavator.",
    featuredImage: { name: "rock-breaker.jpg", data: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=1200&q=85" },
    otherImages: [], documents: [],
    status: "Available", enquiries: 430,
    createdAt: "2026-10-10T10:00:00.000Z", updatedAt: "2026-10-10T10:00:00.000Z",
    manufacturer: "JCB Compatible", model: "Hydraulic Breaker", year: 2023, operatingHours: "New", condition: "New", price: "₹3,85,000",
  },
];

/* =========================================================
   HELPERS
========================================================= */

const getTags = (tags) => {
  if (Array.isArray(tags)) return tags;

  if (typeof tags === "string") {
    return tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  return [];
};

const getImage = (item) => {
  const image = item.featuredImage || item.mainImage || item.image;

  if (!image) return "";

  if (typeof image === "string") return image;

  return image.data || image.preview || image.url || "";
};

const getAuthor = (item) =>
  item.postedBy || item.authorName || item.author || "Admin";

const getDescription = (item) => {
  const description = item.description || item.excerpt || "";

  return description
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 150);
};

const getDate = (item) =>
  item.createdAt || item.publishDate || item.date || "";

const formatDate = (date) => {
  if (!date) return "—";

  try {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return String(date);
  }
};

const getInitialEquipment = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved !== null) {
      const parsed = JSON.parse(saved);

      if (Array.isArray(parsed)) {
        return parsed;
      }
    }

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(initialEquipment)
    );

    return initialEquipment;
  } catch (error) {
    console.error("Unable to initialize item data:", error);
    return initialEquipment;
  }
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

const EquipmentManagement = () => {
  const navigate = useNavigate();

  const [equipment, setEquipment] = useState(getInitialEquipment);

  const [viewMode, setViewMode] = useState("grid");

  const [search, setSearch] = useState("");

  const [typeFilter, setTypeFilter] =
    useState("All Equipment Types");

  const [statusFilter, setStatusFilter] =
    useState("All Status");

  const [sortBy, setSortBy] = useState("newest");

  const [currentPage, setCurrentPage] = useState(1);

  const [openMenu, setOpenMenu] = useState(null);

  const [selectedEquipment, setSelectedEquipment] = useState(null);

  const [deleteId, setDeleteId] = useState(null);

  const [notice, setNotice] = useState("");

  const itemsPerPage = 6;

  /* =====================================================
     SAVE DATA LOCALLY
  ===================================================== */

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(equipment)
      );
    } catch (error) {
      console.error("Local storage error:", error);
      setNotice(
        "Browser storage is full. Reduce the size of uploaded files."
      );
    }
  }, [equipment]);

  /* =====================================================
     CREATE EQUIPMENT
  ===================================================== */

  const handleCreate = () => {
    setOpenMenu(null);

    navigate("/equipment/equipment-posting");
  };

  /* =====================================================
     EDIT EQUIPMENT
  ===================================================== */

  const handleEdit = (item) => {
    setOpenMenu(null);
    setSelectedEquipment(null);

    navigate("/equipment/equipment-posting", {
      state: {
        equipment: item,
        isEditing: true,
      },
    });
  };

  /* =====================================================
     EQUIPMENT TYPE FILTERS
  ===================================================== */

  const availableEquipmentCategories = useMemo(
    () => [
      "All Equipment Types",
      ...new Set(
        equipment
          .map((item) => item.category)
          .filter(Boolean)
      ),
    ],
    [equipment]
  );

  /* =====================================================
     FILTER AND SORT
  ===================================================== */

  const filteredEquipment = useMemo(() => {
    const query = search.trim().toLowerCase();

    return equipment
      .filter((item) => {
        const tags = getTags(item.tags);

        const matchesSearch =
          !query ||
          (item.title || "").toLowerCase().includes(query) ||
          getAuthor(item).toLowerCase().includes(query) ||
          (item.category || "").toLowerCase().includes(query) ||
          (item.code || item.equipmentCode || "")
            .toLowerCase()
            .includes(query) ||
          (item.location || "").toLowerCase().includes(query) ||
          tags.some((tag) =>
            tag.toLowerCase().includes(query)
          );

        const matchesCategory =
          typeFilter === "All Equipment Types" ||
          item.category === typeFilter;

        const matchesStatus =
          statusFilter === "All Status" ||
          (item.status || "Available") === statusFilter;

        return (
          matchesSearch &&
          matchesCategory &&
          matchesStatus
        );
      })
      .sort((a, b) => {
        if (sortBy === "oldest") {
          return (
            new Date(getDate(a)) -
            new Date(getDate(b))
          );
        }

        if (sortBy === "title") {
          return (a.title || "").localeCompare(
            b.title || ""
          );
        }

        if (sortBy === "mostViewed") {
          return (b.enquiries || 0) - (a.enquiries || 0);
        }

        return (
          new Date(getDate(b)) -
          new Date(getDate(a))
        );
      });
  }, [
    equipment,
    search,
    typeFilter,
    statusFilter,
    sortBy,
  ]);

  /* =====================================================
     PAGINATION
  ===================================================== */

  const totalPages = Math.max(
    1,
    Math.ceil(filteredEquipment.length / itemsPerPage)
  );

  const safePage = Math.min(currentPage, totalPages);

  const startIndex = (safePage - 1) * itemsPerPage;

  const visibleEquipment = filteredEquipment.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  /* =====================================================
     STATISTICS
  ===================================================== */

  const availableCount = equipment.filter(
    (item) => item.status === "Available"
  ).length;

  const reservedCount = equipment.filter(
    (item) => item.status === "Reserved"
  ).length;

  const soldCount = equipment.filter(
    (item) => item.status === "Sold"
  ).length;

  const totalEnquiries = equipment.reduce(
    (sum, item) => sum + (Number(item.enquiries) || 0),
    0
  );

  /* =====================================================
     FILTER HANDLERS
  ===================================================== */

  const changeFilter = (setter, value) => {
    setter(value);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setTypeFilter("All Equipment Types");
    setStatusFilter("All Status");
    setSortBy("newest");
    setCurrentPage(1);
  };

  const showNotice = (message) => {
    setNotice(message);
    setOpenMenu(null);
  };

  /* =====================================================
     DELETE EQUIPMENT - LOCAL ONLY
  ===================================================== */

  const handleDelete = () => {
    if (deleteId === null) return;

    setEquipment((previous) =>
      previous.filter(
        (item) => item.id !== deleteId
      )
    );

    if (selectedEquipment?.id === deleteId) {
      setSelectedEquipment(null);
    }

    setDeleteId(null);

    showNotice("Equipment post deleted successfully.");
  };

  /* =====================================================
     CHANGE STATUS - LOCAL ONLY
  ===================================================== */

  const handleStatusChange = (item) => {
    const nextStatus = item.status === "Available" ? "Reserved" : "Available";

    setEquipment((previous) =>
      previous.map((currentItem) =>
        currentItem.id === item.id
          ? {
              ...item,
              status: nextStatus,
              updatedAt: new Date().toISOString(),
            }
          : currentItem
      )
    );

    if (selectedEquipment?.id === item.id) {
      setSelectedEquipment((previous) => ({
        ...previous,
        status: nextStatus,
      }));
    }

    showNotice(`Equipment status changed to ${nextStatus}.`);
  };

  /* =====================================================
     STATUS COMPONENT
  ===================================================== */

  const renderStatus = (status = "Available") => (
    <span
      className={`EquipmentManagement-status EquipmentManagement-status--${status.toLowerCase()}`}
    >
      <span className="EquipmentManagement-statusDot" />
      {status}
    </span>
  );

  /* =====================================================
     ACTION MENU
  ===================================================== */

  const renderActions = (item) => (
    <div className="EquipmentManagement-cardMenu">

      <button
        type="button"
        className="EquipmentManagement-menuTrigger"
        onClick={() =>
          setOpenMenu(
            openMenu === item.id ? null : item.id
          )
        }
        aria-label={`Actions for ${item.title}`}
        aria-expanded={openMenu === item.id}
      >
        <FiMoreVertical />
      </button>

      {openMenu === item.id && (
        <div className="EquipmentManagement-menuDropdown">

          <button
            type="button"
            onClick={() => {
              setSelectedEquipment(item);
              setOpenMenu(null);
            }}
          >
            <FiEye />
            View equipment
          </button>

          <button
            type="button"
            onClick={() => handleEdit(item)}
          >
            <FiEdit2 />
            Edit equipment
          </button>

          <button
            type="button"
            onClick={() => handleStatusChange(item)}
          >
            {item.status === "Available" ? (
              <FiClock />
            ) : (
              <FiCheckCircle />
            )}

            {item.status === "Available"
              ? "Mark as reserved"
              : "Mark as available"}
          </button>

          <button
            type="button"
            className="EquipmentManagement-menuDelete"
            onClick={() => {
              setDeleteId(item.id);
              setOpenMenu(null);
            }}
          >
            <FiTrash2 />
            Delete item
          </button>

        </div>
      )}
    </div>
  );

  /* =====================================================
     MAIN JSX
  ===================================================== */

  return (
    <div className="EquipmentManagement">

      {/* HEADER */}

      <div className="EquipmentManagement-header">

        <div className="EquipmentManagement-heading">

          <span className="EquipmentManagement-headingIcon">
            <FiFileText />
          </span>

          <div>
            <span className="EquipmentManagement-eyebrow">
              RHINO'S EQUIPMENT
            </span>

            <h1>Equipment Management</h1>

            <p>
              Manage industry insights, machinery updates
              and company news.
            </p>
          </div>

        </div>

        <button
          type="button"
          className="EquipmentManagement-createButton"
          onClick={handleCreate}
        >
          <FiPlus />
          Add Equipment
        </button>

      </div>

      {/* NOTIFICATION */}

      {notice && (
        <div className="EquipmentManagement-notice" role="status">

          <FiCheckCircle />

          <span>{notice}</span>

          <button
            type="button"
            aria-label="Dismiss message"
            onClick={() => setNotice("")}
          >
            <FiX />
          </button>

        </div>
      )}

      {/* STATISTICS */}

      <div className="EquipmentManagement-stats">

        <div className="EquipmentManagement-statCard">
          <span className="EquipmentManagement-statIcon">
            <FiFileText />
          </span>

          <div>
            <span>Total Equipment</span>
            <strong>{equipment.length}</strong>
            <small>All equipment listings</small>
          </div>
        </div>

        <div className="EquipmentManagement-statCard">
          <span className="EquipmentManagement-statIcon EquipmentManagement-statIcon--green">
            <FiCheckCircle />
          </span>

          <div>
            <span>Available</span>
            <strong>{availableCount}</strong>
            <small>Ready for enquiry</small>
          </div>
        </div>

        <div className="EquipmentManagement-statCard">
          <span className="EquipmentManagement-statIcon EquipmentManagement-statIcon--amber">
            <FiFileText />
          </span>

          <div>
            <span>Reserved</span>
            <strong>{reservedCount}</strong>
            <small>Awaiting confirmation</small>
          </div>
        </div>

        <div className="EquipmentManagement-statCard">
          <span className="EquipmentManagement-statIcon EquipmentManagement-statIcon--blue">
            <FiEye />
          </span>

          <div>
            <span>Total Enquiries</span>
            <strong>{totalEnquiries.toLocaleString("en-IN")}</strong>
            <small>{soldCount} sold listings</small>
          </div>
        </div>

      </div>

      {/* EQUIPMENT COLLECTION */}

      <section className="EquipmentManagement-panel">

        <div className="EquipmentManagement-panelHeader">

          <div>
            <h2>Your Equipment Collection</h2>
            <p>
              Browse, edit and organize your equipment listings.
            </p>
          </div>

          <div
            className="EquipmentManagement-viewToggle"
            aria-label="View mode"
          >

            <button
              type="button"
              className={
                viewMode === "grid"
                  ? "EquipmentManagement-viewButton EquipmentManagement-viewButton--active"
                  : "EquipmentManagement-viewButton"
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
                  ? "EquipmentManagement-viewButton EquipmentManagement-viewButton--active"
                  : "EquipmentManagement-viewButton"
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

        <div className="EquipmentManagement-toolbar">

          <label className="EquipmentManagement-search">

            <FiSearch />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                changeFilter(setSearch, event.target.value)
              }
              placeholder="Search equipment, brand, model, location..."
              aria-label="Search equipment listings"
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

          <label className="EquipmentManagement-selectWrap">

            <FiFilter />

            <select
              value={typeFilter}
              onChange={(event) =>
                changeFilter(
                  setTypeFilter,
                  event.target.value
                )
              }
              aria-label="Filter by equipment type"
            >
              {availableEquipmentCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <FiChevronDown className="EquipmentManagement-selectArrow" />

          </label>

          <label className="EquipmentManagement-selectWrap">

            <select
              value={statusFilter}
              onChange={(event) =>
                changeFilter(
                  setStatusFilter,
                  event.target.value
                )
              }
              aria-label="Filter by status"
            >
              <option value="All Status">All Status</option>

              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>

            <FiChevronDown className="EquipmentManagement-selectArrow" />

          </label>

          <label className="EquipmentManagement-selectWrap EquipmentManagement-sortSelect">

            <select
              value={sortBy}
              onChange={(event) =>
                changeFilter(setSortBy, event.target.value)
              }
              aria-label="Sort equipment listings"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title">Title A–Z</option>
              <option value="mostViewed">Most Enquiries</option>
            </select>

            <FiChevronDown className="EquipmentManagement-selectArrow" />

          </label>

        </div>

        {/* RESULTS COUNT */}

        <div className="EquipmentManagement-resultsBar">

          <p>
            Showing <strong>{filteredEquipment.length}</strong> item{" "}
            {filteredEquipment.length === 1 ? "listing" : "listings"}
          </p>

          {(search ||
            typeFilter !== "All Equipment Types" ||
            statusFilter !== "All Status" ||
            sortBy !== "newest") && (
            <button
              type="button"
              onClick={clearFilters}
            >
              <FiX />
              Clear filters
            </button>
          )}

        </div>

        {/* GRID VIEW */}

        {viewMode === "grid" && filteredEquipment.length > 0 && (
          <div className="EquipmentManagement-grid">

            {visibleEquipment.map((item) => (
              <article
                className="EquipmentManagement-card"
                key={item.id}
              >

                <div className="EquipmentManagement-cardImage">

                  {getImage(item) ? (
                    <img
                      src={getImage(item)}
                      alt={item.title}
                      loading="lazy"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="EquipmentManagement-noImage">
                      <FiImage />
                    </div>
                  )}

                  <span className="EquipmentManagement-equipmentCode">
                    {item.code || `EQP-${item.id}`}
                  </span>

                  {renderActions(item)}

                  <div className="EquipmentManagement-imageStatus">
                    {renderStatus(item.status)}
                  </div>

                </div>

                <div className="EquipmentManagement-cardBody">

                  <span className="EquipmentManagement-category">
                    {item.category || "Uncategorized"}
                  </span>

                  <h3>{item.title}</h3>

                  <p className="EquipmentManagement-excerpt">
                    {getDescription(item)}
                  </p>

                  <div className="EquipmentManagement-author">
                    <FiUser />
                    <span>{getAuthor(item)}</span>
                  </div>

                  <div className="EquipmentManagement-cardFooter">

                    <div className="EquipmentManagement-cardMeta">

                      <span>
                        <FiCalendar />
                        {formatDate(getDate(item))}
                      </span>

                      <span>
                        <FiEye />
                        {(item.enquiries || 0).toLocaleString("en-IN")} enquiries
                      </span>

                    </div>

                    <button
                      type="button"
                      className="EquipmentManagement-viewLink"
                      onClick={() => setSelectedEquipment(item)}
                    >
                      View <FiArrowUpRight />
                    </button>

                  </div>

                </div>

              </article>
            ))}

          </div>
        )}

        {/* LIST VIEW */}

        {viewMode === "list" && filteredEquipment.length > 0 && (
          <div className="EquipmentManagement-listWrap">

            <table className="EquipmentManagement-table">

              <thead>
                <tr>
                  <th>Equipment Post</th>
                  <th>Equipment Type</th>
                  <th>Added By</th>
                  <th>Status</th>
                  <th>Enquiries</th>
                  <th>Listed Date</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>

                {visibleEquipment.map((item) => (
                  <tr key={item.id}>

                    <td>
                      <div className="EquipmentManagement-listPost">

                        {getImage(item) ? (
                          <img
                            src={getImage(item)}
                            alt={item.title}
                            loading="lazy"
                          />
                        ) : (
                          <div className="EquipmentManagement-noImage">
                            <FiImage />
                          </div>
                        )}

                        <div>
                          <strong>{item.title}</strong>

                          <span>
                            {item.code || `EQP-${item.id}`}
                          </span>

                          <small>{getDescription(item)}</small>
                        </div>

                      </div>
                    </td>

                    <td>
                      <span className="EquipmentManagement-category">
                        {item.category}
                      </span>
                    </td>

                    <td>
                      <span className="EquipmentManagement-listAuthor">
                        <FiUser />
                        {getAuthor(item)}
                      </span>
                    </td>

                    <td>
                      {renderStatus(item.status)}
                    </td>

                    <td>
                      {(item.enquiries || 0).toLocaleString("en-IN")}
                    </td>

                    <td>
                      {formatDate(getDate(item))}
                    </td>

                    <td>
                      <div className="EquipmentManagement-listActions">

                        <button
                          type="button"
                          aria-label={`View ${item.title}`}
                          title="View"
                          onClick={() => setSelectedEquipment(item)}
                        >
                          <FiEye />
                        </button>

                        <button
                          type="button"
                          aria-label={`Edit ${item.title}`}
                          title="Edit"
                          onClick={() => handleEdit(item)}
                        >
                          <FiEdit2 />
                        </button>

                        <button
                          type="button"
                          className="EquipmentManagement-listDelete"
                          aria-label={`Delete ${item.title}`}
                          title="Delete"
                          onClick={() => setDeleteId(item.id)}
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

        {filteredEquipment.length === 0 && (
          <div className="EquipmentManagement-empty">

            <span>
              <FiImage />
            </span>

            <h3>No equipment listings found</h3>

            <p>
              Try changing your search or filters to find equipment.
            </p>

            <button
              type="button"
              onClick={clearFilters}
            >
              Clear all filters
            </button>

          </div>
        )}

        {/* PAGINATION */}

        {filteredEquipment.length > 0 && (
          <div className="EquipmentManagement-pagination">

            <span>
              Showing {startIndex + 1}–
              {Math.min(
                startIndex + itemsPerPage,
                filteredEquipment.length
              )}{" "}
              of {filteredEquipment.length} listings
            </span>

            <div className="EquipmentManagement-pageButtons">

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
                      ? "EquipmentManagement-pageButton--active"
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

      {/* =================================================
         EQUIPMENT PREVIEW MODAL
      ================================================= */}

      {selectedEquipment && (
        <div
          className="EquipmentManagement-modalBackdrop"
          onClick={() => setSelectedEquipment(null)}
        >

          <section
            className="EquipmentManagement-detailModal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="EquipmentManagement-detailTitle"
            onClick={(event) => event.stopPropagation()}
          >

            <div className="EquipmentManagement-modalHeader">

              <div>
                <span className="EquipmentManagement-eyebrow">
                  RHINO'S EQUIPMENT
                </span>

                <h2 id="EquipmentManagement-detailTitle">
                  Equipment Details
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedEquipment(null)}
                aria-label="Close details"
              >
                <FiX />
              </button>

            </div>

            {getImage(selectedEquipment) && (
              <img
                className="EquipmentManagement-detailImage"
                src={getImage(selectedEquipment)}
                alt={selectedEquipment.title}
              />
            )}

            <div className="EquipmentManagement-detailBody">

              <div className="EquipmentManagement-detailMeta">

                {renderStatus(selectedEquipment.status)}

                <span className="EquipmentManagement-category">
                  {selectedEquipment.category}
                </span>

                <span>
                  <FiCalendar />
                  {formatDate(getDate(selectedEquipment))}
                </span>

              </div>

              <h3>{selectedEquipment.title}</h3>

              <div className="EquipmentManagement-detailAuthor">
                <FiUser />
                Added by {getAuthor(selectedEquipment)}
              </div>

              {selectedEquipment.location && (
                <div className="EquipmentManagement-detailAuthor">
                  <FiMapPin />
                  {selectedEquipment.location}
                </div>
              )}
              <div className="EquipmentManagement-detailSpecs">
                {[
                  ["Manufacturer", selectedEquipment.manufacturer],
                  ["Model", selectedEquipment.model],
                  ["Year", selectedEquipment.year],
                  ["Operating Hours", selectedEquipment.operatingHours],
                  ["Condition", selectedEquipment.condition],
                  ["Asking Price", selectedEquipment.price],
                ].filter(([, value]) => value).map(([label, value]) => (
                  <div key={label}>
                    <span>{label}</span>
                    <strong>{value}</strong>
                  </div>
                ))}
              </div>

              <div
                className="EquipmentManagement-detailDescription"
                dangerouslySetInnerHTML={{
                  __html:
                    selectedEquipment.description ||
                    `<p>${selectedEquipment.excerpt || ""}</p>`,
                }}
              />

             {selectedEquipment.quote && (
  <blockquote className="EquipmentManagement-detailQuote">
    <FiMessageSquare />
    {selectedEquipment.quote}
  </blockquote>
)}

              {selectedEquipment.otherImages?.length > 0 && (
                <div className="EquipmentManagement-detailImages">

                  <h4>Additional Images</h4>

                  <div>
                    {selectedEquipment.otherImages.map((image, index) => (
                      <img
                        key={index}
                        src={
                          typeof image === "string"
                            ? image
                            : image.data || image.preview
                        }
                        alt={image.name || `Equipment image ${index + 1}`}
                      />
                    ))}
                  </div>

                </div>
              )}

              {getTags(selectedEquipment.tags).length > 0 && (
                <div className="EquipmentManagement-detailTags">

                  {getTags(selectedEquipment.tags).map((tag) => (
                    <span key={tag}>#{tag}</span>
                  ))}

                </div>
              )}

              {(selectedEquipment.seoTitle ||
                selectedEquipment.seoDescription) && (
                <div className="EquipmentManagement-detailSEO">

                  <h4>SEO Information</h4>

                  {selectedEquipment.seoTitle && (
                    <p>
                      <strong>SEO Title:</strong>{" "}
                      {selectedEquipment.seoTitle}
                    </p>
                  )}

                  {selectedEquipment.seoDescription && (
                    <p>{selectedEquipment.seoDescription}</p>
                  )}

                </div>
              )}

              {selectedEquipment.documents?.length > 0 && (
                <div className="EquipmentManagement-detailDocuments">

                  <h4>Attached Documents</h4>

                  {selectedEquipment.documents.map((document, index) => (
                    <div
                      key={index}
                      className="EquipmentManagement-detailDocument"
                    >
                      <FiFile />

                      <span>
                        {document.name || `Document ${index + 1}`}
                      </span>
                    </div>
                  ))}

                </div>
              )}

            </div>

            <div className="EquipmentManagement-modalFooter">

              <button
                type="button"
                className="EquipmentManagement-modalSecondary"
                onClick={() => setSelectedEquipment(null)}
              >
                Close
              </button>

              <button
                type="button"
                className="EquipmentManagement-createButton"
                onClick={() => handleEdit(selectedEquipment)}
              >
                <FiEdit2 />
                Edit Equipment
              </button>

            </div>

          </section>

        </div>
      )}

      {/* =================================================
         DELETE CONFIRMATION
      ================================================= */}

      {deleteId !== null && (
        <div
          className="EquipmentManagement-modalBackdrop"
          onClick={() => setDeleteId(null)}
        >

          <section
            className="EquipmentManagement-confirmModal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="EquipmentManagement-deleteTitle"
            onClick={(event) => event.stopPropagation()}
          >

            <span className="EquipmentManagement-deleteIcon">
              <FiTrash2 />
            </span>

            <h2 id="EquipmentManagement-deleteTitle">
              Delete item post?
            </h2>

            <p>
              This item will be removed from your local
              item collection. This action cannot be undone.
            </p>

            <div className="EquipmentManagement-confirmActions">

              <button
                type="button"
                className="EquipmentManagement-modalSecondary"
                onClick={() => setDeleteId(null)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="EquipmentManagement-confirmDelete"
                onClick={handleDelete}
              >
                <FiTrash2 />
                Delete Equipment
              </button>

            </div>

          </section>

        </div>
      )}

      {/* CLOSE DROPDOWN WHEN CLICKING OUTSIDE */}

      {openMenu !== null && (
        <button
          type="button"
          className="EquipmentManagement-dismissMenu"
          aria-label="Close actions menu"
          onClick={() => setOpenMenu(null)}
        />
      )}

    </div>
  );
};

export default EquipmentManagement;