import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import "./ServiceFive.css";
import tractorImage from "../../assets/service-5.png";

/* =========================================
   STATIC DATA
========================================= */

const categories = [
  "Tractor",
  "Harvester",
  "Power Tiller",
  "Other Equipment",
];

const machineModels = [
  "Mahindra",
  "John Deere",
  "Sonalika",
  "Massey Ferguson",
  "Swaraj",
  "New Holland",
  "Eicher",
  "Other",
];

const services = [
  "General Servicing",
  "Engine Repair",
  "Hydraulic Repair",
  "Electrical Repair",
  "Brake & Clutch Service",
  "Emergency Breakdown",
  "Other Service",
];

/* =========================================
   FIELD ICON (outside component = no remount)
========================================= */

const icons = {
  user: (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c0-4 3-6 7-6s7 2 7 6" />
    </>
  ),
  phone: (
    <path d="M7 3h3l2 5-2 2a14 14 0 0 0 4 4l2-2 5 2v3c0 2-2 3-4 3A16 16 0 0 1 4 5c0-1 1-2 3-2Z" />
  ),
  machine: (
    <>
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <path d="M8 9h8M8 13h8M8 17h4" />
    </>
  ),
  service: (
    <>
      <path d="m14 6 4-4 4 4-4 4" />
      <path d="m2 22 12-12M5 5l14 14M3 3l5 5" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M7 2v6M17 2v6M3 10h18" />
    </>
  ),
  location: (
    <>
      <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  edit: (
    <path d="m15 5 4 4M4 20l4-.8L20 7a2.8 2.8 0 0 0-4-4L4 15l-.8 5Z" />
  ),
};

const FieldIcon = ({ type }) => (
  <svg
    className="ServiceFive__icon"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {icons[type]}
  </svg>
);

/* =========================================
   CUSTOM SELECT
   Native <select> popups cannot be styled or
   width-matched, so we use our own dropdown.
========================================= */

const CustomSelect = ({
  id,
  name,
  value,
  onChange,
  options,
  placeholder,
  icon,
  required,
}) => {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const handleOutside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    const handleKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside);
    document.addEventListener("keydown", handleKey);

    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const selectOption = (option) => {
    onChange({ target: { name, value: option } });
    setOpen(false);
  };

  return (
    <div
      className={`ServiceFive__select ${open ? "is-open" : ""}`}
      ref={wrapRef}
    >
      <button
        type="button"
        id={id}
        className="ServiceFive__selectButton"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <FieldIcon type={icon} />
        <span
          className={`ServiceFive__selectValue ${
            value ? "" : "is-placeholder"
          }`}
        >
          {value || placeholder}
        </span>
        <svg
          className="ServiceFive__chevron"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {/* Hidden input keeps native "required" validation working */}
      {required && (
        <input
          className="ServiceFive__selectProxy"
          tabIndex={-1}
          value={value}
          onChange={() => {}}
          required
          aria-hidden="true"
        />
      )}

      {open && (
        <ul className="ServiceFive__selectList" role="listbox">
          {options.map((option) => (
            <li
              key={option}
              role="option"
              aria-selected={value === option}
              className={`ServiceFive__selectOption ${
                value === option ? "is-selected" : ""
              }`}
              onClick={() => selectOption(option)}
            >
              {option}
              {value === option && (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="m5 12 5 5L20 7" />
                </svg>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

/* =========================================
   VISUAL VIEWPORT HOOK
   Sizes the popup overlay to what the user
   actually sees, even if the page overflows
   horizontally. Also locks page scroll.
========================================= */

const useVisibleViewport = (active) => {
  const [box, setBox] = useState(null);

  useEffect(() => {
    if (!active) return;

    const vv = window.visualViewport;

    const update = () => {
      if (vv) {
        setBox({
          top: vv.offsetTop,
          left: vv.offsetLeft,
          width: vv.width,
          height: vv.height,
        });
      } else {
        setBox(null);
      }
    };

    update();

    if (vv) {
      vv.addEventListener("resize", update);
      vv.addEventListener("scroll", update);
    }
    window.addEventListener("resize", update);

    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    return () => {
      if (vv) {
        vv.removeEventListener("resize", update);
        vv.removeEventListener("scroll", update);
      }
      window.removeEventListener("resize", update);
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
    };
  }, [active]);

  return box;
};

/* =========================================
   SUCCESS POPUP (outside component = no remount)
========================================= */

const SuccessPopup = ({ onClose, onContinue }) => {
  const box = useVisibleViewport(true);

  const overlayStyle = box
    ? {
        top: box.top,
        left: box.left,
        right: "auto",
        bottom: "auto",
        width: box.width,
        height: box.height,
      }
    : undefined;

  return (
    <div
      className="ServiceFive__successOverlay"
      style={overlayStyle}
      onClick={onClose}
    >
      <div
        className="ServiceFive__successModal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ServiceFive-successTitle"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="ServiceFive__successClose"
          onClick={onClose}
          aria-label="Close popup"
        >
          &times;
        </button>

        <div className="ServiceFive__successTopLine" />

        <div className="ServiceFive__successIconOuter">
          <div className="ServiceFive__successIconRing">
            <svg viewBox="0 0 100 100" fill="none">
              <path
                d="M28 51L43 66L73 35"
                stroke="currentColor"
                strokeWidth="7"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="ServiceFive__checkPath"
              />
            </svg>
          </div>
        </div>

        <div className="ServiceFive__successContent">
          <span className="ServiceFive__successTopLabel">
            <span />
            SUCCESSFULLY SUBMITTED
            <span />
          </span>

          <h2 id="ServiceFive-successTitle">
            Appointment Submitted
            <span> Successfully!</span>
          </h2>

          <p>
            Thank you for choosing Farmtech Agro Service Solutions. Your
            appointment request has been received successfully.
          </p>
        </div>

        <div className="ServiceFive__confirmationBox">
          <div className="ServiceFive__confirmationIcon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.8 19.8 0 0 1 11.19 18a19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.09 3.18 2 2 0 0 1 4.08 1h3a2 2 0 0 1 2 1.72c.12.96.35 1.9.69 2.8a2 2 0 0 1-.45 2.11L8.05 8.9a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.84.57 2.8.69a2 2 0 0 1 1.77 2.05Z" />
            </svg>
          </div>

          <div className="ServiceFive__confirmationText">
            <h4>What's Next?</h4>
            <p>
              Our service team will contact you shortly regarding your
              appointment.
            </p>
          </div>
        </div>

        <div className="ServiceFive__successBadge">
          <span />
          Your Request Has Been Received
        </div>

        <button
          type="button"
          className="ServiceFive__continueButton"
          onClick={onContinue}
        >
          Continue <span>→</span>
        </button>

        <div className="ServiceFive__successFooter">
          FARMTECH AGRO SERVICE SOLUTIONS
        </div>
      </div>
    </div>
  );
};

/* =========================================
   MAIN COMPONENT
========================================= */

const ServiceFive = () => {
  const initialFormData = {
    customerName: "",
    mobileNumber: "",
    machineCategory: "Tractor",
    machineModel: "",
    serviceRequired: "General Servicing",
    appointmentDate: "",
    serviceLocation: "",
    machineProblem: "",
  };

  const [formData, setFormData] = useState(initialFormData);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Appointment Details:", formData);
    setSubmitted(true);
  };

  const closePopup = () => {
    setSubmitted(false);
  };

  const handleContinue = () => {
    setSubmitted(false);
    setFormData(initialFormData);
  };

  return (
    <section className="ServiceFive">
      <div className="ServiceFive__container">
        {/* LEFT PANEL */}
        <div className="ServiceFive__left">
          <div className="ServiceFive__leftContent">
            <div className="ServiceFive__eyebrow">
              <span />
              BOOK A SERVICE
            </div>

            <h2 className="ServiceFive__title">
              Book a Service
              <span>Appointment</span>
            </h2>

            <p className="ServiceFive__subtitle">
              Schedule a service for your agricultural equipment. Our expert
              technicians are ready to help you.
            </p>
          </div>

          <div className="ServiceFive__imageWrapper">
            <img
              src={tractorImage}
              alt="Agricultural tractor service"
              className="ServiceFive__image"
            />
          </div>
        </div>

        {/* RIGHT FORM */}
        <div className="ServiceFive__right">
          <form className="ServiceFive__form" onSubmit={handleSubmit}>
            <div className="ServiceFive__grid">
              <div className="ServiceFive__field">
                <label htmlFor="ServiceFive-name">
                  Customer Name <span>*</span>
                </label>

                <div className="ServiceFive__inputWrap">
                  <FieldIcon type="user" />
                  <input
                    id="ServiceFive-name"
                    type="text"
                    name="customerName"
                    placeholder="Enter your name"
                    value={formData.customerName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="ServiceFive__field">
                <label htmlFor="ServiceFive-mobile">
                  Mobile Number <span>*</span>
                </label>

                <div className="ServiceFive__inputWrap">
                  <FieldIcon type="phone" />
                  <input
                    id="ServiceFive-mobile"
                    type="tel"
                    name="mobileNumber"
                    placeholder="Enter mobile number"
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    pattern="[0-9]{10}"
                    maxLength={10}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="ServiceFive__field">
              <label>
                Machine Category <span>*</span>
              </label>

              <div className="ServiceFive__radioGroup">
                {categories.map((category) => (
                  <label className="ServiceFive__radioLabel" key={category}>
                    <input
                      type="radio"
                      name="machineCategory"
                      value={category}
                      checked={formData.machineCategory === category}
                      onChange={handleChange}
                    />
                    <span className="ServiceFive__customRadio" />
                    {category}
                  </label>
                ))}
              </div>
            </div>

            <div className="ServiceFive__grid">
              <div className="ServiceFive__field">
                <label htmlFor="ServiceFive-model">
                  Select Machine Model <span>*</span>
                </label>

                <CustomSelect
                  id="ServiceFive-model"
                  name="machineModel"
                  value={formData.machineModel}
                  onChange={handleChange}
                  options={machineModels}
                  placeholder="Select machine model"
                  icon="machine"
                  required
                />
              </div>

              <div className="ServiceFive__field">
                <label htmlFor="ServiceFive-service">
                  Service Required <span>*</span>
                </label>

                <CustomSelect
                  id="ServiceFive-service"
                  name="serviceRequired"
                  value={formData.serviceRequired}
                  onChange={handleChange}
                  options={services}
                  placeholder="Select service"
                  icon="service"
                />
              </div>
            </div>

            <div className="ServiceFive__grid">
              <div className="ServiceFive__field">
                <label htmlFor="ServiceFive-date">
                  Preferred Appointment Date <span>*</span>
                </label>

                <div className="ServiceFive__inputWrap">
                  <FieldIcon type="calendar" />
                  <input
                    id="ServiceFive-date"
                    type="date"
                    name="appointmentDate"
                    value={formData.appointmentDate}
                    onChange={handleChange}
                    min={new Date().toLocaleDateString("en-CA")}
                    required
                  />
                </div>
              </div>

              <div className="ServiceFive__field">
                <label htmlFor="ServiceFive-location">
                  Service Location <span>*</span>
                </label>

                <div className="ServiceFive__inputWrap">
                  <FieldIcon type="location" />
                  <input
                    id="ServiceFive-location"
                    type="text"
                    name="serviceLocation"
                    placeholder="Village, District, PIN Code"
                    value={formData.serviceLocation}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="ServiceFive__field">
              <label htmlFor="ServiceFive-problem">
                Describe Your Machine Problem <span>*</span>
              </label>

              <div className="ServiceFive__textareaWrap">
                <FieldIcon type="edit" />
                <textarea
                  id="ServiceFive-problem"
                  name="machineProblem"
                  placeholder="Describe the issue..."
                  value={formData.machineProblem}
                  onChange={handleChange}
                  rows={3}
                  required
                />
              </div>
            </div>

            <button type="submit" className="ServiceFive__submit">
              <span>➤</span>
              Submit Appointment
            </button>
          </form>
        </div>
      </div>

      {/* PORTAL: popup lives outside all parent layout containers */}
      {submitted &&
        typeof document !== "undefined" &&
        createPortal(
          <SuccessPopup
            onClose={closePopup}
            onContinue={handleContinue}
          />,
          document.body
        )}
    </section>
  );
};

export default ServiceFive;