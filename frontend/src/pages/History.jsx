import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar.jsx";
import { apiGet } from "../api";
import { useNavigate } from "react-router-dom";

export default function History() {
  const [scans, setScans] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      const data = await apiGet("/history");
      setScans(data || []);
    }
    load();
  }, []);

  return (
    <div className="container">
      <Navbar />

      <div className="card">
        <div className="title">🕘 Scan History</div>
        <div className="sub">View previous scans and generate reports instantly</div>

        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Target</th>
              <th>Port Range</th>
              <th>Date</th>
              <th>Report</th>
            </tr>
          </thead>
          <tbody>
            {scans.map((s) => (
              <tr key={s.id}>
                <td>{s.id}</td>
                <td>{s.target}</td>
                <td>{s.port_range}</td>
                <td style={{ opacity: 0.8 }}>{s.created_at}</td>
                <td>
                  <button
                    className="btn btnPrimary"
                    onClick={() => navigate(`/report/${s.id}`)}
                  >
                    View Report
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {scans.length === 0 && (
          <p style={{ marginTop: 12, opacity: 0.8 }}>No scans found yet.</p>
        )}
      </div>
    </div>
  );
}
