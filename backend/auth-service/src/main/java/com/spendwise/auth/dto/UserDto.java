package com.spendwise.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * UserDto - safe user data to return to the frontend.
 * NEVER include the password field in a DTO.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    private Long id;
    private String employeeId;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String department;
    private String role;
    private boolean active;
    private LocalDateTime createdAt;
}
