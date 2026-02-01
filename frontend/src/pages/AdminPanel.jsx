import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar.jsx";
import { apiGet, apiDelete } from "../api";

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  async function loadAll() {
    setLoading(true);
    setMsg("");
    try {
      const u = await apiGet("/admin/users");
      const s = await apiGet("/admin/scans");
      setUsers(u || []);
      setScans(s || []);
    } catch (err) {
      setMsg("❌ Admin data fetch failed. Make sure you are logged in as admin.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function deleteUser(userId) {
    const confirmDel = confirm("Are you sure you want to delete this user permanently?");
    if (!confirmDel) return;

    try {
      const res = await apiDelete(`/admin/users/${userId}`);
      alert(res?.message || "✅ User deleted");
      loadAll();
    } catch (e) {
      alert("❌ Failed to delete user. (Maybe admin/self/admin restriction)");
    }
  }

  async function deleteScan(scanId) {
    const confirmDel = confirm("Delete this scan report permanently?");
    if (!confirmDel) return;

    try {
      const res = await apiDelete(`/admin/scans/${scanId}`);
      alert(res?.message || "✅ Scan deleted");
      loadAll();
    } catch (e) {
      alert("❌ Failed to delete scan report.");
    }
  }

  return (
    <div className="container">
      <Navbar />

      <div className="card">
        <div className="title">🛡️ Admin Panel</div>
        <p className="sub">
          Manage users and scan reports (enterprise-level control).
        </p>

        {msg && (
          <div style={{ marginTop: 12 }} className="badge">
            {msg}
          </div>
        )}

        {loading ? (
          <p style={{ marginTop: 14, opacity: 0.8 }}>Loading admin data...</p>
        ) : (
          <>
            {/* ✅ USERS */}
            <div style={{ marginTop: 18 }}>
              <div className="badge">👥 Users Management</div>

              {users.length === 0 ? (
                <p style={{ marginTop: 12, opacity: 0.8 }}>No users found.</p>
              ) : (
                <table className="table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id}>
                        <td>{u.id}</td>
                        <td style={{ fontWeight: 900 }}>{u.full_name}</td>
                        <td>{u.email}</td>
                        <td>{u.role}</td>
                        <td>{u.is_active ? "Active" : "Disabled"}</td>
                        <td>
                          {u.role === "admin" ? (
                            <span className="badge">🔒 Protected</span>
                          ) : (
                            <button
                              className="btn btnDanger"
                              onClick={() => deleteUser(u.id)}
                            >
                              🗑️ Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* ✅ SCANS */}
            <div style={{ marginTop: 22 }}>
              <div className="badge">📄 Scan Reports Management</div>

              {scans.length === 0 ? (
                <p style={{ marginTop: 12, opacity: 0.8 }}>No scan reports found.</p>
              ) : (
                <table className="table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>User ID</th>
                      <th>Target</th>
                      <th>Port Range</th>
                      <th>Created</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scans.map((s) => (
                      <tr key={s.id}>
                        <td>{s.id}</td>
                        <td>{s.user_id}</td>
                        <td style={{ fontWeight: 900 }}>{s.target}</td>
                        <td>{s.port_range}</td>
                        <td>{s.created_at}</td>
                        <td>
                          <button
                            className="btn btnDanger"
                            onClick={() => deleteScan(s.id)}
                          >
                            🗑️ Delete Report
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
