import React, { useEffect, useState } from "react";
import loaderImg from "../../assets/loader.png";
import "./Loader.css";

const LOAD_TIME = 1500; // 2 seconds
const EXIT_TIME = 600; // fade-out duration (ms)

const Loader = ({ duration = LOAD_TIME, onComplete }) => {
  const [leaving, setLeaving] = useState(false);
  const [visible, setVisible] = useState(true);

  // after `duration` start the fade-out
  useEffect(() => {
    const timer = setTimeout(() => setLeaving(true), duration);
    return () => clearTimeout(timer);
  }, [duration]);

  // after fade-out remove loader and notify parent
  useEffect(() => {
    if (!leaving) return undefined;
    const timer = setTimeout(() => {
      setVisible(false);
      if (onComplete) onComplete();
    }, EXIT_TIME);
    return () => clearTimeout(timer);
  }, [leaving, onComplete]);

  if (!visible) return null;

  return (
    <div
      className={`Loader ${leaving ? "Loader--leaving" : ""}`}
      style={{ "--Loader-duration": `${duration}ms` }}
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <div className="Loader-bg" aria-hidden="true" />
      <div className="Loader-grain" aria-hidden="true" />

      <div className="Loader-content">
        <div className="Loader-stage">
          {/* soft pulsing glow */}
          <span className="Loader-glow" aria-hidden="true" />

          {/* outer dashed ring – slow reverse spin */}
          <span className="Loader-ring Loader-ring--dashed" aria-hidden="true" />

          {/* conic gold arc – spin */}
          <span className="Loader-ring Loader-ring--arc" aria-hidden="true" />

          {/* progress ring that fills in 2s */}
          <svg
            className="Loader-progress"
            viewBox="0 0 200 200"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="LoaderGold" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#fff1b8" />
                <stop offset="50%" stopColor="#e7b82a" />
                <stop offset="100%" stopColor="#a67c12" />
              </linearGradient>
            </defs>
            <circle className="Loader-progress-track" cx="100" cy="100" r="94" />
            <circle className="Loader-progress-bar" cx="100" cy="100" r="94" />
          </svg>

          {/* orbiting spark */}
          <span className="Loader-orbit" aria-hidden="true">
            <i className="Loader-spark" />
          </span>

          {/* logo */}
          <div className="Loader-logoWrap">
            <img
              className="Loader-logo"
              src={loaderImg}
              alt="Rhino's – A Tractor Attachment Company"
              draggable="false"
            />
            <span className="Loader-shine" aria-hidden="true" />
          </div>
        </div>

        <span className="Loader-text">Loading</span>
      </div>
    </div>
  );
};

export default Loader;