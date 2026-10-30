package com.spendwise.category;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

/**
 * SpendWise Category Service
 * Manages expense categories (Travel, Food, Equipment, etc.)
 * Port: 8083
 * Swagger: http://localhost:8083/swagger-ui.html
 *
 * Note: This service does NOT use OpenFeign - it is the one being called
 * (by expense-service), not the caller.
 */
@SpringBootApplication
@EnableDiscoveryClient
public class CategoryServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(CategoryServiceApplication.class, args);
    }
}
