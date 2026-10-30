import { useState, useEffect } from "react";
import { budgetAPI } from "../../api/budgets";
import { categoryAPI } from "../../api/categories";
import AppLayout from "../../components/layout/AppLayout";
import StatusBadge from "../../components/common/StatusBadge";
import Loading from "../../components/common/Loading";
import Modal from "../../components/common/Modal";
import DataTable from "../../components/common/DataTable";
import { Icons } from "../../components/common/Icons";

const MONTH_NAMES = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DEPARTMENTS = ["Engineering", "Finance", "Marketing", "Operations", "HR", "Sales", "Legal", "Product", "IT"];

export default function AdminBudgets() {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const now = new Date();
  const [form, setForm] = useState({
    department: "Engineering",
    categoryId: "",
    financialYear: now.getFullYear(),
    month: now.getMonth() + 1,
    allocatedAmount: "",
  });

  const loadData = () => {
    setLoading(true);
    Promise.all([
      budgetAPI.getAll().then((r) => setBudgets(r.data?.data || [])),
      categoryAPI.getActive().then((r) => setCategories(r.data?.data || [])),
    ])
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.categoryId || !form.allocatedAmount || Number(form.allocatedAmount) <= 0) {
      setErrorMsg("Please select category and enter a valid positive allocation amount.");
      return;
    }
    setErrorMsg("");
    setSubmitting(true);
    try {
      const selectedCat = categories.find((c) => String(c.id) === String(form.categoryId));
      await budgetAPI.create({
        ...form,
        categoryId: parseInt(form.categoryId, 10),
        categoryName: selectedCat?.name || "General",
        allocatedAmount: parseFloat(form.allocatedAmount),
        financialYear: parseInt(form.financialYear, 10),
        month: parseInt(form.month, 10),
      });
      setFeedback("Department budget created.");
      setShowCreateModal(false);
      setForm({
        department: "Engineering",
        categoryId: "",
        financialYear: now.getFullYear(),
        month: now.getMonth() + 1,
        allocatedAmount: "",
      });
      loadData();
      setTimeout(() => setFeedback(""), 4000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to create budget.");
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      key: "department",
      label: "Department",
      sortable: true,
      render: (row) => <span style={{ fontWeight: 700 }}>{row.department}</span>,
    },
    {
      key: "categoryName",
      label: "Category",
      sortable: true,
    },
    {
      key: "period",
      label: "Period",
      sortable: true,
      render: (row) => `${MONTH_NAMES[row.month]} ${row.financialYear}`,
    },
    {
      key: "allocatedAmount",
      label: "Allocated",
      sortable: true,
      render: (row) => `₹${Number(row.allocatedAmount).toLocaleString("en-IN")}`,
    },
    {
      key: "spentAmount",
      label: "Spent",
      sortable: true,
      render: (row) => `₹${Number(row.spentAmount).toLocaleString("en-IN")}`,
    },
    {
      key: "remainingAmount",
      label: "Remaining",
      sortable: true,
      render: (row) => {
        const rem = Number(row.remainingAmount || 0);
        return (
          <span style={{ fontWeight: 700, color: rem < 0 ? "var(--danger)" : "var(--success)" }}>
            ₹{rem.toLocaleString("en-IN")}
          </span>
        );
      },
    },
    {
      key: "utilizationPercentage",
      label: "Utilization",
      sortable: true,
      render: (row) => {
        const util = Number(row.utilizationPercentage || 0);
        const statusKey = row.status?.toLowerCase() || "normal";
        return (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div className="progress-bar-wrap" style={{ width: 70 }}>
              <div
                className={`progress-bar-fill ${statusKey}`}
                style={{ width: `${Math.min(util, 100)}%` }}
              />
            </div>
            <span style={{ fontSize: 11.5, fontWeight: 600 }}>{util.toFixed(1)}%</span>
          </div>
        );
      },
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (row) => <StatusBadge status={row.status} />,
    },
  ];

  return (
    <AppLayout
      title="Budget Administration"
      breadcrumbs={["System Admin", "Budgets"]}
    >
      <div className="page-header-row">
        <div>
          <h2 className="page-headline">System Budget Allocations</h2>
          <p className="page-subheadline">
            System-level supervision of all departmental budget caps and financial spending boundaries.
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
          <Icons.Plus size={16} /> Create Budget Cap
        </button>
      </div>

      {feedback && (
        <div className="alert-box success">
          <Icons.CheckCircle size={16} />
          <span>{feedback}</span>
        </div>
      )}

      <div className="card">
        {loading ? (
          <Loading message="Loading system budgets…" />
        ) : (
          <DataTable
            columns={columns}
            data={budgets}
            searchable={true}
            searchPlaceholder="Search budgets by department or category…"
            searchKeys={["department", "categoryName"]}
            exportFilename="system-all-budgets.csv"
            defaultSortKey="department"
            defaultSortDir="asc"
            pageSize={10}
            emptyTitle="No budgets found"
            emptyDesc="Click 'Create Budget Cap' to establish departmental allowances."
          />
        )}
      </div>

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Establish Department Budget Cap"
        size="md"
      >
        {errorMsg && (
          <div className="alert-box danger" style={{ marginBottom: 16 }}>
            <Icons.AlertTriangle size={15} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleCreate}>
          <div className="form-group">
            <label className="form-label">Department</label>
            <select
              className="form-select"
              value={form.department}
              onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))}
            >
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              className="form-select"
              value={form.categoryId}
              onChange={(e) => setForm((p) => ({ ...p, categoryId: e.target.value }))}
              required
            >
              <option value="">Select category…</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Month</label>
              <select
                className="form-select"
                value={form.month}
                onChange={(e) => setForm((p) => ({ ...p, month: parseInt(e.target.value, 10) }))}
              >
                {MONTH_NAMES.slice(1).map((m, idx) => (
                  <option key={idx + 1} value={idx + 1}>{m}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Year</label>
              <input
                type="number"
                className="form-input"
                value={form.financialYear}
                onChange={(e) => setForm((p) => ({ ...p, financialYear: parseInt(e.target.value, 10) }))}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Allocated Cap (INR ₹)</label>
            <input
              type="number"
              step="100"
              min="1"
              className="form-input"
              value={form.allocatedAmount}
              onChange={(e) => setForm((p) => ({ ...p, allocatedAmount: e.target.value }))}
              required
            />
          </div>

          <div className="modal-footer" style={{ margin: "20px -24px -24px", padding: "16px 24px" }}>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setShowCreateModal(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={submitting}
            >
              {submitting ? "Saving…" : "Save Allocation"}
            </button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}
