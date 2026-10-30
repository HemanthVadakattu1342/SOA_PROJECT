import { useState, useEffect } from "react";
import { expenseAPI } from "../../api/expenses";
import AppLayout from "../../components/layout/AppLayout";
import StatusBadge from "../../components/common/StatusBadge";
import Loading from "../../components/common/Loading";
import DataTable from "../../components/common/DataTable";
import ExpenseDetailModal from "../../components/common/ExpenseDetailModal";
import { Icons } from "../../components/common/Icons";

export default function FinanceExpenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [feedback, setFeedback] = useState("");

  const loadExpenses = () => {
    setLoading(true);
    expenseAPI
      .getAll(0, 200)
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
          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{row.department || "—"}</div>
        </div>
      ),
    },
    {
      key: "department",
      label: "Dept",
      sortable: true,
    },
    {
      key: "description",
      label: "Description",
      sortable: true,
      render: (row) => (
        <div style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {row.description}
        </div>
      ),
    },
    {
      key: "categoryName",
      label: "Category",
      sortable: true,
    },
    {
      key: "amount",
      label: "Amount",
      sortable: true,
      render: (row) => (
        <span style={{ fontWeight: 700 }}>
          ₹{Number(row.amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: "expenseDate",
      label: "Date",
      sortable: true,
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
        >
          <Icons.Eye size={14} /> View
        </button>
      ),
    },
  ];

  const categories = Array.from(
    new Set(expenses.map((e) => e.categoryName).filter(Boolean))
  );

  return (
    <AppLayout
      title="All Company Expenses"
      breadcrumbs={["Finance", "All Expenses"]}
    >
      <div className="page-header-row">
        <div>
          <h2 className="page-headline">Corporate Expense Administration</h2>
          <p className="page-subheadline">
            System-wide view of all submitted claims across departments, merchants, and approval states.
          </p>
        </div>

        <button className="btn btn-outline btn-sm" onClick={loadExpenses}>
          <Icons.Refresh size={14} /> Refresh
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
          <Loading message="Loading system-wide expenses…" />
        ) : (
          <DataTable
            columns={columns}
            data={expenses}
            searchable={true}
            searchPlaceholder="Search by employee, claim #, merchant, department…"
            searchKeys={["expenseNumber", "employeeName", "department", "description", "categoryName", "merchantName"]}
            statusKey="status"
            statuses={[
              { value: "APPROVED", label: "Approved" },
              { value: "SUBMITTED", label: "Pending" },
              { value: "REJECTED", label: "Rejected" },
              { value: "DRAFT", label: "Draft" },
            ]}
            categoryKey="categoryName"
            categories={categories}
            exportFilename="all-company-expenses.csv"
            defaultSortKey="expenseDate"
            defaultSortDir="desc"
            pageSize={15}
            emptyTitle="No expenses found"
            emptyDesc="No records match your search and filter criteria."
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
