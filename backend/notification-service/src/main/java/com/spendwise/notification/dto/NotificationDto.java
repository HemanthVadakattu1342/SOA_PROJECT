package com.spendwise.notification.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class NotificationDto {
    private Long id;
    private Long userId;
    private String title;
    private String message;
    private String type;
    private boolean read;
    private LocalDateTime createdAt;
}
