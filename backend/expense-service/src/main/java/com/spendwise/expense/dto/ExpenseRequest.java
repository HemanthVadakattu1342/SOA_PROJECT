package com.spendwise.expense.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class ExpenseRequest {

    @NotNull(message = "Category is required")
    private Long categoryId;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
    @Digits(integer = 13, fraction = 2, message = "Invalid amount format")
    private BigDecimal amount;

    private String currency = "INR";

    @NotBlank(message = "Description is required")
    @Size(min = 5, max = 500, message = "Description must be between 5 and 500 characters")
    private String description;

    @NotNull(message = "Expense date is required")
    @PastOrPresent(message = "Expense date cannot be in the future")
    private LocalDate expenseDate;

    private String receiptUrl;

    private String merchantName;   // e.g. IndiGo Airlines, Taj Hotel

    private String notes;          // Additional details from the employee
}
