package com.spendwise.category.controller;

import com.spendwise.category.dto.ApiResponse;
import com.spendwise.category.dto.CategoryDto;
import com.spendwise.category.dto.CategoryRequest;
import com.spendwise.category.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
@Tag(name = "Categories", description = "Expense Category Management APIs")
public class CategoryController {

    private final CategoryService categoryService;

    /** GET /api/categories - All users can see active categories (for the expense form dropdown) */
    @GetMapping
    @Operation(summary = "Get all active categories", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<List<CategoryDto>>> getActiveCategories() {
        return ResponseEntity.ok(ApiResponse.success("Categories retrieved", categoryService.getAllActiveCategories()));
    }

    /** GET /api/categories/active - Active categories for dropdown */
    @GetMapping("/active")
    @Operation(summary = "Get only active categories (for dropdown)", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<List<CategoryDto>>> getActiveCategoriesAlias() {
        return ResponseEntity.ok(ApiResponse.success("Active categories retrieved", categoryService.getAllActiveCategories()));
    }

    /** GET /api/categories/all - Admin view including inactive */
    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('FINANCE_ADMIN','SYSTEM_ADMIN')")
    @Operation(summary = "Get all categories including inactive (Admin)", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<List<CategoryDto>>> getAllCategories() {
        return ResponseEntity.ok(ApiResponse.success("All categories retrieved", categoryService.getAllCategories()));
    }

    /** GET /api/categories/{id} */
    @GetMapping("/{id}")
    @Operation(summary = "Get category by ID", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<CategoryDto>> getCategoryById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Category found", categoryService.getCategoryById(id)));
    }

    /** POST /api/categories - FINANCE_ADMIN or SYSTEM_ADMIN only */
    @PostMapping
    @PreAuthorize("hasAnyRole('FINANCE_ADMIN','SYSTEM_ADMIN')")
    @Operation(summary = "Create a new category (Admin only)", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<CategoryDto>> createCategory(
            @Valid @RequestBody CategoryRequest request) {
        CategoryDto created = categoryService.createCategory(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Category created successfully", created));
    }

    /** PUT /api/categories/{id} */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('FINANCE_ADMIN','SYSTEM_ADMIN')")
    @Operation(summary = "Update a category (Admin only)", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<CategoryDto>> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody CategoryRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Category updated", categoryService.updateCategory(id, request)));
    }

    /** DELETE /api/categories/{id} - soft delete (deactivates) */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('FINANCE_ADMIN','SYSTEM_ADMIN')")
    @Operation(summary = "Deactivate a category (Admin only)", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable Long id) {
        categoryService.deactivateCategory(id);
        return ResponseEntity.ok(ApiResponse.success("Category deactivated", null));
    }
}
