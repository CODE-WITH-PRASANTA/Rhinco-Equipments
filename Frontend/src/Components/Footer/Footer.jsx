
import React from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Leaf,
  ChevronRight,
  Sprout,
  ShieldCheck,
  Tractor,
} from "lucide-react";

import "./Footer.css";
import logo from "../../assets/Rhino-logo-removebg-preview.png";
import footerBg from "../../assets/footer-bg.png";

const Footer = () => {
  const quickLinks = [
    { name: "Home", path: "/" },
    { name: "About Us", path: "/about" },
    { name: "Products", path: "/products" },
    { name: "Machinery", path: "/machinery" },
    { name: "Our Team", path: "/team" },
    { name: "Blog", path: "/blog" },
    { name: "Services", path: "/service" },
    { name: "Contact Us", path: "/contact" },
  ];

  return (
    <footer
      className="Footer"
      style={{
        "--footer-bg-image": `url(${footerBg})`,
      }}
    >
      {/* ================= MAIN FOOTER ================= */}

      <div className="Footer-main">
        <div className="Footer-container">

          {/* COMPANY SECTION */}

          <div className="Footer-company">

            <Link to="/" className="Footer-brand">

              <span className="Footer-logo-frame">
                <img
                  src={logo}
                  alt="Rhino's Equipment"
                  className="Footer-logo"
                />
              </span>

              <span className="Footer-brand-text">

                <span className="Footer-brand-name">
                  Rhino's Equipment
                </span>

                <span className="Footer-brand-sub">
                  Agro Equipment Solutions
                </span>

              </span>
            </Link>

            <p className="Footer-company-description">
              Farmtech Agro is committed to supporting farmers
              with quality agricultural products, modern farming
              solutions, and reliable services. Growing together
              for a better agricultural future.
            </p>

            <div className="Footer-company-tagline">
              <Leaf size={17} />
              <span>Growing Together, Naturally</span>
            </div>

          </div>

          {/* FARM PROMISE SECTION */}

          <div className="Footer-promise">

            <div className="Footer-promise-icon">
              <Sprout size={30} />
            </div>

            <span className="Footer-promise-label">
              OUR PROMISE
            </span>

            <h3>
              Growing A Better
              <span>Agricultural Future</span>
            </h3>

            <p>
              Empowering farmers with quality equipment,
              trusted solutions and dependable support.
            </p>

            <div className="Footer-promise-line" />

            <div className="Footer-promise-points">

              <div>
                <ShieldCheck size={15} />
                <span>Quality First</span>
              </div>

              <div>
                <Sprout size={15} />
                <span>Farmer Focused</span>
              </div>

              <div>
                <Tractor size={15} />
                <span>Trusted Solutions</span>
              </div>

            </div>

          </div>

          {/* QUICK LINKS SECTION */}

          <div className="Footer-column">

            <h3 className="Footer-heading">
              Quick Links
            </h3>

            <ul className="Footer-link-list">

              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link to={link.path}>
                    <ChevronRight size={16} />
                    <span>{link.name}</span>
                  </Link>
                </li>
              ))}

            </ul>

          </div>

          {/* CONTACT SECTION */}

          <div className="Footer-column Footer-contact-column">

            <h3 className="Footer-heading">
              Get In Touch
            </h3>

            {/* LOCATION */}

            <div className="Footer-contact-item">

              <span className="Footer-contact-icon">
                <MapPin size={20} />
              </span>

              <p>
                India
                <span>Serving Farmers Across India</span>
              </p>

            </div>

            {/* PHONE */}

            <div className="Footer-contact-item">

              <span className="Footer-contact-icon">
                <Phone size={20} />
              </span>

              <a href="tel:+919583195951">
                +91 9583195951 (Helpline)
              </a>

            </div>

            {/* EMAIL */}

            <div className="Footer-contact-item">

              <span className="Footer-contact-icon">
                <Mail size={20} />
              </span>

              <a href="mailto:farmershelpline.in@gmail.com">
                farmershelpline.in@gmail.com
              </a>

            </div>

            {/* BUSINESS HOURS */}

            <div className="Footer-contact-item">

              <span className="Footer-contact-icon">
                <Clock size={20} />
              </span>

              <p>
                Monday - Saturday
                <span>9:00 AM - 6:00 PM</span>
              </p>

            </div>

          </div>

        </div>
      </div>

      {/* ================= BOTTOM BAR ================= */}

      <div className="Footer-bottom">

        <div className="Footer-bottom-container">

          {/* LEFT SECTION */}

          <div className="Footer-bottom-left">

            <div className="Footer-developed">
              <span>Developed with care by</span>

              <a
                href="https://prwebstock.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                PR WEBSTOCK
              </a>
            </div>

            <div className="Footer-bottom-links">

              <Link to="/terms-conditions">
                Terms &amp; Conditions
              </Link>

              <span className="Footer-bottom-separator" />

              <Link to="/privacy-policy">
                Privacy Policy
              </Link>

            </div>

          </div>

          {/* COPYRIGHT */}

          <div className="Footer-copyright">
            © {new Date().getFullYear()} Farmtech Agro.
            All Rights Reserved.
          </div>

        </div>

      </div>

    </footer>
  );
};

export default Footer;
