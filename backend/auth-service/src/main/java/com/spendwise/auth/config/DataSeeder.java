package com.spendwise.auth.config;

import com.spendwise.auth.entity.Role;
import com.spendwise.auth.entity.User;
import com.spendwise.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * DataSeeder - automatically creates demo users when the app starts.
 * This only runs if the users table is empty.
 *
 * DEMO CREDENTIALS (for testing and academic demonstration):
 * -------------------------------------------------------
 * SYSTEM_ADMIN:    admin@spendwise.com     / Admin@123
 * FINANCE_ADMIN:   finance@spendwise.com   / Finance@123
 * MANAGER:         manager@spendwise.com   / Manager@123
 * EMPLOYEE 1:      emp1@spendwise.com      / Emp@12345
 * EMPLOYEE 2:      emp2@spendwise.com      / Emp@12345
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // Only seed if the database is empty
        if (userRepository.count() == 0) {
            log.info("Seeding demo users...");
            createDemoUsers();
            log.info("Demo users created successfully.");
            log.info("==============================================");
            log.info("DEMO CREDENTIALS:");
            log.info("Admin:    admin@spendwise.com    / Admin@123");
            log.info("Finance:  finance@spendwise.com  / Finance@123");
            log.info("Manager:  manager@spendwise.com  / Manager@123");
            log.info("Employee: emp1@spendwise.com     / Emp@12345");
            log.info("==============================================");
        }
    }

    private void createDemoUsers() {
        // System Admin
        userRepository.save(User.builder()
                .employeeId("ADM001")
                .firstName("System")
                .lastName("Administrator")
                .email("admin@spendwise.com")
                .password(passwordEncoder.encode("Admin@123"))
                .department("IT")
                .role(Role.SYSTEM_ADMIN)
                .active(true)
                .build());

        // Finance Admin
        userRepository.save(User.builder()
                .employeeId("FIN001")
                .firstName("Finance")
                .lastName("Admin")
                .email("finance@spendwise.com")
                .password(passwordEncoder.encode("Finance@123"))
                .department("Finance")
                .role(Role.FINANCE_ADMIN)
                .active(true)
                .build());

        // Manager
        userRepository.save(User.builder()
                .employeeId("MGR001")
                .firstName("John")
                .lastName("Manager")
                .email("manager@spendwise.com")
                .password(passwordEncoder.encode("Manager@123"))
                .department("Engineering")
                .role(Role.MANAGER)
                .active(true)
                .build());

        // Employee 1
        userRepository.save(User.builder()
                .employeeId("EMP001")
                .firstName("Alice")
                .lastName("Johnson")
                .email("emp1@spendwise.com")
                .password(passwordEncoder.encode("Emp@12345"))
                .department("Engineering")
                .role(Role.EMPLOYEE)
                .active(true)
                .build());

        // Employee 2
        userRepository.save(User.builder()
                .employeeId("EMP002")
                .firstName("Bob")
                .lastName("Smith")
                .email("emp2@spendwise.com")
                .password(passwordEncoder.encode("Emp@12345"))
                .department("Marketing")
                .role(Role.EMPLOYEE)
                .active(true)
                .build());
    }
}
