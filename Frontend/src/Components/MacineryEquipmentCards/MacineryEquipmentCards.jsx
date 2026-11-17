import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./MacineryEquipmentCards.css";
import { toMachinerySlug } from "../../utils/helpers";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const MACHINERY_API = `${API_URL}/machinery`;
const ENQUIRIES_API = `${API_URL}/enquiries`;

const fallbackImg =
  "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=600&q=80";

const states = [
  "Odisha",
  "Andhra Pradesh",
  "Bihar",
  "Chhattisgarh",
  "Gujarat",
  "Haryana",
  "Karnataka",
  "Madhya Pradesh",
  "Maharashtra",
  "Punjab",
  "Rajasthan",
  "Tamil Nadu",
  "Telangana",
  "Uttar Pradesh",
  "West Bengal",
];

const districts = {
  Odisha: ["Bhubaneswar", "Cuttack", "Puri", "Sambalpur", "Balasore"],
  "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur"],
  Bihar: ["Patna", "Gaya", "Muzaffarpur"],
  Chhattisgarh: ["Raipur", "Bilaspur", "Durg"],
  Gujarat: ["Ahmedabad", "Surat", "Rajkot"],
  Haryana: ["Hisar", "Karnal", "Rohtak"],
  Karnataka: ["Bengaluru", "Mysuru", "Hubballi"],
  "Madhya Pradesh": ["Bhopal", "Indore", "Jabalpur"],
  Maharashtra: ["Pune", "Nagpur", "Nashik"],
  Punjab: ["Ludhiana", "Amritsar", "Patiala"],
  Rajasthan: ["Jaipur", "Jodhpur", "Udaipur"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai"],
  Telangana: ["Hyderabad", "Warangal", "Nizamabad"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Agra"],
  "West Bengal": ["Kolkata", "Howrah", "Darjeeling"],
};

const MacineryEquipmentCards = () => {
  const [machinery, setMachinery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeProduct, setActiveProduct] = useState(null);
  const [expanded, setExpanded] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    mobile: "",
    state: "",
    district: "",
    tehsil: "",
    village: "",
  });

  useEffect(() => {
    let isMounted = true;
    const fetchMachinery = async () => {
      try {
        setLoading(true);
        const res = await fetch(MACHINERY_API);
        const data = await res.json();
        if (res.ok && data.success && Array.isArray(data.data)) {
          if (isMounted) setMachinery(data.data);
        }
      } catch (err) {
        console.error("Error in MacineryEquipmentCards:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchMachinery();
    return () => {
      isMounted = false;
    };
  }, []);

  const openForm = (product) => {
    setActiveProduct(product);
    setSubmitted(false);
    setForm({
      name: "",
      mobile: "",
      state: "",
      district: "",
      tehsil: "",
      village: "",
    });
  };

  const closeForm = () => {
    setActiveProduct(null);
    setSubmitted(false);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({
      ...previous,
      [name]: value,
      ...(name === "state"
        ? { district: "", tehsil: "", village: "" }
        : {}),
      ...(name === "district"
        ? { tehsil: "", village: "" }
        : {}),
      ...(name === "tehsil" ? { village: "" } : {}),
    }));
  };

  const submitForm = async (event) => {
    event.preventDefault();

    if (!/^[6-9]\d{9}$/.test(form.mobile)) {
      alert("Please enter a valid 10 digit mobile number.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(ENQUIRIES_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          phone: form.mobile,
          email: "enquiry@rhinco.in",
          district: `${form.district || ""}, ${form.state || ""}`,
          subject: `Machinery Enquiry for ${activeProduct?.title || activeProduct?.name}`,
          message: `Enquiry for ${activeProduct?.title || activeProduct?.name}. Location: ${form.village || ""}, ${form.tehsil || ""}, ${form.district || ""}, ${form.state || ""}.`,
          machineName: activeProduct?.title || activeProduct?.name,
          machineId: activeProduct?._id || activeProduct?.id,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        setSubmitted(true);
      }
    } catch (e) {
      console.error(e);
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleExpand = (sectionId) => {
    setExpanded((previous) => ({
      ...previous,
      [sectionId]: !previous[sectionId],
    }));
  };

  const renderCard = (product, index) => {
    const name = product.title || product.name;
    const power = product.implementPower || product.power || "Standard HP";
    const category = product.category || product.implementType || "Machinery";
    const image = (Array.isArray(product.machineImages) && product.machineImages[0]) ||
      product.image ||
      product.featuredImage?.data ||
      fallbackImg;
    const priceDisplay = product.formattedPrice ||
      (product.discountPrice ? `₹ ${Number(product.discountPrice).toLocaleString("en-IN")}` :
      (product.price ? `₹ ${Number(product.price).toLocaleString("en-IN")}` : "For Price"));

    return (
      <article className="mec-card" key={product._id || product.id || index}>
        <div className="mec-card-image">
          <Link to={`/machinery/${toMachinerySlug(name)}`}>
            <img
              src={image}
              alt={name}
              loading="lazy"
              onError={(event) => {
                event.currentTarget.src = fallbackImg;
              }}
            />
          </Link>
        </div>

        <h3 className="mec-product-name" title={name}>
          <Link to={`/machinery/${toMachinerySlug(name)}`} style={{ textDecoration: "none", color: "inherit" }}>
            {name}
          </Link>
        </h3>

        <div className="mec-specs">
          <div className="mec-spec">
            <span>Power</span>
            <strong>{power}</strong>
          </div>

          <div className="mec-spec">
            <span>Category</span>
            <strong>{category}</strong>
          </div>
        </div>

        <div className="mec-price">
          <span>{priceDisplay}</span>

          {priceDisplay === "For Price" && (
            <button
              type="button"
              className="mec-price-link"
              onClick={() => openForm(product)}
            >
              Click Here
            </button>
          )}
        </div>

        <button
          type="button"
          className="mec-dealer-button"
          onClick={() => openForm(product)}
        >
          Contact Dealer
        </button>
      </article>
    );
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "40px 0", color: "#64748b" }}>
        Loading machinery...
      </div>
    );
  }

  if (machinery.length === 0) {
    return null;
  }

  const sections = [
    {
      id: "popular",
      title: "Popular Agricultural Machinery",
      button: "View All Machinery",
      products: machinery,
    },
  ];

  return (
    <div className="mec-container">
      {sections.map((section) => {
        const isExpanded = !!expanded[section.id];
        const visibleProducts = isExpanded
          ? section.products
          : section.products.slice(0, 6);

        return (
          <section className="mec-section" key={section.id}>
            <h2 className="mec-section-title">{section.title}</h2>

            <div className="mec-products-grid">
              {visibleProducts.map(renderCard)}
            </div>

            {section.products.length > 6 && (
              <div className="mec-view-all-wrap">
                <button
                  type="button"
                  className="mec-view-all"
                  onClick={() => toggleExpand(section.id)}
                >
                  {isExpanded ? "Show Less" : section.button}
                </button>
              </div>
            )}
          </section>
        );
      })}

      {activeProduct && (
        <div className="mec-modal-overlay" onClick={closeForm}>
          <div
            className="mec-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mec-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mec-modal-header">
              <div>
                <h3 id="mec-modal-title">Get Dealer Price</h3>
                <p>
                  Enquiring about:{" "}
                  <strong>{activeProduct.title || activeProduct.name}</strong>
                </p>
              </div>

              <button
                type="button"
                className="mec-modal-close"
                onClick={closeForm}
                aria-label="Close form"
              >
                ✕
              </button>
            </div>

            {submitted ? (
              <div className="mec-success-message">
                <h4>Thank You!</h4>
                <p>
                  Your details have been submitted. Our verified dealer will
                  contact you shortly regarding{" "}
                  <strong>{activeProduct.title || activeProduct.name}</strong>.
                </p>

                <button
                  type="button"
                  className="mec-submit-button"
                  onClick={closeForm}
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={submitForm} className="mec-form">
                <div className="mec-form-group">
                  <label htmlFor="mec-name">Full Name *</label>
                  <input
                    id="mec-name"
                    name="name"
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={form.name}
                    onChange={handleChange}
                  />
                </div>

                <div className="mec-form-group">
                  <label htmlFor="mec-mobile">Mobile Number *</label>
                  <input
                    id="mec-mobile"
                    name="mobile"
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="10 digit mobile number"
                    value={form.mobile}
                    onChange={handleChange}
                  />
                </div>

                <div className="mec-form-row">
                  <div className="mec-form-group">
                    <label htmlFor="mec-state">State *</label>
                    <select
                      id="mec-state"
                      name="state"
                      required
                      value={form.state}
                      onChange={handleChange}
                    >
                      <option value="">Select State</option>
                      {states.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mec-form-group">
                    <label htmlFor="mec-district">District *</label>
                    <select
                      id="mec-district"
                      name="district"
                      required
                      disabled={!form.state}
                      value={form.district}
                      onChange={handleChange}
                    >
                      <option value="">
                        {form.state ? "Select District" : "Choose state first"}
                      </option>

                      {(districts[form.state] || []).map((district) => (
                        <option key={district} value={district}>
                          {district}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mec-form-row">
                  <div className="mec-form-group">
                    <label htmlFor="mec-tehsil">Tehsil</label>
                    <input
                      id="mec-tehsil"
                      name="tehsil"
                      type="text"
                      placeholder="Enter tehsil"
                      value={form.tehsil}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="mec-form-group">
                    <label htmlFor="mec-village">Village</label>
                    <input
                      id="mec-village"
                      name="village"
                      type="text"
                      placeholder="Enter village"
                      value={form.village}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="mec-submit-button"
                  disabled={submitting}
                >
                  {submitting ? "Submitting..." : "Submit Enquiry"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MacineryEquipmentCards;
