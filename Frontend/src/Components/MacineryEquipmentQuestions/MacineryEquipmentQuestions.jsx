
import React, { useState } from "react";
import "./MacineryEquipmentQuestions.css";

const MacineryEquipmentQuestions = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const questions = [
    {
      question:
        "What is the price of the Fieldking Ranveer Rotary Tiller?",
      answer:
        "Fieldking Ranveer Rotary Tiller Price is ₹1,51,000 – ₹1,81,200 in India. The final price may vary depending on the model, location, and dealer.",
    },
    {
      question:
        "What are the uses of Fieldking Ranveer Rotary Tiller?",
      answer:
        "The Fieldking Ranveer Rotary Tiller is used for preparing soil before sowing. It helps in breaking soil clods, mixing crop residues, improving soil preparation, and creating a suitable seedbed for different agricultural crops.",
    },
    {
      question:
        "Where can I buy Fieldking Ranveer Rotary Tiller in India?",
      answer:
        "You can purchase the Fieldking Ranveer Rotary Tiller from an authorized Fieldking dealer in India. Contact your nearest dealer to check availability, pricing, and delivery options.",
    },
    {
      question:
        "Where can I get complete details of Fieldking Ranveer Rotary Tiller?",
      answer:
        "You can get complete information about the Fieldking Ranveer Rotary Tiller from our machinery specifications section or by contacting your nearest authorized Fieldking dealer for specifications, features, and pricing.",
    },
  ];

  const toggleQuestion = (index) => {
    setActiveIndex((prevIndex) =>
      prevIndex === index ? null : index
    );
  };

  return (
    <section className="machinery-questions-section">
      <div className="machinery-questions-container">

        {/* Heading */}
        <div className="machinery-questions-heading">
          <span className="machinery-questions-heading-line"></span>

          <h2>Frequently Asked Questions</h2>

          <p>
            Find answers to your questions about this machinery.
          </p>
        </div>

        {/* Questions */}
        <div className="machinery-questions-list">
          {questions.map((item, index) => {
            const isOpen = activeIndex === index;

            return (
              <div
                className={`machinery-question-item ${
                  isOpen ? "active" : ""
                }`}
                key={index}
              >
                {/* Question */}
                <button
                  type="button"
                  className="machinery-question-button"
                  onClick={() => toggleQuestion(index)}
                  aria-expanded={isOpen}
                  aria-controls={`machinery-answer-${index}`}
                >
                  <span className="machinery-question-text">
                    <span className="machinery-question-label">
                      Que.
                    </span>

                    {item.question}
                  </span>

                  <span
                    className={`machinery-question-icon ${
                      isOpen ? "open" : ""
                    }`}
                    aria-hidden="true"
                  >
                    <span className="machinery-icon-horizontal"></span>
                    <span className="machinery-icon-vertical"></span>
                  </span>
                </button>

                {/* Answer */}
                <div
                  id={`machinery-answer-${index}`}
                  className="machinery-answer-wrapper"
                  aria-hidden={!isOpen}
                >
                  <div className="machinery-answer-inner">
                    <div className="machinery-answer-content">
                      <span className="machinery-answer-label">
                        Ans.
                      </span>

                      <p>{item.answer}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Disclaimer */}
        <div className="machinery-questions-disclaimer">
          <h3>Disclaimer:</h3>

          <p>
            The information and features mentioned above are based on
            details shared by Fieldking or available product reports.
            For current features, specifications, and available
            variants, customers are advised to contact their nearest
            authorized Fieldking dealer.
          </p>

          <p>
            Prices shown are indicative showroom prices and may vary
            depending on location, buying conditions, and dealer
            availability. For the exact on-road price, kindly contact
            your nearest Fieldking tractor dealer.
          </p>
        </div>

      </div>
    </section>
  );
};

export default MacineryEquipmentQuestions;
