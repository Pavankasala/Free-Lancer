import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./App.css";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name) {
      setError("enter valid name");
      return;
    }
    if (!email) {
      setError("enter valid email!");
      return;
    } else if (!password) {
      setError("enter valid password!");
      return;
    } else if (password.length < 6) {
      setError("password must be at least 6 characters!");
      return;
    } else if (!confirmPassword) {
      setError("please confirm your password");
      return;
    } else if (password !== confirmPassword) {
      setError("passwords do not match");
      return;
    }
    setError("");
    const SignupData = {
      name,
      email,
      password,
    };
    console.log(name, email, password);
    try {
      const response = await fetch("http://localhost:5000/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(SignupData),
      });
      const data = await response.json();
      if (response.ok) {
        console.log("signup successful");
        navigate("/login");
      } else {
        console.log("Setting error:", data.message);
        setError(data.message);
      }
    } catch (e) {
      console.log(e, "signup failed");
      setError("Unable to connect to server");
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <section className="auth-brand">
          <div className="brand-logo">
            <div className="brand-icon">🌱</div>
            Indian Lemon Company
          </div>

          <div className="brand-content">
            <h2>Start growing with us.</h2>
            <p>
              Create your farmer account and get access to tools designed to
              make managing your farm simpler and smarter.
            </p>
          </div>

          <div className="brand-footer">
            Technology that grows with your farm.
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

              <button className="auth-button" type="submit">
                Create Account
              </button>
            </form>

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
