import { useState, useEffect } from "react";
import { expenseAPI } from "../../api/expenses";
import AppLayout from "../../components/layout/AppLayout";
import Loading from "../../components/common/Loading";
import DataTable from "../../components/common/DataTable";
import ExpenseDetailModal from "../../components/common/ExpenseDetailModal";
import { Icons } from "../../components/common/Icons";

export default function PendingApprovals() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [feedback, setFeedback] = useState("");

  const loadPending = () => {
    setLoading(true);
    expenseAPI
      .getPending(0, 100)
      .then((res) => {
        setPending(res.data?.data?.content || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPending();
  }, []);

  const columns = [
    {
      key: "expenseNumber",
      label: "Claim #",
      sortable: true,
      render: (row) => (
        <span
          style={{ fontWeight: 600, color: "var(--primary)", cursor: "pointer" }}
          onClick={() => setSelectedExpense(row)}
        >
          {row.expenseNumber || `#${row.id}`}
        </span>
      ),
    },
    {
      key: "employeeName",
      label: "Employee",
      sortable: true,
      render: (row) => (
        <div>
          <span style={{ fontWeight: 600 }}>{row.employeeName || "Employee"}</span>
          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
            Dept: {row.department || "—"}
          </div>
        </div>
      ),
    },
    {
      key: "description",
      label: "Description",
      sortable: true,
      render: (row) => (
        <div style={{ maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {row.description}
        </div>
      ),
    },
    {
      key: "categoryName",
      label: "Category",
      sortable: true,
      render: (row) => (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
          <Icons.Tag size={13} style={{ color: "var(--text-muted)" }} />
          {row.categoryName || "General"}
        </span>
      ),
    },
    {
      key: "amount",
      label: "Amount",
      sortable: true,
      render: (row) => (
        <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>
          ₹{Number(row.amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: "expenseDate",
      label: "Date",
      sortable: true,
      render: (row) => row.expenseDate || "—",
    },
    {
      key: "receiptUrl",
      label: "Receipt",
      sortable: false,
      render: (row) =>
        row.receiptUrl ? (
          <a
            href={row.receiptUrl}
            target="_blank"
            rel="noreferrer"
            className="btn btn-outline btn-sm"
            style={{ padding: "3px 8px", fontSize: 11 }}
          >
            <Icons.ExternalLink size={12} /> View
          </a>
        ) : (
          <span style={{ color: "var(--text-muted)", fontSize: 12 }}>None</span>
        ),
    },
    {
      key: "actions",
      label: "Decision",
      sortable: false,
      render: (row) => (
        <button
          className="btn btn-primary btn-sm"
          onClick={() => setSelectedExpense(row)}
        >
          Review &amp; Decide
        </button>
      ),
    },
  ];

  return (
    <AppLayout
      title="Pending Approvals"
      breadcrumbs={["Management", "Approvals"]}
    >
      <div className="page-header-row">
        <div>
          <h2 className="page-headline">Pending Expense Claims</h2>
          <p className="page-subheadline">
            {pending.length} claim(s) awaiting your review and authorization decision.
          </p>
        </div>

        <button className="btn btn-outline btn-sm" onClick={loadPending} title="Reload approvals">
          <Icons.Refresh size={14} /> Refresh Queue
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
          <Loading message="Fetching approval queue…" />
        ) : (
          <DataTable
            columns={columns}
            data={pending}
            searchable={true}
            searchPlaceholder="Search pending claims by employee, category, description…"
            searchKeys={["expenseNumber", "employeeName", "description", "categoryName", "merchantName"]}
            exportFilename="pending-approvals.csv"
            defaultSortKey="expenseDate"
            defaultSortDir="desc"
            pageSize={10}
            emptyTitle="Approval queue is empty"
            emptyDesc="All team expense submissions have been reviewed and decided."
          />
        )}
      </div>

      <ExpenseDetailModal
        expense={selectedExpense}
        isOpen={Boolean(selectedExpense)}
        onClose={() => setSelectedExpense(null)}
        onActionComplete={(msg) => {
          setFeedback(msg);
          loadPending();
          setTimeout(() => setFeedback(""), 4000);
        }}
      />
    </AppLayout>
  );
}
