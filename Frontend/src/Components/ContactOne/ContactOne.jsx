
import React from "react";
import {
  MapPin,
  Phone,
  Mail,
  ArrowUpRight,
  Navigation,
  Building2,
  Globe2,
} from "lucide-react";

import FirstImg from "../../assets/ContactoneFirst.jpeg";
import SecondImg from "../../assets/ContactoneSecond.jpeg";

import "./ContactOne.css";

const contactLocations = [
  {
    id: 1,
    city: "Ludhiana",
    state: "Punjab, India",
    image: FirstImg,
    address: "Ferozepur Road, Near PAU Gate",
    location: "Ludhiana, Punjab 141001, India",
    phone: "+91 98765 43210",
    email: "Machinery@Support.com",
    mapUrl:
      "https://www.google.com/maps/search/?api=1&query=Ferozepur+Road+Ludhiana+Punjab",
    branch: "NORTH INDIA OFFICE",
    number: "01",
  },
  {
    id: 2,
    city: "Bhubaneswar",
    state: "Odisha, India",
    image: SecondImg,
    address: "Janpath Road, Near Agriculture Office",
    location: "Bhubaneswar, Odisha 751001, India",
    phone: "+91 98765 12340",
    email: "Machinery@Support.com",
    mapUrl:
      "https://www.google.com/maps/search/?api=1&query=Janpath+Road+Bhubaneswar+Odisha",
    branch: "EAST INDIA OFFICE",
    number: "02",
  },
];

const ContactOne = () => {
  return (
    <section className="contactone-section" id="locations">

      {/* BACKGROUND DECORATION */}

      <div className="contactone-bg-circle contactone-bg-circle-one"></div>
      <div className="contactone-bg-circle contactone-bg-circle-two"></div>

      <div className="contactone-container">

        {/* SECTION HEADER */}

        <div className="contactone-heading">

          <div className="contactone-subtitle">
            <span className="contactone-subtitle-line"></span>
            <Globe2 size={17} />
            <span>OUR LOCATIONS</span>
            <span className="contactone-subtitle-line"></span>
          </div>

          <h2>
            Get In Touch
            <span> With Us</span>
          </h2>

          <p>
            Wherever you are, we're always within reach.
            Connect with our offices and let our team help
            you with the right solutions for your needs.
          </p>

        </div>

        {/* LOCATION CARDS */}

        <div className="contactone-locations">

          {contactLocations.map((location) => (

            <article
              className="contactone-location"
              key={location.id}
            >

              {/* IMAGE */}

              <div className="contactone-image">

                <img
                  src={location.image}
                  alt={`${location.city} office`}
                  loading="lazy"
                />

                <div className="contactone-image-overlay"></div>

                <div className="contactone-branch-label">
                  <Building2 size={15} />
                  <span>{location.branch}</span>
                </div>

                <div className="contactone-image-number">
                  {location.number}
                </div>

                <div className="contactone-image-caption">
                  <span>OUR OFFICE</span>
                  <h3>{location.city}</h3>
                </div>

              </div>

              {/* DETAILS */}

              <div className="contactone-details">

                <div className="contactone-details-top">

                  <div>
                    <span className="contactone-location-tag">
                      <MapPin size={14} />
                      {location.state}
                    </span>

                    <h3>{location.city}</h3>
                  </div>

                  <div className="contactone-location-icon">
                    <ArrowUpRight size={23} />
                  </div>

                </div>

                <div className="contactone-divider"></div>

                {/* ADDRESS */}

                <div className="contactone-info">

                  <div className="contactone-info-icon">
                    <MapPin size={20} />
                  </div>

                  <div className="contactone-info-content">
                    <span>OUR ADDRESS</span>
                    <strong>{location.address}</strong>
                    <p>{location.location}</p>
                  </div>

                </div>

                {/* PHONE */}

                <div className="contactone-info">

                  <div className="contactone-info-icon">
                    <Phone size={20} />
                  </div>

                  <div className="contactone-info-content">
                    <span>PHONE NUMBER</span>
                    <a
                      href={`tel:${location.phone.replace(/[^\d+]/g, "")}`}
                    >
                      {location.phone}
                    </a>
                  </div>

                </div>

                {/* EMAIL */}

                <div className="contactone-info">

                  <div className="contactone-info-icon">
                    <Mail size={20} />
                  </div>

                  <div className="contactone-info-content">
                    <span>EMAIL ADDRESS</span>
                    <a href={`mailto:${location.email}`}>
                      {location.email}
                    </a>
                  </div>

                </div>

                {/* MAP BUTTON */}

                <a
                  href={location.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contactone-map-btn"
                >
                  <span>Get Directions</span>
                  <Navigation size={17} />
                </a>

              </div>

            </article>

          ))}

        </div>

        {/* BOTTOM CTA */}

        <div className="contactone-bottom">

          <div className="contactone-bottom-left">

            <div className="contactone-bottom-icon">
              <Globe2 size={25} />
            </div>

            <div>
              <h3>Looking for the right assistance?</h3>
              <p>
                Our team is ready to answer your questions
                and help you find the right solution.
              </p>
            </div>

          </div>

          <a
            href="#faq"
            className="contactone-bottom-btn"
          >
            Contact Our Team
            <ArrowUpRight size={19} />
          </a>

        </div>

      </div>

    </section>
  );
};

export default ContactOne;
