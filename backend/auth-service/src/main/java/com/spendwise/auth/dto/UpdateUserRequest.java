package com.spendwise.auth.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * UpdateUserRequest - for updating user profile or admin editing a user.
 * All fields are optional (null means "do not change this field").
 */
@Data
public class UpdateUserRequest {

    @Size(min = 2, max = 50)
    private String firstName;

    @Size(min = 2, max = 50)
    private String lastName;

    private String phone;
    private String department;
    private String role;      // Only SYSTEM_ADMIN can change this
    private Boolean active;   // Only SYSTEM_ADMIN can activate/deactivate
}
