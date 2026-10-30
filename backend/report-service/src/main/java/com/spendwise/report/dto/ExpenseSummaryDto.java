package com.spendwise.report.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

/** Minimal expense data fetched from Expense Service via Feign */
@Data
public class ExpenseSummaryDto {
    private Long id;
    private String expenseNumber;
    private String employeeName;
    private String department;
    private BigDecimal amount;
    private String currency;
    private Long categoryId;
    private String categoryName;
    private LocalDate expenseDate;
    private String status;
}
