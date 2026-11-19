
import React from "react";
import {
  Settings,
  Award,
  ShieldCheck,
  Layers,
  Truck,
  CheckCircle2,
  ShoppingCart,
  ArrowRight,
  Phone,
} from "lucide-react";

import "./ServiceTwo.css";
import ServiceImage from "../../assets/service-3.png";

const ServiceTwo = () => {
  const features = [
    {
      icon: <Award />,
      title: "100%",
      subtitle: "Genuine Parts",
    },
    {
      icon: <ShieldCheck />,
      title: "Durable &",
      subtitle: "Reliable",
    },
    {
      icon: <Layers />,
      title: "Wide Range",
      subtitle: "of Parts",
    },
    {
      icon: <Truck />,
      title: "Quick",
      subtitle: "Availability",
    },
  ];

  const services = [
    "Genuine spare parts",
    "Tyre and filter replacement",
    "Battery replacement",
    "Machine parts enquiry",
  ];

  return (
    <section className="ServiceTwo">
      <div className="ServiceTwo-container">

        {/* LEFT IMAGE SECTION */}
        <div className="ServiceTwo-visual">

          <div className="ServiceTwo-image-wrapper">

            <div className="ServiceTwo-image-corner"></div>

            <img
              src={ServiceImage}
              alt="Rhino genuine agricultural tractor spare parts"
              className="ServiceTwo-image"
            />

            <div className="ServiceTwo-image-overlay">
              <span>RHINO GENUINE PARTS</span>
              <h3>Quality Parts. Reliable Performance.</h3>
            </div>

            <div className="ServiceTwo-image-tag">
              <ShieldCheck size={19} />
              <span>100% Genuine Products</span>
            </div>

          </div>

        </div>

        {/* RIGHT CONTENT SECTION */}
        <div className="ServiceTwo-content">

          {/* BADGE */}
          <div className="ServiceTwo-badge">
            <Settings size={24} strokeWidth={3} />
            <span>RHINO AGRO SERVICE SOLUTIONS</span>
          </div>

          {/* TITLE */}
          <h2 className="ServiceTwo-title">
            Spare Parts & <span>Replacement</span>
          </h2>

          {/* DESCRIPTION */}
          <p className="ServiceTwo-description">
            Original and high-quality spare parts to ensure longer life,
            reliable performance, and maximum productivity for your
            agricultural machines.
          </p>

          {/* FEATURE CARDS */}
          <div className="ServiceTwo-features">

            {features.map((feature, index) => (
              <div className="ServiceTwo-feature" key={index}>

                <div className="ServiceTwo-feature-icon">
                  {feature.icon}
                </div>

                <h4>
                  {feature.title}
                  <span>{feature.subtitle}</span>
                </h4>

              </div>
            ))}

          </div>

          {/* SERVICE LIST */}
          <div className="ServiceTwo-service-list">

            {services.map((service, index) => (
              <div className="ServiceTwo-service-item" key={index}>
                <CheckCircle2 size={28} />
                <span>{service}</span>
              </div>
            ))}

          </div>

          {/* CTA BUTTONS */}
          <div className="ServiceTwo-actions">

            <a
              href="#spare-parts-enquiry"
              className="ServiceTwo-enquiry-btn"
            >
              <ShoppingCart size={26} />
              <span>Enquire for Spare Parts</span>
              <ArrowRight className="ServiceTwo-arrow" size={25} />
            </a>

            <a
              href="tel:+919583195951"
              className="ServiceTwo-phone-btn"
            >
              <Phone size={23} fill="currentColor" />
              <span>+91 9583195951</span>
            </a>

          </div>

        </div>

      </div>
    </section>
  );
};

export default ServiceTwo;
