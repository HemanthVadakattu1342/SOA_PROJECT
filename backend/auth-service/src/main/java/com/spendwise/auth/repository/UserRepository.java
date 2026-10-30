package com.spendwise.auth.repository;

import com.spendwise.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

/**
 * UserRepository - Spring Data JPA gives us database operations for free.
 * We just define method signatures and Spring generates the SQL automatically.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Find user by email (used for login)
    Optional<User> findByEmailIgnoreCase(String email);

    // Check if email is already registered
    boolean existsByEmail(String email);

    // Check if employee ID is already taken
    boolean existsByEmployeeId(String employeeId);

    // Find all users in a department
    List<User> findByDepartment(String department);

    // Find all active users
    List<User> findByActive(boolean active);
}
