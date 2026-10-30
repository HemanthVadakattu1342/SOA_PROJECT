package com.spendwise.expense.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.math.BigDecimal;

/**
 * BudgetClient - OpenFeign client that lets Expense Service notify Budget Service
 * when an expense is approved.
 *
 * When a manager approves an expense, the expense service calls:
 *   budgetClient.updateSpending(department, categoryId, amount)
 *
 * Budget Service then recalculates: spent, remaining, utilization%, status
 */
@FeignClient(name = "BUDGET-SERVICE")
public interface BudgetClient {

    @PutMapping("/api/budgets/update-spending")
    void updateSpending(
        @RequestParam String department,
        @RequestParam Long categoryId,
        @RequestParam BigDecimal amount
    );
}
