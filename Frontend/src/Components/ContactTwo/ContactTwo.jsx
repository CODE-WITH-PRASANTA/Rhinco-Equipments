
import React, { useState } from "react";
import {
  UserRound,
  Mail,
  BookOpen,
  MessageSquare,
  Send,
  Leaf,
  CheckCircle2,
  Headset,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";

import Farmer from "../../assets/Farmer.png";
import "./ContactTwo.css";
import { API_ENDPOINTS } from "../../config/api";

const ContactTwo = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setSuccess(false);
    setErrorMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch(API_ENDPOINTS.ENQUIRIES, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: "Not Provided",
          subject: formData.subject || "General Contact Inquiry",
          message: formData.message,
          enquiryType: "General Contact",
          productOrEquipment: "Website Contact Form",
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(true);
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: "",
        });
      } else {
        setErrorMessage(data.message || "Failed to submit enquiry. Please try again.");
      }
    } catch (err) {
      console.error("Enquiry submission failed:", err);
      setErrorMessage("Network error: Could not reach the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="ContactTwo-section" id="send-message">

      <div className="ContactTwo-container">

        {/* LEFT IMAGE SECTION */}

        <div className="ContactTwo-visual">

          <div className="ContactTwo-image-bg"></div>

          <div className="ContactTwo-image-decoration">
            <Leaf size={35} />
          </div>

          <div className="ContactTwo-image">

            <img
              src={Farmer}
              alt="Farmer representing agriculture and our community"
              loading="lazy"
            />

          </div>

          {/* FLOATING EXPERIENCE CARD */}

          <div className="ContactTwo-floating-card">

            <div className="ContactTwo-floating-icon">
              <Headset size={23} />
            </div>

            <div>
              <strong>We're Here To Help</strong>
              <span>Let's grow together</span>
            </div>

            <ArrowUpRight
              className="ContactTwo-floating-arrow"
              size={20}
            />

          </div>

          {/* IMAGE BOTTOM BADGE */}

          <div className="ContactTwo-image-caption">
            <div className="ContactTwo-caption-icon">
              <ShieldCheck size={20} />
            </div>

            <div>
              <strong>Connecting People</strong>
              <span>Creating Better Opportunities</span>
            </div>
          </div>

        </div>

        {/* RIGHT CONTACT CONTENT */}

        <div className="ContactTwo-content">

          {/* SECTION LABEL */}

          <div className="ContactTwo-label">
            <span className="ContactTwo-label-line"></span>
            <Leaf size={16} />
            <span>GET IN TOUCH</span>
          </div>

          {/* HEADING */}

          <div className="ContactTwo-heading">

            <h2>
              Let's Start A
              <span> Conversation.</span>
            </h2>

            <p className="ContactTwo-description">
              Have a question, an idea, or need assistance?
              We'd love to hear from you. Send us a message
              and our team will get back to you.
            </p>

          </div>

          {/* FORM */}

          <form
            className="ContactTwo-form"
            onSubmit={handleSubmit}
          >

            <div className="ContactTwo-form-heading">
              <div>
                <h3>Send Us A Message</h3>
                <p>Fill in your details below.</p>
              </div>

              <div className="ContactTwo-form-icon">
                <MessageSquare size={22} />
              </div>
            </div>

            {/* SUCCESS MESSAGE */}

            {success && (
              <div className="ContactTwo-success">
                <CheckCircle2 size={21} />
                <span>
                  Your message has been submitted successfully! Our team will contact you shortly.
                </span>
              </div>
            )}

            {/* ERROR MESSAGE */}
            {errorMessage && (
              <div style={{ padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#b91c1c', fontSize: '14px', marginBottom: '16px' }}>
                {errorMessage}
              </div>
            )}

            {/* NAME + EMAIL */}

            <div className="ContactTwo-fields">

              <div className="ContactTwo-input-group">

                <label htmlFor="contacttwo-name">
                  Your Name <span>*</span>
                </label>

                <div className="ContactTwo-input-wrapper">

                  <UserRound size={19} />

                  <input
                    id="contacttwo-name"
                    type="text"
                    name="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    autoComplete="name"
                    required
                  />

                </div>

              </div>

              <div className="ContactTwo-input-group">

                <label htmlFor="contacttwo-email">
                  Email Address <span>*</span>
                </label>

                <div className="ContactTwo-input-wrapper">

                  <Mail size={19} />

                  <input
                    id="contacttwo-email"
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="email"
                    required
                  />

                </div>

              </div>

            </div>

            {/* SUBJECT */}

            <div className="ContactTwo-input-group">

              <label htmlFor="contacttwo-subject">
                Subject
              </label>

              <div className="ContactTwo-input-wrapper">

                <BookOpen size={19} />

                <input
                  id="contacttwo-subject"
                  type="text"
                  name="subject"
                  placeholder="What is this regarding?"
                  value={formData.subject}
                  onChange={handleChange}
                />

              </div>

            </div>

            {/* MESSAGE */}

            <div className="ContactTwo-input-group">

              <label htmlFor="contacttwo-message">
                Your Message <span>*</span>
              </label>

              <div className="ContactTwo-textarea-wrapper">

                <MessageSquare size={19} />

                <textarea
                  id="contacttwo-message"
                  name="message"
                  placeholder="Write your message here..."
                  value={formData.message}
                  onChange={handleChange}
                  required
                />

              </div>

            </div>

            {/* SUBMIT */}

            <button
              type="submit"
              className="ContactTwo-submit"
              disabled={loading}
              style={{ opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              <span>{loading ? "Sending..." : "Send Your Message"}</span>
              <Send size={19} />
            </button>

            {/* FORM FOOTER */}

            <div className="ContactTwo-form-footer">
              <ShieldCheck size={16} />

              <span>
                Your information is safe with us.
              </span>
            </div>

          </form>

        </div>

      </div>

    </section>
  );
};

export default ContactTwo;
