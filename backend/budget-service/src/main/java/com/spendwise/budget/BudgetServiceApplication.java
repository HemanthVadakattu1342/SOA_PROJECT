package com.spendwise.budget;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

/**
 * SpendWise Budget Service
 * Manages departmental budgets and reconciliation.
 * Called BY expense-service when expense is approved.
 * Port: 8084 | Swagger: http://localhost:8084/swagger-ui.html
 */
@SpringBootApplication
@EnableDiscoveryClient
public class BudgetServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(BudgetServiceApplication.class, args);
    }
}
