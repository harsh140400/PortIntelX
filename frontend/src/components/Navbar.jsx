import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role") || "user";

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    navigate("/login");
  }

  return (
    <div className="pxNav">
      <div className="pxNavInner">
        <div className="pxBrand">
          <div className="pxLogo">PortIntelX</div>
          <div className="pxTag">AI Network Recon & Vulnerability Scanner</div>
        </div>

        <div className="pxNavLinks">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              isActive ? "pxNavBtn pxActive" : "pxNavBtn"
            }
          >
            🏠 Dashboard
          </NavLink>

          <NavLink
            to="/scanner"
            className={({ isActive }) =>
              isActive ? "pxNavBtn pxActive" : "pxNavBtn"
            }
          >
            🔎 Scanner
          </NavLink>

          <NavLink
            to="/history"
            className={({ isActive }) =>
              isActive ? "pxNavBtn pxActive" : "pxNavBtn"
            }
          >
            🕒 History
          </NavLink>

          {role === "admin" && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                isActive ? "pxNavBtn pxActive" : "pxNavBtn"
              }
            >
              🛡️ Admin
            </NavLink>
          )}

          <button className="pxNavBtn pxLogout" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      </div>
    </div>
  );
}
