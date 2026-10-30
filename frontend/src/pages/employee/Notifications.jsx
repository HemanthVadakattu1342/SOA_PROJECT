import { useState, useEffect } from "react";
import { notificationAPI } from "../../api/notifications";
import AppLayout from "../../components/layout/AppLayout";
import Loading from "../../components/common/Loading";
import EmptyState from "../../components/common/EmptyState";
import { Icons } from "../../components/common/Icons";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL"); // "ALL" | "UNREAD"
  const [feedback, setFeedback] = useState("");

  const loadNotifications = () => {
    setLoading(true);
    notificationAPI
      .getMy(0, 50)
      .then((res) => {
        setNotifications(res.data?.data?.content || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setFeedback("All notifications marked as read.");
      setTimeout(() => setFeedback(""), 3000);
    } catch {
      // ignore
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "EXPENSE_APPROVED":
        return <Icons.CheckCircle size={18} style={{ color: "var(--success)" }} />;
      case "EXPENSE_REJECTED":
        return <Icons.XCircle size={18} style={{ color: "var(--danger)" }} />;
      case "EXPENSE_SUBMITTED":
        return <Icons.Receipt size={18} style={{ color: "var(--primary)" }} />;
      case "BUDGET_WARNING":
      case "BUDGET_CRITICAL":
      case "BUDGET_EXCEEDED":
        return <Icons.AlertTriangle size={18} style={{ color: "var(--warning)" }} />;
      default:
        return <Icons.Bell size={18} style={{ color: "var(--primary)" }} />;
    }
  };

  const filtered = filter === "ALL"
    ? notifications
    : notifications.filter((n) => !n.read);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <AppLayout
      title="Notification Center"
      breadcrumbs={["Portal", "Notifications"]}
    >
      <div style={{ maxWidth: 840, margin: "0 auto" }}>
        <div className="page-header-row">
          <div>
            <h2 className="page-headline">Notifications &amp; Activity Stream</h2>
            <p className="page-subheadline">
              Real-time updates regarding claim approvals, budget alerts, and system notices.
            </p>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {unreadCount > 0 && (
              <button className="btn btn-secondary btn-sm" onClick={handleMarkAllRead}>
                <Icons.Check size={14} /> Mark All as Read
              </button>
            )}
            <button className="btn btn-outline btn-sm" onClick={loadNotifications} title="Refresh notifications">
              <Icons.Refresh size={14} /> Refresh
            </button>
          </div>
        </div>

        {feedback && (
          <div className="alert-box success">
            <Icons.CheckCircle size={16} />
            <span>{feedback}</span>
          </div>
        )}

        {/* Tab Filter */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <button
            className={`btn ${filter === "ALL" ? "btn-primary" : "btn-secondary"} btn-sm`}
            onClick={() => setFilter("ALL")}
          >
            All Updates ({notifications.length})
          </button>
          <button
            className={`btn ${filter === "UNREAD" ? "btn-primary" : "btn-secondary"} btn-sm`}
            onClick={() => setFilter("UNREAD")}
          >
            Unread Only ({unreadCount})
          </button>
        </div>

        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          {loading ? (
            <Loading message="Loading notifications…" />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={<Icons.Bell size={28} />}
              title={filter === "UNREAD" ? "No unread notifications" : "All caught up"}
              description="You have no notifications pending at this time."
            />
          ) : (
            <div>
              {filtered.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: "16px 20px",
                    borderBottom: "1px solid var(--border-color)",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 14,
                    background: item.read ? "var(--bg-surface)" : "var(--primary-subtle)",
                    transition: "background 0.15s ease",
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "var(--radius-md)",
                      background: "var(--bg-surface)",
                      border: "1px solid var(--border-color)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {getNotificationIcon(item.type)}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 14, fontWeight: item.read ? 600 : 700, color: "var(--text-primary)" }}>
                        {item.title}
                      </span>
                      <span style={{ fontSize: 11.5, color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                        {new Date(item.createdAt).toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </span>
                    </div>

                    <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                      {item.message}
                    </p>

                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
                      <span className="badge badge-draft" style={{ fontSize: 10 }}>
                        {item.type?.replace(/_/g, " ")}
                      </span>
                      {!item.read && (
                        <span className="badge badge-submitted" style={{ fontSize: 10 }}>
                          Unread
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
