
import React from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Leaf,
  ChevronRight,
} from "lucide-react";

import "./Footer.css";
import logo from "../../assets/Rhino-logo-removebg-preview.png";

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

  const productLinks = [
    { name: "Seeds & Planting", path: "/category/seeds" },
    { name: "Organic Fertilizers", path: "/category/fertilizers" },
    { name: "Agricultural Tools", path: "/category/tools" },
    { name: "Crop Protection", path: "/category/pesticides" },
    { name: "Irrigation Products", path: "/category/irrigation" },
    { name: "Farm Machinery", path: "/category/machinery" },
    { name: "Garden Supplies", path: "/category/garden" },
  ];

  const supportLinks = [
    { name: "Track Your Order", path: "/track-order" },
    { name: "Customer Feedback", path: "/feedback" },
    { name: "Frequently Asked Questions", path: "/faq" },
    { name: "Privacy Policy", path: "/privacy-policy" },
    { name: "Terms & Conditions", path: "/terms-conditions" },
    { name: "Refund & Return Policy", path: "/refund-policy" },
    { name: "Shipping Policy", path: "/shipping-policy" },
  ];

  return (
    <footer className="Footer">

      {/* MAIN FOOTER */}

      <div className="Footer-main">
        <div className="Footer-container">

          {/* COMPANY */}

          <div className="Footer-company">

            <Link to="/" className="Footer-logo-link">
              <span className="Footer-logo-frame">
                <img
                  src={logo}
                  alt="Farmtech Agro"
                  className="Footer-logo"
                />
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

          {/* QUICK LINKS */}

          <div className="Footer-column">
            <h3 className="Footer-heading">Quick Links</h3>

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

          {/* PRODUCTS */}

          <div className="Footer-column">
            <h3 className="Footer-heading">Our Products</h3>

            <ul className="Footer-link-list">
              {productLinks.map((link) => (
                <li key={link.path}>
                  <Link to={link.path}>
                    <ChevronRight size={16} />
                    <span>{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* CUSTOMER SUPPORT */}

          <div className="Footer-column">
            <h3 className="Footer-heading">Customer Support</h3>

            <ul className="Footer-link-list">
              {supportLinks.map((link) => (
                <li key={link.path}>
                  <Link to={link.path}>
                    <ChevronRight size={16} />
                    <span>{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* CONTACT */}

          <div className="Footer-column Footer-contact-column">
            <h3 className="Footer-heading">Get In Touch</h3>

            <div className="Footer-contact-item">
              <span className="Footer-contact-icon">
                <MapPin size={20} />
              </span>
              <p>
                India
                <span>Serving Farmers Across India</span>
              </p>
            </div>

            <div className="Footer-contact-item">
              <span className="Footer-contact-icon">
                <Phone size={20} />
              </span>
              <a href="tel:+919583195951">
                +91 9583195951 (Helpline)
              </a>
            </div>

            <div className="Footer-contact-item">
              <span className="Footer-contact-icon">
                <Mail size={20} />
              </span>
              <a href="mailto:farmershelpline.in@gmail.com">
                farmershelpline.in@gmail.com
              </a>
            </div>

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

      {/* BOTTOM BAR */}

      <div className="Footer-bottom">
        <div className="Footer-bottom-container">

          {/* LEFT: DEVELOPER + POLICIES */}

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
                Terms & Conditions
              </Link>

              <span className="Footer-bottom-separator" />

              <Link to="/privacy-policy">
                Privacy Policy
              </Link>
            </div>

          </div>

          {/* CENTER: COPYRIGHT */}

          <div className="Footer-copyright">
            © {new Date().getFullYear()} Farmtech Agro. All Rights Reserved.
          </div>

        </div>
      </div>

    </footer>
  );
};

export default Footer;
