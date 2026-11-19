
import React from "react";
import {
  Wrench,
  Settings,
  ShieldCheck,
  Clock3,
  Headset,
  CalendarDays,
  Phone,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

import "./ServiceOne.css";

import ServiceImageOne from "../../assets/service-1.png";
import ServiceImageTwo from "../../assets/service-2.png";

const ServiceOne = () => {
  const features = [
    {
      icon: <Settings />,
      title: "Skilled",
      subtitle: "Technicians",
    },
    {
      icon: <Wrench />,
      title: "Genuine",
      subtitle: "Service",
    },
    {
      icon: <Clock3 />,
      title: "Quick",
      subtitle: "Turnaround",
    },
    {
      icon: <ShieldCheck />,
      title: "Reliable",
      subtitle: "Performance",
    },
  ];

  const services = [
    "Tractor repair",
    "Hydraulic system repair",
    "Engine servicing",
    "Regular maintenance",
  ];

  return (
    <section className="ServiceOne">
      <div className="ServiceOne-container">

        {/* LEFT CONTENT */}
        <div className="ServiceOne-content">

          <div className="ServiceOne-badge">
            <Wrench size={23} strokeWidth={3} />
            <span>RHINO AGRO SERVICE SOLUTIONS</span>
          </div>

          <h1 className="ServiceOne-title">
            Repair & Maintenance
            <span>Services</span>
          </h1>

          <p className="ServiceOne-description">
            Keep your agricultural machines in top condition with our
            expert repair and maintenance solutions.
          </p>

          {/* FEATURES */}
          <div className="ServiceOne-features">
            {features.map((feature, index) => (
              <div className="ServiceOne-feature" key={index}>
                <div className="ServiceOne-feature-icon">
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
          <div className="ServiceOne-service-list">
            {services.map((service, index) => (
              <div className="ServiceOne-service-item" key={index}>
                <CheckCircle2 size={27} />
                <span>{service}</span>
              </div>
            ))}
          </div>

          {/* BUTTONS */}
          <div className="ServiceOne-actions">
            <a href="#service-booking" className="ServiceOne-book-btn">
              <CalendarDays size={24} />
              <span>Book a Service Now</span>
              <ArrowRight size={23} className="ServiceOne-arrow" />
            </a>

            <a href="tel:+919337092269" className="ServiceOne-phone-btn">
              <Phone size={22} fill="currentColor" />
              <span>+91 9337092269</span>
            </a>
          </div>
        </div>

        {/* RIGHT IMAGES */}
        <div className="ServiceOne-visual">

          {/* TOP SUPPORT CARDS */}
          <div className="ServiceOne-support">

            <div className="ServiceOne-support-item">
              <div className="ServiceOne-support-icon">
                <Headset size={39} />
              </div>

              <div>
                <strong>24/7</strong>
                <span>Service Support</span>
              </div>
            </div>

            <div className="ServiceOne-support-divider"></div>

            <div className="ServiceOne-support-item">
              <div className="ServiceOne-support-icon">
                <ShieldCheck size={42} />
              </div>

              <div>
                <strong>100%</strong>
                <span>Genuine Support</span>
              </div>
            </div>

          </div>

          {/* IMAGE GRID */}
          <div className="ServiceOne-image-grid">

            <div className="ServiceOne-image ServiceOne-image-main">
              <img
                src={ServiceImageOne}
                alt="Expert technician repairing agricultural tractor"
              />

              <div className="ServiceOne-image-overlay">
                <span>EXPERT CARE</span>
                <h3>Professional Tractor Repair</h3>
              </div>
            </div>

            <div className="ServiceOne-image ServiceOne-image-secondary">
              <img
                src={ServiceImageTwo}
                alt="Premium agricultural tractor in farmland"
              />

              <div className="ServiceOne-image-overlay">
                <span>POWER & PERFORMANCE</span>
                <h3>Reliable Machinery</h3>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* DECORATIVE ELEMENTS */}
      <div className="ServiceOne-decoration ServiceOne-decoration-one"></div>
      <div className="ServiceOne-decoration ServiceOne-decoration-two"></div>

    </section>
  );
};

export default ServiceOne;
