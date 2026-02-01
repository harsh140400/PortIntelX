import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar.jsx";
import { apiGet, apiPost, apiDelete } from "../api";


export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [scans, setScans] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingScans, setLoadingScans] = useState(true);

  async function loadUsers() {
    setLoadingUsers(true);
    const res = await apiGet("/admin/users");
    setUsers(Array.isArray(res) ? res : []);
    setLoadingUsers(false);
  }

  async function loadScans() {
    setLoadingScans(true);
    const res = await apiGet("/admin/scans");
    setScans(Array.isArray(res) ? res : []);
    setLoadingScans(false);
  }

  useEffect(() => {
    loadUsers();
    loadScans();
  }, []);

  async function disableUser(userId) {
    const ok = confirm(`Disable this user (ID: ${userId})?`);
    if (!ok) return;

    const res = await apiPost(`/admin/disable-user/${userId}`, {});
    if (!res.success) {
      alert(res.detail || "Failed to disable user");
      return;
    }

    alert("✅ User disabled successfully!");
    loadUsers();
  }

  async function deleteScan(scanId) {
    const ok = confirm(`🗑️ Delete scan report permanently? (ID: ${scanId})`);
    if (!ok) return;

    const res = await apiDelete(`/admin/scans/${scanId}`);

    if (!res.success) {
      alert(res.detail || "Failed to delete scan report");
      return;
    }

    alert("✅ Scan report deleted!");
    loadScans();
  }

  return (
    <div className="container">
      <Navbar />

      <div className="card">
        <div className="title">🛡️ Admin Panel</div>
        <p className="sub">
          Admin can manage users and scan reports. (Delete scan reports permanently)
        </p>
      </div>

      {/* ✅ USERS SECTION */}
      <div className="card" style={{ marginTop: 14 }}>
        <div className="badge">👥 User Management</div>

        {loadingUsers ? (
          <p style={{ marginTop: 12, opacity: 0.8 }}>Loading users...</p>
        ) : users.length === 0 ? (
          <p style={{ marginTop: 12, opacity: 0.8 }}>No users found.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Active</th>
              </tr>
            </thead>

            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 900 }}>{u.id}</td>
                  <td>{u.full_name}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className="badge">{u.role}</span>
                  </td>
                  <td>
                    <span className="badge">{u.is_active ? "✅ Active" : "❌ Disabled"}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ✅ SCANS SECTION */}
      <div className="card" style={{ marginTop: 14 }}>
        <div className="badge">📄 Scan Reports (Admin Control)</div>

        {loadingScans ? (
          <p style={{ marginTop: 12, opacity: 0.8 }}>Loading scan reports...</p>
        ) : scans.length === 0 ? (
          <p style={{ marginTop: 12, opacity: 0.8 }}>No scan reports found.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Scan ID</th>
                <th>User ID</th>
                <th>Target</th>
                <th>Port Range</th>
                <th>Created</th>
                <th>Delete</th>
              </tr>
            </thead>

            <tbody>
              {scans.map((s) => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 900 }}>{s.id}</td>
                  <td>{s.user_id}</td>
                  <td style={{ fontWeight: 800 }}>{s.target}</td>
                  <td>{s.port_range}</td>
                  <td style={{ opacity: 0.85 }}>{s.created_at}</td>
                  <td>
                    <button
                      className="btn btnDanger"
                      onClick={() => deleteScan(s.id)}
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
