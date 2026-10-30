package com.spendwise.report;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

/**
 * SpendWise Report Service
 * Aggregates data from Expense + Budget services via Feign for analytics.
 * Has NO own database - it is a pure aggregation service.
 * Port: 8085 | Swagger: http://localhost:8085/swagger-ui.html
 */
@SpringBootApplication
@EnableDiscoveryClient
public class ReportServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(ReportServiceApplication.class, args);
    }
}
