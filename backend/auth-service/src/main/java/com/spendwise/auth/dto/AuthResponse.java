package com.spendwise.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * AuthResponse - what we send back after successful login/register.
 * The frontend stores the "token" and sends it with every future request.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;       // JWT token
    private String tokenType;   // Always "Bearer"
    private Long userId;
    private String email;
    private String firstName;
    private String lastName;
    private String role;        // EMPLOYEE, MANAGER, FINANCE_ADMIN, SYSTEM_ADMIN
    private String department;
    private String employeeId;
    private long expiresIn;     // Token expiry in milliseconds
}
