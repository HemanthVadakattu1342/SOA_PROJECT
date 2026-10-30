package com.spendwise.budget.service;

import com.spendwise.budget.dto.BudgetDto;
import com.spendwise.budget.dto.BudgetRequest;
import com.spendwise.budget.dto.ReconciliationDto;
import com.spendwise.budget.entity.Budget;
import com.spendwise.budget.entity.BudgetStatus;
import com.spendwise.budget.exception.ResourceNotFoundException;
import com.spendwise.budget.exception.ResourceAlreadyExistsException;
import com.spendwise.budget.repository.BudgetRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

/**
 * BudgetService - manages department budgets and reconciliation.
 *
 * KEY FEATURE: updateSpending()
 * When an expense is approved, Expense Service calls this method via Feign.
 * We add the approved amount to spentAmount, recalculate remaining + utilization,
 * update the status, and trigger threshold notifications.
 *
 * Thresholds:
 *   < 80%   -> NORMAL
 *   80-89%  -> WARNING  (notify finance admin)
 *   90-99%  -> CRITICAL (notify finance admin)
 *   >= 100% -> EXCEEDED (notify finance admin + manager)
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class BudgetService {

    private final BudgetRepository budgetRepository;

    /** Create a new monthly budget */
    public BudgetDto createBudget(BudgetRequest req) {
        // Check for duplicate budget (same dept + category + year + month)
        budgetRepository.findByDepartmentAndCategoryIdAndFinancialYearAndMonth(
            req.getDepartment(), req.getCategoryId(), req.getFinancialYear(), req.getMonth()
        ).ifPresent(b -> {
            throw new ResourceAlreadyExistsException(
                "Budget already exists for " + req.getDepartment() + " / category " + req.getCategoryId()
                + " for " + req.getMonth() + "/" + req.getFinancialYear()
            );
        });

        Budget budget = Budget.builder()
                .department(req.getDepartment())
                .categoryId(req.getCategoryId())
                .categoryName(req.getCategoryName())
                .financialYear(req.getFinancialYear())
                .month(req.getMonth())
                .allocatedAmount(req.getAllocatedAmount())
                .spentAmount(BigDecimal.ZERO)
                .remainingAmount(req.getAllocatedAmount())
                .utilizationPercentage(BigDecimal.ZERO)
                .status(BudgetStatus.NORMAL)
                .build();

        return toDto(budgetRepository.save(budget));
    }

    /** Get all budgets for a department */
    @Transactional(readOnly = true)
    public List<BudgetDto> getBudgetsByDepartment(String department) {
        return budgetRepository.findByDepartment(department).stream().map(this::toDto).toList();
    }

    /** Get all budgets (for Finance Admin overview) */
    @Transactional(readOnly = true)
    public List<BudgetDto> getAllBudgets() {
        return budgetRepository.findAll().stream().map(this::toDto).toList();
    }

    /** Get single budget by ID */
    @Transactional(readOnly = true)
    public BudgetDto getBudgetById(Long id) {
        return toDto(findOrThrow(id));
    }

    /** Get budgets in WARNING / CRITICAL / EXCEEDED state (for alerts panel) */
    @Transactional(readOnly = true)
    public List<BudgetDto> getBudgetAlerts() {
        return budgetRepository.findByStatusIn(
            List.of(BudgetStatus.WARNING, BudgetStatus.CRITICAL, BudgetStatus.EXCEEDED)
        ).stream().map(this::toDto).toList();
    }

    /** Get current month budgets for summary card */
    @Transactional(readOnly = true)
    public List<BudgetDto> getCurrentMonthBudgets() {
        LocalDate now = LocalDate.now();
        return budgetRepository.findByFinancialYearAndMonth(now.getYear(), now.getMonthValue())
                .stream().map(this::toDto).toList();
    }

    /** Update budget allocation (Finance Admin can change the budget amount) */
    public BudgetDto updateBudget(Long id, BudgetRequest req) {
        Budget budget = findOrThrow(id);
        budget.setAllocatedAmount(req.getAllocatedAmount());
        recalculate(budget);
        return toDto(budgetRepository.save(budget));
    }

    /**
     * UPDATE SPENDING - called by Expense Service via OpenFeign when an expense is APPROVED.
     *
     * This is the core reconciliation logic:
     * 1. Find the matching budget (dept + category + current month)
     * 2. Add the approved expense amount to spentAmount
     * 3. Recalculate remainingAmount and utilizationPercentage
     * 4. Update the status based on thresholds
     * 5. Log threshold crossings (notifications would be sent here)
     *
     * NOTE: If no budget exists for this dept/category/month, we log a warning but don't fail.
     * The expense is already approved - we just note there's no budget tracking.
     */
    public void updateSpending(String department, Long categoryId, BigDecimal approvedAmount) {
        LocalDate now = LocalDate.now();

        budgetRepository.findByDepartmentAndCategoryIdAndFinancialYearAndMonth(
            department, categoryId, now.getYear(), now.getMonthValue()
        ).ifPresentOrElse(
            budget -> {
                BudgetStatus oldStatus = budget.getStatus();

                // Add approved amount to total spent
                budget.setSpentAmount(budget.getSpentAmount().add(approvedAmount));
                recalculate(budget);

                Budget saved = budgetRepository.save(budget);

                // Log threshold crossings for notification purposes
                if (oldStatus == BudgetStatus.NORMAL && saved.getStatus() == BudgetStatus.WARNING) {
                    log.warn("BUDGET ALERT: {}/{} has reached 80% utilization ({}/{})",
                        department, categoryId, saved.getSpentAmount(), saved.getAllocatedAmount());
                } else if (saved.getStatus() == BudgetStatus.CRITICAL && oldStatus != BudgetStatus.CRITICAL) {
                    log.warn("BUDGET CRITICAL: {}/{} has reached 90% utilization!", department, categoryId);
                } else if (saved.getStatus() == BudgetStatus.EXCEEDED && oldStatus != BudgetStatus.EXCEEDED) {
                    log.error("BUDGET EXCEEDED: {}/{} is over budget! ({}/{})",
                        department, categoryId, saved.getSpentAmount(), saved.getAllocatedAmount());
                }
            },
            () -> log.warn("No budget found for dept={}, category={}, month={}/{}. Expense approved without budget tracking.",
                department, categoryId, now.getMonthValue(), now.getYear())
        );
    }

    /**
     * RECONCILIATION - for the Finance Admin reconciliation page.
     * Returns all current-month budgets with reconciliation status.
     */
    @Transactional(readOnly = true)
    public List<ReconciliationDto> getReconciliation() {
        LocalDate now = LocalDate.now();
        return budgetRepository.findAllForMonthOrderByUtilization(now.getYear(), now.getMonthValue())
                .stream()
                .map(b -> ReconciliationDto.builder()
                        .department(b.getDepartment())
                        .categoryName(b.getCategoryName())
                        .categoryId(b.getCategoryId())
                        .financialYear(b.getFinancialYear())
                        .month(b.getMonth())
                        .allocatedBudget(b.getAllocatedAmount())
                        .actualSpending(b.getSpentAmount())
                        .remainingBudget(b.getRemainingAmount())
                        .utilizationPercentage(b.getUtilizationPercentage())
                        .reconciliationStatus(toReconciliationStatus(b.getUtilizationPercentage()))
                        .budgetStatus(b.getStatus().name())
                        .build())
                .toList();
    }

    // ========================
    // PRIVATE HELPERS
    // ========================

    /**
     * Recalculates remaining amount, utilization %, and status.
     * Called whenever spentAmount or allocatedAmount changes.
     */
    private void recalculate(Budget budget) {
        BigDecimal spent     = budget.getSpentAmount();
        BigDecimal allocated = budget.getAllocatedAmount();

        budget.setRemainingAmount(allocated.subtract(spent));

        // Utilization = (spent / allocated) * 100
        if (allocated.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal util = spent.multiply(new BigDecimal("100"))
                    .divide(allocated, 2, RoundingMode.HALF_UP);
            budget.setUtilizationPercentage(util);
            budget.setStatus(calculateStatus(util));
        } else {
            budget.setUtilizationPercentage(BigDecimal.ZERO);
            budget.setStatus(BudgetStatus.NORMAL);
        }
    }

    private BudgetStatus calculateStatus(BigDecimal utilization) {
        int cmp = utilization.compareTo(BigDecimal.valueOf(100));
        if (cmp >= 0) return BudgetStatus.EXCEEDED;
        if (utilization.compareTo(BigDecimal.valueOf(90)) >= 0) return BudgetStatus.CRITICAL;
        if (utilization.compareTo(BigDecimal.valueOf(80)) >= 0) return BudgetStatus.WARNING;
        return BudgetStatus.NORMAL;
    }

    private String toReconciliationStatus(BigDecimal util) {
        if (util.compareTo(BigDecimal.valueOf(100)) >= 0) return "OVER_BUDGET";
        if (util.compareTo(BigDecimal.valueOf(80))  >= 0) return "NEAR_LIMIT";
        return "WITHIN_BUDGET";
    }

    private Budget findOrThrow(Long id) {
        return budgetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Budget not found with id: " + id));
    }

    private BudgetDto toDto(Budget b) {
        return BudgetDto.builder()
                .id(b.getId()).department(b.getDepartment())
                .categoryId(b.getCategoryId()).categoryName(b.getCategoryName())
                .financialYear(b.getFinancialYear()).month(b.getMonth())
                .allocatedAmount(b.getAllocatedAmount()).spentAmount(b.getSpentAmount())
                .remainingAmount(b.getRemainingAmount()).utilizationPercentage(b.getUtilizationPercentage())
                .status(b.getStatus().name()).createdAt(b.getCreatedAt()).updatedAt(b.getUpdatedAt())
                .build();
    }
}
