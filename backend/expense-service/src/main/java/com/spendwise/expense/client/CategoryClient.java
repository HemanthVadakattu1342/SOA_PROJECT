package com.spendwise.expense.client;

import com.spendwise.expense.dto.CategoryDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

/**
 * CategoryClient - OpenFeign client that lets Expense Service call Category Service.
 *
 * How it works:
 * - We define an interface with the method signatures we want to call
 * - OpenFeign automatically generates the HTTP client code at runtime
 * - "CATEGORY-SERVICE" is the Eureka service name - Feign looks it up automatically
 *   so we never need to hardcode http://localhost:8083
 *
 * Example usage in ExpenseService:
 *   CategoryDto cat = categoryClient.getCategoryById(categoryId);
 *   if (cat == null) throw new exception...
 */
@FeignClient(name = "CATEGORY-SERVICE")
public interface CategoryClient {

    @GetMapping("/api/categories/{id}")
    CategoryDto getCategoryById(@PathVariable Long id);
}
