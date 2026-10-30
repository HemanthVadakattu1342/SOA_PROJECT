package com.spendwise.auth.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

/**
 * RegisterRequest - data sent by the frontend when a new user signs up.
 * We use @Valid annotations so Spring automatically validates this data.
 */
@Data
public class RegisterRequest {

    @NotBlank(message = "Employee ID is required")
    private String employeeId;

    @NotBlank(message = "First name is required")
    @Size(min = 2, max = 50, message = "First name must be between 2 and 50 characters")
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(min = 2, max = 50, message = "Last name must be between 2 and 50 characters")
    private String lastName;

    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email address")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;

    private String phone;

    @NotBlank(message = "Department is required")
    private String department;

    // Role defaults to EMPLOYEE if not specified
    private String role = "EMPLOYEE";
}
