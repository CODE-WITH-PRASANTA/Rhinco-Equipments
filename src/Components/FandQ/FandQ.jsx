
import React, { useState } from "react";
import "./FandQ.css";

const faqData = [
  {
    question: "We bring together the best to the world?",
    answer:
      "We bring together the best people, ideas, and solutions to deliver meaningful results to the world.",
  },
  {
    question: "Submit your sponsorship request easy way?",
    answer:
      "You can submit your sponsorship request by contacting our team through the contact form. Our team will review your request and get back to you.",
  },
  {
    question: "What is the procedure to join with your company?",
    answer:
      "You can contact our team with your details and requirements. We will guide you through the process of joining our company.",
  },
  {
    question: "We bring together the best people to the world?",
    answer:
      "We connect talented people and innovative ideas to create better opportunities and solutions.",
  },
  {
    question: "What makes you special from others?",
    answer:
      "Our commitment to quality, customer satisfaction, and reliable solutions makes us different.",
  },
  {
    question: "Why would a successful entrepreneur hire?",
    answer:
      "Mistaken idea of denouncing pleasure and praising pain was born and I will give you a complete account of the system, and expound the actual teachings of the great explorer of the truth.",
  },
  {
    question: "Why would a successful entrepreneur hire?",
    answer:
      "A successful entrepreneur hires skilled people to improve productivity, bring new ideas, and help the company achieve its goals.",
  },
];

const FandQ = () => {
  const [activeIndex, setActiveIndex] = useState(5);

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

    setSubmitted(true);

    setFormData({
      name: "",
      email: "",
      subject: "",
      question: "",
    });
  };

  return (
    <section className="faq-contact-section">
      <div className="faq-contact-container">

        {/* LEFT FAQ SECTION */}
        <div className="faq-left">

          <div className="faq-list">
            {faqData.map((item, index) => {
              const isOpen = activeIndex === index;

              return (
                <div
                  className={`faq-item ${isOpen ? "faq-item-active" : ""}`}
                  key={index}
                >
                  <button
                    type="button"
                    className="faq-question"
                    onClick={() => handleToggle(index)}
                    aria-expanded={isOpen}
                  >
                    <span>{item.question}</span>

                    <span className="faq-icon">
                      {isOpen ? "✓" : "×"}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="faq-answer">
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>

        {/* RIGHT FORM SECTION */}
        <div className="faq-right">

          <h2>Ask Your Questions</h2>

          {submitted && (
            <div className="faq-success-message">
              Your query has been submitted successfully!
            </div>
          )}

          <form className="faq-contact-form" onSubmit={handleSubmit}>

            <div className="faq-form-row">

              <input
                type="text"
                name="name"
                placeholder="Your Name"
                value={formData.name}
                onChange={handleChange}
                required
              />

              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
              />

            </div>

            <input
              type="text"
              name="subject"
              placeholder="Subject"
              value={formData.subject}
              onChange={handleChange}
              required
            />

            <textarea
              name="question"
              placeholder="Your Questions..."
              value={formData.question}
              onChange={handleChange}
              required
            />

            <button type="submit">
              Submit Now
            </button>

          </form>

        </div>

      </div>
    </section>
  );
};

export default FandQ;
