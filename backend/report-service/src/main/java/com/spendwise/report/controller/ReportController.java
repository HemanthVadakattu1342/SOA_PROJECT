package com.spendwise.report.controller;

import com.spendwise.report.client.BudgetClient;
import com.spendwise.report.client.ExpenseClient;
import com.spendwise.report.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * ReportController - aggregates data from Expense Service and Budget Service
 * to provide financial analytics for the dashboards.
 *
 * The report service itself has NO database - it pulls live data
 * from expense-service and budget-service via OpenFeign calls.
 */
@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Reports", description = "Financial Analytics and Reporting APIs")
public class ReportController {

    private final ExpenseClient expenseClient;
    private final BudgetClient budgetClient;

    /**
     * Dashboard summary - top cards + chart data
     * Used by ALL dashboard portals (different role filters applied on frontend)
     */
    @GetMapping("/dashboard")
    @Operation(summary = "Get dashboard summary data", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboard() {
        try {
            Map<String, Object> expenses = expenseClient.getAllExpenses(0, 1000);
            Map<String, Object> budgets  = budgetClient.getCurrentMonthSummary();
            Map<String, Object> result   = Map.of(
                "expenses", expenses,
                "budgets",  budgets,
                "generatedAt", java.time.LocalDateTime.now().toString()
            );
            return ResponseEntity.ok(ApiResponse.success("Dashboard data retrieved", result));
        } catch (Exception e) {
            log.error("Dashboard error: {}", e.getMessage());
            return ResponseEntity.ok(ApiResponse.success("Dashboard data (partial)", Map.of("error", e.getMessage())));
        }
    }

    /** Monthly expense report */
    @GetMapping("/monthly")
    @PreAuthorize("hasAnyRole('MANAGER','FINANCE_ADMIN','SYSTEM_ADMIN')")
    @Operation(summary = "Monthly expense report", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMonthlyReport() {
        Map<String, Object> expenses = expenseClient.getAllExpenses(0, 1000);
        return ResponseEntity.ok(ApiResponse.success("Monthly report", expenses));
    }

    /** Category-wise spending report */
    @GetMapping("/category")
    @PreAuthorize("hasAnyRole('MANAGER','FINANCE_ADMIN','SYSTEM_ADMIN')")
    @Operation(summary = "Category-wise spending report", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<Map<String, Object>>> getCategoryReport() {
        Map<String, Object> expenses = expenseClient.getAllExpenses(0, 1000);
        return ResponseEntity.ok(ApiResponse.success("Category report", expenses));
    }

    /** Department-wise spending report */
    @GetMapping("/department")
    @PreAuthorize("hasAnyRole('MANAGER','FINANCE_ADMIN','SYSTEM_ADMIN')")
    @Operation(summary = "Department-wise spending report", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDepartmentReport() {
        Map<String, Object> expenses = expenseClient.getAllExpenses(0, 1000);
        return ResponseEntity.ok(ApiResponse.success("Department report", expenses));
    }

    /** Budget utilization report */
    @GetMapping("/budget")
    @PreAuthorize("hasAnyRole('FINANCE_ADMIN','SYSTEM_ADMIN')")
    @Operation(summary = "Budget utilization report", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<Map<String, Object>>> getBudgetReport() {
        Map<String, Object> budgets = budgetClient.getAllBudgets();
        return ResponseEntity.ok(ApiResponse.success("Budget report", budgets));
    }

    /** Budget reconciliation report - allocated vs actual */
    @GetMapping("/reconciliation")
    @PreAuthorize("hasAnyRole('FINANCE_ADMIN','SYSTEM_ADMIN')")
    @Operation(summary = "Budget reconciliation (allocated vs actual)", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<Map<String, Object>>> getReconciliation() {
        Map<String, Object> data = budgetClient.getReconciliation();
        return ResponseEntity.ok(ApiResponse.success("Reconciliation report", data));
    }

    /** Expense trends - for the trend chart */
    @GetMapping("/trends")
    @Operation(summary = "Expense trends data", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<Map<String, Object>>> getTrends() {
        Map<String, Object> expenses = expenseClient.getAllExpenses(0, 1000);
        return ResponseEntity.ok(ApiResponse.success("Trends data", expenses));
    }

    /** Employee expense report */
    @GetMapping("/employee")
    @PreAuthorize("hasAnyRole('MANAGER','FINANCE_ADMIN','SYSTEM_ADMIN')")
    @Operation(summary = "Employee-wise expense report", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<Map<String, Object>>> getEmployeeReport() {
        Map<String, Object> expenses = expenseClient.getAllExpenses(0, 1000);
        return ResponseEntity.ok(ApiResponse.success("Employee report", expenses));
    }
}
