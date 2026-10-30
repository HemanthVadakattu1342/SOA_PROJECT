package com.spendwise.expense.entity;

/**
 * Expense lifecycle statuses:
 *
 * DRAFT       - Employee created but has not submitted yet
 * SUBMITTED   - Employee clicked "Submit for Approval"
 * UNDER_REVIEW - Manager has opened it (optional intermediate state)
 * APPROVED    - Manager approved it; budget is updated
 * REJECTED    - Manager rejected with a reason
 * CANCELLED   - Employee cancelled before approval
 */
public enum ExpenseStatus {
    DRAFT,
    SUBMITTED,
    UNDER_REVIEW,
    APPROVED,
    REJECTED,
    CANCELLED
}
