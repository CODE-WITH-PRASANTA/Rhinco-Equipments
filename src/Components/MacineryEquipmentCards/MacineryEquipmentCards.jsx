import React, { useState } from "react";
import "./MacineryEquipmentCards.css";

/* REAL ROTARY TILLER PRODUCT IMAGES */

const rotaryImages = [
  "https://www.fieldkingusa.com/images/products/whole-goods/tiller/regular-series-single-speed-tiller/regular-series-single-speed-tiller.png",

  "https://www.fieldking.com/images/tillage/rotary-tiller/sp/regular-single-speed/1.jpg",

  "https://tiimg.tistatic.com/fp/1/009/526/side-shifting-single-speed-rotavator-594.jpg",

  "https://atlantisagritech.com/images/pro-img/rotoking-elite-series-rotary-tiller-big.jpg",

  "https://www.mahindratractor.com/sites/default/files/2026-03/Mahindra%20Supervator_1.webp",

  "https://5.imimg.com/data5/IOS/Default/2025/3/494419383/YY/JN/KL/2721258/product-jpeg-500x500.png",
];

const products = [
  {
    name: "Fieldking Hunter Series",
    power: "15-55 HP",
    price: "For Price",
    image: 0,
  },
  {
    name: "Fieldking Ranveer Rotary Tiller",
    power: "45-65 HP",
    price: "₹ 1.51 - 1.81 Lakh*",
    image: 1,
  },
  {
    name: "Fieldking Maxx Rotary Tiller",
    power: "35-60 HP",
    price: "₹ 1.15 - 1.38 Lakh*",
    image: 2,
  },
  {
    name: "Fieldking Termivator Series",
    power: "25-60 HP",
    price: "₹ 1.2 - 1.44 Lakh*",
    image: 3,
  },
  {
    name: "Fieldking Regular Multi Speed",
    power: "25-70 HP",
    price: "₹ 2.6 - 4.1 Lakh*",
    image: 0,
  },
  {
    name: "Mahindra Reverse Forward Rotavator",
    power: "15-25 HP",
    price: "For Price",
    image: 4,
  },
  {
    name: "Mahindra Paddyvator",
    power: "35-60 HP",
    price: "For Price",
    image: 4,
  },
  {
    name: "Mahindra Gyrovator ZLX Neo",
    power: "35-60 HP",
    price: "For Price",
    image: 4,
  },
  {
    name: "Mahindra Mahavator HD SS",
    power: "45-55 HP",
    price: "For Price",
    image: 4,
  },
  {
    name: "Fieldking Mini Rotary Tiller",
    power: "15-35 HP",
    price: "₹ 85,000 - 1.2 Lakh*",
    image: 5,
  },
  {
    name: "Fieldking Gold Rotary Tiller",
    power: "40-70 HP",
    price: "₹ 1.15 - 1.55 Lakh*",
    image: 5,
  },
  {
    name: "Mahindra Heavy Duty Rotavator",
    power: "45-65 HP",
    price: "₹ 1.4 - 2.1 Lakh*",
    image: 4,
  },
  {
    name: "Fieldking Single Speed Tiller",
    power: "25-50 HP",
    price: "₹ 95,000 - 1.4 Lakh*",
    image: 0,
  },
  {
    name: "Mahindra Compact Rotavator",
    power: "20-40 HP",
    price: "₹ 90,000 - 1.3 Lakh*",
    image: 4,
  },
  {
    name: "Fieldking Super Rotary Tiller",
    power: "35-70 HP",
    price: "₹ 1.3 - 1.9 Lakh*",
    image: 1,
  },
];

