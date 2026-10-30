import { useState, useEffect } from "react";
import { categoryAPI } from "../../api/categories";
import AppLayout from "../../components/layout/AppLayout";
import StatusBadge from "../../components/common/StatusBadge";
import Loading from "../../components/common/Loading";
import Modal from "../../components/common/Modal";
import DataTable from "../../components/common/DataTable";
import { Icons } from "../../components/common/Icons";

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", icon: "tag", budgetLimitPercentage: 100 });
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const loadCategories = () => {
    setLoading(true);
    categoryAPI
      .getAll()
      .then((res) => setCategories(res.data?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setErrorMsg("Category name is required.");
      return;
    }
    setErrorMsg("");
    setSubmitting(true);
    try {
      await categoryAPI.create({
        ...form,
        budgetLimitPercentage: parseInt(form.budgetLimitPercentage, 10) || 100,
      });
      setFeedback("Category created successfully.");
      setShowCreateModal(false);
      setForm({ name: "", description: "", icon: "tag", budgetLimitPercentage: 100 });
      loadCategories();
      setTimeout(() => setFeedback(""), 4000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to create category.");
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      key: "icon",
      label: "Symbol",
      sortable: false,
      render: () => (
        <span
          style={{
            width: 32,
            height: 32,
            borderRadius: "var(--radius-sm)",
            background: "var(--primary-subtle)",
            color: "var(--primary)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icons.Tag size={16} />
        </span>
      ),
    },
    {
      key: "name",
      label: "Category Name",
      sortable: true,
      render: (row) => <span style={{ fontWeight: 700 }}>{row.name}</span>,
    },
    {
      key: "description",
      label: "Description",
      sortable: true,
      render: (row) => <span style={{ color: "var(--text-secondary)" }}>{row.description || "—"}</span>,
    },
    {
      key: "budgetLimitPercentage",
      label: "Budget Limit %",
      sortable: true,
      render: (row) => <span style={{ fontWeight: 600 }}>{row.budgetLimitPercentage ?? 100}%</span>,
    },
    {
      key: "active",
      label: "Status",
      sortable: true,
      render: (row) => <StatusBadge status={row.active ? "ACTIVE" : "INACTIVE"} />,
    },
  ];

  return (
    <AppLayout
      title="Category Administration"
      breadcrumbs={["System Admin", "Categories"]}
    >
      <div className="page-header-row">
        <div>
          <h2 className="page-headline">Expense Category Taxonomy</h2>
          <p className="page-subheadline">
            Configure system-wide taxonomy for expense logging, validation caps, and reporting.
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
          <Icons.Plus size={16} /> Add Category
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
          <Loading message="Loading category taxonomy…" />
        ) : (
          <DataTable
            columns={columns}
            data={categories}
            searchable={true}
            searchPlaceholder="Search categories…"
            searchKeys={["name", "description"]}
            exportFilename="category-taxonomy.csv"
            defaultSortKey="name"
            defaultSortDir="asc"
            pageSize={10}
            emptyTitle="No categories found"
            emptyDesc="Click 'Add Category' to create the first category."
          />
        )}
      </div>

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Expense Category"
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
            <label className="form-label">Category Name *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Subscriptions, Travel, Catering"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              placeholder="Specify allowable costs…"
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Budget Limit Cap (%)</label>
            <input
              type="number"
              min="1"
              max="200"
              className="form-input"
              value={form.budgetLimitPercentage}
              onChange={(e) => setForm((p) => ({ ...p, budgetLimitPercentage: e.target.value }))}
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
              {submitting ? "Saving…" : "Save Category"}
            </button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}
