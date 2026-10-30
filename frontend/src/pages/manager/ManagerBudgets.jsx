import { useState, useEffect } from "react";
import { budgetAPI } from "../../api/budgets";
import AppLayout from "../../components/layout/AppLayout";
import StatusBadge from "../../components/common/StatusBadge";
import Loading from "../../components/common/Loading";
import EmptyState from "../../components/common/EmptyState";
import { Icons } from "../../components/common/Icons";

const MONTH_NAMES = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function ManagerBudgets() {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadBudgets = () => {
    setLoading(true);
    budgetAPI
      .getAll()
      .then((res) => {
        setBudgets(res.data?.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadBudgets();
  }, []);

  const alerts = budgets.filter((b) =>
    ["WARNING", "CRITICAL", "EXCEEDED"].includes(b.status)
  );

  return (
    <AppLayout
      title="Department Budgets"
      breadcrumbs={["Management", "Budgets"]}
    >
      <div className="page-header-row">
        <div>
          <h2 className="page-headline">Budget Allocation &amp; Utilization</h2>
          <p className="page-subheadline">
            Monitor real-time spending against department caps with proactive threshold warnings.
          </p>
        </div>

        <button className="btn btn-outline btn-sm" onClick={loadBudgets}>
          <Icons.Refresh size={14} /> Refresh Budgets
        </button>
      </div>

      {/* Threshold Alert Banner */}
      {alerts.length > 0 && (
        <div className="alert-box warning">
          <Icons.AlertTriangle size={18} />
          <div>
            <strong>Budget Attention Required:</strong> {alerts.length} category budget(s) have reached or exceeded warning thresholds (80%+).
          </div>
        </div>
      )}

      {/* Status Explanations Legend */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 12,
          marginBottom: 24,
        }}
      >
        <div style={{ background: "var(--bg-surface)", padding: 12, borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <span className="badge badge-normal"><span className="badge-dot" /> Normal</span>
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>&lt; 80%</span>
          </div>
          <div style={{ fontSize: 11.5, color: "var(--text-secondary)" }}>
            Healthy spending volume safely within monthly allocation.
          </div>
        </div>

        <div style={{ background: "var(--bg-surface)", padding: 12, borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <span className="badge badge-warning"><span className="badge-dot" /> Warning</span>
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>80% – 89%</span>
          </div>
          <div style={{ fontSize: 11.5, color: "var(--text-secondary)" }}>
            Spending has reached warning threshold; monitor team approvals.
          </div>
        </div>

        <div style={{ background: "var(--bg-surface)", padding: 12, borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <span className="badge badge-critical"><span className="badge-dot" /> Critical</span>
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>90% – 99%</span>
          </div>
          <div style={{ fontSize: 11.5, color: "var(--text-secondary)" }}>
            Critically near budget depletion; discretionary spend should pause.
          </div>
        </div>

        <div style={{ background: "var(--bg-surface)", padding: 12, borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <span className="badge badge-exceeded"><span className="badge-dot" /> Exceeded</span>
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>100%+</span>
          </div>
          <div style={{ fontSize: 11.5, color: "var(--text-secondary)" }}>
            Department allocation exceeded. Requires finance reconciliation.
          </div>
        </div>
      </div>

      {loading ? (
        <Loading message="Loading budget allocations…" />
      ) : budgets.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<Icons.Wallet size={32} />}
            title="No budgets configured"
            description="Contact your Finance Administrator to set up department monthly allocations."
          />
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
          {budgets.map((b) => {
            const util = Number(b.utilizationPercentage || 0);
            const statusKey = b.status?.toLowerCase() || "normal";
            const remaining = Number(b.remainingAmount || 0);

            return (
              <div key={b.id} className="card">
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>
                      {b.categoryName || "General Category"}
                    </h3>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                      {b.department} Department · {MONTH_NAMES[b.month]} {b.financialYear}
                    </div>
                  </div>
                  <StatusBadge status={b.status} />
                </div>

                <div style={{ margin: "18px 0" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
                    <span style={{ color: "var(--text-muted)" }}>Utilization</span>
                    <span style={{ fontWeight: 700, color: util >= 100 ? "var(--danger)" : "var(--text-primary)" }}>
                      {util.toFixed(1)}%
                    </span>
                  </div>
                  <div className="progress-bar-wrap">
                    <div
                      className={`progress-bar-fill ${statusKey}`}
                      style={{ width: `${Math.min(util, 100)}%` }}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, background: "var(--bg-surface-subtle)", padding: 12, borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
                  <div>
                    <div className="form-hint" style={{ fontSize: 10 }}>Allocated</div>
                    <div style={{ fontSize: 13, fontWeight: 700, marginTop: 2 }}>
                      ₹{Number(b.allocatedAmount).toLocaleString("en-IN")}
                    </div>
                  </div>

                  <div>
                    <div className="form-hint" style={{ fontSize: 10 }}>Spent</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginTop: 2 }}>
                      ₹{Number(b.spentAmount).toLocaleString("en-IN")}
                    </div>
                  </div>

                  <div>
                    <div className="form-hint" style={{ fontSize: 10 }}>Remaining</div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: remaining < 0 ? "var(--danger)" : "var(--success)",
                        marginTop: 2,
                      }}
                    >
                      ₹{remaining.toLocaleString("en-IN")}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AppLayout>
  );
}
