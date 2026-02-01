import React from "react";
import {
  BarChart,
  Bar,
  Tooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
} from "recharts";

export default function SeverityBreakdownChart({ riskScore = 0 }) {
  const safeScore = Math.max(0, Math.min(100, Number(riskScore) || 0));

  // ✅ distribution logic
  // This is simple and visually attractive for reports
  let low = 0;
  let medium = 0;
  let high = 0;

  if (safeScore < 40) {
    low = safeScore;
    medium = 0;
    high = 0;
  } else if (safeScore < 70) {
    low = 35;
    medium = safeScore - 35;
    high = 0;
  } else {
    low = 35;
    medium = 30;
    high = safeScore - 65;
  }

  const data = [
    { level: "Low", value: Math.round(low) },
    { level: "Medium", value: Math.round(medium) },
    { level: "High", value: Math.round(high) },
  ];

  const COLORS = {
    Low: "#22c55e",
    Medium: "#ffaa00",
    High: "#ff3b6b",
  };

  return (
    <div className="card">
      <div className="badge">📊 Severity Breakdown</div>

      <div style={{ height: 260, marginTop: 14 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.12} />
            <XAxis dataKey="level" />
            <YAxis domain={[0, 100]} />
            <Tooltip
              contentStyle={{
                background: "rgba(0,0,0,0.75)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 12,
                color: "white",
              }}
              labelStyle={{ color: "white", fontWeight: 800 }}
              formatter={(value) => [`${value}%`, "Severity Share"]}
            />
            <Bar dataKey="value" radius={[12, 12, 0, 0]}>
              {data.map((entry, idx) => (
                <Cell key={idx} fill={COLORS[entry.level]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <p style={{ opacity: 0.7, marginTop: 10, lineHeight: 1.6 }}>
        Severity breakdown represents how much of the assessment falls into Low, Medium and High risk categories.
      </p>
    </div>
  );
}
