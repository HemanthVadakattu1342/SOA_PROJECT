import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "./Modal";
import { Icons } from "./Icons";
import { useAuth } from "../../context/AuthContext";

export default function GlobalSearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen) {
      setQuery("");
    }
  }, [isOpen]);

  const quickNav = [
    { label: "Dashboard", path: `/${user?.role?.toLowerCase()?.replace("_admin", "").replace("system", "admin")}/dashboard`, icon: <Icons.Dashboard size={16} />, roles: ["EMPLOYEE", "MANAGER", "FINANCE_ADMIN", "SYSTEM_ADMIN"] },
    { label: "Submit New Expense", path: "/employee/new-expense", icon: <Icons.PlusCircle size={16} />, roles: ["EMPLOYEE", "MANAGER", "FINANCE_ADMIN", "SYSTEM_ADMIN"] },
    { label: "My Expenses", path: "/employee/expenses", icon: <Icons.Receipt size={16} />, roles: ["EMPLOYEE", "MANAGER", "FINANCE_ADMIN", "SYSTEM_ADMIN"] },
    { label: "Pending Approvals", path: "/manager/pending", icon: <Icons.Clock size={16} />, roles: ["MANAGER", "FINANCE_ADMIN", "SYSTEM_ADMIN"] },
    { label: "Team Expenses", path: "/manager/expenses", icon: <Icons.Users size={16} />, roles: ["MANAGER", "FINANCE_ADMIN", "SYSTEM_ADMIN"] },
    { label: "Budget Management", path: "/finance/budgets", icon: <Icons.Wallet size={16} />, roles: ["FINANCE_ADMIN", "SYSTEM_ADMIN"] },
    { label: "Reconciliation", path: "/finance/reconciliation", icon: <Icons.Scale size={16} />, roles: ["FINANCE_ADMIN", "SYSTEM_ADMIN"] },
    { label: "Categories", path: "/finance/categories", icon: <Icons.Tag size={16} />, roles: ["FINANCE_ADMIN", "SYSTEM_ADMIN"] },
    { label: "Financial Reports", path: "/finance/reports", icon: <Icons.BarChart size={16} />, roles: ["FINANCE_ADMIN", "SYSTEM_ADMIN"] },
    { label: "User Management", path: "/admin/users", icon: <Icons.Users size={16} />, roles: ["SYSTEM_ADMIN"] },
    { label: "Audit Logs", path: "/admin/audit-logs", icon: <Icons.Shield size={16} />, roles: ["SYSTEM_ADMIN"] },
    { label: "Notifications", path: `/${user?.role?.toLowerCase()?.replace("_admin", "").replace("system", "admin")}/notifications`, icon: <Icons.Bell size={16} />, roles: ["EMPLOYEE", "MANAGER", "FINANCE_ADMIN", "SYSTEM_ADMIN"] },
  ];

  const allowedNav = quickNav.filter(n => n.roles.includes(user?.role));
  const filteredNav = allowedNav.filter(n =>
    n.label.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8, width: "100%" }}>
          <Icons.Search size={18} style={{ color: "var(--primary)" }} />
          <span>Quick Navigation & Search</span>
        </div>
      }
      size="md"
    >
      <div style={{ marginBottom: 16 }}>
        <input
          type="text"
          className="form-input"
          placeholder="Type page name or feature (e.g. expenses, budgets, reconciliation)…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
      </div>

      <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, color: "var(--text-muted)", marginBottom: 8 }}>
        Available Pages
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 320, overflowY: "auto" }}>
        {filteredNav.length === 0 ? (
          <div style={{ padding: 24, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
            No matching navigation target found for "{query}".
          </div>
        ) : (
          filteredNav.map((item) => (
            <div
              key={item.path}
              onClick={() => handleSelect(item.path)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 14px",
                borderRadius: "var(--radius-md)",
                cursor: "pointer",
                background: "var(--bg-surface)",
                border: "1px solid var(--border-color)",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--primary-border)";
                e.currentTarget.style.background = "var(--primary-subtle)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border-color)";
                e.currentTarget.style.background = "var(--bg-surface)";
              }}
            >
              <span style={{ color: "var(--primary)" }}>{item.icon}</span>
              <span style={{ fontSize: 13.5, fontWeight: 500, color: "var(--text-primary)" }}>
                {item.label}
              </span>
              <span style={{ marginLeft: "auto", color: "var(--text-muted)" }}>
                <Icons.ChevronRight size={14} />
              </span>
            </div>
          ))
        )}
      </div>
    </Modal>
  );
}
