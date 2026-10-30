package com.spendwise.budget.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class BudgetDto {
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
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
