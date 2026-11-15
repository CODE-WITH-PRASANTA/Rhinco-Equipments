import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiCheckCircle,
  FiArrowRight,
  FiStar,
  FiShield,
} from "react-icons/fi";
import { FaUser } from "react-icons/fa";

import "./Login.css";
import brandLogo from "../../assets/logo.png";

const AUTH_KEY = "isAdminAuthenticated";

const DEMO_USER = "Admin";
const DEMO_PASS = "12345";

const authenticate = async (identifier, password) => {
  await new Promise((resolve) => setTimeout(resolve, 600)); // simulate network
  return (
    identifier.trim().toLowerCase() === DEMO_USER.toLowerCase() &&
    password === DEMO_PASS
  );
};

const BRAND_NAME = "Rhino's Equipment";

const Login = () => {
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
    rememberMe: true,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [infoMessage, setInfoMessage] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const redirectTimer = useRef(null);

  // Redirect back to the originally requested protected page, or "/" (Dashboard)
  const destination =
    location.state?.from?.pathname && location.state.from.pathname !== "/login"
      ? location.state.from.pathname
      : "/";

  // If already signed in, skip the login screen
  useEffect(() => {
    const remembered = localStorage.getItem(AUTH_KEY) === "true";
    if (remembered) sessionStorage.setItem(AUTH_KEY, "true");

    if (sessionStorage.getItem(AUTH_KEY) === "true") {
      navigate(destination, { replace: true });
    }
  }, [navigate, destination]);

  // Clear redirect timer on unmount
  useEffect(() => {
    return () => clearTimeout(redirectTimer.current);
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errorMessage) setErrorMessage("");
    if (infoMessage) setInfoMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading || isSuccess) return;

    setIsLoading(true);
    setErrorMessage("");
    setInfoMessage("");

    try {
      const ok = await authenticate(formData.identifier, formData.password);

      if (!ok) {
        setErrorMessage("Incorrect username or password. Please try again.");
        return;
      }

      sessionStorage.setItem(AUTH_KEY, "true");
      if (formData.rememberMe) {
        localStorage.setItem(AUTH_KEY, "true");
      } else {
        localStorage.removeItem(AUTH_KEY);
      }

      setIsSuccess(true);
      redirectTimer.current = setTimeout(() => {
        navigate(destination, { replace: true });
      }, 1500);
    } catch (err) {
      setErrorMessage("Something went wrong. Check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgot = (e) => {
    e.preventDefault();
    setErrorMessage("");
    setInfoMessage("Please contact the system administrator to reset your password.");
  };

  return (
    <div className="Login-container">
      {isSuccess && (
        <div className="Login-success-overlay" role="status" aria-live="polite">
          <div className="Login-success-card-3d">
            <div className="Login-success-icon-wrapper">
              <FiCheckCircle size={74} className="Login-success-icon" />
            </div>
            <h2 className="Login-success-title">Welcome back</h2>
            <p className="Login-success-subtitle">
              Signing you in to {BRAND_NAME}
            </p>
            <div className="Login-success-loader"></div>
          </div>
        </div>
      )}

      <div className={`Login-card-wrapper ${isSuccess ? "Login-blur" : ""}`}>
        {/* LEFT BRANDING SECTION */}
        <div
          className="Login-brand-section"
          style={{
            backgroundImage: `linear-gradient(180deg, rgba(7, 18, 52, 0.78) 0%, rgba(8, 26, 77, 0.93) 100%), url(${brandLogo})`,
          }}
        >
          <div className="Login-brand-header">
            <div className="Login-logo-container">
              <div className="Login-logo-badge">
                <img
                  src={brandLogo}
                  alt={`${BRAND_NAME} Logo`}
                  className="Login-logo-img"
                  style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: "50%" }}
                />
              </div>
              <div className="Login-logo-text-group">
                <h2 className="Login-brand-title">{BRAND_NAME}</h2>
                <span className="Login-brand-subtitle">ADMIN PANEL</span>
              </div>
            </div>
          </div>

          <div className="Login-hero-content">
            <span className="Login-hero-tagline">
              <FiStar className="Login-tagline-icon" /> Heavy-Duty Performance
            </span>
            <h1 className="Login-hero-heading">
              Built Tough, <br />
              <span className="Login-hero-highlight">Powerfully Managed.</span>
            </h1>
            <p className="Login-hero-description">
              Manage products, heavy machinery &amp; equipment, categories,
              customer enquiries, and your team from one secure dashboard.
            </p>
          </div>

          <div className="Login-hero-footer">
            <p className="Login-secure-note">
              <FiShield className="Login-secure-icon" />
              Secure admin access only
            </p>
          </div>
        </div>

        {/* RIGHT LOGIN FORM SECTION */}
        <div className="Login-form-section">
          <div className="Login-avatar-container">
            <div className="Login-avatar-3d">
              <FaUser size={22} />
            </div>
          </div>

          <div className="Login-form-header">
            <h2>Welcome back</h2>
            <p>Sign in to manage equipment, products, and enquiries</p>
          </div>

          {errorMessage && (
            <div className="Login-error-badge" role="alert">
              {errorMessage}
            </div>
          )}

          {infoMessage && (
            <div className="Login-info-badge" role="status">
              {infoMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="Login-form" noValidate={false}>
            <div className="Login-input-group">
              <FiMail className="Login-input-icon" size={18} />
              <input
                type="text"
                name="identifier"
                placeholder="Username or email address"
                aria-label="Username or email address"
                value={formData.identifier}
                onChange={handleChange}
                autoComplete="username"
                autoFocus
                disabled={isLoading}
                required
              />
            </div>

            <div className="Login-input-group">
              <FiLock className="Login-input-icon" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                aria-label="Password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
                disabled={isLoading}
                required
              />
              <button
                type="button"
                className="Login-password-toggle"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>

            <div className="Login-form-options">
              <label className="Login-checkbox-label">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                />
                <span>Remember me</span>
              </label>
              <a href="#forgot" className="Login-forgot-link" onClick={handleForgot}>
                Forgot password?
              </a>
            </div>

            <button type="submit" className="Login-submit-btn" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="Login-spinner" aria-hidden="true"></span>
                  <span>Signing in…</span>
                </>
              ) : (
                <>
                  <span>Sign in to dashboard</span>
                  <FiArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;