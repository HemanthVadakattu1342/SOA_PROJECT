package com.spendwise.expense.repository;

import com.spendwise.expense.entity.Expense;
import com.spendwise.expense.entity.ExpenseStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * ExpenseRepository - database operations for expenses.
 *
 * JpaSpecificationExecutor allows building dynamic queries
 * (e.g., filter by status AND category AND date range).
 */
@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long>, JpaSpecificationExecutor<Expense> {

    // For auto-generating expense numbers (EXP-2026-00001)
    @Query("SELECT MAX(e.id) FROM Expense e")
    Optional<Long> findMaxId();

    // Employee view - my own expenses
    Page<Expense> findByEmployeeId(Long employeeId, Pageable pageable);

    // Manager view - all expenses in a department
    Page<Expense> findByDepartment(String department, Pageable pageable);

    // Pending approvals - manager sees SUBMITTED expenses in their department
    Page<Expense> findByDepartmentAndStatus(String department, ExpenseStatus status, Pageable pageable);

    // Finance admin - all expenses with a given status
    Page<Expense> findByStatus(ExpenseStatus status, Pageable pageable);

    // For report service - department totals
    List<Expense> findByDepartmentAndStatusAndExpenseDateBetween(
        String department, ExpenseStatus status, LocalDate from, LocalDate to
    );

    // For report service - category totals
    List<Expense> findByCategoryIdAndStatusAndExpenseDateBetween(
        Long categoryId, ExpenseStatus status, LocalDate from, LocalDate to
    );

    // Count by status for dashboard cards
    long countByEmployeeIdAndStatus(Long employeeId, ExpenseStatus status);
    long countByStatus(ExpenseStatus status);
    long countByDepartmentAndStatus(String department, ExpenseStatus status);
}
