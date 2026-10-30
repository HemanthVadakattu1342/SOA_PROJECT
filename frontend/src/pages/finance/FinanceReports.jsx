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

const CHART_COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899", "#f97316"];

export default function FinanceReports() {
  const [expenses, setExpenses] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deptFilter, setDeptFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  useEffect(() => {
    setLoading(true);
    Promise.all([
      expenseAPI.getAll(0, 1000).then((r) => setExpenses(r.data?.data?.content || [])),
      budgetAPI.getAll().then((r) => setBudgets(r.data?.data || [])),
    ])
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      if (deptFilter !== "ALL" && e.department !== deptFilter) return false;
      if (categoryFilter !== "ALL" && e.categoryName !== categoryFilter) return false;
      return true;
    });
  }, [expenses, deptFilter, categoryFilter]);

  // Spending by Category
  const byCategory = useMemo(() => {
    const map = {};
    filteredExpenses.forEach((e) => {
      const cat = e.categoryName || "Uncategorized";
      map[cat] = (map[cat] || 0) + Number(e.amount || 0);
    });
    return Object.entries(map)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [filteredExpenses]);

  // Spending by Department
  const byDept = useMemo(() => {
    const map = {};
    filteredExpenses.forEach((e) => {
      const d = e.department || "Other";
      map[d] = (map[d] || 0) + Number(e.amount || 0);
    });
    return Object.entries(map)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [filteredExpenses]);

  // Spending by Status
  const byStatus = useMemo(() => {
    const statuses = ["APPROVED", "SUBMITTED", "REJECTED", "DRAFT"];
    return statuses.map((s) => ({
      name: s === "SUBMITTED" ? "PENDING" : s,
      count: filteredExpenses.filter((e) => e.status === s).length,
      amount: filteredExpenses.filter((e) => e.status === s).reduce((acc, e) => acc + Number(e.amount || 0), 0),
    }));
  }, [filteredExpenses]);

  const totalFilteredAmount = useMemo(
    () => filteredExpenses.reduce((s, e) => s + Number(e.amount || 0), 0),
    [filteredExpenses]
  );

  const departments = Array.from(new Set(expenses.map((e) => e.department).filter(Boolean)));
  const categories = Array.from(new Set(expenses.map((e) => e.categoryName).filter(Boolean)));

  const handleExportCSV = () => {
    if (filteredExpenses.length === 0) return;
    const headers = ["Claim #", "Employee", "Department", "Category", "Amount", "Date", "Status", "Merchant", "Description"];
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
    link.setAttribute("download", "finance-executive-report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AppLayout
      title="Financial Analytics &amp; Reports"
      breadcrumbs={["Finance", "Reports"]}
    >
      <div className="page-header-row">
        <div>
          <h2 className="page-headline">Corporate Expenditure &amp; Variance Reports</h2>
          <p className="page-subheadline">
            Multi-dimensional analysis of department disbursements, category allocation adherence, and claims volume.
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
            style={{ width: "auto", minWidth: 150 }}
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
          >
            <option value="ALL">All Departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
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

          {(deptFilter !== "ALL" || categoryFilter !== "ALL") && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => {
                setDeptFilter("ALL");
                setCategoryFilter("ALL");
              }}
            >
              Reset Filters
            </button>
          )}

          <div style={{ marginLeft: "auto", fontSize: 13, color: "var(--text-muted)" }}>
            Showing <strong>{filteredExpenses.length}</strong> records (Sum: <strong>₹{totalFilteredAmount.toLocaleString("en-IN")}</strong>)
          </div>
        </div>
      </div>

      {loading ? (
        <Loading message="Generating enterprise financial reports…" />
      ) : (
        <>
          {/* Charts Row */}
          <div className="chart-grid">
            {/* Category Chart */}
            <div className="card chart-card">
              <div className="card-header">
                <div>
                  <div className="card-title">
                    <Icons.BarChart size={16} style={{ color: "var(--primary)" }} />
                    Disbursements by Category
                  </div>
                  <div className="card-subtitle">Total financial volume per category</div>
                </div>
              </div>
              {byCategory.length === 0 ? (
                <EmptyState title="No transactions recorded" description="Try selecting a different filter range." />
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={byCategory.slice(0, 8)}>
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

            {/* Department Chart */}
            <div className="card chart-card">
              <div className="card-header">
                <div>
                  <div className="card-title">
                    <Icons.PieChart size={16} style={{ color: "var(--primary)" }} />
                    Department Distribution
                  </div>
                  <div className="card-subtitle">Spending share across business units</div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={byDept}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="amount"
                  >
                    {byDept.map((_, i) => (
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
          <div className="card">
            <div className="card-title" style={{ marginBottom: 14 }}>
              Status Breakdown &amp; Cash Flow Commitments
            </div>
            <div className="table-wrap">
              <table className="table-clean">
                <thead>
                  <tr>
                    <th>Claim Status</th>
                    <th>Count</th>
                    <th>Committed Volume</th>
                    <th>Percentage Share</th>
                  </tr>
                </thead>
                <tbody>
                  {byStatus.map((s) => {
                    const share = totalFilteredAmount > 0 ? (s.amount / totalFilteredAmount) * 100 : 0;
                    return (
                      <tr key={s.name}>
                        <td style={{ fontWeight: 600 }}>{s.name}</td>
                        <td>{s.count} claims</td>
                        <td style={{ fontWeight: 700 }}>
                          ₹{s.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div className="progress-bar-wrap" style={{ width: 100 }}>
                              <div
                                className="progress-bar-fill normal"
                                style={{ width: `${share}%` }}
                              />
                            </div>
                            <span style={{ fontSize: 12 }}>{share.toFixed(1)}%</span>
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
