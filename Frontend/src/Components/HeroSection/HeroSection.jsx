import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Sparkles,
  PhoneCall,
} from "lucide-react";
import "./HeroSection.css";

import home1 from "../../assets/home-1.png";
import home2 from "../../assets/home-2.png";
import home3 from "../../assets/home-3.png";
import home4 from "../../assets/home-4.png";

const heroSlides = [
  {
    image: home1,
    badge: "OEM CERTIFIED HEAVY-DUTY IMPLEMENTS",
    titlePrefix: "Heavy-Duty Farm Machinery Built for",
    titleHighlight: "Tough Indian Soil",
    description:
      "Engineered for maximum field efficiency, low diesel consumption, and relentless durability. Explore certified tractor attachments, hydraulic tippers, and high-performance rotavators.",
    primaryBtn: { text: "Explore Machinery", link: "/machinery" },
    secondaryBtn: { text: "Contact District Dealer", link: "/contact" },
    bullets: [
      "Up to 50% Govt. Subsidy Approved",
      "Heavy-duty laser-cut chassis",
      "Doorstep Farm Delivery Pan-India",
    ],
  },
  {
    image: home2,
    badge: "NEXT-GEN HARVEST & FIELD CARE",
    titlePrefix: "Smart Agricultural Equipment That",
    titleHighlight: "Multiplies Your Crop Yield",
    description:
      "Empower your farming with precision implements, seed-cum-fertilizer drills, and advanced crop care machinery designed to slash labor costs and maximize seasonal output.",
    primaryBtn: { text: "Browse Store Products", link: "/products" },
    secondaryBtn: { text: "Request District Quote", link: "/contact" },
    bullets: [
      "Zero-till seed drill technology",
      "Uniform seed & fertilizer depth",
      "OEM Inspected & Field-Proven",
    ],
  },
  {
    image: home3,
    badge: "HYDRAULIC TRANSPORT & LEVELING",
    titlePrefix: "High-Payload Tractor Trolleys &",
    titleHighlight: "Heavy Hydraulic Tippers",
    description:
      "Dual-axle hydraulic trolleys, laser land levelers, and rugged earth-moving attachments built to withstand severe farm payloads and conquer unpaved terrain effortlessly.",
    primaryBtn: { text: "Explore Trolleys & Levelers", link: "/machinery" },
    secondaryBtn: { text: "Get Custom Spec Quote", link: "/contact" },
    bullets: [
      "Dual heavy-duty hydraulic rams",
      "Heavy payload rated axles",
      "100% Tested Leak-Proof System",
    ],
  },
  {
    image: home4,
    badge: "NATIONWIDE FARMER SUPPORT",
    titlePrefix: "Trusted by 50,000+ Prosperous",
    titleHighlight: "Farmers Across 18 States",
    description:
      "Rhino's Equipment stands beside Indian agriculture with genuine OEM spare parts, transparent manufacturer pricing, and rapid district mechanic support.",
    primaryBtn: { text: "Join Rhino Family", link: "/machinery" },
    secondaryBtn: { text: "Locate Service Centers", link: "/contact" },
    bullets: [
      "18+ States authorized dealer network",
      "Doorstep delivery with demo",
      "24/7 Farmer Support Helpline",
    ],
  },
];

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [imagesPreloaded, setImagesPreloaded] = useState(false);
  const slideTimerRef = useRef(null);

  const SLIDE_DURATION = 5500;

  // Preload all hero slide images for instant, flicker-free presentation
  useEffect(() => {
    let loaded = 0;
    heroSlides.forEach((slide) => {
      const img = new Image();
      img.src = slide.image;
      const onDone = () => {
        loaded += 1;
        if (loaded >= 1) {
          setImagesPreloaded(true);
        }
      };
      img.onload = onDone;
      img.onerror = onDone;
    });

    const fallbackTimer = setTimeout(() => {
      setImagesPreloaded(true);
    }, 400);

    return () => clearTimeout(fallbackTimer);
  }, []);

  // Background slides continue to run automatically
  useEffect(() => {
    if (isPaused) return;

    slideTimerRef.current = setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, SLIDE_DURATION);

    return () => {
      if (slideTimerRef.current) clearTimeout(slideTimerRef.current);
    };
  }, [currentSlide, isPaused]);

  const slide = heroSlides[currentSlide];

  return (
    <section
      className={`HeroSection ${imagesPreloaded ? "is-loaded" : "is-loading"}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label="Rhino's Agricultural Equipment Showcase"
    >
      {/* BACKGROUND SLIDES RUN AUTOMATICALLY WITH SMOOTH CROSS-FADE */}
      <div className="HeroSection-slider">
        {heroSlides.map((s, index) => {
          const isActive = currentSlide === index;
          return (
            <div
              key={index}
              className={`HeroSection-slide ${isActive ? "active" : ""}`}
              style={{
                opacity: isActive ? 1 : 0,
                pointerEvents: isActive ? "auto" : "none",
              }}
            >
              <img
                src={s.image}
                alt={s.titleHighlight}
                className="HeroSection-image"
                loading={index === 0 ? "eager" : "lazy"}
                fetchPriority={index === 0 ? "high" : "auto"}
              />
              {/* Overlay is strictly localized to the text zone on the left */}
              <div className="HeroSection-overlay" />
            </div>
          );
        })}
      </div>

      {/* AMBIENT LIGHT GLOW ACCENTS - ONLY BEHIND TEXT */}
      <div className="HeroSection-glow-sphere left" />

      {/* MAIN CONTAINER */}
      <div className="HeroSection-container">
        <div className="HeroSection-grid">
          {/* MAIN HEADLINE & ACTIONS */}
          <div className="HeroSection-contentCol" key={currentSlide}>
            {/* EYEBROW BADGE */}
            <div className="HeroSection-eyebrow">
              <span className="HeroSection-eyebrow-pulse" />
              <Sparkles size={14} className="HeroSection-eyebrow-icon" />
              <span>{slide.badge}</span>
            </div>

            {/* HEADLINE */}
            <h1 className="HeroSection-title">
              {slide.titlePrefix}{" "}
              <span className="HeroSection-title-gradient">
                {slide.titleHighlight}
              </span>
            </h1>

            {/* DESCRIPTION */}
            <p className="HeroSection-description">{slide.description}</p>

            {/* VALUE PROPOSITION BULLETS */}
            <div className="HeroSection-bullets">
              {slide.bullets.map((b, i) => (
                <div className="HeroSection-bulletItem" key={i}>
                  <CheckCircle2 size={15} className="HeroSection-bulletIcon" />
                  <span>{b}</span>
                </div>
              ))}
            </div>

            {/* CTA ACTION BUTTONS */}
            <div className="HeroSection-actions">
              <Link to={slide.primaryBtn.link} className="HeroSection-primaryBtn">
                <span>{slide.primaryBtn.text}</span>
                <ArrowRight size={17} className="HeroSection-btnArrow" />
              </Link>

              <Link
                to={slide.secondaryBtn.link}
                className="HeroSection-secondaryBtn"
              >
                <PhoneCall size={16} />
                <span>{slide.secondaryBtn.text}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
