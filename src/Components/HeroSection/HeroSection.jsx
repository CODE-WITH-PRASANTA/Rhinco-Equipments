
import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Sprout,
  Leaf,
  Tractor,
} from "lucide-react";

import "./HeroSection.css";

import home1 from "../../assets/home-1.jpg";
import home2 from "../../assets/home-2.jpg";
import home3 from "../../assets/home-3.jpg";
import home4 from "../../assets/home-4.jpg";

const heroSlides = [
  {
    image: home1,
    eyebrow: "WELCOME TO FARMTECH AGRO",
    title: "Growing a Better Future Through Agriculture",
    description:
      "Connecting modern farming solutions with the people who make agriculture possible. Together, let's build a greener and more sustainable tomorrow.",
    button: "Explore Our Solutions",
    icon: <Sprout size={19} />,
  },
  {
    image: home2,
    eyebrow: "SUPPORTING OUR FARMERS",
    title: "Honoring the Hands That Feed Our Nation",
    description:
      "Empowering farmers with reliable agricultural products, innovative solutions, and the support they need to grow with confidence.",
    button: "Discover Our Mission",
    icon: <Leaf size={19} />,
  },
  {
    image: home3,
    eyebrow: "SMART FARMING SOLUTIONS",
    title: "Modern Technology for Modern Agriculture",
    description:
      "Discover efficient farming equipment and innovative machinery designed to make agricultural work easier, faster, and more productive.",
    button: "Explore Machinery",
    icon: <Tractor size={19} />,
  },
  {
    image: home4,
    eyebrow: "A GREENER TOMORROW",
    title: "Nurturing Nature, Growing Prosperity",
    description:
      "From healthy crops to sustainable farming practices, we are committed to creating opportunities for a stronger agricultural future.",
    button: "Know More About Us",
    icon: <Sprout size={19} />,
  },
];

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Automatically change slides every 3 seconds
  useEffect(() => {
    const sliderInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 3000);

    return () => clearInterval(sliderInterval);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + heroSlides.length) % heroSlides.length
    );
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <section className="HeroSection">
      {/* Background Slider */}
      <div className="HeroSection-slider">
        <div
          className="HeroSection-track"
          style={{
            transform: `translateX(-${currentSlide * 100}%)`,
          }}
        >
          {heroSlides.map((slide, index) => (
            <div className="HeroSection-slide" key={index}>
              <img
                src={slide.image}
                alt={slide.title}
                className="HeroSection-image"
              />

              <div className="HeroSection-overlay"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Hero Content */}
      <div className="HeroSection-container">
        <div className="HeroSection-content" key={currentSlide}>
          <div className="HeroSection-eyebrow">
            <span className="HeroSection-eyebrow-line"></span>
            {heroSlides[currentSlide].eyebrow}
          </div>

          <h1 className="HeroSection-title">
            {heroSlides[currentSlide].title}
          </h1>

          <p className="HeroSection-description">
            {heroSlides[currentSlide].description}
          </p>

          <div className="HeroSection-actions">
            <a
              href={
                currentSlide === 2
                  ? "/machinery"
                  : currentSlide === 1
                  ? "/about"
                  : currentSlide === 3
                  ? "/about"
                  : "/products"
              }
              className="HeroSection-button"
            >
              <span>{heroSlides[currentSlide].button}</span>
              <ArrowRight size={19} />
            </a>

            <div className="HeroSection-trust">
              <span className="HeroSection-trust-icon">
                {heroSlides[currentSlide].icon}
              </span>
              <span>Growing Together, Naturally</span>
            </div>
          </div>
        </div>
      </div>

      {/* Slider Navigation */}
      <div className="HeroSection-navigation">
        <button
          type="button"
          className="HeroSection-arrow"
          onClick={prevSlide}
          aria-label="Previous slide"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="HeroSection-dots">
          {heroSlides.map((_, index) => (
            <button
              type="button"
              key={index}
              className={`HeroSection-dot ${
                currentSlide === index ? "active" : ""
              }`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        <button
          type="button"
          className="HeroSection-arrow"
          onClick={nextSlide}
          aria-label="Next slide"
        >
          <ArrowRight size={20} />
        </button>
      </div>

      {/* Slide Counter */}
      <div className="HeroSection-counter">
        <span>0{currentSlide + 1}</span>
        <span className="HeroSection-counter-divider"></span>
        <span>0{heroSlides.length}</span>
      </div>

      {/* Bottom Decoration */}
      <div className="HeroSection-bottom-line"></div>
    </section>
  );
};

export default HeroSection;
