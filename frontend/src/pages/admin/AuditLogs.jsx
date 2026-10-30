import { useState, useEffect } from "react";
import { authAPI } from "../../api/auth";
import AppLayout from "../../components/layout/AppLayout";
import Loading from "../../components/common/Loading";
import Modal from "../../components/common/Modal";
import DataTable from "../../components/common/DataTable";
import { Icons } from "../../components/common/Icons";

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState(null);

  const loadAuditLogs = () => {
    setLoading(true);
    authAPI
      .getAuditLogs(0, 100)
      .then((res) => {
        // Backend returns Page<AuditLog> or List<AuditLog>
        const content = res.data?.data?.content || res.data?.data || [];
        setLogs(content);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAuditLogs();
  }, []);

  const getActionBadgeColor = (action) => {
    const act = String(action || "").toUpperCase();
    if (act.includes("LOGIN") || act.includes("AUTH")) return "var(--primary)";
    if (act.includes("CREATE") || act.includes("SUBMIT")) return "var(--success)";
    if (act.includes("APPROVE")) return "var(--success)";
    if (act.includes("REJECT") || act.includes("DELETE")) return "var(--danger)";
    if (act.includes("UPDATE") || act.includes("BUDGET")) return "var(--warning)";
    return "var(--accent-purple)";
  };

  const columns = [
    {
      key: "timestamp",
      label: "Timestamp",
      sortable: true,
      render: (row) => (
        <span style={{ fontSize: 12.5, color: "var(--text-muted)", whiteSpace: "nowrap" }}>
          {new Date(row.timestamp || row.createdAt).toLocaleString("en-IN", {
            dateStyle: "medium",
            timeStyle: "medium",
          })}
        </span>
      ),
    },
    {
      key: "userEmail",
      label: "Actor / User",
      sortable: true,
      render: (row) => (
        <div>
          <span style={{ fontWeight: 600 }}>{row.userEmail || "System"}</span>
          {row.userId && (
            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
              ID: {row.userId}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "action",
      label: "Action",
      sortable: true,
      render: (row) => {
        const color = getActionBadgeColor(row.action);
        return (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              padding: "2px 8px",
              borderRadius: "var(--radius-sm)",
              fontSize: 11,
              fontWeight: 700,
              background: `color-mix(in srgb, ${color} 12%, transparent)`,
              color: color,
              border: `1px solid color-mix(in srgb, ${color} 25%, transparent)`,
            }}
          >
            {row.action || "EVENT"}
          </span>
        );
      },
    },
    {
      key: "description",
      label: "Activity Description",
      sortable: true,
      render: (row) => (
        <div style={{ maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {row.description || "—"}
        </div>
      ),
    },
    {
      key: "ipAddress",
      label: "IP Address",
      sortable: true,
      render: (row) => (
        <span style={{ fontFamily: "monospace", fontSize: 12, color: "var(--text-secondary)" }}>
          {row.ipAddress || "Internal"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Details",
      sortable: false,
      render: (row) => (
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => setSelectedLog(row)}
          title="Inspect log entry"
        >
          <Icons.Eye size={14} /> View
        </button>
      ),
    },
  ];

  return (
    <AppLayout
      title="System Audit Trail"
      breadcrumbs={["System Admin", "Audit Logs"]}
    >
      <div className="page-header-row">
        <div>
          <h2 className="page-headline">Security &amp; Transaction Audit Trail</h2>
          <p className="page-subheadline">
            Immutable log record capturing security authentications, approval events, and policy adjustments.
          </p>
        </div>

        <button className="btn btn-outline btn-sm" onClick={loadAuditLogs}>
          <Icons.Refresh size={14} /> Refresh Logs
        </button>
      </div>

      <div className="card">
        {loading ? (
          <Loading message="Streaming audit records…" />
        ) : (
          <DataTable
            columns={columns}
            data={logs}
            searchable={true}
            searchPlaceholder="Search audit trails by user email, action, IP, description…"
            searchKeys={["userEmail", "action", "description", "ipAddress"]}
            exportFilename="spendwise-audit-trail.csv"
            defaultSortKey="timestamp"
            defaultSortDir="desc"
            pageSize={15}
            emptyTitle="No audit records found"
            emptyDesc="Audit logs will record user logins, expense creations, and approval actions."
          />
        )}
      </div>

      {/* Audit Detail Modal */}
      <Modal
        isOpen={Boolean(selectedLog)}
        onClose={() => setSelectedLog(null)}
        title="Audit Record Inspector"
        size="md"
        footer={
          <button className="btn btn-primary btn-sm" onClick={() => setSelectedLog(null)}>
            Dismiss
          </button>
        }
      >
        {selectedLog && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ background: "var(--bg-surface-subtle)", padding: 10, borderRadius: "var(--radius-sm)" }}>
                <div className="form-hint">Log ID</div>
                <div style={{ fontWeight: 600 }}>#{selectedLog.id}</div>
              </div>
              <div style={{ background: "var(--bg-surface-subtle)", padding: 10, borderRadius: "var(--radius-sm)" }}>
                <div className="form-hint">Action</div>
                <div style={{ fontWeight: 700, color: getActionBadgeColor(selectedLog.action) }}>
                  {selectedLog.action}
                </div>
              </div>
            </div>

            <div style={{ background: "var(--bg-surface-subtle)", padding: 12, borderRadius: "var(--radius-sm)" }}>
              <div className="form-hint">Actor / Email</div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{selectedLog.userEmail || "System"}</div>
              {selectedLog.userId && (
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                  User ID: {selectedLog.userId}
                </div>
              )}
            </div>

            <div style={{ background: "var(--bg-surface-subtle)", padding: 12, borderRadius: "var(--radius-sm)" }}>
              <div className="form-hint">Description / Event Payload</div>
              <div style={{ fontSize: 13, marginTop: 4, lineHeight: 1.5 }}>
                {selectedLog.description || "No additional description recorded."}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ background: "var(--bg-surface-subtle)", padding: 10, borderRadius: "var(--radius-sm)" }}>
                <div className="form-hint">Client IP</div>
                <div style={{ fontFamily: "monospace", fontSize: 12 }}>{selectedLog.ipAddress || "Internal Gateway"}</div>
              </div>
              <div style={{ background: "var(--bg-surface-subtle)", padding: 10, borderRadius: "var(--radius-sm)" }}>
                <div className="form-hint">Recorded Timestamp</div>
                <div style={{ fontSize: 12 }}>
                  {new Date(selectedLog.timestamp || selectedLog.createdAt).toLocaleString()}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-muted)", fontSize: 11, marginTop: 8 }}>
              <Icons.Shield size={14} /> Immutable system record. Cannot be edited or deleted.
            </div>
          </div>
        )}
      </Modal>
    </AppLayout>
  );
}
