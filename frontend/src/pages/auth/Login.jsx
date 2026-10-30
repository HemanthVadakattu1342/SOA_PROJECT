import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Icons } from "../../components/common/Icons";

const DEMO_USERS = [
  { role: "System Admin",   roleKey: "SYSTEM_ADMIN",  email: "admin@spendwise.com",   pass: "Admin@123" },
  { role: "Finance Admin",  roleKey: "FINANCE_ADMIN", email: "finance@spendwise.com", pass: "Finance@123" },
  { role: "Manager",        roleKey: "MANAGER",       email: "manager@spendwise.com", pass: "Manager@123" },
  { role: "Employee",       roleKey: "EMPLOYEE",      email: "emp1@spendwise.com",    pass: "Emp@12345" },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      const routes = {
        SYSTEM_ADMIN:  "/admin/dashboard",
        FINANCE_ADMIN: "/finance/dashboard",
        MANAGER:       "/manager/dashboard",
        EMPLOYEE:      "/employee/dashboard",
      };
      navigate(routes[user.role] || "/employee/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Authentication failed. Please verify your email and password."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (user) => {
    setForm({ email: user.email, password: user.pass });
    setError("");
  };

  return (
    <div className="auth-container">
      {/* Left Column: Brand & Security Proof Points */}
      <div className="auth-marketing-side">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 40 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "var(--radius-md)",
                background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 16px rgba(59, 130, 246, 0.4)",
              }}
            >
              <Icons.Wallet size={24} style={{ color: "#ffffff" }} />
            </div>
            <div>
              <span style={{ fontSize: 20, fontWeight: 800, color: "#ffffff", letterSpacing: -0.5 }}>
                SpendWise
              </span>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#93c5fd", textTransform: "uppercase", letterSpacing: 1 }}>
                Corporate Finance SaaS
              </div>
            </div>
          </div>

          <h2 style={{ fontSize: 36, fontWeight: 800, lineHeight: 1.2, letterSpacing: -0.8, marginBottom: 18 }}>
            Precision Corporate Expense &amp; Budget Reconciliation
          </h2>
          <p style={{ fontSize: 15, color: "#94a3b8", maxWidth: 500, lineHeight: 1.6, marginBottom: 36 }}>
            Unified financial control platform connecting multi-tier approvals, dynamic budget tracking, and real-time expense reconciliation.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              "Enterprise JWT stateless token authentication",
              "Multi-tier approval workflows with audit compliance",
              "Real-time WebSocket & STOMP notification dispatch",
              "Automated budget thresholds (Normal, Warning, Exceeded)",
              "Complete financial reconciliation and CSV data exports",
            ].map((feature, idx) => (
              <div key={idx} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13.5, color: "#cbd5e1" }}>
                <span
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    background: "rgba(59, 130, 246, 0.2)",
                    color: "#60a5fa",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icons.Check size={12} />
                </span>
                {feature}
              </div>
            ))}
          </div>
        </div>

        <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.1)", paddingTop: 20, display: "flex", alignItems: "center", justifyContent: "space-between", color: "#64748b", fontSize: 12 }}>
          <span>SpendWise Enterprise v2.4</span>
          <span>Spring Boot Microservices &amp; React</span>
        </div>
      </div>

      {/* Right Column: Clean Login Box */}
      <div className="auth-form-side">
        <div style={{ width: "100%", maxWidth: 380, margin: "0 auto" }}>
          <div style={{ marginBottom: 28 }}>
            <h3 style={{ fontSize: 24, fontWeight: 700, color: "var(--text-primary)", letterSpacing: -0.4 }}>
              Sign in to your account
            </h3>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>
              Enter your corporate credentials below.
            </p>
          </div>

          {error && (
            <div className="alert-box danger" style={{ marginBottom: 20 }}>
              <Icons.AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Corporate Email</label>
              <input
                type="email"
                className="form-input"
                placeholder="name@spendwise.com"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                required
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: "100%", marginTop: 8 }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="animate-spin">
                    <Icons.Refresh size={16} />
                  </span>
                  Signing in…
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <Icons.ChevronRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div
            style={{
              marginTop: 32,
              padding: 16,
              background: "var(--bg-surface-subtle)",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--border-color)",
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 0.8,
                color: "var(--text-muted)",
                marginBottom: 10,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Icons.Sparkles size={13} style={{ color: "var(--warning)" }} />
              Quick Demo Access
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {DEMO_USERS.map((demo) => (
                <button
                  key={demo.role}
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    padding: "8px 10px",
                    textAlign: "left",
                  }}
                  onClick={() => handleQuickFill(demo)}
                >
                  <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>
                    {demo.role}
                  </span>
                  <span style={{ fontSize: 10, color: "var(--text-muted)" }}>
                    {demo.email.split("@")[0]}
                  </span>
                </button>
              ))}
            </div>
            <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 10 }}>
              Demo accounts are only available if they exist in your database. Use your own account above.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
