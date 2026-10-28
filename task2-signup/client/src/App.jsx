import { useState } from "react";

const LOCAL_API_URL = "http://localhost:5000";
const PRODUCTION_API_URL = "https://joinspace-api-aman.onrender.com";
const isLocalDevelopment = ["localhost", "127.0.0.1"].includes(window.location.hostname);
const defaultApiUrl = isLocalDevelopment ? LOCAL_API_URL : PRODUCTION_API_URL;
const API_URL = (import.meta.env.VITE_API_URL || defaultApiUrl).replace(/\/+$/, "");
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validateForm() {
    if (!email.trim() || !password) return "Email and password are required.";
    if (!emailPattern.test(email.trim())) return "Enter a valid email address.";
    if (password.length < 6) return "Password must be at least 6 characters long.";
    return "";
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setMessage({ text: validationError, type: "error" });
      return;
    }

    setIsSubmitting(true);
    setMessage({ text: "", type: "" });

    try {
      const response = await fetch(`${API_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Registration failed.");

      setMessage({ text: data.message, type: "success" });
      setEmail("");
      setPassword("");
    } catch (error) {
      const text = error instanceof TypeError
        ? "Cannot reach the server. Check that the backend is running."
        : error.message;
      setMessage({ text, type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  }

  function showLoginMessage(event) {
    event.preventDefault();
    setMessage({ text: "Login is not part of this signup assignment.", type: "info" });
  }

  return (
    <main className="signup-page">
      <section className="brand-panel" aria-label="JoinSpace introduction">
        <div className="brand-glow glow-one" aria-hidden="true"></div>
        <div className="brand-glow glow-two" aria-hidden="true"></div>
        <div className="dot-grid" aria-hidden="true"></div>

        <a className="brand" href="#signup" aria-label="JoinSpace home">
          <span className="brand-icon" aria-hidden="true">
            <span></span><span></span><span></span>
          </span>
          JoinSpace
        </a>

        <div className="brand-copy">
          <span className="brand-kicker">Welcome to your next chapter</span>
          <h1>A better way to<br />get started.</h1>
          <p>Create your account and begin your journey.</p>
          <div className="feature-row" aria-label="Signup benefits">
            <span><i aria-hidden="true">✓</i> Simple</span>
            <span><i aria-hidden="true">✓</i> Secure</span>
            <span><i aria-hidden="true">✓</i> Seamless</span>
          </div>
        </div>

        <p className="brand-footer">Your space. Your journey. Your way.</p>
      </section>

      <section className="form-panel" id="signup">
        <div className="mobile-brand" aria-hidden="true">
          <span className="brand-icon"><span></span><span></span><span></span></span>
          JoinSpace
        </div>

        <div className="signup-card" aria-labelledby="signup-heading">
          <span className="form-kicker">Start for free</span>
          <h2 id="signup-heading">Create your account</h2>
          <p className="welcome-text">Welcome! Enter your details to get started.</p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="field">
              <label htmlFor="email">Email address</label>
              <div className="input-shell">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M4 6h16v12H4zM4 7l8 6 8-6" />
                </svg>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  placeholder="student@example.com"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <div className="input-shell">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="5" y="10" width="14" height="10" rx="2" />
                  <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v2" />
                </svg>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="new-password"
                  placeholder="At least 6 characters"
                  disabled={isSubmitting}
                />
              </div>
              <span className="password-hint">Use 6 or more characters</span>
            </div>

            <p className={`message ${message.type}`} role="status" aria-live="polite">
              {message.text}
            </p>

            <button className="signup-button" type="submit" disabled={isSubmitting}>
              <span>{isSubmitting ? "Creating account..." : "Sign Up"}</span>
              {!isSubmitting && <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m7 4 6 6-6 6" /></svg>}
            </button>
          </form>

          <p className="member-text">
            Already a member? <a href="#login" onClick={showLoginMessage}>Log In</a>
          </p>

        </div>
      </section>
    </main>
  );
}

export default App;
