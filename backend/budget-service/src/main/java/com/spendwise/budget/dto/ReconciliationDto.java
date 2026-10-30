package com.spendwise.budget.dto;

import lombok.*;
import java.math.BigDecimal;

/**
 * ReconciliationDto - used in the Finance Admin reconciliation page.
 * Shows side-by-side: allocated budget vs actual approved spending.
 */
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ReconciliationDto {
    private String department;
    private String categoryName;
    private Long categoryId;
    private Integer financialYear;
    private Integer month;
    private BigDecimal allocatedBudget;
    private BigDecimal actualSpending;
    private BigDecimal remainingBudget;
    private BigDecimal utilizationPercentage;
    private String reconciliationStatus; // WITHIN_BUDGET, NEAR_LIMIT, OVER_BUDGET
    private String budgetStatus;         // NORMAL, WARNING, CRITICAL, EXCEEDED
}
