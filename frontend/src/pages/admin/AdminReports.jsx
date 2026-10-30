import { useState, useEffect, useMemo } from "react";
import { expenseAPI } from "../../api/expenses";
import { authAPI } from "../../api/auth";
import { budgetAPI } from "../../api/budgets";
import AppLayout from "../../components/layout/AppLayout";
import Loading from "../../components/common/Loading";
import StatCard from "../../components/common/StatCard";
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

const CHART_COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899", "#f97316"];

export default function AdminReports() {
  const [expenses, setExpenses] = useState([]);
  const [users, setUsers] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      expenseAPI.getAll(0, 1000).then((r) => setExpenses(r.data?.data?.content || [])),
      authAPI.getAllUsers().then((r) => setUsers(r.data?.data || [])),
      budgetAPI.getAll().then((r) => setBudgets(r.data?.data || [])),
    ])
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalSpent = useMemo(
    () => expenses.reduce((s, e) => s + Number(e.amount || 0), 0),
    [expenses]
  );

  const byDept = useMemo(() => {
    const map = {};
    expenses.forEach((e) => {
      const d = e.department || "Other";
      map[d] = (map[d] || 0) + Number(e.amount || 0);
    });
    return Object.entries(map)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [expenses]);

  const byRole = useMemo(() => {
    const roles = ["EMPLOYEE", "MANAGER", "FINANCE_ADMIN", "SYSTEM_ADMIN"];
    return roles.map((r) => ({
      name: r.replace(/_/g, " "),
      count: users.filter((u) => u.role === r).length,
    }));
  }, [users]);

  const handleExportCSV = () => {
    if (expenses.length === 0) return;
    const headers = ["Claim #", "Employee", "Department", "Category", "Amount", "Date", "Status", "Merchant"];
    const rows = expenses.map((e) => [
      `"${e.expenseNumber || e.id}"`,
      `"${(e.employeeName || '').replace(/"/g, '""')}"`,
      `"${(e.department || '').replace(/"/g, '""')}"`,
      `"${(e.categoryName || '').replace(/"/g, '""')}"`,
      e.amount || 0,
      `"${e.expenseDate || ''}"`,
      `"${e.status || ''}"`,
      `"${(e.merchantName || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encoded = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encoded);
    link.setAttribute("download", "system-admin-audit-report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AppLayout
      title="System Intelligence &amp; Reports"
      breadcrumbs={["System Admin", "Reports"]}
    >
      <div className="page-header-row">
        <div>
          <h2 className="page-headline">System-Level Analytics &amp; Volume</h2>
          <p className="page-subheadline">
            High-level metrics on organization structure, aggregate company spend, and department usage.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-outline btn-sm" onClick={() => window.print()}>
            <Icons.Printer size={14} /> Print View
          </button>
          <button className="btn btn-primary btn-sm" onClick={handleExportCSV}>
            <Icons.Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {loading ? (
        <Loading message="Aggregating corporate analytics…" />
      ) : (
        <>
          <div className="stats-grid">
            <StatCard
              icon={<Icons.Users size={22} />}
              label="Total User Base"
              value={users.length}
              variant="purple"
              subtext="Directory accounts"
            />
            <StatCard
              icon={<Icons.Receipt size={22} />}
              label="Total Claims"
              value={expenses.length}
              variant="primary"
              subtext="Historical count"
            />
            <StatCard
              icon={<Icons.Wallet size={22} />}
              label="Total Spend"
              value={`₹${(totalSpent / 1000).toFixed(0)}K`}
              variant="success"
              subtext={`₹${totalSpent.toLocaleString("en-IN")}`}
            />
            <StatCard
              icon={<Icons.BarChart size={22} />}
              label="Active Budgets"
              value={budgets.length}
              variant="warning"
              subtext="Department allocations"
            />
          </div>

          <div className="chart-grid">
            <div className="card chart-card">
              <div className="card-header">
                <div>
                  <div className="card-title">
                    <Icons.BarChart size={16} style={{ color: "var(--primary)" }} />
                    Spending by Department
                  </div>
                  <div className="card-subtitle">Cumulative claim volume</div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={byDept}>
                  <XAxis dataKey="name" tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
                  <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
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
                    <Icons.Users size={16} style={{ color: "var(--accent-purple)" }} />
                    User Directory by Role
                  </div>
                  <div className="card-subtitle">Privilege breakdown</div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={byRole}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="count"
                  >
                    {byRole.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v) => `${v} users`}
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
        </>
      )}
    </AppLayout>
  );
}
