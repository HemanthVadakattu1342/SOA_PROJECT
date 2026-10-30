import { useState } from "react";
import Modal from "./Modal";
import StatusBadge from "./StatusBadge";
import { Icons } from "./Icons";
import { useAuth } from "../../context/AuthContext";
import { expenseAPI } from "../../api/expenses";

export default function ExpenseDetailModal({
  expense,
  isOpen,
  onClose,
  onActionComplete, // callback to refresh parent list
}) {
  const { user } = useAuth();
  const [rejecting, setRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState("");

  if (!expense) return null;

  const isManagerOrAdmin = ["MANAGER", "FINANCE_ADMIN", "SYSTEM_ADMIN"].includes(user?.role);
  const isOwner = user?.id === expense.userId || user?.employeeId === expense.employeeId;
  const isPending = expense.status === "SUBMITTED";
  const isDraft = expense.status === "DRAFT";

  const handleApprove = async () => {
    setActionError("");
    setSubmitting(true);
    try {
      await expenseAPI.approve(expense.id);
      if (onActionComplete) onActionComplete("Expense approved successfully");
      onClose();
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to approve expense");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setActionError("Please provide a rejection reason.");
      return;
    }
    setActionError("");
    setSubmitting(true);
    try {
      await expenseAPI.reject(expense.id, rejectionReason.trim());
      if (onActionComplete) onActionComplete("Expense rejected");
      setRejecting(false);
      onClose();
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to reject expense");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitDraft = async () => {
    setActionError("");
    setSubmitting(true);
    try {
      await expenseAPI.submit(expense.id);
      if (onActionComplete) onActionComplete("Expense submitted for approval");
      onClose();
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to submit expense");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteDraft = async () => {
    if (!confirm("Are you sure you want to delete this draft expense?")) return;
    setActionError("");
    setSubmitting(true);
    try {
      await expenseAPI.delete(expense.id);
      if (onActionComplete) onActionComplete("Draft expense deleted");
      onClose();
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to delete expense");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span>Expense Details</span>
          <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-muted)" }}>
            #{expense.expenseNumber || expense.id}
          </span>
        </div>
      }
      size="lg"
      footer={
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
          <div>
            {isDraft && isOwner && (
              <button
                className="btn btn-ghost btn-sm"
                style={{ color: "var(--danger)" }}
                onClick={handleDeleteDraft}
                disabled={submitting}
              >
                <Icons.Trash size={14} /> Delete Draft
              </button>
            )}
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-ghost btn-sm" onClick={onClose} disabled={submitting}>
              Close
            </button>

            {isDraft && isOwner && (
              <button
                className="btn btn-primary btn-sm"
                onClick={handleSubmitDraft}
                disabled={submitting}
              >
                <Icons.Check size={14} /> {submitting ? "Submitting…" : "Submit for Approval"}
              </button>
            )}

            {isPending && isManagerOrAdmin && !rejecting && (
              <>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => setRejecting(true)}
                  disabled={submitting}
                >
                  <Icons.X size={14} /> Reject…
                </button>
                <button
                  className="btn btn-success btn-sm"
                  onClick={handleApprove}
                  disabled={submitting}
                >
                  <Icons.Check size={14} /> {submitting ? "Approving…" : "Approve Expense"}
                </button>
              </>
            )}
          </div>
        </div>
      }
    >
      {actionError && (
        <div className="alert-box danger" style={{ marginBottom: 16 }}>
          <Icons.AlertTriangle size={16} />
          <span>{actionError}</span>
        </div>
      )}

      {/* Rejection input mode */}
      {rejecting ? (
        <div style={{ background: "var(--danger-subtle)", padding: 16, borderRadius: "var(--radius-md)", border: "1px solid var(--danger-border)", marginBottom: 20 }}>
          <div style={{ fontWeight: 600, color: "var(--danger-text)", marginBottom: 6 }}>
            Confirm Rejection
          </div>
          <p style={{ fontSize: 12.5, color: "var(--text-secondary)", marginBottom: 12 }}>
            Please state the specific reason for rejecting this claim (e.g., missing receipts, duplicate entry, out of policy).
          </p>
          <textarea
            className="form-textarea"
            placeholder="Type reason here…"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            rows={3}
          />
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 12 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setRejecting(false)}>
              Cancel
            </button>
            <button className="btn btn-danger btn-sm" onClick={handleReject} disabled={submitting}>
              {submitting ? "Rejecting…" : "Confirm Rejection"}
            </button>
          </div>
        </div>
      ) : null}

      {/* Main Metadata Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 20 }}>
        <div>
          <div className="form-hint">Claim Status</div>
          <div style={{ marginTop: 4 }}>
            <StatusBadge status={expense.status} />
          </div>
        </div>

        <div>
          <div className="form-hint">Total Amount</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)", marginTop: 2 }}>
            ₹{Number(expense.amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div>
          <div className="form-hint">Expense Date</div>
          <div style={{ fontWeight: 600, color: "var(--text-primary)", marginTop: 4 }}>
            {expense.expenseDate || "—"}
          </div>
        </div>

        <div>
          <div className="form-hint">Category</div>
          <div style={{ fontWeight: 600, color: "var(--text-primary)", marginTop: 4 }}>
            {expense.categoryName || "Uncategorized"}
          </div>
        </div>
      </div>

      <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: 16, display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <div className="form-hint">Description</div>
          <div style={{ fontSize: 14, color: "var(--text-primary)", marginTop: 4, lineHeight: 1.6 }}>
            {expense.description || "No description provided."}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <div className="form-hint">Submitted By</div>
            <div style={{ fontWeight: 600, color: "var(--text-primary)", marginTop: 2 }}>
              {expense.employeeName || "Employee"}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
              {expense.department ? `Department: ${expense.department}` : ""}
            </div>
          </div>

          <div>
            <div className="form-hint">Merchant / Vendor</div>
            <div style={{ fontWeight: 600, color: "var(--text-primary)", marginTop: 2 }}>
              {expense.merchantName || "—"}
            </div>
          </div>
        </div>

        {expense.notes && (
          <div>
            <div className="form-hint">Internal Notes</div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4, background: "var(--bg-surface-subtle)", padding: "8px 12px", borderRadius: "var(--radius-sm)" }}>
              {expense.notes}
            </div>
          </div>
        )}

        {expense.rejectionReason && (
          <div style={{ background: "var(--danger-subtle)", border: "1px solid var(--danger-border)", padding: 12, borderRadius: "var(--radius-md)" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--danger-text)", textTransform: "uppercase", letterSpacing: 0.5 }}>
              Rejection Reason
            </div>
            <div style={{ fontSize: 13, color: "var(--danger-text)", marginTop: 4 }}>
              {expense.rejectionReason}
            </div>
          </div>
        )}

        <div>
          <div className="form-hint">Receipt Attachment</div>
          {expense.receiptUrl ? (
            <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 8 }}>
              <a
                href={expense.receiptUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline btn-sm"
                style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                <Icons.ExternalLink size={14} /> Open Receipt Document
              </a>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                ({expense.receiptUrl})
              </span>
            </div>
          ) : (
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4, fontStyle: "italic" }}>
              No receipt attachment provided.
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
