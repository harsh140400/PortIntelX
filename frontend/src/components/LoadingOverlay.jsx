import React from "react";

export default function LoadingOverlay({ show, text = "Loading..." }) {
  if (!show) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.box}>
        <div style={styles.spinner}></div>
        <p style={styles.text}>{text}</p>
      </div>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.65)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },
  box: {
    padding: "22px",
    borderRadius: "18px",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.18)",
    textAlign: "center",
    minWidth: "260px",
    backdropFilter: "blur(10px)",
    boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
  },
  spinner: {
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    border: "5px solid rgba(255,255,255,0.2)",
    borderTop: "5px solid rgba(0,255,231,0.9)",
    animation: "spin 0.9s linear infinite",
    margin: "auto",
  },
  text: {
    marginTop: 12,
    opacity: 0.9,
    fontWeight: 600,
  },
};
