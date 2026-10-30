import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { budgetAPI } from "../../api/budgets";
import { expenseAPI } from "../../api/expenses";
import AppLayout from "../../components/layout/AppLayout";
import StatusBadge from "../../components/common/StatusBadge";
import StatCard from "../../components/common/StatCard";
import Loading from "../../components/common/Loading";
import EmptyState from "../../components/common/EmptyState";
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

const CHART_COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899"];

export default function FinanceDashboard() {
  const [budgets, setBudgets] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [reconciliation, setReconciliation] = useState([]);
  const [allExpenses, setAllExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadFinanceData = () => {
    setLoading(true);
    Promise.all([
      budgetAPI.getSummary().then((r) => setBudgets(r.data?.data || [])),
      budgetAPI.getAlerts().then((r) => setAlerts(r.data?.data || [])),
      budgetAPI.getReconciliation().then((r) => setReconciliation(r.data?.data || [])),
      expenseAPI.getAll(0, 100).then((r) => setAllExpenses(r.data?.data?.content || [])),
    ])
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadFinanceData();
  }, []);

  // Aggregated KPIs
  const totalAllocated = useMemo(
    () => budgets.reduce((s, b) => s + Number(b.allocatedAmount || 0), 0),
    [budgets]
  );
  const totalSpent = useMemo(
    () => budgets.reduce((s, b) => s + Number(b.spentAmount || 0), 0),
    [budgets]
  );
  const totalRemaining = totalAllocated - totalSpent;
  const overallUtilization = totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0;

  // Department expenditure breakdown
  const departmentData = useMemo(() => {
    const map = {};
    budgets.forEach((b) => {
      const dept = b.department || "Other";
      map[dept] = (map[dept] || 0) + Number(b.spentAmount || 0);
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [budgets]);

  return (
    <AppLayout
      title="Finance Executive Dashboard"
      breadcrumbs={["Finance", "Dashboard"]}
    >
      <div className="page-header-row">
        <div>
          <h2 className="page-headline">Corporate Financial Control &amp; Treasury</h2>
          <p className="page-subheadline">
            Enterprise budget allocations, real-time expenditure variance, and reconciliation monitoring.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <Link to="/finance/reconciliation" className="btn btn-outline btn-sm">
            <Icons.Scale size={14} /> Reconciliation View
          </Link>
          <Link to="/finance/budgets" className="btn btn-primary btn-sm">
            <Icons.Plus size={14} /> Allocate Budget
          </Link>
        </div>
      </div>

      {loading ? (
        <Loading message="Loading financial ledgers and treasury status…" />
      ) : (
        <>
          {/* Executive Stat Cards */}
          <div className="stats-grid">
            <StatCard
              icon={<Icons.Wallet size={22} />}
              label="Total Allocated"
              value={`₹${(totalAllocated / 1000).toFixed(0)}K`}
              variant="primary"
              subtext={`₹${totalAllocated.toLocaleString("en-IN")}`}
            />
            <StatCard
              icon={<Icons.TrendingUp size={22} />}
              label="Actual Expenditure"
              value={`₹${(totalSpent / 1000).toFixed(0)}K`}
              variant="purple"
              subtext={`₹${totalSpent.toLocaleString("en-IN")}`}
            />
            <StatCard
              icon={<Icons.CheckCircle size={22} />}
              label="Remaining Treasury"
              value={`₹${(totalRemaining / 1000).toFixed(0)}K`}
              variant={totalRemaining < 0 ? "danger" : "success"}
              subtext={totalRemaining < 0 ? "Over budget deficit" : "Available headroom"}
            />
            <StatCard
              icon={<Icons.BarChart size={22} />}
              label="Overall Utilization"
              value={`${overallUtilization.toFixed(1)}%`}
              variant={overallUtilization >= 100 ? "danger" : overallUtilization >= 80 ? "warning" : "success"}
              subtext={overallUtilization >= 90 ? "Threshold warning" : "Normal burn rate"}
            />
            <StatCard
              icon={<Icons.AlertTriangle size={22} />}
              label="Active Budget Alerts"
              value={alerts.length}
              variant={alerts.length > 0 ? "danger" : "success"}
              subtext="Over 80% allocation"
            />
          </div>

          {/* Budget Warnings Panel */}
          {alerts.length > 0 && (
            <div className="card" style={{ marginBottom: 24, borderLeft: "4px solid var(--danger)" }}>
              <div className="card-header">
                <div>
                  <div className="card-title" style={{ color: "var(--danger-text)" }}>
                    <Icons.AlertTriangle size={18} />
                    Active Budget Overrun Warnings ({alerts.length})
                  </div>
                  <div className="card-subtitle">
                    The following cost centers have exceeded or are critically close to budget limits.
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
                {alerts.map((a) => (
                  <div
                    key={a.id}
                    style={{
                      padding: 12,
                      borderRadius: "var(--radius-md)",
                      background: "var(--bg-surface-subtle)",
                      border: "1px solid var(--border-color)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontWeight: 700, fontSize: 13 }}>
                        {a.department} / {a.categoryName}
                      </span>
                      <StatusBadge status={a.status} />
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 6 }}>
                      ₹{Number(a.spentAmount).toLocaleString("en-IN")} spent of ₹{Number(a.allocatedAmount).toLocaleString("en-IN")}
                    </div>
                    <div className="progress-bar-wrap" style={{ marginTop: 8 }}>
                      <div
                        className={`progress-bar-fill ${a.status?.toLowerCase() || "critical"}`}
                        style={{ width: `${Math.min(Number(a.utilizationPercentage), 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Charts Row */}
          <div className="chart-grid">
            {/* Category Utilization Bar Chart */}
            <div className="card chart-card">
              <div className="card-header">
                <div>
                  <div className="card-title">
                    <Icons.BarChart size={16} style={{ color: "var(--primary)" }} />
                    Category Budget Utilization
                  </div>
                  <div className="card-subtitle">Spending % per category against budget</div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={budgets.slice(0, 8)}>
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
                    {budgets.slice(0, 8).map((b, idx) => (
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
            </div>

            {/* Department Breakdown Pie Chart */}
            <div className="card chart-card">
              <div className="card-header">
                <div>
                  <div className="card-title">
                    <Icons.PieChart size={16} style={{ color: "var(--primary)" }} />
                    Expenditure by Department
                  </div>
                  <div className="card-subtitle">Total month-to-date spending breakdown</div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={departmentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {departmentData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
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

          {/* Quick Reconciliation Summary Table */}
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">
                  <Icons.Scale size={16} style={{ color: "var(--primary)" }} />
                  Reconciliation Snapshot
                </div>
                <div className="card-subtitle">Allocated vs Actual spend by department and category</div>
              </div>
              <Link to="/finance/reconciliation" className="btn btn-ghost btn-sm">
                Full Reconciliation Matrix <Icons.ChevronRight size={14} />
              </Link>
            </div>

            {reconciliation.length === 0 ? (
              <EmptyState title="No reconciliation data available" description="Allocate budgets and approve claims to view data." />
            ) : (
              <div className="table-wrap">
                <table className="table-clean">
                  <thead>
                    <tr>
                      <th>Department</th>
                      <th>Category</th>
                      <th>Allocated</th>
                      <th>Actual Spent</th>
                      <th>Remaining</th>
                      <th>Utilization</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reconciliation.slice(0, 6).map((r, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 700 }}>{r.department}</td>
                        <td>{r.categoryName}</td>
                        <td>₹{Number(r.allocatedBudget).toLocaleString("en-IN")}</td>
                        <td style={{ fontWeight: 600 }}>₹{Number(r.actualSpending).toLocaleString("en-IN")}</td>
                        <td style={{ color: Number(r.remainingBudget) < 0 ? "var(--danger)" : "var(--success)", fontWeight: 600 }}>
                          ₹{Number(r.remainingBudget).toLocaleString("en-IN")}
                        </td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div className="progress-bar-wrap" style={{ width: 80 }}>
                              <div
                                className={`progress-bar-fill ${r.budgetStatus?.toLowerCase() || "normal"}`}
                                style={{ width: `${Math.min(Number(r.utilizationPercentage), 100)}%` }}
                              />
                            </div>
                            <span style={{ fontSize: 11.5, fontWeight: 600 }}>
                              {Number(r.utilizationPercentage).toFixed(1)}%
                            </span>
                          </div>
                        </td>
                        <td>
                          <StatusBadge status={r.budgetStatus} />
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
    </AppLayout>
  );
}
