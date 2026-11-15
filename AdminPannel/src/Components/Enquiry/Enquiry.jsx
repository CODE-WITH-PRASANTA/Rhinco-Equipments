import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  FileText,
  CheckSquare,
  Download,
  Plus,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  Trash2,
  X,
  AlertTriangle,
  CalendarDays,
  Users,
  Mail,
  Phone,
  MapPin,
  Clock,
  User,
  Save,
  Check,
} from "lucide-react";
import "./Enquiry.css";

const initialEnquiries = [
  {
    id: 1,
    name: "Rahul Mehta",
    email: "rahul.mehta@gmail.com",
    phone: "+91 98765 43210",
    package: "Bhitarkanika Tour",
    destination: "Bhitarkanika",
    travelStart: "2026-12-12",
    travelEnd: "2026-12-14",
    travelers: 2,
    status: "New",
    date: "2026-10-24",
    time: "10:30 AM",
    photo: "https://i.pravatar.cc/150?img=11",
    packageImage: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=120&h=120&fit=crop",
  },
  {
    id: 2,
    name: "Priya Sharma",
    email: "priya.sharma@gmail.com",
    phone: "+91 87654 32109",
    package: "River Safari",
    destination: "Chilika Lake",
    travelStart: "2027-01-05",
    travelEnd: "2027-01-07",
    travelers: 4,
    status: "In Progress",
    date: "2026-10-23",
    time: "04:15 PM",
    photo: "https://i.pravatar.cc/150?img=47",
    packageImage: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=120&h=120&fit=crop",
  },
  {
    id: 3,
    name: "Amit Kumar",
    email: "amit.kumar@yahoo.com",
    phone: "+91 76543 21098",
    package: "Wildlife Experience",
    destination: "Similipal",
    travelStart: "2027-01-20",
    travelEnd: "2027-01-22",
    travelers: 3,
    status: "Replied",
    date: "2026-10-22",
    time: "11:20 AM",
    photo: "https://i.pravatar.cc/150?img=12",
    packageImage: "https://images.unsplash.com/photo-1511497584788-876760111969?w=120&h=120&fit=crop",
  },
  {
    id: 4,
    name: "Sneha Patel",
    email: "sneha.patel@gmail.com",
    phone: "+91 65432 10987",
    package: "Mangrove Tour",
    destination: "Bhitarkanika",
    travelStart: "2027-02-14",
    travelEnd: "2027-02-16",
    travelers: 2,
    status: "In Progress",
    date: "2026-10-21",
    time: "02:45 PM",
    photo: "https://i.pravatar.cc/150?img=44",
    packageImage: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=120&h=120&fit=crop",
  },
  {
    id: 5,
    name: "Vikash Singh",
    email: "vikash.singh@gmail.com",
    phone: "+91 98760 12345",
    package: "Family Tour",
    destination: "Puri",
    travelStart: "2027-03-02",
    travelEnd: "2027-03-05",
    travelers: 5,
    status: "Replied",
    date: "2026-10-20",
    time: "09:10 AM",
    photo: "https://i.pravatar.cc/150?img=13",
    packageImage: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=120&h=120&fit=crop",
  },
  {
    id: 6,
    name: "Neha Reddy",
    email: "neha.reddy@gmail.com",
    phone: "+91 87650 98765",
    package: "Photography Tour",
    destination: "Daringbadi",
    travelStart: "2027-03-18",
    travelEnd: "2027-03-20",
    travelers: 2,
    status: "New",
    date: "2026-10-19",
    time: "01:30 PM",
    photo: "https://i.pravatar.cc/150?img=45",
    packageImage: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=120&h=120&fit=crop",
  },
  {
    id: 7,
    name: "Arjun Das",
    email: "arjun.das@gmail.com",
    phone: "+91 91234 56789",
    package: "Temple Heritage Tour",
    destination: "Konark",
    travelStart: "2027-04-10",
    travelEnd: "2027-04-12",
    travelers: 3,
    status: "New",
    date: "2026-10-18",
    time: "10:20 AM",
    photo: "https://i.pravatar.cc/150?img=14",
    packageImage: "https://images.unsplash.com/photo-1548013146-72479768bada?w=120&h=120&fit=crop",
  },
  {
    id: 8,
    name: "Ananya Roy",
    email: "ananya.roy@gmail.com",
    phone: "+91 99887 66554",
    package: "Beach Holiday",
    destination: "Gopalpur",
    travelStart: "2027-04-15",
    travelEnd: "2027-04-18",
    travelers: 4,
    status: "In Progress",
    date: "2026-10-17",
    time: "03:40 PM",
    photo: "https://i.pravatar.cc/150?img=49",
    packageImage: "https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?w=120&h=120&fit=crop",
  },
  {
    id: 9,
    name: "Rohit Verma",
    email: "rohit.verma@gmail.com",
    phone: "+91 98712 34567",
    package: "Hill Station Escape",
    destination: "Daringbadi",
    travelStart: "2027-05-02",
    travelEnd: "2027-05-05",
    travelers: 2,
    status: "Replied",
    date: "2026-10-16",
    time: "12:15 PM",
    photo: "https://i.pravatar.cc/150?img=15",
    packageImage: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=120&h=120&fit=crop",
  },
  {
    id: 10,
    name: "Pooja Mishra",
    email: "pooja.mishra@gmail.com",
    phone: "+91 91234 67890",
    package: "Nature Retreat",
    destination: "Similipal",
    travelStart: "2027-05-12",
    travelEnd: "2027-05-15",
    travelers: 3,
    status: "New",
    date: "2026-10-15",
    time: "11:45 AM",
    photo: "https://i.pravatar.cc/150?img=48",
    packageImage: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=120&h=120&fit=crop",
  },
  {
    id: 11,
    name: "Karan Malhotra",
    email: "karan.m@gmail.com",
    phone: "+91 98765 12345",
    package: "Coastal Adventure",
    destination: "Chilika",
    travelStart: "2027-06-01",
    travelEnd: "2027-06-03",
    travelers: 5,
    status: "In Progress",
    date: "2026-10-14",
    time: "04:30 PM",
    photo: "https://i.pravatar.cc/150?img=16",
    packageImage: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=120&h=120&fit=crop",
  },
  {
    id: 12,
    name: "Isha Gupta",
    email: "isha.gupta@gmail.com",
    phone: "+91 97654 32109",
    package: "Forest Explorer",
    destination: "Similipal",
    travelStart: "2027-06-15",
    travelEnd: "2027-06-18",
    travelers: 2,
    status: "Replied",
    date: "2026-10-13",
    time: "09:45 AM",
    photo: "https://i.pravatar.cc/150?img=50",
    packageImage: "https://images.unsplash.com/photo-1511497584788-876760111969?w=120&h=120&fit=crop",
  },
];

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  package: "",
  destination: "",
  travelStart: "",
  travelEnd: "",
  travelers: 1,
  status: "New",
  date: "",
  time: "10:00 AM",
  photo: "",
  packageImage:
    "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=120&h=120&fit=crop",
};

