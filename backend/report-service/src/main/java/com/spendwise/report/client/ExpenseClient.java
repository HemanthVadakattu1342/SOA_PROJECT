package com.spendwise.report.client;

import com.spendwise.report.dto.ExpenseSummaryDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;
import java.util.Map;

/**
 * ExpenseClient - Report Service calls Expense Service via Feign to get expense data.
 * Uses Eureka service name "EXPENSE-SERVICE" - no hardcoded URL.
 */
@FeignClient(name = "EXPENSE-SERVICE")
public interface ExpenseClient {

    @GetMapping("/api/expenses")
    Map<String, Object> getAllExpenses(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "1000") int size
    );
}
