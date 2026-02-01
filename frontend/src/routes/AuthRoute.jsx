import React from "react";
import { Navigate } from "react-router-dom";

export default function AuthRoute({ children }) {
  const token = localStorage.getItem("token");

  // ✅ If already logged in, redirect user to dashboard
  if (token) {
    return <Navigate to="/dashboard" />;
  }

  return children;
}