const STATUSES = ["New", "In Progress", "Replied"];

const slugify = (value) => String(value).toLowerCase().replace(/\s+/g, "-");

const formatDate = (date) => {
  if (!date) return "—";
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const getAvatar = (item) =>
  item.photo || `https://i.pravatar.cc/150?img=${(Number(item.id) % 70) + 1}`;

/* =========================================
   PREMIUM CUSTOM DROPDOWN
========================================= */

const CustomSelect = ({
  value,
  options,
  onChange,
  ariaLabel,
  placement = "bottom",
  leadingIcon = null,
}) => {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const wrapRef = useRef(null);

  const selected = options.find((option) => option.value === value) || options[0];

  useEffect(() => {
    if (!open) return undefined;

    const handleOutside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  const openMenu = () => {
    setActiveIndex(
      Math.max(0, options.findIndex((option) => option.value === value))
    );
    setOpen(true);
  };

  const choose = (option) => {
    onChange(option.value);
    setOpen(false);
  };

  const handleKeyDown = (e) => {
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
        e.preventDefault();
        openMenu();
      }
      return;
    }

    switch (e.key) {
      case "Escape":
        e.preventDefault();
        e.stopPropagation();
        setOpen(false);
        break;
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((index) => (index + 1) % options.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((index) => (index - 1 + options.length) % options.length);
        break;
      case "Home":
        e.preventDefault();
        setActiveIndex(0);
        break;
      case "End":
        e.preventDefault();
        setActiveIndex(options.length - 1);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        choose(options[activeIndex]);
        break;
      case "Tab":
        setOpen(false);
        break;
      default:
        break;
    }
  };

  return (
    <div
      ref={wrapRef}
      className={`enquiry__select ${open ? "is-open" : ""} ${
        placement === "top" ? "is-top" : ""
      }`}
    >
      <button
        type="button"
        className="enquiry__select-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={handleKeyDown}
      >
        {leadingIcon}
        {selected.dot && (
          <span className={`enquiry__dot enquiry__dot--${selected.dot}`} />
        )}
        <span className="enquiry__select-value">{selected.label}</span>
        <ChevronDown className="enquiry__select-chevron" />
      </button>

      {open && (
        <ul className="enquiry__select-menu" role="listbox" aria-label={ariaLabel}>
          {options.map((option, index) => {
            const isSelected = option.value === value;

            return (
              <li
                key={option.value}
                role="option"
                aria-selected={isSelected}
                className={`enquiry__select-option ${
                  isSelected ? "is-selected" : ""
                } ${index === activeIndex ? "is-active" : ""}`}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => choose(option)}
              >
                {option.dot && (
                  <span className={`enquiry__dot enquiry__dot--${option.dot}`} />
                )}
                <span className="enquiry__select-label">{option.label}</span>

                {option.count !== undefined && (
                  <span className="enquiry__select-count">{option.count}</span>
                )}

                {isSelected && <Check className="enquiry__select-check" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

/* =========================================
   MAIN COMPONENT
========================================= */

const Enquiry = () => {
  const [enquiries, setEnquiries] = useState(initialEnquiries);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All Status");
  const [selected, setSelected] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [modal, setModal] = useState("");
  const [activeEnquiry, setActiveEnquiry] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [toast, setToast] = useState(null);

  const itemsPerPage = 6;

  /* ---------- toast auto hide ---------- */

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(timer);
  }, [toast]);

  /* ---------- modal: Esc key + body scroll lock ---------- */

  const anyModalOpen = Boolean(modal || deleteTarget);

  useEffect(() => {
    if (!anyModalOpen) return undefined;

    const onKey = (e) => {
      if (e.key === "Escape") {
        setModal("");
        setDeleteTarget(null);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [anyModalOpen]);

  /* ---------- derived data ---------- */

  const filteredEnquiries = useMemo(() => {
    const query = search.trim().toLowerCase();

    return enquiries.filter((item) => {
      const matchesSearch = [
        item.name,
        item.email,
        item.phone,
        item.package,
        item.destination,
      ].some((value) => String(value || "").toLowerCase().includes(query));

      const matchesStatus = filter === "All Status" || item.status === filter;

      return matchesSearch && matchesStatus;
    });
  }, [enquiries, search, filter]);

  const filterOptions = useMemo(
    () => [
      {
        value: "All Status",
        label: "All Status",
        dot: "all",
        count: enquiries.length,
      },
      ...STATUSES.map((status) => ({
        value: status,
        label: status,
        dot: slugify(status),
        count: enquiries.filter((item) => item.status === status).length,
      })),
    ],
    [enquiries]
  );

  const formStatusOptions = STATUSES.map((status) => ({
    value: status,
    label: status,
    dot: slugify(status),
  }));

  const totalPages = Math.max(
    1,
    Math.ceil(filteredEnquiries.length / itemsPerPage)
  );

  const safePage = Math.min(currentPage, totalPages);

  const paginatedEnquiries = filteredEnquiries.slice(
    (safePage - 1) * itemsPerPage,
    safePage * itemsPerPage
  );

  const selectedOnPage =
    paginatedEnquiries.length > 0 &&
    paginatedEnquiries.every((item) => selected.includes(item.id));

  /* ---------- selection ---------- */

  const toggleSelectAll = () => {
    if (selectedOnPage) {
      setSelected((previous) =>
        previous.filter(
          (id) => !paginatedEnquiries.some((item) => item.id === id)
        )
      );
    } else {
      setSelected((previous) => [
        ...new Set([...previous, ...paginatedEnquiries.map((item) => item.id)]),
      ]);
    }
  };

  const toggleSelect = (id) => {
    setSelected((previous) =>
      previous.includes(id)
        ? previous.filter((itemId) => itemId !== id)
        : [...previous, id]
    );
  };

  /* ---------- modals ---------- */

  const openNewModal = () => {
    setForm({
      ...emptyForm,
      date: new Date().toISOString().slice(0, 10),
    });
    setActiveEnquiry(null);
    setModal("new");
  };

  const openEditModal = (item) => {
    setActiveEnquiry(item);
    setForm({ ...item });
    setModal("edit");
  };

  const openViewModal = (item) => {
    setActiveEnquiry(item);
    setModal("view");
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;

    setEnquiries((previous) =>
      previous.filter((item) => item.id !== deleteTarget.id)
    );

    setSelected((previous) => previous.filter((id) => id !== deleteTarget.id));

    setDeleteTarget(null);
    setToast({ type: "success", message: "Enquiry deleted successfully." });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    if (modal === "edit" && activeEnquiry) {
      setEnquiries((previous) =>
        previous.map((item) =>
          item.id === activeEnquiry.id ? { ...item, ...form } : item
        )
      );
      setToast({ type: "success", message: "Enquiry updated successfully." });
    } else {
      const newId = Math.max(0, ...enquiries.map((item) => item.id)) + 1;

      setEnquiries((previous) => [{ ...form, id: newId }, ...previous]);
      setCurrentPage(1);
      setToast({ type: "success", message: "Enquiry created successfully." });
    }

    setModal("");
    setActiveEnquiry(null);
  };

  /* ---------- export ---------- */

  const exportCSV = () => {
    const exportData = selected.length
      ? enquiries.filter((item) => selected.includes(item.id))
      : filteredEnquiries;

    if (!exportData.length) {
      setToast({ type: "error", message: "No enquiries available to export." });
      return;
    }

    const headers = [
      "ID",
      "Customer",
      "Email",
      "Phone",
      "Tour Package",
      "Destination",
      "Travel Start",
      "Travel End",
      "Travelers",
      "Status",
    ];

    const rows = exportData.map((item) => [
      item.id,
      item.name,
      item.email,
      item.phone,
      item.package,
      item.destination,
      item.travelStart,
      item.travelEnd,
      item.travelers,
      item.status,
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob(["﻿" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "enquiries-list.csv";
    link.click();

    URL.revokeObjectURL(url);

    setToast({
      type: "success",
      message: `${exportData.length} enquiries exported.`,
    });
  };

  /* ---------- misc ---------- */

  const changePage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    setSelected([]);
  };

  const updateForm = (field, value) => {
    setForm((previous) => ({ ...previous, [field]: value }));
  };

  const renderStatus = (status) => (
    <span className={`enquiry__status enquiry__status--${slugify(status)}`}>
      <span className="enquiry__status-dot" />
      {status}
    </span>
  );

  /* =========================================
     RENDER
  ========================================= */

  return (
    <section className="enquiry">
      <div className="enquiry__container">
        {/* HEADER */}

        <header className="enquiry__header">
          <div className="enquiry__heading">
            <div className="enquiry__heading-icon">
              <FileText />
            </div>

            <div>
              <span className="enquiry__eyebrow">RHINO'S EQUIPMENT / ENQUIRY</span>
              <h2>Enquiries List</h2>
              <p>View and manage all incoming enquiries</p>
            </div>
          </div>

          <div className="enquiry__header-actions">
            <button
              className="enquiry__btn enquiry__select-btn"
              onClick={toggleSelectAll}
              type="button"
            >
              <CheckSquare />
              {selectedOnPage ? "Deselect All" : "Select All"}
            </button>

            <button
              className="enquiry__btn enquiry__export-btn"
              onClick={exportCSV}
              type="button"
            >
              <Download />
              Export{selected.length > 0 ? ` (${selected.length})` : ""}
            </button>

            <button
              className="enquiry__btn enquiry__new-btn"
              onClick={openNewModal}
              type="button"
            >
              <Plus />
              New Enquiry
            </button>
          </div>
        </header>

        {/* SEARCH AND FILTER */}

        <div className="enquiry__toolbar">
          <div className="enquiry__filter">
            <CustomSelect
              ariaLabel="Filter by status"
              value={filter}
              options={filterOptions}
              onChange={(value) => {
                setFilter(value);
                setCurrentPage(1);
                setSelected([]);
              }}
            />
          </div>

          <div className="enquiry__search">
            <Search size={19} />
            <input
              type="text"
              placeholder="Search name, email, phone, destination..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
                setSelected([]);
              }}
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                <X size={15} />
              </button>
            )}
          </div>

          <div className="enquiry__result-count">
            Showing{" "}
            <strong>
              {filteredEnquiries.length ? (safePage - 1) * itemsPerPage + 1 : 0}{" "}
              to {Math.min(safePage * itemsPerPage, filteredEnquiries.length)}
            </strong>{" "}
            of <strong>{filteredEnquiries.length}</strong> results
          </div>
        </div>

        {/* TABLE */}

        <div className="enquiry__table-container">
          {paginatedEnquiries.length > 0 ? (
            <div className="enquiry__table-scroll">
              <table className="enquiry__table">
                <thead>
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        checked={selectedOnPage}
                        onChange={toggleSelectAll}
                        aria-label="Select all enquiries on this page"
                      />
                    </th>
                    <th>#</th>
                    <th>CUSTOMER</th>
                    <th>EMAIL</th>
                    <th>PHONE</th>
                    <th>TOUR PACKAGE</th>
                    <th>TRAVEL DATE</th>
                    <th>TRAVELERS</th>
                    <th>STATUS</th>
                    <th>DATE</th>
                    <th>ACTION</th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedEnquiries.map((item, index) => (
                    <tr
                      key={item.id}
                      className={
                        selected.includes(item.id) ? "enquiry__selected-row" : ""
                      }
                    >
                      <td>
                        <input
                          type="checkbox"
                          checked={selected.includes(item.id)}
                          onChange={() => toggleSelect(item.id)}
                          aria-label={`Select ${item.name}`}
                        />
                      </td>

                      <td className="enquiry__number">
                        {(safePage - 1) * itemsPerPage + index + 1}
                      </td>

                      <td>
                        <div className="enquiry__customer">
                          <div className="enquiry__avatar">
                            <img
                              src={getAvatar(item)}
                              alt={item.name}
                              loading="lazy"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src =
                                  "https://i.pravatar.cc/150?img=12";
                              }}
                            />
                          </div>
                          <span>{item.name}</span>
                        </div>
                      </td>

                      <td className="enquiry__email">{item.email}</td>
                      <td className="enquiry__phone">{item.phone}</td>

                      <td>
                        <div className="enquiry__package">
                          <img
                            src={item.packageImage}
                            alt={item.package}
                            loading="lazy"
                          />
                          <span>{item.package}</span>
                        </div>
                      </td>

                      <td>
                        <div className="enquiry__travel-date">
                          <CalendarDays />
                          <div>
                            <strong>{formatDate(item.travelStart)}</strong>
                            <span>{formatDate(item.travelEnd)}</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="enquiry__travelers">
                          <Users />
                          {item.travelers} Adults
                        </div>
                      </td>

                      <td>{renderStatus(item.status)}</td>

                      <td>
                        <div className="enquiry__date">
                          <strong>{formatDate(item.date)}</strong>
                          <span>{item.time}</span>
                        </div>
                      </td>

                      <td>
                        <div className="enquiry__actions">
                          <button
                            type="button"
                            className="enquiry__action-btn enquiry__view"
                            data-tip="View"
                            aria-label={`View ${item.name}`}
                            onClick={() => openViewModal(item)}
                          >
                            <Eye />
                          </button>

                          <button
                            type="button"
                            className="enquiry__action-btn enquiry__edit"
                            data-tip="Edit"
                            aria-label={`Edit ${item.name}`}
                            onClick={() => openEditModal(item)}
                          >
                            <Pencil />
                          </button>

                          <button
                            type="button"
                            className="enquiry__action-btn enquiry__delete"
                            data-tip="Delete"
                            aria-label={`Delete ${item.name}`}
                            onClick={() => setDeleteTarget(item)}
                          >
                            <Trash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="enquiry__empty">
              <span className="enquiry__empty-icon">
                <Search size={28} />
              </span>
              <h3>No enquiries found</h3>
              <p>Try changing your search or status filter.</p>
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setFilter("All Status");
                  setCurrentPage(1);
                }}
              >
                Clear Filters
              </button>
            </div>
          )}

          <div className="enquiry__table-footer">
            <span>
              Total enquiries: <strong>{enquiries.length}</strong>
            </span>
            <span>
              Selected: <strong>{selected.length}</strong>
            </span>
          </div>
        </div>

        {/* PAGINATION */}

        <div className="enquiry__pagination">
          <span className="enquiry__pagination-info">
            Page {safePage} of {totalPages}
          </span>

          <button
            type="button"
            className="enquiry__page-arrow"
            onClick={() => changePage(safePage - 1)}
            disabled={safePage === 1}
            aria-label="Previous page"
          >
            <ChevronLeft />
          </button>

          {Array.from({ length: totalPages }, (_, index) => index + 1).map(
            (page) => (
              <button
                type="button"
                key={page}
                onClick={() => changePage(page)}
                className={`enquiry__page-number ${
                  safePage === page ? "active" : ""
                }`}
              >
                {page}
              </button>
            )
          )}

          <button
            type="button"
            className="enquiry__page-arrow"
            onClick={() => changePage(safePage + 1)}
            disabled={safePage === totalPages}
            aria-label="Next page"
          >
            <ChevronRight />
          </button>
        </div>
      </div>

      {/* NEW / EDIT MODAL */}

      {(modal === "new" || modal === "edit") && (
        <div
          className="enquiry__modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setModal("");
          }}
        >
          <div className="enquiry__modal" role="dialog" aria-modal="true">
            <div className="enquiry__modal-header">
              <div>
                <span className="enquiry__eyebrow">
                  {modal === "new" ? "NEW ENQUIRY" : "UPDATE ENQUIRY"}
                </span>
                <h3>{modal === "new" ? "Create New Enquiry" : "Edit Enquiry"}</h3>
                <p>
                  {modal === "new"
                    ? "Enter customer and travel details."
                    : "Update the selected enquiry details."}
                </p>
              </div>

              <button
                type="button"
                className="enquiry__modal-close"
                onClick={() => setModal("")}
                aria-label="Close"
              >
                <X />
              </button>
            </div>

            <form className="enquiry__form" onSubmit={handleFormSubmit}>
              <div className="enquiry__form-grid">
                <div className="enquiry__form-group">
                  <label>Customer Name *</label>
                  <div className="enquiry__form-input">
                    <User />
                    <input
                      required
                      value={form.name}
                      onChange={(e) => updateForm("name", e.target.value)}
                      placeholder="Enter customer name"
                    />
                  </div>
                </div>

                <div className="enquiry__form-group">
                  <label>Email Address *</label>
                  <div className="enquiry__form-input">
                    <Mail />
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => updateForm("email", e.target.value)}
                      placeholder="Enter email address"
                    />
                  </div>
                </div>

                <div className="enquiry__form-group">
                  <label>Phone Number *</label>
                  <div className="enquiry__form-input">
                    <Phone />
                    <input
                      required
                      value={form.phone}
                      onChange={(e) => updateForm("phone", e.target.value)}
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>

                <div className="enquiry__form-group">
                  <label>Tour Package *</label>
                  <div className="enquiry__form-input">
                    <MapPin />
                    <input
                      required
                      value={form.package}
                      onChange={(e) => updateForm("package", e.target.value)}
                      placeholder="Enter tour package"
                    />
                  </div>
                </div>

                <div className="enquiry__form-group">
                  <label>Destination *</label>
                  <div className="enquiry__form-input">
                    <MapPin />
                    <input
                      required
                      value={form.destination}
                      onChange={(e) => updateForm("destination", e.target.value)}
                      placeholder="Enter destination"
                    />
                  </div>
                </div>

                <div className="enquiry__form-group">
                  <label>Number of Travelers *</label>
                  <div className="enquiry__form-input">
                    <Users />
                    <input
                      type="number"
                      min="1"
                      required
                      value={form.travelers}
                      onChange={(e) =>
                        updateForm("travelers", Number(e.target.value))
                      }
                    />
                  </div>
                </div>

                <div className="enquiry__form-group">
                  <label>Travel Start Date *</label>
                  <input
                    className="enquiry__date-input"
                    type="date"
                    required
                    value={form.travelStart}
                    onChange={(e) => updateForm("travelStart", e.target.value)}
                  />
                </div>

                <div className="enquiry__form-group">
                  <label>Travel End Date *</label>
                  <input
                    className="enquiry__date-input"
                    type="date"
                    required
                    min={form.travelStart || undefined}
                    value={form.travelEnd}
                    onChange={(e) => updateForm("travelEnd", e.target.value)}
                  />
                </div>

                <div className="enquiry__form-group">
                  <label>Enquiry Status</label>
                  <CustomSelect
                    ariaLabel="Enquiry status"
                    placement="top"
                    value={form.status}
                    options={formStatusOptions}
                    onChange={(value) => updateForm("status", value)}
                  />
                </div>

                <div className="enquiry__form-group">
                  <label>Customer Photo URL</label>
                  <div className="enquiry__form-input">
                    <User />
                    <input
                      type="url"
                      value={form.photo}
                      onChange={(e) => updateForm("photo", e.target.value)}
                      placeholder="Optional image URL"
                    />
                  </div>
                </div>
              </div>

              <div className="enquiry__form-actions">
                <button
                  type="button"
                  className="enquiry__cancel-btn"
                  onClick={() => setModal("")}
                >
                  Cancel
                </button>

                <button type="submit" className="enquiry__modal-submit">
                  <Save size={17} />
                  {modal === "new" ? "Create Enquiry" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW DETAILS MODAL */}

      {modal === "view" && activeEnquiry && (
        <div
          className="enquiry__modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setModal("");
          }}
        >
          <div
            className="enquiry__modal enquiry__view-modal"
            role="dialog"
            aria-modal="true"
          >
            <div className="enquiry__modal-header">
              <div>
                <span className="enquiry__eyebrow">ENQUIRY DETAILS</span>
                <h3>Enquiry Details</h3>
                <p>Complete customer and booking information</p>
              </div>

              <button
                type="button"
                className="enquiry__modal-close"
                onClick={() => setModal("")}
                aria-label="Close"
              >
                <X />
              </button>
            </div>

            <div className="enquiry__view-content">
              <div className="enquiry__view-profile">
                <img
                  src={getAvatar(activeEnquiry)}
                  alt={activeEnquiry.name}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "https://i.pravatar.cc/150?img=12";
                  }}
                />
                <div>
                  <h4>{activeEnquiry.name}</h4>
                  <span>Enquiry ID: #{activeEnquiry.id}</span>
                  {renderStatus(activeEnquiry.status)}
                </div>
              </div>

              <div className="enquiry__detail-grid">
                <DetailItem icon={<Mail />} label="Email" value={activeEnquiry.email} />
                <DetailItem icon={<Phone />} label="Phone" value={activeEnquiry.phone} />
                <DetailItem icon={<MapPin />} label="Tour Package" value={activeEnquiry.package} />
                <DetailItem icon={<MapPin />} label="Destination" value={activeEnquiry.destination} />
                <DetailItem icon={<CalendarDays />} label="Travel Start" value={formatDate(activeEnquiry.travelStart)} />
                <DetailItem icon={<CalendarDays />} label="Travel End" value={formatDate(activeEnquiry.travelEnd)} />
                <DetailItem icon={<Users />} label="Travelers" value={`${activeEnquiry.travelers} Adults`} />
                <DetailItem
                  icon={<Clock />}
                  label="Enquiry Date"
                  value={`${formatDate(activeEnquiry.date)} - ${activeEnquiry.time}`}
                />
              </div>

              <button
                type="button"
                className="enquiry__modal-submit"
                onClick={() => setModal("")}
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION */}

      {deleteTarget && (
        <div
          className="enquiry__delete-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setDeleteTarget(null);
          }}
        >
          <div
            className="enquiry__delete-modal"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="enquiry-delete-title"
          >
            <button
              type="button"
              className="enquiry__delete-close"
              onClick={() => setDeleteTarget(null)}
              aria-label="Close confirmation"
            >
              <X />
            </button>

            <div className="enquiry__warning-icon">
              <AlertTriangle />
            </div>

            <h3 id="enquiry-delete-title">Delete Enquiry?</h3>

            <p>
              Are you sure you want to delete this enquiry? This action cannot
              be undone.
            </p>

            <div className="enquiry__delete-customer">
              <div className="enquiry__delete-customer-avatar">
                <img
                  src={getAvatar(deleteTarget)}
                  alt={deleteTarget.name}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "https://i.pravatar.cc/150?img=12";
                  }}
                />
              </div>

              <div>
                <strong>{deleteTarget.name}</strong>
                <span>{deleteTarget.email}</span>
              </div>
            </div>

            <div className="enquiry__delete-actions">
              <button
                type="button"
                className="enquiry__delete-cancel"
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="enquiry__delete-confirm"
                onClick={confirmDelete}
              >
                <Trash2 size={16} />
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}

      {toast && (
        <div className={`enquiry__toast is-${toast.type}`} role="status">
          <span className="enquiry__toast-icon">
            {toast.type === "success" ? <Check /> : <AlertTriangle />}
          </span>
          {toast.message}
        </div>
      )}
    </section>
  );
};

const DetailItem = ({ icon, label, value }) => (
  <div className="enquiry__detail-item">
    <div className="enquiry__detail-icon">{icon}</div>
    <div>
      <span>{label}</span>
      <strong>{value || "—"}</strong>
    </div>
  </div>
);

export default Enquiry;