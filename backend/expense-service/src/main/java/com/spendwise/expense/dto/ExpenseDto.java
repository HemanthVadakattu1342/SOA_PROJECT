package com.spendwise.expense.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ExpenseDto {
    private Long id;
    private String expenseNumber;
    private Long employeeId;
    private String employeeName;
    private String department;
    private BigDecimal amount;
    private String currency;
    private String description;
    private Long categoryId;
    private String categoryName;
    private LocalDate expenseDate;
    private String receiptUrl;
    private String status;
    private LocalDateTime submittedAt;
    private LocalDateTime approvedAt;
    private String approvedByName;
    private String rejectionReason;
    private LocalDateTime createdAt;
}
