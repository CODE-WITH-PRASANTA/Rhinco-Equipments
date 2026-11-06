import React from "react";
import FirstImg from "../../assets/ContactoneFirst.jpeg";
import SecondImg from "../../assets/ContactoneSecond.jpeg";
import "./ContactOne.css";

const contactLocations = [
  {
    id: 1,
    city: "Ludhiana, Punjab",
    image: FirstImg,
    address: "Ferozepur Road, Near PAU Gate",
    location: "Ludhiana, Punjab 141001, India.",
    phone: "+91 98765 43210",
    email: "Machinery@Support.com",
  },
  {
    id: 2,
    city: "Bhubaneswar, Odisha",
    image: SecondImg,
    address: "Janpath Road, Near Agriculture Office",
    location: "Bhubaneswar, Odisha 751001, India.",
    phone: "+91 98765 12340",
    email: "Machinery@Support.com",
  },
];

const ContactOne = () => {
  return (
    <section className="contactone-section">
      <div className="contactone-container">
        <div className="contactone-heading">
          <h2>Get Touch With Us</h2>
          <p>
            We have 74 branches in US and 145 branches in world wide, you can
            reach any branch at your desk, our experts will help you 24/7.
          </p>
        
{/* 
        <div className="contactone-dots">
          <span className="contactone-dot contactone-dot-active"></span>
          <span className="contactone-dot"></span>
          <span className="contactone-dot"></span>
          <span className="contactone-dot"></span> */}
        </div>

        <div className="contactone-locations">
          {contactLocations.map((location) => (
            <div className="contactone-location" key={location.id}>
              <div className="contactone-image">
                <img src={location.image} alt={location.city} />
              </div>

              <div className="contactone-details">
                <div className="contactone-line"></div>

                <h3>{location.city}</h3>

                {/* Address */}
                <div className="contactone-info">
                  <div className="contactone-info-icon">
                    <svg
                      viewBox="0 0 32 32"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M16 29S27 19.5 27 12.5C27 6.7 22.1 2 16 2S5 6.7 5 12.5C5 19.5 16 29 16 29Z"
                        stroke="currentColor"
                        strokeWidth="1.2"
                      />
                      <circle
                        cx="16"
                        cy="12"
                        r="4"
                        stroke="currentColor"
                        strokeWidth="1.2"
                      />
                      <path
                        d="M8 7L12 9L16 7L20 9L24 7M8 18L12 16L16 18L20 16L24 18"
                        stroke="currentColor"
                        strokeWidth="1"
                      />
                    </svg>
                  </div>

                  <div>
                    <strong>{location.address}</strong>
                    <span>{location.location}</span>
                  </div>
                </div>

                {/* Phone */}
                <div className="contactone-info">
                  <div className="contactone-info-icon">
                    <svg
                      viewBox="0 0 32 32"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M7 12C7 6.8 10.8 3 16 3C21.2 3 25 6.8 25 12V17H22V12C22 8.5 19.5 6 16 6C12.5 6 10 8.5 10 12V17H7V12Z"
                        stroke="currentColor"
                        strokeWidth="1.2"
                      />
                      <path
                        d="M7 13H10V19H7C5.9 19 5 18.1 5 17V15C5 13.9 5.9 13 7 13Z"
                        stroke="currentColor"
                        strokeWidth="1.2"
                      />
                      <path
                        d="M22 13H25C26.1 13 27 13.9 27 15V17C27 18.1 26.1 19 25 19H22V13Z"
                        stroke="currentColor"
                        strokeWidth="1.2"
                      />
                      <circle
                        cx="16"
                        cy="13"
                        r="5"
                        stroke="currentColor"
                        strokeWidth="1.2"
                      />
                      <path
                        d="M12 21C12 21 13 23 16 23C19 23 20 21 20 21M5 29C5 25 9 23 16 23C23 23 27 25 27 29H5Z"
                        stroke="currentColor"
                        strokeWidth="1.2"
                      />
                    </svg>
                  </div>

                  <div>
                    <strong>Call Us On</strong>
                    <a href={`tel:${location.phone.replace(/[^\d+]/g, "")}`}>
                      {location.phone}
                    </a>
                  </div>
                </div>

                {/* Email */}
                <div className="contactone-info">
                  <div className="contactone-info-icon">
                    <svg
                      viewBox="0 0 32 32"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M29 3L3 14L13 18L17 29L29 3Z"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M13 18L29 3M13 18L11 27L17 21M17 29L17 21"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>

                  <div>
                    <strong>Mail Us at</strong>
                    <a href={`mailto:${location.email}`}>
                      {location.email}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ContactOne;