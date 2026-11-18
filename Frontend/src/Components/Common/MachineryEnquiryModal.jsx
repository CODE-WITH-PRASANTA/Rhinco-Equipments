import React, { useState, useEffect } from "react";
import {
  X,
  Tractor,
  CheckCircle2,
  ShieldCheck,
  Tag,
  BadgePercent,
  FileText,
  User,
  Phone,
  Mail,
  MapPin,
  ArrowRight,
} from "lucide-react";
import "./MachineryEnquiryModal.css";
import { API_URL, resolveImageUrl } from "../../utils/helpers";

const HELPLINE_PHONE = "+91 98765 43210";
const HELPLINE_TEL = "+919876543210";

const INTENT_OPTIONS = [
  { id: "Price Quotation", label: "Request Best Price", icon: <Tag size={13} /> },
  { id: "Govt Subsidy Check", label: "Subsidy Eligibility", icon: <BadgePercent size={13} /> },
  { id: "Book Farm Demo", label: "Book Farm Demo", icon: <Tractor size={13} /> },
  { id: "Financing / EMI", label: "EMI & Finance", icon: <FileText size={13} /> },
];

const MachineryEnquiryModal = ({
  isOpen,
  onClose,
  machine,
  initialIntent = "Price Quotation",
  initialMessage = "",
}) => {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    location: "",
    district: "",
    intent: initialIntent,
    message: initialMessage,
  });

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submittedOrderId, setSubmittedOrderId] = useState("");
  const [error, setError] = useState("");

  // Extract machine properties safely
  const machineTitle =
    machine?.title || machine?.name || machine?.productOrEquipment || "Agricultural Machinery";
  const machineBrand = machine?.brand || machine?.brandName || "Rhinco";
  const machineCategory = machine?.category || machine?.implementType || "Farm Implement";
  const machinePower =
    machine?.powerRequirement ||
    machine?.powerRequired ||
    machine?.power ||
    machine?.tractorHp ||
    "";

  const rawPrice = machine?.discountPrice || machine?.price;
  const formattedPrice = rawPrice
    ? typeof rawPrice === "number"
      ? `₹${rawPrice.toLocaleString("en-IN")}`
      : String(rawPrice).startsWith("₹")
      ? rawPrice
      : `₹${rawPrice}`
    : "Price on Request";

  // Resolve thumbnail
  const rawImg =
    (Array.isArray(machine?.machineImages) && machine.machineImages[0]) ||
    (Array.isArray(machine?.images) && machine.images[0]) ||
    machine?.image ||
    machine?.machineImage ||
    "";
  const machineImageSrc = resolveImageUrl(rawImg, "");

  // Prefill form from logged-in user and props
  useEffect(() => {
    if (!isOpen) return;

    let defaultName = "";
    let defaultPhone = "";
    let defaultEmail = "";
    let defaultLocation = "";

    try {
      const stored = localStorage.getItem("rhinco_user");
      if (stored) {
        const u = JSON.parse(stored);
        defaultName = u.name || "";
        defaultPhone = u.phone || "";
        defaultEmail = u.email || "";
        defaultLocation = u.district || u.city || u.location || "";
      }
    } catch (e) {}

    setForm({
      name: defaultName,
      phone: defaultPhone,
      email: defaultEmail,
      location: defaultLocation,
      district: defaultLocation,
      intent: initialIntent || "Price Quotation",
      message:
        initialMessage ||
        `I am interested in ${machineTitle}. Please share quotation, subsidy options, and dealer delivery schedule.`,
    });

    setSuccess(false);
    setSubmittedOrderId("");
    setError("");
  }, [isOpen, machineTitle, initialIntent, initialMessage]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen && !submitting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, submitting, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      setError("Please provide your name and contact phone number.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      let loggedUser = null;
      try {
        const u = localStorage.getItem("rhinco_user");
        if (u) loggedUser = JSON.parse(u);
      } catch (err) {}

      const intentPrefix = form.intent ? `[${form.intent}] ` : "";
      const fullMessage = (intentPrefix + (form.message || "")).trim();

      const payload = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: (form.email || "").trim(),
        location: (form.location || form.district || "District Buyer").trim(),
        district: (form.district || form.location || "").trim(),
        machineId: machine?._id || machine?.id || "",
        machineName: machineTitle,
        productOrEquipment: machineTitle,
        brand: machineBrand,
        category: machineCategory,
        power: machinePower,
        price: formattedPrice,
        machineImage: machineImageSrc,
        intent: form.intent || "Price Quotation",
        message: fullMessage,
        userId: loggedUser?._id || loggedUser?.id || "",
      };

      // Submit to dedicated endpoint /api/machinery-orders
      const res = await fetch(`${API_URL}/machinery-orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        const orderData = data.data || payload;
        setSubmittedOrderId(orderData.orderId || "");
        setSuccess(true);

        // Store in user local enquiries for account profile viewing
        try {
          const stored = JSON.parse(
            localStorage.getItem("rhinco_user_enquiries") || "[]"
          );
          stored.unshift(orderData);
          localStorage.setItem("rhinco_user_enquiries", JSON.stringify(stored));
        } catch (err) {}

        // Dispatch live event across window
        window.dispatchEvent(
          new CustomEvent("rhinco_enquiry_submitted", { detail: orderData })
        );
      } else {
        setError(data.message || "Could not submit inquiry. Please try again.");
      }
    } catch (err) {
      console.error("Machinery enquiry error:", err);
      setError("Network connection issue. Please try again or call our helpline.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="MachineryModal-overlay"
      onClick={() => !submitting && onClose()}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="MachineryModal-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="MachineryModal-header">
          <div className="MachineryModal-headerInfo">
            <span className="MachineryModal-badge">
              <Tractor size={13} />
              <span>OFFICIAL DEALER INQUIRY</span>
            </span>
            <h3 className="MachineryModal-headerTitle">
              Connect with Authorized Dealer
            </h3>
            <p className="MachineryModal-headerSubtitle">
              Get direct factory quotations, tractor compatibility verification & government subsidy support.
            </p>
          </div>

          <button
            type="button"
            className="MachineryModal-closeBtn"
            onClick={onClose}
            aria-label="Close"
            disabled={submitting}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="MachineryModal-body">
          {success ? (
            <div className="MachineryModal-successCard">
              <div className="MachineryModal-successIcon">
                <CheckCircle2 size={36} />
              </div>
              <h4 className="MachineryModal-successTitle">Inquiry Sent Successfully!</h4>
              <p className="MachineryModal-successDesc">
                Thank you, <strong>{form.name || "Customer"}</strong>. Our authorized equipment dealer has received your inquiry for <strong>{machineTitle}</strong> and will contact you at <strong>{form.phone}</strong> shortly.
              </p>
              {submittedOrderId && (
                <div className="MachineryModal-successOrderId">
                  <span>Order Ref:</span>
                  <span>{submittedOrderId}</span>
                </div>
              )}
              <div style={{ fontSize: "12px", color: "#166534", marginTop: "4px" }}>
                ✓ Lead synced with authorized dealer network & Rhinco database
              </div>
              <button
                type="button"
                className="MachineryModal-doneBtn"
                onClick={onClose}
              >
                Done
              </button>
            </div>
          ) : (
            <>
              {/* Spotlight Machine Card */}
              <div className="MachineryModal-spotlight">
                <div className="MachineryModal-spotlightImgWrap">
                  {machineImageSrc ? (
                    <img
                      src={machineImageSrc}
                      alt={machineTitle}
                      className="MachineryModal-spotlightImg"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="MachineryModal-spotlightFallback">
                      <Tractor size={28} />
                    </div>
                  )}
                </div>

                <div className="MachineryModal-spotlightDetails">
                  <h4 className="MachineryModal-spotlightTitle" title={machineTitle}>
                    {machineTitle}
                  </h4>
                  <div className="MachineryModal-spotlightMeta">
                    {machineBrand && <span>Brand: {machineBrand}</span>}
                    {machineCategory && <span>• {machineCategory}</span>}
                    {machinePower && <span>• {machinePower}</span>}
                  </div>
                  <div className="MachineryModal-spotlightPriceRow">
                    <span className="MachineryModal-spotlightPrice">
                      {formattedPrice}
                    </span>
                    <span className="MachineryModal-verifiedBadge">
                      <ShieldCheck size={13} />
                      <span>Verified Rhinco Partner</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Assistance Intent Selection */}
              <div className="MachineryModal-intentWrap">
                <span className="MachineryModal-intentLabel">
                  What would you like assistance with?
                </span>
                <div className="MachineryModal-intentChips">
                  {INTENT_OPTIONS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={`MachineryModal-intentChip ${
                        form.intent === item.id ? "active" : ""
                      }`}
                      onClick={() => setForm((prev) => ({ ...prev, intent: item.id }))}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="MachineryModal-alertError">
                  {error}
                </div>
              )}

              {/* Inquiry Form */}
              <form onSubmit={handleSubmit} className="MachineryModal-form">
                <div className="MachineryModal-formRow">
                  <div className="MachineryModal-inputWrap">
                    <User size={16} className="MachineryModal-inputIcon" />
                    <input
                      type="text"
                      className="MachineryModal-input"
                      placeholder="Your Full Name *"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="MachineryModal-inputWrap">
                    <Phone size={16} className="MachineryModal-inputIcon" />
                    <input
                      type="tel"
                      className="MachineryModal-input"
                      placeholder="Phone / WhatsApp Number *"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="MachineryModal-formRow">
                  <div className="MachineryModal-inputWrap">
                    <Mail size={16} className="MachineryModal-inputIcon" />
                    <input
                      type="email"
                      className="MachineryModal-input"
                      placeholder="Email Address (Optional)"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </div>

                  <div className="MachineryModal-inputWrap">
                    <MapPin size={16} className="MachineryModal-inputIcon" />
                    <input
                      type="text"
                      className="MachineryModal-input"
                      placeholder="Farm District / City (e.g. Pune, MH)"
                      value={form.location}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          location: e.target.value,
                          district: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="MachineryModal-textareaWrap">
                  <FileText size={16} className="MachineryModal-inputIcon" />
                  <textarea
                    rows={2}
                    className="MachineryModal-textarea"
                    placeholder="Any specific requirement or tractor model? (e.g., 45 HP Swaraj tractor, need 7ft rotavator...)"
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="MachineryModal-submitBtn"
                >
                  {submitting ? (
                    <span>Submitting Inquiry...</span>
                  ) : (
                    <>
                      <span>Send Inquiry to Authorized Dealer</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>

              {/* Footer Hint */}
              <div className="MachineryModal-footerHint">
                <span>Immediate Assistance:</span>
                <span>
                  Helpline: <a href={`tel:${HELPLINE_TEL}`}>{HELPLINE_PHONE}</a>
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MachineryEnquiryModal;
