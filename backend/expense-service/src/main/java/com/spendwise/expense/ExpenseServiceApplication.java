package com.spendwise.expense;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

/**
 * SpendWise Expense Service
 * Core expense CRUD + approval workflow.
 * Calls: category-service (Feign), budget-service (Feign), notification-service (Feign)
 * Port: 8082
 * Swagger: http://localhost:8082/swagger-ui.html
 */
@SpringBootApplication
@EnableDiscoveryClient
public class ExpenseServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(ExpenseServiceApplication.class, args);
    }
}
