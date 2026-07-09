import React from "react";

export default function Spinner({ fullPage }) {
  if (fullPage) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        <div className="spinner" />
      </div>
    );
  }
  return (
    <div className="spinner-overlay">
      <div className="spinner" />
    </div>
  );
}
