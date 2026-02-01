import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiPost } from "../api";

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  async function handleRegister(e) {
    e.preventDefault();

    if (!fullName.trim() || !email.trim() || !password.trim()) {
      alert("⚠️ Please fill all fields");
      return;
    }

    setLoading(true);

    const res = await apiPost("/auth/register", {
      full_name: fullName,
      email,
      password,
    });

    setLoading(false);

    if (!res.success) {
      alert(res.detail || "Registration failed");
      return;
    }

    alert("✅ Account created successfully! Now login.");
    navigate("/login");
  }

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 520, margin: "40px auto" }}>
        <div className="title">🧾 Register</div>
        <p className="sub">
          Create your PortIntelX account and start scanning professionally.
        </p>

        <form onSubmit={handleRegister} style={{ marginTop: 16 }}>
          <label>Full Name</label>
          <input
            className="input"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your name"
          />

          <label style={{ marginTop: 12 }}>Email</label>
          <input
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@gmail.com"
          />

          <label style={{ marginTop: 12 }}>Password</label>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a strong password"
          />

          <button
            className="btn btnPrimary"
            style={{ width: "100%", marginTop: 16 }}
            type="submit"
            disabled={loading}
          >
            {loading ? "Creating account..." : "✅ Register"}
          </button>
        </form>

        <div style={{ marginTop: 14 }}>
          <button
            className="btn btnGhost"
            style={{ width: "100%" }}
            onClick={() => navigate("/login")}
          >
            🔐 Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}
