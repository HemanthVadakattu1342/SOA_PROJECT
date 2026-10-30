import { useState, useEffect } from "react";
import { expenseAPI } from "../../api/expenses";
import AppLayout from "../../components/layout/AppLayout";
import StatusBadge from "../../components/common/StatusBadge";
import Loading from "../../components/common/Loading";
import DataTable from "../../components/common/DataTable";
import ExpenseDetailModal from "../../components/common/ExpenseDetailModal";
import { Icons } from "../../components/common/Icons";

export default function TeamExpenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [feedback, setFeedback] = useState("");

  const loadTeamExpenses = () => {
    setLoading(true);
    expenseAPI
      .getAll(0, 100)
      .then((res) => {
        setExpenses(res.data?.data?.content || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadTeamExpenses();
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
      render: (row) => row.categoryName || "General",
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
      render: (row) => row.expenseDate || "—",
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

  const categoryOptions = Array.from(
    new Set(expenses.map((e) => e.categoryName).filter(Boolean))
  );

  return (
    <AppLayout
      title="Team Expenses"
      breadcrumbs={["Management", "Team Expenses"]}
    >
      <div className="page-header-row">
        <div>
          <h2 className="page-headline">Team Expense Records</h2>
          <p className="page-subheadline">
            Systematic overview of all submissions across team members with filterable analytics.
          </p>
        </div>

        <button className="btn btn-outline btn-sm" onClick={loadTeamExpenses}>
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
          <Loading message="Fetching team expense records…" />
        ) : (
          <DataTable
            columns={columns}
            data={expenses}
            searchable={true}
            searchPlaceholder="Search by employee, description, claim #, merchant…"
            searchKeys={["expenseNumber", "employeeName", "description", "categoryName", "merchantName"]}
            statusKey="status"
            statuses={[
              { value: "SUBMITTED", label: "Pending" },
              { value: "APPROVED", label: "Approved" },
              { value: "REJECTED", label: "Rejected" },
              { value: "DRAFT", label: "Draft" },
            ]}
            categoryKey="categoryName"
            categories={categoryOptions}
            exportFilename="team-expenses.csv"
            defaultSortKey="expenseDate"
            defaultSortDir="desc"
            pageSize={10}
            emptyTitle="No team expenses found"
            emptyDesc="No records match your selected filters."
          />
        )}
      </div>

      <ExpenseDetailModal
        expense={selectedExpense}
        isOpen={Boolean(selectedExpense)}
        onClose={() => setSelectedExpense(null)}
        onActionComplete={(msg) => {
          setFeedback(msg);
          loadTeamExpenses();
          setTimeout(() => setFeedback(""), 4000);
        }}
      />
    </AppLayout>
  );
}
