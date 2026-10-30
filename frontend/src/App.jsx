import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import ProtectedRoute from "./components/common/ProtectedRoute";

// Auth
import Login from "./pages/auth/Login";

// Employee
import EmployeeDashboard from "./pages/employee/EmployeeDashboard";
import MyExpenses        from "./pages/employee/MyExpenses";
import NewExpense        from "./pages/employee/NewExpense";
import Notifications     from "./pages/employee/Notifications";

// Manager
import ManagerDashboard  from "./pages/manager/ManagerDashboard";
import PendingApprovals  from "./pages/manager/PendingApprovals";
import TeamExpenses      from "./pages/manager/TeamExpenses";
import ManagerBudgets    from "./pages/manager/ManagerBudgets";
import ManagerReports    from "./pages/manager/ManagerReports";

// Finance
import FinanceDashboard  from "./pages/finance/FinanceDashboard";
import FinanceExpenses   from "./pages/finance/FinanceExpenses";
import BudgetManagement  from "./pages/finance/BudgetManagement";
import Reconciliation    from "./pages/finance/Reconciliation";
import Categories        from "./pages/finance/Categories";
import FinanceReports    from "./pages/finance/FinanceReports";

// Admin
import AdminDashboard    from "./pages/admin/AdminDashboard";
import AdminUsers        from "./pages/admin/AdminUsers";
import AdminExpenses     from "./pages/admin/AdminExpenses";
import AdminCategories   from "./pages/admin/AdminCategories";
import AdminBudgets      from "./pages/admin/AdminBudgets";
import AdminReports      from "./pages/admin/AdminReports";
import AuditLogs         from "./pages/admin/AuditLogs";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<Login />} />
            <Route path="/"      element={<Navigate to="/login" replace />} />

            {/* Employee */}
            <Route path="/employee/dashboard"     element={<ProtectedRoute roles={["EMPLOYEE","MANAGER","FINANCE_ADMIN","SYSTEM_ADMIN"]}><EmployeeDashboard /></ProtectedRoute>} />
            <Route path="/employee/expenses"      element={<ProtectedRoute roles={["EMPLOYEE","MANAGER","FINANCE_ADMIN","SYSTEM_ADMIN"]}><MyExpenses /></ProtectedRoute>} />
            <Route path="/employee/new-expense"   element={<ProtectedRoute roles={["EMPLOYEE","MANAGER","FINANCE_ADMIN","SYSTEM_ADMIN"]}><NewExpense /></ProtectedRoute>} />
            <Route path="/employee/notifications" element={<ProtectedRoute roles={["EMPLOYEE","MANAGER","FINANCE_ADMIN","SYSTEM_ADMIN"]}><Notifications /></ProtectedRoute>} />

            {/* Manager */}
            <Route path="/manager/dashboard"      element={<ProtectedRoute roles={["MANAGER","FINANCE_ADMIN","SYSTEM_ADMIN"]}><ManagerDashboard /></ProtectedRoute>} />
            <Route path="/manager/pending"        element={<ProtectedRoute roles={["MANAGER","FINANCE_ADMIN","SYSTEM_ADMIN"]}><PendingApprovals /></ProtectedRoute>} />
            <Route path="/manager/expenses"       element={<ProtectedRoute roles={["MANAGER","FINANCE_ADMIN","SYSTEM_ADMIN"]}><TeamExpenses /></ProtectedRoute>} />
            <Route path="/manager/budgets"        element={<ProtectedRoute roles={["MANAGER","FINANCE_ADMIN","SYSTEM_ADMIN"]}><ManagerBudgets /></ProtectedRoute>} />
            <Route path="/manager/reports"        element={<ProtectedRoute roles={["MANAGER","FINANCE_ADMIN","SYSTEM_ADMIN"]}><ManagerReports /></ProtectedRoute>} />
            <Route path="/manager/notifications"  element={<ProtectedRoute roles={["MANAGER","FINANCE_ADMIN","SYSTEM_ADMIN"]}><Notifications /></ProtectedRoute>} />

            {/* Finance Admin */}
            <Route path="/finance/dashboard"      element={<ProtectedRoute roles={["FINANCE_ADMIN","SYSTEM_ADMIN"]}><FinanceDashboard /></ProtectedRoute>} />
            <Route path="/finance/expenses"       element={<ProtectedRoute roles={["FINANCE_ADMIN","SYSTEM_ADMIN"]}><FinanceExpenses /></ProtectedRoute>} />
            <Route path="/finance/budgets"        element={<ProtectedRoute roles={["FINANCE_ADMIN","SYSTEM_ADMIN"]}><BudgetManagement /></ProtectedRoute>} />
            <Route path="/finance/reconciliation" element={<ProtectedRoute roles={["FINANCE_ADMIN","SYSTEM_ADMIN"]}><Reconciliation /></ProtectedRoute>} />
            <Route path="/finance/categories"     element={<ProtectedRoute roles={["FINANCE_ADMIN","SYSTEM_ADMIN"]}><Categories /></ProtectedRoute>} />
            <Route path="/finance/reports"        element={<ProtectedRoute roles={["FINANCE_ADMIN","SYSTEM_ADMIN"]}><FinanceReports /></ProtectedRoute>} />
            <Route path="/finance/notifications"  element={<ProtectedRoute roles={["FINANCE_ADMIN","SYSTEM_ADMIN"]}><Notifications /></ProtectedRoute>} />

            {/* System Admin */}
            <Route path="/admin/dashboard"        element={<ProtectedRoute roles={["SYSTEM_ADMIN"]}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/users"            element={<ProtectedRoute roles={["SYSTEM_ADMIN"]}><AdminUsers /></ProtectedRoute>} />
            <Route path="/admin/expenses"         element={<ProtectedRoute roles={["SYSTEM_ADMIN"]}><AdminExpenses /></ProtectedRoute>} />
            <Route path="/admin/categories"       element={<ProtectedRoute roles={["SYSTEM_ADMIN"]}><AdminCategories /></ProtectedRoute>} />
            <Route path="/admin/budgets"          element={<ProtectedRoute roles={["SYSTEM_ADMIN"]}><AdminBudgets /></ProtectedRoute>} />
            <Route path="/admin/reports"          element={<ProtectedRoute roles={["SYSTEM_ADMIN"]}><AdminReports /></ProtectedRoute>} />
            <Route path="/admin/audit-logs"       element={<ProtectedRoute roles={["SYSTEM_ADMIN"]}><AuditLogs /></ProtectedRoute>} />
            <Route path="/admin/notifications"    element={<ProtectedRoute roles={["SYSTEM_ADMIN"]}><Notifications /></ProtectedRoute>} />

            {/* 404 */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
