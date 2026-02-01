import React from "react";

export default function ResultTable({ rows }) {
  if (!rows || rows.length === 0) {
    return <p style={{ marginTop: 10, opacity: 0.75 }}>No open ports found.</p>;
  }

  return (
    <table className="table">
      <thead>
        <tr>
          <th>Port</th>
          <th>Service</th>
          <th>Banner</th>
        </tr>
      </thead>

      <tbody>
        {rows.map((p, idx) => (
          <tr key={idx}>
            <td>{p.port}</td>
            <td>{p.service}</td>
            <td style={{ opacity: 0.8 }}>
              {p.banner && p.banner.length > 0 ? p.banner : "—"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
