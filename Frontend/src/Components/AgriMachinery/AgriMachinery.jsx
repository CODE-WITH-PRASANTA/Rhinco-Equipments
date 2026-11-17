import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Zap,
  Tractor,
  ArrowRight,
  X,
  Mail,
  ChevronRight,
} from "lucide-react";
import "./AgriMachinery.css";
import { API_ENDPOINTS, resolveImageUrl } from "../../config/api";

const MACHINERY_API = API_ENDPOINTS.MACHINERY;

const AgriMachinery = ({ dealerEmail = "", onContactDealer }) => {
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

  const sendDealerEnquiry = () => {
    if (!selectedProduct) return;

    if (!dealerEmail.trim()) {
      return;
    }

    const productName = selectedProduct.title || selectedProduct.name;
    const power = selectedProduct.implementPower || selectedProduct.power || "Standard";
    const category = selectedProduct.category || selectedProduct.implementType || "Machinery";
    const price = selectedProduct.formattedPrice || (selectedProduct.discountPrice ? `₹ ${selectedProduct.discountPrice.toLocaleString('en-IN')}` : "Please share price");

    const subject = encodeURIComponent(
      `Dealer Enquiry - ${productName}`
    );

    const body = encodeURIComponent(
      `Hello,\n\nI am interested in the following agricultural machinery:\n\nProduct: ${productName}\nPower: ${power}\nCategory: ${category}\nPrice: ${price}\n\nPlease share more details.\n\nThank you.`
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
            <strong>{String(machineryProducts.length).padStart(2, "0")}</strong>
            <span>Featured Products</span>
          </div>
        </div>

        {/* PRODUCT GRID */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#64748b" }}>
            <p>Loading real machinery...</p>
          </div>
        ) : machineryProducts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#64748b" }}>
            <p>No machinery available at the moment.</p>
          </div>
        ) : (
          <div className="agriMachineryGrid">
            {machineryProducts.map((product, index) => {
              const productId = product._id || product.id || index;
              const name = product.title || product.name;
              const power = product.implementPower || product.power || "Standard HP";
              const category = product.category || product.implementType || "Machinery";
              const image = (Array.isArray(product.machineImages) && product.machineImages[0]) ||
                product.image ||
                product.featuredImage?.data ||
                "";
              const priceDisplay = product.formattedPrice ||
                (product.discountPrice ? `₹ ${Number(product.discountPrice).toLocaleString("en-IN")}` :
                (product.price ? `₹ ${Number(product.price).toLocaleString("en-IN")}` : null));
              const badge = product.sponsored ? "Sponsored" : (product.status === "Available" ? "Available" : "");

              return (
                <article
                  className="agriMachineryCard"
                  key={productId}
                >
                  {/* IMAGE */}
                  <Link
                    to={`/machinery/${encodeURIComponent(name)}`}
                    className="agriMachineryImage"
                    style={{ textDecoration: "none", display: "block" }}
                  >
                    {!imageErrors.includes(productId) && image ? (
                      <img
                        src={resolveImageUrl(image)}
                        alt={name}
                        loading="lazy"
                        onError={() => handleImageError(productId)}
                      />
                    ) : (
                      <div className="agriMachineryImageFallback">
                        <Tractor size={55} strokeWidth={1.3} />
                        <span>Machinery Image</span>
                      </div>
                    )}

                    {badge && (
                      <span className="agriMachineryBadge">
                        {badge}
                      </span>
                    )}

                    <span className="agriMachineryImageNumber">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </Link>

                  {/* PRODUCT DETAILS */}
                  <div className="agriMachineryDetails">
                    <span className="agriMachineryCategoryTag">
                      {category}
                    </span>

                    <h3>
                      <Link
                        to={`/machinery/${encodeURIComponent(name)}`}
                        style={{ textDecoration: "none", color: "inherit" }}
                      >
                        {name}
                      </Link>
                    </h3>

                    {/* SPECIFICATIONS */}
                    <div className="agriMachinerySpecs">
                      <div className="agriMachinerySpecItem">
                        <span>Power</span>
                        <strong>
                          <Zap size={14} />
                          {power}
                        </strong>
                      </div>

                      <div className="agriMachinerySpecItem">
                        <span>Category</span>
                        <strong>{category}</strong>
                      </div>
                    </div>

                    {/* PRICE */}
                    <div className="agriMachineryPrice">
                      {priceDisplay ? (
                        <strong>{priceDisplay}</strong>
                      ) : (
                        <>
                          <span>For Price</span>
                          <button
                            type="button"
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
                      type="button"
                      className="agriMachineryContactButton"
                      onClick={() => handleContactDealer(product)}
                    >
                      Contact Dealer
                      <ArrowRight size={17} />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* BOTTOM INFORMATION */}
        {machineryProducts.length > 0 && (
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
        )}
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
              <strong>{selectedProduct.title || selectedProduct.name}</strong>

              <div>
                <span>Power: {selectedProduct.implementPower || selectedProduct.power || "Standard HP"}</span>
                <span>Category: {selectedProduct.category || selectedProduct.implementType || "Machinery"}</span>
              </div>

              <strong>
                {selectedProduct.formattedPrice ||
                 (selectedProduct.discountPrice ? `₹ ${Number(selectedProduct.discountPrice).toLocaleString("en-IN")}` : "Price on request")}
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
                To send enquiries directly, please contact our helpline or submit a request on the machinery details page.
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
