package com.spendwise.category.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Category entity - represents an expense category like Travel, Food, Equipment.
 * Stored in spendwise_category database.
 */
@Entity
@Table(name = "categories")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String name;           // e.g. Travel, Food, Equipment

    private String description;

    @Column(precision = 15, scale = 2)
    private BigDecimal budgetLimit; // Monthly soft limit for this category

    @Column(length = 10)
    private String icon = "🏷️";     // Emoji icon displayed in the UI

    private Integer budgetLimitPercentage = 100; // % of budget allowed for this category

    @Column(nullable = false)
    private boolean active = true;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
