import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { expenseAPI } from "../../api/expenses";
import { budgetAPI } from "../../api/budgets";
import { useAuth } from "../../context/AuthContext";
import AppLayout from "../../components/layout/AppLayout";
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

export default function ManagerDashboard() {
  const { user } = useAuth();
  const [pending, setPending] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [teamExpenses, setTeamExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [actionFeedback, setActionFeedback] = useState("");

  const loadDashboardData = () => {
    setLoading(true);
    Promise.all([
      expenseAPI.getPending(0, 50).then((r) => setPending(r.data?.data?.content || [])),
      budgetAPI.getSummary().then((r) => setBudgets(r.data?.data || [])),
      expenseAPI.getAll(0, 50).then((r) => setTeamExpenses(r.data?.data?.content || [])),
    ])
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Budget calculations
  const totalAllocated = useMemo(
    () => budgets.reduce((s, b) => s + Number(b.allocatedAmount || 0), 0),
    [budgets]
  );
  const totalSpent = useMemo(
    () => budgets.reduce((s, b) => s + Number(b.spentAmount || 0), 0),
    [budgets]
  );
  const budgetAlerts = useMemo(
    () => budgets.filter((b) => ["WARNING", "CRITICAL", "EXCEEDED"].includes(b.status)),
    [budgets]
  );

  // Category spending breakdown for Chart
  const categorySpending = useMemo(() => {
    const map = {};
    teamExpenses.forEach((e) => {
      const cat = e.categoryName || "General";
      map[cat] = (map[cat] || 0) + Number(e.amount || 0);
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [teamExpenses]);

  return (
    <AppLayout
      title="Manager Portal"
      breadcrumbs={["Management", "Dashboard"]}
    >
      <div className="page-header-row">
        <div>
          <h2 className="page-headline">Manager Overview &amp; Approvals</h2>
          <p className="page-subheadline">
            {user?.department ? `${user.department} Department` : "Team Oversight"} · Corporate Financial Governance
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <Link to="/manager/pending" className="btn btn-primary">
            <Icons.CheckCircle size={15} /> Review Queue ({pending.length})
          </Link>
        </div>
      </div>

      {actionFeedback && (
        <div className="alert-box success">
          <Icons.CheckCircle size={16} />
          <span>{actionFeedback}</span>
        </div>
      )}

      {loading ? (
        <Loading message="Aggregating team expenses and department budgets…" />
      ) : (
        <>
          {/* Stat Cards */}
          <div className="stats-grid">
            <StatCard
              icon={<Icons.Clock size={22} />}
              label="Pending Approvals"
              value={pending.length}
              variant="warning"
              subtext="Requires your sign-off"
            />
            <StatCard
              icon={<Icons.Wallet size={22} />}
              label="Active Budgets"
              value={budgets.length}
              variant="primary"
              subtext="Current month allocations"
            />
            <StatCard
              icon={<Icons.AlertTriangle size={22} />}
              label="Budget Alerts"
              value={budgetAlerts.length}
              variant={budgetAlerts.length > 0 ? "danger" : "success"}
              subtext={budgetAlerts.length > 0 ? "Threshold warning active" : "All within safe limit"}
            />
            <StatCard
              icon={<Icons.TrendingUp size={22} />}
              label="Team MTD Spend"
              value={`₹${totalSpent.toLocaleString("en-IN")}`}
              variant="purple"
              subtext={`of ₹${totalAllocated.toLocaleString("en-IN")} allocated`}
            />
          </div>

          {/* Charts Row */}
          <div className="chart-grid">
            {/* Budget Utilization Bar Chart */}
            <div className="card chart-card">
              <div className="card-header">
                <div>
                  <div className="card-title">
                    <Icons.BarChart size={16} style={{ color: "var(--primary)" }} />
                    Department Budget Utilization
                  </div>
                  <div className="card-subtitle">Spending % per category against allocation</div>
                </div>
              </div>
              {budgets.length === 0 ? (
                <EmptyState title="No active budgets" description="No department budgets found for this month." />
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={budgets.slice(0, 6)}>
                    <XAxis dataKey="categoryName" tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
                    <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} unit="%" />
                    <Tooltip
                      formatter={(v) => `${Number(v).toFixed(1)}%`}
                      contentStyle={{
                        background: "var(--bg-surface)",
                        border: "1px solid var(--border-color)",
                        borderRadius: "var(--radius-md)",
                        color: "var(--text-primary)",
                      }}
                    />
                    <Bar dataKey="utilizationPercentage" radius={[4, 4, 0, 0]}>
                      {budgets.slice(0, 6).map((b, idx) => (
                        <Cell
                          key={idx}
                          fill={
                            Number(b.utilizationPercentage) >= 100
                              ? "var(--danger)"
                              : Number(b.utilizationPercentage) >= 80
                              ? "var(--warning)"
                              : "var(--success)"
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Team Category Breakdown */}
            <div className="card chart-card">
              <div className="card-header">
                <div>
                  <div className="card-title">
                    <Icons.PieChart size={16} style={{ color: "var(--primary)" }} />
                    Team Spend by Category
                  </div>
                  <div className="card-subtitle">Expense distribution across categories</div>
                </div>
              </div>
              {categorySpending.length === 0 ? (
                <EmptyState title="No expenses recorded" description="No claims submitted yet." />
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={categorySpending}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {categorySpending.map((_, i) => (
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
              )}
            </div>
          </div>

          {/* Pending Approvals Table */}
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">
                  <Icons.Clock size={16} style={{ color: "var(--warning)" }} />
                  Pending Approvals Queue
                </div>
                <div className="card-subtitle">Claims awaiting your decision</div>
              </div>
              <Link to="/manager/pending" className="btn btn-ghost btn-sm">
                View All Queue <Icons.ChevronRight size={14} />
              </Link>
            </div>

            {pending.length === 0 ? (
              <EmptyState
                icon={<Icons.CheckCircle size={28} style={{ color: "var(--success)" }} />}
                title="All caught up!"
                description="There are currently no expense claims pending your approval."
              />
            ) : (
              <div className="table-wrap">
                <table className="table-clean">
                  <thead>
                    <tr>
                      <th>Claim #</th>
                      <th>Employee</th>
                      <th>Category</th>
                      <th>Amount</th>
                      <th>Date</th>
                      <th>Merchant</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pending.slice(0, 6).map((item) => (
                      <tr key={item.id}>
                        <td style={{ fontWeight: 600, color: "var(--primary)" }}>
                          {item.expenseNumber || `#${item.id}`}
                        </td>
                        <td style={{ fontWeight: 500 }}>{item.employeeName || "Employee"}</td>
                        <td>{item.categoryName || "General"}</td>
                        <td style={{ fontWeight: 700 }}>
                          ₹{Number(item.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </td>
                        <td>{item.expenseDate || "—"}</td>
                        <td>{item.merchantName || "—"}</td>
                        <td>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => setSelectedExpense(item)}
                          >
                            Review Claim
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Expense Review / Detail Dialog */}
      <ExpenseDetailModal
        expense={selectedExpense}
        isOpen={Boolean(selectedExpense)}
        onClose={() => setSelectedExpense(null)}
        onActionComplete={(msg) => {
          setActionFeedback(msg);
          loadDashboardData();
          setTimeout(() => setActionFeedback(""), 4000);
        }}
      />
    </AppLayout>
  );
}
