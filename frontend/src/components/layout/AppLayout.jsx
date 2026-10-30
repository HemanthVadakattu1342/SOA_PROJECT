import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import GlobalSearchModal from "../common/GlobalSearchModal";
import UserProfileModal from "../common/UserProfileModal";

export default function AppLayout({ title, breadcrumbs = [], children }) {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem("spendwise-sidebar-collapsed") === "true";
    } catch {
      return false;
    }
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const toggleCollapse = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("spendwise-sidebar-collapsed", String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="app-layout">
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={toggleCollapse}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        onOpenProfile={() => setProfileOpen(true)}
      />

      <div className={`main-wrapper ${collapsed ? "collapsed" : ""}`}>
        <Topbar
          title={title}
          breadcrumbs={breadcrumbs}
          onToggleMobile={() => setMobileOpen(true)}
          onOpenSearch={() => setSearchOpen(true)}
          onOpenProfile={() => setProfileOpen(true)}
        />

        <main className="page-container">
          {children}
        </main>
      </div>

      <GlobalSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />

      <UserProfileModal
        isOpen={profileOpen}
        onClose={() => setProfileOpen(false)}
      />
    </div>
  );
}
