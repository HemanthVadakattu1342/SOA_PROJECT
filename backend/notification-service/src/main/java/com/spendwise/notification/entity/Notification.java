package com.spendwise.notification.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

/**
 * Notification entity - stored in spendwise_notification database.
 *
 * Notifications are:
 * - Saved to DB (user can see notification history)
 * - Pushed in real-time to the browser via WebSocket/STOMP
 */
@Entity
@Table(name = "notifications")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;        // Who receives this notification

    @Column(nullable = false)
    private String title;       // Short heading e.g. "Expense Approved"

    @Column(nullable = false, length = 1000)
    private String message;     // Full message text

    @Column(nullable = false)
    private String type;        // EXPENSE_SUBMITTED, EXPENSE_APPROVED, BUDGET_WARNING, etc.

    @Column(name = "is_read", nullable = false)
    @Builder.Default
    private boolean read = false;  // Has the user read this notification?

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
