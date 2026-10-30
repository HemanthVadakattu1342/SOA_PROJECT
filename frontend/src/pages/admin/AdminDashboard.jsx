import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { authAPI } from "../../api/auth";
import { expenseAPI } from "../../api/expenses";
import { budgetAPI } from "../../api/budgets";
import AppLayout from "../../components/layout/AppLayout";
import StatusBadge from "../../components/common/StatusBadge";
import StatCard from "../../components/common/StatCard";
import Loading from "../../components/common/Loading";
import { Icons } from "../../components/common/Icons";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [authHealth, setAuthHealth] = useState("CHECKING");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      authAPI.getAllUsers().then((r) => setUsers(r.data?.data || [])).catch(() => {}),
      expenseAPI.getAll(0, 50).then((r) => setExpenses(r.data?.data?.content || [])).catch(() => {}),
      budgetAPI.getAll().then((r) => setBudgets(r.data?.data || [])).catch(() => {}),
      authAPI.getAuditLogs(0, 6).then((r) => setAuditLogs(r.data?.data?.content || r.data?.data || [])).catch(() => {}),
      authAPI.health().then(() => setAuthHealth("UP")).catch(() => setAuthHealth("OFFLINE")),
    ]).finally(() => setLoading(false));
  }, []);

  const activeUsers = useMemo(() => users.filter((u) => u.active), [users]);
  const roleCount = (role) => users.filter((u) => u.role === role).length;
  const totalSpend = useMemo(
    () => expenses.reduce((s, e) => s + Number(e.amount || 0), 0),
    [expenses]
  );

  return (
    <AppLayout
      title="System Administration Portal"
      breadcrumbs={["System Admin", "Dashboard"]}
    >
      <div className="page-header-row">
        <div>
          <h2 className="page-headline">Enterprise System Control Center</h2>
          <p className="page-subheadline">
            Centralized governance of user identities, role access boundaries, and audit logging.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "4px 10px",
              borderRadius: "var(--radius-full)",
              background: authHealth === "UP" ? "var(--success-subtle)" : "var(--danger-subtle)",
              border: `1px solid ${authHealth === "UP" ? "var(--success-border)" : "var(--danger-border)"}`,
              fontSize: 12,
              fontWeight: 600,
              color: authHealth === "UP" ? "var(--success-text)" : "var(--danger-text)",
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: authHealth === "UP" ? "var(--success)" : "var(--danger)",
              }}
            />
            Services: {authHealth}
          </div>

          <Link to="/admin/users" className="btn btn-primary btn-sm">
            <Icons.Users size={14} /> Manage Users
          </Link>
        </div>
      </div>

      {loading ? (
        <Loading message="Aggregating system health and user directory…" />
      ) : (
        <>
          {/* Top KPI Stat Cards */}
          <div className="stats-grid">
            <StatCard
              icon={<Icons.Users size={22} />}
              label="Total Users"
              value={users.length}
              variant="purple"
              subtext={`${activeUsers.length} active directory accounts`}
            />
            <StatCard
              icon={<Icons.Shield size={22} />}
              label="System Admins"
              value={roleCount("SYSTEM_ADMIN")}
              variant="primary"
              subtext="Full privileges"
            />
            <StatCard
              icon={<Icons.Wallet size={22} />}
              label="Finance Admins"
              value={roleCount("FINANCE_ADMIN")}
              variant="primary"
              subtext="Treasury &amp; Budgets"
            />
            <StatCard
              icon={<Icons.CheckCircle size={22} />}
              label="Managers"
              value={roleCount("MANAGER")}
              variant="warning"
              subtext="Approval Authorities"
            />
            <StatCard
              icon={<Icons.Receipt size={22} />}
              label="Employees"
              value={roleCount("EMPLOYEE")}
              variant="success"
              subtext="Standard Claimants"
            />
          </div>

          {/* Shortcuts Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 24 }}>
            <Link to="/admin/users" className="card" style={{ padding: 16, display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
              <div className="stat-icon-wrap primary" style={{ width: 36, height: 36 }}>
                <Icons.Users size={18} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, color: "var(--text-primary)" }}>User Directory</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Provision accounts &amp; roles</div>
              </div>
            </Link>

            <Link to="/admin/expenses" className="card" style={{ padding: 16, display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
              <div className="stat-icon-wrap success" style={{ width: 36, height: 36 }}>
                <Icons.Receipt size={18} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, color: "var(--text-primary)" }}>Expense Admin</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{expenses.length} claims recorded</div>
              </div>
            </Link>

            <Link to="/admin/budgets" className="card" style={{ padding: 16, display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
              <div className="stat-icon-wrap warning" style={{ width: 36, height: 36 }}>
                <Icons.Wallet size={18} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, color: "var(--text-primary)" }}>Budget Oversight</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{budgets.length} active caps</div>
              </div>
            </Link>

            <Link to="/admin/audit-logs" className="card" style={{ padding: 16, display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
              <div className="stat-icon-wrap purple" style={{ width: 36, height: 36 }}>
                <Icons.Shield size={18} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, color: "var(--text-primary)" }}>Audit Trails</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Security compliance</div>
              </div>
            </Link>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20 }}>
            {/* Registered Users Table */}
            <div className="card">
              <div className="card-header">
                <div>
                  <div className="card-title">Registered System Users</div>
                  <div className="card-subtitle">Showing active accounts in directory</div>
                </div>
                <Link to="/admin/users" className="btn btn-ghost btn-sm">
                  View All <Icons.ChevronRight size={14} />
                </Link>
              </div>

              <div className="table-wrap">
                <table className="table-clean">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Role</th>
                      <th>Department</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.slice(0, 6).map((u) => (
                      <tr key={u.id}>
                        <td>
                          <div style={{ fontWeight: 600 }}>{u.firstName} {u.lastName}</div>
                          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{u.email}</div>
                        </td>
                        <td>
                          <span className={`role-badge ${u.role}`}>
                            {u.role?.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td>{u.department || "Enterprise"}</td>
                        <td>
                          <StatusBadge status={u.active ? "ACTIVE" : "INACTIVE"} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Audit Activity */}
            <div className="card">
              <div className="card-header">
                <div>
                  <div className="card-title">
                    <Icons.Shield size={16} style={{ color: "var(--accent-purple)" }} />
                    Recent Audit Activity
                  </div>
                  <div className="card-subtitle">Immutable access &amp; transaction logs</div>
                </div>
                <Link to="/admin/audit-logs" className="btn btn-ghost btn-sm">
                  All Logs
                </Link>
              </div>

              {auditLogs.length === 0 ? (
                <div style={{ textAlign: "center", padding: "32px 0", color: "var(--text-muted)", fontSize: 13 }}>
                  No recent audit records
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {auditLogs.slice(0, 5).map((log, i) => (
                    <div
                      key={log.id || i}
                      style={{
                        padding: "10px 12px",
                        background: "var(--bg-surface-subtle)",
                        borderRadius: "var(--radius-md)",
                        border: "1px solid var(--border-color)",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontWeight: 700, fontSize: 12, color: "var(--primary)" }}>
                          {log.action || "EVENT"}
                        </span>
                        <span style={{ fontSize: 10.5, color: "var(--text-muted)" }}>
                          {new Date(log.timestamp || log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>
                        {log.description || `Action by ${log.userEmail || "user"}`}
                      </div>
                      <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 4 }}>
                        User: {log.userEmail || log.userId} {log.ipAddress ? `· IP: ${log.ipAddress}` : ""}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </AppLayout>
  );
}
