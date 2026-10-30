package com.spendwise.expense.dto;

import lombok.Data;
import java.math.BigDecimal;

/** DTO matching what category-service returns - used by the Feign client */
@Data
public class CategoryDto {
    private Long id;
    private String name;
    private String description;
    private BigDecimal budgetLimit;
    private boolean active;
}
