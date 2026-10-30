import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { notificationAPI } from "../../api/notifications";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { Icons } from "../common/Icons";

export default function Topbar({
  title,
  breadcrumbs = [],
  onToggleMobile,
  onOpenSearch,
  onOpenProfile,
}) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [unreadCount, setUnreadCount] = useState(0);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [recentNotifs, setRecentNotifs] = useState([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);
  const dropdownRef = useRef(null);

  // Poll and fetch unread count
  useEffect(() => {
    let mounted = true;
    const fetchUnread = () => {
      notificationAPI
        .getUnreadCount()
        .then((res) => {
          if (mounted) setUnreadCount(res.data?.data || 0);
        })
        .catch(() => {});
    };

    fetchUnread();
    const timer = setInterval(fetchUnread, 30000); // 30s fallback
    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setNotifDropdownOpen(false);
      }
    };
    if (notifDropdownOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [notifDropdownOpen]);

  const handleToggleNotifDropdown = () => {
    if (!notifDropdownOpen) {
      setLoadingNotifs(true);
      notificationAPI
        .getMy(0, 5)
        .then((res) => {
          setRecentNotifs(res.data?.data?.content || []);
        })
        .catch(() => {})
        .finally(() => setLoadingNotifs(false));
    }
    setNotifDropdownOpen(!notifDropdownOpen);
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllRead();
      setUnreadCount(0);
      setRecentNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      // ignore
    }
  };

  const navigateToNotifications = () => {
    setNotifDropdownOpen(false);
    const rolePrefix = user?.role?.toLowerCase()?.replace("_admin", "").replace("system", "admin") || "employee";
    navigate(`/${rolePrefix}/notifications`);
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          className="mobile-menu-btn"
          onClick={onToggleMobile}
          aria-label="Open navigation menu"
        >
          <Icons.Menu size={20} />
        </button>

        <div className="topbar-title-wrap">
          <h1 className="topbar-title">{title}</h1>
          <div className="topbar-breadcrumbs">
            <span>SpendWise</span>
            <span>/</span>
            {breadcrumbs.length > 0 ? (
              breadcrumbs.map((b, idx) => (
                <span key={idx}>
                  {b}
                  {idx < breadcrumbs.length - 1 && " / "}
                </span>
              ))
            ) : (
              <span>{title}</span>
            )}
          </div>
        </div>
      </div>

      <div className="topbar-right">
        {/* Global Search Pill */}
        <button
          className="search-trigger-btn"
          onClick={onOpenSearch}
          title="Search anything (Ctrl+K)"
        >
          <Icons.Search size={14} />
          <span>Search portal…</span>
          <span className="search-shortcut-badge">⌘K</span>
        </button>

        {/* Theme Toggle */}
        <button
          className="icon-action-btn"
          onClick={toggleTheme}
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <Icons.Sun size={17} style={{ color: "var(--warning)" }} />
          ) : (
            <Icons.Moon size={17} />
          )}
        </button>

        {/* Notification Bell & Dropdown */}
        <div style={{ position: "relative" }} ref={dropdownRef}>
          <button
            className="icon-action-btn"
            onClick={handleToggleNotifDropdown}
            title="Notifications"
            aria-label="View notifications"
          >
            <Icons.Bell size={18} />
            {unreadCount > 0 && (
              <span className="notif-badge-pill">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {notifDropdownOpen && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                right: 0,
                width: 340,
                background: "var(--bg-surface)",
                border: "1px solid var(--border-color)",
                borderRadius: "var(--radius-lg)",
                boxShadow: "var(--shadow-xl)",
                zIndex: 100,
                overflow: "hidden",
                animation: "modalPop 0.15s ease-out",
              }}
            >
              <div
                style={{
                  padding: "12px 16px",
                  borderBottom: "1px solid var(--border-color)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 13, color: "var(--text-primary)" }}>
                  Notifications
                </div>
                {unreadCount > 0 && (
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ fontSize: 11, padding: "2px 6px" }}
                    onClick={handleMarkAllRead}
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div style={{ maxHeight: 280, overflowY: "auto" }}>
                {loadingNotifs ? (
                  <div style={{ padding: 20, textAlign: "center", color: "var(--text-muted)", fontSize: 12 }}>
                    Loading notifications…
                  </div>
                ) : recentNotifs.length === 0 ? (
                  <div style={{ padding: 24, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
                    No recent notifications
                  </div>
                ) : (
                  recentNotifs.map((n) => (
                    <div
                      key={n.id}
                      onClick={navigateToNotifications}
                      style={{
                        padding: "10px 14px",
                        borderBottom: "1px solid var(--border-color-subtle)",
                        cursor: "pointer",
                        background: n.read ? "transparent" : "var(--primary-subtle)",
                        transition: "background 0.1s ease",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 2 }}>
                        <span style={{ fontSize: 12.5, fontWeight: n.read ? 500 : 700, color: "var(--text-primary)" }}>
                          {n.title}
                        </span>
                        {!n.read && (
                          <span
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              background: "var(--primary)",
                            }}
                          />
                        )}
                      </div>
                      <div style={{ fontSize: 11.5, color: "var(--text-secondary)", lineHeight: 1.4 }}>
                        {n.message}
                      </div>
                      <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 4 }}>
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div
                style={{
                  padding: "8px 14px",
                  borderTop: "1px solid var(--border-color)",
                  textAlign: "center",
                  background: "var(--bg-surface-subtle)",
                }}
              >
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ width: "100%", fontSize: 12, color: "var(--primary)" }}
                  onClick={navigateToNotifications}
                >
                  View All Notifications →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Role Tag & Profile Button */}
        <div
          onClick={onOpenProfile}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            cursor: "pointer",
            padding: "4px 8px",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-color)",
            background: "var(--bg-surface-subtle)",
            transition: "all 0.15s ease",
          }}
          title="Account & Profile Settings"
        >
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: "50%",
              background: "var(--primary)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              fontWeight: 700,
            }}
          >
            {(user?.firstName?.[0] || "U").toUpperCase()}
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>
            {user?.firstName}
          </span>
          <span className={`role-badge ${user?.role}`}>
            {user?.role?.replace(/_/g, " ")}
          </span>
        </div>
      </div>
    </header>
  );
}
