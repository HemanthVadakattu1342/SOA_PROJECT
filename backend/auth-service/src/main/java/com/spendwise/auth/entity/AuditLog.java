package com.spendwise.auth.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Audit Log - records important user actions for compliance and security.
 * Admin can view all audit logs from the System Admin Portal.
 */
@Entity
@Table(name = "audit_logs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private String userEmail;
    private String action;       // e.g. LOGIN, EXPENSE_CREATED, BUDGET_UPDATED
    private String description;  // Human-readable description of what happened
    private String ipAddress;    // IP address of the request (if available)

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime timestamp;
}
