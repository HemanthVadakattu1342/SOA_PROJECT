import { useState, useEffect, useMemo } from "react";
import { expenseAPI } from "../../api/expenses";
import { budgetAPI } from "../../api/budgets";
import AppLayout from "../../components/layout/AppLayout";
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

const CHART_COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

export default function ManagerReports() {
  const [expenses, setExpenses] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  useEffect(() => {
    setLoading(true);
    Promise.all([
      expenseAPI.getAll(0, 500).then((r) => setExpenses(r.data?.data?.content || [])),
      budgetAPI.getSummary().then((r) => setBudgets(r.data?.data || [])),
    ])
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      if (statusFilter !== "ALL" && e.status !== statusFilter) return false;
      if (categoryFilter !== "ALL" && e.categoryName !== categoryFilter) return false;
      return true;
    });
  }, [expenses, statusFilter, categoryFilter]);

  // Breakdown by category
  const categoryData = useMemo(() => {
    const map = {};
    filteredExpenses.forEach((e) => {
      const cat = e.categoryName || "Other";
      map[cat] = (map[cat] || 0) + Number(e.amount || 0);
    });
    return Object.entries(map).map(([name, amount]) => ({ name, amount }));
  }, [filteredExpenses]);

  // Breakdown by status
  const statusData = useMemo(() => {
    const statuses = ["APPROVED", "SUBMITTED", "REJECTED", "DRAFT"];
    return statuses.map((s) => ({
      name: s === "SUBMITTED" ? "PENDING" : s,
      rawStatus: s,
      count: filteredExpenses.filter((e) => e.status === s).length,
      amount: filteredExpenses.filter((e) => e.status === s).reduce((sum, e) => sum + Number(e.amount || 0), 0),
    }));
  }, [filteredExpenses]);

  const totalFilteredAmount = useMemo(
    () => filteredExpenses.reduce((s, e) => s + Number(e.amount || 0), 0),
    [filteredExpenses]
  );

  const categories = Array.from(
    new Set(expenses.map((e) => e.categoryName).filter(Boolean))
  );

  const handleExportCSV = () => {
    if (filteredExpenses.length === 0) return;
    const headers = ["Expense #", "Employee", "Department", "Category", "Amount", "Date", "Status", "Merchant", "Description"];
    const rows = filteredExpenses.map((e) => [
      `"${e.expenseNumber || e.id}"`,
      `"${(e.employeeName || '').replace(/"/g, '""')}"`,
      `"${(e.department || '').replace(/"/g, '""')}"`,
      `"${(e.categoryName || '').replace(/"/g, '""')}"`,
      e.amount || 0,
      `"${e.expenseDate || ''}"`,
      `"${e.status || ''}"`,
      `"${(e.merchantName || '').replace(/"/g, '""')}"`,
      `"${(e.description || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encoded = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encoded);
    link.setAttribute("download", "manager-team-report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AppLayout
      title="Team Analytics &amp; Reports"
      breadcrumbs={["Management", "Reports"]}
    >
      <div className="page-header-row">
        <div>
          <h2 className="page-headline">Department Financial Analytics</h2>
          <p className="page-subheadline">
            Aggregated expenditure insights, approval breakdown, and category consumption.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-outline btn-sm" onClick={() => window.print()}>
            <Icons.Printer size={14} /> Print Report
          </button>
          <button className="btn btn-primary btn-sm" onClick={handleExportCSV}>
            <Icons.Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ marginBottom: 20, padding: "14px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Icons.Filter size={15} style={{ color: "var(--text-muted)" }} />
            <span style={{ fontSize: 13, fontWeight: 600 }}>Filters:</span>
          </div>

          <select
            className="form-select"
            style={{ width: "auto", minWidth: 140 }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="APPROVED">Approved</option>
            <option value="SUBMITTED">Pending Approval</option>
            <option value="REJECTED">Rejected</option>
            <option value="DRAFT">Draft</option>
          </select>

          <select
            className="form-select"
            style={{ width: "auto", minWidth: 150 }}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {(statusFilter !== "ALL" || categoryFilter !== "ALL") && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => {
                setStatusFilter("ALL");
                setCategoryFilter("ALL");
              }}
            >
              Reset Filters
            </button>
          )}

          <div style={{ marginLeft: "auto", fontSize: 13, color: "var(--text-muted)" }}>
            Showing <strong>{filteredExpenses.length}</strong> claims (Total: <strong>₹{totalFilteredAmount.toLocaleString("en-IN")}</strong>)
          </div>
        </div>
      </div>

      {loading ? (
        <Loading message="Compiling team reports…" />
      ) : (
        <>
          {/* Charts Row */}
          <div className="chart-grid">
            <div className="card chart-card">
              <div className="card-header">
                <div>
                  <div className="card-title">
                    <Icons.BarChart size={16} style={{ color: "var(--primary)" }} />
                    Spending by Category
                  </div>
                  <div className="card-subtitle">Aggregated volume per expense category</div>
                </div>
              </div>
              {categoryData.length === 0 ? (
                <EmptyState title="No data to graph" description="No claims match current filters." />
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={categoryData}>
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
              )}
            </div>

            <div className="card chart-card">
              <div className="card-header">
                <div>
                  <div className="card-title">
                    <Icons.PieChart size={16} style={{ color: "var(--primary)" }} />
                    Approval Status Share
                  </div>
                  <div className="card-subtitle">Expenditure divided by approval state</div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={statusData.filter((s) => s.amount > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="amount"
                  >
                    {statusData.map((_, i) => (
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

          {/* Status Breakdown Table */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-title" style={{ marginBottom: 14 }}>
              Status Reconciliation Summary
            </div>
            <div className="table-wrap">
              <table className="table-clean">
                <thead>
                  <tr>
                    <th>Claim Status</th>
                    <th>Count</th>
                    <th>Total Value</th>
                    <th>Share of Total</th>
                  </tr>
                </thead>
                <tbody>
                  {statusData.map((row) => {
                    const percent = totalFilteredAmount > 0 ? (row.amount / totalFilteredAmount) * 100 : 0;
                    return (
                      <tr key={row.name}>
                        <td style={{ fontWeight: 600 }}>{row.name}</td>
                        <td>{row.count} claims</td>
                        <td style={{ fontWeight: 700 }}>
                          ₹{row.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div className="progress-bar-wrap" style={{ width: 100 }}>
                              <div
                                className="progress-bar-fill normal"
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                            <span style={{ fontSize: 12 }}>{percent.toFixed(1)}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </AppLayout>
  );
}
