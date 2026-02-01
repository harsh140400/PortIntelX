import React from "react";
import { PieChart, Pie, Tooltip, ResponsiveContainer, Legend, Cell } from "recharts";

export default function SeverityChart({ openPorts = 0, cveFindings = 0 }) {
  const data = [
    { name: "Open Ports", value: Number(openPorts) || 0 },
    { name: "CVE Findings", value: Number(cveFindings) || 0 },
  ];

  const COLORS = ["#00ffe7", "#ff3b6b"]; // ✅ open ports = cyan/green, cve = red/pink

  return (
    <div className="card">
      <div className="badge">📊 Risk Overview</div>

      <div style={{ height: 260, marginTop: 14 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              outerRadius={95}
              innerRadius={55}
              label
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <p style={{ opacity: 0.75, lineHeight: 1.5 }}>
        Open ports increase attack surface, while CVE findings indicate known vulnerability exposure.
      </p>
    </div>
  );
}
