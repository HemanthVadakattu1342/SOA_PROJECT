package com.spendwise.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

/**
 * SpendWise API Gateway
 *
 * This is the single entry point for ALL frontend requests.
 * The React frontend only talks to this gateway (port 8080).
 * The gateway then routes requests to the correct microservice.
 *
 * Example:
 *   Frontend calls: http://localhost:8080/api/expenses
 *   Gateway routes to: http://EXPENSE-SERVICE/api/expenses
 *
 * Port: 8080
 * Eureka: Registers itself and discovers other services by name
 */
@SpringBootApplication
@EnableDiscoveryClient
public class ApiGatewayApplication {

    public static void main(String[] args) {
        SpringApplication.run(ApiGatewayApplication.class, args);
    }
}
