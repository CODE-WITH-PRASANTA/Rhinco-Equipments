import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./GoogleAuthButton.css";

const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  "1070313248799-q3r7khugifnf6rr69nh7uhpmucaeurq0.apps.googleusercontent.com";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const GOOGLE_AUTH_API = `${API_URL}/auth/google`;

const GoogleAuthButton = ({
  onSuccess,
  onError,
  redirectPath = "/",
  buttonText = "Continue with Google",
}) => {
  const navigate = useNavigate();
  const nativeBtnRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState("");
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Authenticate received token or payload with backend
  const sendToBackend = async (payload) => {
    setLoading(true);
    setLocalError("");

    try {
      const res = await fetch(GOOGLE_AUTH_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Google sign-in failed. Please try again.");
      }

      // Persist user and token
      localStorage.setItem("rhinco_user", JSON.stringify(data.user));
      localStorage.setItem("rhinco_token", data.token);
      window.dispatchEvent(
        new CustomEvent("rhinco_auth_updated", { detail: data.user })
      );

      if (onSuccess) {
        onSuccess(data.user);
      } else {
        const storedRedirect = localStorage.getItem("rhinco_redirect_after_login");
        const target = storedRedirect || redirectPath || "/";
        if (storedRedirect) {
          localStorage.removeItem("rhinco_redirect_after_login");
        }
        navigate(target, { replace: true });
      }
    } catch (err) {
      console.error("Google Auth Backend Error:", err);
      const msg = err.message || "Failed to sign in with Google";
      setLocalError(msg);
      if (onError) onError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Callback from Google Identity Services
  const handleCredentialResponse = (response) => {
    if (response && response.credential) {
      sendToBackend({ credential: response.credential });
    } else {
      setLocalError("Google sign-in was interrupted. Please try again.");
    }
  };

  // Ensure Google Identity Services script is active
  useEffect(() => {
    let checkInterval = null;

    const initGsi = () => {
      if (window.google?.accounts?.id) {
        setScriptLoaded(true);
        try {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
          });

          // Attempt to render native button if container is mounted
          if (nativeBtnRef.current) {
            window.google.accounts.id.renderButton(nativeBtnRef.current, {
              type: "standard",
              theme: "outline",
              size: "large",
              text: "continue_with",
              shape: "rectangular",
              logo_alignment: "left",
              width: 320,
            });
          }
        } catch (e) {
          console.warn("Google ID init notice:", e);
        }
      }
    };

    if (window.google?.accounts?.id) {
      initGsi();
    } else {
      // Check if already in DOM
      let script = document.querySelector('script[src*="accounts.google.com/gsi/client"]');
      if (!script) {
        script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }

      checkInterval = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(checkInterval);
          initGsi();
        }
      }, 200);
    }

    return () => {
      if (checkInterval) clearInterval(checkInterval);
    };
  }, []);

  // Custom button click handler (Token client or prompt fallback)
  const handleCustomClick = () => {
    setLocalError("");
    if (!window.google?.accounts) {
      setLocalError("Google Sign-In is initializing. Please wait a moment and try again.");
      return;
    }

    try {
      // Prefer modern OAuth2 token client popup flow for high reliability
      if (window.google.accounts.oauth2) {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: "email profile openid",
          callback: async (tokenResponse) => {
            if (tokenResponse && tokenResponse.access_token) {
              setLoading(true);
              try {
                // Fetch user info with access token
                const userRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                  headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                });
                const userInfo = await userRes.json();
                if (userInfo && userInfo.email) {
                  await sendToBackend({
                    userInfo: {
                      email: userInfo.email,
                      name: userInfo.name,
                      picture: userInfo.picture,
                      googleId: userInfo.sub,
                    },
                  });
                } else {
                  throw new Error("Could not retrieve Google profile details.");
                }
              } catch (fetchErr) {
                console.error("Token userinfo error:", fetchErr);
                setLocalError("Could not retrieve Google user profile.");
                setLoading(false);
              }
            } else if (tokenResponse.error) {
              console.warn("Google token client error:", tokenResponse.error);
            }
          },
        });
        client.requestAccessToken();
      } else if (window.google.accounts.id) {
        window.google.accounts.id.prompt();
      }
    } catch (err) {
      console.error("Google click trigger error:", err);
      if (window.google?.accounts?.id) {
        window.google.accounts.id.prompt();
      }
    }
  };

  return (
    <div className="GoogleAuthWrap">
      <div className="GoogleAuthDivider">
        <span>or</span>
      </div>

      <button
        type="button"
        className="GoogleAuthBtn"
        onClick={handleCustomClick}
        disabled={loading}
      >
        {loading ? (
          <div className="GoogleAuthBtn-spinner" />
        ) : (
          <svg className="GoogleAuthBtn-icon" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
        )}
        <span>{loading ? "Connecting to Google..." : buttonText}</span>
      </button>

      {/* Hidden native container to support Google One-Tap */}
      <div
        ref={nativeBtnRef}
        className="GoogleAuthNativeContainer"
        style={{ display: "none" }}
      />

      {localError && <div className="GoogleAuthError">{localError}</div>}
    </div>
  );
};

export default GoogleAuthButton;
