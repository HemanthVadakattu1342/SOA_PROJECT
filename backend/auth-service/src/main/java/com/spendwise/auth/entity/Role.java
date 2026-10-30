package com.spendwise.auth.entity;

/**
 * Roles in SpendWise.
 *
 * EMPLOYEE       - Can submit expenses, view own data
 * MANAGER        - Can approve/reject team expenses, view department reports
 * FINANCE_ADMIN  - Can manage budgets, view all reports, manage categories
 * SYSTEM_ADMIN   - Can manage users, view audit logs, manage everything
 */
public enum Role {
    EMPLOYEE,
    MANAGER,
    FINANCE_ADMIN,
    SYSTEM_ADMIN
}
