
import React, { useState } from "react";
import {
  Plus,
  Minus,
  ArrowUpRight,
  MessageCircle,
  Leaf,
  Send,
  CheckCircle2,
} from "lucide-react";

import "./FandQ.css";

const faqData = [
  {
    question: "We bring together the best to the world?",
    answer:
      "We bring together the best people, ideas, and solutions to deliver meaningful results. Our goal is to create experiences that inspire, connect, and make a positive difference.",
  },
  {
    question: "How can I submit a sponsorship request?",
    answer:
      "You can submit your sponsorship request by contacting our team through the contact form. Share your proposal and requirements, and our team will review your request and get back to you.",
  },
  {
    question: "What is the procedure to join your company?",
    answer:
      "You can contact our team with your details and requirements. We will guide you through the complete process and help you understand the next steps.",
  },
  {
    question: "How do you connect people and opportunities?",
    answer:
      "We connect talented people, innovative ideas, and meaningful opportunities to create better experiences and long-term relationships.",
  },
  {
    question: "What makes your company different from others?",
    answer:
      "Our commitment to quality, customer satisfaction, creativity, and reliable solutions makes us different. We believe in building lasting relationships through meaningful work.",
  },
  {
    question: "Why should a successful entrepreneur hire your team?",
    answer:
      "A successful entrepreneur hires skilled people to improve productivity, bring fresh ideas, solve challenges, and help the company achieve its long-term goals.",
  },
  {
    question: "How can I get more information about your services?",
    answer:
      "You can contact our team using the form. Share your requirements, and we will provide the necessary information and guidance.",
  },
];

const FandQ = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    question: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleToggle = (index) => {
    setActiveIndex((previousIndex) =>
      previousIndex === index ? null : index
    );
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

    setSubmitted(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    // Connect your backend API here before showing success.
    console.log("FAQ Contact Form:", formData);

    setSubmitted(true);

    setFormData({
      name: "",
      email: "",
      subject: "",
      question: "",
    });
  };

  return (
    <section className="faq-contact-section" id="faq">

      <div className="faq-contact-container">

        {/* SECTION HEADER */}

        <div className="faq-section-heading">

          <div className="faq-heading-tag">
            <Leaf size={17} />
            <span>HELP & SUPPORT</span>
          </div>

          <h2>
            Everything You
            <span> Need To Know.</span>
          </h2>

          <p>
            Find answers to common questions or get in touch
            with our team. We are always happy to help you.
          </p>

        </div>

        {/* MAIN CONTENT */}

        <div className="faq-main-grid">

          {/* LEFT FAQ */}

          <div className="faq-left">

            <div className="faq-list">

              {faqData.map((item, index) => {
                const isOpen = activeIndex === index;

                return (
                  <div
                    className={`faq-item ${
                      isOpen ? "faq-item-active" : ""
                    }`}
                    key={index}
                  >

                    <button
                      type="button"
                      className="faq-question"
                      onClick={() => handleToggle(index)}
                      aria-expanded={isOpen}
                    >

                      <span className="faq-number">
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <span className="faq-question-text">
                        {item.question}
                      </span>

                      <span className="faq-icon">
                        {isOpen ? (
                          <Minus size={19} />
                        ) : (
                          <Plus size={19} />
                        )}
                      </span>

                    </button>

                    <div
                      className={`faq-answer-wrapper ${
                        isOpen ? "faq-answer-open" : ""
                      }`}
                    >
                      <div className="faq-answer">
                        {item.answer}
                      </div>
                    </div>

                  </div>
                );
              })}

            </div>

            {/* FAQ BOTTOM NOTE */}

            <div className="faq-bottom-note">

              <div className="faq-note-icon">
                <MessageCircle size={22} />
              </div>

              <div className="faq-note-content">
                <h4>Still have questions?</h4>
                <p>
                  Can't find the answer you're looking for?
                  Send us your question.
                </p>
              </div>

              <ArrowUpRight className="faq-note-arrow" size={24} />

            </div>

          </div>

          {/* RIGHT CONTACT FORM */}

          <div className="faq-right">

            <div className="faq-form-header">

              <div className="faq-form-icon">
                <MessageCircle size={24} />
              </div>

              <span className="faq-form-label">
                LET'S TALK
              </span>

              <h3>
                Ask Your
                <span> Questions</span>
              </h3>

              <p>
                Have something on your mind? Fill out the form
                and our team will get back to you.
              </p>

            </div>

            {submitted && (
              <div className="faq-success-message">
                <CheckCircle2 size={20} />
                <span>
                  Your query has been submitted successfully!
                </span>
              </div>
            )}

            <form
              className="faq-contact-form"
              onSubmit={handleSubmit}
            >

              <div className="faq-form-row">

                <div className="faq-input-group">
                  <label htmlFor="faq-name">Your Name</label>

                  <input
                    id="faq-name"
                    type="text"
                    name="name"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="faq-input-group">
                  <label htmlFor="faq-email">Email Address</label>

                  <input
                    id="faq-email"
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

              </div>

              <div className="faq-input-group">
                <label htmlFor="faq-subject">Subject</label>

                <input
                  id="faq-subject"
                  type="text"
                  name="subject"
                  placeholder="What is this regarding?"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="faq-input-group">
                <label htmlFor="faq-question">Your Question</label>

                <textarea
                  id="faq-question"
                  name="question"
                  placeholder="Write your question here..."
                  value={formData.question}
                  onChange={handleChange}
                  required
                />
              </div>

              <button
                type="submit"
                className="faq-submit-btn"
              >
                <span>Send Your Message</span>
                <Send size={18} />
              </button>

              <div className="faq-form-footer">
                <Leaf size={15} />
                <span>We're here to help you every step of the way.</span>
              </div>

            </form>

          </div>

        </div>

      </div>

    </section>
  );
};

export default FandQ;
