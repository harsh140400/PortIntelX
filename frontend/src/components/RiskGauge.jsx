import React from "react";

export default function RiskGauge({ score = 0 }) {
  const safeScore = Math.max(0, Math.min(100, Number(score) || 0));

  // ✅ convert score to degrees (semi-circle)
  const angle = (safeScore / 100) * 180;

  // ✅ gauge color logic
  let label = "Low";
  let color = "#00ffe7";
  if (safeScore >= 70) {
    label = "High";
    color = "#ff3b6b";
  } else if (safeScore >= 40) {
    label = "Medium";
    color = "#ffaa00";
  }

  return (
    <div className="card">
      <div className="badge">🎯 Risk Score (0–100)</div>

      <div style={{ marginTop: 14, textAlign: "center" }}>
        <div style={{ position: "relative", width: 220, height: 120, margin: "auto" }}>
          {/* ✅ Semi circle gauge */}
          <div
            style={{
              width: 220,
              height: 110,
              borderTopLeftRadius: 220,
              borderTopRightRadius: 220,
              border: "16px solid rgba(255,255,255,0.12)",
              borderBottom: "0px solid transparent",
              position: "absolute",
              bottom: 0,
              left: 0,
            }}
          ></div>

          {/* ✅ Needle */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: "50%",
              width: 4,
              height: 95,
              background: color,
              transformOrigin: "bottom center",
              transform: `translateX(-50%) rotate(${angle - 90}deg)`,
              borderRadius: 8,
              boxShadow: "0 0 18px rgba(0,0,0,0.3)",
            }}
          ></div>

          {/* ✅ center circle */}
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: "50%",
              background: color,
              position: "absolute",
              bottom: -4,
              left: "50%",
              transform: "translateX(-50%)",
              boxShadow: "0 0 14px rgba(0,0,0,0.45)",
            }}
          ></div>
        </div>

        <h2 style={{ marginTop: 10, fontSize: "2.4rem" }}>{safeScore}</h2>
        <p style={{ marginTop: 6, opacity: 0.85 }}>
          Severity Level: <b style={{ color }}>{label}</b>
        </p>

        <p style={{ opacity: 0.7, marginTop: 10, lineHeight: 1.6 }}>
          This score is calculated using open ports, exposed remote access services, and CVE findings.
        </p>
      </div>
    </div>
  );
}
