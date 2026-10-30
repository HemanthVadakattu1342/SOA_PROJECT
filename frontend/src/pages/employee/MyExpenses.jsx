import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { expenseAPI } from "../../api/expenses";
import AppLayout from "../../components/layout/AppLayout";
import StatusBadge from "../../components/common/StatusBadge";
import Loading from "../../components/common/Loading";
import DataTable from "../../components/common/DataTable";
import ExpenseDetailModal from "../../components/common/ExpenseDetailModal";
import { Icons } from "../../components/common/Icons";

export default function MyExpenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [feedback, setFeedback] = useState("");

  const loadExpenses = () => {
    setLoading(true);
    expenseAPI
      .getMy(0, 100)
      .then((res) => {
        setExpenses(res.data?.data?.content || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  const columns = [
    {
      key: "expenseNumber",
      label: "Expense #",
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
      key: "description",
      label: "Description",
      sortable: true,
      render: (row) => (
        <div style={{ maxWidth: 240, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          <span style={{ fontWeight: 500 }}>{row.description}</span>
          {row.notes && (
            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
              {row.notes}
            </div>
          )}
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
      label: "Expense Date",
      sortable: true,
      render: (row) => row.expenseDate || "—",
    },
    {
      key: "merchantName",
      label: "Merchant",
      sortable: true,
      render: (row) => row.merchantName || "—",
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "actions",
      label: "Action",
      sortable: false,
      render: (row) => (
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => setSelectedExpense(row)}
          title="View Claim Details"
        >
          <Icons.Eye size={14} /> View
        </button>
      ),
    },
  ];

  // Unique categories for filter
  const categoryOptions = Array.from(
    new Set(expenses.map((e) => e.categoryName).filter(Boolean))
  );

  return (
    <AppLayout
      title="My Expenses"
      breadcrumbs={["Employee", "Expenses"]}
    >
      <div className="page-header-row">
        <div>
          <h2 className="page-headline">Expense Claim History</h2>
          <p className="page-subheadline">
            Browse, search, and monitor status updates for all your submitted claims.
          </p>
        </div>

        <Link to="/employee/new-expense" className="btn btn-primary">
          <Icons.Plus size={16} /> New Expense Claim
        </Link>
      </div>

      {feedback && (
        <div className="alert-box success">
          <Icons.CheckCircle size={16} />
          <span>{feedback}</span>
        </div>
      )}

      <div className="card">
        {loading ? (
          <Loading message="Loading your expense claims…" />
        ) : (
          <DataTable
            columns={columns}
            data={expenses}
            searchable={true}
            searchPlaceholder="Search by description, merchant, claim #…"
            searchKeys={["expenseNumber", "description", "merchantName", "categoryName", "notes"]}
            statusKey="status"
            statuses={[
              { value: "SUBMITTED", label: "Pending" },
              { value: "APPROVED", label: "Approved" },
              { value: "REJECTED", label: "Rejected" },
              { value: "DRAFT", label: "Draft" },
            ]}
            categoryKey="categoryName"
            categories={categoryOptions}
            exportFilename="my-expenses.csv"
            defaultSortKey="expenseDate"
            defaultSortDir="desc"
            pageSize={10}
            emptyTitle="No expenses found"
            emptyDesc="You have not submitted any expense claims matching the filter criteria."
          />
        )}
      </div>

      <ExpenseDetailModal
        expense={selectedExpense}
        isOpen={Boolean(selectedExpense)}
        onClose={() => setSelectedExpense(null)}
        onActionComplete={(msg) => {
          setFeedback(msg);
          loadExpenses();
          setTimeout(() => setFeedback(""), 4000);
        }}
      />
    </AppLayout>
  );
}
