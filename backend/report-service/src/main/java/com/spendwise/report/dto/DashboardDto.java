package com.spendwise.report.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * DashboardDto - summary data for the main dashboard cards and charts.
 *
 * This is what the React dashboard displays:
 *   - Top cards: total/approved/pending/rejected expenses, budget used
 *   - Charts: monthly trend, category breakdown, department breakdown, approval ratio
 */
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class DashboardDto {
    // Summary cards
    private BigDecimal totalExpenses;
    private BigDecimal approvedExpenses;
    private BigDecimal pendingExpenses;
    private BigDecimal rejectedExpenses;
    private long totalCount;
    private long approvedCount;
    private long pendingCount;
    private long rejectedCount;

    // Budget overview
    private BigDecimal totalBudgetAllocated;
    private BigDecimal totalBudgetUsed;
    private BigDecimal totalBudgetRemaining;
    private BigDecimal overallUtilization;

    // Chart data
    private List<Map<String, Object>> monthlyTrend;       // Last 6 months
    private List<Map<String, Object>> categoryBreakdown;  // Amount per category
    private List<Map<String, Object>> departmentSpending; // Amount per department
    private List<Map<String, Object>> budgetUtilization;  // Budget % per department
}
