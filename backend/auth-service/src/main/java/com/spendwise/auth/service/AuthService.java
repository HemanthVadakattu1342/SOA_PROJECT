package com.spendwise.auth.service;

import com.spendwise.auth.dto.*;
import com.spendwise.auth.entity.AuditLog;
import com.spendwise.auth.entity.Role;
import com.spendwise.auth.entity.User;
import com.spendwise.auth.exception.ResourceAlreadyExistsException;
import com.spendwise.auth.exception.ResourceNotFoundException;
import com.spendwise.auth.repository.AuditLogRepository;
import com.spendwise.auth.repository.UserRepository;
import com.spendwise.auth.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * AuthService - contains all the business logic for authentication.
 *
 * Controllers are "thin" - they just receive requests and call service methods.
 * Services contain the actual business rules.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    /**
     * REGISTER - creates a new user account.
     *
     * Steps:
     * 1. Check email is not already used
     * 2. Check employeeId is not already used
     * 3. Hash the password (NEVER store plain text)
     * 4. Save user to database
     * 5. Log the action
     * 6. Return a JWT token so user is immediately logged in
     */
    public AuthResponse register(RegisterRequest request) {
        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResourceAlreadyExistsException(
                "Email already registered: " + request.getEmail()
            );
        }

        // Check if employee ID is taken
        if (userRepository.existsByEmployeeId(request.getEmployeeId())) {
            throw new ResourceAlreadyExistsException(
                "Employee ID already exists: " + request.getEmployeeId()
            );
        }

        // Determine the role (default to EMPLOYEE if invalid role provided)
        Role role;
        try {
            role = Role.valueOf(request.getRole().toUpperCase());
        } catch (IllegalArgumentException e) {
            role = Role.EMPLOYEE;
        }

        // Build and save the user
        User user = User.builder()
                .employeeId(request.getEmployeeId())
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))  // BCrypt hash
                .phone(request.getPhone())
                .department(request.getDepartment())
                .role(role)
                .active(true)
                .build();

        user = userRepository.save(user);
        log.info("New user registered: {} ({})", user.getEmail(), user.getRole());

        // Audit log
        saveAuditLog(user.getId(), user.getEmail(), "USER_REGISTERED",
            "New user registered: " + user.getEmail() + " as " + user.getRole());

        // Generate JWT and return it
        String token = jwtUtil.generateToken(
            user.getId(), user.getEmail(),
            user.getRole().name(), user.getDepartment()
        );

        return buildAuthResponse(user, token);
    }

    /**
     * LOGIN - authenticates user and returns a JWT token.
     *
     * Steps:
     * 1. Spring Security verifies email + password
     * 2. If correct, we find the user and generate a JWT
     * 3. Return the JWT with user info
     */
    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail().trim();

        // This throws BadCredentialsException if login fails
        // Spring Security automatically handles the password check
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                email,
                request.getPassword()
            )
        );

        // If we reach here, credentials are correct
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        log.info("User logged in: {}", user.getEmail());

        // Audit log
        saveAuditLog(user.getId(), user.getEmail(), "LOGIN",
            "User logged in successfully");

        String token = jwtUtil.generateToken(
            user.getId(), user.getEmail(),
            user.getRole().name(), user.getDepartment()
        );

        return buildAuthResponse(user, token);
    }

    /**
     * GET USER PROFILE - returns user info by ID.
     */
    @Transactional(readOnly = true)
    public UserDto getUserById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                    "User not found with id: " + userId
                ));
        return mapToDto(user);
    }

    /**
     * GET ALL USERS - only for SYSTEM_ADMIN.
     */
    @Transactional(readOnly = true)
    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToDto)
                .toList();
    }

    /**
     * UPDATE USER - admin can update any user, employees can update own profile.
     */
    public UserDto updateUser(Long userId, UpdateUserRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                    "User not found with id: " + userId
                ));

        if (request.getFirstName() != null) user.setFirstName(request.getFirstName());
        if (request.getLastName() != null) user.setLastName(request.getLastName());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getDepartment() != null) user.setDepartment(request.getDepartment());
        if (request.getActive() != null) user.setActive(request.getActive());
        if (request.getRole() != null) {
            try {
                user.setRole(Role.valueOf(request.getRole().toUpperCase()));
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Invalid role: " + request.getRole());
            }
        }

        User saved = userRepository.save(user);
        saveAuditLog(userId, user.getEmail(), "USER_UPDATED",
            "User profile updated: " + user.getEmail());

        return mapToDto(saved);
    }

    /**
     * GET AUDIT LOGS - for System Admin.
     */
    @Transactional(readOnly = true)
    public Page<AuditLog> getAuditLogs(Pageable pageable) {
        return auditLogRepository.findAllByOrderByTimestampDesc(pageable);
    }

    // ========================
    // PRIVATE HELPER METHODS
    // ========================

    private AuthResponse buildAuthResponse(User user, String token) {
        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .userId(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole().name())
                .department(user.getDepartment())
                .employeeId(user.getEmployeeId())
                .expiresIn(86400000L)  // 24 hours in milliseconds
                .build();
    }

    private UserDto mapToDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .employeeId(user.getEmployeeId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .department(user.getDepartment())
                .role(user.getRole().name())
                .active(user.isActive())
                .createdAt(user.getCreatedAt())
                .build();
    }

    private void saveAuditLog(Long userId, String email, String action, String description) {
        AuditLog log = AuditLog.builder()
                .userId(userId)
                .userEmail(email)
                .action(action)
                .description(description)
                .build();
        auditLogRepository.save(log);
    }
}
