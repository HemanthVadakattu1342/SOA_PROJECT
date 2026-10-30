package com.spendwise.auth.controller;

import com.spendwise.auth.dto.*;
import com.spendwise.auth.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * AuthController - handles all HTTP requests for authentication.
 *
 * IMPORTANT: Controllers should be THIN.
 * They only:
 * 1. Receive the HTTP request
 * 2. Call the service
 * 3. Return the response
 *
 * Business logic goes in AuthService, NOT here.
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Login, Register, and User Management APIs")
public class AuthController {

    private final AuthService authService;

    // ========================
    // PUBLIC ENDPOINTS (no JWT required)
    // ========================

    @PostMapping("/register")
    @Operation(summary = "Register a new user", description = "Creates a new user account and returns a JWT token")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest request) {

        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("User registered successfully", response));
    }

    @PostMapping("/login")
    @Operation(summary = "Login", description = "Authenticates user and returns a JWT token")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request) {

        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    // ========================
    // PROTECTED ENDPOINTS (JWT required)
    // ========================

    @GetMapping("/profile/{userId}")
    @Operation(summary = "Get user profile", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<UserDto>> getUserProfile(@PathVariable Long userId) {
        UserDto user = authService.getUserById(userId);
        return ResponseEntity.ok(ApiResponse.success("User found", user));
    }

    @GetMapping("/users")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")  // Only system admin can list all users
    @Operation(summary = "Get all users (Admin only)", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<List<UserDto>>> getAllUsers() {
        List<UserDto> users = authService.getAllUsers();
        return ResponseEntity.ok(ApiResponse.success("Users retrieved", users));
    }

    @PutMapping("/users/{userId}")
    @Operation(summary = "Update user", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<UserDto>> updateUser(
            @PathVariable Long userId,
            @Valid @RequestBody UpdateUserRequest request) {

        UserDto updated = authService.updateUser(userId, request);
        return ResponseEntity.ok(ApiResponse.success("User updated successfully", updated));
    }

    @GetMapping("/audit-logs")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    @Operation(summary = "Get audit logs (Admin only)", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<?>> getAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        var logs = authService.getAuditLogs(PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success("Audit logs retrieved", logs));
    }

    // Health check endpoint (used by other services to verify auth is up)
    @GetMapping("/health")
    @Operation(summary = "Health check")
    public ResponseEntity<ApiResponse<String>> health() {
        return ResponseEntity.ok(ApiResponse.success("Auth Service is running", "UP"));
    }
}
