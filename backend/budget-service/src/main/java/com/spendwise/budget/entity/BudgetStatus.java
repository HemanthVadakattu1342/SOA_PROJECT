package com.spendwise.budget.entity;

/**
 * Budget utilization thresholds:
 *
 * NORMAL   - below 80% spent
 * WARNING  - 80% to 89% spent  -> send notification
 * CRITICAL - 90% to 99% spent  -> send notification
 * EXCEEDED - 100% or more spent -> send notification
 */
public enum BudgetStatus {
    NORMAL,
    WARNING,
    CRITICAL,
    EXCEEDED
}
