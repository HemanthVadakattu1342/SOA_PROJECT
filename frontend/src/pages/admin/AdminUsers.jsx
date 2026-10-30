import { useState, useEffect } from "react";
import { authAPI } from "../../api/auth";
import AppLayout from "../../components/layout/AppLayout";
import StatusBadge from "../../components/common/StatusBadge";
import Loading from "../../components/common/Loading";
import Modal from "../../components/common/Modal";
import DataTable from "../../components/common/DataTable";
import { Icons } from "../../components/common/Icons";

const ROLES = ["EMPLOYEE", "MANAGER", "FINANCE_ADMIN", "SYSTEM_ADMIN"];
const DEPARTMENTS = ["Engineering", "Finance", "Marketing", "Operations", "HR", "Sales", "Legal", "Product", "IT"];

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [registerForm, setRegisterForm] = useState({
    employeeId: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    department: "Engineering",
    role: "EMPLOYEE",
  });

  const loadUsers = () => {
    setLoading(true);
    authAPI
      .getAllUsers()
      .then((res) => setUsers(res.data?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSubmitting(true);
    try {
      await authAPI.register(registerForm);
      setFeedback("User registered and account provisioned successfully.");
      setShowRegisterModal(false);
      setRegisterForm({
        employeeId: "",
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        department: "Engineering",
        role: "EMPLOYEE",
      });
      loadUsers();
      setTimeout(() => setFeedback(""), 4000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to register new user.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    setErrorMsg("");
    setSubmitting(true);
    try {
      await authAPI.updateUser(editingUser.id, {
        firstName: editingUser.firstName,
        lastName: editingUser.lastName,
        department: editingUser.department,
        role: editingUser.role,
        active: editingUser.active,
      });
      setFeedback("User profile updated successfully.");
      setEditingUser(null);
      loadUsers();
      setTimeout(() => setFeedback(""), 4000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to update user.");
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      key: "fullName",
      label: "Name",
      sortable: true,
      render: (row) => (
        <div>
          <span style={{ fontWeight: 700 }}>
            {row.firstName} {row.lastName}
          </span>
          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
            ID: {row.employeeId || "—"}
          </div>
        </div>
      ),
    },
    {
      key: "email",
      label: "Email Address",
      sortable: true,
      render: (row) => <span style={{ color: "var(--text-secondary)" }}>{row.email}</span>,
    },
    {
      key: "role",
      label: "Role",
      sortable: true,
      render: (row) => (
        <span className={`role-badge ${row.role}`}>
          {row.role?.replace(/_/g, " ")}
        </span>
      ),
    },
    {
      key: "department",
      label: "Department",
      sortable: true,
      render: (row) => row.department || "Enterprise",
    },
    {
      key: "active",
      label: "Status",
      sortable: true,
      render: (row) => (
        <StatusBadge status={row.active ? "ACTIVE" : "INACTIVE"} />
      ),
    },
    {
      key: "actions",
      label: "Actions",
      sortable: false,
      render: (row) => (
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => {
            setErrorMsg("");
            setEditingUser({ ...row });
          }}
          title="Edit user attributes"
        >
          <Icons.Edit size={14} /> Edit
        </button>
      ),
    },
  ];

  return (
    <AppLayout
      title="User Management"
      breadcrumbs={["System Admin", "Users"]}
    >
      <div className="page-header-row">
        <div>
          <h2 className="page-headline">System User Directory</h2>
          <p className="page-subheadline">
            Manage user accounts, department associations, and role-based permissions across SpendWise.
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setShowRegisterModal(true)}>
          <Icons.Plus size={16} /> Register New User
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
          <Loading message="Loading system user accounts…" />
        ) : (
          <DataTable
            columns={columns}
            data={users}
            searchable={true}
            searchPlaceholder="Search users by name, email, department, ID…"
            searchKeys={["firstName", "lastName", "email", "employeeId", "department", "role"]}
            statusKey="role"
            statuses={[
              { value: "EMPLOYEE", label: "Employee" },
              { value: "MANAGER", label: "Manager" },
              { value: "FINANCE_ADMIN", label: "Finance Admin" },
              { value: "SYSTEM_ADMIN", label: "System Admin" },
            ]}
            exportFilename="spendwise-users.csv"
            defaultSortKey="email"
            defaultSortDir="asc"
            pageSize={10}
            emptyTitle="No users found"
            emptyDesc="Try adjusting your role filter or search query."
          />
        )}
      </div>

      {/* Register User Modal */}
      <Modal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        title="Provision New Corporate Account"
        size="md"
      >
        {errorMsg && (
          <div className="alert-box danger" style={{ marginBottom: 16 }}>
            <Icons.AlertTriangle size={15} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleRegister}>
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">First Name *</label>
              <input
                type="text"
                className="form-input"
                value={registerForm.firstName}
                onChange={(e) => setRegisterForm((p) => ({ ...p, firstName: e.target.value }))}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Last Name *</label>
              <input
                type="text"
                className="form-input"
                value={registerForm.lastName}
                onChange={(e) => setRegisterForm((p) => ({ ...p, lastName: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Employee ID *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. EMP102"
                value={registerForm.employeeId}
                onChange={(e) => setRegisterForm((p) => ({ ...p, employeeId: e.target.value }))}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Department *</label>
              <select
                className="form-select"
                value={registerForm.department}
                onChange={(e) => setRegisterForm((p) => ({ ...p, department: e.target.value }))}
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Corporate Email Address *</label>
            <input
              type="email"
              className="form-input"
              placeholder="user@spendwise.com"
              value={registerForm.email}
              onChange={(e) => setRegisterForm((p) => ({ ...p, email: e.target.value }))}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Initial Password *</label>
            <input
              type="password"
              className="form-input"
              placeholder="Minimum 8 characters"
              value={registerForm.password}
              onChange={(e) => setRegisterForm((p) => ({ ...p, password: e.target.value }))}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">System Role *</label>
            <select
              className="form-select"
              value={registerForm.role}
              onChange={(e) => setRegisterForm((p) => ({ ...p, role: e.target.value }))}
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>{r.replace(/_/g, " ")}</option>
              ))}
            </select>
          </div>

          <div className="modal-footer" style={{ margin: "20px -24px -24px", padding: "16px 24px" }}>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setShowRegisterModal(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={submitting}
            >
              {submitting ? "Provisioning…" : "Register User"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={Boolean(editingUser)}
        onClose={() => setEditingUser(null)}
        title={`Edit User: ${editingUser?.email}`}
        size="md"
      >
        {errorMsg && (
          <div className="alert-box danger" style={{ marginBottom: 16 }}>
            <Icons.AlertTriangle size={15} />
            <span>{errorMsg}</span>
          </div>
        )}

        {editingUser && (
          <form onSubmit={handleUpdateUser}>
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={editingUser.firstName || ""}
                  onChange={(e) => setEditingUser((p) => ({ ...p, firstName: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={editingUser.lastName || ""}
                  onChange={(e) => setEditingUser((p) => ({ ...p, lastName: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Department</label>
                <select
                  className="form-select"
                  value={editingUser.department || ""}
                  onChange={(e) => setEditingUser((p) => ({ ...p, department: e.target.value }))}
                >
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Role</label>
                <select
                  className="form-select"
                  value={editingUser.role || ""}
                  onChange={(e) => setEditingUser((p) => ({ ...p, role: e.target.value }))}
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>{r.replace(/_/g, " ")}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Account Active Status</label>
              <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
                <label style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                  <input
                    type="radio"
                    name="activeStatus"
                    checked={editingUser.active === true}
                    onChange={() => setEditingUser((p) => ({ ...p, active: true }))}
                  />
                  <span>Active</span>
                </label>
                <label style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                  <input
                    type="radio"
                    name="activeStatus"
                    checked={editingUser.active === false}
                    onChange={() => setEditingUser((p) => ({ ...p, active: false }))}
                  />
                  <span>Inactive (Suspended)</span>
                </label>
              </div>
            </div>

            <div className="modal-footer" style={{ margin: "20px -24px -24px", padding: "16px 24px" }}>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setEditingUser(null)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                disabled={submitting}
              >
                {submitting ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </AppLayout>
  );
}
