package com.spendwise.report.dto;

import lombok.Data;
import java.math.BigDecimal;

/** Minimal budget data fetched from Budget Service via Feign */
@Data
public class BudgetSummaryDto {
    private Long id;
    private String department;
    private Long categoryId;
    private String categoryName;
    private Integer financialYear;
    private Integer month;
    private BigDecimal allocatedAmount;
    private BigDecimal spentAmount;
    private BigDecimal remainingAmount;
    private BigDecimal utilizationPercentage;
    private String status;
}
