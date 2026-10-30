package com.spendwise.notification.controller;

import com.spendwise.notification.dto.ApiResponse;
import com.spendwise.notification.dto.NotificationDto;
import com.spendwise.notification.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "Real-time Notification APIs (REST + WebSocket)")
public class NotificationController {

    private final NotificationService notificationService;

    /**
     * Internal endpoint called by Expense Service via Feign.
     * Creates and sends a notification.
     */
    @PostMapping("/send")
    @Operation(summary = "Send a notification (internal - called by other services)")
    public ResponseEntity<Void> sendNotification(
            @RequestParam Long userId,
            @RequestParam String title,
            @RequestParam String message,
            @RequestParam String type) {
        notificationService.sendNotification(userId, title, message, type);
        return ResponseEntity.ok().build();
    }

    /** Get all my notifications (paginated) */
    @GetMapping("/my")
    @Operation(summary = "Get my notifications", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<Page<NotificationDto>>> getMyNotifications(
            HttpServletRequest req,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Long userId = Long.parseLong(req.getHeader("X-User-Id"));
        return ResponseEntity.ok(ApiResponse.success("Notifications retrieved",
            notificationService.getMyNotifications(userId, PageRequest.of(page, size))));
    }

    /** Get unread notifications only */
    @GetMapping("/unread")
    @Operation(summary = "Get unread notifications", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<List<NotificationDto>>> getUnread(HttpServletRequest req) {
        Long userId = Long.parseLong(req.getHeader("X-User-Id"));
        return ResponseEntity.ok(ApiResponse.success("Unread notifications",
            notificationService.getUnreadNotifications(userId)));
    }

    /** Get unread count (for the notification badge) */
    @GetMapping("/unread-count")
    @Operation(summary = "Get unread notification count", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<Long>> getUnreadCount(HttpServletRequest req) {
        Long userId = Long.parseLong(req.getHeader("X-User-Id"));
        return ResponseEntity.ok(ApiResponse.success("Unread count",
            notificationService.getUnreadCount(userId)));
    }

    /** Mark all notifications as read */
    @PostMapping("/mark-read")
    @Operation(summary = "Mark all notifications as read", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<Void>> markAllRead(HttpServletRequest req) {
        Long userId = Long.parseLong(req.getHeader("X-User-Id"));
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok(ApiResponse.success("All notifications marked as read", null));
    }
}
