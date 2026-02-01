import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiPost } from "../api";

export default function Login() {
  const navigate = useNavigate();

  // ✅ Keep empty (no default admin credentials)
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await apiPost("/auth/login", { email, password });

      if (!res?.success) {
        setError(res?.detail || "Login failed. Please try again.");
        setLoading(false);
        return;
      }

      // ✅ Store token + role
      localStorage.setItem("token", res.token);
      localStorage.setItem("role", res.role);

      // ✅ Redirect
      navigate("/dashboard");
    } catch (err) {
      setError("Server error. Please check backend is running.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 520, margin: "60px auto" }}>
        <div className="title">🔐 Login</div>
        <p className="sub">
          Sign in to PortIntelX to scan targets, view reports, and manage risk analytics.
        </p>

        {error && (
          <div style={{ marginTop: 12 }} className="badge">
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ marginTop: 18 }}>
          <label>Email</label>
          <input
            className="input"
            type="email"
            placeholder="Enter your email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label style={{ marginTop: 14, display: "block" }}>Password</label>
          <input
            className="input"
            type="password"
            placeholder="Enter your password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            className="btn btnPrimary"
            style={{ width: "100%", marginTop: 18 }}
            disabled={loading}
          >
            ✅ {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <Link to="/register">
          <button className="btn btnGhost" style={{ width: "100%", marginTop: 12 }}>
            ➕ Create New Account
          </button>
        </Link>
      </div>
    </div>
  );
}
