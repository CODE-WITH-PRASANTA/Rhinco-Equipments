
import React, { useState } from "react";
import {
  Zap,
  Tractor,
  ArrowRight,
  X,
  Phone,
  Mail,
  ChevronRight,
} from "lucide-react";
import "./AgriMachinery.css";

const machineryProducts = [
  {
    id: 1,
    name: "Fieldking Gold Rotary Tiller",
    power: "40-70 HP",
    category: "Tillage",
    price: "₹ 1.15 - 1.55 Lakh*",
    image:
      "https://kubota.com.mm/en/products/implements/rx220g/images/img_hero.png",
    badge: "Sponsored",
    description: "Heavy-duty rotary tiller for efficient soil preparation.",
  },
  {
    id: 2,
    name: "Shaktiman Regular Plus Series",
    power: "30-75 HP",
    category: "Tillage",
    price: "₹ 93,000 - 1.21 Lakh*",
    image:
      "https://image.makewebeasy.net/makeweb/m_1920x0/vwSRPSHKb/ROTARYTILLER/RT_F160SS_002.png?v=202405291424",
    description: "Reliable rotary tiller for different soil conditions.",
  },
  {
    id: 3,
    name: "Punni Paddy Multi Thresher 4603",
    power: "40 HP",
    category: "Post Harvest",
    price: null,
    image:
      "https://cpimg.tistatic.com/5519198/b/4/power-tiller-operated-paddy-thresher-machine.jpg",
    description: "Efficient paddy threshing machine for harvesting needs.",
  },
  {
    id: 4,
    name: "KSA Paddy Straw Chopper",
    power: "45-60 HP",
    category: "Post Harvest",
    price: "₹ 1.35 - 1.80 Lakh*",
    image:
      "https://d91ztqmtx7u1k.cloudfront.net/ClientContent/Images/Catalogue/56-inch-ksa-paddy-straw-choppe-20240916134212791.jpg",
    description: "Designed for effective crop residue management.",
  },
  {
    id: 5,
    name: "ACI Power Tiller Classic",
    power: "12 HP",
    category: "Power Tiller",
    price: "₹ 85,000 - 1.10 Lakh*",
    image:
      "https://acimotors-bd.com/assets/images/product/power-tiller/r-28.jpg",
    description: "Compact power tiller for small and medium farms.",
  },
  {
    id: 6,
    name: "Sonalika Paddyvator Rotary Tiller",
    power: "40-55 HP",
    category: "Tillage",
    price: "₹ 95,000 - 1.40 Lakh*",
    image:
      "https://lemken.com/fileadmin/_processed_/4/3/csm_Kyanite-75_1133fb8858.jpg",
    description: "Specialized implement for paddy field preparation.",
  },
  {
    id: 7,
    name: "BEW Super Seeder 4-in-1",
    power: "50-75 HP",
    category: "Sowing",
    price: "₹ 2.50 - 3.50 Lakh*",
    image:
      "https://www.bewindia.co/storage/2023/09/Super-Seeder-4-in-1-.jpg",
    description: "Combines seed sowing and residue management operations.",
  },
  {
    id: 8,
    name: "John Deere Seed Fertilizer Drill",
    power: "35-50 HP",
    category: "Sowing",
    price: null,
    image:
      "https://www.deere.co.in/assets/images/region-1/products/implements/seed_fertilizer_drill_large_eab835ad3c902260de299f6ea0530e6ccc87aa0a.png",
    description: "Seed and fertilizer application in a single operation.",
  },
];

