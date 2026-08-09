import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./App.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email) {
      setError("Enter valid email!");
      return;
    } else if (!password) {
      setError("Enter valid password!");
      return;
    } else if (password.length < 6) {
      setError("Password must be at least 6 characters!");
      return;
    }
    setError("");

    const loginData = { email, password };
    try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("token", data.access_token);
        console.log("Login successful", data);
        navigate("/home");
      } else {
        console.log("Login failed", data);
        setError(data.message || "Incorrect email or password");
      }
    } catch (e) {
      console.log(e, "Login failed");
      setError("Unable to connect to server. Please start the Flask backend.");
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
            <h2>Grow smarter. Farm better.</h2>
            <p>
              Manage your farm, monitor your crops, check market information,
              and make better farming decisions from one place.
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
              <p>Enter your details to access your farmer dashboard.</p>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email">Email address</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="farmer@example.com"
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

              <button className="auth-button" type="submit">
                Login
              </button>
            </form>
            <p className="auth-switch">
              Don't have an account? <Link to="/signup">Create account</Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Login;
