package com.spendwise.budget.controller;

import com.spendwise.budget.dto.ApiResponse;
import com.spendwise.budget.dto.BudgetDto;
import com.spendwise.budget.dto.BudgetRequest;
import com.spendwise.budget.dto.ReconciliationDto;
import com.spendwise.budget.service.BudgetService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
@Tag(name = "Budgets", description = "Budget Management and Reconciliation APIs")
public class BudgetController {

    private final BudgetService budgetService;

    @PostMapping
    @PreAuthorize("hasAnyRole('FINANCE_ADMIN','SYSTEM_ADMIN')")
    @Operation(summary = "Create a monthly budget", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<BudgetDto>> createBudget(@Valid @RequestBody BudgetRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Budget created", budgetService.createBudget(req)));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('MANAGER','FINANCE_ADMIN','SYSTEM_ADMIN')")
    @Operation(summary = "Get all budgets", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<List<BudgetDto>>> getAllBudgets() {
        return ResponseEntity.ok(ApiResponse.success("Budgets retrieved", budgetService.getAllBudgets()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER','FINANCE_ADMIN','SYSTEM_ADMIN')")
    @Operation(summary = "Get budget by ID", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<BudgetDto>> getBudgetById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Budget found", budgetService.getBudgetById(id)));
    }

    @GetMapping("/department/{department}")
    @PreAuthorize("hasAnyRole('MANAGER','FINANCE_ADMIN','SYSTEM_ADMIN')")
    @Operation(summary = "Get budgets for a department", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<List<BudgetDto>>> getDepartmentBudgets(@PathVariable String department) {
        return ResponseEntity.ok(ApiResponse.success("Department budgets", budgetService.getBudgetsByDepartment(department)));
    }

    @GetMapping("/summary")
    @Operation(summary = "Get current month budget summary", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<List<BudgetDto>>> getSummary() {
        return ResponseEntity.ok(ApiResponse.success("Budget summary", budgetService.getCurrentMonthBudgets()));
    }

    @GetMapping("/alerts")
    @Operation(summary = "Get budgets with WARNING/CRITICAL/EXCEEDED status", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<List<BudgetDto>>> getBudgetAlerts() {
        return ResponseEntity.ok(ApiResponse.success("Budget alerts", budgetService.getBudgetAlerts()));
    }

    @GetMapping("/reconciliation")
    @PreAuthorize("hasAnyRole('FINANCE_ADMIN','SYSTEM_ADMIN')")
    @Operation(summary = "Get budget reconciliation report (allocated vs actual spending)", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<List<ReconciliationDto>>> getReconciliation() {
        return ResponseEntity.ok(ApiResponse.success("Reconciliation report", budgetService.getReconciliation()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('FINANCE_ADMIN','SYSTEM_ADMIN')")
    @Operation(summary = "Update budget allocation", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<BudgetDto>> updateBudget(
            @PathVariable Long id, @Valid @RequestBody BudgetRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Budget updated", budgetService.updateBudget(id, req)));
    }

    /**
     * Internal endpoint called by Expense Service (via Feign) when an expense is approved.
     * Updates the department's budget spending for the given category.
     */
    @PutMapping("/update-spending")
    @Operation(summary = "Update spending (called internally by Expense Service)", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<Void> updateSpending(
            @RequestParam String department,
            @RequestParam Long categoryId,
            @RequestParam BigDecimal amount) {
        budgetService.updateSpending(department, categoryId, amount);
        return ResponseEntity.ok().build();
    }
}
