import { Icons } from "./Icons";

export default function EmptyState({
  icon = <Icons.Receipt size={24} />,
  title = "No data found",
  description = "There are no records matching your criteria.",
  action,
}) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <div className="empty-state-title">{title}</div>
      {description && <div className="empty-state-desc">{description}</div>}
      {action && <div style={{ marginTop: 16 }}>{action}</div>}
    </div>
  );
}
