
import React from "react";
import "./ServiceFour.css";
import serviceFourImage from "../../assets/service-5.png";

const ServiceFour = () => {
  const benefits = [
    "Warranty Claim Assistance",
    "Machine Inspection",
    "Free Service Information",
    "Expert Technical Guidance",
  ];

  const supportFeatures = [
    {
      icon: "headset",
      title: "Quick Claim",
      subtitle: "Support",
    },
    {
      icon: "settings",
      title: "Genuine Parts",
      subtitle: "Guidance",
    },
    {
      icon: "handshake",
      title: "Hassle-Free",
      subtitle: "Assistance",
    },
  ];

  const Icon = ({ type }) => {
    const common = {
      width: "42",
      height: "42",
      viewBox: "0 0 48 48",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2.5",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      "aria-hidden": true,
    };

    if (type === "headset") {
      return (
        <svg {...common}>
          <path d="M7 25v-5a17 17 0 0 1 34 0v5" />
          <rect x="5" y="23" width="9" height="15" rx="4" />
          <rect x="34" y="23" width="9" height="15" rx="4" />
          <path d="M39 38c-2 4-7 5-13 5" />
          <circle cx="23" cy="43" r="2" />
        </svg>
      );
    }

    if (type === "settings") {
      return (
        <svg {...common}>
          <path d="M20 4h8l2 5 5 2 5-2 4 7-4 4v6l4 4-4 7-5-2-5 2-2 5h-8l-2-5-5-2-5 2-4-7 4-4v-6l-4-4 4-7 5 2 5-2z" />
          <circle cx="24" cy="23" r="8" />
        </svg>
      );
    }

    return (
      <svg {...common}>
        <path d="M3 13l10-6 11 6 11-6 10 6-8 16-12 12-12-12z" />
        <path d="M13 7l11 6 11-6M13 29l11 12 11-12" />
        <path d="M18 24l5 5 10-11" />
      </svg>
    );
  };

  return (
    <section className="ServiceFour">
      <div className="ServiceFour__container">

        {/* Left Image Section */}
        <div className="ServiceFour__imageSection">
          <img
            src={serviceFourImage}
            alt="Agricultural tractor warranty protection"
            className="ServiceFour__image"
          />

          <div className="ServiceFour__imageOverlay" />
        </div>

        {/* Green Curved Divider */}
        <div className="ServiceFour__curve">
          <div className="ServiceFour__curveInner" />
        </div>

        {/* Right Content Section */}
        <div className="ServiceFour__content">

          <div className="ServiceFour__brand">
            <span className="ServiceFour__brandIcon">⚒</span>
            <span>FARMTECH AGRO SERVICE SOLUTIONS</span>
          </div>

          <h2 className="ServiceFour__heading">
            Warranty & Technical{" "}
            <span>Support</span>
          </h2>

          <div className="ServiceFour__headingLine" />

          <p className="ServiceFour__description">
            Reliable protection, expert guidance and dependable after-sales
            care for your farming equipment.
          </p>

          {/* Benefits */}
          <div className="ServiceFour__benefits">
            {benefits.map((benefit, index) => (
              <div
                className="ServiceFour__benefit"
                key={index}
              >
                <span className="ServiceFour__check">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path
                      d="M5 12.5L10 17L19 7"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>

                <span>{benefit}</span>
              </div>
            ))}
          </div>

          {/* Bottom Support Features */}
          <div className="ServiceFour__supportBox">
            {supportFeatures.map((feature, index) => (
              <div
                className="ServiceFour__supportItem"
                key={index}
              >
                <div className="ServiceFour__supportIcon">
                  <Icon type={feature.icon} />
                </div>

                <div className="ServiceFour__supportText">
                  <span>{feature.title}</span>
                  <span>{feature.subtitle}</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};

export default ServiceFour;
