
import React from "react";
import { Phone, Mail, Headphones } from "lucide-react";
import "./Topbar.css";

const Topbar = () => {
  return (
    <aside
      className="Topbar"
      aria-label="Quick contact information"
    >
      <div className="Topbar-container">

        {/* Left: Helpline */}
        <div className="Topbar-contact">

          <div className="Topbar-badge">
            <span className="Topbar-badge-icon">
              <Headphones size={14} />
            </span>
            <span>24/7 HELPLINE</span>
          </div>

          {/* Primary Phone */}
          <a
            href="tel:+919337092269"
            className="Topbar-contact-item primary-tel"
            title="Direct Authorized Dealer Helpline"
          >
            <span className="Topbar-icon-box">
              <Phone size={14} />
            </span>
            <span className="Topbar-contact-text">
              <span className="Topbar-label">Call Us</span>
              <span className="Topbar-value">+91 9337092269</span>
            </span>
          </a>

          <span className="Topbar-divider" />

          {/* Secondary Phone */}
          <a
            href="tel:+919583195951"
            className="Topbar-contact-item secondary-tel"
            title="Sales Department"
          >
            <span className="Topbar-icon-box">
              <Phone size={14} />
            </span>
            <span className="Topbar-contact-text">
              <span className="Topbar-label">Sales Enquiry</span>
              <span className="Topbar-value">+91 9583195951</span>
            </span>
          </a>

        </div>

        {/* Right: Official Email */}
        <div className="Topbar-right">

          <a
            href="mailto:farmershelpline.in@gmail.com"
            className="Topbar-contact-item Topbar-email"
            title="Official Email"
          >
            <span className="Topbar-icon-box">
              <Mail size={15} />
            </span>

            <span className="Topbar-contact-text">
              <span className="Topbar-label">Email Us</span>
              <span className="Topbar-value">
                farmershelpline.in@gmail.com
              </span>
            </span>
          </a>

          <span className="Topbar-status">
            <span className="Topbar-status-dot" />
            We're Available
          </span>

        </div>

      </div>
    </aside>
  );
};

export default Topbar;
