// features/de/dqm/src/HelloWorld.tsx
import React from "react";

export default function TestPage() {
  return (
    <div
      style={{
        padding: "2rem",
        fontFamily: "Segoe UI, sans-serif",
        textAlign: "center",
      }}
    >
      <h1>👋 Test Page from @de/dqm</h1>
      <p>If you can see this, the alias resolved correctly.</p>
      <p style={{ color: "green", fontWeight: 600 }}>
        @de/dqm/src/App → App.tsx → TestPage.tsx ✅
      </p>
    </div>
  );
}