import React from "react";

export default function ScanCard({ title, value, icon, subtitle }) {
  return (
    <div className="card">
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <div style={{ width: "100%" }}>
          <div className="badge">
            {icon} {title}
          </div>

          <h2 style={{ marginTop: 10, fontSize: "1.9rem" }}>{value}</h2>

          <p style={{ marginTop: 6, opacity: 0.75, lineHeight: 1.5 }}>
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
}
