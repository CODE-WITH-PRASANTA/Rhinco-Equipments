import React, { useState } from "react";
import "./ContactTwo.css";

// Farmer Image
import Farmer from "../../assets/Farmer.png";

const ContactTwo = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [success, setSuccess] = useState(false);

  // Handle Input Changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setSuccess(false);
  };

  // Handle Form Submit
  const handleSubmit = (e) => {
    e.preventDefault();

    setSuccess(true);

    setFormData({
      name: "",
      email: "",
      subject: "",
      message: "",
    });
  };

  return (
    <section className="ContactTwo-section">
      <div className="ContactTwo-container">

        {/* Farmer Image */}
        <div className="ContactTwo-image">
          <img
            src={Farmer}
            alt="Farmer"
          />
        </div>

        {/* Contact Content */}
        <div className="ContactTwo-content">

          <h2>Send Message Us</h2>

          <p className="ContactTwo-description">
            Don’t hesitate to ask us something, Our customer support
            team always ready to help you,they will support you 24/7.
          </p>

          {/* Contact Form */}
          <form
            className="ContactTwo-form"
            onSubmit={handleSubmit}
          >

            <div className="ContactTwo-fields">

              {/* Left Inputs */}
              <div className="ContactTwo-inputs">

                <input
                  type="text"
                  name="name"
                  placeholder="Your Name*"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />

                <input
                  type="email"
                  name="email"
                  placeholder="Email Address*"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />

                <input
                  type="text"
                  name="subject"
                  placeholder="Subject"
                  value={formData.subject}
                  onChange={handleChange}
                />

              </div>

              {/* Message */}
              <div className="ContactTwo-message">

                <textarea
                  name="message"
                  placeholder="Massage"
                  value={formData.message}
                  onChange={handleChange}
                  required
                />

              </div>

            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="ContactTwo-submit"
            >
              Submit Now
            </button>

            {/* Success Message */}
            {success && (
              <div className="ContactTwo-success">
                <span>✓</span>
                Your message has been submitted successfully!
              </div>
            )}

          </form>

        </div>

      </div>

      {/* Scroll To Top */}
      

    </section>
  );
};

export default ContactTwo;