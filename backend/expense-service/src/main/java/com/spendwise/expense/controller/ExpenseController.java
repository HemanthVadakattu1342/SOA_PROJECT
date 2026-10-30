package com.spendwise.expense.controller;

import com.spendwise.expense.dto.ApiResponse;
import com.spendwise.expense.dto.ApprovalRequest;
import com.spendwise.expense.dto.ExpenseDto;
import com.spendwise.expense.dto.ExpenseRequest;
import com.spendwise.expense.entity.ExpenseStatus;
import com.spendwise.expense.service.ExpenseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/expenses")
@RequiredArgsConstructor
@Tag(name = "Expenses", description = "Expense Management and Approval Workflow APIs")
public class ExpenseController {

    private final ExpenseService expenseService;

    // ========================
    // CRUD
    // ========================

    @PostMapping
    @PreAuthorize("hasAnyRole('EMPLOYEE','MANAGER','FINANCE_ADMIN','SYSTEM_ADMIN')")
    @Operation(summary = "Create a new expense (saves as DRAFT)", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<ExpenseDto>> createExpense(
            @Valid @RequestBody ExpenseRequest request,
            HttpServletRequest httpRequest) {

        Long userId = Long.parseLong(httpRequest.getHeader("X-User-Id"));
        String email = httpRequest.getHeader("X-User-Email");
        String dept  = httpRequest.getHeader("X-User-Department");

        ExpenseDto dto = expenseService.createExpense(request, userId, email, dept);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Expense created successfully", dto));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('FINANCE_ADMIN','SYSTEM_ADMIN')")
    @Operation(summary = "Get all expenses (Finance Admin / Admin only)", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<Page<ExpenseDto>>> getAllExpenses(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sort) {

        Page<ExpenseDto> expenses = expenseService.getAllExpenses(
            PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, sort))
        );
        return ResponseEntity.ok(ApiResponse.success("Expenses retrieved", expenses));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get expense by ID", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<ExpenseDto>> getExpenseById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Expense found", expenseService.getExpenseById(id)));
    }

    @GetMapping("/my")
    @Operation(summary = "Get my own expenses", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<Page<ExpenseDto>>> getMyExpenses(
            HttpServletRequest httpRequest,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Long userId = Long.parseLong(httpRequest.getHeader("X-User-Id"));
        Page<ExpenseDto> expenses = expenseService.getMyExpenses(userId,
            PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"))
        );
        return ResponseEntity.ok(ApiResponse.success("My expenses retrieved", expenses));
    }

    @GetMapping("/department/{department}")
    @PreAuthorize("hasAnyRole('MANAGER','FINANCE_ADMIN','SYSTEM_ADMIN')")
    @Operation(summary = "Get all expenses for a department", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<Page<ExpenseDto>>> getDepartmentExpenses(
            @PathVariable String department,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Page<ExpenseDto> expenses = expenseService.getDepartmentExpenses(department,
            PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"))
        );
        return ResponseEntity.ok(ApiResponse.success("Department expenses retrieved", expenses));
    }

    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('MANAGER','FINANCE_ADMIN','SYSTEM_ADMIN')")
    @Operation(summary = "Get pending expenses for approval", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<Page<ExpenseDto>>> getPendingApprovals(
            HttpServletRequest httpRequest,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        String dept = httpRequest.getHeader("X-User-Department");
        Page<ExpenseDto> expenses = expenseService.getPendingApprovals(dept,
            PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "submittedAt"))
        );
        return ResponseEntity.ok(ApiResponse.success("Pending approvals retrieved", expenses));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a DRAFT expense", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<ExpenseDto>> updateExpense(
            @PathVariable Long id,
            @Valid @RequestBody ExpenseRequest request,
            HttpServletRequest httpRequest) {

        Long userId = Long.parseLong(httpRequest.getHeader("X-User-Id"));
        return ResponseEntity.ok(ApiResponse.success("Expense updated", expenseService.updateExpense(id, request, userId)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a DRAFT expense", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<Void>> deleteExpense(
            @PathVariable Long id, HttpServletRequest httpRequest) {

        Long userId = Long.parseLong(httpRequest.getHeader("X-User-Id"));
        expenseService.deleteExpense(id, userId);
        return ResponseEntity.ok(ApiResponse.success("Expense deleted", null));
    }

    // ========================
    // WORKFLOW ACTIONS
    // ========================

    @PostMapping("/{id}/submit")
    @Operation(summary = "Submit expense for approval", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<ExpenseDto>> submitExpense(
            @PathVariable Long id, HttpServletRequest httpRequest) {

        Long userId = Long.parseLong(httpRequest.getHeader("X-User-Id"));
        return ResponseEntity.ok(ApiResponse.success("Expense submitted for approval", expenseService.submitExpense(id, userId)));
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('MANAGER','FINANCE_ADMIN','SYSTEM_ADMIN')")
    @Operation(summary = "Approve an expense", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<ExpenseDto>> approveExpense(
            @PathVariable Long id, HttpServletRequest httpRequest) {

        Long managerId = Long.parseLong(httpRequest.getHeader("X-User-Id"));
        String managerName = httpRequest.getHeader("X-User-Email");
        return ResponseEntity.ok(ApiResponse.success("Expense approved", expenseService.approveExpense(id, managerId, managerName)));
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('MANAGER','FINANCE_ADMIN','SYSTEM_ADMIN')")
    @Operation(summary = "Reject an expense with a reason", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<ExpenseDto>> rejectExpense(
            @PathVariable Long id,
            @RequestBody ApprovalRequest request,
            HttpServletRequest httpRequest) {

        Long managerId = Long.parseLong(httpRequest.getHeader("X-User-Id"));
        String managerName = httpRequest.getHeader("X-User-Email");
        return ResponseEntity.ok(ApiResponse.success("Expense rejected", expenseService.rejectExpense(id, managerId, managerName, request.getRejectionReason())));
    }
}
