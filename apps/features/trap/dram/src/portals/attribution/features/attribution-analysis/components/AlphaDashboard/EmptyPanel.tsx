interface EmptyPanelProps {
  title: string;
}

export function EmptyPanel({ title }: EmptyPanelProps) {
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: 20,
        boxShadow: "0 10px 28px rgba(15, 23, 42, 0.08)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          padding: "18px 20px 8px 20px",
          flexWrap: "wrap",
        }}
      >
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{title}</h3>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 280,
          color: "#64748b",
          fontWeight: 600,
          fontSize: 14,
        }}
      >
        No data available for this selection.
      </div>
    </div>
  );
}