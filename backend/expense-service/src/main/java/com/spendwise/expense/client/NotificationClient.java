package com.spendwise.expense.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

/**
 * NotificationClient - tells Notification Service to send a notification
 * when an expense is submitted, approved, or rejected.
 */
@FeignClient(name = "NOTIFICATION-SERVICE")
public interface NotificationClient {

    @PostMapping("/api/notifications/send")
    void sendNotification(
        @RequestParam Long userId,
        @RequestParam String title,
        @RequestParam String message,
        @RequestParam String type
    );
}
