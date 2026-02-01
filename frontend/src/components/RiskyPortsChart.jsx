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

export default function RiskyPortsChart({ openPorts = [] }) {
  // ✅ risk weight (industry feel)
  function riskWeight(port) {
    const highRisk = [21, 23, 25, 53, 139, 445, 3306, 3389];
    const mediumRisk = [80, 8080, 110, 143, 5900];

    if (highRisk.includes(port)) return 90;
    if (mediumRisk.includes(port)) return 55;
    return 25;
  }

  // ✅ color per port (different bar colors)
  const COLORS = [
    "#00ffe7",
    "#ff3b6b",
    "#ffaa00",
    "#00aaff",
    "#a855f7",
    "#22c55e",
    "#f97316",
    "#eab308",
    "#38bdf8",
    "#fb7185",
  ];

  const chartData = (openPorts || [])
    .slice(0, 10)
    .map((p) => ({
      port: String(p.port),
      risk: riskWeight(p.port),
      service: p.service || "Unknown",
    }));

  return (
    <div className="card">
      <div className="badge">📈 Top Risky Ports</div>

      {chartData.length === 0 ? (
        <p style={{ marginTop: 12, opacity: 0.8 }}>
          No open ports available for risky port analysis.
        </p>
      ) : (
        <div style={{ height: 280, marginTop: 14 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.12} />
              <XAxis dataKey="port" />
              <YAxis domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  background: "rgba(0,0,0,0.75)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: 12,
                  color: "white",
                }}
                labelStyle={{ color: "white", fontWeight: 800 }}
                formatter={(value, name, props) => {
                  if (name === "risk") {
                    return [`${value}/100`, `Risk Score (${props?.payload?.service})`];
                  }
                  return [value, name];
                }}
              />
              <Bar dataKey="risk" radius={[10, 10, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <p style={{ opacity: 0.7, marginTop: 10, lineHeight: 1.6 }}>
        Risk scoring is based on common attack surface ports and remote access exposures.
      </p>
    </div>
  );
}