const AgriMachinery = ({ dealerEmail = "", onContactDealer }) => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [imageErrors, setImageErrors] = useState([]);

  const handleImageError = (id) => {
    setImageErrors((previous) => [...previous, id]);
  };

  const handleContactDealer = (product) => {
    if (onContactDealer) {
      onContactDealer(product);
      return;
    }

    setSelectedProduct(product);
  };

  const sendDealerEnquiry = () => {
    if (!selectedProduct) return;

    if (!dealerEmail.trim()) {
      return;
    }

    const subject = encodeURIComponent(
      `Dealer Enquiry - ${selectedProduct.name}`
    );

    const body = encodeURIComponent(
      `Hello,\n\nI am interested in the following agricultural machinery:\n\nProduct: ${selectedProduct.name}\nPower: ${selectedProduct.power}\nCategory: ${selectedProduct.category}\nPrice: ${selectedProduct.price || "Please share price"}\n\nPlease share more details.\n\nThank you.`
    );

    window.location.href = `mailto:${dealerEmail}?subject=${subject}&body=${body}`;
  };

  return (
    <section className="agriMachinery">
      <div className="agriMachineryContainer">

        {/* SECTION HEADER */}
        <div className="agriMachineryHeader">
          <div className="agriMachineryHeaderContent">
            <span className="agriMachineryEyebrow">
              <Tractor size={17} />
              FARM EQUIPMENT COLLECTION
            </span>

            <h2>
              Explore Our <span>Agricultural Machinery</span>
            </h2>

            <p>
              Discover reliable agricultural equipment designed
              to improve productivity and make farming easier.
            </p>
          </div>

          <div className="agriMachineryHeaderCount">
            <strong>08</strong>
            <span>Featured Products</span>
          </div>
        </div>

        {/* PRODUCT GRID */}
        <div className="agriMachineryGrid">
          {machineryProducts.map((product) => (
            <article
              className="agriMachineryCard"
              key={product.id}
            >
              {/* IMAGE */}
              <div className="agriMachineryImage">
                {!imageErrors.includes(product.id) ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                    onError={() => handleImageError(product.id)}
                  />
                ) : (
                  <div className="agriMachineryImageFallback">
                    <Tractor size={55} strokeWidth={1.3} />
                    <span>Machinery Image</span>
                  </div>
                )}

                {product.badge && (
                  <span className="agriMachineryBadge">
                    {product.badge}
                  </span>
                )}

                <span className="agriMachineryImageNumber">
                  0{product.id}
                </span>
              </div>

              {/* PRODUCT DETAILS */}
              <div className="agriMachineryDetails">
                <span className="agriMachineryCategoryTag">
                  {product.category}
                </span>

                <h3>{product.name}</h3>

                {/* SPECIFICATIONS */}
                <div className="agriMachinerySpecs">
                  <div className="agriMachinerySpecItem">
                    <span>Power</span>
                    <strong>
                      <Zap size={14} />
                      {product.power}
                    </strong>
                  </div>

                  <div className="agriMachinerySpecItem">
                    <span>Category</span>
                    <strong>{product.category}</strong>
                  </div>
                </div>

                {/* PRICE */}
                <div className="agriMachineryPrice">
                  {product.price ? (
                    <strong>{product.price}</strong>
                  ) : (
                    <>
                      <span>For Price</span>
                      <button
                        onClick={() => handleContactDealer(product)}
                      >
                        Click Here
                        <ChevronRight size={15} />
                      </button>
                    </>
                  )}
                </div>

                {/* CONTACT BUTTON */}
                <button
                  className="agriMachineryContactButton"
                  onClick={() => handleContactDealer(product)}
                >
                  Contact Dealer
                  <ArrowRight size={17} />
                </button>
              </div>
            </article>
          ))}
        </div>

        {/* BOTTOM INFORMATION */}
        <div className="agriMachineryBottom">
          <div className="agriMachineryBottomIcon">
            <Tractor size={24} />
          </div>

          <div className="agriMachineryBottomText">
            <strong>Looking for the right farm equipment?</strong>
            <span>
              Contact our team for product details and dealer assistance.
            </span>
          </div>

          <button
            className="agriMachineryBottomButton"
            onClick={() => handleContactDealer(machineryProducts[0])}
          >
            Get In Touch
            <ArrowRight size={17} />
          </button>
        </div>
      </div>

      {/* DEALER ENQUIRY MODAL */}
      {selectedProduct && (
        <div
          className="agriMachineryModalOverlay"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="agriMachineryModal"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="agriMachineryModalClose"
              onClick={() => setSelectedProduct(null)}
              aria-label="Close enquiry"
            >
              <X size={20} />
            </button>

            <div className="agriMachineryModalIcon">
              <Tractor size={30} />
            </div>

            <span className="agriMachineryModalEyebrow">
              PRODUCT ENQUIRY
            </span>

            <h3>Contact Dealer</h3>

            <p>
              You are enquiring about:
            </p>

            <div className="agriMachineryModalProduct">
              <strong>{selectedProduct.name}</strong>

              <div>
                <span>Power: {selectedProduct.power}</span>
                <span>Category: {selectedProduct.category}</span>
              </div>

              <strong>
                {selectedProduct.price || "Price on request"}
              </strong>
            </div>

            {dealerEmail ? (
              <button
                className="agriMachineryModalSubmit"
                onClick={sendDealerEnquiry}
              >
                <Mail size={17} />
                Send Dealer Enquiry
              </button>
            ) : (
              <p className="agriMachineryModalNote">
                To send enquiries directly, provide your dealer email
                using the <code>dealerEmail</code> prop.
              </p>
            )}

            <button
              className="agriMachineryModalCancel"
              onClick={() => setSelectedProduct(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default AgriMachinery;
