import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Tractor,
  Award,
  Users,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import "../Login/Login.css";

const REGISTER_API = "http://localhost:5000/api/auth/register";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "user",
    password: "",
    confirmPassword: "",
    agreeTerms: true,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.name.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!formData.email.trim()) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!formData.phone.trim()) {
      setError("Please enter your mobile phone number.");
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }
    if (!formData.agreeTerms) {
      setError("Please accept the terms and conditions to continue.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(REGISTER_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
          password: formData.password,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to create account.");
      }

      // Automatically store session
      localStorage.setItem("rhinco_user", JSON.stringify(data.user));
      localStorage.setItem("rhinco_token", data.token);
      window.dispatchEvent(new CustomEvent("rhinco_auth_updated", { detail: data.user }));

      const redirectAfterLogin = localStorage.getItem("rhinco_redirect_after_login");
      const target = redirectAfterLogin || "/";
      if (redirectAfterLogin) {
        localStorage.removeItem("rhinco_redirect_after_login");
      }

      setSuccess("Account successfully created! Redirecting...");
      setTimeout(() => {
        navigate(target, { replace: true });
      }, 1000);
    } catch (err) {
      setError(err.message || "Something went wrong creating your account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="AuthPage">
      <div className="AuthContainer">
        {/* Left Brand Banner */}
        <div className="AuthBanner">
          <div className="AuthBanner-header">
            <span className="AuthBanner-badge">
              <Tractor size={16} /> RHINCO AGRO EQUIPMENTS
            </span>

            <h1 className="AuthBanner-title">
              Join the <span>Rhinco Farming Network</span>.
            </h1>

            <p className="AuthBanner-desc">
              Create your account to unlock farmer subsidy assistance, direct dealer quotations,
              and seamless order tracking.
            </p>
          </div>

          <div className="AuthBanner-features">
            <div className="AuthBanner-featureItem">
              <div className="AuthBanner-featureIcon">
                <ShieldCheck size={19} />
              </div>
              <div className="AuthBanner-featureText">
                <h4>Official Manufacturer Warranty</h4>
                <p>Guaranteed on-farm performance and genuine spare parts supply.</p>
              </div>
            </div>

            <div className="AuthBanner-featureItem">
              <div className="AuthBanner-featureIcon">
                <Award size={19} />
              </div>
              <div className="AuthBanner-featureText">
                <h4>Government Subsidy Support</h4>
                <p>Assistance with DBT Agriculture portal applications & documentation.</p>
              </div>
            </div>

            <div className="AuthBanner-featureItem">
              <div className="AuthBanner-featureIcon">
                <Users size={19} />
              </div>
              <div className="AuthBanner-featureText">
                <h4>Authorized District Network</h4>
                <p>Connect directly with trusted dealers and technicians across India.</p>
              </div>
            </div>
          </div>

          <div className="AuthBanner-footer">
            <span>© 2026 Rhinco Equipments</span>
            <span>Toll Free: 1800-RHINCO</span>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="AuthFormPanel">
          {/* Quick tab toggle between Sign In and Create Account */}
          <div className="AuthNavTabs">
            <Link to="/login" className="AuthNavTab">
              Sign In
            </Link>
            <button className="AuthNavTab active" type="button">
              Create User
            </button>
          </div>

          <div className="AuthHeader">
            <h2 className="AuthHeader-title">Create Your Account</h2>
            <p className="AuthHeader-subtitle">
              Join thousands of farmers, dealers, and agricultural professionals.
            </p>
          </div>

          {error && (
            <div className="AuthAlert AuthAlert-error">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="AuthAlert AuthAlert-success">
              <CheckCircle2 size={18} />
              <span>{success}</span>
            </div>
          )}

          <form className="AuthForm" onSubmit={handleSubmit}>
            {/* Full Name */}
            <div className="AuthField">
              <label className="AuthLabel" htmlFor="name">
                Full Name *
              </label>
              <div className="AuthInputWrap">
                <User size={18} className="AuthInputIcon" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder="e.g. Ramesh Patil"
                  className="AuthInput"
                  value={formData.name}
                  onChange={handleChange}
                  autoComplete="name"
                />
              </div>
            </div>

            {/* Email and Phone */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div className="AuthField">
                <label className="AuthLabel" htmlFor="email">
                  Email Address *
                </label>
                <div className="AuthInputWrap">
                  <Mail size={18} className="AuthInputIcon" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="farmer@rhinco.in"
                    className="AuthInput"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="AuthField">
                <label className="AuthLabel" htmlFor="phone">
                  Mobile Number *
                </label>
                <div className="AuthInputWrap">
                  <Phone size={18} className="AuthInputIcon" />
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    placeholder="10-digit number"
                    className="AuthInput"
                    value={formData.phone}
                    onChange={handleChange}
                    autoComplete="tel"
                  />
                </div>
              </div>
            </div>

            {/* Password and Confirm Password */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div className="AuthField">
                <label className="AuthLabel" htmlFor="password">
                  Password *
                </label>
                <div className="AuthInputWrap">
                  <Lock size={18} className="AuthInputIcon" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Min 6 characters"
                    className="AuthInput"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="AuthTogglePassword"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <div className="AuthField">
                <label className="AuthLabel" htmlFor="confirmPassword">
                  Confirm Password *
                </label>
                <div className="AuthInputWrap">
                  <Lock size={18} className="AuthInputIcon" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    placeholder="Re-type password"
                    className="AuthInput"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="AuthTogglePassword"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="AuthExtras">
              <label className="AuthRemember">
                <input
                  type="checkbox"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                />
                <span style={{ fontSize: "12px" }}>
                  I agree to the <Link to="/contact" style={{ color: "#166534" }}>Terms of Service</Link> & <Link to="/contact" style={{ color: "#166534" }}>Privacy Policy</Link>
                </span>
              </label>
            </div>

            <button type="submit" className="AuthSubmitBtn" disabled={loading}>
              {loading ? (
                <span>Creating Account...</span>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="AuthFooter">
            Already have an account?
            <Link to="/login">Sign In here</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
