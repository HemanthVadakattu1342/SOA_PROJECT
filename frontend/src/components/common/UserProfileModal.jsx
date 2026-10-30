import Modal from "./Modal";
import { Icons } from "./Icons";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

export default function UserProfileModal({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  if (!user) return null;

  const initials = (
    (user?.firstName?.[0] || "") + (user?.lastName?.[0] || "")
  ).toUpperCase() || "SW";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="User Profile & Settings"
      size="md"
      footer={
        <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
          <button
            className="btn btn-outline btn-sm"
            style={{ color: "var(--danger)", borderColor: "var(--danger-border)" }}
            onClick={logout}
          >
            <Icons.LogOut size={14} /> Sign Out
          </button>
          <button className="btn btn-primary btn-sm" onClick={onClose}>
            Done
          </button>
        </div>
      }
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "var(--primary-subtle)",
            color: "var(--primary)",
            border: "2px solid var(--primary-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
            fontWeight: 700,
          }}
        >
          {initials}
        </div>
        <div>
          <h4 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>
            {user.firstName} {user.lastName}
          </h4>
          <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>{user.email}</p>
          <span className={`role-badge ${user.role}`} style={{ marginTop: 4 }}>
            {user.role?.replace(/_/g, " ")}
          </span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 24 }}>
        <div style={{ background: "var(--bg-surface-subtle)", padding: 12, borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
          <div className="form-hint">Employee ID</div>
          <div style={{ fontWeight: 600, color: "var(--text-primary)", marginTop: 2 }}>
            {user.employeeId || "—"}
          </div>
        </div>

        <div style={{ background: "var(--bg-surface-subtle)", padding: 12, borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
          <div className="form-hint">Department</div>
          <div style={{ fontWeight: 600, color: "var(--text-primary)", marginTop: 2 }}>
            {user.department || "Enterprise"}
          </div>
        </div>
      </div>

      <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: 18 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 10 }}>
          Interface Theme
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            type="button"
            className={`btn ${theme === "light" ? "btn-primary" : "btn-secondary"} btn-sm`}
            style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            onClick={() => setTheme("light")}
          >
            <Icons.Sun size={15} /> Light Mode
          </button>
          <button
            type="button"
            className={`btn ${theme === "dark" ? "btn-primary" : "btn-secondary"} btn-sm`}
            style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            onClick={() => setTheme("dark")}
          >
            <Icons.Moon size={15} /> Dark Mode
          </button>
        </div>
      </div>

      <div style={{ marginTop: 20, padding: 12, background: "var(--primary-subtle)", borderRadius: "var(--radius-md)", border: "1px solid var(--primary-border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--primary)", fontWeight: 600, fontSize: 12.5 }}>
          <Icons.Shield size={16} /> Enterprise Security & RBAC
        </div>
        <p style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>
          Your role permissions and data access boundaries are securely enforced via Spring Security and JWT gateway filters.
        </p>
      </div>
    </Modal>
  );
}
