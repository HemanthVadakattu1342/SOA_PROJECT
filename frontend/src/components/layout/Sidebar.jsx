import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Icons } from "../common/Icons";

const NAV = {
  EMPLOYEE: [
    { to: "/employee/dashboard", icon: <Icons.Dashboard size={18} />, label: "Dashboard" },
    { to: "/employee/expenses",  icon: <Icons.Receipt size={18} />,   label: "My Expenses" },
    { to: "/employee/new-expense", icon: <Icons.PlusCircle size={18} />, label: "New Expense" },
    { to: "/employee/notifications", icon: <Icons.Bell size={18} />, label: "Notifications" },
  ],
  MANAGER: [
    { to: "/manager/dashboard",  icon: <Icons.Dashboard size={18} />, label: "Dashboard" },
    { to: "/manager/pending",    icon: <Icons.Clock size={18} />,     label: "Pending Approvals" },
    { to: "/manager/expenses",   icon: <Icons.Users size={18} />,     label: "Team Expenses" },
    { to: "/manager/budgets",    icon: <Icons.Wallet size={18} />,    label: "Budgets" },
    { to: "/manager/reports",    icon: <Icons.BarChart size={18} />,  label: "Reports" },
    { to: "/manager/notifications", icon: <Icons.Bell size={18} />,   label: "Notifications" },
  ],
  FINANCE_ADMIN: [
    { to: "/finance/dashboard",      icon: <Icons.Dashboard size={18} />, label: "Dashboard" },
    { to: "/finance/expenses",       icon: <Icons.Receipt size={18} />,   label: "All Expenses" },
    { to: "/finance/budgets",        icon: <Icons.Wallet size={18} />,    label: "Budget Management" },
    { to: "/finance/reconciliation", icon: <Icons.Scale size={18} />,     label: "Reconciliation" },
    { to: "/finance/categories",     icon: <Icons.Tag size={18} />,       label: "Categories" },
    { to: "/finance/reports",        icon: <Icons.BarChart size={18} />,  label: "Reports" },
    { to: "/finance/notifications",  icon: <Icons.Bell size={18} />,      label: "Notifications" },
  ],
  SYSTEM_ADMIN: [
    { to: "/admin/dashboard",  icon: <Icons.Dashboard size={18} />, label: "Dashboard" },
    { to: "/admin/users",      icon: <Icons.Users size={18} />,     label: "User Management" },
    { to: "/admin/expenses",   icon: <Icons.Receipt size={18} />,   label: "All Expenses" },
    { to: "/admin/categories", icon: <Icons.Tag size={18} />,       label: "Categories" },
    { to: "/admin/budgets",    icon: <Icons.Wallet size={18} />,    label: "Budgets" },
    { to: "/admin/reports",    icon: <Icons.BarChart size={18} />,  label: "Reports" },
    { to: "/admin/audit-logs", icon: <Icons.Shield size={18} />,    label: "Audit Logs" },
    { to: "/admin/notifications", icon: <Icons.Bell size={18} />,   label: "Notifications" },
  ],
};

const ROLE_LABEL = {
  EMPLOYEE: "Employee",
  MANAGER: "Manager",
  FINANCE_ADMIN: "Finance Admin",
  SYSTEM_ADMIN: "System Admin",
};

export default function Sidebar({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
  onOpenProfile,
}) {
  const { user } = useAuth();
  const links = NAV[user?.role] || NAV.EMPLOYEE;
  const initials = (
    (user?.firstName?.[0] || "") + (user?.lastName?.[0] || "")
  ).toUpperCase() || "SW";

  return (
    <>
      {mobileOpen && (
        <div
          className="modal-overlay"
          style={{ zIndex: 85 }}
          onClick={onCloseMobile}
        />
      )}
      <aside
        className={`sidebar ${collapsed ? "collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`}
      >
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="brand-symbol">
              <Icons.Wallet size={20} />
            </div>
            {!collapsed && (
              <div className="brand-text">
                <span className="brand-title">SpendWise</span>
                <span className="brand-subtitle">Corporate SaaS</span>
              </div>
            )}
          </div>
          <button
            className="sidebar-collapse-btn"
            onClick={onToggleCollapse}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label="Toggle sidebar"
          >
            {collapsed ? <Icons.ChevronRight size={14} /> : <Icons.ChevronLeft size={14} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {!collapsed && <div className="nav-section-label">Navigation</div>}
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
              title={collapsed ? link.label : undefined}
            >
              <span className="nav-icon">{link.icon}</span>
              {!collapsed && <span>{link.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div
            className="user-profile-card"
            onClick={onOpenProfile}
            title="Open Profile Settings"
          >
            <div className="user-avatar">{initials}</div>
            {!collapsed && (
              <div className="user-details">
                <div className="user-name">
                  {user?.firstName} {user?.lastName}
                </div>
                <div className="user-meta">
                  {ROLE_LABEL[user?.role] || "User"}
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
