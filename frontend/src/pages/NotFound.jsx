import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="container">
      <div className="card">
        <h1 className="title">404</h1>
        <p className="sub">Page not found</p>
        <Link to="/" style={{ textDecoration: "underline" }}>Go to Login</Link>
      </div>
    </div>
  );
}
