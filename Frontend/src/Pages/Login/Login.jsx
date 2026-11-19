import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Mail,
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
import GoogleAuthButton from "../../Components/GoogleAuthButton/GoogleAuthButton";
import "./Login.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const LOGIN_API = `${API_URL}/auth/login`;

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectPath = location.state?.from || "/";

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [showPassword, setShowPassword] = useState(false);
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

    if (!formData.email.trim() || !formData.password) {
      setError("Please fill in both email and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(LOGIN_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Invalid credentials. Please try again.");
      }

      // Save user session
      localStorage.setItem("rhinco_user", JSON.stringify(data.user));
      localStorage.setItem("rhinco_token", data.token);
      window.dispatchEvent(new CustomEvent("rhinco_auth_updated", { detail: data.user }));

      const redirectAfterLogin = localStorage.getItem("rhinco_redirect_after_login");
      const target = redirectAfterLogin || redirectPath || "/";
      if (redirectAfterLogin) {
        localStorage.removeItem("rhinco_redirect_after_login");
      }

      setSuccess(`Welcome back, ${data.user.name}! Redirecting...`);
      setTimeout(() => {
        navigate(target, { replace: true });
      }, 1000);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
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
              Empowering <span>Modern Agriculture</span> Across India.
            </h1>

            <p className="AuthBanner-desc">
              Access genuine farming machinery, instant government subsidy applications,
              and dedicated authorized dealer service in your district.
            </p>
          </div>

          <div className="AuthBanner-features">
            <div className="AuthBanner-featureItem">
              <div className="AuthBanner-featureIcon">
                <ShieldCheck size={19} />
              </div>
              <div className="AuthBanner-featureText">
                <h4>100% Verified Implements</h4>
                <p>Heavy duty tillage, rotary cultivators, and tractor attachments.</p>
              </div>
            </div>

            <div className="AuthBanner-featureItem">
              <div className="AuthBanner-featureIcon">
                <Award size={19} />
              </div>
              <div className="AuthBanner-featureText">
                <h4>Subsidy & Finance Assistance</h4>
                <p>Direct DBT portal paperwork routing to district machinery dealers.</p>
              </div>
            </div>

            <div className="AuthBanner-featureItem">
              <div className="AuthBanner-featureIcon">
                <Users size={19} />
              </div>
              <div className="AuthBanner-featureText">
                <h4>50,000+ Happy Farmers</h4>
                <p>Trusted across Maharashtra, MP, Punjab, Gujarat, and pan-India.</p>
              </div>
            </div>
          </div>

          <div className="AuthBanner-footer">
            <span>© 2026 Rhinco Equipments</span>
            <span>Customer Support: 1800-RHINCO</span>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="AuthFormPanel">
          {/* Quick tab toggle between Sign In and Create Account */}
          <div className="AuthNavTabs">
            <button className="AuthNavTab active" type="button">
              Sign In
            </button>
            <Link to="/register" className="AuthNavTab">
              Create User
            </Link>
          </div>

          <div className="AuthHeader">
            <h2 className="AuthHeader-title">Welcome Back</h2>
            <p className="AuthHeader-subtitle">
              Sign in to manage your machinery orders, subsidy applications, and wishlist.
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
            <div className="AuthField">
              <label className="AuthLabel" htmlFor="email">
                Email Address
              </label>
              <div className="AuthInputWrap">
                <Mail size={18} className="AuthInputIcon" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="e.g. farmer@rhinco.in"
                  className="AuthInput"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="AuthField">
              <div className="AuthLabel">
                <label htmlFor="password">Password</label>
                <Link to="/contact" className="AuthForgotLink">
                  Forgot Password?
                </Link>
              </div>
              <div className="AuthInputWrap">
                <Lock size={18} className="AuthInputIcon" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Enter your password"
                  className="AuthInput"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="AuthTogglePassword"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="AuthExtras">
              <label className="AuthRemember">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                />
                <span>Remember me on this device</span>
              </label>
            </div>

            <button type="submit" className="AuthSubmitBtn" disabled={loading}>
              {loading ? (
                <span>Signing In...</span>
              ) : (
                <>
                  <span>Sign In to Account</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <GoogleAuthButton redirectPath={redirectPath} buttonText="Continue with Google" />

          <div className="AuthFooter">
            Don't have an account yet?
            <Link to="/register">Create User / Register</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
