import React from "react";

export default function Resume() {
  return (
    <div style={{ maxWidth: 800, margin: "auto", padding: 20 }}>
      <h1 style={{ textAlign: "center" }}>My Resume</h1>
      <iframe
        src={process.env.PUBLIC_URL + "/Manuel_Ruiz_Resume-Manuel.pdf"}
        width="100%"
        height="800px"
        title="Manuel Ruiz Resume"
        style={{ border: "1px solid #ccc", borderRadius: 8 }}
      />
    </div>
  );
}
