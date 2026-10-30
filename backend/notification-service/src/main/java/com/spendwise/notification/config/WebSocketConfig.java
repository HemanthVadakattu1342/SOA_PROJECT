package com.spendwise.notification.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * WebSocketConfig - configures STOMP over WebSocket for real-time notifications.
 *
 * How it works:
 * 1. Frontend connects to: ws://localhost:8086/ws (STOMP handshake)
 * 2. Frontend subscribes to: /topic/notifications/{userId}
 * 3. When an event happens (expense approved), the backend publishes to that topic
 * 4. The frontend receives the message INSTANTLY without polling
 *
 * SockJS is used as a fallback for browsers that don't support WebSocket.
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // "/topic" prefix = broadcasts (1-to-many)
        // "/queue"  prefix = direct (1-to-1)
        registry.enableSimpleBroker("/topic", "/queue");

        // "/app" prefix = client sends messages to server
        registry.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Frontend connects to: ws://localhost:8086/ws
        // withSockJS() provides fallback for older browsers
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }
}
