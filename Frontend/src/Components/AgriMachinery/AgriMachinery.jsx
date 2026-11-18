import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Zap,
  Tractor,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  PhoneCall,
} from "lucide-react";
import "./AgriMachinery.css";
import { resolveImageUrl, toMachinerySlug } from "../../utils/helpers";
import MachineryEnquiryModal from "../Common/MachineryEnquiryModal";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const MACHINERY_API = `${API_URL}/machinery`;

const AgriMachinery = ({ onContactDealer }) => {
  const [machineryProducts, setMachineryProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [imageErrors, setImageErrors] = useState([]);

  // Fetch real machinery from database
  useEffect(() => {
    let isMounted = true;
    const fetchMachinery = async () => {
      try {
        setLoading(true);
        const res = await fetch(MACHINERY_API);
        const data = await res.json();
        if (res.ok && data.success && Array.isArray(data.data)) {
          if (isMounted) {
            setMachineryProducts(data.data);
          }
        }
      } catch (err) {
        console.error("Error fetching machinery in AgriMachinery:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchMachinery();
    return () => {
      isMounted = false;
    };
  }, []);

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

  const formatPrice = (val) => {
    if (!val) return null;
    const num = Number(val);
    if (isNaN(num) || num <= 0) return null;
    return `₹${num.toLocaleString("en-IN")}`;
  };

  // Limit display to latest 3 rows (4 items per row = 12 products maximum)
  const displayedMachinery = [...machineryProducts]
    .sort((a, b) => {
      if (a.createdAt && b.createdAt) {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      return 0;
    })
    .slice(0, 12);

  return (
    <section className="agriMachinery">
      <div className="agriMachineryContainer">

        {/* SECTION HEADER */}
        <div className="agriMachineryHeader">
          <div className="agriMachineryHeaderContent">
            <span className="agriMachineryEyebrow">
              <Tractor size={16} />
              OEM CERTIFIED FARM IMPLEMENTS
            </span>

            <h2>
              Explore Our <span>Agricultural Machinery</span>
            </h2>

            <p>
              Discover reliable agricultural equipment engineered to maximize field efficiency, low diesel consumption, and built for heavy-duty Indian farming.
            </p>
          </div>

          <div className="agriMachineryHeaderRight">
            <Link to="/machinery" className="agriMachineryViewAllBtn">
              <span>View All Machinery</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>

        {/* PRODUCT GRID */}
        {loading ? (
          <div className="agriMachineryLoadingState">
            <div className="agriMachinerySpinner" />
            <p>Loading certified agricultural machinery...</p>
          </div>
        ) : displayedMachinery.length === 0 ? (
          <div className="agriMachineryEmptyState">
            <Tractor size={48} color="#94a3b8" />
            <p>No machinery available at the moment.</p>
          </div>
        ) : (
          <div className="agriMachineryGrid">
            {displayedMachinery.map((product, index) => {
              const productId = product._id || product.id || index;
              const name = product.title || product.name || "Agricultural Machinery";
              const rawPower = product.implementPower || product.power || "Standard HP";
              const category = product.category || product.implementType || "Machinery";
              const slug = toMachinerySlug(name);

              const rawImage =
                (Array.isArray(product.machineImages) && product.machineImages[0]) ||
                product.image ||
                product.featuredImage?.data ||
                "";
              const resolvedImage = resolveImageUrl(rawImage, "/placeholder.png");

              const rawPrice = product.discountPrice || product.price;
              const formattedPrice = formatPrice(rawPrice);

              return (
                <article
                  className="agriMachineryCard"
                  key={productId}
                >
                  {/* CARD MEDIA / IMAGE */}
                  <Link
                    to={`/machinery-details/${slug}`}
                    className="agriMachineryImage"
                    title={`View ${name} Specifications`}
                  >
                    {!imageErrors.includes(productId) && resolvedImage ? (
                      <img
                        src={resolvedImage}
                        alt={name}
                        loading="lazy"
                        className="agriMachineryImg"
                        onError={() => handleImageError(productId)}
                      />
                    ) : (
                      <div className="agriMachineryImageFallback">
                        <Tractor size={48} strokeWidth={1.3} />
                        <span>Machinery Image</span>
                      </div>
                    )}
                  </Link>

                  {/* PRODUCT DETAILS */}
                  <div className="agriMachineryDetails">
                    <div className="agriMachineryMetaTop">
                      <span className="agriMachineryCategoryTag">
                        {category}
                      </span>
                      <span className="agriMachineryVerifiedTag" title="OEM Factory Inspected">
                        <ShieldCheck size={13} /> Verified
                      </span>
                    </div>

                    <h3 className="agriMachineryTitle">
                      <Link
                        to={`/machinery-details/${slug}`}
                        title={name}
                      >
                        {name}
                      </Link>
                    </h3>

                    {/* SPECIFICATIONS MATRIX */}
                    <div className="agriMachinerySpecs">
                      <div className="agriMachinerySpecItem">
                        <span className="agriMachinerySpecLabel">Power Required</span>
                        <strong className="agriMachinerySpecValue" title={rawPower}>
                          <Zap size={13} className="spec-icon" />
                          <span>{rawPower}</span>
                        </strong>
                      </div>

                      <div className="agriMachinerySpecItem">
                        <span className="agriMachinerySpecLabel">Implement Type</span>
                        <strong className="agriMachinerySpecValue" title={category}>
                          <Tractor size={13} className="spec-icon" />
                          <span>{category}</span>
                        </strong>
                      </div>
                    </div>

                    {/* PRICING */}
                    <div className="agriMachineryPriceBox">
                      <span className="agriMachineryPriceLabel">Ex-Showroom Price</span>
                      {formattedPrice ? (
                        <div className="agriMachineryPriceValue">
                          <strong>{formattedPrice}</strong>
                          <span className="agriMachinerySubsidyHint">Govt Subsidy Avail.</span>
                        </div>
                      ) : (
                        <div className="agriMachineryPriceRequest">
                          <span>Price on Request</span>
                        </div>
                      )}
                    </div>

                    {/* ACTIONS ROW */}
                    <div className="agriMachineryActionRow">
                      <button
                        type="button"
                        className="agriMachineryContactBtn"
                        onClick={() => handleContactDealer(product)}
                        title="Contact Authorized District Dealer for Quote"
                      >
                        <PhoneCall size={14} />
                        <span>Contact Dealer</span>
                      </button>

                      <Link
                        to={`/machinery-details/${slug}`}
                        className="agriMachinerySpecsLink"
                        title="View Full Specifications"
                      >
                        <span>Specs</span>
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* BOTTOM CTA BANNER */}
        {machineryProducts.length > 0 && (
          <div className="agriMachineryBottom">
            <div className="agriMachineryBottomIcon">
              <Tractor size={26} />
            </div>

            <div className="agriMachineryBottomText">
              <strong>Need help choosing the right tractor implement?</strong>
              <span>
                Our agricultural engineering specialists help match your tractor HP with the right rotavator, seeder, or trolley.
              </span>
            </div>

            <div className="agriMachineryBottomActions">
              <a
                href="tel:+919876543210"
                className="agriMachineryBottomCallBtn"
              >
                <span>Call Helpline (+91) 98765 43210</span>
              </a>
              <Link
                to="/machinery"
                className="agriMachineryBottomButton"
              >
                <span>Browse Full Catalogue</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* UNIFIED ENQUIRY MODAL (Saves directly to DB & shows in Admin panel) */}
      <MachineryEnquiryModal
        isOpen={Boolean(selectedProduct)}
        onClose={() => setSelectedProduct(null)}
        machine={selectedProduct}
        initialIntent="Price Quotation"
      />
    </section>
  );
};

export default AgriMachinery;
