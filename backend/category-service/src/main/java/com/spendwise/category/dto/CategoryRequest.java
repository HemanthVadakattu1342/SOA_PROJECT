package com.spendwise.category.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class CategoryRequest {

    @NotBlank(message = "Category name is required")
    @Size(min = 2, max = 50, message = "Name must be between 2 and 50 characters")
    private String name;

    private String description;

    private String icon = "🏷️";

    private Integer budgetLimitPercentage = 100;

    @DecimalMin(value = "0.0", inclusive = false, message = "Budget limit must be positive")
    private BigDecimal budgetLimit;
}
