import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_ENDPOINTS } from "../api/config";
import "../App.css";

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLoginResponse = (userData, token) => {
    const userObj = userData || { name: email.split("@")[0] || "Operator", email };
    if (onLoginSuccess) {
      onLoginSuccess(userObj);
    }
    localStorage.setItem("user", JSON.stringify(userObj));
    if (token) {
      localStorage.setItem("token", token);
    }
    navigate("/home");
  };

  // Check for Google OAuth hash or render official GSI button
  useEffect(() => {
    if (window.location.hash && window.location.hash.includes("access_token")) {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get("access_token");
      if (accessToken) {
        window.history.replaceState(null, "", window.location.pathname);
        axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${accessToken}` }
        }).then(async (res) => {
          const googleUser = res.data;
          try {
            const backendRes = await axios.post(API_ENDPOINTS.GOOGLE_AUTH, {
              email: googleUser.email,
              name: googleUser.name || googleUser.email.split("@")[0]
            });
            const jwtToken = backendRes.data?.access_token || backendRes.data?.token || accessToken;
            handleLoginResponse(backendRes.data?.user || googleUser, jwtToken);
          } catch (e) {
            handleLoginResponse(googleUser, accessToken);
          }
        }).catch(() => {
          handleLoginResponse({ name: "Google User", email: "user@gmail.com" }, accessToken);
        });
      }
    }

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    let isInitialized = false;
    const initGsi = () => {
      if (isInitialized) return;
      if (clientId && window.google && window.google.accounts && window.google.accounts.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: async (response) => {
              if (response && response.credential) {
                try {
                  const backendRes = await axios.post(API_ENDPOINTS.GOOGLE_AUTH, {
                    credential: response.credential
                  });
                  const jwtToken = backendRes.data?.access_token || backendRes.data?.token;
                  handleLoginResponse(backendRes.data?.user, jwtToken);
                } catch (e) {
                  setError("Google sign-in failed. Please try again.");
                }
              }
            }
          });
          const btnDiv = document.getElementById("googleBtnContainer");
          if (btnDiv) {
            btnDiv.innerHTML = "";
            window.google.accounts.id.renderButton(btnDiv, {
              type: "standard",
              theme: "outline",
              size: "large",
              text: "continue_with",
              shape: "rectangular",
              width: 320
            });
          }
          isInitialized = true;
        } catch (e) {}
      }
    };

    initGsi();
    const interval = setInterval(initGsi, 500);
    const timeout = setTimeout(() => clearInterval(interval), 4000);
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);


  const handleRealGoogleOAuth = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      setError("Google Sign-In is not configured. Please set VITE_GOOGLE_CLIENT_ID.");
      return;
    }
    const redirectUri = window.location.origin;
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=${encodeURIComponent("email profile")}`;
    window.location.href = googleAuthUrl;
  };





  async function handleSubmit(e) {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email or username!");
      return;
    }
    if (!password) {
      setError("Please enter your password!");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(API_ENDPOINTS.LOGIN, {
        username: email,
        email: email,
        password: password,
      });

      if (response.data && response.data.success) {
        handleLoginResponse(response.data.user, response.data.access_token);
      } else {
        setError(response.data.message || "Incorrect email or password");
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Unable to connect to backend server. Please verify your internet or backend connection.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <section className="auth-brand">
          <div className="brand-logo">
            <div className="brand-icon">🌱</div>
            Agri Commission Manager
          </div>

          <div className="brand-content">
            <h2>Grow smarter. Farm better.</h2>
            <p>
              Manage your agricultural commission bills, farmer balances, cash collections,
              and sales reports from one place.
            </p>
          </div>

          <div className="brand-footer">
            Built for farmers, designed for growth.
          </div>
        </section>

        <section className="auth-form-side">
          <div className="auth-form-wrapper">
            <div className="auth-heading">
              <h1>Welcome back</h1>
              <p>Enter your details to access your dashboard.</p>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email">Email or Username</label>
                <input
                  id="email"
                  type="text"
                  name="email"
                  placeholder="admin or farmer@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {error && <p className="auth-error">{error}</p>}

              <button className="auth-button" type="submit" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>

            <div style={{ margin: "20px 0", textAlign: "center" }}>
              <div style={{ display: "flex", alignItems: "center", margin: "15px 0" }}>
                <div style={{ flex: 1, height: "1px", backgroundColor: "#e2e8f0" }}></div>
                <span style={{ padding: "0 10px", color: "#64748b", fontSize: "14px" }}>OR</span>
                <div style={{ flex: 1, height: "1px", backgroundColor: "#e2e8f0" }}></div>
              </div>

              <div id="googleBtnContainer" style={{ display: "flex", justifyContent: "center", width: "100%" }}>
                <button
                  type="button"
                  onClick={handleRealGoogleOAuth}
                  style={{
                    width: "100%",
                    padding: "12px",
                    backgroundColor: "#ffffff",
                    color: "#1e293b",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    fontSize: "15px",
                    fontWeight: "600",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  Continue with Google
                </button>
              </div>

            </div>

            <p className="auth-switch">
              Don't have an account? <Link to="/signup">Create account</Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
