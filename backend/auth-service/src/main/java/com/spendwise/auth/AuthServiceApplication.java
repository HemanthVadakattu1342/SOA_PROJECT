package com.spendwise.auth;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

/**
 * SpendWise Auth Service
 *
 * Handles all user authentication and authorization.
 * - User registration
 * - Login (returns a JWT token)
 * - JWT validation
 * - Role management
 *
 * Port: 8081
 * Swagger: http://localhost:8081/swagger-ui.html
 */
@SpringBootApplication
@EnableDiscoveryClient   // Registers this service with Eureka
public class AuthServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(AuthServiceApplication.class, args);
    }
}
