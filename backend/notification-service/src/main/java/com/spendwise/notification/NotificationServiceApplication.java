package com.spendwise.notification;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

/**
 * SpendWise Notification Service
 * Real-time notifications via WebSocket/STOMP + REST history API.
 * WebSocket endpoint: ws://localhost:8086/ws
 * Port: 8086 | Swagger: http://localhost:8086/swagger-ui.html
 */
@SpringBootApplication
@EnableDiscoveryClient
public class NotificationServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(NotificationServiceApplication.class, args);
    }
}
