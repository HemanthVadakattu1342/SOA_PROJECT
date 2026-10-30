package com.spendwise.category.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class CategoryDto {
    private Long id;
    private String name;
    private String description;
    private String icon;
    private BigDecimal budgetLimit;
    private Integer budgetLimitPercentage;
    private boolean active;
    private LocalDateTime createdAt;
}
