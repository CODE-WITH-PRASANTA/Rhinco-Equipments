
import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  ArrowRight,
  Send,
  Sprout,
  Leaf,
  ChevronRight,
  MessageCircle,
} from "lucide-react";

import "./Footer.css";
import logo from "../../assets/Rhino-logo-removebg-preview.png";

// Social media icons using inline SVG
const SocialIcon = ({ name }) => {
  const icons = {
    facebook: (
      <path
        d="M13.5 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.5 1.6-1.5h1.6V3.9c-.8-.1-1.7-.2-2.5-.2-2.5 0-4.2 1.5-4.2 4.3V10H7.2v3h2.8v8h3.5Z"
        fill="currentColor"
        stroke="none"
      />
    ),

    instagram: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle
          cx="17.5"
          cy="6.5"
          r="0.8"
          fill="currentColor"
          stroke="none"
        />
      </>
    ),

    linkedin: (
      <>
        <path d="M5 8.5V19M5 5.5v.1M10 10v9M10 13c0-2 1-3 3-3s3 1 3 3v6" />
        <circle cx="5" cy="5.5" r="1" fill="currentColor" stroke="none" />
      </>
    ),

    youtube: (
      <>
        <path d="M22 12s0-4-1-5-9-1-9-1-8 0-9 1-1 5-1 5 0 4 1 5 9 1 9 1 8 0 9-1 1-5 1-5Z" />
        <path d="m10 9 5 3-5 3V9Z" fill="currentColor" stroke="none" />
      </>
    ),
  };

  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {icons[name]}
    </svg>
  );
};

const Footer = () => {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterMessage, setNewsletterMessage] = useState("");

  const handleNewsletter = (e) => {
    e.preventDefault();

    if (!newsletterEmail.trim()) {
      setNewsletterMessage("Please enter your email address.");
      return;
    }

    setNewsletterMessage(
      "Thank you! Newsletter integration is pending."
    );
    setNewsletterEmail("");
  };

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
      <div className="Footer-main">
        <div className="Footer-container">
          {/* Company Information */}
          <div className="Footer-company">
            <Link to="/" className="Footer-logo-link">
              <img
                src={logo}
                alt="Farmtech Agro"
                className="Footer-logo"
              />
            </Link>

            <p className="Footer-company-description">
              Farmtech Agro is committed to supporting farmers with
              quality agricultural products, modern farming solutions,
              and reliable services. Growing together for a better
              agricultural future.
            </p>

            <div className="Footer-socials">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
              >
                <SocialIcon name="facebook" />
              </a>

              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
              >
                <SocialIcon name="instagram" />
              </a>

              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
              >
                <SocialIcon name="linkedin" />
              </a>

              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
              >
                <SocialIcon name="youtube" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="Footer-column">
            <h3 className="Footer-heading">Quick Links</h3>

            <ul className="Footer-link-list">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <Link to={link.path}>
                    <ChevronRight size={15} />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Products */}
          <div className="Footer-column">
            <h3 className="Footer-heading">Our Products</h3>

            <ul className="Footer-link-list">
              {productLinks.map((link, index) => (
                <li key={index}>
                  <Link to={link.path}>
                    <ChevronRight size={15} />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Support */}
          <div className="Footer-column">
            <h3 className="Footer-heading">Customer Support</h3>

            <ul className="Footer-link-list">
              {supportLinks.map((link, index) => (
                <li key={index}>
                  <Link to={link.path}>
                    <ChevronRight size={15} />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Information */}
          <div className="Footer-column Footer-contact-column">
            <h3 className="Footer-heading">Get In Touch</h3>

            <div className="Footer-contact-item">
              <span className="Footer-contact-icon">
                <MapPin size={19} />
              </span>
              <p>
                India
                <br />
                Serving Farmers Across India
              </p>
            </div>

            <div className="Footer-contact-item">
              <span className="Footer-contact-icon">
                <Phone size={18} />
              </span>
              <a href="tel:+91950661122">+91 950661122</a>
            </div>

            <div className="Footer-contact-item">
              <span className="Footer-contact-icon">
                <Mail size={18} />
              </span>
              <a href="mailto:farmtechagroindia@gmail.com">
                farmtechagroindia@gmail.com
              </a>
            </div>

            <div className="Footer-contact-item">
              <span className="Footer-contact-icon">
                <Clock size={18} />
              </span>
              <p>
                Monday - Saturday
                <br />
                9:00 AM - 6:00 PM
              </p>
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="Footer-newsletter">
          <div className="Footer-newsletter-content">
            <div className="Footer-newsletter-icon">
              <Sprout size={28} />
            </div>

            <div className="Footer-newsletter-text">
              <h3>Stay Connected With Farmtech Agro</h3>
              <p>
                Subscribe to receive agricultural updates, product
                information and farming tips.
              </p>
            </div>
          </div>

          <form
            className="Footer-newsletter-form"
            onSubmit={handleNewsletter}
          >
            <input
              type="email"
              placeholder="Enter your email address"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              required
            />

            <button type="submit">
              Subscribe
              <Send size={16} />
            </button>

            {newsletterMessage && (
              <p className="Footer-newsletter-message">
                {newsletterMessage}
              </p>
            )}
          </form>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="Footer-bottom">
        <div className="Footer-bottom-container">
          <p className="Footer-copyright">
            © {new Date().getFullYear()} Farmtech Agro. All Rights Reserved.
          </p>

          <div className="Footer-bottom-center">
            <Leaf size={15} />
            <span>Growing Together, Naturally</span>
          </div>

          <p className="Footer-developed">
            Developed with care by{" "}
            <a
              href="https://prwebstock.com/"
              target="_blank"
              rel="noreferrer"
            >
              PR WEBSTOCK
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
