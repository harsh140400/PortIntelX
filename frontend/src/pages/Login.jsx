import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiPost } from "../api";

export default function Login() {
  const [email, setEmail] = useState("admin@portintelx.com");
  const [password, setPassword] = useState("Admin@123");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);

    const res = await apiPost("/auth/login", {
      email,
      password,
    });

    setLoading(false);

    if (!res.success) {
      alert(res.detail || "Login failed");
      return;
    }

    // ✅ Save token
    localStorage.setItem("token", res.token);
    localStorage.setItem("role", res.role);
    localStorage.setItem("user", JSON.stringify(res.user));

    // ✅ Redirect
    navigate("/dashboard");
  }

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 520, margin: "40px auto" }}>
        <div className="title">🔐 Login</div>
        <p className="sub">
          Sign in to PortIntelX to scan targets, view reports, and manage risk analytics.
        </p>

        <form onSubmit={handleLogin} style={{ marginTop: 16 }}>
          <label>Email</label>
          <input
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@portintelx.com"
          />

          <label style={{ marginTop: 12 }}>Password</label>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Admin@123"
          />

          <button
            className="btn btnPrimary"
            style={{ width: "100%", marginTop: 16 }}
            type="submit"
            disabled={loading}
          >
            {loading ? "Logging in..." : "✅ Login"}
          </button>
        </form>

        <div style={{ marginTop: 14 }}>
          <button
            className="btn btnGhost"
            style={{ width: "100%" }}
            onClick={() => navigate("/register")}
          >
            ➕ Create New Account
          </button>
        </div>
      </div>
    </div>
  );
}
