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
  FiZap,
} from "react-icons/fi";
import { FaUser } from "react-icons/fa";

import "./Login.css";
import brandLogo from "../../assets/logo.png";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const AUTH_KEY = "isAdminAuthenticated";

const DEMO_USER = "Admin";
const DEMO_PASS = "12345";
const BRAND_NAME = "Rhino's Equipment";

const Login = () => {
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
    rememberMe: true,
  });

  const [fetchedCreds, setFetchedCreds] = useState({
    username: DEMO_USER,
    password: DEMO_PASS,
  });
  const [isAutoFetched, setIsAutoFetched] = useState(false);

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

  // AUTO-FETCH ADMIN CREDENTIALS on component mount
  useEffect(() => {
    let isMounted = true;

    const fetchAdminCredentials = async () => {
      try {
        const res = await fetch(`${API_URL}/auth/admin-credentials`);
        const data = await res.json();

        if (isMounted && res.ok && data.success && data.data) {
          const creds = data.data;
          setFetchedCreds(creds);

          // Auto-populate the form inputs
          setFormData((prev) => ({
            ...prev,
            identifier: creds.username || creds.email || DEMO_USER,
            password: creds.password || DEMO_PASS,
          }));

          setIsAutoFetched(true);
        } else {
          // Fallback default credentials
          setFormData((prev) => ({
            ...prev,
            identifier: DEMO_USER,
            password: DEMO_PASS,
          }));
          setIsAutoFetched(true);
        }
      } catch (err) {
        console.warn("Could not auto-fetch credentials from backend, using defaults:", err);
        if (isMounted) {
          setFormData((prev) => ({
            ...prev,
            identifier: DEMO_USER,
            password: DEMO_PASS,
          }));
          setIsAutoFetched(true);
        }
      }
    };

    fetchAdminCredentials();

    return () => {
      isMounted = false;
    };
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

  const doAuthenticate = async (identifier, password, rememberMe) => {
    if (isLoading || isSuccess) return;

    setIsLoading(true);
    setErrorMessage("");
    setInfoMessage("");

    try {
      const cleanId = (identifier || "").trim().toLowerCase();
      const cleanPass = password || "";

      const validUsers = [
        DEMO_USER.toLowerCase(),
        "admin@rhincoequipments.com",
        (fetchedCreds.username || "").toLowerCase(),
        (fetchedCreds.email || "").toLowerCase(),
      ].filter(Boolean);

      const validPass = fetchedCreds.password || DEMO_PASS;

      // Check match against admin credentials or fallback
      let isOk = validUsers.includes(cleanId) && (cleanPass === validPass || cleanPass === DEMO_PASS);

      // If entered an email that didn't match default, try backend login API
      if (!isOk && cleanId.includes("@")) {
        try {
          const res = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: cleanId, password: cleanPass }),
          });
          const result = await res.json();
          if (res.ok && result.success) {
            isOk = true;
          }
        } catch {
          // ignore network error
        }
      }

      if (!isOk) {
        setErrorMessage("Incorrect username or password. Please try again.");
        setIsLoading(false);
        return;
      }

      sessionStorage.setItem(AUTH_KEY, "true");
      if (rememberMe) {
        localStorage.setItem(AUTH_KEY, "true");
      } else {
        localStorage.removeItem(AUTH_KEY);
      }

      setIsSuccess(true);
      redirectTimer.current = setTimeout(() => {
        navigate(destination, { replace: true });
      }, 1200);
    } catch (err) {
      setErrorMessage("Something went wrong. Check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    doAuthenticate(formData.identifier, formData.password, formData.rememberMe);
  };

  const handleQuickSignIn = (e) => {
    e.preventDefault();
    const id = fetchedCreds.username || DEMO_USER;
    const pass = fetchedCreds.password || DEMO_PASS;

    setFormData((prev) => ({
      ...prev,
      identifier: id,
      password: pass,
    }));

    doAuthenticate(id, pass, formData.rememberMe);
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

          {/* AUTO-FETCHED CREDENTIALS CARD */}
          <div className="Login-autofetch-card">
            <div className="Login-autofetch-header">
              <div className="Login-autofetch-status">
                <span className="Login-autofetch-pulse-dot"></span>
                <span className="Login-autofetch-badge-text">
                  {isAutoFetched ? "Credentials Auto-Fetched" : "Fetching System Credentials..."}
                </span>
              </div>

              <button
                type="button"
                className="Login-autofetch-quick-btn"
                onClick={handleQuickSignIn}
                disabled={isLoading || isSuccess}
                title="1-Click Auto Fill & Sign In"
              >
                <FiZap size={13} />
                <span>1-Click Sign In</span>
              </button>
            </div>

            <div className="Login-autofetch-details">
              <div
                className="Login-autofetch-pill"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    identifier: fetchedCreds.username || DEMO_USER,
                  }))
                }
                title="Click to fill username"
              >
                <small>User:</small>
                <strong>{fetchedCreds.username || DEMO_USER}</strong>
              </div>

              <div
                className="Login-autofetch-pill"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    password: fetchedCreds.password || DEMO_PASS,
                  }))
                }
                title="Click to fill password"
              >
                <small>Pass:</small>
                <strong>{fetchedCreds.password || DEMO_PASS}</strong>
              </div>
            </div>
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
