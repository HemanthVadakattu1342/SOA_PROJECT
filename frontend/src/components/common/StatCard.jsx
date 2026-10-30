export default function StatCard({
  icon,
  label,
  value,
  variant = "primary",
  subtext,
  trend, // { direction: "up" | "down", label: "+12%" }
  onClick,
}) {
  return (
    <div
      className="stat-card"
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : "default" }}
    >
      <div className={`stat-icon-wrap ${variant}`}>{icon}</div>
      <div className="stat-body">
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
        {(subtext || trend) && (
          <div className="stat-subtext">
            {trend && (
              <span
                style={{
                  color: trend.direction === "up" ? "var(--success)" : "var(--danger)",
                  fontWeight: 600,
                  marginRight: 4,
                }}
              >
                {trend.direction === "up" ? "↑" : "↓"} {trend.label}
              </span>
            )}
            {subtext && <span>{subtext}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
