export default function StatusBadge({ status, type = "expense" }) {
  if (!status) return null;

  const normalized = String(status).toUpperCase();

  // Status mapping
  const config = {
    // Expense Statuses
    DRAFT:        { label: "Draft",        cls: "badge-draft" },
    SUBMITTED:    { label: "Pending",      cls: "badge-submitted" },
    UNDER_REVIEW: { label: "Under Review", cls: "badge-submitted" },
    APPROVED:     { label: "Approved",     cls: "badge-approved" },
    REJECTED:     { label: "Rejected",     cls: "badge-rejected" },
    CANCELLED:    { label: "Cancelled",    cls: "badge-draft" },

    // Budget Statuses
    NORMAL:       { label: "Normal",       cls: "badge-normal" },
    WARNING:      { label: "Warning",      cls: "badge-warning" },
    CRITICAL:     { label: "Critical",     cls: "badge-critical" },
    EXCEEDED:     { label: "Exceeded",     cls: "badge-exceeded" },

    // Reconciliation Statuses
    ON_TRACK:     { label: "On Track",     cls: "badge-approved" },
    NEAR_LIMIT:   { label: "Near Limit",   cls: "badge-warning" },
    OVER_BUDGET:  { label: "Over Budget",  cls: "badge-rejected" },

    // User Account Status
    ACTIVE:       { label: "Active",       cls: "badge-approved" },
    INACTIVE:     { label: "Inactive",     cls: "badge-rejected" },
  };

  const item = config[normalized] || {
    label: normalized.replace(/_/g, " "),
    cls: "badge-draft",
  };

  return (
    <span className={`badge ${item.cls}`}>
      <span className="badge-dot" />
      {item.label}
    </span>
  );
}