const sections = [
  {
    id: "rotavator",
    title: "Other Fielding Rotavator",
    button: "View All Fielding Rotavator Implements",
    products: products.slice(0, 5),
  },
  {
    id: "category",
    title: "Similar Tractor Implements Category",
    button: "View All Tillage Implements",
    products: products.slice(5, 10),
  },
  {
    id: "type",
    title: "Similar Tractor Implement Type",
    button: "View All Rotavator Implements",
    products: products.slice(10, 15),
  },
];

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
  const [activeProduct, setActiveProduct] = useState(null);
  const [expanded, setExpanded] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    name: "",
    mobile: "",
    state: "",
    district: "",
    tehsil: "",
    village: "",
  });

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
        ? {
            district: "",
            tehsil: "",
            village: "",
          }
        : {}),
      ...(name === "district"
        ? {
            tehsil: "",
            village: "",
          }
        : {}),
      ...(name === "tehsil" ? { village: "" } : {}),
    }));
  };

  const submitForm = (event) => {
    event.preventDefault();

    if (!/^[6-9]\d{9}$/.test(form.mobile)) {
      alert("Please enter a valid 10 digit mobile number.");
      return;
    }

    setSubmitted(true);
  };

  const toggleExpand = (sectionId) => {
    setExpanded((previous) => ({
      ...previous,
      [sectionId]: !previous[sectionId],
    }));
  };

  const renderCard = (product, index) => (
    <article className="mec-card" key={`${product.name}-${index}`}>
      <div className="mec-card-image">
        <img
          src={rotaryImages[product.image]}
          alt={product.name}
          loading="lazy"
          onError={(event) => {
            event.currentTarget.src = rotaryImages[0];
          }}
        />
      </div>

      <h3 className="mec-product-name" title={product.name}>
        {product.name}
      </h3>

      <div className="mec-specs">
        <div className="mec-spec">
          <span>Power</span>
          <strong>{product.power}</strong>
        </div>

        <div className="mec-spec">
          <span>Category</span>
          <strong>Tillage</strong>
        </div>
      </div>

      <div className="mec-price">
        <span>{product.price}</span>

        {product.price === "For Price" && (
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

  const renderSection = (section) => {
    const isExpanded = !!expanded[section.id];

    const visibleProducts = isExpanded
      ? section.products
      : section.products.slice(0, 5);

    return (
      <section className="mec-section" key={section.id}>
        <h2 className="mec-section-title">{section.title}</h2>

        <div className="mec-products-grid">
          {visibleProducts.map(renderCard)}
        </div>

        <div className="mec-view-all-wrap">
          <button
            type="button"
            className="mec-view-all"
            onClick={() => toggleExpand(section.id)}
          >
            {isExpanded ? "Show Less" : section.button}
          </button>
        </div>
      </section>
    );
  };

  return (
    <div className="mec-container">
      {sections.map(renderSection)}

      {activeProduct && (
        <div
          className="mec-modal-overlay"
          onClick={closeForm}
        >
          <div
            className="mec-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mec-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="mec-modal-close"
              onClick={closeForm}
              aria-label="Close form"
            >
              ×
            </button>

            <h2 id="mec-modal-title">{activeProduct.name}</h2>

            {submitted ? (
              <div className="mec-success">
                <div className="mec-success-icon">✓</div>

                <h3>Enquiry Submitted!</h3>

                <p>
                  Thank you for your interest in{" "}
                  {activeProduct.name}.
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
              <form
                className="mec-dealer-form"
                onSubmit={submitForm}
              >
                <div className="mec-form-grid">
                  <input
                    name="name"
                    placeholder="Enter Your Name"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />

                  <input
                    name="mobile"
                    type="tel"
                    placeholder="Enter Mobile Number"
                    value={form.mobile}
                    onChange={handleChange}
                    maxLength={10}
                    pattern="[6-9][0-9]{9}"
                    required
                  />

                  <select
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select State</option>

                    {states.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>

                  <select
                    name="district"
                    value={form.district}
                    onChange={handleChange}
                    disabled={!form.state}
                    required
                  >
                    <option value="">Select District</option>

                    {(districts[form.state] || []).map((district) => (
                      <option key={district} value={district}>
                        {district}
                      </option>
                    ))}
                  </select>

                  <select
                    name="tehsil"
                    value={form.tehsil}
                    onChange={handleChange}
                    disabled={!form.district}
                    required
                  >
                    <option value="">Select Tehsil</option>

                    {["Central", "North", "South", "East", "West"].map(
                      (tehsil) => (
                        <option key={tehsil} value={tehsil}>
                          {tehsil}
                        </option>
                      )
                    )}
                  </select>

                  <select
                    name="village"
                    value={form.village}
                    onChange={handleChange}
                    disabled={!form.tehsil}
                    required
                  >
                    <option value="">Select Village</option>

                    {["Village 1", "Village 2", "Village 3"].map(
                      (village) => (
                        <option key={village} value={village}>
                          {village}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <label className="mec-terms">
                  <input type="checkbox" required />

                  <span>
                    By proceeding, you confirm and agree to{" "}
                    <a href="#terms">Terms and Conditions</a>{" "}
                    and{" "}
                    <a href="#privacy">Privacy Policy</a>.
                  </span>
                </label>

                <button
                  type="submit"
                  className="mec-submit-button"
                >
                  Check Tractor Price
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