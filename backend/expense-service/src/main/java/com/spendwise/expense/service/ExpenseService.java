package com.spendwise.expense.service;

import com.spendwise.expense.client.BudgetClient;
import com.spendwise.expense.client.CategoryClient;
import com.spendwise.expense.client.NotificationClient;
import com.spendwise.expense.dto.CategoryDto;
import com.spendwise.expense.dto.ExpenseDto;
import com.spendwise.expense.dto.ExpenseRequest;
import com.spendwise.expense.entity.Expense;
import com.spendwise.expense.entity.ExpenseStatus;
import com.spendwise.expense.exception.ResourceNotFoundException;
import com.spendwise.expense.exception.BadRequestException;
import com.spendwise.expense.repository.ExpenseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * ExpenseService - all expense business logic lives here.
 *
 * Key flows:
 * 1. Create expense       -> validates category via CategoryClient (Feign)
 * 2. Submit expense       -> changes status to SUBMITTED, notifies manager
 * 3. Approve expense      -> updates status, calls BudgetClient to update spending
 * 4. Reject expense       -> updates status with rejection reason, notifies employee
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final CategoryClient categoryClient;         // Calls category-service
    private final BudgetClient budgetClient;             // Calls budget-service
    private final NotificationClient notificationClient; // Calls notification-service

    // ========================
    // CREATE
    // ========================

    /**
     * Creates a new expense in DRAFT status.
     * Validates the category exists by calling category-service via Feign.
     */
    public ExpenseDto createExpense(ExpenseRequest request, Long employeeId,
                                    String employeeName, String department) {
        // Validate category exists (calls category-service)
        CategoryDto category = getCategoryOrThrow(request.getCategoryId());

        // Generate unique expense number: EXP-2026-00042
        String expenseNumber = generateExpenseNumber();

        Expense expense = Expense.builder()
                .expenseNumber(expenseNumber)
                .employeeId(employeeId)
                .employeeName(employeeName)
                .department(department)
                .amount(request.getAmount())
                .currency(request.getCurrency() != null ? request.getCurrency() : "INR")
                .description(request.getDescription())
                .categoryId(category.getId())
                .categoryName(category.getName())
                .expenseDate(request.getExpenseDate())
                .receiptUrl(request.getReceiptUrl())
                .status(ExpenseStatus.DRAFT)
                .build();

        Expense saved = expenseRepository.save(expense);
        log.info("Expense created: {} by employee {}", expenseNumber, employeeId);
        return toDto(saved);
    }

    // ========================
    // READ
    // ========================

    @Transactional(readOnly = true)
    public ExpenseDto getExpenseById(Long id) {
        return toDto(findOrThrow(id));
    }

    @Transactional(readOnly = true)
    public Page<ExpenseDto> getAllExpenses(Pageable pageable) {
        return expenseRepository.findAll(pageable).map(this::toDto);
    }

    @Transactional(readOnly = true)
    public Page<ExpenseDto> getMyExpenses(Long employeeId, Pageable pageable) {
        return expenseRepository.findByEmployeeId(employeeId, pageable).map(this::toDto);
    }

    @Transactional(readOnly = true)
    public Page<ExpenseDto> getDepartmentExpenses(String department, Pageable pageable) {
        return expenseRepository.findByDepartment(department, pageable).map(this::toDto);
    }

    @Transactional(readOnly = true)
    public Page<ExpenseDto> getPendingApprovals(String department, Pageable pageable) {
        return expenseRepository.findByDepartmentAndStatus(
            department, ExpenseStatus.SUBMITTED, pageable
        ).map(this::toDto);
    }

    @Transactional(readOnly = true)
    public Page<ExpenseDto> getExpensesByStatus(ExpenseStatus status, Pageable pageable) {
        return expenseRepository.findByStatus(status, pageable).map(this::toDto);
    }

    // ========================
    // UPDATE
    // ========================

    public ExpenseDto updateExpense(Long id, ExpenseRequest request, Long employeeId) {
        Expense expense = findOrThrow(id);

        // Only the owner can update their own expense
        if (!expense.getEmployeeId().equals(employeeId)) {
            throw new BadRequestException("You can only update your own expenses");
        }

        // Can only update DRAFT expenses
        if (expense.getStatus() != ExpenseStatus.DRAFT) {
            throw new BadRequestException("Only DRAFT expenses can be edited. Current status: " + expense.getStatus());
        }

        CategoryDto category = getCategoryOrThrow(request.getCategoryId());
        expense.setAmount(request.getAmount());
        expense.setCurrency(request.getCurrency() != null ? request.getCurrency() : expense.getCurrency());
        expense.setDescription(request.getDescription());
        expense.setCategoryId(category.getId());
        expense.setCategoryName(category.getName());
        expense.setExpenseDate(request.getExpenseDate());
        if (request.getReceiptUrl() != null) expense.setReceiptUrl(request.getReceiptUrl());

        return toDto(expenseRepository.save(expense));
    }

    // ========================
    // WORKFLOW ACTIONS
    // ========================

    /**
     * Employee submits their expense for manager approval.
     * Status: DRAFT -> SUBMITTED
     */
    public ExpenseDto submitExpense(Long id, Long employeeId) {
        Expense expense = findOrThrow(id);

        if (!expense.getEmployeeId().equals(employeeId)) {
            throw new BadRequestException("You can only submit your own expenses");
        }
        if (expense.getStatus() != ExpenseStatus.DRAFT) {
            throw new BadRequestException("Only DRAFT expenses can be submitted");
        }

        expense.setStatus(ExpenseStatus.SUBMITTED);
        expense.setSubmittedAt(LocalDateTime.now());
        Expense saved = expenseRepository.save(expense);

        log.info("Expense {} submitted by employee {}", expense.getExpenseNumber(), employeeId);

        // Notify manager (fire-and-forget - don't fail if notification service is down)
        try {
            notificationClient.sendNotification(
                employeeId,
                "Expense Submitted",
                "Your expense " + expense.getExpenseNumber() + " has been submitted for approval.",
                "EXPENSE_SUBMITTED"
            );
        } catch (Exception e) {
            log.warn("Failed to send submit notification: {}", e.getMessage());
        }

        return toDto(saved);
    }

    /**
     * Manager approves an expense.
     * Status: SUBMITTED -> APPROVED
     * Also calls BudgetClient to update department spending.
     */
    public ExpenseDto approveExpense(Long id, Long managerId, String managerName) {
        Expense expense = findOrThrow(id);

        if (expense.getStatus() != ExpenseStatus.SUBMITTED && expense.getStatus() != ExpenseStatus.UNDER_REVIEW) {
            throw new BadRequestException("Only SUBMITTED or UNDER_REVIEW expenses can be approved");
        }

        expense.setStatus(ExpenseStatus.APPROVED);
        expense.setApprovedAt(LocalDateTime.now());
        expense.setApprovedBy(managerId);
        expense.setApprovedByName(managerName);
        Expense saved = expenseRepository.save(expense);

        log.info("Expense {} APPROVED by manager {}", expense.getExpenseNumber(), managerId);

        // Update budget spending (calls budget-service via Feign)
        try {
            budgetClient.updateSpending(expense.getDepartment(), expense.getCategoryId(), expense.getAmount());
        } catch (Exception e) {
            log.warn("Failed to update budget spending: {}", e.getMessage());
        }

        // Notify employee
        try {
            notificationClient.sendNotification(
                expense.getEmployeeId(),
                "Expense Approved",
                "Your expense " + expense.getExpenseNumber() + " of " + expense.getAmount() +
                " " + expense.getCurrency() + " has been approved.",
                "EXPENSE_APPROVED"
            );
        } catch (Exception e) {
            log.warn("Failed to send approval notification: {}", e.getMessage());
        }

        return toDto(saved);
    }

    /**
     * Manager rejects an expense with a reason.
     * Status: SUBMITTED -> REJECTED
     */
    public ExpenseDto rejectExpense(Long id, Long managerId, String managerName, String reason) {
        Expense expense = findOrThrow(id);

        if (expense.getStatus() != ExpenseStatus.SUBMITTED && expense.getStatus() != ExpenseStatus.UNDER_REVIEW) {
            throw new BadRequestException("Only SUBMITTED or UNDER_REVIEW expenses can be rejected");
        }
        if (reason == null || reason.isBlank()) {
            throw new BadRequestException("Rejection reason is required");
        }

        expense.setStatus(ExpenseStatus.REJECTED);
        expense.setApprovedAt(LocalDateTime.now());
        expense.setApprovedBy(managerId);
        expense.setApprovedByName(managerName);
        expense.setRejectionReason(reason);
        Expense saved = expenseRepository.save(expense);

        log.info("Expense {} REJECTED by manager {}: {}", expense.getExpenseNumber(), managerId, reason);

        try {
            notificationClient.sendNotification(
                expense.getEmployeeId(),
                "Expense Rejected",
                "Your expense " + expense.getExpenseNumber() + " was rejected. Reason: " + reason,
                "EXPENSE_REJECTED"
            );
        } catch (Exception e) {
            log.warn("Failed to send rejection notification: {}", e.getMessage());
        }

        return toDto(saved);
    }

    public void deleteExpense(Long id, Long employeeId) {
        Expense expense = findOrThrow(id);
        if (!expense.getEmployeeId().equals(employeeId)) {
            throw new BadRequestException("You can only delete your own expenses");
        }
        if (expense.getStatus() != ExpenseStatus.DRAFT) {
            throw new BadRequestException("Only DRAFT expenses can be deleted");
        }
        expenseRepository.delete(expense);
    }

    // ========================
    // PRIVATE HELPERS
    // ========================

    private Expense findOrThrow(Long id) {
        return expenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found with id: " + id));
    }

    private CategoryDto getCategoryOrThrow(Long categoryId) {
        try {
            CategoryDto cat = categoryClient.getCategoryById(categoryId);
            if (cat == null || !cat.isActive()) {
                throw new BadRequestException("Category is not active or does not exist: " + categoryId);
            }
            return cat;
        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            log.warn("Could not validate category {}: {}", categoryId, e.getMessage());
            // Fallback: allow if category service is temporarily down
            CategoryDto fallback = new CategoryDto();
            fallback.setId(categoryId);
            fallback.setName("Unknown");
            fallback.setActive(true);
            return fallback;
        }
    }

    private String generateExpenseNumber() {
        // Format: EXP-YYYY-NNNNN (e.g. EXP-2026-00042)
        String year = String.valueOf(java.time.LocalDate.now().getYear());
        long nextId = expenseRepository.findMaxId().orElse(0L) + 1;
        return String.format("EXP-%s-%05d", year, nextId);
    }

    private ExpenseDto toDto(Expense e) {
        return ExpenseDto.builder()
                .id(e.getId())
                .expenseNumber(e.getExpenseNumber())
                .employeeId(e.getEmployeeId())
                .employeeName(e.getEmployeeName())
                .department(e.getDepartment())
                .amount(e.getAmount())
                .currency(e.getCurrency())
                .description(e.getDescription())
                .categoryId(e.getCategoryId())
                .categoryName(e.getCategoryName())
                .expenseDate(e.getExpenseDate())
                .receiptUrl(e.getReceiptUrl())
                .status(e.getStatus().name())
                .submittedAt(e.getSubmittedAt())
                .approvedAt(e.getApprovedAt())
                .approvedByName(e.getApprovedByName())
                .rejectionReason(e.getRejectionReason())
                .createdAt(e.getCreatedAt())
                .build();
    }
}
