import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { expenseAPI } from "../../api/expenses";
import { categoryAPI } from "../../api/categories";
import { useAuth } from "../../context/AuthContext";
import AppLayout from "../../components/layout/AppLayout";
import Modal from "../../components/common/Modal";
import { Icons } from "../../components/common/Icons";

export default function NewExpense() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showReviewModal, setShowReviewModal] = useState(false);

  const [form, setForm] = useState({
    description: "",
    amount: "",
    currency: "INR",
    categoryId: "",
    expenseDate: new Date().toISOString().split("T")[0],
    merchantName: "",
    receiptUrl: "",
    notes: "",
  });

  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    categoryAPI
      .getActive()
      .then((res) => setCategories(res.data?.data || []))
      .catch(() => {});
  }, []);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validate = () => {
    const errors = {};
    if (!form.description || form.description.trim().length < 5) {
      errors.description = "Description must be at least 5 characters long.";
    }
    if (!form.amount || Number(form.amount) <= 0) {
      errors.amount = "Please enter a valid positive amount.";
    }
    if (!form.categoryId) {
      errors.categoryId = "Please select an expense category.";
    }
    if (!form.expenseDate) {
      errors.expenseDate = "Please choose the date when expense occurred.";
    } else {
      const selected = new Date(form.expenseDate);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (selected > today) {
        errors.expenseDate = "Expense date cannot be in the future.";
      }
    }

    if (form.receiptUrl && !form.receiptUrl.startsWith("http")) {
      errors.receiptUrl = "Receipt URL must start with http:// or https://";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const executeSave = async (submitForApproval = false) => {
    if (!validate()) return;
    setError("");
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        amount: parseFloat(form.amount),
        categoryId: parseInt(form.categoryId, 10),
        employeeId: user.id,
        department: user.department,
        employeeName: `${user.firstName} ${user.lastName}`,
      };

      const res = await expenseAPI.create(payload);
      const newId = res.data?.data?.id;

      if (submitForApproval && newId) {
        await expenseAPI.submit(newId);
      }

      setSuccess(
        submitForApproval
          ? "Expense claim submitted successfully for manager approval!"
          : "Expense claim saved as draft."
      );
      setShowReviewModal(false);
      setTimeout(() => navigate("/employee/expenses"), 1600);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Failed to submit expense. Please check input values and retry."
      );
      setShowReviewModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCategoryObj = categories.find((c) => String(c.id) === String(form.categoryId));

  return (
    <AppLayout
      title="Submit New Expense"
      breadcrumbs={["Employee", "Expenses", "New Claim"]}
    >
      <div style={{ maxWidth: 840, margin: "0 auto" }}>
        <div className="page-header-row">
          <div>
            <h2 className="page-headline">Submit Expense Claim</h2>
            <p className="page-subheadline">
              Fill out claim details, attach receipt references, and submit for multi-tier manager approval.
            </p>
          </div>
          <Link to="/employee/expenses" className="btn btn-outline btn-sm">
            <Icons.ChevronLeft size={14} /> Back to Expenses
          </Link>
        </div>

        {error && (
          <div className="alert-box danger">
            <Icons.AlertTriangle size={16} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="alert-box success">
            <Icons.CheckCircle size={16} />
            <span>{success}</span>
          </div>
        )}

        <div className="card">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (validate()) {
                setShowReviewModal(true);
              }
            }}
          >
            {/* Row 1: Category & Amount */}
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">
                  Expense Category <span style={{ color: "var(--danger)" }}>*</span>
                </label>
                <select
                  className="form-select"
                  value={form.categoryId}
                  onChange={(e) => handleChange("categoryId", e.target.value)}
                >
                  <option value="">Select category…</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.budgetLimitPercentage ? `(${c.budgetLimitPercentage}% cap)` : ""}
                    </option>
                  ))}
                </select>
                {validationErrors.categoryId && (
                  <div className="form-error-msg">
                    <Icons.AlertCircle size={12} /> {validationErrors.categoryId}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">
                  Amount (INR ₹) <span style={{ color: "var(--danger)" }}>*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  className="form-input"
                  placeholder="0.00"
                  value={form.amount}
                  onChange={(e) => handleChange("amount", e.target.value)}
                />
                {validationErrors.amount && (
                  <div className="form-error-msg">
                    <Icons.AlertCircle size={12} /> {validationErrors.amount}
                  </div>
                )}
              </div>
            </div>

            {/* Row 2: Date & Merchant */}
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">
                  Expense Date <span style={{ color: "var(--danger)" }}>*</span>
                </label>
                <input
                  type="date"
                  className="form-input"
                  value={form.expenseDate}
                  onChange={(e) => handleChange("expenseDate", e.target.value)}
                />
                {validationErrors.expenseDate && (
                  <div className="form-error-msg">
                    <Icons.AlertCircle size={12} /> {validationErrors.expenseDate}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Merchant / Vendor Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. IndiGo Airlines, Marriott, Swiggy, Uber"
                  value={form.merchantName}
                  onChange={(e) => handleChange("merchantName", e.target.value)}
                />
                <div className="form-hint">Company or vendor billed</div>
              </div>
            </div>

            {/* Row 3: Description */}
            <div className="form-group">
              <label className="form-label">
                Expense Description <span style={{ color: "var(--danger)" }}>*</span>
              </label>
              <textarea
                className="form-textarea"
                placeholder="Detailed business purpose (e.g. Client visit to Mumbai engineering site and team working lunch)"
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                rows={3}
              />
              {validationErrors.description && (
                <div className="form-error-msg">
                  <Icons.AlertCircle size={12} /> {validationErrors.description}
                </div>
              )}
            </div>

            {/* Row 4: Receipt URL & Notes */}
            <div className="form-group">
              <label className="form-label">Receipt URL / Document Link (Optional)</label>
              <input
                type="url"
                className="form-input"
                placeholder="https://drive.google.com/file/d/your-receipt-doc.pdf"
                value={form.receiptUrl}
                onChange={(e) => handleChange("receiptUrl", e.target.value)}
              />
              {validationErrors.receiptUrl && (
                <div className="form-error-msg">
                  <Icons.AlertCircle size={12} /> {validationErrors.receiptUrl}
                </div>
              )}
              <div className="form-hint">
                Provide a secure web URL to the invoice or bill.
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Additional Notes / Comments</label>
              <input
                type="text"
                className="form-input"
                placeholder="Any special remarks or project billing codes…"
                value={form.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
              />
            </div>

            {/* Form Actions with Duplicate Guard */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid var(--border-color)", paddingTop: 20, marginTop: 12 }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => executeSave(false)}
                disabled={submitting}
              >
                <Icons.FileText size={15} /> Save as Draft
              </button>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
              >
                <Icons.CheckCircle size={15} /> Review &amp; Submit
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Submission Review Step Modal */}
      <Modal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        title="Review Expense Claim Before Submission"
        size="md"
        footer={
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setShowReviewModal(false)}
              disabled={submitting}
            >
              Edit Details
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => executeSave(true)}
              disabled={submitting}
            >
              {submitting ? "Submitting…" : "Confirm & Submit for Approval"}
            </button>
          </div>
        }
      >
        <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 16 }}>
          Please verify that all expense details below are accurate. Once submitted, your manager will be notified immediately.
        </p>

        <div style={{ background: "var(--bg-surface-subtle)", padding: 16, borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)", display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span className="form-hint">Amount:</span>
            <span style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>
              ₹{Number(form.amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span className="form-hint">Category:</span>
            <span style={{ fontWeight: 600 }}>{selectedCategoryObj?.name || "General"}</span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span className="form-hint">Expense Date:</span>
            <span>{form.expenseDate}</span>
          </div>

          {form.merchantName && (
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span className="form-hint">Merchant:</span>
              <span>{form.merchantName}</span>
            </div>
          )}

          <div>
            <span className="form-hint">Description:</span>
            <div style={{ fontSize: 13, color: "var(--text-primary)", marginTop: 2 }}>
              {form.description}
            </div>
          </div>

          {form.receiptUrl && (
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span className="form-hint">Receipt Link:</span>
              <a
                href={form.receiptUrl}
                target="_blank"
                rel="noreferrer"
                style={{ color: "var(--primary)", fontSize: 12 }}
              >
                View Attachment ↗
              </a>
            </div>
          )}
        </div>
      </Modal>
    </AppLayout>
  );
}
