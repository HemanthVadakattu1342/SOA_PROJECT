package com.spendwise.budget.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Budget entity - represents a monthly departmental budget for a category.
 *
 * Example:
 *   Department: Engineering
 *   Category:   Travel (categoryId=1)
 *   Month:      9 (September), Year: 2026
 *   Allocated:  ?100,000
 *   Spent:      ?75,000
 *   Remaining:  ?25,000
 *   Utilization: 75%
 *   Status:     NORMAL
 *
 * When an expense is approved, Expense Service calls Budget Service
 * to update spentAmount. Budget Service recalculates everything.
 */
@Entity
@Table(name = "budgets", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"department", "category_id", "financial_year", "month"})
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Budget {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String department;      // e.g. Engineering, Finance, Marketing

    @Column(name = "category_id", nullable = false)
    private Long categoryId;

    private String categoryName;    // Cached for display

    @Column(nullable = false)
    private Integer financialYear;  // e.g. 2026

    @Column(nullable = false)
    private Integer month;          // 1-12

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal allocatedAmount;

    @Column(nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal spentAmount = BigDecimal.ZERO;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal remainingAmount;

    @Column(nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal utilizationPercentage = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private BudgetStatus status = BudgetStatus.NORMAL;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
