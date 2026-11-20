
import React from "react";
import {
  Wrench,
  House,
  HardHat,
  Timer,
  BadgeCheck,
  CheckCircle2,
  ClipboardList,
  Settings,
  MessageCircle,
  CalendarDays,
  Headset,
  ArrowRight,
} from "lucide-react";

import "./ServiceThree.css";
import ServiceImage from "../../assets/service-page-4.png";

const ServiceThree = () => {
  const features = [
    {
      icon: <House />,
      title: "Doorstep",
      subtitle: "Convenience",
    },
    {
      icon: <HardHat />,
      title: "Trained",
      subtitle: "Technicians",
    },
    {
      icon: <Timer />,
      title: "Fast",
      subtitle: "Response",
    },
    {
      icon: <BadgeCheck />,
      title: "Genuine",
      subtitle: "Parts",
    },
  ];

  const services = [
    "Doorstep machine servicing",
    "Emergency breakdown support",
    "Technician visit booking",
    "Service location selection",
  ];

  const supportServices = [
    {
      icon: <ClipboardList />,
      title: "On-site inspection",
      subtitle: "& diagnosis",
    },
    {
      icon: <Settings />,
      title: "Routine servicing",
      subtitle: "and adjustments",
    },
    {
      icon: <Wrench />,
      title: "Breakdown",
      subtitle: "troubleshooting",
    },
    {
      icon: <MessageCircle />,
      title: "Service updates",
      subtitle: "and guidance",
    },
  ];

  return (
    <section className="ServiceThree">
      <div className="ServiceThree-container">

        {/* LEFT CONTENT */}
        <div className="ServiceThree-content">

          {/* BRAND BADGE */}
          <div className="ServiceThree-badge">
            <Wrench size={25} strokeWidth={2.8} />
            <span>FARMTECH AGRO SERVICE SOLUTIONS</span>
          </div>

          {/* HEADING */}
          <h2 className="ServiceThree-title">
            On-Site Service <span>Support</span>
          </h2>

          <div className="ServiceThree-title-line"></div>

          {/* DESCRIPTION */}
          <p className="ServiceThree-description">
            Professional agricultural machinery servicing at your farm,
            field or workplace — delivered by trained technicians with
            dependable support.
          </p>

          {/* FEATURE CARDS */}
          <div className="ServiceThree-features">
            {features.map((feature, index) => (
              <div className="ServiceThree-feature" key={index}>
                <div className="ServiceThree-feature-icon">
                  {feature.icon}
                </div>

                <h4>
                  {feature.title}
                  <span>{feature.subtitle}</span>
                </h4>
              </div>
            ))}
          </div>

          {/* SERVICE CHECKLIST */}
          <div className="ServiceThree-service-list">
            {services.map((service, index) => (
              <div className="ServiceThree-service-item" key={index}>
                <CheckCircle2 size={28} />
                <span>{service}</span>
              </div>
            ))}
          </div>

          {/* SUPPORT SERVICES */}
          <div className="ServiceThree-support-services">
            {supportServices.map((service, index) => (
              <div className="ServiceThree-support-item" key={index}>
                <div className="ServiceThree-support-icon">
                  {service.icon}
                </div>

                <h4>
                  {service.title}
                  <span>{service.subtitle}</span>
                </h4>
              </div>
            ))}
          </div>

          {/* CTA BUTTONS */}
          <div className="ServiceThree-actions">
            

            <a
              href="tel:+91337092269"
              className="ServiceThree-support-btn"
            >
              <Headset size={27} />
              <span>Request Service Support</span>
            </a>
          </div>

        </div>

        {/* RIGHT IMAGE */}
        <div className="ServiceThree-visual">
          <div className="ServiceThree-image-wrapper">

            <div className="ServiceThree-image-corner"></div>

            <img
              src={ServiceImage}
              alt="Farmtech Agro on-site tractor servicing by professional technicians"
              className="ServiceThree-image"
            />

            <div className="ServiceThree-image-overlay">
              <span>FARMTECH AGRO SERVICES</span>
              <h3>Expert Service at Your Doorstep</h3>
              <p>
                Professional care for your agricultural machinery.
              </p>
            </div>

            <div className="ServiceThree-image-tag">
              <BadgeCheck size={21} />
              <span>Professional On-Site Support</span>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};

export default ServiceThree;
