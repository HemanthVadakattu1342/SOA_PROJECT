package com.spendwise.report.client;

import com.spendwise.report.dto.BudgetSummaryDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;
import java.util.Map;

/**
 * BudgetClient - Report Service calls Budget Service via Feign for budget data.
 */
@FeignClient(name = "BUDGET-SERVICE")
public interface BudgetClient {

    @GetMapping("/api/budgets")
    Map<String, Object> getAllBudgets();

    @GetMapping("/api/budgets/summary")
    Map<String, Object> getCurrentMonthSummary();

    @GetMapping("/api/budgets/reconciliation")
    Map<String, Object> getReconciliation();
}
