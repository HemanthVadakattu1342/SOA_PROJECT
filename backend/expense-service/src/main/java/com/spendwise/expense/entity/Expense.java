package com.spendwise.expense.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Expense entity - the heart of the application.
 * Stored in spendwise_expense database.
 *
 * Lifecycle: DRAFT -> SUBMITTED -> UNDER_REVIEW -> APPROVED or REJECTED
 */
@Entity
@Table(name = "expenses")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Expense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String expenseNumber;   // e.g. EXP-2026-00001

    @Column(nullable = false)
    private Long employeeId;

    @Column(nullable = false)
    private String employeeName;

    @Column(nullable = false)
    private String department;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Builder.Default
    @Column(nullable = false)
    private String currency = "INR";

    @Column(nullable = false)
    private String description;

    @Column(nullable = false)
    private Long categoryId;

    private String categoryName;    // Cached to avoid Feign call on every read

    @Column(nullable = false)
    private LocalDate expenseDate;

    private String receiptUrl;      // Path to uploaded receipt file

    private String merchantName;    // e.g. IndiGo Airlines, Taj Hotel

    @Column(columnDefinition = "TEXT")
    private String notes;           // Additional notes from employee

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ExpenseStatus status;

    private LocalDateTime submittedAt;
    private LocalDateTime approvedAt;

    private Long approvedBy;        // UserId of the manager who approved/rejected
    private String approvedByName;

    private String rejectionReason; // Required when status = REJECTED

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
