package com.spendwise.budget.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class BudgetRequest {

    @NotBlank(message = "Department is required")
    private String department;

    @NotNull(message = "Category ID is required")
    private Long categoryId;

    private String categoryName;

    @NotNull(message = "Financial year is required")
    @Min(value = 2020, message = "Year must be 2020 or later")
    private Integer financialYear;

    @NotNull(message = "Month is required")
    @Min(value = 1, message = "Month must be between 1 and 12")
    @Max(value = 12, message = "Month must be between 1 and 12")
    private Integer month;

    @NotNull(message = "Allocated amount is required")
    @DecimalMin(value = "0.01", message = "Allocated amount must be positive")
    private BigDecimal allocatedAmount;
}
