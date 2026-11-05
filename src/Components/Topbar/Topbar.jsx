
import React from "react";
import { Phone, Mail } from "lucide-react";
import "./Topbar.css";

const Topbar = () => {
  const socialLinks = [
    {
      name: "Facebook",
      url: "https://facebook.com/",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.3-1.5 1.6-1.5h1.7V3.6c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.1H7.3V13h2.8v8z"/>
        </svg>
      ),
    },
    {
      name: "Twitter",
      url: "https://twitter.com/",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M22 5.9a8 8 0 0 1-2.4.7 4.2 4.2 0 0 0 1.8-2.3 8.4 8.4 0 0 1-2.7 1 4.2 4.2 0 0 0-7.2 3.8 11.9 11.9 0 0 1-8.6-4.4 4.2 4.2 0 0 0 1.3 5.6 4.2 4.2 0 0 1-1.9-.5v.1a4.2 4.2 0 0 0 3.4 4.1 4.2 4.2 0 0 1-1.9.1 4.2 4.2 0 0 0 3.9 2.9A8.5 8.5 0 0 1 2.5 19a12 12 0 0 0 18.4-10.1v-.5A8.6 8.6 0 0 0 22 5.9z"/>
        </svg>
      ),
    },
    {
      name: "Pinterest",
      url: "https://pinterest.com/",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2a10 10 0 0 0-3.6 19.3c0-.8 0-1.8.2-2.7l1.3-5.5s-.3-.6-.3-1.5c0-1.4.8-2.5 1.9-2.5.9 0 1.3.7 1.3 1.5 0 .9-.6 2.3-.9 3.6-.3 1.1.5 2 1.6 2 1.9 0 3.4-2 3.4-4.9 0-2.5-1.8-4.3-4.4-4.3-3 0-4.8 2.2-4.8 4.6 0 .9.3 1.9.8 2.4.1.2.2.3.1.5l-.3 1c-.1.3-.2.4-.5.3-1.3-.6-2.1-2.3-2.1-3.8 0-3.1 2.3-6.7 7-6.7 3.7 0 6.5 2.7 6.5 6.2 0 3.7-2.3 6.7-5.5 6.7-1.1 0-2.1-.6-2.5-1.2l-.7 2.7c-.3 1-.9 2-1.3 2.7A10 10 0 1 0 12 2z"/>
        </svg>
      ),
    },
    {
      name: "LinkedIn",
      url: "https://linkedin.com/",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M5.2 3.5a2.1 2.1 0 1 1 0 4.2 2.1 2.1 0 0 1 0-4.2zM3.4 9h3.6v11.5H3.4zm5.8 0h3.4v1.6h.1a3.8 3.8 0 0 1 3.4-1.9c3.7 0 4.4 2.4 4.4 5.5v6.3h-3.6v-5.6c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9v5.7H9.2z"/>
        </svg>
      ),
    },
    {
      name: "Telegram",
      url: "https://telegram.org/",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M21.8 3.2 18.5 20c-.2 1.2-.9 1.5-1.8.9l-5-3.7-2.4 2.3c-.3.3-.5.5-1 .5l.4-5.1 9.3-8.4c.4-.4-.1-.6-.6-.2L5.9 13.6 1 12c-1.1-.4-1.1-1.1.2-1.6L20.3 3c.9-.3 1.7.2 1.5.2z"/>
        </svg>
      ),
    },
  ];

  return (
    <div className="Topbar">
      <div className="Topbar-container">

        {/* Contact Information */}
        <div className="Topbar-contact">

          <a href="tel:+91950661122" className="Topbar-contact-item">
            <Phone />
            <span>(+91) 950661122</span>
          </a>

          <a href="tel:+91995665544" className="Topbar-contact-item">
            <Phone />
            <span>(+91) 995665544</span>
          </a>

          <a href="tel:+916388870826" className="Topbar-contact-item">
            <Phone />
            <span>(+91) 6388870826</span>
          </a>

          <a
            href="mailto:farmtechagroindia@gmail.com"
            className="Topbar-contact-item Topbar-email"
          >
            <Mail />
            <span>farmtechagroindia@gmail.com</span>
          </a>

        </div>

        {/* Social Media */}
        <div className="Topbar-social">
          {socialLinks.map((social) => (
            <a
              key={social.name}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={social.name}
              className="Topbar-social-link"
            >
              {social.icon}
            </a>
          ))}
        </div>

      </div>
    </div>
  );
};

export default Topbar;
