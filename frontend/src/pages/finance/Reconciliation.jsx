import { useState, useEffect, useMemo } from "react";
import { budgetAPI } from "../../api/budgets";
import AppLayout from "../../components/layout/AppLayout";
import StatusBadge from "../../components/common/StatusBadge";
import StatCard from "../../components/common/StatCard";
import Loading from "../../components/common/Loading";
import DataTable from "../../components/common/DataTable";
import { Icons } from "../../components/common/Icons";

const MONTH_NAMES = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function Reconciliation() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadReconciliation = () => {
    setLoading(true);
    budgetAPI
      .getReconciliation()
      .then((res) => {
        setData(res.data?.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadReconciliation();
  }, []);

  const totalAllocated = useMemo(
    () => data.reduce((s, r) => s + Number(r.allocatedBudget || 0), 0),
    [data]
  );
  const totalActual = useMemo(
    () => data.reduce((s, r) => s + Number(r.actualSpending || 0), 0),
    [data]
  );
  const totalRemaining = totalAllocated - totalActual;
  const overallUtilization = totalAllocated > 0 ? (totalActual / totalAllocated) * 100 : 0;

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
      key: "allocatedBudget",
      label: "Allocated",
      sortable: true,
      render: (row) => `₹${Number(row.allocatedBudget).toLocaleString("en-IN")}`,
    },
    {
      key: "actualSpending",
      label: "Actual Spent",
      sortable: true,
      render: (row) => (
        <span style={{ fontWeight: 700 }}>
          ₹{Number(row.actualSpending).toLocaleString("en-IN")}
        </span>
      ),
    },
    {
      key: "remainingBudget",
      label: "Remaining",
      sortable: true,
      render: (row) => {
        const rem = Number(row.remainingBudget || 0);
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
        return (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div className="progress-bar-wrap" style={{ width: 80 }}>
              <div
                className={`progress-bar-fill ${row.budgetStatus?.toLowerCase() || "normal"}`}
                style={{ width: `${Math.min(util, 100)}%` }}
              />
            </div>
            <span style={{ fontSize: 11.5, fontWeight: 600 }}>{util.toFixed(1)}%</span>
          </div>
        );
      },
    },
    {
      key: "reconciliationStatus",
      label: "Recon Status",
      sortable: true,
      render: (row) => <StatusBadge status={row.reconciliationStatus} />,
    },
    {
      key: "budgetStatus",
      label: "Budget Status",
      sortable: true,
      render: (row) => <StatusBadge status={row.budgetStatus} />,
    },
  ];

  return (
    <AppLayout
      title="Budget Reconciliation"
      breadcrumbs={["Finance", "Reconciliation"]}
    >
      <div className="page-header-row">
        <div>
          <h2 className="page-headline">Budget Reconciliation Ledger</h2>
          <p className="page-subheadline">
            Variance analysis comparing authorized allocations against actual recorded expenses.
          </p>
        </div>

        <button className="btn btn-outline btn-sm" onClick={loadReconciliation}>
          <Icons.Refresh size={14} /> Refresh Ledger
        </button>
      </div>

      {/* KPI Cards */}
      <div className="stats-grid">
        <StatCard
          icon={<Icons.Wallet size={22} />}
          label="Total Authorized"
          value={`₹${(totalAllocated / 1000).toFixed(0)}K`}
          variant="primary"
          subtext={`₹${totalAllocated.toLocaleString("en-IN")}`}
        />
        <StatCard
          icon={<Icons.TrendingUp size={22} />}
          label="Actual Disbursed"
          value={`₹${(totalActual / 1000).toFixed(0)}K`}
          variant="purple"
          subtext={`₹${totalActual.toLocaleString("en-IN")}`}
        />
        <StatCard
          icon={<Icons.CheckCircle size={22} />}
          label="Variance / Remaining"
          value={`₹${(totalRemaining / 1000).toFixed(0)}K`}
          variant={totalRemaining < 0 ? "danger" : "success"}
          subtext={totalRemaining < 0 ? "Budget overrun detected" : "Positive headroom"}
        />
        <StatCard
          icon={<Icons.BarChart size={22} />}
          label="Treasury Burn Rate"
          value={`${overallUtilization.toFixed(1)}%`}
          variant={overallUtilization >= 100 ? "danger" : "success"}
          subtext="Net allocation burned"
        />
      </div>

      {/* Reconciliation Table */}
      <div className="card">
        {loading ? (
          <Loading message="Reconciling allocations with posted transactions…" />
        ) : (
          <DataTable
            columns={columns}
            data={data}
            searchable={true}
            searchPlaceholder="Filter reconciliation by department or category…"
            searchKeys={["department", "categoryName", "reconciliationStatus", "budgetStatus"]}
            exportFilename="budget-reconciliation.csv"
            defaultSortKey="utilizationPercentage"
            defaultSortDir="desc"
            pageSize={10}
            emptyTitle="No reconciliation records"
            emptyDesc="Create budget allocations and record approved expenses to generate reconciliation reports."
          />
        )}
      </div>
    </AppLayout>
  );
}
