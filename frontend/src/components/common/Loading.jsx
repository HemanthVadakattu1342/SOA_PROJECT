export default function Loading({ message = "Loading data…" }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 24px",
        gap: 12,
        color: "var(--text-muted)",
      }}
    >
      <div
        className="animate-spin"
        style={{
          width: 32,
          height: 32,
          border: "3px solid var(--border-color)",
          borderTopColor: "var(--primary)",
          borderRadius: "50%",
        }}
      />
      <div style={{ fontSize: 13, fontWeight: 500 }}>{message}</div>
    </div>
  );
}

export function SkeletonRow({ cols = 5 }) {
  return (
    <tr>
      {[...Array(cols)].map((_, i) => (
        <td key={i}>
          <div className="skeleton-pulse" style={{ height: 16, width: "80%" }} />
        </td>
      ))}
    </tr>
  );
}
