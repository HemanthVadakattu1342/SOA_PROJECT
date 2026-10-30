package com.spendwise.auth.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * User entity - represents an employee/manager/admin in the system.
 * This is stored in the spendwise_auth database.
 *
 * NOTE: We never store plain-text passwords. The password field always
 * contains a BCrypt hash.
 */
@Entity
@Table(name = "users")
@Data               // Lombok: generates getters, setters, toString, equals, hashCode
@Builder            // Lombok: enables builder pattern e.g. User.builder().email("...").build()
@NoArgsConstructor  // Lombok: generates no-args constructor (needed by JPA)
@AllArgsConstructor // Lombok: generates all-args constructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String employeeId;  // e.g. EMP001, EMP002

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;    // BCrypt hashed - NEVER plain text

    private String phone;

    @Column(nullable = false)
    private String department;  // e.g. Engineering, Finance, HR

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;          // EMPLOYEE, MANAGER, FINANCE_ADMIN, SYSTEM_ADMIN

    @Builder.Default
    @Column(nullable = false)
    private boolean active = true;  // Can be deactivated by admin

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    // Convenience method to get full name
    public String getFullName() {
        return firstName + " " + lastName;
    }
}
