import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { expenseAPI } from "../../api/expenses";
import { notificationAPI } from "../../api/notifications";
import { useAuth } from "../../context/AuthContext";
import AppLayout from "../../components/layout/AppLayout";
import StatusBadge from "../../components/common/StatusBadge";
import StatCard from "../../components/common/StatCard";
import Loading from "../../components/common/Loading";
import EmptyState from "../../components/common/EmptyState";
import ExpenseDetailModal from "../../components/common/ExpenseDetailModal";
import { Icons } from "../../components/common/Icons";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const PIE_COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [feedbackMsg, setFeedbackMsg] = useState("");

  const loadData = () => {
    setLoading(true);
    Promise.all([
      expenseAPI.getMy(0, 50).then((r) => setExpenses(r.data?.data?.content || [])),
      notificationAPI.getMy(0, 4).then((r) => setNotifications(r.data?.data?.content || [])),
    ])
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  // Aggregated Stats
  const approved = useMemo(() => expenses.filter((e) => e.status === "APPROVED"), [expenses]);
  const pending = useMemo(() => expenses.filter((e) => e.status === "SUBMITTED"), [expenses]);
  const rejected = useMemo(() => expenses.filter((e) => e.status === "REJECTED"), [expenses]);
  const totalAmount = useMemo(() => expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0), [expenses]);

  // Category Distribution for Chart
  const categoryChartData = useMemo(() => {
    const map = {};
    expenses.forEach((e) => {
      const cat = e.categoryName || "Other";
      map[cat] = (map[cat] || 0) + Number(e.amount || 0);
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [expenses]);

  // Monthly/Date Trend Data
  const trendData = useMemo(() => {
    const map = {};
    expenses.forEach((e) => {
      const dateKey = e.expenseDate || "Recent";
      map[dateKey] = (map[dateKey] || 0) + Number(e.amount || 0);
    });
    return Object.entries(map)
      .slice(-6)
      .map(([date, amount]) => ({ date, amount }));
  }, [expenses]);

  return (
    <AppLayout
      title="Employee Portal"
      breadcrumbs={["Employee", "Dashboard"]}
    >
      {/* Welcome Banner */}
      <div className="page-header-row">
        <div>
          <h2 className="page-headline">
            Welcome back, {user?.firstName || "Team Member"}
          </h2>
          <p className="page-subheadline">
            {user?.department ? `${user.department} Department` : "Corporate Operations"} · Employee ID: {user?.employeeId || "—"}
          </p>
        </div>

        <Link to="/employee/new-expense" className="btn btn-primary">
          <Icons.Plus size={16} /> New Expense Claim
        </Link>
      </div>

      {feedbackMsg && (
        <div className="alert-box success">
          <Icons.CheckCircle size={16} />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {loading ? (
        <Loading message="Fetching your expense records and metrics…" />
      ) : (
        <>
          {/* KPI Stat Cards */}
          <div className="stats-grid">
            <StatCard
              icon={<Icons.Receipt size={22} />}
              label="Total Claims"
              value={expenses.length}
              variant="primary"
              subtext="Submitted across all periods"
            />
            <StatCard
              icon={<Icons.CheckCircle size={22} />}
              label="Approved"
              value={approved.length}
              variant="success"
              subtext={`₹${approved.reduce((s, e) => s + Number(e.amount || 0), 0).toLocaleString("en-IN")}`}
            />
            <StatCard
              icon={<Icons.Clock size={22} />}
              label="Pending Review"
              value={pending.length}
              variant="warning"
              subtext="Awaiting manager sign-off"
            />
            <StatCard
              icon={<Icons.XCircle size={22} />}
              label="Rejected"
              value={rejected.length}
              variant="danger"
              subtext="Claims requiring revisions"
            />
            <StatCard
              icon={<Icons.Wallet size={22} />}
              label="Total Volume"
              value={`₹${totalAmount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`}
              variant="purple"
              subtext="All historical claims"
            />
          </div>

          {/* Visual Analytics */}
          {expenses.length > 0 && (
            <div className="chart-grid">
              <div className="card chart-card">
                <div className="card-header">
                  <div>
                    <div className="card-title">
                      <Icons.TrendingUp size={16} style={{ color: "var(--primary)" }} />
                      Expense Trends
                    </div>
                    <div className="card-subtitle">Spending volume by date</div>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={trendData}>
                    <XAxis dataKey="date" tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
                    <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} tickFormatter={(v) => `₹${v}`} />
                    <Tooltip
                      formatter={(v) => `₹${Number(v).toLocaleString("en-IN")}`}
                      contentStyle={{
                        background: "var(--bg-surface)",
                        border: "1px solid var(--border-color)",
                        borderRadius: "var(--radius-md)",
                        color: "var(--text-primary)",
                      }}
                    />
                    <Bar dataKey="amount" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="card chart-card">
                <div className="card-header">
                  <div>
                    <div className="card-title">
                      <Icons.PieChart size={16} style={{ color: "var(--primary)" }} />
                      Spending by Category
                    </div>
                    <div className="card-subtitle">Breakdown of personal claims</div>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={categoryChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {categoryChartData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v) => `₹${Number(v).toLocaleString("en-IN")}`}
                      contentStyle={{
                        background: "var(--bg-surface)",
                        border: "1px solid var(--border-color)",
                        borderRadius: "var(--radius-md)",
                        color: "var(--text-primary)",
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12, color: "var(--text-secondary)" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Recent Submissions & Notifications Layout */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
            {/* Recent Expenses Table */}
            <div className="card">
              <div className="card-header">
                <div>
                  <div className="card-title">Recent Expense Claims</div>
                  <div className="card-subtitle">Your latest submitted claims</div>
                </div>
                <Link to="/employee/expenses" className="btn btn-ghost btn-sm">
                  View All <Icons.ChevronRight size={14} />
                </Link>
              </div>

              {expenses.length === 0 ? (
                <EmptyState
                  icon={<Icons.Receipt size={28} />}
                  title="No expense claims yet"
                  description="Submit your first travel, food, or operational claim."
                  action={
                    <Link to="/employee/new-expense" className="btn btn-primary btn-sm">
                      <Icons.Plus size={14} /> Create Expense
                    </Link>
                  }
                />
              ) : (
                <div className="table-wrap">
                  <table className="table-clean">
                    <thead>
                      <tr>
                        <th>Claim #</th>
                        <th>Description</th>
                        <th>Category</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expenses.slice(0, 5).map((e) => (
                        <tr key={e.id}>
                          <td style={{ fontWeight: 600, color: "var(--primary)" }}>
                            {e.expenseNumber || `#${e.id}`}
                          </td>
                          <td style={{ maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {e.description}
                          </td>
                          <td>{e.categoryName || "General"}</td>
                          <td style={{ fontWeight: 600 }}>
                            ₹{Number(e.amount).toLocaleString("en-IN")}
                          </td>
                          <td>
                            <StatusBadge status={e.status} />
                          </td>
                          <td>
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => setSelectedExpense(e)}
                              title="View details"
                            >
                              <Icons.Eye size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Recent Notifications Snippet */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">
                  <Icons.Bell size={16} style={{ color: "var(--primary)" }} />
                  Activity
                </div>
                <Link to="/employee/notifications" className="btn btn-ghost btn-sm">
                  All
                </Link>
              </div>

              {notifications.length === 0 ? (
                <div style={{ textAlign: "center", padding: "32px 0", color: "var(--text-muted)", fontSize: 13 }}>
                  No new notifications
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      style={{
                        padding: 10,
                        borderRadius: "var(--radius-md)",
                        background: "var(--bg-surface-subtle)",
                        border: "1px solid var(--border-color)",
                      }}
                    >
                      <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-primary)" }}>
                        {n.title}
                      </div>
                      <div style={{ fontSize: 11.5, color: "var(--text-secondary)", marginTop: 2 }}>
                        {n.message}
                      </div>
                      <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 4 }}>
                        {new Date(n.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Expense Detail Modal */}
      <ExpenseDetailModal
        expense={selectedExpense}
        isOpen={Boolean(selectedExpense)}
        onClose={() => setSelectedExpense(null)}
        onActionComplete={(msg) => {
          setFeedbackMsg(msg);
          loadData();
          setTimeout(() => setFeedbackMsg(""), 4000);
        }}
      />
    </AppLayout>
  );
}
