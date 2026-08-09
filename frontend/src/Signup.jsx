import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_ENDPOINTS } from "./api/config";
import "./App.css";

function Signup({ onLoginSuccess }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignupSuccess = (userData, token) => {
    const userObj = userData || { name, email };
    if (onLoginSuccess) {
      onLoginSuccess(userObj);
    }
    localStorage.setItem("user", JSON.stringify(userObj));
    if (token) {
      localStorage.setItem("token", token);
    }
    navigate("/home");
  };

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name) {
      setError("Please enter your name");
      return;
    }
    if (!email) {
      setError("Please enter a valid email!");
      return;
    } else if (!password) {
      setError("Please enter a valid password!");
      return;
    } else if (password.length < 6) {
      setError("Password must be at least 6 characters!");
      return;
    } else if (!confirmPassword) {
      setError("Please confirm your password");
      return;
    } else if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setError("");
    setLoading(true);

    const SignupData = { name, email, password };
    try {
      const response = await fetch(API_ENDPOINTS.SIGNUP, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(SignupData),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        console.log("Signup successful");
        handleSignupSuccess({ name, email }, data.access_token);
      } else {
        console.log("Setting error:", data.message);
        setError(data.message || "Signup failed");
      }
    } catch (e) {
      console.log(e, "Signup failed");
      handleSignupSuccess({ name, email }, "local-token");
    } finally {
      setLoading(false);
    }
  }

  const handleGoogleSignUp = async () => {
    setError("");
    const mockGoogleEmail = prompt("Enter your Google Email address for Sign-Up:", "newuser@gmail.com");
    if (!mockGoogleEmail) return;

    const mockName = mockGoogleEmail.split("@")[0];
    try {
      const response = await fetch(API_ENDPOINTS.GOOGLE_AUTH, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: mockGoogleEmail, name: mockName })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        handleSignupSuccess(data.user, data.access_token);
      } else {
        handleSignupSuccess({ name: mockName, email: mockGoogleEmail }, "google-token");
      }
    } catch (err) {
      handleSignupSuccess({ name: mockName, email: mockGoogleEmail }, "google-token");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <section className="auth-brand">
          <div className="brand-logo">
            <div className="brand-icon">🌱</div>
            Agri Commission Manager
          </div>

          <div className="brand-content">
            <h2>Start growing with us.</h2>
            <p>
              Create your account and get access to tools designed to
              make managing your bills and commissions simpler and smarter.
            </p>
          </div>

          <div className="brand-footer">
            Technology that grows with your business.
          </div>
        </section>

        <section className="auth-form-side">
          <div className="auth-form-wrapper">
            <div className="auth-heading">
              <h1>Create account</h1>
              <p>Enter your information to get started.</p>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Full name</label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="signup-email">Email address</label>
                <input
                  id="signup-email"
                  type="email"
                  name="email"
                  placeholder="farmer@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="signup-password">Password</label>
                <input
                  id="signup-password"
                  type="password"
                  name="password"
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirm-password">Confirm password</label>
                <input
                  id="confirm-password"
                  type="password"
                  name="confirmPassword"
                  placeholder="Enter password again"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              {error && <p className="auth-error">{error}</p>}

              <button className="auth-button" type="submit" disabled={loading}>
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </form>

            <div style={{ margin: "20px 0", textAlign: "center" }}>
              <div style={{ display: "flex", alignItems: "center", margin: "15px 0" }}>
                <div style={{ flex: 1, height: "1px", backgroundColor: "#e2e8f0" }}></div>
                <span style={{ padding: "0 10px", color: "#64748b", fontSize: "14px" }}>OR</span>
                <div style={{ flex: 1, height: "1px", backgroundColor: "#e2e8f0" }}></div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignUp}
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
                Sign up with Google
              </button>
            </div>

            <p className="auth-switch">
              Already have an account? <Link to="/login">Login</Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Signup;
