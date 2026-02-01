import React, { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar.jsx";
import { apiGet } from "../api";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [history, setHistory] = useState([]);
  const [scanDetails, setScanDetails] = useState({});
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);

      // ✅ Get scan list
      const scans = await apiGet("/history");
      const list = Array.isArray(scans) ? scans : [];
      setHistory(list);

      // ✅ Load latest scan details for widgets
      const detailsMap = {};
      const latest = list.slice(0, 8); // last 8 for dashboard insights

      for (const s of latest) {
        try {
          const d = await apiGet(`/history/${s.id}`);
          detailsMap[s.id] = d;
        } catch (err) {
          detailsMap[s.id] = null;
        }
      }

      setScanDetails(detailsMap);
      setLoading(false);
    }

    loadDashboard();
  }, []);

  const dashboardStats = useMemo(() => {
    const scans = history || [];

    let total = scans.length;
    let highRisk = 0;
    let totalRiskScore = 0;
    let scoredCount = 0;

    let latestTarget = "—";
    let latestRisk = "—";

    const portCount = {};

    scans.slice(0, 8).forEach((s, idx) => {
      const detail = scanDetails[s.id];
      if (!detail) return;

      const riskLevel = (detail.risk_level || "LOW").toUpperCase();
      const riskScore = detail.risk_score ?? null;

      if (riskLevel === "HIGH" || riskLevel === "CRITICAL") {
        highRisk += 1;
      }

      if (typeof riskScore === "number") {
        totalRiskScore += riskScore;
        scoredCount += 1;
      }

      // latest scan
      if (idx === 0) {
        latestTarget = detail.target || s.target || "—";
        latestRisk = `${riskLevel} (${riskScore ?? 0}/100)`;
      }

      // open port tracking
      const openPorts = detail.open_ports || [];
      openPorts.forEach((p) => {
        const port = p.port;
        if (!port) return;
        portCount[port] = (portCount[port] || 0) + 1;
      });
    });

    const avgRisk = scoredCount > 0 ? Math.round(totalRiskScore / scoredCount) : 0;

    // top ports sorted
    const topPorts = Object.entries(portCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([port, count]) => ({
        port,
        count,
      }));

    return {
      total,
      highRisk,
      avgRisk,
      latestTarget,
      latestRisk,
      topPorts,
    };
  }, [history, scanDetails]);

  function riskBadge(level) {
    const lv = (level || "").toUpperCase();
    if (lv === "CRITICAL") return "🚨 CRITICAL";
    if (lv === "HIGH") return "🔥 HIGH";
    if (lv === "MEDIUM") return "⚠️ MEDIUM";
    return "✅ LOW";
  }

  function riskBoxStyle(level) {
    const lv = (level || "").toUpperCase();
    if (lv === "CRITICAL") return { border: "rgba(255,59,107,0.5)", bg: "rgba(255,59,107,0.18)" };
    if (lv === "HIGH") return { border: "rgba(255,0,70,0.45)", bg: "rgba(255,0,70,0.15)" };
    if (lv === "MEDIUM") return { border: "rgba(255,170,0,0.45)", bg: "rgba(255,170,0,0.16)" };
    return { border: "rgba(34,197,94,0.4)", bg: "rgba(34,197,94,0.15)" };
  }

  return (
    <div className="container">
      <Navbar />

      <div className="card">
        <div className="title">🏠 Dashboard</div>
        <p className="sub">
          Real-time operational view of scans, risk posture, and target exposure insights.
        </p>
      </div>

      {/* ✅ Main widgets */}
      <div className="grid2" style={{ marginTop: 14 }}>
        <div className="card">
          <div className="badge">📌 Total Scans</div>
          <h2 style={{ marginTop: 10, fontSize: "2.2rem" }}>
            {loading ? "..." : dashboardStats.total}
          </h2>
          <p style={{ marginTop: 6, opacity: 0.8 }}>
            Total assessments performed by your account.
          </p>
        </div>

        <div className="card">
          <div className="badge">🚨 High Risk Scans</div>
          <h2 style={{ marginTop: 10, fontSize: "2.2rem" }}>
            {loading ? "..." : dashboardStats.highRisk}
          </h2>
          <p style={{ marginTop: 6, opacity: 0.8 }}>
            Scans marked <b>HIGH</b> or <b>CRITICAL</b> based on enterprise risk engine.
          </p>
        </div>
      </div>

      <div className="grid2" style={{ marginTop: 14 }}>
        <div className="card">
          <div className="badge">📍 Latest Target</div>
          <h2 style={{ marginTop: 10, fontSize: "1.3rem", wordBreak: "break-word" }}>
            {loading ? "..." : dashboardStats.latestTarget}
          </h2>
          <p style={{ marginTop: 8, opacity: 0.85 }}>
            <b>Latest Risk:</b> {loading ? "..." : dashboardStats.latestRisk}
          </p>

          <div style={{ marginTop: 12 }}>
            <button className="btn btnGhost" onClick={() => navigate("/scanner")}>
              🔍 Run New Scan
            </button>
          </div>
        </div>

        <div className="card">
          <div className="badge">📊 Avg Risk Score</div>
          <h2 style={{ marginTop: 10, fontSize: "2.2rem" }}>
            {loading ? "..." : `${dashboardStats.avgRisk}/100`}
          </h2>
          <p style={{ marginTop: 6, opacity: 0.8 }}>
            Average risk score from your latest scans.
          </p>
        </div>
      </div>

      {/* ✅ Top Ports */}
      <div className="card" style={{ marginTop: 14 }}>
        <div className="badge">📈 Top Open Ports (Most Common)</div>

        {loading ? (
          <p style={{ marginTop: 12, opacity: 0.8 }}>Loading insights...</p>
        ) : dashboardStats.topPorts.length === 0 ? (
          <p style={{ marginTop: 12, opacity: 0.8 }}>
            No open ports data available yet. Run a scan to generate insights.
          </p>
        ) : (
          <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
            {dashboardStats.topPorts.map((p, idx) => (
              <span key={idx} className="badge">
                🔓 Port {p.port} × {p.count}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ✅ Recent Scans Table */}
      <div className="card" style={{ marginTop: 14 }}>
        <div className="badge">🕒 Recent Scans</div>

        {loading ? (
          <p style={{ marginTop: 12, opacity: 0.8 }}>Loading scan history...</p>
        ) : history.length === 0 ? (
          <p style={{ marginTop: 12, opacity: 0.8 }}>
            No scans found. Start scanning from the Scanner page.
          </p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Target</th>
                <th>Port Range</th>
                <th>Risk</th>
                <th>Created</th>
                <th>Report</th>
              </tr>
            </thead>
            <tbody>
              {history.slice(0, 10).map((h) => {
                const d = scanDetails[h.id];
                const rl = (d?.risk_level || "LOW").toUpperCase();
                const rs = d?.risk_score ?? 0;

                return (
                  <tr key={h.id}>
                    <td style={{ fontWeight: 800 }}>{h.target}</td>
                    <td>{h.port_range}</td>

                    <td>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "6px 10px",
                          borderRadius: 999,
                          border: `1px solid ${riskBoxStyle(rl).border}`,
                          background: riskBoxStyle(rl).bg,
                          fontWeight: 900,
                        }}
                      >
                        {riskBadge(rl)} ({rs}/100)
                      </span>
                    </td>

                    <td style={{ opacity: 0.85 }}>{h.created_at}</td>

                    <td>
                      <button
                        className="btn btnPrimary"
                        onClick={() => navigate(`/report/${h.id}`)}
                      >
                        📄 View Report
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
